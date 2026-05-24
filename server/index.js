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
