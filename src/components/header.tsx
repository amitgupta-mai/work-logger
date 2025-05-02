import { ThemeToggle } from "../ui/themeToggle";

export const Header = ({
  theme,
  toggleTheme,
}: {
  theme: "light" | "dark";
  toggleTheme: () => void;
}) => {
  return (
    <div className="header flex justify-between">
      <h2 className="font-bold text-2xl">Work Logger</h2>
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
};
