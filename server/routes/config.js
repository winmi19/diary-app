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
    if (!storageDir || typeof storageDir !== 'string') {
      return res.status(400).json({ error: 'storageDir is required and must be a string' });
    }
    configService.setConfig({ storageDir });
    const config = configService.getConfig();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
