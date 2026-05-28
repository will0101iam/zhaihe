# 宅合 ZhaiHe

移动端优先的房屋风水文化与居住匹配评估工具。用户填写少量房源与个人信息后，网站会优先调用 DeepSeek 官方直连模型生成结构化报告，失败时再回退到阿里百炼 DashScope 的 Qwen 兜底链；未配置 Key 时返回本地示例报告，方便先预览体验。

## 功能

- 移动端优先的新中式 UI，包含罗盘、山水、宣纸和朱砂印章视觉。
- 少字段评估表单：户型图、小区名称、朝向、楼层、水体、周边产业、附近公司。
- 个人信息：姓名、出生地、五行信息和工作行业，统一以自然语言交给 LLM 理解。
- 服务端代理 DeepSeek 官方直连与阿里百炼 DashScope，避免 API Key 暴露到前端。
- 户型图会通过 OpenAI-compatible `image_url` 多模态消息传给视觉模型；如果模型未实际读取图片，服务端会拒绝展示降级报告。
- 报告包含综合匹配度、传统风水参考、现实居住舒适度、人与房屋匹配、改善建议和置信度。

## 启动

```bash
pnpm install
pnpm dev
```

访问 `http://localhost:5173/`。

## 配置 LLM 渠道

复制 `.env.example` 为 `.env`，然后填入你的 Key：

```bash
cp .env.example .env
```

```env
DEEPSEEK_API_KEY=your_deepseek_key_here
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_API_URL=https://api.deepseek.com/chat/completions

DASHSCOPE_API_KEY=your_dashscope_key_here
DASHSCOPE_MODEL=qwen3.6-flash-2026-04-16
DASHSCOPE_API_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions
```

默认优先使用 DeepSeek 官方 OpenAI-Compatible Chat Completions 接口，模型为 `deepseek-v4-flash`。如果 DeepSeek 渠道失败，服务端会自动回退到 DashScope，并按内置 Qwen 候选链继续尝试。

如果你只想使用 DashScope，也可以只配置 `DASHSCOPE_*` 变量；如果你两个渠道都配置了，就会先 DeepSeek、后 DashScope。

## 验证

```bash
pnpm test
pnpm check
pnpm lint
pnpm build
```

## 说明

本项目输出仅供传统文化、审美与居住决策参考，不替代专业验房、法律、医学或投资建议。
