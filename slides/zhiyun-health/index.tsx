import type { DesignSystem, Page, SlideMeta } from '@open-slide/core';

export const design: DesignSystem = {
  palette: { bg: '#ffffff', text: '#0a0a0a', accent: '#e85d2c' },
  fonts: {
    display: 'system-ui, -apple-system, "Helvetica Neue", sans-serif',
    body: 'system-ui, -apple-system, "Helvetica Neue", sans-serif',
  },
  typeScale: { hero: 180, body: 36 },
  radius: 0,
};

const accent = '#e85d2c';
const black = '#0a0a0a';
const gray = '#8c8c8c';
const lightGray = '#f5f5f5';
const midGray = '#d4d4d4';

const fill: React.CSSProperties = {
  width: '100%', height: '100%',
  fontFamily: 'var(--osd-font-body)',
  background: 'var(--osd-bg)', color: 'var(--osd-text)',
} as const;

const PageNum = ({ n }: { n: number }) => (
  <span style={{
    position: 'absolute', bottom: 56, right: 120,
    fontSize: 22, color: midGray, fontWeight: 500,
  }}>{String(n).padStart(2, '0')} / 14</span>
);

const AccentDot = ({ size = 12 }: { size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: accent, flexShrink: 0,
  }} />
);

const OrangeRule = ({ width = 64 }: { width?: number }) => (
  <div style={{ width, height: 3, background: accent, marginBottom: 40 }} />
);

const BigStat = ({ value, unit, label }: { value: string; unit?: string; label: string }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
      <span style={{ fontSize: 96, fontWeight: 900, lineHeight: 1, color: black }}>{value}</span>
      {unit && <span style={{ fontSize: 36, fontWeight: 600, color: gray }}>{unit}</span>}
    </div>
    <span style={{ fontSize: 26, color: gray, fontWeight: 500 }}>{label}</span>
  </div>
);

// ── SVG Decorations ──────────────────────────────────────────

const OrangeCircle = ({ size = 320, opacity = 0.08 }: { size?: number; opacity?: number }) => (
  <svg width={size} height={size} style={{ position: 'absolute' }}>
    <circle cx={size / 2} cy={size / 2} r={size / 2 - 2}
      fill="none" stroke={accent} strokeWidth={2}
      opacity={opacity} />
  </svg>
);

const OrangeArc = ({ size = 200, rotation = 0 }: { size?: number; rotation?: number }) => (
  <svg width={size} height={size} style={{ position: 'absolute', transform: `rotate(${rotation}deg)` }}>
    <path d={`M ${size / 2} ${size} A ${size / 2} ${size / 2} 0 0 1 ${size / 2} 0`}
      fill="none" stroke={accent} strokeWidth={3} opacity={0.12} />
  </svg>
);

// ── Page 1: Cover ───────────────────────────────────────────

const Cover: Page = () => (
  <div style={{ ...fill, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '0 160px' }}>
    <OrangeCircle size={680} opacity={0.04} />
    <OrangeArc size={520} rotation={-30} />
    <div style={{ position: 'absolute', top: 80, right: 120 }}>
      <OrangeArc size={180} rotation={90} />
    </div>
    <div style={{ zIndex: 1 }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent, letterSpacing: '0.15em', marginBottom: 28, textTransform: 'uppercase' }}>
        Zhiyun Health · 9955.HK
      </div>
      <h1 style={{
        fontFamily: 'var(--osd-font-display)', fontSize: 'var(--osd-size-hero)',
        fontWeight: 900, lineHeight: 1, margin: 0, letterSpacing: '-0.03em',
      }}>
        商业模式分析
      </h1>
      <OrangeRule width={80} />
      <p style={{ fontSize: 38, color: gray, margin: 0, lineHeight: 1.45, maxWidth: 900 }}>
        从规模增长到高质量增长的转型之路
      </p>
      <p style={{ fontSize: 22, color: midGray, margin: 0, marginTop: 48, letterSpacing: '0.06em' }}>2026 年 5 月</p>
    </div>
    <PageNum n={1} />
  </div>
);

// ── Page 2: 定位 ────────────────────────────────────────────

