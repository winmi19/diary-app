const BASE = '/api';

export async function fetchDates() {
  const res = await fetch(`${BASE}/diaries`);
  if (!res.ok) throw new Error('Failed to fetch dates');
  return res.json();
}

export async function fetchDiary(date) {
  const res = await fetch(`${BASE}/diaries/${date}`);
  if (!res.ok) throw new Error('Failed to fetch diary');
  return res.json();
}

export async function saveDiary(date, content) {
  const res = await fetch(`${BASE}/diaries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, content })
  });
  if (!res.ok) throw new Error('Failed to save diary');
  return res.json();
}

export async function deleteDiary(date) {
  const res = await fetch(`${BASE}/diaries/${date}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete diary');
  return res.json();
}

export async function fetchConfig() {
  const res = await fetch(`${BASE}/config`);
  if (!res.ok) throw new Error('Failed to fetch config');
  return res.json();
}

export async function updateConfig(storageDir) {
  const res = await fetch(`${BASE}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storageDir })
  });
  if (!res.ok) throw new Error('Failed to update config');
  return res.json();
}
