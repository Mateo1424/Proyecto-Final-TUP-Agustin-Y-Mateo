import { useCallback } from 'react';
import { useLocation as useWouterLocation, useParams as useWouterParams } from 'wouter';
export function useNavigate() { const [, navigate] = useWouterLocation(); return useCallback((target, options) => typeof target === 'number' ? window.history.go(target) : navigate(target, options), [navigate]); }
export function useLocation() { const [pathname] = useWouterLocation(); return { pathname }; }
export const useParams = useWouterParams;
export function useSearchParams() { const [path, navigate] = useWouterLocation(); const query = typeof window === 'undefined' ? '' : window.location.search; return [new URLSearchParams(query), value => navigate(`${path}?${new URLSearchParams(value)}`)]; }
