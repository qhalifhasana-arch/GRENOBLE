import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, Lock, MessageSquare, Loader2, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getFlagForCountry } from "@/lib/countries";

export function AdminWithdrawals() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("pending");
  const [countryFilter, setCountryFilter] = useState("");
  const [loading, setLoading] = useState<number | null>(null);
  const [noteFor, setNoteFor] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");

  const { data: allTxs, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/transactions"] });
  const { data: allUsers } = useQuery<any[]>({ queryKey: ["/api/admin/users"] });

  const withdrawals = (allTxs || [])
    .filter(t => t.type === "withdrawal")
    .filter(t => !statusFilter || statusFilter === "all" || t.status === statusFilter)
    .filter(t => !countryFilter || t.userCountry === countryFilter);

  const txMutation = useMutation({
    mutationFn: async ({ id, status, note }: { id: number; status: string; note?: string }) => {
      const r = await fetch(`/api/admin/transactions/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, note }), credentials: "include" });
      if (!r.ok) throw new Error("Erreur");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/transactions"] }); toast({ title: "Retrait mis à jour" }); setLoading(null); setNoteFor(null); setNoteText(""); },
    onError: () => { toast({ variant: "destructive", title: "Erreur" }); setLoading(null); },
  });

  const blockUser = useMutation({
    mutationFn: async ({ userId, blocked }: { userId: number; blocked: boolean }) => {
      const r = await fetch(`/api/admin/users/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ withdrawalBlocked: blocked }), credentials: "include" });
      if (!r.ok) throw new Error("Erreur");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/users"] }); toast({ title: "Utilisateur mis à jour" }); },
    onError: () => toast({ variant: "destructive", title: "Erreur" }),
  });

  const handleAction = (id: number, status: string, note?: string) => {
    setLoading(id);
    txMutation.mutate({ id, status, note });
  };

  const isUserBlocked = (userId: number) => allUsers?.find(u => u.id === userId)?.withdrawalBlocked ?? false;

  const statusColor: Record<string, string> = { completed: "text-green-400 bg-green-900/30", pending: "text-amber-400 bg-amber-900/30", rejected: "text-red-400 bg-red-900/30" };
  const statusLabel: Record<string, string> = { completed: "Validé", pending: "En attente", rejected: "Refusé" };
  const countries = Array.from(new Set((allTxs || []).filter(t => t.type === "withdrawal").map(t => t.userCountry).filter(Boolean)));

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <Filter className="w-4 h-4 text-slate-400" />
        <div className="flex gap-1.5 flex-wrap">
          {[["all", "Tous"], ["pending", "En attente"], ["completed", "Validés"], ["rejected", "Refusés"]].map(([v, l]) => (
            <button key={v} onClick={() => setStatusFilter(v)} className={cn("px-3 py-1.5 rounded-lg text-xs font-bold transition-all", statusFilter === v ? "bg-green-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}>{l}</button>
          ))}
        </div>
        {countries.length > 0 && (
          <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} className="bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none">
            <option value="">Tous les pays</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
        <span className="text-slate-500 text-xs ml-auto">{withdrawals.length} résultat{withdrawals.length !== 1 ? "s" : ""}</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {["ID", "Utilisateur", "Pays", "N° Mobile", "Montant", "Date", "Statut", "Note", "Actions"].map(h => (
                    <th key={h} className="text-left text-slate-400 font-bold text-xs uppercase tracking-wider px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs">#{tx.id}</td>
                    <td className="px-4 py-3">
                      <p className="text-white font-semibold">{tx.userName}</p>
                      <p className="text-slate-400 text-xs">{tx.userPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap">{getFlagForCountry(tx.userCountry)} {tx.userCountry}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{tx.mobileDetails || "—"}</td>
                    <td className="px-4 py-3 text-red-400 font-bold whitespace-nowrap">{tx.amount?.toLocaleString()} F</td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{tx.createdAt ? format(new Date(tx.createdAt), "dd/MM/yy HH:mm") : ""}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", statusColor[tx.status])}>{statusLabel[tx.status] || tx.status}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs max-w-[120px] truncate">{tx.note || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {tx.status === "pending" && (
                          <>
                            <button onClick={() => handleAction(tx.id, "completed")} disabled={loading === tx.id} className="flex items-center gap-1 bg-green-900/40 hover:bg-green-900/70 text-green-400 rounded-lg px-2 py-1.5 text-xs font-bold transition-all disabled:opacity-50">
                              {loading === tx.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Valider
                            </button>
                            <button onClick={() => handleAction(tx.id, "rejected")} disabled={loading === tx.id} className="flex items-center gap-1 bg-red-900/40 hover:bg-red-900/70 text-red-400 rounded-lg px-2 py-1.5 text-xs font-bold transition-all disabled:opacity-50">
                              <XCircle className="w-3 h-3" /> Refuser
                            </button>
                          </>
                        )}
                        <button onClick={() => { setNoteFor(noteFor === tx.id ? null : tx.id); setNoteText(tx.note || ""); }} className="flex items-center gap-1 bg-blue-900/40 hover:bg-blue-900/70 text-blue-400 rounded-lg px-2 py-1.5 text-xs font-bold transition-all">
                          <MessageSquare className="w-3 h-3" /> Note
                        </button>
                        <button onClick={() => { const blocked = isUserBlocked(tx.userId); if (confirm(blocked ? "Débloquer les retraits ?" : "Bloquer les retraits de cet utilisateur ?")) blockUser.mutate({ userId: tx.userId, blocked: !blocked }); }} className="flex items-center gap-1 bg-orange-900/40 hover:bg-orange-900/70 text-orange-400 rounded-lg px-2 py-1.5 text-xs font-bold transition-all">
                          <Lock className="w-3 h-3" /> {isUserBlocked(tx.userId) ? "Débloquer" : "Bloquer"}
                        </button>
                      </div>
                      {noteFor === tx.id && (
                        <div className="mt-2 flex gap-2">
                          <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Note interne…" className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none" />
                          <button onClick={() => txMutation.mutate({ id: tx.id, status: tx.status, note: noteText })} className="bg-blue-600 text-white text-xs font-bold px-2 py-1.5 rounded-lg">OK</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {withdrawals.length === 0 && <div className="text-center text-slate-500 py-12">Aucun retrait trouvé</div>}
          </div>
        </div>
      )}
    </div>
  );
}
