# 日记 Web 应用 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个毛玻璃风格的 Web 日记应用，横向时间轴浏览，Markdown 编辑器写日记，本地文件存储。

**Architecture:** React 前端 + Express 后端。前端两个页面（时间轴主页 + 编辑器），后端六个 REST API 读写本地 .md 文件。开发时 React dev server 通过 proxy 转发 API 请求到 Express。

**Tech Stack:** React 18, React Router 6, Express 4, react-markdown, remark-gfm

---

## 文件结构

```
diary-app/
├── package.json              — 根 package.json，启动前后端
├── .gitignore
├── server/
│   ├── index.js              — Express 入口
│   ├── routes/
│   │   ├── diaries.js        — 日记 CRUD 路由
│   │   └── config.js         — 配置路由
│   └── services/
│       ├── diaryService.js   — 日记文件读写
│       └── configService.js  — 配置文件读写
└── client/
    ├── public/index.html
    ├── package.json
    └── src/
        ├── index.js
        ├── App.js
        ├── App.css
        ├── api.js            — API 请求封装
        ├── pages/
        │   ├── TimelinePage.js
        │   ├── TimelinePage.css
        │   ├── EditorPage.js
        │   └── EditorPage.css
        └── components/
            ├── Header.js
            ├── Timeline.js
            ├── Timeline.css
            ├── DateDot.js
            ├── SettingsPanel.js
            ├── SettingsPanel.css
            └── Toolbar.js
```

---

### Task 1: 初始化项目结构

**Files:**
- Create: `diary-app/package.json`
- Create: `diary-app/.gitignore`
- Create: `diary-app/server/index.js`

- [ ] **Step 1: 创建根 package.json**

```bash
cd /home/xuwenmin/diary-app
npm init -y
```

- [ ] **Step 2: 安装后端依赖**

```bash
cd /home/xuwenmin/diary-app
npm install express cors
```

- [ ] **Step 3: 创建 .gitignore**

```
node_modules/
client/build/
.superpowers/
```

- [ ] **Step 4: 创建最小 Express 服务器**

```javascript
// server/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **Step 5: 添加 scripts 到 package.json**

在 `package.json` 中添加：
```json
"scripts": {
  "server": "node server/index.js",
  "client": "cd client && npm start",
  "dev": "node server/index.js & cd client && npm start"
}
```

- [ ] **Step 6: 验证后端启动**

```bash
node server/index.js
# 应输出: Server running on http://localhost:3001
# Ctrl+C 停止
```

- [ ] **Step 7: 初始化 Git 并提交**

```bash
cd /home/xuwenmin/diary-app
git init
git add -A
git commit -m "feat: initialize project with Express server"
```

---

### Task 2: 实现日记文件读写服务

**Files:**
- Create: `diary-app/server/services/diaryService.js`
- Create: `diary-app/server/services/configService.js`

- [ ] **Step 1: 实现配置服务**

```javascript
// server/services/configService.js
const fs = require('fs');
const path = require('path');
const os = require('os');

const CONFIG_PATH = path.join(os.homedir(), '.diary-config.json');

function getConfig() {
  if (!fs.existsSync(CONFIG_PATH)) {
    return { storageDir: '' };
  }
  const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
  return JSON.parse(raw);
}

function setConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

module.exports = { getConfig, setConfig };
```

- [ ] **Step 2: 实现日记服务**

```javascript
// server/services/diaryService.js
const fs = require('fs');
const path = require('path');
const { getConfig } = require('./configService');

function getStorageDir() {
  const config = getConfig();
  if (!config.storageDir) {
    throw new Error('Storage directory not configured');
  }
  return config.storageDir;
}

function validateDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }
}

function safePath(storageDir, filename) {
  const fullPath = path.resolve(storageDir, filename);
  const resolvedBase = path.resolve(storageDir);
  if (!fullPath.startsWith(resolvedBase + path.sep) && fullPath !== resolvedBase) {
    throw new Error('Path traversal detected');
  }
  return fullPath;
}

function listDiaries() {
  const storageDir = getStorageDir();
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
    return [];
  }
  const files = fs.readdirSync(storageDir);
  return files
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

