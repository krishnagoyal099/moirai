import type { Message } from '../store/useChatStore';

interface ChatCompletionResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

export class GroqService {
    private apiKey: string = '';
    private model = 'llama-3.3-70b-versatile'; // Use the versatile model

    constructor() {
        // We will inject the key dynamically from the store
    }

    setKey(key: string) {
        this.apiKey = key;
    }

    private async callGroq(messages: Array<{ role: string; content: string }>): Promise<string> {
        if (!this.apiKey) throw new Error('No API Key provided');

        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1024,
                }),
            });

            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

            const data = await response.json() as ChatCompletionResponse;
            return data.choices[0]?.message?.content || 'No response generated.';
        } catch (error) {
            console.error('Groq API Error:', error);
            throw error;
        }
    }

    async chat(history: Message[], contextData?: string): Promise<string> {
        // System prompt
        const systemPrompt = {
            role: 'system',
            content: `You are Moirai, the Oracle Interface. 
      You help the user understand their digital life.
      
      DATA CONTEXT (Read this carefully to answer):
      ${contextData || "No context data available."}

      Be concise, editorial, and helpful. Use markdown formatting.`
        };

        const messages = [
            systemPrompt,
            ...history.map(m => ({ role: m.role, content: m.content }))
        ];

        return this.callGroq(messages);
    }

    async generateTitle(history: Message[]): Promise<string> {
        const prompt = "Summarize the following chat conversation into a short 3-5 word title. Only return the title, nothing else.";
        const messages = [
            { role: 'system', content: prompt },
            ...history.slice(0, 3).map(m => ({ role: m.role, content: m.content }))
        ];

        try {
            return await this.callGroq(messages).then(t => t.replace(/"/g, '').trim());
        } catch (e) {
            return "New Inquiry";
        }
    }
}

export const groqService = new GroqService();