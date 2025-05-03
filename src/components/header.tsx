import { ThemeToggle } from './ui/themeToggle';

export const Header = ({
  theme,
  toggleTheme,
}: {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}) => {
  return (
    <div className='header'>
      <h2>TimeZen</h2>
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
};
