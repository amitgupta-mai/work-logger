import { MdDarkMode } from "react-icons/md";
import { CiLight } from "react-icons/ci";

export const ThemeToggle = ({
  theme,
  toggleTheme,
}: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) => {
  return (
    <button onClick={toggleTheme} className="theme-toggle">
      {theme === "light" ? <MdDarkMode /> : <CiLight />}
    </button>
  );
};
