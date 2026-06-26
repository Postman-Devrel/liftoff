"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  getAllModulesIncludingPrivate,
  getAllLearningPathsIncludingPrivate,
} from "@/lib/content-loader";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DashboardStats {
  totalUsers: number;
  totalStepsCompleted: number;
  totalPointsEarned: number;
  totalModulesCompleted: number;
}

interface ActivityPoint {
  date: string;
  completions: number;
}

interface ModuleStat {
  moduleId: string;
  title: string;
  color: string;
  icon: string;
  totalSteps: number;
  usersStarted: number;
  usersCompleted: number;
  avgCompletion: number;
}

interface RankDist {
  rank: string;
  count: number;
  color: string;
  badge: string;
}

interface LeaderboardUser {
  userId: string;
  displayName: string;
  discordUsername: string;
  avatarUrl: string;
  totalPoints: number;
  totalSteps: number;
  rank: string;
  rankBadge: string;
  joinedAt: string;
}

interface DashboardData {
  stats: DashboardStats;
  activity: ActivityPoint[];
  moduleStats: ModuleStat[];
  rankDistribution: RankDist[];
  leaderboard: LeaderboardUser[];
}

interface UserDetailStep {
  stepId: string;
  title: string;
  lessonTitle: string;
  points: number;
  completed: boolean;
  completedAt: string | null;
}

interface UserDetailModule {
  moduleId: string;
  title: string;
  color: string;
  icon: string;
  totalSteps: number;
  completedSteps: number;
  steps: UserDetailStep[];
}

interface UserDetailData {
  profile: {
    id: string;
    displayName: string;
    discordUsername: string;
    avatarUrl: string;
    joinedAt: string;
  };
  stats: {
    totalPoints: number;
    totalSteps: number;
    rank: string;
    rankBadge: string;
    rankBadgeImg: string;
  };
  modules: UserDetailModule[];
  recentActivity: {
    stepId: string;
    stepTitle: string;
    moduleName: string;
    completedAt: string;
    points: number;
  }[];
}

// ─── Login Gate ──────────────────────────────────────────

