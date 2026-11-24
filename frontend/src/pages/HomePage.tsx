import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Database,
  FileSearch,
  FileText,
  FileUp,
  GraduationCap,
  Languages,
  Lightbulb,
  ListChecks,
  Lock,
  MessageCircleQuestion,
  Scale,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useI18n } from "../i18n/LanguageContext";
import type { MessageKey } from "../i18n/messages";
import { DocIllustration, FolderIllustration, SearchDocIllustration, SparkIllustration } from "../components/Illustrations";

const STEPS: { num: string; icon: LucideIcon; title: MessageKey; text: MessageKey; tag: MessageKey }[] = [
  { num: "01", icon: FileUp, title: "home.step1Title", text: "home.step1Text", tag: "home.step1Tag" },
  { num: "02", icon: MessageCircleQuestion, title: "home.step2Title", text: "home.step2Text", tag: "home.step2Tag" },
  { num: "03", icon: BadgeCheck, title: "home.step3Title", text: "home.step3Text", tag: "home.step3Tag" },
];

const PROOF: { icon: LucideIcon; key: MessageKey }[] = [
  { icon: ShieldCheck, key: "home.proof1" },
  { icon: Lock, key: "home.proof2" },
  { icon: Languages, key: "home.proof3" },
  { icon: FileSearch, key: "home.proof4" },
];

const USE_CASES: { icon: LucideIcon; title: MessageKey; text: MessageKey }[] = [
  { icon: Building2, title: "home.use1Title", text: "home.use1Text" },
  { icon: Scale, title: "home.use2Title", text: "home.use2Text" },
  { icon: UsersRound, title: "home.use3Title", text: "home.use3Text" },
  { icon: GraduationCap, title: "home.use4Title", text: "home.use4Text" },
];

const SECURITY: { icon: LucideIcon; title: MessageKey; text: MessageKey }[] = [
  { icon: Database, title: "home.sec1Title", text: "home.sec1Text" },
  { icon: ShieldCheck, title: "home.sec2Title", text: "home.sec2Text" },
  { icon: ListChecks, title: "home.sec3Title", text: "home.sec3Text" },
];

export function HomePage() {
  const { t, lang } = useI18n();
  const Arrow = lang === "ar" ? ArrowLeft : ArrowRight;

  return (
    <>
      {/* الهيرو */}
      <section className="hero hero-v3">
        <div className="hero-copy">
          <span className="hero-pill">
            <span className="pulse-dot" /> {t("home.badge")}
          </span>
          <h1 className="hero-title">{t("home.titleA")}</h1>
          <h2 className="hero-title hero-title-accent">
            {t("home.titleB")}
            <svg className="hero-underline" viewBox="0 0 300 16" aria-hidden="true">
              <path d="M4 10 Q 150 2 296 9" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </h2>
          <p className="hero-sub">{t("home.sub")}</p>
          <div className="hero-cta">
            <Link to="/documents" className="btn btn-primary btn-lg">
              <FileUp size={20} /> {t("home.cta")}
            </Link>
            <a href="#how" className="btn btn-outline btn-lg">
              {t("home.how")} <Arrow size={18} />
            </a>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <DocIllustration className="ill ill-doc" />
          <SearchDocIllustration className="ill ill-search" />
          <FolderIllustration className="ill ill-folder" />
          <SparkIllustration className="ill ill-spark" />

          <div className="visual-tag"><Lightbulb size={14} /> {t("home.previewLabel")}</div>

          <div className="preview-card">
            <div className="preview-head">
              <div className="preview-doc">
                <FileText size={18} />
                <span className="en">{t("home.previewDoc")}</span>
              </div>
            </div>
            <div className="preview-q">{t("home.previewQ")}</div>
            <div className="preview-a">
              <p>{t("home.previewA")}</p>
              <span className="cite">{t("home.previewSource")}</span>
            </div>
            <div className="preview-verified">
              <ShieldCheck size={16} /> {t("home.previewVerified")}
            </div>
          </div>
        </div>
      </section>

      {/* شريط الإثباتات */}
      <section className="proof-strip" aria-label={t("home.proof1")}>
        {PROOF.map((item) => (
          <div key={item.key} className="proof-item">
            <span className="proof-icon"><item.icon size={20} /></span>
            <span>{t(item.key)}</span>
          </div>
        ))}
      </section>

      {/* خطوات العمل */}
      <section id="how" className="section">
        <div className="section-head">
          <span className="section-eyebrow">{t("home.stepsEyebrow")}</span>
          <h2 className="section-title">{t("home.stepsTitle")}</h2>
        </div>
        <div className="steps-grid">
          {STEPS.map((step) => (
            <div key={step.num} className="card step-card">
              <div className="step-head">
                <span className="step-icon"><step.icon size={22} /></span>
                <span className="step-num">{step.num}</span>
              </div>
              <h3 className="step-title">{t(step.title)}</h3>
              <p className="step-text">{t(step.text)}</p>
              <div className="step-tag">✓ {t(step.tag)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* لمن صُممت */}
      <section className="section">
        <div className="section-head">
          <span className="section-eyebrow">{t("home.useEyebrow")}</span>
          <h2 className="section-title">{t("home.useTitle")}</h2>
        </div>
        <div className="use-grid">
          {USE_CASES.map((u) => (
            <div key={u.title} className="card use-card">
              <span className="use-icon"><u.icon size={22} /></span>
              <h3>{t(u.title)}</h3>
              <p className="muted">{t(u.text)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* الأمان والسيادة */}
      <section className="section">
        <div className="section-head">
          <span className="section-eyebrow">{t("home.secEyebrow")}</span>
          <h2 className="section-title">{t("home.secTitle")}</h2>
        </div>
        <div className="sec-grid">
          {SECURITY.map((s) => (
            <div key={s.title} className="sec-card">
              <span className="sec-icon"><s.icon size={22} /></span>
              <h3>{t(s.title)}</h3>
              <p>{t(s.text)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* معيار الموثوقية */}
      <section className="section">
        <div className="trust">
          <div>
            <span className="trust-badge"><ShieldCheck size={16} /> {t("home.trustBadge")}</span>
            <h2 className="trust-quote">{t("home.trustQuote")}</h2>
            <p className="trust-accent">{t("home.trustAccent")}</p>
            <p className="trust-text">{t("home.trustText")}</p>
          </div>
          <div className="trust-tiles">
            <div className="trust-tile">
              <Database size={22} color="var(--accent)" />
              <h4>{t("home.tile1Title")}</h4>
              <p>{t("home.tile1Text")}</p>
            </div>
            <div className="trust-tile">
              <ListChecks size={22} color="var(--accent)" />
              <h4>{t("home.tile2Title")}</h4>
              <p>{t("home.tile2Text")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* دعوة للبدء */}
      <section className="section">
        <div className="cta-band">
          <div>
            <h2>{t("home.ctaTitle")}</h2>
            <p>{t("home.ctaSub")}</p>
          </div>
          <Link to="/documents" className="btn btn-light btn-lg">
            <FileUp size={20} /> {t("home.cta")}
          </Link>
        </div>
      </section>
    </>
  );
}
