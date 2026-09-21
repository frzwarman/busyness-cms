import { useCallback, useEffect, useState } from 'react';

const KEY = 'siteos:studio-theme';

/** Studio dark mode. Independent from the public site theme by design. */
export function useStudioTheme() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    try {
      localStorage.setItem(KEY, dark ? 'dark' : 'light');
    } catch {}
  }, [dark]);
  return { dark, toggle: useCallback(() => setDark((d) => !d), []) };
}
