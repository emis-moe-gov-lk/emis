const THEME_KEY = 'theme';
let mq = null;
let boundHandler = null;
const systemListeners = new Set();

function prefersDark() {
  try {
    return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  } catch (e) {
    return false;
  }
}

function applyThemeClass(theme) {
  const root = document.documentElement;
  if (!root) return;

  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    if (prefersDark()) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }
}

function ensureMq() {
  if (mq) return;
  if (typeof window === 'undefined' || !window.matchMedia) return;
  mq = window.matchMedia('(prefers-color-scheme: dark)');
  boundHandler = (e) => {
    try {
      // update applied classes
      applyThemeClass('system');
      // notify subscribers with boolean (isDark)
      const isDark = e && typeof e.matches === 'boolean' ? e.matches : mq.matches;
      systemListeners.forEach((cb) => {
        try { cb(isDark); } catch (err) { /* ignore */ }
      });
    } catch (err) { /* ignore */ }
  };

  if (mq.addEventListener) mq.addEventListener('change', boundHandler);
  else if (mq.addListener) mq.addListener(boundHandler);
}

export function getTheme() {
  try {
    return localStorage.getItem(THEME_KEY) || 'system';
  } catch (e) {
    return 'system';
  }
}

export function initTheme() {
  try {
    const theme = getTheme();
    applyThemeClass(theme);
    if (theme === 'system') ensureMq();
  } catch (e) { /* ignore */ }
}

export function setTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) { /* ignore */ }

  try {
    applyThemeClass(theme);
    if (theme === 'system') ensureMq();
    else if (mq) {
      if (mq.removeEventListener) mq.removeEventListener('change', boundHandler);
      else if (mq.removeListener) mq.removeListener(boundHandler);
      mq = null;
      boundHandler = null;
    }
  } catch (e) { /* ignore */ }
}

export function onSystemChange(cb) {
  if (typeof cb !== 'function') return;
  systemListeners.add(cb);
  ensureMq();
}

export function offSystemChange(cb) {
  systemListeners.delete(cb);
  if (systemListeners.size === 0 && mq) {
    if (mq.removeEventListener) mq.removeEventListener('change', boundHandler);
    else if (mq.removeListener) mq.removeListener(boundHandler);
    mq = null;
    boundHandler = null;
  }
}

export default {
  initTheme,
  getTheme,
  setTheme,
  onSystemChange,
  offSystemChange,
};
