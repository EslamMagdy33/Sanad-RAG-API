import { Link } from "react-router-dom";
import { LifeBuoy, MessageCircle } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";

/** أزرار عائمة للوصول السريع للمحادثة والمساعدة من أي صفحة */
export function QuickActions() {
  const { t } = useI18n();
  return (
    <div className="quick-actions">
      <Link to="/chat" className="quick-btn" aria-label={t("nav.chat")} title={t("nav.chat")}>
        <MessageCircle size={22} />
      </Link>
      <Link to="/help" className="quick-btn quick-btn-alt" aria-label={t("nav.help")} title={t("nav.help")}>
        <LifeBuoy size={22} />
      </Link>
    </div>
  );
}
