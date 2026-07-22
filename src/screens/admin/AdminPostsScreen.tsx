import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, EyeOff, Eye, FileText, Users } from "lucide-react";
import type { AdminOutletContext } from "../../layouts/AdminLayout";
import { MOCK_POSTS, type MockPost, type PostStatus } from "../../data/adminMockData";
import { AdminTopbar, StatusBadge, adminAnimationStyles } from "../../components/admin/AdminUI";
import { useAdminTheme } from "../../components/admin/useAdminTheme";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";
import { useI18n } from "../../i18n";

const STATUS_FILTERS: (PostStatus | "all")[] = ["all", "active", "flagged", "closed"];

const AdminPostsScreen: React.FC = () => {
  const { isDark } = useOutletContext<AdminOutletContext>();
  const c = useAdminTheme(isDark);
  const { t } = useI18n();
  const p2 = t("admin").posts;
  const confirm = t("admin").confirm;

  const [posts, setPosts] = useState<MockPost[]>(MOCK_POSTS);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PostStatus | "all">("all");
  const [pendingPost, setPendingPost] = useState<MockPost | null>(null);

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesQuery =
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.author.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "all" || p.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [posts, query, statusFilter]);

  const confirmToggleVisibility = () => {
    if (!pendingPost) return;
    const id = pendingPost.id;
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: p.status === "closed" ? "active" : "closed" } : p,
      ),
    );
    setPendingPost(null);
  };

  const pendingCopy = pendingPost
    ? pendingPost.status === "closed"
      ? confirm.reactivatePost
      : confirm.hidePost
    : null;

  return (
    <>
      <style>{adminAnimationStyles}</style>
      <style>{`
        .admin-input { background: ${c.inputBg}; border: 1px solid ${c.divider}; color: ${c.text}; }
        .admin-input::placeholder { color: #989898; }
        .admin-filter-btn { border: 1px solid ${c.divider}; background: transparent; color: ${c.textSecondary}; }
        .admin-filter-btn.active { background: #2EBCCC; border-color: #2EBCCC; color: #fff; }
        .admin-post-card { background: ${c.cardBg}; border: 1px solid ${c.divider}; border-radius: 14px; padding: 16px 18px; }
        .admin-post-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
        .admin-row-btn { border: none; cursor: pointer; border-radius: 8px; padding: 6px 10px; font-size: 0.78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; transition: opacity 0.15s; font-family: inherit; }
        .admin-row-btn:hover { opacity: 0.8; }
      `}</style>

      <div className="page-enter">
        <AdminTopbar title={p2.title} subtitle={`${filtered.length} ${p2.subtitleOf} ${posts.length} ${p2.subtitlePosts}`} isDark={isDark} />

        <div style={{ padding: 28, background: c.mainBg, minHeight: "calc(100vh - 84px)" }}>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 20 }}>
            <div className="relative flex-1" style={{ minWidth: 220 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#989898" }} />
              <input
                className="admin-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={p2.searchPlaceholder}
                style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, fontSize: "0.86rem", fontFamily: "inherit" }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {STATUS_FILTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`admin-filter-btn ${statusFilter === s ? "active" : ""}`}
                  style={{ padding: "8px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}
                >
                  {s === "all" ? p2.all : s}
                </button>
              ))}
            </div>
          </div>

          <div className="admin-post-grid">
            {filtered.map((p, i) => (
              <div key={p.id} className="admin-post-card admin-fade-card" style={{ animationDelay: `${i * 45}ms` }}>
                <div className="flex items-start justify-between gap-3" style={{ marginBottom: 10 }}>
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center shrink-0"
                      style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(46,188,204,0.15)" }}
                    >
                      <FileText size={17} color="#2EBCCC" />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem", color: c.text }}>{p.title}</div>
                      <div style={{ fontSize: "0.76rem", color: "#989898" }}>{p2.by} {p.author}</div>
                    </div>
                  </div>
                  <StatusBadge status={p.status} />
                </div>

                <div className="flex items-center justify-between" style={{ marginTop: 14 }}>
                  <div className="flex items-center gap-3" style={{ fontSize: "0.78rem", color: "#989898" }}>
                    <span
                      style={{
                        background: "rgba(4,50,255,0.1)",
                        color: "#0432FF",
                        padding: "3px 9px",
                        borderRadius: 20,
                        fontWeight: 700,
                        fontSize: "0.72rem",
                      }}
                    >
                      {p.category}
                    </span>
                    <span className="flex items-center gap-1"><Users size={12} /> {p.offersCount} {p2.offers}</span>
                    <span>{p.createdAt}</span>
                  </div>
                  <button
                    className="admin-row-btn"
                    onClick={() => setPendingPost(p)}
                    style={{
                      background: p.status === "closed" ? "rgba(74,168,37,0.12)" : "rgba(255,0,0,0.1)",
                      color: p.status === "closed" ? "#4AA825" : "#FF0000",
                    }}
                  >
                    {p.status === "closed" ? <Eye size={13} /> : <EyeOff size={13} />}
                    {p.status === "closed" ? p2.reactivate : p2.hide}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#989898" }}>
              <FileText size={28} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
              {p2.empty}
            </div>
          )}
        </div>
      </div>

      <AdminConfirmModal
        isOpen={!!pendingPost}
        isDark={isDark}
        tone={pendingPost?.status === "closed" ? "positive" : "danger"}
        title={pendingCopy?.title ?? ""}
        message={pendingPost ? `${pendingCopy?.prefix} "${pendingPost.title}"${pendingCopy?.suffix}` : ""}
        confirmLabel={pendingCopy?.action ?? ""}
        cancelLabel={confirm.cancel}
        onClose={() => setPendingPost(null)}
        onConfirm={confirmToggleVisibility}
      />
    </>
  );
};

export default AdminPostsScreen;
