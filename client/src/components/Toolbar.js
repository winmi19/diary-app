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
