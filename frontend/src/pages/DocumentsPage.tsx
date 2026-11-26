import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, CloudUpload, FileText, Layers, Loader2, MessageSquare, Trash2 } from "lucide-react";
import { deleteDocument, listDocuments, uploadDocument, type DocumentDto } from "../api/documents";
import { errorKey } from "../api/errors";
import { useI18n } from "../i18n/LanguageContext";
import { StatusBadge } from "../components/StatusBadge";
import { formatBytes, formatDate } from "../utils/format";
import { validateDocumentFile } from "../utils/validation";

const POLL_INTERVAL_MS = 3000;

export function DocumentsPage() {
  const { t, lang } = useI18n();
  const [docs, setDocs] = useState<DocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(async () => {
    try {
      setDocs(await listDocuments());
      setError(null);
    } catch (err) {
      setError(t(errorKey(err, "err.loadDocs")));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // polling كل 3 ثواني بس لو فيه مستندات لسه بتتعالج
  const hasInFlight = useMemo(
    () => docs.some((d) => d.status === "Pending" || d.status === "Processing"),
    [docs],
  );

  useEffect(() => {
    if (!hasInFlight) return;
    const id = window.setInterval(refresh, POLL_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [hasInFlight, refresh]);

  const stats = useMemo(
    () => ({
      total: docs.length,
      ready: docs.filter((d) => d.status === "Ready").length,
      inFlight: docs.filter((d) => d.status === "Pending" || d.status === "Processing").length,
      pages: docs.reduce((sum, d) => sum + (d.pageCount ?? 0), 0),
    }),
    [docs],
  );

  async function handleFile(file: File | undefined) {
    if (!file) return;

    const problem = validateDocumentFile(file);
    if (problem) {
      setUploadError(t(problem));
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      await uploadDocument(file);
      await refresh();
    } catch (err) {
      setUploadError(t(errorKey(err, "err.uploadFailed")));
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }

  async function handleDelete(doc: DocumentDto) {
    if (!window.confirm(t("docs.confirmDelete", { name: doc.fileName }))) return;

    setDeletingId(doc.id);
    try {
      await deleteDocument(doc.id);
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      setError(t(errorKey(err, "err.deleteFailed")));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="page-title">{t("docs.title")}</h1>
          <p className="page-sub">{t("docs.sub")}</p>
        </div>
      </div>

      <div
        className={`card drop ${dragging ? "active" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
        <div className="drop-icon">
          <CloudUpload size={34} />
        </div>
        <h2 className="drop-title">{t("docs.dropTitle")}</h2>
        <p className="muted drop-sub">{t("docs.dropSub")}</p>
        <div className="drop-actions">
          <button
            type="button"
            className="btn btn-brand"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <span className="spinner" /> {t("docs.uploading")}
              </>
            ) : (
              t("docs.choose")
            )}
          </button>
        </div>
        <p className="drop-hint muted">{t("docs.hint")}</p>

        {uploadError && (
          <div role="alert" className="alert alert-error drop-alert">{uploadError}</div>
        )}

        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            handleFile(file);
          }}
        />
      </div>

      <div className="stats">
        <StatCard icon={<FileText size={22} />} value={stats.total} label={t("docs.statTotal")} />
        <StatCard icon={<CheckCircle2 size={22} />} value={stats.ready} label={t("docs.statReady")} />
        <StatCard icon={<Loader2 size={22} />} value={stats.inFlight} label={t("docs.statInFlight")} />
        <StatCard icon={<Layers size={22} />} value={stats.pages} label={t("docs.statPages")} />
      </div>

      {error && <div role="alert" className="alert alert-error page-alert">{error}</div>}

      <div className="card table-card">
        <div className="table-wrap">
          {loading ? (
            <div className="empty">{t("common.loading")}</div>
          ) : docs.length === 0 ? (
            <div className="empty">{t("docs.empty")}</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{t("docs.colName")}</th>
                  <th>{t("docs.colSize")}</th>
                  <th>{t("docs.colPages")}</th>
                  <th>{t("docs.colStatus")}</th>
                  <th>{t("docs.colUploaded")}</th>
                  <th>{t("docs.colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div className="file-name en">{doc.fileName}</div>
                      <div className="file-meta en">{doc.contentType}</div>
                    </td>
                    <td>{formatBytes(doc.sizeBytes)}</td>
                    <td>{doc.pageCount ?? "—"}</td>
                    <td>
                      <StatusBadge status={doc.status} />
                      {doc.status === "Failed" && doc.failureReason && (
                        <div className="fail-reason">{t("docs.failureNote")}: {doc.failureReason}</div>
                      )}
                    </td>
                    <td>{formatDate(doc.uploadedAt, lang)}</td>
                    <td>
                      <div className="row-actions">
                        {doc.status === "Ready" && (
                          <Link to={`/chat?documentId=${doc.id}`} className="btn btn-outline btn-sm">
                            <MessageSquare size={16} /> {t("docs.ask")}
                          </Link>
                        )}
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleDelete(doc)}
                          disabled={deletingId === doc.id}
                          aria-label={`${t("docs.delete")} ${doc.fileName}`}
                          title={t("docs.delete")}
                        >
                          {deletingId === doc.id ? <Loader2 size={18} className="spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ icon, value, label }: { icon: ReactNode; value: number; label: string }) {
  return (
    <div className="card stat">
      <div className="stat-icon">{icon}</div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
}
