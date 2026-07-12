import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2, Globe, Link, Phone, Gift, CreditCard, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function SettingRow({ label, desc, settingKey, type = "text", placeholder, settings, onSave }: {
  label: string; desc?: string; settingKey: string; type?: string; placeholder?: string;
  settings: any[]; onSave: (key: string, value: string) => Promise<void>;
}) {
  const current = settings.find(s => s.key === settingKey)?.value || "";
  const [value, setValue] = useState(current);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { setValue(current); }, [current]);

  const save = async () => {
    setSaving(true);
    await onSave(settingKey, value);
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-slate-800/50 last:border-0">
      <div className="flex-1">
        <p className="text-white text-sm font-semibold">{label}</p>
        {desc && <p className="text-slate-500 text-xs mt-0.5">{desc}</p>}
      </div>
      <div className="flex gap-2 sm:w-72">
        <input
          type={type}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder || `Valeur pour ${label}`}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-green-500 min-w-0"
        />
        <button onClick={save} disabled={saving} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0 ${saved ? "bg-green-700 text-white" : "bg-green-600 hover:bg-green-500 text-white"} disabled:opacity-50`}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? "✓" : "Sauv."}
        </button>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-800 bg-slate-800/50">
        <Icon className="w-4 h-4 text-green-400" />
        <h3 className="text-white font-bold text-sm">{title}</h3>
      </div>
      <div className="px-5 py-1">{children}</div>
    </div>
  );
}

export function AdminSettings() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: settings = [], isLoading } = useQuery<any[]>({ queryKey: ["/api/admin/settings"] });

  const saveMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const r = await fetch(`/api/admin/settings/${encodeURIComponent(key)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value }), credentials: "include" });
      if (!r.ok) throw new Error("Erreur");
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/admin/settings"] }),
    onError: () => toast({ variant: "destructive", title: "Erreur de sauvegarde" }),
  });

  const onSave = async (key: string, value: string) => {
    await saveMutation.mutateAsync({ key, value });
  };

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-green-400" /></div>;

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Tchad */}
      <Section title="🇹🇩 Tchad — Paramètres de paiement" icon={CreditCard}>
        <SettingRow label="Lien de paiement (Tchad)" desc="URL vers la page de paiement pour les utilisateurs tchadiens" settingKey="payment_link_TD" placeholder="https://..." settings={settings} onSave={onSave} />
        <SettingRow label="Numéro Mobile Money (Tchad)" desc="Numéro de réception pour les dépôts depuis le Tchad" settingKey="payment_number_TD" placeholder="+235 XX XX XX XX" settings={settings} onSave={onSave} />
        <SettingRow label="Nom du titulaire (Tchad)" desc="Nom à afficher pour les paiements au Tchad" settingKey="payment_name_TD" placeholder="Nom Prénom" settings={settings} onSave={onSave} />
      </Section>

      {/* Niger */}
      <Section title="🇳🇪 Niger — Paramètres de paiement" icon={CreditCard}>
        <SettingRow label="Lien de paiement (Niger)" desc="URL vers la page de paiement pour les utilisateurs nigériens" settingKey="payment_link_NE" placeholder="https://..." settings={settings} onSave={onSave} />
        <SettingRow label="Numéro Mobile Money (Niger)" desc="Numéro de réception pour les dépôts depuis le Niger" settingKey="payment_number_NE" placeholder="+227 XX XX XX XX" settings={settings} onSave={onSave} />
        <SettingRow label="Nom du titulaire (Niger)" desc="Nom à afficher pour les paiements au Niger" settingKey="payment_name_NE" placeholder="Nom Prénom" settings={settings} onSave={onSave} />
      </Section>

      {/* Global payment */}
      <Section title="💰 Limites de transactions" icon={CreditCard}>
        <SettingRow label="Montant minimum de dépôt (FCFA)" settingKey="min_deposit" type="number" placeholder="3000" settings={settings} onSave={onSave} />
        <SettingRow label="Montant minimum de retrait (FCFA)" settingKey="min_withdrawal" type="number" placeholder="1000" settings={settings} onSave={onSave} />
        <SettingRow label="Lien de paiement (Fallback)" desc="Lien utilisé si aucun lien par pays n'est configuré" settingKey="payment_link" placeholder="https://..." settings={settings} onSave={onSave} />
      </Section>

      {/* Bonus */}
      <Section title="🎁 Bonus & Récompenses" icon={Gift}>
        <SettingRow label="Bonus d'inscription (FCFA)" desc="Montant crédité à chaque nouveau compte" settingKey="signup_bonus" type="number" placeholder="700" settings={settings} onSave={onSave} />
        <SettingRow label="Récompense check-in (FCFA)" desc="Montant pour la connexion journalière" settingKey="checkin_bonus" type="number" placeholder="50" settings={settings} onSave={onSave} />
      </Section>

      {/* External links */}
      <Section title="🔗 Liens externes" icon={Link}>
        <SettingRow label="Groupe WhatsApp" desc="Lien d'invitation vers le groupe WhatsApp" settingKey="whatsapp_link" placeholder="https://chat.whatsapp.com/..." settings={settings} onSave={onSave} />
        <SettingRow label="Canal Telegram" desc="Lien vers le canal Telegram officiel" settingKey="telegram_link" placeholder="https://t.me/..." settings={settings} onSave={onSave} />
        <SettingRow label="Support client (lien)" desc="Lien vers le chat de support" settingKey="support_link" placeholder="https://..." settings={settings} onSave={onSave} />
      </Section>

      {/* Contact */}
      <Section title="📞 Contact & Support" icon={Phone}>
        <SettingRow label="Numéro service client" desc="Numéro WhatsApp/téléphone du support" settingKey="support_phone" placeholder="+235 XX XX XX XX" settings={settings} onSave={onSave} />
        <SettingRow label="Email de support" settingKey="support_email" placeholder="support@greenix.com" settings={settings} onSave={onSave} />
      </Section>
    </div>
  );
}
