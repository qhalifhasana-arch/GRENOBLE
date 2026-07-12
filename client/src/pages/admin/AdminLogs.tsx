import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useQueryClient } from "@tanstack/react-query";

export function AdminLogs() {
  const qc = useQueryClient();
  const { data: logs, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/logs"], refetchInterval: 30000 });

  const actionColor = (action: string) => {
    if (action.includes("Suppression") || action.includes("Banni")) return "text-red-400 bg-red-950/30";
    if (action.includes("Crédit") || action.includes("validé") || action.includes("créé")) return "text-green-400 bg-green-950/30";
    if (action.includes("Modification") || action.includes("mise à jour") || action.includes("modifié")) return "text-blue-400 bg-blue-950/30";
    if (action.includes("Réinitialisation") || action.includes("bloqué") || action.includes("Bloqu")) return "text-amber-400 bg-amber-950/30";
    return "text-slate-300 bg-slate-800/50";
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{logs?.length || 0} entrée{(logs?.length || 0) !== 1 ? "s" : ""} dans le journal</p>
        <button onClick={() => qc.invalidateQueries({ queryKey: ["/api/admin/logs"] })} className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg px-3 py-2 text-xs font-bold transition-all">
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-slate-400 font-bold text-xs uppercase tracking-wider px-4 py-3">Date & Heure</th>
                  <th className="text-left text-slate-400 font-bold text-xs uppercase tracking-wider px-4 py-3">Administrateur</th>
                  <th className="text-left text-slate-400 font-bold text-xs uppercase tracking-wider px-4 py-3">Action</th>
                  <th className="text-left text-slate-400 font-bold text-xs uppercase tracking-wider px-4 py-3">Utilisateur cible</th>
                </tr>
              </thead>
              <tbody>
                {logs?.map((log: any) => (
                  <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">
                      {log.createdAt ? format(new Date(log.createdAt), "dd MMM yyyy HH:mm:ss", { locale: fr }) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-semibold text-xs">{log.adminName}</span>
                      <span className="text-slate-500 text-xs ml-1">(#{log.adminId})</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${actionColor(log.action)}`}>{log.action}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {log.targetUserId ? `#${log.targetUserId}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!logs || logs.length === 0) && (
              <div className="text-center text-slate-500 py-12">Aucune activité enregistrée</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