const Positioning: Page = () => (
  <div style={{ ...fill, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 160px' }}>
    <div>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent, letterSpacing: '0.12em', marginBottom: 24 }}>
        公司定位
      </div>
      <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 72, fontWeight: 900, lineHeight: 1.1, margin: 0, maxWidth: 1300 }}>
        「SaaS × 慢病管理」数字医疗平台
      </h2>
      <OrangeRule />
      <p style={{ fontSize: 'var(--osd-size-body)', lineHeight: 1.6, color: gray, margin: 0, maxWidth: 1100, letterSpacing: '-0.7px' }}>
        医院 SaaS + 药店 SaaS + 互联网医院驱动，向 B 端收费而非 C 端诊疗费
      </p>
      <div style={{ display: 'flex', gap: 80, marginTop: 56 }}>
        <BigStat value="18,017" unit="家" label="接入医院" />
        <BigStat value="275,613" unit="家" label="部署药店" />
        <BigStat value="6,140" unit="万人" label="注册用户" />
      </div>
    </div>
    <div style={{ position: 'absolute', bottom: -80, right: 80 }}>
      <OrangeCircle size={360} opacity={0.05} />
    </div>
    <PageNum n={2} />
  </div>
);

// ── Page 3: 闭环 ────────────────────────────────────────────

const FlowStep = ({ num, title, desc }: { num: string; title: string; desc: string }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
    <div style={{
      width: 80, height: 80, borderRadius: '50%',
      border: `3px solid ${accent}`, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: 32, fontWeight: 900, color: accent,
    }}>{num}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color: black, textAlign: 'center' }}>{title}</div>
    <div style={{ fontSize: 22, color: gray, textAlign: 'center', lineHeight: 1.45, maxWidth: 260 }}>{desc}</div>
  </div>
);

const FlowArrow = () => (
  <div style={{ display: 'flex', alignItems: 'center', paddingBottom: 80 }}>
    <svg width="48" height="16" viewBox="0 0 48 16">
      <line x1="0" y1="8" x2="44" y2="8" stroke={midGray} strokeWidth="2" />
      <polyline points="38,2 44,8 38,14" fill="none" stroke={midGray} strokeWidth="2" />
    </svg>
  </div>
);

const ClosedLoop: Page = () => (
  <div style={{ ...fill, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 120px' }}>
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent, letterSpacing: '0.12em', marginBottom: 20, textAlign: 'center' }}>
        商业模式闭环
      </div>
      <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 64, fontWeight: 900, margin: 0, textAlign: 'center', marginBottom: 60 }}>
        诊 · 治 · 药 · 管
      </h2>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
        <FlowStep num="01" title="院内 SaaS" desc="HIS/EMR 覆盖门诊、住院、慢病全流程数字化" />
        <FlowArrow />
        <FlowStep num="02" title="互联网医院" desc="线上复诊、处方流转、慢病随访" />
        <FlowArrow />
        <FlowStep num="03" title="药店 SaaS" desc="处方审核、医保结算、药品供应链" />
        <FlowArrow />
        <FlowStep num="04" title="慢病管理" desc="长期随访、用药管理、数据资产沉淀" />
      </div>
    </div>
    <div style={{ position: 'absolute', top: 60, left: 80 }}>
      <OrangeCircle size={200} opacity={0.05} />
    </div>
    <PageNum n={3} />
  </div>
);

// ── Page 4: Section Divider — 三大业务板块 ───────────────────

const DividerBiz: Page = () => (
  <div style={{ ...fill, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 28 }}>
    <OrangeCircle size={500} opacity={0.04} />
    <div style={{ fontSize: 160, fontWeight: 900, color: accent, opacity: 0.1, lineHeight: 1 }}>01</div>
    <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 80, fontWeight: 900, margin: 0 }}>三大业务板块</h2>
    <p style={{ fontSize: 32, color: gray, margin: 0 }}>
      医院 SaaS · 药店 SaaS · 慢病管理
    </p>
  </div>
);

// ── Page 5: 数据仪表盘 ──────────────────────────────────────

