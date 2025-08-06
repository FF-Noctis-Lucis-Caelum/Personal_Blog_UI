/*WebSocket企业级健壮实现*/
import { Message } from "@arco-design/web-vue";
import {baseParamCollect, MonitoringData} from "@/api/data_mining/api";
import pako from 'pako'

type EventType = "connected" | "data" | "error" | "closed";
type EventCallback<T> = T extends "data"
    ? (data: MonitoringData[]) => void
    : T extends "error"
        ? (err: Error) => void
        : () => void;

export class MonitoringWebSocket {
    private ws: WebSocket | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private listeners: Record<EventType, Set<Function>> = {
        connected: new Set(),
        data: new Set(),
        error: new Set(),
        closed: new Set()
    };

    constructor(private url: string) {
        this.validateUrl(url);
    }

    // 事件订阅方法
    public on<T extends EventType>(event: T, callback: EventCallback<T>): void {
        this.listeners[event].add(callback as Function);
    }

    // 移除事件监听
    public off<T extends EventType>(event: T, callback: EventCallback<T>): void {
        this.listeners[event].delete(callback as Function);
    }

    // 初始化连接
    public connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) return;

        this.ws = new WebSocket(this.url);
        this.bindEvents();
    }

    // 发送监控参数
    public startMonitoring(params: baseParamCollect): void {
        this.safeSend({ ...params, command: "START" });
    }

    // 暂停监控
    public pause(): void {
        this.safeSend({ command: "PAUSE" });
    }

    // 安全断开连接
    public disconnect(): void {
        this.cleanup();
        this.emit("closed");
    }

    private validateUrl(url: string): void {
        if (!/^wss?:\/\//i.test(url)) {
            throw new Error("无效的WebSocket URL，必须使用ws://或wss://协议");
        }
    }

    private bindEvents(): void {
        if (!this.ws) return;

        this.ws.onopen = () => {
            this.reconnectAttempts = 0;
            this.startHeartbeat();
            this.emit("connected");
        };

        this.ws.onmessage = (event) => {
            this.handleMessage(event);
            this.resetHeartbeat();
        };

        this.ws.onerror = (error) => {
            this.emit("error", new Error(`WebSocket错误: ${error}`));
        };

        this.ws.onclose = (event) => {
            if (event.wasClean) {
                // 正常关闭，不需要重连
                this.emit("closed");
                return;
            }
            this.handleReconnect();
            this.emit("closed");
        };
    }

    private handleMessage(event: MessageEvent): void {
        try {
            if(this.ws) {
                this.ws.binaryType = 'arraybuffer'
            }
            const compressed = new Uint8Array(event.data);
            const decompressed = pako.inflate(compressed, { to: 'string' });
            const parsedData = JSON.parse(decompressed);
            this.emit("data", parsedData);
            if (this.validateData(parsedData)) {

            } else {
                throw new Error("接收数据格式验证失败");
            }
        } catch (err) {
            this.emit("error", err instanceof Error ? err : new Error("数据解析失败"));
        }
    }

    // 数据格式验证
    private validateData(data: any): data is MonitoringData[] {
        return (
            Array.isArray(data) &&
            data.every((item) => {
                const requiredFields = [
                    "id",
                    "analysisDate",
                    "monitorTime",
                    "createTime",
                    "potentialData",
                ];
                return requiredFields.every((field) => field in item);
            })
        );
    }

    // 安全发送方法
    private safeSend(data: any): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        } else {
            this.emit("error", new Error("尝试发送数据时连接未就绪"));
        }
    }

    // 心跳机制
    private startHeartbeat(): void {
        this.heartbeatTimer = setInterval(() => {
            this.safeSend({ type: "HEARTBEAT" });
        }, 30000);
    }

    private resetHeartbeat(): void {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.startHeartbeat();
        }
    }

    // 重连处理
    private handleReconnect(): void {
        this.cleanup();

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.emit("error", new Error("已达最大重连次数，停止连接尝试"));
            return;
        }

        const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectAttempts++;
            Message.info(`正在尝试重新连接（${this.reconnectAttempts}/${this.maxReconnectAttempts}）`);
            this.connect();
        }, delay);
    }

    // 资源清理
    private cleanup(): void {
        if (this.ws) {
            this.ws.onopen = null;
            this.ws.onmessage = null;
            this.ws.onerror = null;
            this.ws.onclose = null;

            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.close();
            }
            this.ws = null;
        }

        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    // 事件触发
    private emit<T extends EventType>(
        event: T,
        ...args: T extends "error" ? [Error] : T extends "data" ? [MonitoringData[]] : []
    ): void {
        this.listeners[event].forEach((callback) => {
            try {
                (callback as Function)(...args);
            } catch (err) {
                console.error(`事件处理错误（${event}）:`, err);
            }
        });
    }
}
