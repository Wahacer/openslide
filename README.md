<img width="1280" height="640" alt="open-slide github cover" src="https://github.com/user-attachments/assets/02f5e6d7-12a7-4a8e-88e7-ae8770a96584" />

# open-slide

**AI 驱动的在线演示文稿平台。** 通过自然语言对话创建和编辑幻灯片，支持多用户、计费管理和一键导出。

基于 open-slide 开源框架，每张幻灯片渲染在固定的 **1920 × 1080** 画布上，页面是任意 React 组件。

## 项目愿景

将 open-slide 从本地开发者工具改造为多租户 SaaS 产品：
- 用户通过 Chat 对话即可创建和修改 PPT
- 每个用户拥有独立的工作空间
- 灵活的计费体系（Token / 图片生成 / 积分）
- 管理后台监控用户、用量和模型配置

详细改造计划见 [TODO.md](TODO.md)。

## 核心功能

### 💬 Chat 式 AI 编辑

通过对话创建和修改幻灯片，支持多轮对话、流式输出、实时预览。直接在聊天中上传图片和文字资料。

### 👤 多用户 & 工作空间隔离

每个用户拥有独立的 slides 目录，数据完全隔离。支持邮箱注册和 OAuth 登录。

### 💰 灵活计费体系

可扩展的额度系统，支持多种收费维度：
- Token 消耗量
- 图片生成次数
- 通用积分
- 存储空间

### 🛠️ 管理后台

用户管理、用量监控、模型配置、套餐设置一站式管理。

### 🎯 前台评论 & 一键应用

点击元素添加修改意见，一键调用 AI 应用所有修改，无需离开浏览器。

### 📦 多格式导出

支持 PPTX（可编辑）、PDF（高清）、HTML（含动画）多种导出格式。

### 🖼️ 便捷资产管理

拖拽/粘贴上传图片，预签名直传对象存储，自动关联到当前 slide。

### 🎬 演示模式

全屏播放、演讲者模式（当前/下一页预览 + 计时器）、键盘导航。

## 本地开发

```bash
pnpm install
pnpm dev      # 启动 demo 开发服务器
pnpm build    # 构建所有包
pnpm check    # 类型检查
pnpm lint     # biome lint
```

## 项目结构

pnpm + Turbo monorepo：

| 路径 | 说明 |
| --- | --- |
| [packages/core](packages/core) | `@open-slide/core` — 运行时（首页、slide 查看器、演示模式、inspector）、Vite 插件、CLI |
| [packages/cli](packages/cli) | `@open-slide/cli` — 脚手架工具 |
| [apps/demo](apps/demo) | 示例工作区，本地开发框架用 |
| [apps/web](apps/web) | 官网 & 文档 |
| apps/platform | （规划中）SaaS 主应用 |

## License

MIT