const Dashboard: Page = () => (
  <div style={{ ...fill, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 120px' }}>
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent, letterSpacing: '0.12em', marginBottom: 28 }}>
        平台规模
      </div>
      <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 56, fontWeight: 900, margin: 0, marginBottom: 56 }}>
        AI 驱动的慢病管理基础设施
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
        {[
          { v: '18,017', u: '家', l: '接入医院' },
          { v: '275,613', u: '家', l: '部署药店' },
          { v: '6,140', u: '万', l: '注册用户' },
          { v: '3.716', u: '亿张', l: '年在线处方' },
        ].map((d, i) => (
          <div key={i} style={{ background: lightGray, padding: '36px 32px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, color: black }}>{d.v}</span>
              {d.u && <span style={{ fontSize: 24, fontWeight: 600, color: gray }}>{d.u}</span>}
            </div>
            <span style={{ fontSize: 22, color: gray }}>{d.l}</span>
          </div>
        ))}
      </div>
    </div>
    <PageNum n={5} />
  </div>
);

// ── Page 6: 医院 SaaS ───────────────────────────────────────

const HospitalSaaS: Page = () => (
  <div style={{ ...fill, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 160px' }}>
    <OrangeArc size={300} rotation={-45} />
    <div style={{ position: 'absolute', top: 100, right: 160 }}>
      <OrangeCircle size={240} opacity={0.06} />
    </div>
    <div style={{ zIndex: 1 }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent, letterSpacing: '0.12em', marginBottom: 20 }}>
        业务板块 1
      </div>
      <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 64, fontWeight: 900, margin: 0 }}>医院 AI 平台</h2>
      <OrangeRule />
      <div style={{ display: 'flex', gap: 120, alignItems: 'flex-start' }}>
        <BigStat value="18,017" unit="家" label="接入医院" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AccentDot size={10} />
            <span style={{ fontSize: 28, color: black }}>合作药企 51 家</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AccentDot size={10} />
            <span style={{ fontSize: 28, color: black }}>合作 SKU 57 个</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AccentDot size={10} />
            <span style={{ fontSize: 28, color: gray }}>SaaS 订阅 + 药企营销 + 真实世界研究</span>
          </div>
        </div>
      </div>
    </div>
    <PageNum n={6} />
  </div>
);

// ── Page 7: 药店 SaaS ───────────────────────────────────────

const PharmacySaaS: Page = () => (
  <div style={{ ...fill, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 160px' }}>
    <div style={{ zIndex: 1 }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent, letterSpacing: '0.12em', marginBottom: 20 }}>
        业务板块 2
      </div>
      <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 64, fontWeight: 900, margin: 0 }}>药店 AI 平台</h2>
      <OrangeRule />
      <div style={{ display: 'flex', gap: 120, alignItems: 'flex-start' }}>
        <BigStat value="275,613" unit="家" label="部署药店" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AccentDot size={10} />
            <span style={{ fontSize: 28, color: black }}>付费药店 164,279 家</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AccentDot size={10} />
            <span style={{ fontSize: 28, color: gray }}>进销存 + 处方审核 + 医保结算一体化</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AccentDot size={10} />
            <span style={{ fontSize: 28, color: gray }}>SaaS 订阅 + 处方佣金 + 供应链服务</span>
          </div>
        </div>
      </div>
    </div>
    <div style={{ position: 'absolute', bottom: -60, right: 120 }}>
      <OrangeCircle size={280} opacity={0.05} />
    </div>
    <PageNum n={7} />
  </div>
);

// ── Page 8: 慢病管理 ────────────────────────────────────────

const ChronicCare: Page = () => (
  <div style={{ ...fill, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 160px' }}>
    <OrangeArc size={260} rotation={160} />
    <div style={{ zIndex: 1 }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent, letterSpacing: '0.12em', marginBottom: 20 }}>
        业务板块 3
      </div>
      <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 64, fontWeight: 900, margin: 0 }}>慢病管理</h2>
      <OrangeRule />
      <div style={{ display: 'flex', gap: 100, alignItems: 'flex-start' }}>
        <BigStat value="6,140" unit="万人" label="注册用户" />
        <BigStat value="11.21" unit="万人" label="注册医生" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AccentDot size={10} />
            <span style={{ fontSize: 28, color: gray }}>糖尿病 / 高血压长期随访</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AccentDot size={10} />
            <span style={{ fontSize: 28, color: gray }}>药企患教 + 真实世界研究付费</span>
          </div>
        </div>
      </div>
    </div>
    <PageNum n={8} />
  </div>
);

