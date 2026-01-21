import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LogOut, Shield, User, Settings, CreditCard, ChevronRight, 
  Sprout, Loader2, Wallet, Clock, CalendarDays, Phone, Mail, 
  MapPin, Lock, Smartphone, Landmark, Bell
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Investment, Product } from "@shared/schema";
import { api } from "@shared/routes";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      default:
        return (
          <div className="space-y-4">
            {/* Mes Produits Section */}
            <div className="space-y-3">
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
                      <Link href="/products">
                        <Button variant="link" className="text-primary font-bold mt-2">Découvrir les produits</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {investments?.map((inv) => {
                        const startDate = new Date(inv.startDate || Date.now());
                        const expiryDate = addDays(startDate, inv.product.duration);
                        return (
                          <div key={inv.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex flex-col">
                                <span className="font-bold text-sm">VIP {inv.product.vipLevel} - {inv.product.name}</span>
                                <span className="text-[10px] text-muted-foreground">Acquis le {format(startDate, 'dd MMM yyyy', { locale: fr })}</span>
                              </div>
                              <Badge className="bg-green-100 text-green-700 border-0 h-5 text-[9px] uppercase tracking-wider font-bold">Actif</Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-3">
                              <div className="bg-gray-50 p-2 rounded-xl border border-gray-100">
                                <p className="text-[8px] text-muted-foreground uppercase font-bold">Investi</p>
                                <p className="text-xs font-black text-gray-800">{inv.product.price.toLocaleString()} FCFA</p>
                              </div>
                              <div className="bg-orange-50/50 p-2 rounded-xl border border-orange-100">
                                <p className="text-[8px] text-orange-600 uppercase font-bold">Expire le</p>
                                <p className="text-xs font-black text-orange-700">{format(expiryDate, 'dd/MM/yyyy', { locale: fr })}</p>
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

            <div className="grid grid-cols-1 gap-2">
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
            </div>

            {user?.isAdmin && (
               <Link href="/admin">
                 <Button className="w-full bg-gray-900 text-white hover:bg-black h-14 rounded-2xl shadow-xl mt-4 font-bold tracking-wide">
                    <Shield className="w-4 h-4 mr-2" /> Accéder au Panel Admin
                 </Button>
               </Link>
            )}

            <Button 
              variant="destructive" 
              className="w-full h-14 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 border-0 shadow-none font-bold mt-2"
              onClick={() => logout.mutate()}
            >
              <LogOut className="w-4 h-4 mr-2" /> Se déconnecter
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-6 pt-12 text-center border-b rounded-b-[2.5rem] shadow-sm mb-6">
        <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-gray-50 shadow-xl">
          <AvatarFallback className="bg-primary text-white text-3xl font-black">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-black text-gray-900 font-display leading-tight">
          {user?.firstName} {user?.lastName}
        </h1>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Smartphone className="w-3 h-3 text-muted-foreground" />
          <p className="text-muted-foreground text-xs font-medium tracking-wide">{user?.phoneNumber}</p>
        </div>
        <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-[0.1em]">
          {user?.isAdmin ? "Administrateur" : "Investisseur Vérifié"}
        </div>
      </div>

      <div className="p-4">
        {renderSection()}
      </div>
      <BottomNav />
    </div>
  );
}
