import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogOut, Shield, User, Settings, CreditCard, ChevronRight, Sprout, Loader2, Wallet, Clock, CalendarDays } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Investment, Product } from "@shared/schema";
import { api } from "@shared/routes";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export default function Account() {
  const { user, logout } = useAuth();

  const { data: investments, isLoading: loadingInvestments } = useQuery<(Investment & { product: Product })[]>({
    queryKey: [api.investments.list.path],
  });

  const menuItems = [
    { icon: User, label: "Informations Personnelles" },
    { icon: CreditCard, label: "Gestion Bancaire" },
    { icon: Shield, label: "Sécurité" },
    { icon: Settings, label: "Paramètres" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white p-6 pt-12 text-center border-b">
        <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-gray-50 shadow-lg">
          <AvatarFallback className="bg-primary text-white text-3xl font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold text-gray-900 font-display">
          {user?.firstName} {user?.lastName}
        </h1>
        <p className="text-muted-foreground text-sm">{user?.phoneNumber}</p>
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
          {user?.isAdmin ? "Administrateur" : "Utilisateur Vérifié"}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Mes Produits Section */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 px-1">
            <Sprout className="w-5 h-5 text-primary" />
            Mes Produits VIP
          </h3>
          
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              {loadingInvestments ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : investments?.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground italic">Aucun produit actif</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {investments?.map((inv) => {
                    const startDate = new Date(inv.startDate || Date.now());
                    const expiryDate = addDays(startDate, inv.product.duration);
                    return (
                      <div key={inv.id} className="p-4 bg-white">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-sm">VIP {inv.product.vipLevel} - {inv.product.name}</span>
                          <Badge className="bg-green-100 text-green-700 border-0 h-5 text-[10px] uppercase">Actif</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Wallet className="w-3 h-3" /> {inv.product.price.toLocaleString()} FCFA
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-orange-600 font-medium justify-end">
                            <Clock className="w-3 h-3" /> Exp: {format(expiryDate, 'dd/MM/yy', { locale: fr })}
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

        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
           <CardContent className="p-0">
             {menuItems.map((item, index) => (
               <div 
                 key={index} 
                 className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b last:border-0 border-gray-50"
               >
                 <div className="flex items-center gap-4">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                       <item.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-gray-700">{item.label}</span>
                 </div>
                 <ChevronRight className="w-4 h-4 text-gray-400" />
               </div>
             ))}
           </CardContent>
        </Card>

        {user?.isAdmin && (
           <Link href="/admin">
             <Button variant="outline" className="w-full bg-black text-white hover:bg-gray-800 h-12 rounded-xl">
                Accéder au Panel Admin
             </Button>
           </Link>
        )}

        <Button 
          variant="destructive" 
          className="w-full h-12 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border-0 shadow-none"
          onClick={() => logout.mutate()}
        >
          <LogOut className="w-4 h-4 mr-2" /> Se déconnecter
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}
