# Azure Static Web Apps 部署与 GitHub Actions 集成指南

本指南总结了如何将 Vite 项目部署到 Azure Static Web Apps（SWA），并通过 GitHub Actions 实现自动化 CI/CD。内容参考 [Vite 官方部署文档](https://vite.dev/guide/static-deploy.html)、[Azure SWA 官方文档](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=aat&pivots=github-actions) 以及 VS Code SWA 插件。

---

## 一、推荐方式：使用 VS Code SWA 插件一键创建与集成

1. **安装插件**

   - 在 VS Code 扩展市场搜索并安装 [Azure Static Web Apps 插件](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps)。

2. **一键创建 SWA 资源**

   - 在 VS Code 左侧 Azure 面板，找到 Static Web Apps 区域，点击“+”新建。
   - 按提示选择 GitHub 仓库、分支、应用路径（如 `/`）、API 路径（如 `api`）、输出路径（如 `dist`）。
   - 插件会自动在仓库 `.github/workflows` 目录生成 SWA 的 CI/CD workflow 文件，并自动配置授权。

3. **管理 Secrets/Variables**
   - 插件支持在创建过程中自动配置部署令牌（API Token），并可在 Azure Portal 或 GitHub Environments 中补充环境变量和 Secrets。

---

## 二、手动配置流程（如需自定义）

1. **Azure Portal 创建 SWA**

   - 登录 [Azure Portal](https://portal.azure.com/)，手动新建 SWA 资源，选择 GitHub 作为代码源。
   - 按需配置应用路径、API 路径、输出路径。
   - 获取部署令牌，手动添加到 GitHub Secrets。

2. **GitHub Actions 工作流多环境部署配置**
   如果有多个 Tenant 环境，可以参考以下来实现多环境的变量动态写入：

   **Step 1. 在 GitHub Environments 创建环境并添加 Secrets/Variables**

   - 进入仓库 Settings → Environments，创建名为 `china` 的环境（同样步骤创建`commercial`）。
   - 添加 Secrets：
     - VITE_AZURE_CLIENT_ID = xxx
     - VITE_AZURE_TENANT_ID = xxx
     - VITE_AZURE_AUTHORITY = xxx
   - 添加 Variables：
     - VITE_GRAPH_BASE_URL = https://microsoftgraph.chinacloudapi.cn

   **Step 2. 编辑 workflow 文件**

   - 在 `.github/workflows/azure-static-web-apps-*.yml` 文件中，配置如下：
     ```yaml
     jobs:
        build_and_deploy_job:
           environment: china
           steps:
              - uses: actions/setup-node@v4
                 with:
                    node-version: "20.x"
              - uses: actions/checkout@v3
              - name: Build And Deploy
                 uses: Azure/static-web-apps-deploy@v1
                 env:
                    VITE_AZURE_CLIENT_ID: ${{ secrets.VITE_AZURE_CLIENT_ID }}
                    VITE_AZURE_TENANT_ID: ${{ secrets.VITE_AZURE_TENANT_ID }}
                    VITE_AZURE_AUTHORITY: ${{ secrets.VITE_AZURE_AUTHORITY }}
                    VITE_GRAPH_BASE_URL: ${{ vars.VITE_GRAPH_BASE_URL }}
                    CUSTOM_BUILD_COMMAND: "npm install --legacy-peer-deps && npm run build"
                 with:
                    azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_BRAVE_STONE_0CB7F1B00 }}
                    repo_token: ${{ secrets.GITHUB_TOKEN }}
                    action: "upload"
                    deployment_environment: china
                    app_location: "/"
                    api_location: "api"
                    output_location: "dist"
     ```

   **Step 3. 通过 `CUSTOM_BUILD_COMMAND` 环境变量完全覆盖 Oryx 默认的 `npm install` 和 `npm run build`，因为 fluentUI 版本依赖。**

3. **SWA 侧环境说明与后续操作**
   - 在 Azure Static Web Apps 资源本身无需手动设置环境，所有环境隔离由 GitHub Actions 的 `deployment_environment` 自动管理。
   - 部署完成后，每个环境会生成独立的访问 URL（如 `https://xxx-china.azurestaticapps.net`、`https://xxx-commercial.azurestaticapps.net`）。
   - 需手动更新 Teams manifest 文件和 Azure AD 应用的重定向 URI，确保新环境 URL 被正确注册和授权。

---

## 三、参考链接

- [Vite 静态部署指南](https://vite.dev/guide/static-deploy.html)
- [Azure SWA Build 配置文档](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=aat&pivots=github-actions)
- [Oryx Node.js 构建文档](https://github.com/microsoft/Oryx/blob/main/doc/runtimes/nodejs.md#build)
- [VS Code Azure Static Web Apps 插件](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps)

---

如需详细配置示例，请参考本项目的 `.github/workflows/azure-static-web-apps-brave-stone-0cb7f1b00.yml` 文件。