function AdminLogin({ onAuth }: { onAuth: (pw: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/dashboard", {
      headers: { Authorization: `Bearer ${password}` },
    });

    if (res.ok) {
      sessionStorage.setItem("admin_password", password);
      onAuth(password);
    } else {
      setError("Invalid password");
    }
    setLoading(false);
  } 

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
          style={{
            background: "radial-gradient(circle, var(--purple), transparent)",
          }}
        />
      </div>
      <div className="glass-card p-10 w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🛡️</div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Mission Control
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Enter the admin password to access the dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--purple)] transition-colors mb-4"
            autoFocus
          />
          {error && (
            <p className="text-sm text-red-400 mb-4 text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="btn-primary w-full text-center"
          >
            {loading ? "Verifying…" : "Access Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: string;
  color: string;
}) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value === 0) return;
    const duration = 800;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayed(value);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="glass-card p-6 relative overflow-hidden group">
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl -translate-y-6 translate-x-6 group-hover:opacity-20 transition-opacity"
        style={{ background: color }}
      />
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
          {label}
        </span>
      </div>
      <p className="text-3xl font-black text-white font-mono">
        {displayed.toLocaleString()}
      </p>
    </div>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
  formatter?: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card !rounded-lg px-3 py-2 text-xs !border-white/20">
      <p className="text-[var(--text-tertiary)] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-mono font-bold" style={{ color: p.color }}>
          {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Activity Chart ──────────────────────────────────────

const TIME_RANGES = [
  { label: "30d", value: "30" },
  { label: "60d", value: "60" },
  { label: "90d", value: "90" },
  { label: "All", value: "all" },
];

function ActivityChart({
  data,
  activeDays,
  onDaysChange,
}: {
  data: ActivityPoint[];
  activeDays: string;
  onDaysChange: (days: string) => void;
}) {
  const [customDays, setCustomDays] = useState("");

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  const rangeLabel = activeDays === "all"
    ? "All Time"
    : `Last ${activeDays} Days`;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
          Step Completions — {rangeLabel}
        </h3>
        <div className="flex items-center gap-1">
          {TIME_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => onDaysChange(r.value)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                activeDays === r.value
                  ? "bg-[var(--orange)]/20 text-[var(--orange)]"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-white/5"
              }`}
            >
              {r.label}
            </button>
          ))}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const v = parseInt(customDays, 10);
              if (v > 0) onDaysChange(String(v));
            }}
            className="flex items-center"
          >
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value.replace(/\D/g, ""))}
              placeholder="#"
              className="w-10 px-1.5 py-1 rounded-lg text-[11px] font-mono bg-transparent border border-white/10 text-white placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--orange)]/40 text-center"
            />
          </form>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted}>
            <defs>
              <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6C37" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#FF6C37" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              content={<ChartTooltip formatter={(v) => `${v} completions`} />}
            />
            <Area
              type="monotone"
              dataKey="completions"
              stroke="#FF6C37"
              strokeWidth={2}
              fill="url(#activityGrad)"
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Module Chart ────────────────────────────────────────

function ModuleChart({ data }: { data: ModuleStat[] }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-6">
        Module Completion Rates
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              horizontal={false}
            />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="title"
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={160}
            />
            <Tooltip
              cursor={false}
              content={
                <ChartTooltip formatter={(v) => `${v}% avg completion`} />
              }
            />
            <Bar
              dataKey="avgCompletion"
              radius={[0, 6, 6, 0]}
              animationDuration={1000}
            >
              {data.map((entry) => (
                <Cell key={entry.moduleId} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-2">
        {data.map((mod) => (
          <div
            key={mod.moduleId}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-[var(--text-secondary)]">
              {mod.icon} {mod.title}
            </span>
            <span className="text-[var(--text-tertiary)] font-mono">
              {mod.usersStarted} started · {mod.usersCompleted} completed
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Rank Distribution ───────────────────────────────────

function RankChart({ data }: { data: RankDist[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-6">
        Rank Distribution
      </h3>
      <div className="h-64 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="rank"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              animationDuration={1000}
            >
              {data.map((entry) => (
                <Cell key={entry.rank} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload as RankDist;
                return (
                  <div className="glass-card !rounded-lg px-3 py-2 text-xs !border-white/20">
                    <p className="font-bold text-white">
                      {d.badge} {d.rank}
                    </p>
                    <p className="text-[var(--text-secondary)] font-mono">
                      {d.count} users (
                      {total > 0 ? Math.round((d.count / total) * 100) : 0}%)
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.map((d) => (
          <div key={d.rank} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: d.color }}
            />
            <span className="text-[var(--text-secondary)] truncate">
              {d.badge} {d.rank}
            </span>
            <span className="text-[var(--text-tertiary)] font-mono ml-auto">
              {d.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Leaderboard ─────────────────────────────────────────

function Leaderboard({
  users,
  onSelect,
}: {
  users: LeaderboardUser[];
  onSelect: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"points" | "steps" | "joined">(
    "points"
  );

  const filtered = useMemo(() => {
    let result = users;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.discordUsername.toLowerCase().includes(q)
      );
    }
    return [...result].sort((a, b) => {
      if (sortBy === "points") return b.totalPoints - a.totalPoints;
      if (sortBy === "steps") return b.totalSteps - a.totalSteps;
      return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime();
    });
  }, [users, search, sortBy]);

  return (
    <div className="glass-card p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--text-tertiary)]">
          Leaderboard
        </h3>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users…"
              className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--purple)] transition-colors"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "points" | "steps" | "joined")
            }
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-[var(--text-secondary)] focus:outline-none focus:border-[var(--purple)] transition-colors"
          >
            <option value="points">Points</option>
            <option value="steps">Steps</option>
            <option value="joined">Joined</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--text-tertiary)] text-xs font-mono uppercase tracking-wider">
              <th className="text-left py-3 px-2 w-12">#</th>
              <th className="text-left py-3 px-2">User</th>
              <th className="text-right py-3 px-2">Points</th>
              <th className="text-right py-3 px-2 hidden sm:table-cell">
                Steps
              </th>
              <th className="text-left py-3 px-2 hidden md:table-cell">
                Rank
              </th>
              <th className="text-right py-3 px-2 hidden lg:table-cell">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <tr
                key={user.userId}
                onClick={() => onSelect(user.userId)}
                className="border-t border-white/5 hover:bg-white/[0.03] cursor-pointer transition-colors group"
              >
                <td className="py-3 px-2">
                  <span
                    className={`font-mono text-xs ${
                      i < 3
                        ? "font-bold text-[var(--orange)]"
                        : "text-[var(--text-tertiary)]"
                    }`}
                  >
                    {i + 1}
                  </span>
                </td>
                <td className="py-3 px-2">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt=""
                        className="w-8 h-8 rounded-full border border-white/10"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                        {user.displayName[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate group-hover:text-[var(--orange)] transition-colors">
                        {user.displayName}
                      </p>
                      {user.discordUsername && (
                        <p className="text-xs text-[var(--text-tertiary)] truncate">
                          @{user.discordUsername}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="font-mono font-bold text-[var(--orange)]">
                    {user.totalPoints.toLocaleString()}
                  </span>
                </td>
                <td className="py-3 px-2 text-right hidden sm:table-cell">
                  <span className="font-mono text-[var(--text-secondary)]">
                    {user.totalSteps}
                  </span>
                </td>
                <td className="py-3 px-2 hidden md:table-cell">
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span>{user.rankBadge}</span>
                    <span className="text-[var(--text-secondary)]">
                      {user.rank}
                    </span>
                  </span>
                </td>
                <td className="py-3 px-2 text-right hidden lg:table-cell">
                  <span className="text-xs text-[var(--text-tertiary)] font-mono">
                    {new Date(user.joinedAt).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-[var(--text-tertiary)]">
          {search ? "No users match your search" : "No users yet"}
        </div>
      )}

      <div className="mt-4 text-xs text-[var(--text-tertiary)] text-center font-mono">
        {filtered.length} of {users.length} users
      </div>
    </div>
  );
}

// ─── User Detail Panel ───────────────────────────────────

function UserDetailPanel({
  userId,
  password,
  onClose,
}: {
  userId: string;
  password: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${password}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId, password]);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg z-50 overflow-y-auto bg-[var(--bg-surface)] border-l border-white/10 shadow-2xl animate-slide-in">
        <div className="sticky top-0 z-10 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">User Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[var(--text-tertiary)] hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--purple)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <div className="text-center py-20 text-[var(--text-tertiary)]">
            User not found
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Profile */}
            <div className="flex items-center gap-4">
              {data.profile.avatarUrl ? (
                <img
                  src={data.profile.avatarUrl}
                  alt=""
                  className="w-16 h-16 rounded-full border-2 border-[#5865F2]"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#5865F2] flex items-center justify-center text-2xl font-bold text-white">
                  {data.profile.displayName[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-white">
                  {data.profile.displayName}
                </h3>
                {data.profile.discordUsername && (
                  <p className="text-sm text-[var(--text-tertiary)]">
                    @{data.profile.discordUsername}
                  </p>
                )}
                <p className="text-xs text-[var(--text-tertiary)] mt-1 font-mono">
                  Joined{" "}
                  {new Date(data.profile.joinedAt).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card p-4 text-center">
                <p className="text-2xl font-black font-mono text-[var(--orange)]">
                  {data.stats.totalPoints.toLocaleString()}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Points
                </p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-2xl font-black font-mono text-[var(--cyan)]">
                  {data.stats.totalSteps}
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Steps
                </p>
              </div>
              <div className="glass-card p-4 text-center">
                <p className="text-lg mb-0.5">{data.stats.rankBadge}</p>
                <p className="text-xs text-[var(--text-secondary)] font-medium">
                  {data.stats.rank}
                </p>
              </div>
            </div>

            {/* Module Progress */}
            <div>
              <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
                Module Progress
              </h4>
              <div className="space-y-2">
                {data.modules.map((mod) => {
                  const pct =
                    mod.totalSteps > 0
                      ? Math.round(
                          (mod.completedSteps / mod.totalSteps) * 100
                        )
                      : 0;
                  const isExpanded = expandedModule === mod.moduleId;

                  return (
                    <div key={mod.moduleId} className="glass-card overflow-hidden">
                      <button
                        onClick={() =>
                          setExpandedModule(isExpanded ? null : mod.moduleId)
                        }
                        className="w-full p-4 flex items-center gap-3 hover:bg-white/[0.02] transition-colors text-left"
                      >
                        <span className="text-xl flex-shrink-0">
                          {mod.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <p className="text-sm font-medium text-white truncate">
                              {mod.title}
                            </p>
                            <span
                              className="text-xs font-mono ml-2 flex-shrink-0"
                              style={{ color: mod.color }}
                            >
                              {mod.completedSteps}/{mod.totalSteps}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${pct}%`,
                                background: mod.color,
                              }}
                            />
                          </div>
                        </div>
                        <svg
                          className={`w-4 h-4 text-[var(--text-tertiary)] flex-shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-white/5">
                          <div className="mt-3 space-y-1.5">
                            {mod.steps.map((step) => (
                              <div
                                key={step.stepId}
                                className="flex items-center gap-2 text-xs py-1"
                              >
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                                    step.completed
                                      ? "bg-[var(--green)]/20 text-[var(--green)]"
                                      : "bg-white/5 text-[var(--text-tertiary)]"
                                  }`}
                                >
                                  {step.completed ? "✓" : "·"}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`truncate ${step.completed ? "text-[var(--text-secondary)]" : "text-[var(--text-tertiary)]"}`}
                                  >
                                    {step.title}
                                  </p>
                                  <p className="text-[var(--text-tertiary)] truncate">
                                    {step.lessonTitle}
                                  </p>
                                </div>
                                <span className="font-mono text-[var(--text-tertiary)] flex-shrink-0">
                                  {step.points} pts
                                </span>
                                {step.completedAt && (
                                  <span className="font-mono text-[var(--text-tertiary)] flex-shrink-0 hidden sm:inline">
                                    {new Date(
                                      step.completedAt
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            {data.recentActivity.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-3">
                  Recent Activity
                </h4>
                <div className="space-y-2">
                  {data.recentActivity.map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-xs py-1.5"
                    >
                      <span className="w-5 h-5 rounded-md bg-[var(--green)]/20 text-[var(--green)] flex items-center justify-center flex-shrink-0">
                        ✓
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--text-secondary)] truncate">
                          {a.stepTitle}
                        </p>
                        <p className="text-[var(--text-tertiary)] truncate">
                          {a.moduleName}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-mono text-[var(--orange)]">
                          +{a.points}
                        </p>
                        <p className="font-mono text-[var(--text-tertiary)]">
                          {new Date(a.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ─── Dashboard ───────────────────────────────────────────

function Dashboard({ password }: { password: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [activityDays, setActivityDays] = useState<string>("30");
  const [tab, setTab] = useState<"analytics" | "private">(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("tab") === "private"
        ? "private"
        : "analytics";
    }
    return "analytics";
  });

  function handleTabChange(newTab: "analytics" | "private") {
    setTab(newTab);
    window.history.replaceState(null, "", `/admin?tab=${newTab}`);
  }

  const fetchData = useCallback((daysOverride?: string) => {
    setLoading(true);
    const d = daysOverride ?? activityDays;
    fetch(`/api/admin/dashboard?days=${d}`, {
      headers: { Authorization: `Bearer ${password}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [password, activityDays]);

  function handleRefresh() {
    fetchData();
  }

  function handleDaysChange(days: string) {
    setActivityDays(days);
    fetchData(days);
  }

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleLogout() {
    sessionStorage.removeItem("admin_password");
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[var(--purple)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)] text-sm">
            Loading mission data…
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card p-8 text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-white font-medium mb-2">Failed to load data</p>
          <p className="text-sm text-[var(--text-tertiary)] mb-4">{error}</p>
          <button onClick={handleRefresh} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/5 bg-[var(--bg-surface)]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <h1 className="text-lg font-bold text-white">
                <span>Lift</span>
                <span className="gradient-text">Off</span>
                <span className="text-[var(--text-tertiary)] font-normal ml-2">
                  Mission Control
                </span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => handleTabChange("analytics")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === "analytics"
                    ? "bg-[var(--purple)] text-white"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => handleTabChange("private")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  tab === "private"
                    ? "bg-[var(--purple)] text-white"
                    : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
                }`}
              >
                Private
              </button>
            </div>
            <button
              onClick={handleRefresh}
              className="btn-ghost !py-2 !px-4 text-xs flex items-center gap-2"
              title="Refresh data"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {tab === "private" && <PrivatePreview />}

      {tab === "analytics" && <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Users"
            value={data.stats.totalUsers}
            icon="👥"
            color="var(--purple)"
          />
          <StatCard
            label="Steps Completed"
            value={data.stats.totalStepsCompleted}
            icon="✅"
            color="var(--green)"
          />
          <StatCard
            label="Points Earned"
            value={data.stats.totalPointsEarned}
            icon="⚡"
            color="var(--orange)"
          />
          <StatCard
            label="Module Completions"
            value={data.stats.totalModulesCompleted}
            icon="🏆"
            color="var(--cyan)"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <ActivityChart data={data.activity} activeDays={activityDays} onDaysChange={handleDaysChange} />
          <ModuleChart data={data.moduleStats} />
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <RankChart data={data.rankDistribution} />
          <div className="lg:col-span-2">
            <TopLearnersChart
              users={data.leaderboard.slice(0, 10)}
            />
          </div>
        </div>

        {/* Leaderboard */}
        <Leaderboard
          users={data.leaderboard}
          onSelect={setSelectedUser}
        />
      </main>}

      {/* User Detail */}
      {selectedUser && (
        <UserDetailPanel
          userId={selectedUser}
          password={password}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

// ─── Private Preview ─────────────────────────────────────

function PrivatePreview() {
  const privateModules = getAllModulesIncludingPrivate().filter((m) => m.private);
  const privatePaths = getAllLearningPathsIncludingPrivate().filter((p) => p.private);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-2">
        <h2 className="text-lg font-bold text-white">Private Content</h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">
          Hidden from public users. Click any item to test it.
        </p>
      </div>

      {privatePaths.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-4">
            Learning Paths ({privatePaths.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {privatePaths.map((path) => (
              <Link
                key={path.id}
                href={`/learning-paths/${path.id}`}
                className="glass-card p-5 hover:border-[var(--purple)]/50 transition-all group block"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{path.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white group-hover:text-[var(--purple)] transition-colors truncate">
                        {path.title}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 shrink-0">
                        PRIVATE
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] line-clamp-2">
                      {path.description}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] mt-2">
                      {path.moduleIds.length} module{path.moduleIds.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {privateModules.length > 0 && (
        <section className="mt-8">
          <h3 className="text-xs font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-4">
            Modules ({privateModules.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {privateModules.map((mod) => {
              const totalSteps = mod.lessons.reduce(
                (sum, l) => sum + l.steps.length,
                0
              );
              const firstSlug = mod.lessons[0]?.slug;
              const href = firstSlug
                ? `/modules/${mod.id}/${firstSlug}`
                : `/modules/${mod.id}`;
              return (
                <Link
                  key={mod.id}
                  href={href}
                  className="glass-card p-5 hover:border-[var(--purple)]/50 transition-all group block"
                  style={{ borderLeftColor: mod.color, borderLeftWidth: 3 }}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={`/api/modules/${mod.id}/badge`}
                      alt=""
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-white group-hover:text-[var(--purple)] transition-colors truncate">
                          {mod.title}
                        </h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 shrink-0">
                          PRIVATE
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)] line-clamp-2">
                        {mod.description}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)] mt-2">
                        {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""} · {totalSteps} step{totalSteps !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {privateModules.length === 0 && privatePaths.length === 0 && (
        <div className="mt-16 text-center text-[var(--text-tertiary)] text-sm">
          No private content found.
        </div>
      )}
    </div>
  );
}

// ─── Top Learners Chart ──────────────────────────────────

function TopLearnersChart({ users }: { users: LeaderboardUser[] }) {
  const chartData = [...users]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((u) => ({
      name:
        u.displayName.length > 14
          ? u.displayName.slice(0, 14) + "…"
          : u.displayName,
      points: u.totalPoints,
      badge: u.rankBadge,
    }));

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-mono uppercase tracking-widest text-[var(--text-tertiary)] mb-6">
        Top 10 Learners
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip
              cursor={false}
              content={
                <ChartTooltip formatter={(v) => `${v.toLocaleString()} pts`} />
              }
            />
            <Bar
              dataKey="points"
              radius={[0, 6, 6, 0]}
              animationDuration={1000}
            >
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    i === 0
                      ? "#FF6C37"
                      : i === 1
                        ? "#EC4899"
                        : i === 2
                          ? "#8B5CF6"
                          : "rgba(139, 92, 246, 0.4)"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Page Entry ──────────────────────────────────────────

export default function AdminPage() {
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_password");
    if (stored) setPassword(stored);
  }, []);

  if (!password) return <AdminLogin onAuth={setPassword} />;
  return <Dashboard password={password} />;
}
