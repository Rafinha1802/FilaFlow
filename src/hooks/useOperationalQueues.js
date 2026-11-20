import { useEffect, useState } from 'react';
import { fetchMyQueues } from '../services/api';

export function useOperationalQueues(token) {
  const [catalog, setCatalog] = useState({ token: null, queues: [], error: '', loading: false });
  const [selection, setSelection] = useState({ token: null, id: '' });

  useEffect(() => {
    let active = true;
    if (!token) {
      setCatalog({ token: null, queues: [], error: '', loading: false });
      setSelection({ token: null, id: '' });
      return () => { active = false; };
    }
    setCatalog({ token, queues: [], error: '', loading: true });
    fetchMyQueues().then((queues) => {
      if (active) setCatalog({ token, queues, error: '', loading: false });
    }).catch((error) => {
      if (active) setCatalog({ token, queues: [], error: error.message, loading: false });
    });
    return () => { active = false; };
  }, [token]);

  const queues = token && catalog.token === token ? catalog.queues : [];
  const selected = queues.find((queue) => selection.token === token && queue.id === selection.id) || queues[0] || null;

  return {
    queues,
    selected,
    loading: Boolean(token) && (catalog.token !== token || catalog.loading),
    error: catalog.token === token ? catalog.error : '',
    selectQueue: (id) => setSelection({ token, id }),
  };
}
