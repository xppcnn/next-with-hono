'use client'

import * as React from 'react';
import { DefaultChatTransport, type ToolUIPart, type UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';

import {
    PromptInput,
    PromptInputBody,
    PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';

import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from '@/components/ai-elements/conversation';

import {
    Message,
    MessageContent,
    MessageResponse
} from '@/components/ai-elements/message';

import {
    Tool,
    ToolHeader,
    ToolContent,
    ToolInput,
    ToolOutput,
} from '@/components/ai-elements/tool';

export default function App() {
    const [input, setInput] = React.useState<string>('');
    // 使用固定的 threadId 来保持会话连续性
    // Memory 会根据这个 threadId 自动管理历史消息
    const [threadId] = React.useState<string>(() => {
        // 从 localStorage 获取或生成新的 threadId
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('chat-thread-id');
            if (stored) return stored;
            const newId = `thread-${Date.now()}`;
            localStorage.setItem('chat-thread-id', newId);
            return newId;
        }
        return `thread-${Date.now()}`;
    });

    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/agents/stream',
            // 只传递 threadId，不传递历史消息
            // Memory 会根据 threadId 自动从存储中获取历史消息
            body: {
                threadId,
            },
            // 拦截请求，只发送最后一条用户消息（当前输入的消息）
            prepareSendMessagesRequest: ({ messages: allMessages, body }) => {
                // 只保留最后一条用户消息（当前输入的新消息）
                const lastUserMessage = allMessages
                    ?.slice()
                    .reverse()
                    .find((msg: UIMessage) => msg.role === 'user');

                // 只发送最后一条用户消息和 threadId
                console.log("🚀 ~ App ~ messages:", allMessages)
                return {
                    body: {
                        threadId: body?.threadId,
                        messages: lastUserMessage 
                            ? [lastUserMessage] 
                            : [],
                    },
                };
            },
        }),
    });


    const handleSubmit = async () => {
        if (!input.trim()) return;

        sendMessage({ text: input });
        setInput('');
    };

    return (
        <div className="max-w-4xl mx-auto p-6 relative size-full h-screen">
            <div className="flex flex-col h-full">
                <Conversation className="h-full">
                    <ConversationContent>
                        {messages.map((message) => (
                            <div key={message.id}>
                                {message.parts?.map((part, i) => {
                                    if (part.type === 'text') {
                                        return (
                                            <Message
                                                key={`${message.id}-${i}`}
                                                from={message.role}>
                                                <MessageContent>
                                                    <MessageResponse>{part.text}</MessageResponse>
                                                </MessageContent>
                                            </Message>
                                        );
                                    }

                                    if (part.type?.startsWith('tool-')) {
                                        return (
                                            <Tool key={`${message.id}-${i}`}>
                                                <ToolHeader
                                                    type={(part as ToolUIPart).type}
                                                    state={(part as ToolUIPart).state || 'output-available'}
                                                    className="cursor-pointer"
                                                />
                                                <ToolContent>
                                                    <ToolInput input={(part as ToolUIPart).input || {}} />
                                                    <ToolOutput
                                                        output={(part as ToolUIPart).output}
                                                        errorText={(part as ToolUIPart).errorText}
                                                    />
                                                </ToolContent>
                                            </Tool>
                                        );
                                    }

                                    return null;
                                })}
                            </div>
                        ))}
                        <ConversationScrollButton />
                    </ConversationContent>
                </Conversation>
                <PromptInput onSubmit={handleSubmit} className="mt-20">
                    <PromptInputBody>
                        <PromptInputTextarea
                            onChange={(e) => setInput(e.target.value)}
                            className="md:leading-10"
                            value={input}
                            placeholder="Ask about the weather..."
                            disabled={status !== 'ready'}
                        />
                    </PromptInputBody>
                </PromptInput>
            </div>
        </div>
    );
}