// ── Page 9: 盈利模式 ────────────────────────────────────────

const RevenueCard = ({ n, title, body }: { n: string; title: string; body: string }) => (
  <div style={{ flex: 1, borderTop: `3px solid ${accent}`, paddingTop: 28 }}>
    <div style={{ fontSize: 48, fontWeight: 900, color: accent, lineHeight: 1, marginBottom: 16 }}>{n}</div>
    <div style={{ fontSize: 28, fontWeight: 700, color: black, marginBottom: 12 }}>{title}</div>
    <div style={{ fontSize: 22, lineHeight: 1.55, color: gray }}>{body}</div>
  </div>
);

const RevenueModel: Page = () => (
  <div style={{ ...fill, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 120px' }}>
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent, letterSpacing: '0.12em', marginBottom: 20 }}>
        盈利模式
      </div>
      <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 56, fontWeight: 900, margin: 0, marginBottom: 48 }}>
        钱从哪来？
      </h2>
      <div style={{ display: 'flex', gap: 40 }}>
        <RevenueCard n="01" title="SaaS 订阅" body="医院/药店按年付费，稳定的 ARR" />
        <RevenueCard n="02" title="药品供应链" body="处方流转、药品差价、配送服务费" />
        <RevenueCard n="03" title="药企服务" body="精准营销、患教、真实世界研究" />
        <RevenueCard n="04" title="增值服务" body="患者管理包、设备耗材对接" />
      </div>
      <div style={{ marginTop: 44, paddingTop: 28, borderTop: `1px solid ${midGray}` }}>
        <p style={{ fontSize: 30, fontWeight: 700, color: black, margin: 0 }}>
          SaaS 获客 → 交易变现 → <span style={{ color: accent }}>药企服务增厚利润</span>
        </p>
      </div>
    </div>
    <PageNum n={9} />
  </div>
);

// ── Page 10: 收入结构 (Bar Chart) ───────────────────────────

const BarChart = () => (
  <div style={{ display: 'flex', gap: 64, alignItems: 'flex-end', height: 360 }}>
    {[
      { label: '总收入', value: 16.23, max: 16.23, unit: '亿' },
      { label: '院内', value: 11.89, max: 16.23, unit: '亿', sub: '占比 73%' },
      { label: '院外', value: 4.34, max: 16.23, unit: '亿', sub: '占比 27%' },
    ].map((bar, i) => (
      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, height: '100%' }}>
        <div style={{
          width: 140, height: `${(bar.value / bar.max) * 100}%`,
          background: i === 0 ? lightGray : i === 1 ? accent : midGray,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          paddingTop: 12,
        }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: i === 1 ? '#fff' : black }}>{bar.value}</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: black }}>{bar.label}</div>
          {bar.sub && <div style={{ fontSize: 18, color: gray, marginTop: 4 }}>{bar.sub}</div>}
        </div>
      </div>
    ))}
  </div>
);

const RevenueChart: Page = () => (
  <div style={{ ...fill, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 140px' }}>
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent, letterSpacing: '0.12em', marginBottom: 20 }}>
        收入结构
      </div>
      <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 56, fontWeight: 900, margin: 0, marginBottom: 12 }}>
        2025 年总收入
      </h2>
      <p style={{ fontSize: 28, color: gray, margin: 0, marginBottom: 48 }}>
        同比 -53.5%，主动压缩低毛利业务
      </p>
      <div style={{ display: 'flex', gap: 120, alignItems: 'center' }}>
        <BarChart />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 16, height: 16, background: lightGray }} />
            <span style={{ fontSize: 24, color: gray }}>总收入 16.23 亿</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 16, height: 16, background: accent }} />
            <span style={{ fontSize: 24, color: gray }}>院内解决方案 11.89 亿</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 16, height: 16, background: midGray }} />
            <span style={{ fontSize: 24, color: gray }}>院外解决方案 4.34 亿</span>
          </div>
        </div>
      </div>
    </div>
    <PageNum n={10} />
  </div>
);

// ── Page 11: 毛利率跃升 ─────────────────────────────────────

