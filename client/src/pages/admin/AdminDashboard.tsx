import { useQuery } from "@tanstack/react-query";
import { Loader2, Users, UserCheck, TrendingUp, ArrowDownCircle, ArrowUpCircle, Clock, Banknote, AlertTriangle } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

function StatCard({ label, value, sub, icon: Icon, color, bg }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider leading-tight">{label}</p>
        <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
      <p className={`text-2xl font-black ${color} mb-0.5`}>{value}</p>
      {sub && <p className="text-slate-500 text-xs font-medium">{sub}</p>}
    </div>
  );
}

const fmt = (n: number) => n?.toLocaleString("fr-FR") ?? "0";

export function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["/api/admin/stats/full"],
    refetchInterval: 30000,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-green-400" />
    </div>
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Pending alerts */}
      {(stats?.pendingDepositsCount > 0 || stats?.pendingWithdrawalsCount > 0) && (
        <div className="flex flex-wrap gap-3">
          {stats?.pendingDepositsCount > 0 && (
            <div className="flex items-center gap-2 bg-amber-950/50 border border-amber-800/50 text-amber-400 rounded-lg px-4 py-2.5 text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" />
              {stats.pendingDepositsCount} dépôt{stats.pendingDepositsCount > 1 ? "s" : ""} en attente
            </div>
          )}
          {stats?.pendingWithdrawalsCount > 0 && (
            <div className="flex items-center gap-2 bg-red-950/50 border border-red-800/50 text-red-400 rounded-lg px-4 py-2.5 text-sm font-semibold">
              <AlertTriangle className="w-4 h-4" />
              {stats.pendingWithdrawalsCount} retrait{stats.pendingWithdrawalsCount > 1 ? "s" : ""} en attente
            </div>
          )}
        </div>
      )}

      {/* User stats */}
      <div>
        <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">👥 Utilisateurs</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total inscrits" value={fmt(stats?.totalUsers)} icon={Users} color="text-blue-400" bg="bg-blue-950/60" />
          <StatCard label="Aujourd'hui" value={fmt(stats?.registrationsToday)} sub="inscriptions" icon={UserCheck} color="text-green-400" bg="bg-green-950/60" />
          <StatCard label="Cette semaine" value={fmt(stats?.registrationsThisWeek)} sub="inscriptions" icon={TrendingUp} color="text-cyan-400" bg="bg-cyan-950/60" />
          <StatCard label="Ce mois" value={fmt(stats?.registrationsThisMonth)} sub="inscriptions" icon={TrendingUp} color="text-purple-400" bg="bg-purple-950/60" />
        </div>
      </div>

      <div>
        <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">📊 Activité</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <StatCard label="Utilisateurs actifs" value={fmt(stats?.activeUsers)} sub="avec VIP actif" icon={UserCheck} color="text-emerald-400" bg="bg-emerald-950/60" />
          <StatCard label="Dépôts en attente" value={fmt(stats?.pendingDepositsCount)} icon={Clock} color="text-amber-400" bg="bg-amber-950/60" />
          <StatCard label="Retraits en attente" value={fmt(stats?.pendingWithdrawalsCount)} icon={Clock} color="text-red-400" bg="bg-red-950/60" />
        </div>
      </div>

      {/* Financial stats */}
      <div>
        <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">💰 Finances</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total dépôts validés" value={`${fmt(stats?.totalDeposits)} F`} icon={ArrowDownCircle} color="text-green-400" bg="bg-green-950/60" />
          <StatCard label="Retraits validés" value={`${fmt(stats?.totalWithdrawalsCompleted)} F`} icon={ArrowUpCircle} color="text-red-400" bg="bg-red-950/60" />
          <StatCard label="Retraits en attente" value={`${fmt(stats?.totalWithdrawalsPending)} F`} icon={Banknote} color="text-amber-400" bg="bg-amber-950/60" />
          <StatCard label="Bénéfice estimé" value={`${fmt(stats?.estimatedProfit)} F`} icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-950/60" />
        </div>
      </div>

      {/* Charts */}
      {stats?.dailyStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-white text-sm font-bold mb-4">Inscriptions (7 jours)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="registrations" fill="#22c55e" radius={[4, 4, 0, 0]} name="Inscriptions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-white text-sm font-bold mb-4">Dépôts vs Retraits (7 jours)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={stats.dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#fff' }} formatter={(v: any) => `${Number(v).toLocaleString()} F`} />
                <Area type="monotone" dataKey="deposits" stroke="#22c55e" fill="#22c55e20" name="Dépôts" strokeWidth={2} />
                <Area type="monotone" dataKey="withdrawals" stroke="#f87171" fill="#f8717120" name="Retraits" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
