// utils/ollama.ts
import { fetchEventSource } from '@microsoft/fetch-event-source'

export interface Message {
    role: 'user' | 'assistant'
    content: string
}

export const streamChat = async (
    messages: Message[],
    onMessage: (content: string) => void
) => {
    await fetchEventSource('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'llama3',  // 替换您的模型名称
            messages,
            stream: true
        }),
        async onopen() {
            // 连接成功处理
        },
        onmessage(ev) {
            try {
                const chunk = JSON.parse(ev.data)
                onMessage(chunk.message?.content || '')
            } catch (e) {
                console.error('解析错误', e)
            }
        },
        onclose() {
            // 连接关闭处理
        },
        onerror(err) {
            throw err
        }
    })
}
