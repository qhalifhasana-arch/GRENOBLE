import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LogOut, Shield, User, Settings, CreditCard, ChevronRight,
  Sprout, Loader2, Wallet, Phone,
  MapPin, Lock, Landmark, Bell, MessageCircle
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Investment, Product, Transaction } from "@shared/schema";
import { api } from "@shared/routes";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { getFlagForCountry } from "@/lib/countries";

const PAYMENT_METHODS_LIST = [
  "TMoney", "Flooz", "MTN MoMo", "Moov Money", "Orange Money", "Wave", "Mobile Money Congo"
];

export default function Account() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [paymentPhone, setPaymentPhone] = useState(user?.paymentPhone || "");
  const [paymentMethod, setPaymentMethod] = useState(user?.paymentMethod || "");
  const [paymentName, setPaymentName] = useState(user?.paymentName || "");

  const savePaymentMutation = useMutation({
    mutationFn: async (data: { paymentPhone: string; paymentMethod: string; paymentName: string }) => {
      const res = await fetch(api.profile.updatePayment.path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Erreur de sauvegarde");
      return res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      setPaymentPhone(updatedUser.paymentPhone || "");
      setPaymentMethod(updatedUser.paymentMethod || "");
      setPaymentName(updatedUser.paymentName || "");
      toast({ title: "Informations de paiement sauvegardées" });
    },
    onError: () => {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de sauvegarder" });
    },
  });

  const { data: investments, isLoading: loadingInvestments } = useQuery<(Investment & { product: Product })[]>({
    queryKey: [api.investments.list.path],
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: [api.transactions.list.path],
  });

  const totalEarnings = transactions?.filter(t =>
    (t.type === 'daily_earning' || t.type === 'referral_reward') && t.status === 'completed'
  ).reduce((sum, t) => sum + t.amount, 0) || 0;

  const countryFlag = getFlagForCountry(user?.country || "");

  const renderSection = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-4 pt-4 px-5">
            <div className="flex items-center gap-4 mb-5">
              <Avatar className="w-14 h-14 border-2 border-primary/20">
                <AvatarFallback className="bg-primary text-white text-lg font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-base font-extrabold text-gray-900">{user?.firstName} {user?.lastName}</h2>
                <p className="text-xs text-gray-400">Membre depuis {format(new Date(user?.createdAt || Date.now()), 'MMMM yyyy', { locale: fr })}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100">
                <Phone className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Téléphone</p>
                  <p className="text-sm font-semibold text-gray-800">{user?.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-gray-100">
                <MapPin className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">Pays</p>
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <span>{countryFlag}</span> {user?.country}
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full rounded-xl border-gray-200 font-semibold" onClick={() => setActiveTab(null)}>Retour</Button>
          </div>
        );
      case "bank":
        return (
          <div className="space-y-4 pt-4 px-5">
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-5 rounded-2xl text-white shadow-md">
              <div className="flex justify-between items-start mb-6">
                <Landmark className="w-6 h-6 opacity-70" />
                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest opacity-60">Mobile Money</p>
                  <p className="font-bold text-sm">{user?.paymentMethod || "Non configuré"}</p>
                </div>
              </div>
              <p className="text-lg font-mono tracking-wider mb-1.5">
                {user?.paymentPhone
                  ? `•••• •••• ${user.paymentPhone.slice(-4)}`
                  : "Aucun numéro"}
              </p>
              <div>
                <p className="text-[8px] uppercase opacity-50">Titulaire</p>
                <p className="text-xs font-bold uppercase">{user?.paymentName || `${user?.firstName} ${user?.lastName}`}</p>
              </div>
            </div>

            <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardHeader className="px-5 py-4 border-b border-gray-50">
                <CardTitle className="text-sm font-extrabold text-gray-800">Modifier mes informations</CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nom du titulaire</Label>
                  <Input
                    placeholder="Prénom et Nom"
                    className="rounded-xl h-11 bg-gray-50 border-gray-100 font-medium"
                    value={paymentName}
                    onChange={(e) => setPaymentName(e.target.value)}
                    data-testid="input-payment-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Numéro Mobile Money</Label>
                  <Input
                    type="tel"
                    placeholder="90123456"
                    className="rounded-xl h-11 bg-gray-50 border-gray-100 font-medium"
                    value={paymentPhone}
                    onChange={(e) => setPaymentPhone(e.target.value)}
                    data-testid="input-payment-phone"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Opérateur</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS_LIST.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={cn(
                          "py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all active:scale-95",
                          paymentMethod === method
                            ? "bg-primary text-white border-primary shadow-sm"
                            : "bg-white border-gray-100 text-gray-600 hover:border-gray-200"
                        )}
                        data-testid={`button-method-${method.replace(/\s+/g, '-').toLowerCase()}`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white font-bold rounded-xl shadow-sm mt-1"
                  onClick={() => savePaymentMutation.mutate({ paymentPhone, paymentMethod, paymentName })}
                  disabled={savePaymentMutation.isPending || !paymentPhone || !paymentMethod || !paymentName}
                  data-testid="button-save-payment"
                >
                  {savePaymentMutation.isPending ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : null}
                  Sauvegarder
                </Button>
              </CardContent>
            </Card>
            <Button variant="outline" className="w-full rounded-xl border-gray-200 font-semibold" onClick={() => setActiveTab(null)} data-testid="button-back-bank">Retour</Button>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-3 pt-4 px-5">
            <h3 className="font-extrabold text-sm text-gray-800 px-1">Paramètres</h3>
            <Button variant="ghost" className="w-full justify-between h-13 bg-white rounded-xl border border-gray-100 px-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Lock className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-semibold">Changer le mot de passe</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </Button>
            <Button variant="ghost" className="w-full justify-between h-13 bg-white rounded-xl border border-gray-100 px-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Bell className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-semibold">Notifications</span>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100 text-[10px] font-bold">Activé</Badge>
            </Button>
            <Button variant="outline" className="w-full mt-2 rounded-xl border-gray-200 font-semibold" onClick={() => setActiveTab(null)}>Retour</Button>
          </div>
        );
      case "about":
        return (
          <div className="space-y-5 pt-4 px-5">
            <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
              <h3 className="text-base font-extrabold text-primary mb-2">À propos</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                GreenHarvest est une plateforme d'investissement agricole conçue pour connecter les investisseurs aux opportunités de croissance en Afrique.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-primary/10 p-2.5 rounded-xl h-fit">
                  <Sprout className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 mb-1">Notre Mission</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Démocratiser l'accès à l'investissement agricole durable en offrant des solutions performantes et accessibles à tous.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-2">
                <h4 className="font-bold text-sm text-gray-900">Fonctionnement</h4>
                {[
                  "Choisissez un pack VIP adapté à votre budget.",
                  "Accumulez des revenus journaliers pendant 60 jours.",
                  "Retirez vos gains via Mobile Money.",
                  "Parrainez vos amis pour des commissions sur 3 niveaux."
                ].map((item, i) => (
                  <span key={i} className="text-[11px] text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block flex-shrink-0" /> {item}
                  </span>
                ))}
              </div>
            </div>
            <Button variant="outline" className="w-full rounded-xl border-gray-200 font-semibold" onClick={() => setActiveTab(null)}>Retour</Button>
          </div>
        );
      default:
        return (
          <div className="pb-8" data-testid="account-main">
            <div className="bg-white px-5 pt-12 pb-5 border-b border-gray-100 mb-2">
              <div className="flex justify-between items-center mb-5">
                <h1 className="text-xl font-extrabold text-gray-900">Mon Compte</h1>
                <button
                  onClick={() => logout.mutate()}
                  className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-red-500 transition-colors"
                  data-testid="button-logout"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  <span className="text-[9px] font-bold">Quitter</span>
                </button>
              </div>

              <div className="flex items-center gap-3.5 mb-6">
                <Avatar className="w-13 h-13 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary text-white text-lg font-extrabold">
                    {user?.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-base font-extrabold text-gray-900 leading-tight">{user?.firstName} {user?.lastName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm">{countryFlag}</span>
                    <span className="text-xs text-gray-400 font-medium">{user?.phoneNumber}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100 pt-4">
                <div className="text-center px-2">
                  <p className="text-base font-extrabold text-primary mb-0.5" data-testid="text-account-balance">{user?.balance?.toLocaleString()} F</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Solde</p>
                </div>
                <div className="text-center px-2">
                  <p className="text-base font-extrabold text-gray-900 mb-0.5" data-testid="text-total-earnings">{totalEarnings.toLocaleString()} F</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Revenus</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 px-5 py-4 bg-white mb-2 border-b border-gray-100">
              {[
                { icon: Wallet, label: "Recharger", href: "/deposit", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: Landmark, label: "Retirer", href: "/withdraw", color: "text-rose-600", bg: "bg-rose-50" },
                { icon: MessageCircle, label: "Support", href: "/support", color: "text-sky-600", bg: "bg-sky-50" },
              ].map((item) => (
                <Link key={item.label} href={item.href}>
                  <div className="flex flex-col items-center gap-1.5 cursor-pointer active:scale-95 transition-transform" data-testid={`quick-${item.label.toLowerCase()}`}>
                    <div className={cn("w-11 h-11 rounded-full flex items-center justify-center", item.bg)}>
                      <item.icon className={cn("w-4.5 h-4.5", item.color)} />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-500">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="px-5 pt-3 pb-2">
              <h3 className="text-sm font-extrabold text-gray-800">Plus</h3>
            </div>

            <div className="px-5 space-y-2">
              {[
                { id: "profile", icon: User, label: "Informations Personnelles", iconBg: "bg-blue-50", iconColor: "text-blue-600" },
                { id: "bank", icon: CreditCard, label: "Gestion Bancaire", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
                { id: "settings", icon: Settings, label: "Paramètres", iconBg: "bg-amber-50", iconColor: "text-amber-600" },
                { id: "about", icon: Shield, label: "À propos", iconBg: "bg-purple-50", iconColor: "text-purple-600" },
              ].map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full justify-between h-14 bg-white rounded-xl border border-gray-100 px-4 hover:bg-gray-50"
                  onClick={() => setActiveTab(item.id)}
                  data-testid={`button-${item.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-xl", item.iconBg)}>
                      <item.icon className={cn("w-4 h-4", item.iconColor)} />
                    </div>
                    <span className="font-semibold text-sm text-gray-700">{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </Button>
              ))}
            </div>

            <div className="px-5 mt-5 space-y-3">
              <h3 className="font-extrabold text-sm text-gray-800 flex items-center gap-2 px-1">
                <Sprout className="w-4 h-4 text-primary" />
                Mes Produits VIP
              </h3>

              <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardContent className="p-0">
                  {loadingInvestments ? (
                    <div className="p-6 flex justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : investments?.length === 0 ? (
                    <div className="p-6 text-center">
                      <p className="text-xs text-gray-400">Aucun produit actif</p>
                      <Link href="/products">
                        <Button variant="ghost" className="text-primary font-bold mt-2 text-xs">Découvrir les produits</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {investments?.map((inv) => {
                        const startDate = new Date(inv.startDate || Date.now());
                        const expiryDate = addDays(startDate, inv.product.duration);
                        const isExpired = inv.status === 'expired' || new Date() > expiryDate;

                        return (
                          <div key={inv.id} className="p-4 hover:bg-gray-50/50 transition-colors" data-testid={`investment-${inv.id}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className="font-bold text-sm text-gray-800">{inv.product.name}</span>
                                <span className="text-[10px] text-gray-400 block">Activé le {format(startDate, 'dd MMM yyyy', { locale: fr })}</span>
                              </div>
                              <Badge className={cn(
                                "border-0 h-5 text-[9px] uppercase tracking-wider font-bold",
                                isExpired ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                              )}>
                                {isExpired ? "Expiré" : "Actif"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                <p className="text-[8px] text-gray-400 uppercase font-bold">Investi</p>
                                <p className="text-xs font-extrabold text-gray-800">{inv.product.price.toLocaleString()} F</p>
                              </div>
                              <div className="bg-green-50/50 p-2 rounded-lg border border-green-100/50">
                                <p className="text-[8px] text-green-600 uppercase font-bold">Gains/Jour</p>
                                <p className="text-xs font-extrabold text-green-700">{inv.product.dailyRate.toLocaleString()} F</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24" data-testid="account-page">
      {renderSection()}
      <BottomNav />
    </div>
  );
}
