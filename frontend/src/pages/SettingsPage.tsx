import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Bell, Check, Lock, SlidersHorizontal, Trash2, Upload, UserRound, type LucideIcon } from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useI18n } from "../i18n/LanguageContext";
import type { Lang, MessageKey } from "../i18n/messages";
import { useProfile, type Profile } from "../profile/ProfileContext";
import { useTheme } from "../theme/ThemeContext";
import { Toggle } from "../components/Toggle";
import { readImageAsDataUrl } from "../utils/image";

type TabId = "profile" | "security" | "preferences" | "notifications";

const TABS: { id: TabId; icon: LucideIcon; label: MessageKey }[] = [
  { id: "profile", icon: UserRound, label: "settings.tabProfile" },
  { id: "security", icon: Lock, label: "settings.tabSecurity" },
  { id: "preferences", icon: SlidersHorizontal, label: "settings.tabPrefs" },
  { id: "notifications", icon: Bell, label: "settings.tabNotif" },
];

export function SettingsPage() {
  const { t } = useI18n();
  const [tab, setTab] = useState<TabId>("profile");

  return (
    <>
      <nav className="crumbs">
        {t("settings.crumbHome")} / <strong>{t("settings.crumbCurrent")}</strong>
      </nav>

      <div className="page-head">
        <div>
          <h1 className="page-title">{t("settings.title")}</h1>
          <p className="page-sub">{t("settings.sub")}</p>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {TABS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={`tab ${tab === item.id ? "active" : ""}`}
              onClick={() => setTab(item.id)}
            >
              <Icon size={18} />
              {t(item.label)}
            </button>
          );
        })}
      </div>

      <div className="card settings-card">
        {tab === "profile" && <ProfileTab />}
        {tab === "security" && <SecurityTab />}
        {tab === "preferences" && <PreferencesTab />}
        {tab === "notifications" && <NotificationsTab />}
      </div>
    </>
  );
}

