import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, Ban, CheckCircle2, Users as UsersIcon } from "lucide-react";
import type { AdminOutletContext } from "../../layouts/AdminLayout";
import { MOCK_USERS, type MockUser, type UserStatus } from "../../data/adminMockData";
import { AdminTopbar, StatusBadge, adminAnimationStyles } from "../../components/admin/AdminUI";
import { useAdminTheme } from "../../components/admin/useAdminTheme";
import AdminConfirmModal from "../../components/admin/AdminConfirmModal";
import { useI18n } from "../../i18n";

const ROLE_FILTERS = ["all", "client", "provider", "admin"] as const;
const STATUS_FILTERS: (UserStatus | "all")[] = ["all", "active", "pending", "suspended"];

const AdminUsersScreen: React.FC = () => {
  const { isDark } = useOutletContext<AdminOutletContext>();
  const c = useAdminTheme(isDark);
  const { t } = useI18n();
  const u2 = t("admin").users;
  const confirm = t("admin").confirm;

  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<(typeof ROLE_FILTERS)[number]>("all");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [pendingUser, setPendingUser] = useState<MockUser | null>(null);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesQuery =
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase());
      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, query, roleFilter, statusFilter]);

  const confirmToggleSuspend = () => {
    if (!pendingUser) return;
    const id = pendingUser.id;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "suspended" ? "active" : "suspended" } : u,
      ),
    );
    setPendingUser(null);
  };

  const pendingCopy = pendingUser
    ? pendingUser.status === "suspended"
      ? confirm.reactivateUser
      : confirm.suspendUser
    : null;

  return (
    <>
      <style>{adminAnimationStyles}</style>
      <style>{`
        .admin-input { background: ${c.inputBg}; border: 1px solid ${c.divider}; color: ${c.text}; }
        .admin-input::placeholder { color: #989898; }
        .admin-filter-btn { border: 1px solid ${c.divider}; background: transparent; color: ${c.textSecondary}; }
        .admin-filter-btn.active { background: #2EBCCC; border-color: #2EBCCC; color: #fff; }
        .admin-table-wrap { overflow-x: auto; }
        table.admin-table { width: 100%; border-collapse: collapse; min-width: 720px; }
        table.admin-table th { text-align: left; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em; color: #989898; padding: 10px 16px; border-bottom: 1px solid ${c.divider}; }
        table.admin-table td { padding: 14px 16px; border-bottom: 1px solid ${c.divider}; font-size: 0.86rem; color: ${c.text}; }
        table.admin-table tr:last-child td { border-bottom: none; }
        .admin-row-btn { border: none; cursor: pointer; border-radius: 8px; padding: 6px 10px; font-size: 0.78rem; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; transition: opacity 0.15s; font-family: inherit; }
        .admin-row-btn:hover { opacity: 0.8; }
      `}</style>

      <div className="page-enter">
        <AdminTopbar title={u2.title} subtitle={`${filtered.length} ${u2.subtitleOf} ${users.length} ${u2.subtitleUsers}`} isDark={isDark} />

        <div style={{ padding: 28, background: c.mainBg, minHeight: "calc(100vh - 84px)" }}>
          <div
            style={{
              background: c.cardBg,
              border: `1px solid ${c.divider}`,
              borderRadius: 16,
              padding: 20,
            }}
            className="admin-fade-card"
          >
            <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 18 }}>
              <div className="relative flex-1" style={{ minWidth: 220 }}>
                <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#989898" }} />
                <input
                  className="admin-input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={u2.searchPlaceholder}
                  style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, fontSize: "0.86rem", fontFamily: "inherit" }}
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {ROLE_FILTERS.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoleFilter(r)}
                    className={`admin-filter-btn ${roleFilter === r ? "active" : ""}`}
                    style={{ padding: "8px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}
                  >
                    {r === "all" ? u2.all : r}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 flex-wrap">
                {STATUS_FILTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`admin-filter-btn ${statusFilter === s ? "active" : ""}`}
                    style={{ padding: "8px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}
                  >
                    {s === "all" ? u2.allStatus : s}
                  </button>
                ))}
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{u2.columnUser}</th>
                    <th>{u2.columnRole}</th>
                    <th>{u2.columnStatus}</th>
                    <th>{u2.columnJoined}</th>
                    <th>{u2.columnLastLogin}</th>
                    <th>{u2.columnPostsJobs}</th>
                    <th>{u2.columnAction}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u.id} className="admin-row" style={{ animationDelay: `${i * 35}ms` }}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-[0.75rem] shrink-0"
                            style={{ background: "linear-gradient(135deg, #2EBCCC, #1B244C)" }}
                          >
                            {u.name[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{u.name}</div>
                            <div style={{ fontSize: "0.76rem", color: "#989898" }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ textTransform: "capitalize" }}>{u.role}</td>
                      <td><StatusBadge status={u.status} /></td>
                      <td style={{ color: "#989898" }}>{u.joinedAt}</td>
                      <td style={{ color: "#989898" }}>{u.lastLogin}</td>
                      <td>{u.postsOrJobs}</td>
                      <td>
                        <button
                          className="admin-row-btn"
                          onClick={() => setPendingUser(u)}
                          style={{
                            background: u.status === "suspended" ? "rgba(74,168,37,0.12)" : "rgba(255,0,0,0.1)",
                            color: u.status === "suspended" ? "#4AA825" : "#FF0000",
                          }}
                        >
                          {u.status === "suspended" ? <CheckCircle2 size={13} /> : <Ban size={13} />}
                          {u.status === "suspended" ? u2.reactivate : u2.suspend}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#989898" }}>
                  <UsersIcon size={28} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                  {u2.empty}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AdminConfirmModal
        isOpen={!!pendingUser}
        isDark={isDark}
        tone={pendingUser?.status === "suspended" ? "positive" : "danger"}
        title={pendingCopy?.title ?? ""}
        message={pendingUser ? `${pendingCopy?.prefix} ${pendingUser.name}${pendingCopy?.suffix}` : ""}
        confirmLabel={pendingCopy?.action ?? ""}
        cancelLabel={confirm.cancel}
        onClose={() => setPendingUser(null)}
        onConfirm={confirmToggleSuspend}
      />
    </>
  );
};

export default AdminUsersScreen;
