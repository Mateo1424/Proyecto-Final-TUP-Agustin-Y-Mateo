import { useCallback, useEffect, useState } from 'react';
import { isAborted } from '../api/client.js';

// Sequence identity also protects against transports that ignore AbortSignal.
export function createEloRequest() {
  let current;
  return {
    async run(load, publish) {
      current?.abort();
      const controller = new AbortController();
      current = controller;
      await Promise.resolve();
      if (controller.signal.aborted) return;
      publish({ data: null, loading: true, error: '' });
      try {
        const data = await load(controller.signal);
        if (current === controller && !controller.signal.aborted) publish({ data, loading: false, error: '' });
      } catch (error) {
        if (current === controller && !controller.signal.aborted && !isAborted(error)) publish({ data: null, loading: false, error: error.message || 'No se pudo cargar la clasificación.' });
      }
    },
    cancel() { current?.abort(); },
  };
}

export function useEloRequest(load, key) {
  const [request] = useState(createEloRequest);
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState({ key: '', data: null, loading: true, error: '' });
  const requestKey = `${key}:${revision}`;
  const refresh = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    const pending = request;
    pending.run(load, value => setState({ ...value, key: requestKey }));
    return () => pending.cancel();
  }, [load, requestKey, request]);
  useEffect(() => {
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [refresh]);
  return { ...(state.key === requestKey ? state : { data: null, loading: true, error: '' }), refresh };
}
