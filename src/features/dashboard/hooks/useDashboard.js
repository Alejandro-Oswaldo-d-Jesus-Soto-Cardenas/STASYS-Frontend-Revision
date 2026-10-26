import { useEffect, useState } from 'react';
import { loadDashboard } from '../api/loadDashboard.js';

export default function useDashboard() {
  const [result, setResult] = useState({ status: 'loading', data: null, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    loadDashboard(controller.signal).then((data) => {
      if (!controller.signal.aborted) setResult({ status: data ? 'success' : 'empty', data, error: null });
    }).catch((error) => {
      if (!controller.signal.aborted) setResult({ status: 'error', data: null, error: error.message });
    });
    return () => controller.abort();
  }, [attempt]);
  return { ...result, retry: () => {
    setResult({ status: 'loading', data: null, error: null });
    setAttempt((value) => value + 1);
  } };
}
