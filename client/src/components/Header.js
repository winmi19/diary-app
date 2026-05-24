import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ onOpenSettings }) {
  const navigate = useNavigate();
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
            navigate(`/write/${today}`);
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
