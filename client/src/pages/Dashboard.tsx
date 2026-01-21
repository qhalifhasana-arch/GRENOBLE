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
