(() => {
  let theme = 'dark';
  try { theme = localStorage.getItem('theme') || 'dark'; } catch { /* Storage may be disabled. */ }
  if (theme === 'system') theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#theme-toggle').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch { /* Theme still works without storage. */ }
      document.dispatchEvent(new Event('themechange'));
    });
  });
})();
