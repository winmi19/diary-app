import React, { useEffect, useState } from 'react';
import DateDot from './DateDot';

function generateDateRange(dates) {
  if (dates.length === 0) return [];
  const sorted = [...dates].sort();
  const start = new Date(sorted[0]);
  const end = new Date(sorted[sorted.length - 1]);
  const range = [];
  const current = new Date(start);
  while (current <= end) {
    range.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }
  return range;
}

function Timeline({ dates }) {
  const [allDates, setAllDates] = useState([]);
  const dateSet = new Set(dates);

  useEffect(() => {
    let range;
    if (dates.length > 0) {
      range = generateDateRange(dates);
      const lastDate = range[range.length - 1] || new Date().toISOString().slice(0, 10);
      const end = new Date();
      end.setDate(end.getDate() + 7);
      let current = new Date(lastDate);
      current.setDate(current.getDate() + 1);
      while (current <= end) {
        range.push(current.toISOString().slice(0, 10));
        current.setDate(current.getDate() + 1);
      }
    } else {
      const today = new Date().toISOString().slice(0, 10);
      range = [today];
    }
    setAllDates(range);
  }, [dates]);

  return (
    <div style={{
      padding: '20px 24px 30px',
      overflowX: 'auto',
      whiteSpace: 'nowrap',
      WebkitOverflowScrolling: 'touch'
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'center' }}>
        {allDates.map((dateStr, i) => (
          <React.Fragment key={dateStr}>
            {i > 0 && (
              <div style={{
                width: '30px',
                height: '2px',
                background: 'rgba(255,255,255,0.2)',
                flexShrink: 0
              }} />
            )}
            <DateDot dateStr={dateStr} hasDiary={dateSet.has(dateStr)} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
