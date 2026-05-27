'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { EditOp } from '@/lib/edit-ops/types';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

type EditOpsEvent = {
  ops: EditOp[];
  description: string;
  source: string;
};

type QuickAction = {
  label: string;
  prompt: string;
  icon: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: '新建幻灯片',
    prompt: '帮我新建一页幻灯片，使用简洁现代的布局，包含标题和副标题',
    icon: '＋',
  },
  { label: '应用修改', prompt: '请根据我之前的描述，应用修改到当前幻灯片', icon: '✓' },
  { label: '修改配色', prompt: '请修改当前幻灯片的配色方案，使其更加协调美观', icon: '◐' },
  { label: '添加图片', prompt: '请在当前幻灯片中添加一张合适的配图', icon: '▣' },
  { label: '调整布局', prompt: '请优化当前幻灯片的布局，使内容更加清晰易读', icon: '⊞' },
  { label: '精简内容', prompt: '请精简当前幻灯片的文字内容，保留核心信息', icon: '✂' },
];

type ChatPanelProps = {
  slideId?: string;
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
  onEditOpsApplied?: (event: EditOpsEvent) => void;
};

export function ChatPanel({
  slideId,
  conversationId,
  onConversationCreated,
  onEditOpsApplied,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [convId, setConvId] = useState(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = useCallback(
    async (overrideText?: string) => {
      const text = (overrideText ?? input).trim();
      if (!text || streaming) return;

      const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', content: text };
      setMessages((prev) => [...prev, userMsg]);
      if (!overrideText) setInput('');
      setStreaming(true);

      const assistantId = `a-${Date.now()}`;
      setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, conversationId: convId, slideId }),
        });

        if (!res.ok) {
          const err = await res.json();
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: `错误: ${err.error}` } : m)),
          );
          setStreaming(false);
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          setStreaming(false);
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(line.slice(6));
              if (event.type === 'text') {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: m.content + event.content } : m,
                  ),
                );
              } else if (event.type === 'editops') {
                onEditOpsApplied?.(event);
              } else if (event.type === 'done') {
                if (event.conversationId && !convId) {
                  setConvId(event.conversationId);
                  onConversationCreated?.(event.conversationId);
                }
              }
            } catch {}
          }
        }
      } catch (e) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: `错误: ${(e as Error).message}` } : m,
          ),
        );
      }
      setStreaming(false);
    },
    [input, streaming, convId, slideId, onConversationCreated, onEditOpsApplied],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-neutral-400">开始对话来创建或修改你的演示文稿</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => sendMessage(action.prompt)}
                  disabled={streaming}
                  className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-600 transition-colors hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-50"
                >
                  {action.icon} {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-[oklch(0.2_0.012_60)] text-white'
                  : 'bg-neutral-100 text-neutral-800'
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans">{msg.content || '…'}</pre>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-3">
        {messages.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => sendMessage(action.prompt)}
                disabled={streaming}
                className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-700 disabled:opacity-50"
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="输入消息… (Shift+Enter 换行)"
            rows={1}
            className="flex-1 resize-none rounded-md border px-3 py-2 text-sm outline-none focus:border-[oklch(0.555_0.185_28)] focus:ring-1 focus:ring-[oklch(0.555_0.185_28/0.3)]"
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={streaming || !input.trim()}
            className="rounded-md bg-[oklch(0.2_0.012_60)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  );
}