function getDiary(dateStr) {
  validateDate(dateStr);
  const storageDir = getStorageDir();
  const filePath = safePath(storageDir, `${dateStr}.md`);
  if (!fs.existsSync(filePath)) {
    return { date: dateStr, content: '' };
  }
  return {
    date: dateStr,
    content: fs.readFileSync(filePath, 'utf-8')
  };
}

function saveDiary(dateStr, content) {
  validateDate(dateStr);
  const storageDir = getStorageDir();
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  const filePath = safePath(storageDir, `${dateStr}.md`);
  fs.writeFileSync(filePath, content, 'utf-8');
  return { date: dateStr, saved: true };
}

function deleteDiary(dateStr) {
  validateDate(dateStr);
  const storageDir = getStorageDir();
  const filePath = safePath(storageDir, `${dateStr}.md`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  return { date: dateStr, deleted: true };
}

module.exports = { listDiaries, getDiary, saveDiary, deleteDiary };
```

- [ ] **Step 3: 提交**

```bash
git add -A
git commit -m "feat: add diary and config service layers"
```

---

### Task 3: 实现后端 API 路由

**Files:**
- Create: `diary-app/server/routes/diaries.js`
- Create: `diary-app/server/routes/config.js`
- Modify: `diary-app/server/index.js`

- [ ] **Step 1: 创建日记路由**

```javascript
// server/routes/diaries.js
const express = require('express');
const router = express.Router();
const diaryService = require('../services/diaryService');

router.get('/', (req, res) => {
  try {
    const dates = diaryService.listDiaries();
    res.json({ dates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:date', (req, res) => {
  try {
    const diary = diaryService.getDiary(req.params.date);
    res.json(diary);
  } catch (err) {
    if (err.message.includes('Invalid date')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

router.post('/', (req, res) => {
  try {
    const { date, content } = req.body;
    if (!date || content === undefined) {
      return res.status(400).json({ error: 'date and content are required' });
    }
    const result = diaryService.saveDiary(date, content);
    res.json(result);
  } catch (err) {
    if (err.message.includes('Invalid date') || err.message.includes('Path traversal')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

router.delete('/:date', (req, res) => {
  try {
    const result = diaryService.deleteDiary(req.params.date);
    res.json(result);
  } catch (err) {
    if (err.message.includes('Invalid date')) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

module.exports = router;
```

- [ ] **Step 2: 创建配置路由**

```javascript
// server/routes/config.js
const express = require('express');
const router = express.Router();
const configService = require('../services/configService');

router.get('/', (req, res) => {
  try {
    const config = configService.getConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', (req, res) => {
  try {
    const { storageDir } = req.body;
    if (!storageDir) {
      return res.status(400).json({ error: 'storageDir is required' });
    }
    configService.setConfig({ storageDir });
    res.json({ storageDir });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

- [ ] **Step 3: 更新 server/index.js 挂载路由**

```javascript
// server/index.js
const express = require('express');
const cors = require('cors');
const diariesRouter = require('./routes/diaries');
const configRouter = require('./routes/config');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/diaries', diariesRouter);
app.use('/api/config', configRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **Step 4: 验证 API 可用**

```bash
# 启动服务器
node server/index.js &

# 先设置存储目录
curl -X PUT http://localhost:3001/api/config \
  -H "Content-Type: application/json" \
  -d '{"storageDir": "/tmp/test-diary"}'

# 保存一篇日记
curl -X POST http://localhost:3001/api/diaries \
  -H "Content-Type: application/json" \
  -d '{"date": "2026-05-24", "content": "# Hello\n测试日记"}'

# 获取日记列表
curl http://localhost:3001/api/diaries
# 预期: {"dates":["2026-05-24"]}

# 读取日记
curl http://localhost:3001/api/diaries/2026-05-24
# 预期: {"date":"2026-05-24","content":"# Hello\n测试日记"}

# 停止服务器
kill %1
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: add diary and config API routes"
```

---

### Task 4: 搭建 React 前端项目

**Files:**
- Create: React app via create-react-app

- [ ] **Step 1: 使用 create-react-app 初始化**

```bash
cd /home/xuwenmin/diary-app
npx create-react-app client
```

- [ ] **Step 2: 安装前端依赖**

```bash
cd /home/xuwenmin/diary-app/client
npm install react-router-dom react-markdown remark-gfm
```

- [ ] **Step 3: 配置 proxy 转发 API 请求**

在 `client/package.json` 中添加：
```json
"proxy": "http://localhost:3001"
```

- [ ] **Step 4: 创建 API 请求封装**

```javascript
// client/src/api.js
const BASE = '/api';

export async function fetchDates() {
  const res = await fetch(`${BASE}/diaries`);
  if (!res.ok) throw new Error('Failed to fetch dates');
  return res.json();
}

export async function fetchDiary(date) {
  const res = await fetch(`${BASE}/diaries/${date}`);
  if (!res.ok) throw new Error('Failed to fetch diary');
  return res.json();
}

export async function saveDiary(date, content) {
  const res = await fetch(`${BASE}/diaries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, content })
  });
  if (!res.ok) throw new Error('Failed to save diary');
  return res.json();
}

export async function deleteDiary(date) {
  const res = await fetch(`${BASE}/diaries/${date}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete diary');
  return res.json();
}

export async function fetchConfig() {
  const res = await fetch(`${BASE}/config`);
  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json();
}

export async function updateConfig(storageDir) {
  const res = await fetch(`${BASE}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storageDir })
  });
  if (!res.ok) throw new Error('Failed to update config');
  return res.json();
}
```

- [ ] **Step 5: 清理默认文件**

```bash
cd /home/xuwenmin/diary-app/client/src
rm App.test.js logo.svg setupTests.js reportWebVitals.js
```

- [ ] **Step 6: 提交**

```bash
cd /home/xuwenmin/diary-app
git add -A
git commit -m "feat: bootstrap React app with dependencies and API layer"
```

---

### Task 5: 实现时间轴主页

**Files:**
- Create: `client/src/App.js`
- Create: `client/src/App.css`
- Create: `client/src/pages/TimelinePage.js`
- Create: `client/src/pages/TimelinePage.css`
- Create: `client/src/components/Header.js`
- Create: `client/src/components/Timeline.js`
- Create: `client/src/components/Timeline.css`
- Create: `client/src/components/DateDot.js`
- Create: `client/src/components/SettingsPanel.js`
- Create: `client/src/components/SettingsPanel.css`
- Modify: `client/src/index.js`

- [ ] **Step 1: 更新 index.js**

```javascript
// client/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 2: 创建 App.js 带路由**

```javascript
// client/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TimelinePage from './pages/TimelinePage';
import EditorPage from './pages/EditorPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TimelinePage />} />
        <Route path="/write/:date" element={<EditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

- [ ] **Step 3: 创建 App.css 全局样式**

```css
/* client/src/App.css */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Microsoft YaHei', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
```

- [ ] **Step 4: 创建 Header 组件**

```javascript
// client/src/components/Header.js
import React from 'react';

function Header({ onOpenSettings }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 32px'
    }}>
      <h1 style={{ color: 'white', fontSize: '22px', fontWeight: 600 }}>📔 我的日记</h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onOpenSettings}
          style={{
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '8px 18px',
            borderRadius: '20px',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          ⚙ 设置
        </button>
        <button
          onClick={() => {
            const today = new Date().toISOString().slice(0, 10);
            window.location.href = `/write/${today}`;
          }}
          style={{
            background: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            color: 'white',
            padding: '8px 22px',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          + 写日记
        </button>
      </div>
    </div>
  );
}

export default Header;
```

- [ ] **Step 5: 创建 DateDot 组件**

```javascript
// client/src/components/DateDot.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return {
    day: d.getDate(),
    month: d.getMonth() + 1 + '月'
  };
}

function DateDot({ dateStr, hasDiary }) {
  const navigate = useNavigate();
  const { day, month } = formatDate(dateStr);
  const today = new Date().toISOString().slice(0, 10);
  const isToday = dateStr === today;

  const dotStyle = isToday
    ? {
        width: '56px',
        height: '56px',
        background: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#764ba2',
        fontWeight: 'bold',
        fontSize: '16px',
        boxShadow: '0 0 24px rgba(255,255,255,0.6)',
        cursor: 'pointer',
        transition: 'transform 0.2s'
      }
    : hasDiary
    ? {
        width: '48px',
        height: '48px',
        background: 'rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '14px',
        cursor: 'pointer',
        transition: 'transform 0.2s'
      }
    : {
        width: '48px',
        height: '48px',
        border: '2px dashed rgba(255,255,255,0.3)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.4)',
        fontSize: '20px',
        cursor: 'pointer',
        transition: 'transform 0.2s'
      };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '0 16px',
        flexShrink: 0
      }}
    >
      <div
        style={dotStyle}
        onClick={() => navigate(`/write/${dateStr}`)}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {hasDiary || isToday ? day : '+'}
      </div>
      <span style={{
        color: isToday ? 'white' : 'rgba(255,255,255,0.7)',
        fontSize: '11px',
        marginTop: '6px'
      }}>
        {isToday ? '今天' : month}
      </span>
    </div>
  );
}

export default DateDot;
```

- [ ] **Step 6: 创建 Timeline 组件**

```javascript
// client/src/components/Timeline.js
import React, { useEffect, useState } from 'react';
import DateDot from './DateDot';

function generateDateRange(dates) {
  if (dates.length === 0) return [];
  const sorted = dates.sort();
  const start = new Date(sorted[0]);
  const end = new Date(sorted[sorted.length - 1]);
  const range = [];
  const current = new Date(start);
  while (current <= end) {
    range.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return range;
}

function Timeline({ dates }) {
  const [allDates, setAllDates] = useState([]);
  const dateSet = new Set(dates);

  useEffect(() => {
    // If there are diary dates, show range from first to last
    // If none, show just today
    let range;
    if (dates.length > 0) {
      range = generateDateRange(dates);
      // Add future dates up to +7 days from today
      const today = new Date().toISOString().slice(0, 10);
      const lastDate = range[range.length - 1] || today;
      const end = new Date();
      end.setDate(end.getDate() + 7);
      let current = new Date(lastDate);
      current.setDate(current.getDate() + 1);
      while (current <= end) {
        range.push(current.toISOString().slice(0, 10));
        current.setDate(current.getDate() + 1);
      }
    } else {
      const today = new Date().toISOString().slice(0, 10);
      range = [today];
    }
    setAllDates(range);
  }, [dates]);

  return (
    <div style={{
      padding: '20px 24px 30px',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      WebkitOverflowScrolling: 'touch'
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        {allDates.map((dateStr, i) => (
          <React.Fragment key={dateStr}>
            {i > 0 && (
              <div style={{
                width: '30px',
                height: '2px',
                background: 'rgba(255,255,255,0.2)',
                flexShrink: 0
              }} />
            )}
            <DateDot dateStr={dateStr} hasDiary={dateSet.has(dateStr)} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
```

- [ ] **Step 7: 创建 SettingsPanel 组件**

```javascript
// client/src/components/SettingsPanel.js
import React, { useState, useEffect } from 'react';
import { fetchConfig, updateConfig } from '../api';

function SettingsPanel({ isOpen, onClose, onSaved }) {
  const [dir, setDir] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchConfig().then(c => setDir(c.storageDir || '')).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    try {
      await updateConfig(dir);
      onSaved();
      onClose();
    } catch (err) {
      alert('保存失败: ' + err.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '28px',
        width: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ marginBottom: '20px', fontSize: '16px' }}>设置</h3>

        <label style={{ fontSize: '13px', fontWeight: 600, color: '#333', display: 'block', marginBottom: '6px' }}>
          日记保存目录
        </label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
          <input
            value={dir}
            onChange={e => setDir(e.target.value)}
            placeholder="例如: /home/user/我的日记"
            style={{
              flex: 1,
              border: '1px solid #ddd',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              background: '#f9f9f9'
            }}
          />
        </div>
        <p style={{ color: '#999', fontSize: '11px', marginBottom: '20px' }}>
          日记文件将以 YYYY-MM-DD.md 格式保存在此目录
        </p>

        <div style={{ borderTop: '1px solid #eee', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{
              background: '#eee',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            取消
          </button>
          <button
            onClick={handleSave}
            style={{
              background: '#667eea',
              color: 'white',
              border: 'none',
              padding: '8px 24px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            保存设置
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
```

- [ ] **Step 8: 创建 TimelinePage 页面**

```javascript
// client/src/pages/TimelinePage.js
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Timeline from '../components/Timeline';
import SettingsPanel from '../components/SettingsPanel';
import { fetchDates, fetchConfig } from '../api';

function TimelinePage() {
  const [dates, setDates] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [configured, setConfigured] = useState(true);

  const loadDates = async () => {
    try {
      const data = await fetchDates();
      setDates(data.dates || []);
    } catch (err) {
      // If storageDir not configured, prompt settings
      setConfigured(false);
      setSettingsOpen(true);
    }
  };

  useEffect(() => {
    loadDates();
  }, []);

  return (
    <div>
      <Header onOpenSettings={() => setSettingsOpen(true)} />
      {!configured && (
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', marginTop: '40px' }}>
          请先设置日记保存目录
        </p>
      )}
      <Timeline dates={dates} />
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => {
          setConfigured(true);
          loadDates();
        }}
      />
    </div>
  );
}

export default TimelinePage;
```

- [ ] **Step 9: 验证前端可启动**

```bash
cd /home/xuwenmin/diary-app
# 终端1: 启动后端
node server/index.js &

# 终端2: 启动前端
cd client && npm start
# 浏览器打开 http://localhost:3000 查看时间轴页面
```

- [ ] **Step 10: 提交**

```bash
git add -A
git commit -m "feat: implement timeline page with settings panel"
```

---

### Task 6: 实现日记编辑器页面

**Files:**
- Create: `client/src/pages/EditorPage.js`
- Create: `client/src/pages/EditorPage.css`
- Create: `client/src/components/Toolbar.js`

- [ ] **Step 1: 创建 Toolbar 组件**

```javascript
// client/src/components/Toolbar.js
import React from 'react';

const tools = [
  { label: 'B', prefix: '**', suffix: '**', title: '加粗' },
  { label: 'I', prefix: '*', suffix: '*', title: '斜体' },
  { label: 'H', prefix: '\n## ', suffix: '', title: '标题' },
  { label: '链接', prefix: '[', suffix: '](url)', title: '链接' },
  { label: '图片', prefix: '![alt](', suffix: ')', title: '图片' },
  { label: '代码', prefix: '\n```\n', suffix: '\n```\n', title: '代码块' },
];

function Toolbar({ textareaRef }) {
  const insert = (prefix, suffix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.substring(start, end);
    const replacement = prefix + selected + suffix;
    el.value = el.value.substring(0, start) + replacement + el.value.substring(end);
    el.focus();
    const newPos = start + prefix.length + selected.length + suffix.length;
    el.setSelectionRange(newPos, newPos);
    // Trigger input event for React state
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '10px 16px',
      background: '#f5f5f5',
      borderBottom: '1px solid #e0e0e0'
    }}>
      {tools.map(t => (
        <button
          key={t.label}
          title={t.title}
          onClick={() => insert(t.prefix, t.suffix)}
          style={{
            border: '1px solid #ddd',
            background: 'white',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer',
            fontWeight: t.label === 'B' ? 'bold' : 'normal',
            fontStyle: t.label === 'I' ? 'italic' : 'normal'
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default Toolbar;
```

- [ ] **Step 2: 创建 EditorPage**

```javascript
// client/src/pages/EditorPage.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Toolbar from '../components/Toolbar';
import { fetchDiary, saveDiary } from '../api';
import './EditorPage.css';

function EditorPage() {
  const { date } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const textareaRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchDiary(date)
      .then(data => {
        setContent(data.content || '');
        setLoading(false);
      })
      .catch(() => {
        setContent('');
        setLoading(false);
      });
  }, [date]);

  const doSave = useCallback(async (text) => {
    try {
      setSaving(true);
      await saveDiary(date, text);
      setSaveMsg('已保存');
      setTimeout(() => setSaveMsg(''), 2000);
    } catch (err) {
      setSaveMsg('保存失败');
    } finally {
      setSaving(false);
    }
  }, [date]);

  const handleChange = (e) => {
    const val = e.target.value;
    setContent(val);
    // 2秒防抖自动保存
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSave(val), 2000);
  };

  // Ctrl+S 手动保存
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (timerRef.current) clearTimeout(timerRef.current);
        doSave(content);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [content, doSave]);

  if (loading) {
    return <div className="editor-loading">加载中...</div>;
  }

  return (
    <div className="editor-page">
      <div className="editor-header">
        <button className="back-btn" onClick={() => navigate('/')}>← 返回</button>
        <span className="editor-date">{date}</span>
        <span className={`save-status ${saveMsg === '保存失败' ? 'error' : ''}`}>
          {saveMsg || (saving ? '保存中...' : '')}
        </span>
      </div>

      <Toolbar textareaRef={textareaRef} />

      <div className="editor-main">
        <div className="editor-input-pane">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            placeholder="开始写日记..."
            className="editor-textarea"
          />
        </div>
        <div className="editor-preview-pane">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {content || '*暂无内容*'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default EditorPage;
```

- [ ] **Step 3: 创建 EditorPage.css**

```css
/* client/src/pages/EditorPage.css */
.editor-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
}

.editor-loading {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #999;
}

.editor-header {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: white;
  border-bottom: 1px solid #eee;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  cursor: pointer;
}

.editor-date {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.save-status {
  margin-left: auto;
  font-size: 12px;
  color: #999;
}

.save-status.error {
  color: #e53e3e;
}

.editor-main {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.editor-input-pane {
  flex: 1;
  border-right: 1px solid #e0e0e0;
}

.editor-textarea {
  width: 100%;
  height: 100%;
  border: none;
  padding: 20px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 14px;
  line-height: 1.8;
  resize: none;
  outline: none;
}

.editor-preview-pane {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  line-height: 1.8;
  color: #333;
}

.editor-preview-pane h1,
.editor-preview-pane h2,
.editor-preview-pane h3 {
  margin: 12px 0 8px;
}

.editor-preview-pane p {
  margin: 6px 0;
}

.editor-preview-pane ul,
.editor-preview-pane ol {
  padding-left: 20px;
}

.editor-preview-pane code {
  background: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

.editor-preview-pane pre {
  background: #1e1e2e;
  color: #cdd6f4;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.editor-preview-pane pre code {
  background: none;
  color: inherit;
  padding: 0;
}
```

- [ ] **Step 4: 验证编辑器**

```bash
cd /home/xuwenmin/diary-app
# 确保后端运行中
node server/index.js &
# 启动前端
cd client && npm start
# 浏览器打开 http://localhost:3000/write/2026-05-24
# 输入一些 Markdown 内容，查看预览，测试 Ctrl+S 保存
```

- [ ] **Step 5: 提交**

```bash
git add -A
git commit -m "feat: implement markdown editor page with split view"
```

---

### Task 7: 生产构建与集成验证

- [ ] **Step 1: 构建前端**

```bash
cd /home/xuwenmin/diary-app/client
npm run build
```

- [ ] **Step 2: 更新后端托管静态文件**

在 `server/index.js` 中添加（放在 `app.use('/api/config', configRouter);` 之后）：

```javascript
// 托管 React 构建产物
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});
```

- [ ] **Step 3: 完整验证**

```bash
# 只用后端服务器
node server/index.js
# 浏览器打开 http://localhost:3001
# 验证：时间轴页面正常显示 → 设置目录 → 写日记 → 保存 → 返回时间轴看到新圆点
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: add production build serving"
```

---

### Task 8: 清理可视化辅助服务

- [ ] **Step 1: 停止可视化服务**

```bash
/home/xuwenmin/.claude/plugins/cache/claude-plugins-official/superpowers/5.1.0/skills/brainstorming/scripts/stop-server.sh /home/xuwenmin/.superpowers/brainstorm/29594-1779618630
```

---

## 验证清单

实现完成后，逐项验证：

- [ ] `npm run server` 后端启动成功
- [ ] `npm run client` 前端启动成功
- [ ] 时间轴页面显示正常（毛玻璃渐变背景 + 日期圆点）
- [ ] 设置面板可打开、输入目录、保存
- [ ] 点击日期圆点进入编辑器
- [ ] Markdown 输入左边，实时预览右边
- [ ] 工具栏按钮正常工作
- [ ] Ctrl+S 手动保存，2秒自动保存
- [ ] 保存后返回时间轴，对应日期圆点变为实心
