import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/BottomNav";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Sprout, TrendingUp, Wallet, ArrowRight, Clock, CalendarDays, Loader2, MessageCircle, Send } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Investment, Product, Setting } from "@shared/schema";
import { api } from "@shared/routes";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import farmLandscape from "@assets/stock_images/lush_green_corn_fiel_39836de0.jpg";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: investments, isLoading: loadingInvestments } = useQuery<(Investment & { product: Product })[]>({
    queryKey: [api.investments.list.path],
  });

  const { data: settings } = useQuery<Setting[]>({
    queryKey: [api.settings.public.path],
  });

  const dailyEarnings = investments?.reduce((sum, inv) => sum + inv.product.dailyRate, 0) || 0;
  const tgChannel = settings?.find(s => s.key === 'telegram_channel')?.value || "#";
  const tgGroup = settings?.find(s => s.key === 'telegram_group')?.value || "#";

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Dynamic Header with Agriculture Image */}
      <div className="relative h-80 rounded-b-[3rem] overflow-hidden shadow-2xl">
        <img 
          src={farmLandscape} 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Agriculture" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-green-900/90 via-green-900/40 to-transparent" />
        
        <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-green-200 text-xs font-black uppercase tracking-widest">Compte Investisseur</p>
              <h1 className="text-2xl font-black font-display tracking-tight leading-none">
                {user?.firstName} {user?.lastName}
              </h1>
            </div>
            <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md border border-white/20">
              <span className="text-2xl">🇹🇬</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center pb-4">
            <p className="text-green-200 text-xs font-bold uppercase tracking-widest mb-1 opacity-80">Capital Disponible</p>
            <h2 className="text-5xl font-black tracking-tighter font-display">
              {user?.balance?.toLocaleString()} <span className="text-xl font-bold opacity-80">FCFA</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-30 space-y-6">
        {/* Main Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/deposit" className="w-full">
            <Button className="w-full h-20 bg-white text-primary hover:bg-primary hover:text-white transition-all font-black rounded-[2rem] text-xl shadow-xl border-0 group">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest opacity-60 mb-1 group-hover:text-white/80">Recharger</span>
                Dépôt
              </div>
            </Button>
          </Link>
          <Link href="/withdraw" className="w-full">
             <Button className="w-full h-20 bg-amber-400 text-amber-950 hover:bg-amber-500 font-black rounded-[2rem] text-xl shadow-xl border-0">
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest opacity-60 mb-1">Encaisser</span>
                Retrait
              </div>
            </Button>
          </Link>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-0 shadow-lg rounded-3xl bg-white overflow-hidden group hover-elevate transition-all">
            <CardContent className="p-5">
              <div className="bg-green-100 w-10 h-10 rounded-xl flex items-center justify-center text-green-600 mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-[9px] uppercase tracking-widest font-black text-muted-foreground mb-1">Revenu/Jour</p>
              <p className="text-lg font-black text-slate-900">{dailyEarnings.toLocaleString()} FCFA</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg rounded-3xl bg-white overflow-hidden group hover-elevate transition-all">
            <CardContent className="p-5">
              <div className="bg-amber-100 w-10 h-10 rounded-xl flex items-center justify-center text-amber-600 mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Wallet className="w-5 h-5" />
              </div>
              <p className="text-[9px] uppercase tracking-widest font-black text-muted-foreground mb-1">Bonus Actif</p>
              <p className="text-lg font-black text-slate-900">700 FCFA</p>
            </CardContent>
          </Card>
        </div>

        {/* Community Links */}
        <div className="grid grid-cols-1 gap-3">
          <Link href="/support" className="flex items-center gap-3 bg-[#0088cc]/10 p-4 rounded-3xl border border-[#0088cc]/20 hover:bg-[#0088cc]/20 transition-all">
            <div className="bg-[#0088cc] p-2 rounded-xl text-white">
              <Send className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-[#0088cc] tracking-tighter">Support Client</span>
              <span className="text-xs font-bold text-[#0088cc]">TELEGRAM</span>
            </div>
          </Link>
        </div>

        {/* Promotional Banner */}
        <Card className="border-0 bg-primary shadow-2xl rounded-[2.5rem] overflow-hidden group">
          <div className="relative p-8 flex flex-col items-center text-center">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Sprout className="w-40 h-40 text-white" />
            </div>
            <h3 className="text-white text-2xl font-black mb-2 relative z-10">Cultivez vos revenus</h3>
            <p className="text-green-100 text-sm mb-6 max-w-[200px] font-medium opacity-80 leading-relaxed">Découvrez nos projets d'élevage et de culture à haut rendement.</p>
            <Link href="/products">
              <Button className="bg-white text-primary hover:bg-green-50 rounded-2xl px-8 py-6 font-black uppercase tracking-widest text-xs shadow-lg relative z-10 transition-all active:scale-95">
                Voir le Catalogue VIP <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
