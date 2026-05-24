import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Timeline from '../components/Timeline';
import SettingsPanel from '../components/SettingsPanel';
import { fetchDates } from '../api';

function TimelinePage() {
  const [dates, setDates] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [configured, setConfigured] = useState(true);

  const loadDates = async () => {
    try {
      const data = await fetchDates();
      setDates(data.dates || []);
    } catch (err) {
      setConfigured(false);
      setSettingsOpen(true);
    }
  };

  useEffect(() => {
    loadDates();
  }, []);

  return (
    <div>
      <Header onOpenSettings={() => setSettingsOpen(true)} />
      {!configured && (
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', marginTop: '40px' }}>
          请先设置日记保存目录
        </p>
      )}
      <Timeline dates={dates} />
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSaved={() => {
          setConfigured(true);
          loadDates();
        }}
      />
    </div>
  );
}

export default TimelinePage;
