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
    if (err instanceof diaryService.ValidationError) {
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
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof diaryService.ValidationError) {
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
    if (err instanceof diaryService.ValidationError) {
      res.status(400).json({ error: err.message });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

module.exports = router;
