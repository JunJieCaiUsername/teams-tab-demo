# Azure Static Web Apps 部署与 GitHub Actions 集成指南

本指南总结了如何将 Vite 项目部署到 Azure Static Web Apps（SWA），并通过 GitHub Actions 实现自动化 CI/CD。内容参考 [Vite 官方部署文档](https://vite.dev/guide/static-deploy.html)、[Azure SWA 官方文档](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=aat&pivots=github-actions) 以及 VS Code SWA 插件。

---

## 使用 VS Code SWA 插件一键创建与集成

1. **安装插件**

   - 在 VS Code 扩展市场搜索并安装 [Azure Static Web Apps 插件](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps)。

2. **一键创建 SWA 资源**

   - 在 VS Code 左侧 Azure 面板，找到 Static Web Apps 区域，点击“+”新建。
   - 按提示选择 GitHub 仓库、分支、应用路径（如 `/`）、API 路径（如 `api`）、输出路径（如 `dist`）。
   - 插件会自动在仓库 `.github/workflows` 目录生成 SWA 的 github action 定义文件 （`.github/workflows/azure-static-web-apps-*.yml`），并自动配置了 SWA 部署密钥。

3. **配置 GitHub Actions 多环境部署**

   如果有多个 Tenant 环境，可以参考以下来实现多环境的变量动态写入：

   **Step 1. 在 GitHub Environments 创建环境并添加 Secrets/Variables**

   - 在 github repo 的 Settings → Environments，创建名为 `china` 的环境（同样步骤创建`commercial`）。
   - 添加 Secrets：
     - VITE_AZURE_CLIENT_ID = xxx
     - VITE_AZURE_TENANT_ID = xxx
     - VITE_AZURE_AUTHORITY = xxx
   - 添加 Variables：
     - VITE_GRAPH_BASE_URL = https://microsoftgraph.chinacloudapi.cn

   **Step 2. 示例 action 定义文件要点**

   - 使用[matrix 策略](https://docs.github.com/zh/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations)建立多个 job，在 deployment_environment 引用就能分别部署到相应 swa 环境

     ```yaml
     strategy:
       matrix:
         environment: [china, commercial]
      ......
      deployment_environment: ${{ matrix.environment }}
     ```

   - Oryx 是 Azure SWA，App service 等的 build tool，包含在 Azure/static-web-apps-deploy@v1 这个 action 的容器镜像中。它在 build 时会默认运行`npm install`，但这里由于 fluentUI 依赖版本问题，必须使用 `CUSTOM_BUILD_COMMAND` 环境变量来覆盖，参考[Oryx Configuration](https://github.com/microsoft/Oryx/blob/main/doc/configuration.md)。

     ```yaml
     CUSTOM_BUILD_COMMAND: "npm install --legacy-peer-deps && npm run build"
     ```

4. **SWA 侧环境说明与后续操作**
   - 在 Azure Static Web Apps 资源本身无需手动设置环境，会由 `deployment_environment` 自动创建并管理，免费计划最多 3 个预览环境。
   - 注意：`environment: [china, commercial]`环境名称须一开始就确定，部署后不要随意更改，它会寻找 Github 中是否有同名 Environment，没有则会**新建**
   - 部署完成后，每个环境会生成独立的访问 URL（如 `https://xxx-china.azurestaticapps.net`、`https://xxx-commercial.azurestaticapps.net`）。
   - 需手动更新 Teams manifest 文件和 Azure AD 应用的重定向 URI，确保新环境 URL 被正确注册。

---

## 三、参考链接

- [Vite 静态部署指南](https://vite.dev/guide/static-deploy.html)
- [Azure SWA Build 配置文档](https://learn.microsoft.com/en-us/azure/static-web-apps/build-configuration?tabs=aat&pivots=github-actions)
- [Oryx Node.js 构建文档](https://github.com/microsoft/Oryx/blob/main/doc/runtimes/nodejs.md#build)
- [VS Code Azure Static Web Apps 插件](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps)

---

如需详细配置示例，请参考本项目的 `.github/workflows/azure-static-web-apps-brave-stone-0cb7f1b00.yml` 文件。
