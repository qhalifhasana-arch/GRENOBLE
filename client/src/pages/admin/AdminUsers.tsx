import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X, Loader2, Shield, Ban, Lock, Unlock, Trash2, KeyRound, Star, ChevronRight, User, ArrowDownCircle, ArrowUpCircle, BadgeCheck, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getFlagForCountry } from "@/lib/countries";

function badge(color: string, text: string) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${color}`}>{text}</span>;
}

function ActionBtn({ onClick, color, icon: Icon, label, disabled }: any) {
  return (
    <button onClick={onClick} disabled={disabled} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40", color)}>
      <Icon className="w-3.5 h-3.5" />{label}
    </button>
  );
}

function UserDetail({ userId, onClose }: { userId: number; onClose: () => void }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [balanceAction, setBalanceAction] = useState<"credit" | "debit" | "empty" | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPwReset, setShowPwReset] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "txs" | "investments">("info");

  const { data, isLoading } = useQuery<any>({ queryKey: [`/api/admin/users/${userId}`] });

  const patchUser = useMutation({
    mutationFn: async (updates: any) => {
      const r = await fetch(`/api/admin/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates), credentials: "include" });
      if (!r.ok) throw new Error("Erreur");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); qc.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] }); toast({ title: "Mis à jour" }); },
    onError: () => toast({ variant: "destructive", title: "Erreur" }),
  });

  const adjustBalance = useMutation({
    mutationFn: async ({ action, amount }: { action: string; amount: number }) => {
      const r = await fetch(`/api/admin/users/${userId}/balance`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, amount }), credentials: "include" });
      if (!r.ok) throw new Error((await r.json()).message);
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); qc.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] }); toast({ title: "Solde modifié" }); setBalanceAction(null); setBalanceAmount(""); },
    onError: (e: any) => toast({ variant: "destructive", title: "Erreur", description: e.message }),
  });

  const resetPw = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/admin/users/${userId}/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ newPassword }), credentials: "include" });
      if (!r.ok) throw new Error("Erreur");
      return r.json();
    },
    onSuccess: () => { toast({ title: "Mot de passe réinitialisé" }); setShowPwReset(false); setNewPassword(""); },
    onError: () => toast({ variant: "destructive", title: "Erreur" }),
  });

  const deleteAcc = useMutation({
    mutationFn: async () => {
      const r = await fetch(`/api/admin/users/${userId}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Erreur");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast({ title: "Compte supprimé" }); onClose(); },
    onError: () => toast({ variant: "destructive", title: "Erreur" }),
  });

  if (isLoading) return <div className="flex items-center justify-center h-40"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>;
  if (!data) return null;

  const u = data.user;
  const txs: any[] = data.transactions || [];
  const invs: any[] = data.investments || [];
  const txTypeLabel: Record<string, string> = { deposit: "Dépôt", withdrawal: "Retrait", daily_earning: "Gain journalier", referral_reward: "Commission", admin_credit: "Crédit admin", admin_debit: "Débit admin", admin_empty: "Vidage admin" };
  const statusColor: Record<string, string> = { completed: "text-green-400", pending: "text-amber-400", rejected: "text-red-400" };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-end md:justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-slate-900 w-full md:max-w-2xl md:rounded-2xl flex flex-col max-h-full md:max-h-[90vh] overflow-hidden border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-800 rounded-full flex items-center justify-center text-white font-bold">{u.firstName?.[0]}{u.lastName?.[0]}</div>
            <div>
              <p className="text-white font-bold">{u.firstName} {u.lastName}</p>
              <p className="text-slate-400 text-xs flex items-center gap-1">{getFlagForCountry(u.country)} {u.phoneNumber} · ID #{u.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 flex-shrink-0">
          {[["info", "Infos"], ["txs", "Transactions"], ["investments", "Investissements"]].map(([id, label]) => (
            <button key={id} onClick={() => setActiveTab(id as any)} className={cn("flex-1 py-2.5 text-xs font-bold transition-all", activeTab === id ? "text-green-400 border-b-2 border-green-400" : "text-slate-400 hover:text-white")}>{label}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === "info" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "Solde", value: `${u.balance?.toLocaleString()} F`, color: "text-green-400" },
                  { label: "Total dépôts", value: `${data.totalDeposits?.toLocaleString()} F`, color: "text-blue-400" },
                  { label: "Total retraits", value: `${data.totalWithdrawals?.toLocaleString()} F`, color: "text-red-400" },
                  { label: "Équipe", value: `${data.teamSize} membres`, color: "text-purple-400" },
                ].map(s => (
                  <div key={s.label} className="bg-slate-800 rounded-lg p-3 text-center">
                    <p className={`text-base font-black ${s.color}`}>{s.value}</p>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Info fields */}
              <div className="bg-slate-800 rounded-xl p-4 space-y-2.5 text-sm">
                {[
                  ["Pays", `${getFlagForCountry(u.country)} ${u.country}`],
                  ["Inscription", u.createdAt ? format(new Date(u.createdAt), "dd MMM yyyy HH:mm", { locale: fr }) : "—"],
                  ["Code parrainage", u.referralCode],
                  ["Parrain", data.referrer ? `${data.referrer.firstName} ${data.referrer.lastName} (${data.referrer.phoneNumber})` : "Aucun"],
                  ["Filleuls directs", data.directReferrals],
                  ["Paiement", u.paymentMethod ? `${u.paymentMethod} – ${u.paymentPhone}` : "Non configuré"],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between gap-2">
                    <span className="text-slate-400 font-medium flex-shrink-0">{k}</span>
                    <span className="text-white font-semibold text-right">{v}</span>
                  </div>
                ))}
              </div>

              {/* Statut badges */}
              <div className="flex flex-wrap gap-2">
                {u.isAdmin && badge("bg-red-900/50 text-red-300", "Admin")}
                {u.isPromoter && badge("bg-amber-900/50 text-amber-300", "Promoteur")}
                {u.isBanned && badge("bg-red-900/80 text-red-200", "Banni")}
                {u.withdrawalBlocked && badge("bg-orange-900/60 text-orange-300", "Retraits bloqués")}
                {!u.isBanned && !u.withdrawalBlocked && !u.isAdmin && badge("bg-green-900/50 text-green-300", "Actif")}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Actions</p>

                {/* Balance */}
                <div className="bg-slate-800 rounded-xl p-3 space-y-2">
                  <p className="text-white text-xs font-bold">Modifier le solde</p>
                  <div className="flex gap-2 flex-wrap">
                    {(["credit", "debit", "empty"] as const).map(a => (
                      <button key={a} onClick={() => setBalanceAction(balanceAction === a ? null : a)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold border transition-all", balanceAction === a ? "bg-green-600 text-white border-green-500" : "border-slate-600 text-slate-300 hover:border-slate-500")}>
                        {a === "credit" ? "➕ Crédit" : a === "debit" ? "➖ Débit" : "🗑️ Vider"}
                      </button>
                    ))}
                  </div>
                  {balanceAction && balanceAction !== "empty" && (
                    <input type="number" value={balanceAmount} onChange={e => setBalanceAmount(e.target.value)} placeholder="Montant FCFA" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                  )}
                  {balanceAction && (
                    <button onClick={() => adjustBalance.mutate({ action: balanceAction, amount: balanceAction === "empty" ? 0 : Number(balanceAmount) })} disabled={adjustBalance.isPending || (balanceAction !== "empty" && !balanceAmount)} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-lg text-sm disabled:opacity-50">
                      {adjustBalance.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirmer"}
                    </button>
                  )}
                </div>

                {/* Other actions */}
                <div className="flex flex-wrap gap-2">
                  <ActionBtn onClick={() => patchUser.mutate({ isBanned: !u.isBanned })} color={u.isBanned ? "bg-green-900/40 text-green-400 hover:bg-green-900/60" : "bg-red-900/40 text-red-400 hover:bg-red-900/60"} icon={u.isBanned ? Unlock : Ban} label={u.isBanned ? "Débannir" : "Bannir"} disabled={patchUser.isPending} />
                  <ActionBtn onClick={() => patchUser.mutate({ withdrawalBlocked: !u.withdrawalBlocked })} color={u.withdrawalBlocked ? "bg-green-900/40 text-green-400 hover:bg-green-900/60" : "bg-orange-900/40 text-orange-400 hover:bg-orange-900/60"} icon={u.withdrawalBlocked ? Unlock : Lock} label={u.withdrawalBlocked ? "Débloquer retraits" : "Bloquer retraits"} disabled={patchUser.isPending} />
                  <ActionBtn onClick={() => patchUser.mutate({ isAdmin: !u.isAdmin })} color="bg-purple-900/40 text-purple-400 hover:bg-purple-900/60" icon={Shield} label={u.isAdmin ? "Retirer admin" : "Nommer admin"} disabled={patchUser.isPending} />
                  <ActionBtn onClick={() => patchUser.mutate({ isPromoter: !u.isPromoter })} color="bg-amber-900/40 text-amber-400 hover:bg-amber-900/60" icon={Star} label={u.isPromoter ? "Retirer promoteur" : "Nommer promoteur"} disabled={patchUser.isPending} />
                  <ActionBtn onClick={() => setShowPwReset(!showPwReset)} color="bg-blue-900/40 text-blue-400 hover:bg-blue-900/60" icon={KeyRound} label="Réinitialiser MDP" />
                  <ActionBtn onClick={() => { if (confirm("Supprimer définitivement ce compte ?")) deleteAcc.mutate(); }} color="bg-red-950 text-red-400 hover:bg-red-900" icon={Trash2} label="Supprimer" disabled={deleteAcc.isPending} />
                </div>

                {showPwReset && (
                  <div className="bg-slate-800 rounded-xl p-3 space-y-2">
                    <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe (min 6 car.)" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                    <button onClick={() => resetPw.mutate()} disabled={resetPw.isPending || newPassword.length < 6} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm disabled:opacity-50">
                      {resetPw.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Confirmer"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "txs" && (
            <div className="space-y-2">
              {txs.length === 0 ? <p className="text-slate-500 text-center py-8">Aucune transaction</p> : txs.slice(0, 50).map((tx: any) => (
                <div key={tx.id} className="bg-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-semibold">{txTypeLabel[tx.type] || tx.type}</p>
                    <p className="text-slate-400 text-xs">{tx.method} · {tx.createdAt ? format(new Date(tx.createdAt), "dd/MM/yy HH:mm") : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-sm">{tx.amount?.toLocaleString()} F</p>
                    <span className={`text-xs font-bold ${statusColor[tx.status] || "text-slate-400"}`}>{tx.status === "completed" ? "Validé" : tx.status === "pending" ? "En attente" : "Refusé"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "investments" && (
            <div className="space-y-2">
              {invs.length === 0 ? <p className="text-slate-500 text-center py-8">Aucun investissement</p> : invs.map((inv: any) => (
                <div key={inv.id} className="bg-slate-800 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-bold">{inv.product?.name}</p>
                      <p className="text-slate-400 text-xs">Prix : {inv.product?.price?.toLocaleString()} F · Gain/j : {inv.product?.dailyRate?.toLocaleString()} F</p>
                    </div>
                    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", inv.status === "active" ? "bg-green-900/50 text-green-400" : "bg-slate-700 text-slate-400")}>{inv.status === "active" ? "Actif" : "Terminé"}</span>
                  </div>
                  {inv.startDate && <p className="text-slate-500 text-xs mt-1">Début : {format(new Date(inv.startDate), "dd MMM yyyy", { locale: fr })}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AdminUsers() {
  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const { data: users, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/users"] });

  const filtered = users?.filter(u => {
    const q = search.toLowerCase();
    return !q || u.phoneNumber?.includes(q) || `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) || u.id?.toString() === q;
  }) ?? [];

  return (
    <div className="p-4 md:p-6">
      {selectedUserId && <UserDetail userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par téléphone, nom, ID…" className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-green-600" />
        </div>
        <span className="text-slate-400 text-sm font-semibold">{filtered.length} utilisateur{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-400 font-bold text-xs uppercase tracking-wider px-4 py-3">ID</th>
                  <th className="text-left text-slate-400 font-bold text-xs uppercase tracking-wider px-4 py-3">Utilisateur</th>
                  <th className="text-left text-slate-400 font-bold text-xs uppercase tracking-wider px-4 py-3 hidden md:table-cell">Pays</th>
                  <th className="text-left text-slate-400 font-bold text-xs uppercase tracking-wider px-4 py-3">Solde</th>
                  <th className="text-left text-slate-400 font-bold text-xs uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Statut</th>
                  <th className="text-left text-slate-400 font-bold text-xs uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Inscription</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u: any) => (
                  <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/40 cursor-pointer transition-colors" onClick={() => setSelectedUserId(u.id)}>
                    <td className="px-4 py-3 text-slate-400 text-xs">#{u.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{u.firstName} {u.lastName}</div>
                      <div className="text-slate-400 text-xs">{u.phoneNumber}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-300 text-xs">{getFlagForCountry(u.country)} {u.country}</td>
                    <td className="px-4 py-3 text-green-400 font-bold">{u.balance?.toLocaleString()} F</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {u.isAdmin && badge("bg-red-900/50 text-red-300", "Admin")}
                        {u.isPromoter && badge("bg-amber-900/50 text-amber-300", "Promo")}
                        {u.isBanned && badge("bg-red-900/80 text-red-200", "Banni")}
                        {u.withdrawalBlocked && badge("bg-orange-900/60 text-orange-300", "Bloqué")}
                        {!u.isAdmin && !u.isBanned && !u.withdrawalBlocked && badge("bg-green-900/40 text-green-300", "Actif")}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-400 text-xs">{u.createdAt ? format(new Date(u.createdAt), "dd/MM/yyyy") : ""}</td>
                    <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-slate-600" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="text-center text-slate-500 py-12">Aucun utilisateur trouvé</div>}
          </div>
        </div>
      )}
    </div>
  );
}