const MarginComparison: Page = () => (
  <div style={{ ...fill, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 140px' }}>
    <div style={{ width: '100%', textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent, letterSpacing: '0.12em', marginBottom: 20 }}>
        结构转型
      </div>
      <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 56, fontWeight: 900, margin: 0, marginBottom: 60 }}>
        毛利率翻倍
      </h2>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 80 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 22, color: gray, letterSpacing: '0.08em' }}>2024</div>
          <div style={{
            width: 180, height: 180, borderRadius: '50%',
            border: `6px solid ${midGray}`, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          }}>
            <span style={{ fontSize: 56, fontWeight: 900, color: midGray, lineHeight: 1 }}>24.7</span>
            <span style={{ fontSize: 22, color: gray }}>%</span>
          </div>
          <div style={{ fontSize: 22, color: gray, marginTop: 8 }}>整体毛利率</div>
        </div>

        <svg width="80" height="24" viewBox="0 0 80 24">
          <line x1="0" y1="12" x2="72" y2="12" stroke={accent} strokeWidth="3" />
          <polygon points="64,4 78,12 64,20" fill={accent} />
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 22, color: accent, fontWeight: 600, letterSpacing: '0.08em' }}>2025</div>
          <div style={{
            width: 200, height: 200, borderRadius: '50%',
            border: `6px solid ${accent}`, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
          }}>
            <span style={{ fontSize: 64, fontWeight: 900, color: accent, lineHeight: 1 }}>47.8</span>
            <span style={{ fontSize: 24, color: accent }}>%</span>
          </div>
          <div style={{ fontSize: 22, color: accent, fontWeight: 600, marginTop: 8 }}>整体毛利率</div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 80, marginTop: 48 }}>
        <span style={{ fontSize: 22, color: gray }}>院内 P2M 毛利率 59.9%</span>
        <span style={{ fontSize: 22, color: gray }}>院外 P2M 毛利率 59.3%</span>
      </div>
    </div>
    <PageNum n={11} />
  </div>
);

// ── Page 12: 核心优势 ───────────────────────────────────────

const Advantages: Page = () => (
  <div style={{ ...fill, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 120px' }}>
    <OrangeArc size={240} rotation={-20} />
    <div style={{ width: '100%' }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent, letterSpacing: '0.12em', marginBottom: 20 }}>
        护城河
      </div>
      <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 64, fontWeight: 900, margin: 0, marginBottom: 56 }}>
        核心优势
      </h2>
      <div style={{ display: 'flex', gap: 60 }}>
        <div style={{ flex: 1, borderLeft: `4px solid ${accent}`, paddingLeft: 36 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: black, marginBottom: 20 }}>场景闭环</div>
          <div style={{ fontSize: 26, lineHeight: 1.55, color: gray }}>院内 → 互联网医院 → 药店 → 慢病管理</div>
          <div style={{ fontSize: 26, lineHeight: 1.55, color: gray, marginTop: 8 }}>
            诊—治—药—管 数据与业务连续性极强
          </div>
        </div>
        <div style={{ flex: 1, borderLeft: `4px solid ${accent}`, paddingLeft: 36 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: black, marginBottom: 20 }}>SaaS 黏性</div>
          <div style={{ fontSize: 26, lineHeight: 1.55, color: gray }}>
            医院/药店上线后替换成本极高
          </div>
          <div style={{ fontSize: 26, lineHeight: 1.55, color: gray, marginTop: 8 }}>
            订阅收入稳定，形成经常性收入基础
          </div>
        </div>
        <div style={{ flex: 1, borderLeft: `4px solid ${accent}`, paddingLeft: 36 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: black, marginBottom: 20 }}>数据飞轮</div>
          <div style={{ fontSize: 26, lineHeight: 1.55, color: gray, letterSpacing: '-1px' }}>
            长期随访数据支撑精准营销和真实世界研究
          </div>
          <div style={{ fontSize: 26, lineHeight: 1.55, color: gray, marginTop: 8 }}>
            数据越多，服务能力越强
          </div>
        </div>
      </div>
    </div>
    <PageNum n={12} />
  </div>
);

// ── Page 13: P2M 增长 ───────────────────────────────────────

