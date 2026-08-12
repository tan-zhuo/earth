# Earth · 交互式 3D 地球

类似 Google Earth 的纯前端 3D 地球应用：旋转 / 缩放地球，点击国家查看国旗、人口、GDP、政体等信息，支持中英文切换。

作者：[tan-zhuo](https://github.com/tan-zhuo) · 博客：[tanzhuo.xyz](https://tanzhuo.xyz) · 开源地址：[github.com/tan-zhuo/earth](https://github.com/tan-zhuo/earth)

## 快速开始

```bash
npm install
npm run dev      # 开发（默认 5173，被占用时自动换端口）
npm run build    # 类型检查 + 生产构建 → dist/
```

## 技术栈

| 领域 | 选型 | 理由 |
|---|---|---|
| 框架 | React 18 + TypeScript + Vite | 生态成熟、构建快、可静态部署 |
| 3D 地球 | Three.js（globe.gl 封装） | 比 Cesium 轻量数个量级，无需 Ion token；国家多边形、飞行动画、悬停拾取开箱即用 |
| 样式 | Tailwind CSS v4 | 深色科技风快速成型 |
| 状态 | Zustand | 极简，选中国家 / 自转开关两三个字段足够 |
| 国际化 | react-i18next + 浏览器语言检测 | 自动检测 + localStorage 记忆用户选择 |

## 数据来源（全部免费、无密钥）

| 数据 | 来源 | 获取时机 |
|---|---|---|
| 国家基础信息（含中文名） | [mledoze/countries](https://github.com/mledoze/countries)（REST Countries 上游数据集，ODbL） | **构建时**静态化 → `src/data/countries.json`，运行时零请求 |
| 人口 / GDP / 人均 GDP | World Bank Open Data API | 点击国家时按需拉取，localStorage 缓存 30 天 |
| 国旗 | flagcdn.com | 运行时按 ISO2 码取图 |
| 国家边界 | world-atlas（Natural Earth 110m） | 随应用自托管（`public/data/`） |
| 地球贴图 | three-globe 附带 NASA 贴图 | 随应用自托管（`public/textures/`） |
| 政治体制 / 首都中文名 | 本地精选静态数据 `src/data/countryExtras.ts` | 构建时打包 |

> 注意：REST Countries v3.1 API 已于 2026 年弃用（新版 v5 需注册），因此本项目不在运行时依赖它，改为构建时静态化上游数据集。更新国家数据：`node scripts/build-countries.mjs`。

## 目录结构

```
earth/
├── public/
│   ├── data/countries-110m.json    # 国家边界 TopoJSON（Natural Earth 110m）
│   └── textures/                   # 地球夜景贴图、星空背景
├── scripts/
│   └── build-countries.mjs         # 构建时生成 src/data/countries.json
├── src/
│   ├── components/
│   │   ├── GlobeView.tsx           # 3D 地球：渲染、悬停/选中高亮、飞行动画
│   │   ├── Header.tsx              # 标题、返回总览、自转开关、语言切换
│   │   └── InfoPanel.tsx           # 国家详情面板（桌面右侧滑入 / 移动端底部升起）
│   ├── data/
│   │   ├── countries.json          # 静态国家数据（脚本生成，已提交）
│   │   └── countryExtras.ts        # 政体（中英）+ 首都中文名（本地精选）
│   ├── i18n/                       # react-i18next 配置与中英文案
│   ├── services/
│   │   ├── cache.ts                # localStorage 缓存（版本号 + TTL）
│   │   ├── countries.ts            # 静态国家数据读取
│   │   └── worldbank.ts            # World Bank 指标按需获取
│   ├── store/useAppStore.ts        # Zustand 全局状态
│   ├── utils/format.ts             # 数字本地化（万亿/亿/万 vs T/B/M）
│   └── types.ts                    # 数据模型与收入分组逻辑
└── index.html
```

## 已实现（Phase 1）

- 可交互 3D 地球：拖动旋转、滚轮缩放、可开关自转
- 国家边界悬停高亮 + 双语名称提示、选中高亮（琥珀色）
- 点击国家平滑飞至该国视角（按国家面积自适应高度）
- 详情面板：国旗、双语名称与官方全称、首都、地区、面积、人口、语言、货币、GDP（名义 + 人均）、发展程度徽章、政治体制
- GDP 3D 柱状图层：所有国家的最新 GDP 以柱高呈现（sqrt 归一化），颜色按世界银行收入分组，悬停显示数值，可开关
- 国旗图层：国旗直接贴在各国位置（尺寸随国家面积），点击国旗即选中该国，可开关
- 中英文切换：自动检测浏览器语言、localStorage 记忆、面板内容同步切换
- 响应式：桌面右侧面板 / 移动端底部抽屉
- 返回地球总览按钮

## 部署（Vercel）

仓库已含 `vercel.json`（静态资源缓存头）。两种方式：

1. **推荐**：在 [vercel.com/new](https://vercel.com/new) 导入 GitHub 仓库 `tan-zhuo/earth`，框架自动识别为 Vite，直接 Deploy。之后每次 push 自动部署。
2. CLI：`npx vercel login && npx vercel --prod`。

已接入 **Vercel Analytics**（访问量）与 **Speed Insights**（Core Web Vitals），部署后在 Vercel 项目的 Analytics / Speed Insights 标签页启用即可看到数据（免费额度够用），本地开发不上报。

> 部署后把 `index.html`、`public/robots.txt`、`public/sitemap.xml` 中的占位域名 `earth-tan-zhuo.vercel.app` 替换为实际分配的域名。

## SEO

- 完整 meta：description / keywords / canonical / Open Graph / Twitter Card / theme-color
- `og.png` 分享图、`robots.txt`、`sitemap.xml`（含 zh-CN / en hreflang）
- Schema.org WebApplication 结构化数据（JSON-LD）
- 标题与 `<html lang>` 随语言、选中国家动态更新（如「中国 - Earth · 3D 互动地球」）
- `<noscript>` 双语降级文案

## 后续计划

- Phase 2：国家搜索、国歌播放（或占位外链）、主要出口商品与资源模块
- Phase 3：历史时间线、文化亮点、知名建筑、图表可视化、多国对比
