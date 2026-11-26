import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FolderOpen, LayoutDashboard, LifeBuoy, LogOut, Menu, MessagesSquare, Settings, X, type LucideIcon } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/LanguageContext";
import type { MessageKey } from "../i18n/messages";
import { Footer } from "./Footer";
import { Logo } from "./Logo";
import { LanguageSwitch } from "./LanguageSwitch";
import { QuickActions } from "./QuickActions";
import { UserAvatar } from "./UserAvatar";
import { ThemeToggle } from "./ThemeToggle";

const LINKS: { to: string; key: MessageKey; icon: LucideIcon; end: boolean }[] = [
  { to: "/", key: "nav.home", icon: LayoutDashboard, end: true },
  { to: "/documents", key: "nav.documents", icon: FolderOpen, end: false },
  { to: "/chat", key: "nav.chat", icon: MessagesSquare, end: false },
  { to: "/settings", key: "nav.settings", icon: Settings, end: false },
  { to: "/help", key: "nav.help", icon: LifeBuoy, end: false },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="container app-header-inner">
          <div className="hdr-main">
            <NavLink to="/" className="brand-link" aria-label={t("brand.tagline")}>
              <Logo height={50} />
            </NavLink>
            <span className="hdr-divider" />
            <nav className="nav-desktop" aria-label={t("nav.label")}>
              {LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                  >
                    <Icon size={18} />
                    <span>{t(link.key)}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="hdr-tools">
            <span className="hdr-divider" />
            <div className="user-pill" title={user?.email}>
              <UserAvatar size={38} />
              <span className="user-email en">{user?.email}</span>
            </div>
            <LanguageSwitch />
            <ThemeToggle />
            <button type="button" className="icon-btn logout-btn" onClick={handleLogout} aria-label={t("nav.logout")} title={t("nav.logout")}>
              <LogOut size={18} />
            </button>
            <button
              type="button"
              className="icon-btn menu-toggle"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t("nav.close") : t("nav.open")}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="nav-mobile" aria-label={t("nav.label")}>
            <div className="container nav-mobile-list">
              {LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                  >
                    <Icon size={20} />
                    <span>{t(link.key)}</span>
                  </NavLink>
                );
              })}
              <button type="button" className="nav-item nav-logout" onClick={handleLogout}>
                <LogOut size={20} />
                <span>{t("nav.logout")}</span>
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="main">
        <div className="container page">
          <Outlet />
        </div>
      </main>

      <Footer />
      <QuickActions />
    </div>
  );
}
