'use client';

import { useState } from 'react';

type Plan = {
  id: string;
  name: string;
  tokenQuota: number;
  imageGenQuota: number;
  storageGB: number;
  priceMonthly: number;
};

const PLANS: Plan[] = [
  {
    id: 'free',
    name: '免费版',
    tokenQuota: 10000,
    imageGenQuota: 5,
    storageGB: 1,
    priceMonthly: 0,
  },
  {
    id: 'pro',
    name: '专业版',
    tokenQuota: 500000,
    imageGenQuota: 100,
    storageGB: 10,
    priceMonthly: 49,
  },
  {
    id: 'team',
    name: '团队版',
    tokenQuota: 2000000,
    imageGenQuota: 500,
    storageGB: 50,
    priceMonthly: 199,
  },
];

export default function AdminBillingPage() {
  const [plans] = useState<Plan[]>(PLANS);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">计费设置</h1>
      <p className="mt-2 text-sm text-neutral-500">管理套餐方案和定价规则</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="rounded-lg border p-5">
            <div className="text-lg font-semibold">{plan.name}</div>
            <div className="mt-1 text-2xl font-bold">
              {plan.priceMonthly === 0 ? '免费' : `¥${plan.priceMonthly}/月`}
            </div>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li>Token: {plan.tokenQuota.toLocaleString()}</li>
              <li>图片生成: {plan.imageGenQuota} 次/月</li>
              <li>存储: {plan.storageGB} GB</li>
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-8 text-xs text-neutral-400">
        套餐配置为预览模式。完整的支付集成将在后续版本中实现。
      </p>
    </div>
  );
}
