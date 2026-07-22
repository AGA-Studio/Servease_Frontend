import { useOutletContext } from "react-router-dom";
import {
  Users, FileText, Briefcase, Send, MessageSquare, AlertOctagon, TrendingUp, BarChart3, PieChart as PieChartIcon,
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import type { AdminOutletContext } from "../../layouts/AdminLayout";
import { ADMIN_KPIS, USER_GROWTH, DAILY_ACTIVITY, CATEGORY_BREAKDOWN } from "../../data/adminMockData";
import { AdminTopbar, KpiCard, ChartCard, adminAnimationStyles } from "../../components/admin/AdminUI";
import { useAdminTheme } from "../../components/admin/useAdminTheme";
import { useI18n } from "../../i18n";

interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  isDark: boolean;
  payload?: { dataKey: string; name: string; value: number; color: string }[];
}

const ChartTooltip = ({ active, payload, label, isDark }: ChartTooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: isDark ? "#1B244C" : "#ffffff",
        border: `1px solid ${isDark ? "#273570" : "#e5e7eb"}`,
        borderRadius: 10,
        padding: "8px 12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        fontSize: "0.78rem",
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4, color: isDark ? "#fff" : "#0f172a" }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

const AdminDashboardScreen: React.FC = () => {
  const { isDark } = useOutletContext<AdminOutletContext>();
  const c = useAdminTheme(isDark);
  const { t } = useI18n();
  const d = t("admin").dashboard;

  return (
    <>
      <style>{adminAnimationStyles}</style>
      <style>{`
        .admin-dash-grid { display: grid; grid-template-columns: 1.4fr 1fr; }
        @media (max-width: 900px) { .admin-dash-grid { grid-template-columns: 1fr; } }
      `}</style>
      <div className="page-enter">
        <AdminTopbar title={d.title} subtitle={d.subtitle} isDark={isDark} />

        <div style={{ padding: 28, background: c.mainBg, minHeight: "calc(100vh - 84px)" }}>
          <div className="flex gap-4 flex-wrap" style={{ marginBottom: 24 }}>
            <KpiCard delay={0} isDark={isDark} icon={<Users size={20} color="#2EBCCC" />} iconBg="rgba(46,188,204,0.15)" label={d.kpis.activeUsers} value={ADMIN_KPIS.activeUsersToday} trend={ADMIN_KPIS.activeUsersTrend} />
            <KpiCard delay={60} isDark={isDark} icon={<FileText size={20} color="#0432FF" />} iconBg="rgba(4,50,255,0.12)" label={d.kpis.newPosts} value={ADMIN_KPIS.newPosts} trend={ADMIN_KPIS.newPostsTrend} />
            <KpiCard delay={120} isDark={isDark} icon={<Briefcase size={20} color="#4AA825" />} iconBg="rgba(74,168,37,0.15)" label={d.kpis.newJobs} value={ADMIN_KPIS.newJobs} trend={ADMIN_KPIS.newJobsTrend} />
            <KpiCard delay={180} isDark={isDark} icon={<Send size={20} color="#FFB200" />} iconBg="rgba(255,178,0,0.15)" label={d.kpis.applications} value={ADMIN_KPIS.applications} trend={ADMIN_KPIS.applicationsTrend} />
            <KpiCard delay={240} isDark={isDark} icon={<MessageSquare size={20} color="#8B5CF6" />} iconBg="rgba(139,92,246,0.15)" label={d.kpis.messages} value={ADMIN_KPIS.messagesSent} trend={ADMIN_KPIS.messagesTrend} />
            <KpiCard delay={300} isDark={isDark} icon={<AlertOctagon size={20} color="#FF0000" />} iconBg="rgba(255,0,0,0.12)" label={d.kpis.errorRate} value={`${ADMIN_KPIS.apiErrorRate}%`} trend={ADMIN_KPIS.apiErrorRateTrend} />
          </div>

          <div className="admin-dash-grid gap-5" style={{ marginBottom: 20 }}>
            <ChartCard delay={80} isDark={isDark} title={d.userGrowth} icon={<TrendingUp size={18} color="#2EBCCC" />}>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={USER_GROWTH}>
                  <defs>
                    <linearGradient id="clientsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2EBCCC" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#2EBCCC" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="providersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0432FF" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#0432FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={c.divider} vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: c.textSecondary }} axisLine={{ stroke: c.divider }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: c.textSecondary }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip content={<ChartTooltip isDark={isDark} />} />
                  <Area type="monotone" dataKey="clients" name={d.clients} stroke="#2EBCCC" strokeWidth={2.5} fill="url(#clientsGrad)" animationDuration={900} />
                  <Area type="monotone" dataKey="providers" name={d.providers} stroke="#0432FF" strokeWidth={2.5} fill="url(#providersGrad)" animationDuration={900} animationBegin={150} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard delay={140} isDark={isDark} title={d.categoryBreakdown} icon={<PieChartIcon size={18} color="#2EBCCC" />}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={CATEGORY_BREAKDOWN}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={3}
                    animationDuration={900}
                  >
                    {CATEGORY_BREAKDOWN.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip isDark={isDark} />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: "0.75rem", color: c.textSecondary }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard delay={200} isDark={isDark} title={d.dailyActivity} icon={<BarChart3 size={18} color="#2EBCCC" />}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={DAILY_ACTIVITY} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke={c.divider} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: c.textSecondary }} axisLine={{ stroke: c.divider }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: c.textSecondary }} axisLine={false} tickLine={false} width={32} />
                <Tooltip content={<ChartTooltip isDark={isDark} />} cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }} />
                <Legend
                  formatter={(value) => <span style={{ fontSize: "0.78rem", color: c.textSecondary }}>{value}</span>}
                />
                <Bar dataKey="posts" name={d.posts} fill="#2EBCCC" radius={[6, 6, 0, 0]} animationDuration={800} />
                <Bar dataKey="applications" name={d.applications} fill="#0432FF" radius={[6, 6, 0, 0]} animationDuration={800} animationBegin={100} />
                <Bar dataKey="messages" name={d.messages} fill="#FFB200" radius={[6, 6, 0, 0]} animationDuration={800} animationBegin={200} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </>
  );
};

export default AdminDashboardScreen;
