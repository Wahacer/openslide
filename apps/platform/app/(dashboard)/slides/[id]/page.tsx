'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ChatPanel } from '../../../components/chat-panel';

type SlideDetail = {
  id: string;
  slug: string;
  title: string | null;
  source: string;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
  assets: Array<{ id: string; filename: string; url: string }>;
};

type ApplyStatus = 'idle' | 'loading' | 'success' | 'error';

type ConversationSummary = {
  id: string;
  title: string | null;
  updatedAt: string;
  _count: { messages: number };
};

export default function SlideDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [slide, setSlide] = useState<SlideDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyStatus, setApplyStatus] = useState<ApplyStatus>('idle');
  const [applyMessage, setApplyMessage] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);

  useEffect(() => {
    fetch(`/api/slides/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setSlide(data);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (!chatOpen) return;
    fetch(`/api/conversations?slideId=${id}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setConversations);
  }, [chatOpen, id]);

  async function handleApplyComments() {
    setApplyStatus('loading');
    setApplyMessage('');

    const res = await fetch(`/api/slides/${id}/apply-comments`, {
      method: 'POST',
    });
    const data = await res.json();

    if (res.ok) {
      setApplyStatus('success');
      setApplyMessage(`已应用 ${data.commentCount} 条评论修改`);
      const updated = await fetch(`/api/slides/${id}`);
      if (updated.ok) setSlide(await updated.json());
    } else {
      setApplyStatus('error');
      setApplyMessage(data.error ?? '应用失败');
    }
  }

  if (loading) {
    return <div className="py-12 text-center text-sm text-neutral-400">加载中…</div>;
  }
  if (!slide) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-neutral-500">未找到该演示</p>
        <button
          type="button"
          onClick={() => router.push('/slides')}
          className="mt-4 text-sm underline"
        >
          返回列表
        </button>
      </div>
    );
  }

  const sourceStr =
    typeof slide.source === 'string' ? slide.source : JSON.stringify(slide.source, null, 2);
  const commentCount = (sourceStr.match(/@slide-comment/g) || []).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{slide.title || slide.slug}</h1>
          <p className="mt-1 text-sm text-neutral-500">/{slide.slug}</p>
        </div>
        <button
          type="button"
          onClick={() => router.push('/slides')}
          className="rounded-md px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-100"
        >
          返回
        </button>
      </div>

      <div className="mt-6 flex gap-4">
        <button
          type="button"
          onClick={handleApplyComments}
          disabled={applyStatus === 'loading' || commentCount === 0}
          className="rounded-md bg-[oklch(0.2_0.012_60)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[oklch(0.28_0.012_60)] disabled:opacity-50"
        >
          {applyStatus === 'loading' ? '应用中…' : `应用所有评论 (${commentCount})`}
        </button>
        <button
          type="button"
          onClick={() => setChatOpen(!chatOpen)}
          className="rounded-md border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          {chatOpen ? '关闭对话' : 'AI 对话编辑'}
        </button>
      </div>

      {applyMessage && (
        <div
          className={`mt-4 rounded-md px-4 py-2 text-sm ${
            applyStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {applyMessage}
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-sm font-medium text-neutral-600">源码预览</h2>
        <pre className="mt-2 max-h-96 overflow-auto rounded-lg border bg-neutral-50 p-4 text-xs leading-relaxed">
          {sourceStr}
        </pre>
      </div>

      {slide.assets.length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-neutral-600">关联资产 ({slide.assets.length})</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {slide.assets.map((asset) => (
              <span key={asset.id} className="rounded-md bg-neutral-100 px-2 py-1 text-xs">
                {asset.filename}
              </span>
            ))}
          </div>
        </div>
      )}

      {chatOpen && (
        <div className="mt-6 rounded-lg border border-neutral-200">
          {conversations.length > 0 && (
            <div className="flex items-center gap-2 border-b border-neutral-100 px-4 py-2">
              <span className="text-xs text-neutral-500">历史对话:</span>
              <button
                type="button"
                onClick={() => setConversationId(undefined)}
                className={`rounded px-2 py-0.5 text-xs ${
                  !conversationId
                    ? 'bg-neutral-800 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                新对话
              </button>
              {conversations.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setConversationId(c.id)}
                  className={`max-w-32 truncate rounded px-2 py-0.5 text-xs ${
                    conversationId === c.id
                      ? 'bg-neutral-800 text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  {c.title || '未命名'}
                </button>
              ))}
            </div>
          )}
          <ChatPanel
            slideId={id}
            conversationId={conversationId}
            onConversationCreated={(newId) => {
              setConversationId(newId);
              fetch(`/api/conversations?slideId=${id}`)
                .then((res) => (res.ok ? res.json() : []))
                .then(setConversations);
            }}
          />
        </div>
      )}
    </div>
  );
}
