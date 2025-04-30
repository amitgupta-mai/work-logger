export const setTheme = (theme: 'light' | 'dark') => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};

export const loadTheme = () => {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
};

export const toggleTheme = (
  theme: 'light' | 'dark',
  setThemeState: (theme: 'light' | 'dark') => void
) => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  setThemeState(newTheme);
};
