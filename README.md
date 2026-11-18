# 化疗剂量计算前端演示

纯 HTML、CSS 和 JavaScript 页面，包含体表面积和 Calvert 两个计算界面。输入与结果仅在浏览器内处理，代码没有后端或网络请求。

## 本地运行

```bash
python3 -m http.server 8080
```

打开 `http://localhost:8080`。也可直接打开 `index.html`；本地 HTTP 服务更适合检查 manifest 行为。无需 npm 安装依赖。

## 开发检查

使用 Node.js 18 或更新版本：

```bash
node --check app.js
node --test tests/*.test.js
```

测试覆盖输入或性别改变时清除旧结果、无效输入、非正计算结果及数值溢出。它们是前端交互回归检查，不代表医学公式或临床适用性已验证。此仓库目前没有 service worker，因此不提供受测试的离线缓存行为。
