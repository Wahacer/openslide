'use client';

import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Suspense, useState } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      setError('邮箱或密码错误');
      setLoading(false);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] flex-col justify-between bg-[oklch(0.155_0.005_70)] p-10 text-white">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-[oklch(0.555_0.185_28)]">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <span className="text-[15px] font-semibold tracking-tight">open-slide</span>
          </div>
        </div>

        <div className="space-y-5">
          <blockquote className="text-[22px] font-medium leading-snug tracking-tight text-white/90">
            用对话创建演示文稿，
            <br />让 AI 处理设计细节。
          </blockquote>
          <p className="text-[13px] leading-relaxed text-white/50">
            基于 React 组件的 1920×1080 画布，支持多格式导出、资产管理和实时协作编辑。
          </p>
        </div>

        <p className="text-[11px] text-white/30">open-slide platform</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-[360px] space-y-8">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-[oklch(0.2_0.012_60)]">
              登录
            </h1>
            <p className="mt-1.5 text-[13px] text-[oklch(0.485_0.012_60)]">
              输入你的账号信息以继续
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[12.5px] text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="text-[12px] font-medium text-[oklch(0.35_0.012_60)]"
              >
                邮箱
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-9 w-full rounded-[6px] border border-[oklch(0.895_0.008_70)] bg-white px-3 text-[13px] text-[oklch(0.2_0.012_60)] outline-none placeholder:text-[oklch(0.7_0.008_70)] focus:border-[oklch(0.555_0.185_28)] focus:ring-2 focus:ring-[oklch(0.555_0.185_28/0.12)]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="login-password"
                className="text-[12px] font-medium text-[oklch(0.35_0.012_60)]"
              >
                密码
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 w-full rounded-[6px] border border-[oklch(0.895_0.008_70)] bg-white px-3 text-[13px] text-[oklch(0.2_0.012_60)] outline-none placeholder:text-[oklch(0.7_0.008_70)] focus:border-[oklch(0.555_0.185_28)] focus:ring-2 focus:ring-[oklch(0.555_0.185_28/0.12)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-9 w-full rounded-[6px] bg-[oklch(0.2_0.012_60)] text-[13px] font-medium text-white transition-colors hover:bg-[oklch(0.28_0.012_60)] disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <p className="text-center text-[12.5px] text-[oklch(0.485_0.012_60)]">
            没有账号？{' '}
            <a
              href="/register"
              className="font-medium text-[oklch(0.2_0.012_60)] underline underline-offset-2 hover:text-[oklch(0.555_0.185_28)]"
            >
              注册
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
