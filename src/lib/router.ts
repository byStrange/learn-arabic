import { useEffect, useState } from 'react';

export type Route =
  | { name: 'today' }
  | { name: 'onboarding' }
  | { name: 'session'; kind: 'daily' | 'mini' | 'reviews' | 'practice'; lessonId?: string }
  | { name: 'path' }
  | { name: 'lesson'; id: string }
  | { name: 'read'; surah?: number }
  | { name: 'progress' };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#\/?/, '').split('?')[0];
  const parts = path.split('/').filter(Boolean);
  switch (parts[0]) {
    case 'onboarding':
      return { name: 'onboarding' };
    case 'session':
      if (parts[1] === 'mini') return { name: 'session', kind: 'mini' };
      if (parts[1] === 'reviews') return { name: 'session', kind: 'reviews' };
      if (parts[1] === 'practice' && parts[2]) return { name: 'session', kind: 'practice', lessonId: parts[2] };
      return { name: 'session', kind: 'daily' };
    case 'path':
      return { name: 'path' };
    case 'lesson':
      return parts[1] ? { name: 'lesson', id: parts[1] } : { name: 'path' };
    case 'read':
      return { name: 'read', surah: parts[1] && /^\d+$/.test(parts[1]) ? Number(parts[1]) : undefined };
    case 'progress':
      return { name: 'progress' };
    default:
      return { name: 'today' };
  }
}

export function useRoute(): { route: Route; hash: string } {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return { route: parseHash(hash), hash };
}

export function navigate(path: string): void {
  window.location.hash = path.startsWith('#') ? path : `#${path}`;
}
