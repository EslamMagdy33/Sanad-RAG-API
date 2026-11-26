import { ChevronDown, Globe } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";

export function LanguageSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <button
      type="button"
      className="lang-btn"
      onClick={() => setLang(lang === "ar" ? "en" : "ar")}
      aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      <Globe size={16} />
      <span className="lang-label">{t("lang.toggle")}</span>
      <ChevronDown size={14} />
    </button>
  );
}
