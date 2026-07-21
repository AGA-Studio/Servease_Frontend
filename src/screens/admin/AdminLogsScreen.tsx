import { useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search, ScrollText, Info, TriangleAlert, CircleX } from "lucide-react";
import type { AdminOutletContext } from "../../layouts/AdminLayout";
import { MOCK_LOGS, type LogLevel } from "../../data/adminMockData";
import { AdminTopbar, StatusBadge, adminAnimationStyles } from "../../components/admin/AdminUI";
import { useAdminTheme } from "../../components/admin/useAdminTheme";
import { useI18n } from "../../i18n";

const LEVEL_FILTERS: (LogLevel | "all")[] = ["all", "error", "warning", "info"];

const LEVEL_ICON: Record<LogLevel, React.ReactNode> = {
  error: <CircleX size={14} color="#FF0000" />,
  warning: <TriangleAlert size={14} color="#FFB200" />,
  info: <Info size={14} color="#2EBCCC" />,
};

const AdminLogsScreen: React.FC = () => {
  const { isDark } = useOutletContext<AdminOutletContext>();
  const c = useAdminTheme(isDark);
  const { t } = useI18n();
  const l2 = t("admin").logs;

  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");

  const filtered = useMemo(() => {
    return MOCK_LOGS.filter((l) => {
      const matchesQuery =
        l.message.toLowerCase().includes(query.toLowerCase()) ||
        l.endpoint.toLowerCase().includes(query.toLowerCase());
      const matchesLevel = levelFilter === "all" || l.level === levelFilter;
      return matchesQuery && matchesLevel;
    });
  }, [query, levelFilter]);

  const errorCount = MOCK_LOGS.filter((l) => l.level === "error").length;
  const warningCount = MOCK_LOGS.filter((l) => l.level === "warning").length;

  return (
    <>
      <style>{adminAnimationStyles}</style>
      <style>{`
        .admin-input { background: ${c.inputBg}; border: 1px solid ${c.divider}; color: ${c.text}; }
        .admin-input::placeholder { color: #989898; }
        .admin-filter-btn { border: 1px solid ${c.divider}; background: transparent; color: ${c.textSecondary}; }
        .admin-filter-btn.active { background: #2EBCCC; border-color: #2EBCCC; color: #fff; }
        .admin-log-row { background: ${c.cardBg}; border: 1px solid ${c.divider}; border-radius: 12px; padding: 12px 16px; display: flex; align-items: center; gap: 14px; }
        .admin-log-row + .admin-log-row { margin-top: 10px; }
        .admin-log-mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.78rem; }
      `}</style>

      <div className="page-enter">
        <AdminTopbar
          title={l2.title}
          subtitle={`${errorCount} ${l2.subtitleErrors} · ${warningCount} ${l2.subtitleWarnings}`}
          isDark={isDark}
        />

        <div style={{ padding: 28, background: c.mainBg, minHeight: "calc(100vh - 84px)" }}>
          <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 20 }}>
            <div className="relative flex-1" style={{ minWidth: 220 }}>
              <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#989898" }} />
              <input
                className="admin-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={l2.searchPlaceholder}
                style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, fontSize: "0.86rem", fontFamily: "inherit" }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {LEVEL_FILTERS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`admin-filter-btn ${levelFilter === lvl ? "active" : ""}`}
                  style={{ padding: "8px 14px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}
                >
                  {lvl === "all" ? l2.all : lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            {filtered.map((log, i) => (
              <div key={log.id} className="admin-log-row admin-row" style={{ animationDelay: `${i * 30}ms` }}>
                <div style={{ flexShrink: 0 }}>{LEVEL_ICON[log.level]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 3 }}>
                    <span className="admin-log-mono" style={{ color: "#2EBCCC", fontWeight: 700 }}>{log.endpoint}</span>
                    <span
                      className="admin-log-mono"
                      style={{
                        color: log.statusCode >= 500 ? "#FF0000" : log.statusCode >= 400 ? "#FFB200" : "#4AA825",
                      }}
                    >
                      {log.statusCode}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.84rem", color: c.text }}>{log.message}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <StatusBadge status={log.level} />
                  <div className="admin-log-mono" style={{ color: "#989898", marginTop: 4 }}>{log.latencyMs}ms</div>
                  <div className="admin-log-mono" style={{ color: "#989898" }}>{log.timestamp}</div>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#989898" }}>
                <ScrollText size={28} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                {l2.empty}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogsScreen;
