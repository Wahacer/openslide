# open-slide SaaS 改造计划

## 项目目标

将 open-slide 从本地开发者工具改造为多租户 SaaS 产品，支持用户登录、计费、Chat 式 AI 编辑、管理后台等功能。

---

## Phase 0 — 基础设施搭建（预计 2-3 周）

- [ ] 新建 `apps/platform/` 目录（Next.js App Router）
- [ ] 配置 PostgreSQL + Prisma ORM
- [ ] 配置对象存储（S3 / Cloudflare R2）
- [ ] 配置 Redis（会话管理、速率限制）
- [ ] 部署流水线搭建（Vercel + Railway/Fly.io）
- [ ] 环境变量 & secrets 管理方案

---

## Phase 1 — 用户认证 & 多租户隔离（预计 1-2 周）

- [ ] 用户注册/登录（邮箱+密码）
- [ ] OAuth 登录（GitHub / Google）
- [ ] JWT/Session 认证中间件
- [ ] 用户数据模型（User, Slide, Asset）
- [ ] 多租户数据隔离（每个用户只能访问自己的 slides）
- [ ] Storage Adapter 接口抽象（FileSystem / S3）

---

## Phase 2 — 计费系统（预计 1-2 周）

- [ ] Account 数据模型设计（关联 User）
- [ ] 通用额度体系（QuotaType 枚举：TOKEN / IMAGE_GEN / CREDIT / SLIDE_COUNT / STORAGE_BYTES）
- [ ] Quota 表：每用户每类型的额度上限 & 已用量
- [ ] UsageLog 流水表（审计 + 明细，记录 model、slideId、action 等 meta）
- [ ] QuotaService 核心接口（check / consume / getUsage / reset）
- [ ] 额度重置机制（月度自动重置）
- [ ] 超额拦截中间件（API 层统一校验）
- [ ] 充值/套餐升级接口（对接支付或手动充值）

---

## Phase 3 — Chat 式 PPT 编辑 & 创建（预计 3-4 周）

- [ ] Chat API 设计（WebSocket / SSE 流式输出）
- [ ] AI Service Layer 抽象（支持多模型切换）
  - [ ] Claude API Provider
  - [ ] OpenAI API Provider（可选）
  - [ ] 图片生成 Provider（DALL-E / Flux）
- [ ] Slide 源码作为 context 传入 LLM
- [ ] LLM 输出 → AST 编辑 → 源码更新 pipeline
- [ ] 对话历史持久化（支持多轮修改）
- [ ] 前端 Chat 面板 UI（右侧抽屉/面板）
- [ ] 流式返回 + 实时预览
- [ ] 快捷指令支持（/新建、/修改颜色、/添加页面）
- [ ] Token 用量计量 & 扣费集成

---

## Phase 4 — 前端文件上传 & 资产管理（预计 1 周）

- [ ] 预签名 URL 上传接口（直传 S3/R2）
- [ ] 前端拖拽上传组件（Chat 面板 + Slide 编辑器）
- [ ] 粘贴图片自动上传
- [ ] 上传完成后自动关联到当前 slide（写入 Asset 表）
- [ ] 资产浏览器 UI（查看/删除/替换已上传资产）
- [ ] 文件大小 & 类型校验

---

## Phase 5 — 前台评论应用（预计 1 周）

- [ ] 评论面板添加「应用所有修改」按钮
- [ ] 单条评论「Apply」按钮（只应用该条修改）
- [ ] `POST /api/slides/:id/apply-comments` 接口
- [ ] 后端收集 @slide-comment → 组装 prompt → LLM 生成修改
- [ ] 修改结果通过 WebSocket 推送前端
- [ ] Slide 实时热更新（无需手动刷新）
- [ ] 应用成功后自动清除对应 comment 标记

---

## Phase 6 — 管理后台（预计 2-3 周）

- [ ] 管理后台路由 & 权限守卫（role = ADMIN）
- [ ] 用户管理页面（列表、搜索、禁用/启用、详情）
- [ ] 用量概览仪表盘（Token / 图片 / 积分消耗图表）
- [ ] 计费设置页面（套餐管理、额度配置、定价规则）
- [ ] 模型配置页面（启用/禁用模型、费率设置、API Key 管理）
- [ ] 系统设置页面（注册开关、默认额度、文件大小限制）
- [ ] 操作日志 & 审计记录

---

## Phase 7 — 导出优化（预计 1-2 周）

- [ ] PPTX 导出（pptxgenjs：文本可编辑、图片嵌入、布局还原）
- [ ] PDF 导出升级（Puppeteer 服务端渲染，高分辨率）
- [ ] HTML 导出增强（保留 CSS 动画）
- [ ] 导出任务队列（大文件异步处理）
- [ ] 导出历史记录 & 下载管理

---

## 实施优先级

```
推荐顺序: Phase 0 → 1 → 4 → 5 → 3 → 2 → 6 → 7

Phase 0 (基础设施)     ████████░░  2-3 周
Phase 1 (认证+隔离)    ██████░░░░  1-2 周
Phase 4 (文件上传)     ████░░░░░░  1 周
Phase 5 (前台评论)     ████░░░░░░  1 周
Phase 3 (Chat 编辑)    ████████████ 3-4 周  ← 核心功能
Phase 2 (计费系统)     ██████░░░░  1-2 周
Phase 6 (管理后台)     ██████████  2-3 周
Phase 7 (导出优化)     ██████░░░░  1-2 周
```

---

## 技术选型摘要

| 组件 | 方案 |
|------|------|
| 后端框架 | Next.js App Router（apps/platform） |
| 数据库 | PostgreSQL + Prisma ORM |
| 对象存储 | S3 / Cloudflare R2 |
| 缓存 | Redis |
| 认证 | NextAuth.js / Auth.js |
| AI 调用 | Claude API + OpenAI API（可切换） |
| 实时通信 | WebSocket / SSE |
| UI 组件 | shadcn/ui（项目已有） |
| 图表 | Recharts |
| PPTX 导出 | pptxgenjs |
| PDF 导出 | Puppeteer（服务端） |
