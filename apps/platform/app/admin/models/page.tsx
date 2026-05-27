'use client';

import { useState } from 'react';

type ModelConfig = {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic';
  model: string;
  enabled: boolean;
  ratePerToken: number;
};

const INITIAL_MODELS: ModelConfig[] = [
  {
    id: '1',
    name: 'GPT-4o',
    provider: 'openai',
    model: 'gpt-4o',
    enabled: true,
    ratePerToken: 0.005,
  },
  {
    id: '2',
    name: 'Claude Sonnet',
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    enabled: false,
    ratePerToken: 0.003,
  },
  {
    id: '3',
    name: 'GPT-4o Mini',
    provider: 'openai',
    model: 'gpt-4o-mini',
    enabled: true,
    ratePerToken: 0.0002,
  },
];

export default function AdminModelsPage() {
  const [models, setModels] = useState<ModelConfig[]>(INITIAL_MODELS);

  function toggleModel(id: string) {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">模型配置</h1>
      <p className="mt-2 text-sm text-neutral-500">管理可用的 AI 模型及费率设置</p>

      <div className="mt-6 max-w-3xl space-y-4">
        {models.map((m) => (
          <div key={m.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => toggleModel(m.id)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  m.enabled ? 'bg-green-500' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    m.enabled ? 'translate-x-5' : ''
                  }`}
                />
              </button>
              <div>
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-xs text-neutral-500">
                  {m.provider} / {m.model}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono">¥{m.ratePerToken.toFixed(4)}/1K tokens</div>
              <div className="text-xs text-neutral-400">{m.enabled ? '已启用' : '已禁用'}</div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-neutral-400">
        模型配置通过环境变量 AI_PROVIDER / AI_MODEL / AI_API_KEY 控制。
        此页面为管理界面预览，完整配置需修改 .env 文件。
      </p>
    </div>
  );
}