const P2MGrowth: Page = () => (
  <div style={{ ...fill, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 140px' }}>
    <div style={{ position: 'absolute', top: 80, right: 140 }}>
      <OrangeCircle size={300} opacity={0.05} />
    </div>
    <div style={{ zIndex: 1, width: '100%' }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent, letterSpacing: '0.12em', marginBottom: 20 }}>
        增长引擎
      </div>
      <h2 style={{ fontFamily: 'var(--osd-font-display)', fontSize: 56, fontWeight: 900, margin: 0, marginBottom: 56 }}>
        P2M：从服务商到产品商业化渠道
      </h2>
      <div style={{ display: 'flex', gap: 80 }}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 100, fontWeight: 900, color: accent, lineHeight: 1 }}>+46.6<sup style={{ fontSize: 32 }}>%</sup></div>
          <div style={{ fontSize: 26, color: gray, marginTop: 12 }}>院内 P2M 增长</div>
        </div>
        <div style={{ width: 2, background: midGray }} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 100, fontWeight: 900, color: accent, lineHeight: 1 }}>+147.8<sup style={{ fontSize: 32 }}>%</sup></div>
          <div style={{ fontSize: 26, color: gray, marginTop: 12 }}>院外 P2M 增长</div>
        </div>
      </div>
      <div style={{ marginTop: 56, paddingTop: 32, borderTop: `1px solid ${midGray}` }}>
        <p style={{ fontSize: 28, color: gray, margin: 0, textAlign: 'center', lineHeight: 1.6 }}>
          AI 平台铺网 → 获取诊疗场景 → 药企精准营销 → <span style={{ color: accent, fontWeight: 700 }}>自营药品渠道变现</span>
        </p>
      </div>
    </div>
    <PageNum n={13} />
  </div>
);

// ── Page 14: 结论 ───────────────────────────────────────────

const Conclusion: Page = () => (
  <div style={{ ...fill, position: 'relative', display: 'flex', alignItems: 'center', padding: '0 160px' }}>
    <OrangeCircle size={400} opacity={0.04} />
    <OrangeArc size={280} rotation={45} />
    <div style={{ zIndex: 1 }}>
      <div style={{ fontSize: 22, fontWeight: 600, color: accent, letterSpacing: '0.12em', marginBottom: 24 }}>
        结论
      </div>
      <h2 style={{
        fontFamily: 'var(--osd-font-display)', fontSize: 72, fontWeight: 900,
        lineHeight: 1.1, margin: 0, maxWidth: 1300,
      }}>
        战略方向清晰，处于<span style={{ color: accent }}>高质量增长验证期</span>
      </h2>
      <OrangeRule />
      <div style={{ display: 'flex', gap: 80, marginTop: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: accent, marginBottom: 16 }}>看点</div>
          <ul style={{ fontSize: 26, lineHeight: 1.7, margin: 0, paddingLeft: 24, color: black, listStyle: 'none' }}>
            <li style={{ marginBottom: 8 }}>— 院内 + 院外网络具备平台价值</li>
            <li style={{ marginBottom: 8 }}>— P2M 进入产品商业化环节</li>
            <li>— 毛利率从 24.7% → 47.8%</li>
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: gray, marginBottom: 16 }}>待验证</div>
          <ul style={{ fontSize: 26, lineHeight: 1.7, margin: 0, paddingLeft: 24, color: gray, listStyle: 'none' }}>
            <li style={{ marginBottom: 8 }}>— 转型期收入规模大幅收缩</li>
            <li style={{ marginBottom: 8 }}>— 经调整净亏损 1.82 亿</li>
            <li>— 销售费用率升至 49.3%</li>
          </ul>
        </div>
      </div>
    </div>
    <PageNum n={14} />
  </div>
);

// ── Export ───────────────────────────────────────────────────

export const meta: SlideMeta = { title: '智云健康商业模式分析' };
export default [
  Cover,
  Positioning,
  ClosedLoop,
  DividerBiz,
  Dashboard,
  HospitalSaaS,
  PharmacySaaS,
  ChronicCare,
  RevenueModel,
  RevenueChart,
  MarginComparison,
  Advantages,
  P2MGrowth,
  Conclusion,
] satisfies Page[];
