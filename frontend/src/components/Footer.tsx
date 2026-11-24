import { Link } from "react-router-dom";
import { FileSearch, Lock, ShieldCheck } from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";
import { Logo } from "./Logo";
import { LanguageSwitch } from "./LanguageSwitch";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <Logo height={96} />
          <p className="footer-about">{t("footer.about")}</p>
          <div className="footer-badges">
            <span><ShieldCheck size={15} /> {t("footer.sec1")}</span>
            <span><Lock size={15} /> {t("footer.sec2")}</span>
            <span><FileSearch size={15} /> {t("footer.sec3")}</span>
          </div>
        </div>

        <div className="footer-cols">
          <div className="footer-col">
            <h4>{t("footer.platform")}</h4>
            <ul>
              <li><Link to="/">{t("nav.home")}</Link></li>
              <li><Link to="/documents">{t("nav.documents")}</Link></li>
              <li><Link to="/chat">{t("nav.chat")}</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>{t("footer.resources")}</h4>
            <ul>
              <li><Link to="/help">{t("nav.help")}</Link></li>
              <li><Link to="/settings">{t("nav.settings")}</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>{t("footer.copy")}</span>
        <span className="footer-note">{t("footer.madeWith")}</span>
        <LanguageSwitch />
      </div>
    </footer>
  );
}
