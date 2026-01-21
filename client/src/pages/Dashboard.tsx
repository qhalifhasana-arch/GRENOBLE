import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/BottomNav";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Sprout, TrendingUp, Wallet, ArrowRight, Clock, CalendarDays, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Investment, Product } from "@shared/schema";
import { api } from "@shared/routes";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: investments, isLoading: loadingInvestments } = useQuery<(Investment & { product: Product })[]>({
    queryKey: [api.investments.list.path],
  });

  const dailyEarnings = investments?.reduce((sum, inv) => sum + inv.product.dailyRate, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-green text-white p-6 pb-24 rounded-b-[2.5rem] shadow-xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-green-100 text-sm font-medium">Bienvenue,</p>
            <h1 className="text-2xl font-bold text-white font-display mt-1">
              {user?.firstName} {user?.lastName}
            </h1>
          </div>
          <div className="bg-white/10 p-2 rounded-full backdrop-blur-sm">
            <span className="text-xl">🇹🇬</span>
          </div>
        </div>
        
        <div className="flex flex-col items-center">
          <p className="text-green-100 text-sm mb-1">Solde Total</p>
          <h2 className="text-4xl font-bold text-white tracking-tight mb-6 font-display">
            {user?.balance?.toLocaleString()} FCFA
          </h2>
          <div className="grid grid-cols-2 gap-4 w-full">
            <Link href="/deposit" className="w-full">
              <Button className="w-full h-16 bg-white text-primary hover:bg-white/90 font-bold rounded-2xl text-lg shadow-lg">
                Dépôt
              </Button>
            </Link>
            <Link href="/withdraw" className="w-full">
               <Button className="w-full h-16 bg-amber-400 text-amber-950 hover:bg-amber-500 border-0 font-bold rounded-2xl text-lg shadow-lg">
                Retrait
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-16 relative z-10 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            label="Revenu Journalier" 
            value={`${dailyEarnings.toLocaleString()} FCFA`} 
            icon={TrendingUp}
            variant="default"
          />
          <StatCard 
            label="Bonus Actif" 
            value="700 FCFA" 
            icon={Wallet}
            className="border-amber-200 bg-amber-50"
          />
        </div>

        {/* Mes Investissements VIP */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3 ml-1 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-primary" />
            Mes VIP Actifs
          </h3>
          
          <div className="space-y-3">
            {loadingInvestments ? (
              <div className="flex justify-center p-8 bg-white rounded-2xl border border-gray-100">
                <Loader2 className="animate-spin text-primary w-6 h-6" />
              </div>
            ) : investments?.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-300">
                <p className="text-muted-foreground text-sm italic">Aucun investissement actif</p>
                <Link href="/products">
                  <Button variant="link" className="text-primary font-bold mt-2">
                    Voir les produits <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ) : (
              investments?.map((inv) => {
                const startDate = new Date(inv.startDate || Date.now());
                const expiryDate = addDays(startDate, inv.product.duration);
                return (
                  <Card key={inv.id} className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
                    <div className="p-3 bg-primary/5 flex justify-between items-center border-b border-primary/10">
                      <span className="font-bold text-sm text-primary">VIP {inv.product.vipLevel} - {inv.product.name}</span>
                      <Badge className="bg-green-100 text-green-700 border-0 h-5 text-[10px] uppercase tracking-wider">{inv.status}</Badge>
                    </div>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Wallet className="w-3 h-3" /> Investi
                        </span>
                        <span className="font-bold text-xs">{inv.product.price.toLocaleString()} FCFA</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Expiration
                        </span>
                        <span className="text-xs font-bold text-orange-600">
                          {format(expiryDate, 'dd MMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* Action Call */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="bg-green-100 p-3 rounded-full text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-primary">Nouveaux VIP</h3>
              <p className="text-sm text-muted-foreground">Augmentez vos revenus</p>
            </div>
          </div>
          <Link href="/products">
            <Button size="icon" variant="ghost" className="rounded-full">
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Button>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
