# 宅合 ZhaiHe

移动端优先的房屋风水文化与居住匹配评估工具。用户填写少量房源与个人信息后，网站会调用阿里百炼 Qwen 3.5 Flash 生成结构化报告；未配置 Key 时返回本地示例报告，方便先预览体验。

## 功能

- 移动端优先的新中式 UI，包含罗盘、山水、宣纸和朱砂印章视觉。
- 少字段评估表单：户型图、小区名称、朝向、楼层、水体、周边产业、附近公司。
- 个人信息：姓名、出生地、五行信息和工作行业，统一以自然语言交给 LLM 理解。
- 服务端代理阿里百炼 DashScope，避免 API Key 暴露到前端。
- 户型图会通过 OpenAI-compatible `image_url` 多模态消息传给视觉模型；如果模型未实际读取图片，服务端会拒绝展示降级报告。
- 报告包含综合匹配度、传统风水参考、现实居住舒适度、人与房屋匹配、改善建议和置信度。

## 启动

```bash
pnpm install
pnpm dev
```

访问 `http://localhost:5173/`。

## 配置阿里百炼

复制 `.env.example` 为 `.env`，然后填入你的 Key：

```bash
cp .env.example .env
```

```env
DASHSCOPE_API_KEY=your_dashscope_key_here
DASHSCOPE_MODEL=qwen3.5-flash
DASHSCOPE_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

默认使用阿里百炼 OpenAI-Compatible Chat Completions 接口。若你的账号后台展示的是 `qwen3.5-plus`、`qwen3-vl-flash` 或其他可视觉理解的部署别名，只需要改 `.env` 里的 `DASHSCOPE_MODEL`。

## 验证

```bash
pnpm test
pnpm check
pnpm lint
pnpm build
```

## 说明

本项目输出仅供传统文化、审美与居住决策参考，不替代专业验房、法律、医学或投资建议。
