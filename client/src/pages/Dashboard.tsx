import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/BottomNav";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Sprout, TrendingUp, Wallet, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();

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
          <h2 className="text-4xl font-bold text-white tracking-tight mb-4 font-display">
            {user?.balance?.toLocaleString()} FCFA
          </h2>
          <div className="flex gap-3 w-full max-w-xs">
            <Link href="/deposit" className="w-full">
              <Button className="w-full bg-white text-primary hover:bg-white/90 font-semibold rounded-xl">
                Dépôt
              </Button>
            </Link>
            <Link href="/withdraw" className="w-full">
               <Button className="w-full bg-white/20 text-white hover:bg-white/30 border-0 font-semibold rounded-xl backdrop-blur-md">
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
            value="0 FCFA" 
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
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-primary">Investir</h3>
              <p className="text-sm text-muted-foreground">Découvrez nos projets</p>
            </div>
          </div>
          <Link href="/products">
            <Button size="icon" variant="ghost" className="rounded-full">
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Button>
          </Link>
        </div>

        {/* Recent Activity Placeholder */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3 ml-1">Activité Récente</h3>
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm">
            <p className="text-muted-foreground text-sm">Aucune transaction récente</p>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
