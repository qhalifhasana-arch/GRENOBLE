import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LogOut, Shield, User, Settings, CreditCard, ChevronRight, 
  Sprout, Loader2, Wallet, Clock, CalendarDays, Phone, Mail, 
  MapPin, Lock, Smartphone, Landmark, Bell, History, MessageCircle, ShoppingBag
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

export default function Account() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const { data: investments, isLoading: loadingInvestments } = useQuery<(Investment & { product: Product })[]>({
    queryKey: [api.investments.list.path],
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: [api.transactions.list.path],
  });

  const totalEarnings = transactions?.filter(t => 
    (t.type === 'daily_earning' || t.type === 'referral_reward') && t.status === 'completed'
  ).reduce((sum, t) => sum + t.amount, 0) || 0;

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: any) => {
      const res = await fetch(`/api/admin/users/${user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Erreur de mise à jour");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Profil mis à jour avec succès" });
      setActiveTab(null);
    },
  });

  const renderSection = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="w-16 h-16 border-2 border-primary/20">
                <AvatarFallback className="bg-primary text-white text-xl font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-lg font-bold">{user?.firstName} {user?.lastName}</h2>
                <p className="text-sm text-muted-foreground">Membre depuis {format(new Date(user?.createdAt || Date.now()), 'MMMM yyyy', { locale: fr })}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100">
                <Phone className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Téléphone</p>
                  <p className="text-sm font-medium">{user?.phoneNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100">
                <MapPin className="w-4 h-4 text-primary" />
                <div className="flex-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Pays</p>
                  <p className="text-sm font-medium">{user?.country}</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab(null)}>Retour</Button>
          </div>
        );
      case "bank":
        return (
          <div className="space-y-4 pt-4">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[2rem] text-white shadow-lg mb-6">
              <div className="flex justify-between items-start mb-8">
                <Landmark className="w-8 h-8 opacity-80" />
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-widest opacity-70">Mobile Money</p>
                  <p className="font-bold">MTN / Orange</p>
                </div>
              </div>
              <p className="text-xl font-mono tracking-wider mb-2">•••• •••• •••• {user?.phoneNumber?.slice(-4)}</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[8px] uppercase opacity-60">Titulaire</p>
                  <p className="text-sm font-bold uppercase">{user?.firstName} {user?.lastName}</p>
                </div>
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/MTN_Logo.svg" className="h-6 opacity-80" alt="" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground px-2">Les retraits sont automatiquement envoyés vers le numéro utilisé lors de l'inscription.</p>
            <Button variant="outline" className="w-full" onClick={() => setActiveTab(null)}>Retour</Button>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-4 pt-4">
            <h3 className="font-bold text-gray-800 px-1">Paramètres de sécurité</h3>
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-between h-14 bg-white rounded-2xl border border-gray-50 px-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Lock className="w-4 h-4 text-orange-500" />
                  <span>Changer le mot de passe</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Button>
              <Button variant="ghost" className="w-full justify-between h-14 bg-white rounded-2xl border border-gray-50 px-4">
                <div className="flex items-center gap-3 text-gray-700">
                  <Bell className="w-4 h-4 text-blue-500" />
                  <span>Notifications</span>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-100">Activé</Badge>
              </Button>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab(null)}>Retour</Button>
          </div>
        );
      case "about":
        return (
          <div className="space-y-6 pt-4">
            <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10">
              <h3 className="text-xl font-black text-primary mb-3">À propos de nous</h3>
              <p className="text-sm text-slate-700 leading-relaxed">
                GREENIX est une plateforme d'investissement agricole de pointe, conçue pour connecter les investisseurs modernes aux opportunités de croissance dans le secteur agropastoral en Afrique. 
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="bg-primary/10 p-3 rounded-2xl h-fit">
                  <Sprout className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Notre Mission</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Démocratiser l'accès à l'investissement agricole durable en offrant des solutions performantes, transparentes et accessibles à tous, tout en soutenant le développement rural.
                  </p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-50 italic text-center">
                <p className="text-primary font-black text-sm uppercase tracking-wide">
                  "Gagnez avec les meilleurs investissements agricoles durables et performants"
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 px-1">Fonctionnement</h4>
                <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-2">
                  <p className="text-[11px] flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Choisissez un pack VIP adapté à votre budget.</p>
                  <p className="text-[11px] flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Accumulez des revenus journaliers pendant 60 jours.</p>
                  <p className="text-[11px] flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Retirez vos gains via Mobile Money MTN ou Orange.</p>
                  <p className="text-[11px] flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Parrainez vos amis pour gagner des commissions sur 3 niveaux.</p>
                </div>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-2" onClick={() => setActiveTab(null)}>Retour</Button>
          </div>
        );
      default:
        return (
          <div className="pb-8">
            <div className="bg-white px-6 pt-12 pb-6 border-b shadow-sm mb-2">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-black text-gray-900">Mon Compte</h1>
                <button 
                  onClick={() => logout.mutate()}
                  className="flex flex-col items-center gap-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-[10px] font-bold text-gray-400">Quitter</span>
                </button>
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <Avatar className="w-16 h-16 border-2 border-primary shadow-sm">
                  <AvatarFallback className="bg-primary text-white text-xl font-black">
                    {user?.firstName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="text-lg font-black text-slate-900 leading-none">{user?.phoneNumber}</p>
                  <Badge className="bg-blue-600 text-white border-0 text-[10px] font-black h-5 uppercase px-2">Niv1</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 divide-x divide-gray-100 border-t pt-6">
                <div className="text-center px-2">
                  <p className="text-lg font-black text-primary mb-0.5">FCFA {user?.balance?.toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Solde du compte</p>
                </div>
                <div className="text-center px-2">
                  <p className="text-lg font-black text-slate-900 mb-0.5">FCFA {totalEarnings.toLocaleString()}</p>
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Revenus cumulés</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Circles */}
            <div className="grid grid-cols-3 gap-2 px-4 py-6 bg-white mb-2 shadow-sm">
              {[
                { icon: Wallet, label: "Recharger", href: "/deposit", color: "text-blue-600", bg: "bg-blue-50" },
                { icon: Landmark, label: "Retirer", href: "/withdraw", color: "text-rose-600", bg: "bg-rose-50" },
                { icon: MessageCircle, label: "Telegram", href: "/support", color: "text-[#0088cc]", bg: "bg-[#0088cc]/10" },
              ].map((item) => (
                <Link key={item.label} href={item.href}>
                  <div className="flex flex-col items-center gap-2 cursor-pointer active:scale-95 transition-transform">
                    <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shadow-sm", item.bg)}>
                      <item.icon className={cn("w-5 h-5", item.color)} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="px-4 pt-4 pb-2">
              <h3 className="text-lg font-black text-gray-900">Plus</h3>
            </div>

            <div className="px-4 space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-between h-16 bg-white rounded-2xl shadow-sm border border-gray-50 px-4 group hover-elevate"
                onClick={() => setActiveTab('profile')}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-2.5 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-700">Informations Personnelles</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Button>

              <Button 
                variant="ghost" 
                className="w-full justify-between h-16 bg-white rounded-2xl shadow-sm border border-gray-50 px-4 group hover-elevate"
                onClick={() => setActiveTab('bank')}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-700">Gestion Bancaire</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Button>

              <Button 
                variant="ghost" 
                className="w-full justify-between h-16 bg-white rounded-2xl shadow-sm border border-gray-50 px-4 group hover-elevate"
                onClick={() => setActiveTab('settings')}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-amber-100 p-2.5 rounded-xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-700">Paramètres du compte</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Button>

              <Button 
                variant="ghost" 
                className="w-full justify-between h-16 bg-white rounded-2xl shadow-sm border border-gray-50 px-4 group hover-elevate"
                onClick={() => setActiveTab('about')}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-purple-100 p-2.5 rounded-xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Shield className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-gray-700">À propos de nous</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </Button>
            </div>

            {/* Mes Produits Section */}
            <div className="px-4 mt-6 space-y-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 px-1">
                <Sprout className="w-5 h-5 text-primary" />
                Mes Produits VIP
              </h3>
              
              <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white">
                <CardContent className="p-0">
                  {loadingInvestments ? (
                    <div className="p-8 flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : investments?.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50/50">
                      <p className="text-sm text-muted-foreground italic">Aucun produit actif</p>
                      <Link href="/products" className="w-full">
                        <Button variant="ghost" className="text-primary font-bold mt-2 w-full">Découvrir les produits</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {investments?.map((inv) => {
                        const startDate = new Date(inv.startDate || Date.now());
                        const expiryDate = addDays(startDate, inv.product.duration);
                        const isExpired = inv.status === 'expired' || new Date() > expiryDate;
                        
                        return (
                          <div key={inv.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex flex-col">
                                <span className="font-bold text-sm">{inv.product.name}</span>
                                <span className="text-[10px] text-muted-foreground">Activé le {format(startDate, 'dd MMM yyyy', { locale: fr })}</span>
                              </div>
                              <Badge className={cn(
                                "border-0 h-5 text-[9px] uppercase tracking-wider font-bold",
                                isExpired ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                              )}>
                                {isExpired ? "Expiré" : "Actif"}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                                <p className="text-[8px] text-muted-foreground uppercase font-bold">Investi</p>
                                <p className="text-xs font-black text-gray-800">{inv.product.price.toLocaleString()} FCFA</p>
                              </div>
                              <div className="bg-green-50/30 p-2 rounded-xl border border-green-100/50">
                                <p className="text-[8px] text-green-600 uppercase font-bold">Gains /Jour</p>
                                <p className="text-xs font-black text-green-700">{inv.product.dailyRate.toLocaleString()} FCFA</p>
                              </div>
                              <div className="bg-blue-50/30 p-2 rounded-xl border border-blue-100/50">
                                <p className="text-[8px] text-blue-600 uppercase font-bold">Activation</p>
                                <p className="text-xs font-black text-blue-700">{format(startDate, 'dd/MM/yy')}</p>
                              </div>
                              <div className="bg-orange-50/50 p-2 rounded-xl border border-orange-100">
                                <p className="text-[8px] text-orange-600 uppercase font-bold">Expiration</p>
                                <p className="text-xs font-black text-orange-700">{format(expiryDate, 'dd/MM/yy')}</p>
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

            {user?.isAdmin && (
               <div className="px-4 mt-4">
                 <Link href="/admin">
                   <Button className="w-full bg-gray-900 text-white hover:bg-black h-14 rounded-2xl shadow-xl font-bold tracking-wide">
                      <Shield className="w-4 h-4 mr-2" /> Accéder au Panel Admin
                   </Button>
                 </Link>
               </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {renderSection()}
      <BottomNav />
    </div>
  );
}
