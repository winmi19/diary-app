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
