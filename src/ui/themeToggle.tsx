export const ThemeToggle = ({
  theme,
  toggleTheme,
}: {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}) => {
  return (
    <button onClick={toggleTheme} className='theme-toggle'>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
};