/* ----- الملف الشخصي ----- */
function ProfileTab() {
  const { t } = useI18n();
  const { user } = useAuth();
  const { profile, save } = useProfile();
  const [draft, setDraft] = useState<Profile>(profile);
  const [saved, setSaved] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);
  const initial = (draft.displayName || user?.email || "?").charAt(0).toUpperCase();

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  async function onPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.type !== "image/png" && file.type !== "image/jpeg") {
      setPhotoError(t("settings.photoInvalid"));
      return;
    }
    if (file.size > 1024 * 1024) {
      setPhotoError(t("settings.photoTooLarge"));
      return;
    }
    try {
      update("avatar", await readImageAsDataUrl(file));
      setPhotoError(null);
    } catch {
      setPhotoError(t("err.generic"));
    }
  }

  function onSave() {
    save(draft);
    setSaved(true);
  }

  return (
    <div className="settings-section">
      <div>
        <h2 className="card-title">{t("settings.profileTitle")}</h2>
        <p className="muted">{t("settings.profileSub")}</p>
      </div>

      <div className="profile-hero">
        {draft.avatar ? (
          <img className="avatar avatar-img big" src={draft.avatar} alt="" />
        ) : (
          <span className="avatar big">{initial}</span>
        )}
        <div className="profile-hero-info">
          <strong className="profile-name">{draft.displayName || user?.email}</strong>
          <span className="muted en">{user?.email}</span>
          <div className="photo-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => inputRef.current?.click()}>
              <Upload size={16} /> {t("settings.changePhoto")}
            </button>
            {draft.avatar && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => update("avatar", null)}>
                <Trash2 size={16} /> {t("settings.removePhoto")}
              </button>
            )}
          </div>
          <span className="muted small">{t("settings.photoHint")}</span>
          {photoError && <span className="field-error">{photoError}</span>}
        </div>
        <input ref={inputRef} type="file" hidden accept="image/png,image/jpeg" onChange={onPhoto} />
      </div>

      <div className="form-grid">
        <ProfileField label={t("settings.name")} value={draft.displayName} onChange={(v) => update("displayName", v)} />
        <ProfileField label={t("settings.username")} value={draft.username} dir="ltr" onChange={(v) => update("username", v)} />
        <ProfileField label={t("settings.jobTitle")} value={draft.jobTitle} onChange={(v) => update("jobTitle", v)} />
        <ProfileField label={t("settings.organization")} value={draft.organization} onChange={(v) => update("organization", v)} />
      </div>

      <div className="save-bar">
        <span className="muted small">{t("settings.localNote")}</span>
        <div className="save-actions">
          {saved && (
            <span className="saved-note">
              <Check size={16} /> {t("settings.saved")}
            </span>
          )}
          <button type="button" className="btn btn-outline btn-sm" disabled={!dirty} onClick={() => { setDraft(profile); setSaved(false); }}>
            {t("settings.discard")}
          </button>
          <button type="button" className="btn btn-primary btn-sm" disabled={!dirty} onClick={onSave}>
            {t("settings.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ label, value, onChange, dir }: { label: string; value: string; onChange: (v: string) => void; dir?: "ltr" | "rtl" }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <input className="input" value={value} dir={dir} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

/* ----- الأمان ----- */
function SecurityTab() {
  const { t } = useI18n();
  return (
    <div className="settings-section">
      <div>
        <h2 className="card-title">{t("settings.securityTitle")}</h2>
        <p className="muted">{t("settings.securitySub")}</p>
      </div>
      <div className="setting-row">
        <div>
          <strong>{t("settings.rulesTitle")}</strong>
          <p className="muted">{t("settings.rulesText")}</p>
        </div>
        <span className="badge badge-success">{t("settings.enabled")}</span>
      </div>
      <div className="setting-row">
        <div>
          <strong>{t("settings.sessionTitle")}</strong>
          <p className="muted">{t("settings.sessionText")}</p>
        </div>
        <span className="badge badge-neutral">{t("settings.automatic")}</span>
      </div>
      <div className="setting-row">
        <div>
          <strong>{t("auth.password")}</strong>
          <p className="muted">{t("settings.passwordSoon")}</p>
        </div>
        <span className="badge badge-neutral">{t("settings.soon")}</span>
      </div>
    </div>
  );
}

/* ----- التفضيلات (اللغة والمظهر شغالين فعلاً) ----- */
function PreferencesTab() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();

  return (
    <div className="settings-section">
      <div>
        <h2 className="card-title">{t("settings.prefsTitle")}</h2>
        <p className="muted">{t("settings.prefsSub")}</p>
      </div>

      <div className="form-grid">
        <label className="field">
          <span className="field-label">{t("settings.language")}</span>
          <select className="select full" value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </label>
        <label className="field">
          <span className="field-label">{t("settings.appearance")}</span>
          <select className="select full" value={theme} onChange={(e) => setTheme(e.target.value as "light" | "dark")}>
            <option value="light">{t("settings.themeLight")}</option>
            <option value="dark">{t("settings.themeDark")}</option>
          </select>
        </label>
      </div>

      <div className="section-sub-title">{t("settings.reasoningSub")}</div>
      <SoonRow title={t("settings.showSourcesTitle")} text={t("settings.showSourcesText")} />
      <SoonRow title={t("settings.strictTitle")} text={t("settings.strictText")} />
      <SoonRow title={t("settings.boxesTitle")} text={t("settings.boxesText")} />
    </div>
  );
}

/* ----- الإشعارات ----- */
function NotificationsTab() {
  const { t } = useI18n();
  return (
    <div className="settings-section">
      <div>
        <h2 className="card-title">{t("settings.notifTitle")}</h2>
        <p className="muted">{t("settings.notifSub")}</p>
      </div>
      <SoonRow title={t("settings.notifDoneTitle")} text={t("settings.notifDoneText")} />
      <SoonRow title={t("settings.notifFailTitle")} text={t("settings.notifFailText")} />
      <div className="alert alert-info">{t("settings.notifSoon")}</div>
    </div>
  );
}

/** صف إعداد معطّل لحد ما الباك يدعمه */
function SoonRow({ title, text }: { title: string; text: string }): ReactNode {
  const { t } = useI18n();
  return (
    <div className="setting-row soon-row">
      <div>
        <strong>{title}</strong>
        <p className="muted">{text}</p>
      </div>
      <div className="soon-end">
        <span className="badge badge-neutral">{t("settings.soon")}</span>
        <Toggle checked={false} label={title} disabled onChange={() => {}} />
      </div>
    </div>
  );
}
