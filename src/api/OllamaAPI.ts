type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

interface BaseRequest {
    model?: string;
    options?: {
        temperature?: number;
        top_p?: number;
        max_tokens?: number;
        mirostat?: number;
        mirostat_tau?: number;
        mirostat_eta?: number;
        repeat_penalty?: number;
        presence_penalty?: number;
        frequency_penalty?: number;
        stop?: string[];
        prompt_template?: string;
    };
    system?: string;
    context?: number[];
}

interface GenerateRequest extends BaseRequest {
    prompt: string;
    stream?: boolean;
}

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatRequest extends BaseRequest {
    messages: ChatMessage[];
    stream?: boolean;
}

interface BaseResponse {
    model: string;
    created_at: string;
    context: number[];
}

interface GenerateResponse extends BaseResponse {
    response: string;
    done: boolean;
}

interface ChatResponse extends BaseResponse {
    message: ChatMessage;
    done: boolean;
}

type StreamChunk<T extends BaseResponse> = Omit<T, 'created_at' | 'model'> & {
    done?: boolean;
};

type StreamCallback<T extends StreamChunk<any>> = (chunk: T) => void;

export class OllamaClient {
    baseURL: string;
    defaultModel: string;
    defaultOptions: GenerateRequest['options'];

    constructor(config: {
        model: string;
        baseURL?: string;
        options?: GenerateRequest['options'];
    }) {
        if (!config.model) throw new Error('必须提供默认模型名称');
        this.baseURL = config.baseURL || 'http://localhost:11434';
        this.defaultModel = config.model;
        this.defaultOptions = {
            temperature: 0.8,
            top_p: 0.9,
            ...config.options
        };
    }

    private async request<T>(
        endpoint: 'generate' | 'chat',
        body: GenerateRequest | ChatRequest,
        stream = false
    ): Promise<any> {
        const url = `${this.baseURL}/api/${endpoint}`;
        const requestBody = {
            ...body,
            model: body.model || this.defaultModel,
            options: { ...this.defaultOptions, ...body.options },
            stream
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            throw new Error(`API请求失败 (${response.status}): ${errorBody.error || response.statusText}`);
        }

        return stream ? response.body : response.json();
    }

    async generate(
        prompt: string,
        params: Optional<GenerateRequest, 'prompt' | 'model'> = {}
    ): Promise<GenerateResponse> {
        return this.request<GenerateResponse>('generate', { prompt, ...params });
    }

    async streamGenerate(
        prompt: string,
        onChunk: StreamCallback<StreamChunk<GenerateResponse>>,
        params: Optional<GenerateRequest, 'prompt' | 'model' | 'stream'> = {}
    ): Promise<void> {
        const stream = await this.request('generate', { prompt, ...params, stream: true }, true) as ReadableStream;
        await this.processStream(stream, onChunk);
    }

    async chat(
        messages: ChatMessage[],
        params: Optional<ChatRequest, 'messages' | 'model'> = {}
    ): Promise<ChatResponse> {
        return this.request<ChatResponse>('chat', { messages, ...params });
    }

    async streamChat(
        messages: ChatMessage[],
        onChunk: StreamCallback<StreamChunk<ChatResponse>>,
        params: Optional<ChatRequest, 'messages' | 'model' | 'stream'> = {}
    ): Promise<void> {
        const stream = await this.request('chat', { messages, ...params, stream: true }, true) as ReadableStream;
        await this.processStream(stream, onChunk);
    }

    async listModels(): Promise<string[]> {
        const response = await fetch(`${this.baseURL}/api/tags`);
        if (!response.ok) throw new Error('获取模型列表失败');
        const data = await response.json();
        return data.models.map((m: { name: string }) => m.name);
    }

    private async processStream<T>(
        stream: ReadableStream,
        onChunk: (chunk: T) => void
    ): Promise<void> {
        const reader = stream.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line) {
                        try {
                            onChunk(JSON.parse(line) as T);
                        } catch (e) {
                            console.warn('流式数据解析失败:', line);
                        }
                    }
                }
            }

            // 处理最后剩余的buffer
            if (buffer) {
                try {
                    onChunk(JSON.parse(buffer) as T);
                } catch (e) {
                    console.warn('最终数据解析失败:', buffer);
                }
            }
        } finally {
            reader.releaseLock();
        }
    }
}
