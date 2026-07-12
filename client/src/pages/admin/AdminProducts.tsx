import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Loader2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function ProductForm({ initial, onSubmit, onCancel, loading }: { initial?: any; onSubmit: (d: any) => void; onCancel: () => void; loading: boolean }) {
  const [form, setForm] = useState(initial || { name: "", price: "", dailyRate: "", duration: 60, totalReturn: "", vipLevel: "", description: "", isActive: true });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Nom</label>
          <input value={form.name} onChange={e => set("name", e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Niveau VIP</label>
          <input type="number" value={form.vipLevel} onChange={e => set("vipLevel", e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Prix (FCFA)</label>
          <input type="number" value={form.price} onChange={e => set("price", e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Gain/jour (FCFA)</label>
          <input type="number" value={form.dailyRate} onChange={e => set("dailyRate", e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Durée (jours)</label>
          <input type="number" value={form.duration} onChange={e => set("duration", e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
        </div>
        <div>
          <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Retour total (FCFA)</label>
          <input type="number" value={form.totalReturn} onChange={e => set("totalReturn", e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
        </div>
        <div className="col-span-2">
          <label className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Description</label>
          <input value={form.description || ""} onChange={e => set("description", e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive} onChange={e => set("isActive", e.target.checked)} className="hidden" />
          <div className={cn("w-10 h-5 rounded-full transition-all relative", form.isActive ? "bg-green-500" : "bg-slate-600")} onClick={() => set("isActive", !form.isActive)}>
            <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all", form.isActive ? "left-5" : "left-0.5")} />
          </div>
          <span className="text-slate-300 text-sm font-semibold">{form.isActive ? "Actif" : "Inactif"}</span>
        </label>
        <div className="ml-auto flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm font-bold hover:bg-slate-600 transition-all flex items-center gap-1.5"><X className="w-3.5 h-3.5" /> Annuler</button>
          <button onClick={() => onSubmit({ ...form, price: Number(form.price), dailyRate: Number(form.dailyRate), duration: Number(form.duration), totalReturn: Number(form.totalReturn), vipLevel: Number(form.vipLevel) })} disabled={loading} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminProducts() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [editId, setEditId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const { data: products, isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/products"] });

  const updateProduct = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const r = await fetch(`/api/admin/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!r.ok) throw new Error("Erreur");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/products"] }); toast({ title: "Produit mis à jour" }); setEditId(null); setLoadingId(null); },
    onError: () => { toast({ variant: "destructive", title: "Erreur" }); setLoadingId(null); },
  });

  const createProduct = useMutation({
    mutationFn: async (data: any) => {
      const r = await fetch("/api/admin/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data), credentials: "include" });
      if (!r.ok) throw new Error("Erreur");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/products"] }); toast({ title: "Produit créé" }); setShowCreate(false); },
    onError: () => toast({ variant: "destructive", title: "Erreur" }),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      const r = await fetch(`/api/admin/products/${id}`, { method: "DELETE", credentials: "include" });
      if (!r.ok) throw new Error("Erreur");
      return r.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/admin/products"] }); toast({ title: "Produit supprimé" }); },
    onError: () => toast({ variant: "destructive", title: "Erreur" }),
  });

  const toggleActive = (p: any) => { setLoadingId(p.id); updateProduct.mutate({ id: p.id, data: { isActive: !p.isActive } }); };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>;

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">{products?.length} produits</p>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white rounded-xl px-4 py-2.5 text-sm font-bold transition-all">
          <Plus className="w-4 h-4" /> Nouveau produit
        </button>
      </div>

      {showCreate && (
        <ProductForm
          onSubmit={(d) => createProduct.mutate(d)}
          onCancel={() => setShowCreate(false)}
          loading={createProduct.isPending}
        />
      )}

      <div className="space-y-3">
        {products?.map((p: any) => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {editId === p.id ? (
              <div className="p-4">
                <ProductForm
                  initial={p}
                  onSubmit={(d) => updateProduct.mutate({ id: p.id, data: d })}
                  onCancel={() => setEditId(null)}
                  loading={updateProduct.isPending && loadingId === p.id}
                />
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0", p.isActive ? "bg-green-700" : "bg-slate-700")}>
                  V{p.vipLevel}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-white font-bold">{p.name}</p>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", p.isActive ? "bg-green-900/50 text-green-400" : "bg-slate-700 text-slate-400")}>{p.isActive ? "Actif" : "Inactif"}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
                    <span className="text-slate-400 text-xs">💰 {p.price?.toLocaleString()} F</span>
                    <span className="text-green-400 text-xs">📈 +{p.dailyRate?.toLocaleString()} F/j</span>
                    <span className="text-slate-400 text-xs">⏳ {p.duration}j</span>
                    <span className="text-amber-400 text-xs">🏆 {p.totalReturn?.toLocaleString()} F</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(p)} disabled={loadingId === p.id} className="text-slate-400 hover:text-white transition-colors disabled:opacity-50">
                    {loadingId === p.id ? <Loader2 className="w-5 h-5 animate-spin" /> : p.isActive ? <ToggleRight className="w-5 h-5 text-green-400" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => setEditId(p.id)} className="text-slate-400 hover:text-blue-400 transition-colors p-1">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { if (confirm(`Supprimer ${p.name} ?`)) deleteProduct.mutate(p.id); }} className="text-slate-400 hover:text-red-400 transition-colors p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
