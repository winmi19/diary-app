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
