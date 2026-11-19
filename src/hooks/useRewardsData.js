import { useEffect, useRef, useState, useCallback } from 'react';
import { isAborted } from '../api/client.js';
import { redemptionErrorMessage } from '../utils/redemptionErrors.js';

export default function useRewardsData(loader, page = 1) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [revision, setRevision] = useState(0);
  const sequence = useRef(0);
  const reload = useCallback(() => setRevision(value => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    const current = ++sequence.current;
    Promise.resolve().then(() => {
      if (!controller.signal.aborted) setState({ data: null, loading: true, error: '' });
      return loader(page, controller.signal);
    }).then(data => {
      if (!controller.signal.aborted && current === sequence.current) setState({ data, loading: false, error: '' });
    }).catch(error => {
      if (!controller.signal.aborted && current === sequence.current && !isAborted(error)) setState({ data: null, loading: false, error: redemptionErrorMessage(error) });
    });
    return () => { controller.abort(); };
  }, [loader, page, revision]);
  return { ...state, reload };
}
