const express = require('express');
const cors = require('cors');
const path = require('path');
const diariesRouter = require('./routes/diaries');
const configRouter = require('./routes/config');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/diaries', diariesRouter);
app.use('/api/config', configRouter);

// 托管 React 构建产物
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
