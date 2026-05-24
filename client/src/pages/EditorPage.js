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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

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
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doSave(val), 2000);
  };

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
