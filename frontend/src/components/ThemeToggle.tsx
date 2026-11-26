import { Moon, Sun } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";
import { useI18n } from "../i18n/LanguageContext";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const { t } = useI18n();
  return (
    <button type="button" className="icon-btn theme-btn" onClick={toggle} aria-label={t("theme.toggle")} title={t("theme.toggle")}>
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
