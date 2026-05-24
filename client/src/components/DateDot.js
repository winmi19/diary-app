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
