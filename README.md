# Teams Demo App - Authentication with NAA Support

这是一个 Microsoft Teams 演示应用程序，目前主要展示身份验证功能，支持 Web 浏览器和 Teams Nested app authentication（NAA）场景。未来会添加更多功能模块。

## Auth Demo 概述

本示例演示了如何将现有集成 AAD 认证普通 web app，改造为支持内嵌到 Teams 的 Tab 应用。所以认证模块覆盖了 Web 浏览器和 Teams NAA 两种主要场景，希望为开发者提供完整的身份验证的些许参考，非最佳实践。

> 若想从 0 开始了解 Teams NAA，参考：[Enable Nested app authentication](https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/nested-authentication)，或参考后文简介

### 主要特性

- **多环境适配**: 智能检测并适配 Web 浏览器和 Microsoft Teams 环境
- **现代身份验证**: 使用最新的 Azure AD OAuth 2.0 和 MSAL.js 库
- **NAA 支持**: 完整支持 Teams 嵌套应用认证，提供无缝 SSO 体验
- **用户友好**: 基于 FluentUI 的响应式界面设计
- **开发友好**: TypeScript + React 19 + Vite 现代开发栈

## 开发环境搭建

### 1. 前置要求

确保已安装以下软件：

- **Node.js** (版本 >= 18.0.0) - [下载地址](https://nodejs.org/)
- **npm** (通常随 Node.js 一起安装)

### 2. 项目初始化

```bash
# 克隆项目并进入目录
cd tab-auth-demo

# 安装依赖 (必须使用 --legacy-peer-deps 参数)
npm install --legacy-peer-deps

```

**注意**: 必须使用 `--legacy-peer-deps` 参数安装依赖，这是因为 FluentUI 的依赖的版本冲突需要这种方式解决。

### 3. 环境配置

#### 3.1 注册 Azure AD 应用并配置重定向 URI

1. 登录 [Azure Portal](https://portal.azure.com/)，进入“Azure Active Directory” > “应用注册”，点击“新注册”。
2. 填写应用名称，选择“单页应用（SPA）”类型。
3. 在“重定向 URI”中添加：
   - `http://localhost:5173`
   - `https://<your-ngrok-or-codespaces-url>` #用 ngrok，dev tunnel，或使用 codespaces 获得的公网地址
   - `brk-multihub://<your-ngrok-or-codespaces-domain>` #注意仅填域名
4. 注册完成后，在应用概览页获取 **应用(客户端)ID/Application ID** 和 **目录(租户)ID/Tenant ID**。

#### 3.2 创建环境配置文件

在项目根目录创建 `.env.development.local` , 参考`.env.example`文件填写：

```.env.example
# Azure AD 应用配置
VITE_AZURE_CLIENT_ID=your-client-id
VITE_AZURE_TENANT_ID=your-tenant-id
VITE_AZURE_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
VITE_GRAPH_BASE_URL=https://graph.microsoft.com

# 可选：为不同环境配置不同的权限端点
# 中国区用户需要使用不同的端点
# VITE_AZURE_AUTHORITY=https://login.partner.microsoftonline.cn/your-tenant-id
# VITE_GRAPH_BASE_URL=https://microsoftgraph.chinacloudapi.cn
```

> 更多可见 [Vite env guide](https://vite.dev/guide/env-and-mode.html)

### 4. 启动开发服务器

```bash
npm run dev
```

> 关于 Vite
>
> 本项目基于 [Vite](https://vite.dev/) 构建，Vite 是现代前端开发工具，只需保存代码，页面会自动实时刷新，无需手动重启服务，大幅提升开发效率。

应用将一般在 `http://localhost:5173` 启动。

> ⚠️ **注意：Teams 要求 Tab 应用必须通过 HTTPS 访问。**
>
> - 本地开发时可使用 [ngrok](https://ngrok.com/) 或[dev tunnel](https://learn.microsoft.com/en-us/azure/developer/dev-tunnels/get-started)将本地端口映射为 HTTPS 外网地址。
> - 更推荐使用 GitHub Codespaces，自动为你的应用分配一个公网 HTTPS 地址，适合 Teams 预览和调试。

## Teams 应用包部署

### 1. 构建应用包

```bash
npm run build:teams
```

此命令会生成 `dist/teams-app.zip` 文件，包含：

- `manifest.json` - Teams App Manifest 文件
- `color.png` - 应用彩色图标 (192x192)
- `outline.png` - 应用轮廓图标 (32x32)

### 2. 上传到 Teams

#### 2.1 中国区：Teams 管理中心

**适用于**: 中国区 Teams 租户，需要 Teams 管理员权限

1. 登录 [Teams 管理中心](https://admin.teams.microsoftonline.cn/)
2. 导航至 "Teams 应用" > "管理应用"
3. 点击 "上传新应用"
4. 上传生成的 `teams-app.zip` 文件
5. 审核并发布应用

#### 2.2 全球商业版：Teams Developer Portal 或 Microsoft 365 Agents Toolkit

**适用于**: 全球商业版 Teams，支持预览和测试

本项目主要演示如何将一个常规 Web 应用简单改造为 Teams 应用。如果你希望从零开始开发 Teams 应用，推荐直接使用 [Microsoft 365 Agents Toolkit](https://learn.microsoft.com/en-us/microsoftteams/platform/toolkit/agents-toolkit-fundamentals)（适用于 Visual Studio Code），它可以帮助你管理 Teams 应用开发的全生命周期，包括：

- 项目模板：一键创建 Tab、Bot、消息扩展等常见场景的 Teams 应用
- 自动化任务：自动完成应用注册、Bot 注册、Entra ID 配置等繁琐步骤
- 多环境支持：方便地切换和管理 dev/test/prod 等不同环境
- 快速访问 Teams Developer Portal：一站式配置、发布和管理你的 Teams 应用
- 本地调试与 HTTPS 隧道：集成 Dev Tunnels，支持本地调试和 HTTPS 访问
- Playground 测试工具：无需注册即可快速调试 Bot 和消息卡片

你可以通过 VS Code 扩展市场安装 Agents Toolkit，体验更高效的 Teams 应用开发流程。

当然，你也可以像本项目一样，手动构建并上传，或直接新建应用：

1. 访问 [Teams Developer Portal](https://dev.teams.microsoft.com/)
2. 点击 "Apps" > "New App"
3. 填写所有必须项，在"Apps Feature"中新建一个"Personal app"
4. 在 Developer Portal 中预览和测试
5. 发布到个人或组织

### 3. Teams App Manifest 详解

Teams App Manifest 是定义 App 在 Teams 中的配置文件，比如你的 app id，app 的 url 等。以下是关键配置说明：

#### 3.1 新建 Manifest

- 可以在全球版 Teams Developer Portal，新建应用，以图形化方式配置 Manifest，或使用 Microsoft 365 Agents Toolkit。中国区没有，但可以导出成 Teams App package 上传到国区 Teams 即可。

- 参考 [Teams App Manifest schema 文档](https://learn.microsoft.com/en-us/microsoftteams/platform/resources/schema/manifest-schema) 了解完整的 Manifest schema。

#### 3.2 NAA 配置部分

```json
{
  "webApplicationInfo": {
    "id": "your-client-id",
    "nestedAppAuthInfo": [
      {
        "redirectUri": "brk-multihub://your-domain.com",
        "scopes": ["User.Read"],
        "claims": "{\"access_token\":{\"xms_cc\":{\"values\":[\"CP1\"]}}}"
      }
    ]
  }
}
```

**NAA 配置重要说明**:

- `id`: 必须与你的 Azure AD App 的 Client ID 完全匹配
- `redirectUri`: 必须使用 `brk-multihub://` 协议，仅填写域名部分
- `scopes`: 必须和代码中 Token Request 的 scope 内容和顺序一致
- `claims`: 用作启用 CAE 和 Authentication Context，不使用的话**不要添加**
- `resource`: 若不配置传统 OBO SSO，可以不添加此属性（添加了在仅使用 NAA 时反而可能会有 AAD 错误）

> 📁 **示例配置**: 本项目在 `public/teamsManifest/manifest.json` 中提供了完整的 Teams App Manifest 示例，包含 NAA 配置。

更多 NAA 配置详情，请参考：[Teams NAA 令牌预取文档](https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/nested-authentication#token-prefetching-for-nested-app-authentication-naa)

## Azure Static Web Apps 部署与 GitHub Actions 集成指南

[👉 部署与集成详细指南](./documents/DeployToAzureSWA.md)

## 项目结构说明

```
src/
├── assets/                 # 静态资源文件
│   └── react.svg
├── features/               # 功能模块
│   ├── homepage/           # 首页模块
│   │   └── Homepage.tsx
│   └── teams-auth/         # Teams 认证模块
│       ├── NAAIntroduction.tsx    # NAA 介绍和使用指南组件
│       ├── ProfileData.tsx        # 用户资料显示组件
│       └── TeamsAppAuthDemo.tsx   # 认证演示主组件
├── layouts/                # 布局组件
│   └── Navigation.tsx      # 导航栏组件
├── services/               # 服务层
│   ├── authConfig.ts       # MSAL 认证配置
│   ├── authService.ts      # 认证服务封装
│   ├── environmentDetection.ts  # 环境检测服务
│   ├── graph.ts           # Microsoft Graph API 调用
│   ├── teamsSDKService.ts # Teams SDK 服务封装
│   └── tools.ts          # 工具函数
├── types/                 # TypeScript 类型定义
│   └── UserInfo.ts        # 用户信息类型
├── App.tsx               # 应用主组件
├── index.css             # 全局样式
├── main.tsx             # 应用入口点
├── theme.ts             # FluentUI 主题配置
└── vite-env.d.ts        # Vite 类型定义

public/
├── teamsManifest/         # Teams 应用清单文件
│   ├── manifest.json      # Teams App Manifest (含NAA配置示例)
│   ├── color.png         # 应用彩色图标 (192x192)
│   └── outline.png       # 应用轮廓图标 (32x32)
├── blank.html           # 空白页面(用于重定向)
└── vite.svg            # Vite 图标

documents/                # 文档目录
├── naa-introduction.md   # NAA 技术深度介绍
└── DeployToAzureSWA.md  # Azure Static Web Apps 部署指南
```

### 关键文件说明

#### 🔑 认证服务 (`src/services/`)

- **`authConfig.ts`**: 配置 MSAL 认证参数，支持 Web 和 NAA 两种模式
- **`authService.ts`**: 提供统一的认证接口，封装 MSAL 操作，根据环境智能选择认证策略
- **`environmentDetection.ts`**: 智能检测当前运行环境（Web/Teams/NAA 支持状态）
- **`teamsSDKService.ts`**: Teams SDK 初始化和状态管理，包含中国区特殊配置

#### 🎨 用户界面 (`src/features/teams-auth/`)

- **`TeamsAppAuthDemo.tsx`**: 认证演示的主要界面，集成环境检测和认证流程
- **`ProfileData.tsx`**: 用户资料展示组件，包含令牌信息查看和 Microsoft Graph API 调用
- **`NAAIntroduction.tsx`**: NAA 技术介绍和实现指南组件，提供详细的配置说明和代码示例

#### 🏗️ 基础架构

- **`App.tsx`**: 应用主组件，处理全局状态、路由和 MSAL 初始化
- **`Navigation.tsx`**: 响应式导航组件，适配不同屏幕尺寸
- **`public/teamsManifest/`**: Teams 应用包资源，包含完整的 NAA 配置示例

## NAA (Nested App Authentication) 简介

NAA 是 Microsoft 为嵌入式应用场景设计的新一代身份验证协议，专门解决在 Teams、Outlook 等宿主环境中运行的应用的身份验证问题。相比传统的 On-Behalf-Of 流程，NAA 消除了中间层服务器的需求，支持 Token 预取，提供更好的性能和用户体验。

[👉 查看 NAA 技术深度介绍](./documents/naa-introduction.md)

**快速了解 NAA 优势**:

- ✅ **纯前端实现**: 无需后端服务，简化架构
- ✅ **无缝 SSO 体验**: 减少用户交互，提升用户体验
- ✅ **动态权限请求**: 支持运行时权限请求，更灵活
- ✅ **性能优化**: Token 预取机制，显著减少认证延迟
- ✅ **开发效率**: 显著降低开发和维护成本

## 许可证

MIT License

---

**更多技术资源：**

- [Microsoft Teams 开发文档](https://docs.microsoft.com/en-us/microsoftteams/platform/)
- [NAA 官方文档](https://learn.microsoft.com/en-us/microsoftteams/platform/concepts/authentication/nested-authentication)
- [MSAL.js 库](https://github.com/AzureAD/microsoft-authentication-library-for-js)
- [Teams JavaScript SDK](https://github.com/OfficeDev/microsoft-teams-library-js)
- [Fluent UI React Components](https://react.fluentui.dev/)

**项目文档：**

- [NAA 技术深度介绍](./documents/naa-introduction.md)
- [Azure Static Web Apps 部署指南](./documents/DeployToAzureSWA.md)
