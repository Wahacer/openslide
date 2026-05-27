'use client';

import { useState } from 'react';

type SettingField = {
  key: string;
  label: string;
  description: string;
  type: 'toggle' | 'number' | 'text';
  value: string | boolean | number;
};

const DEFAULT_SETTINGS: SettingField[] = [
  {
    key: 'REGISTRATION_ENABLED',
    label: '开放注册',
    description: '允许新用户通过注册页面创建账号',
    type: 'toggle',
    value: true,
  },
  {
    key: 'DEFAULT_TOKEN_QUOTA',
    label: '默认 Token 额度',
    description: '新用户注册时自动分配的 Token 额度（-1 为无限）',
    type: 'number',
    value: 100000,
  },
  {
    key: 'DEFAULT_IMAGE_GEN_QUOTA',
    label: '默认图片生成额度',
    description: '新用户注册时自动分配的图片生成次数',
    type: 'number',
    value: 50,
  },
  {
    key: 'MAX_UPLOAD_SIZE_MB',
    label: '最大上传文件大小 (MB)',
    description: '单个文件上传的最大体积限制',
    type: 'number',
    value: 10,
  },
  {
    key: 'MAX_SLIDES_PER_USER',
    label: '每用户最大演示数',
    description: '每个用户可创建的最大演示数量（-1 为无限）',
    type: 'number',
    value: -1,
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingField[]>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);

  function updateSetting(key: string, value: string | boolean | number) {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)));
    setSaved(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">系统设置</h1>
      <p className="mt-2 text-sm text-neutral-500">配置系统级参数。修改后需重启服务生效。</p>

      <div className="mt-6 max-w-2xl space-y-6">
        {settings.map((field) => (
          <div key={field.key} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">{field.label}</div>
                <div className="mt-0.5 text-xs text-neutral-500">{field.description}</div>
              </div>
              {field.type === 'toggle' ? (
                <button
                  type="button"
                  onClick={() => updateSetting(field.key, !field.value)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    field.value ? 'bg-green-500' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      field.value ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={String(field.value)}
                  onChange={(e) =>
                    updateSetting(
                      field.key,
                      field.type === 'number' ? Number(e.target.value) : e.target.value,
                    )
                  }
                  className="w-32 rounded-md border px-2 py-1 text-right text-sm"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={() => setSaved(true)}
          className="rounded-md bg-[oklch(0.2_0.012_60)] px-4 py-2 text-sm font-medium text-white hover:bg-[oklch(0.28_0.012_60)]"
        >
          保存设置
        </button>
        {saved && <span className="ml-3 text-sm text-green-600">已保存（重启后生效）</span>}
      </div>
    </div>
  );
}
