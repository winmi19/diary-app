# 日记 Web 应用 — 设计文档

## 概述

一个 Web 端日记应用，主页为横向时间轴，点击日期圆点进入 Markdown 编辑器，数据以本地文件形式存储。

## 视觉风格

- 毛玻璃现代风格（渐变背景 + 毛玻璃卡片 + 发光圆点）
- 编辑器页面使用纯白背景，专注写作

## 技术栈

- **前端**：React（React Router 路由管理）
- **后端**：Node.js + Express
- **Markdown 编辑**：react-markdown（预览）+ 自定义工具栏
- **存储**：本地 Markdown 文件（`YYYY-MM-DD.md`）

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 时间轴主页 | 横向滚动，显示所有日期圆点 |
| `/write/:date` | 日记编辑器 | 左右分栏：Markdown 编辑 + 实时预览 |
| `/write/new` | 新建日记 | 自动填入当天日期 |

## 组件树

```
App
├── TimelinePage (/)
│   ├── Header (标题 + 设置按钮 + 写日记按钮)
│   ├── Timeline (横向滚动日期圆点)
│   │   └── DateDot (每个日期圆点，有日记=实心，无日记=虚线，今天=高亮发光)
│   └── SettingsPanel (设置面板，配置存储目录)
│
└── EditorPage (/write/:date)
    ├── Toolbar (加粗、斜体、标题、链接、图片、代码)
    ├── Editor (Markdown 编辑区)
    └── Preview (实时预览区)
```

## API 设计

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/diaries` | 返回所有有日记的日期列表 |
| `GET` | `/api/diaries/:date` | 读取指定日期的日记内容 |
| `POST` | `/api/diaries` | 保存日记（body: `{ date, content }`） |
| `DELETE` | `/api/diaries/:date` | 删除指定日期日记 |
| `GET` | `/api/config` | 获取当前配置 |
| `PUT` | `/api/config` | 更新配置（存储目录） |

## 数据流

```
时间轴页面 → GET /api/diaries → 返回日期列表 → 渲染圆点
点击圆点 → /write/2024-05-24 → GET /api/diaries/2024-05-24 → 加载内容
编辑内容 → 自动保存(2秒防抖) → POST /api/diaries → 写入 .md 文件
```

## 存储

- 日记文件以 `YYYY-MM-DD.md` 格式保存在用户设置的目录中
- 默认目录：首次启动时由用户在设置面板中指定
- 配置信息存储在 `~/.diary-config.json` 中

## 安全

- 后端路径校验：只允许读写用户配置的存储目录，拒绝路径遍历攻击（如 `../`）
- 无用户认证（本地单用户使用）

## 错误处理

- 请求不存在的日记 → 返回空内容，编辑器显示空白页
- 保存失败 → 前端提示"保存失败"，内容保留在编辑区不丢失
- 后端只响应 `/api/` 前缀的请求，其他返回 404
