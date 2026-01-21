import { useTeamStats } from "@/hooks/use-team";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Copy, Users, TrendingUp, Award, Wallet, Clock, CalendarDays } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Investment, Product } from "@shared/schema";
import { api } from "@shared/routes";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";

export default function Team() {
  const { data: stats, isLoading } = useTeamStats();
  const { toast } = useToast();

  const copyLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      toast({ title: "Lien copié !", description: "Partagez-le avec vos amis." });
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-6 pt-12 pb-12 rounded-b-[2.5rem] shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
          <Users className="w-48 h-48" />
        </div>
        <h1 className="text-3xl font-bold font-display mb-1 relative z-10">Mon Équipe</h1>
        <p className="text-white/90 text-sm relative z-10">Invitez et gagnez ensemble</p>
        
        <div className="mt-8 flex flex-col items-center relative z-10">
           <div className="bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30 text-center w-full max-w-xs shadow-inner">
             <p className="text-xs uppercase tracking-[0.2em] font-bold opacity-80 mb-2">Commissions Totales</p>
             <h2 className="text-4xl font-black">{stats?.totalCommission?.toLocaleString()} <span className="text-xl">FCFA</span></h2>
           </div>
        </div>
      </div>

      <div className="p-4 -mt-8 space-y-6 relative z-10">
        {/* Referral Link Card */}
        <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2 rounded-xl">
                <Copy className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Lien de parrainage</h3>
                <p className="text-xs text-muted-foreground">Partagez votre lien exclusif</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="bg-gray-50 p-4 rounded-2xl flex-1 truncate text-sm text-gray-600 font-mono border border-gray-100">
                {stats?.referralLink}
              </div>
              <Button onClick={copyLink} className="rounded-2xl h-auto px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                Copier
              </Button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
               <div className="bg-green-50/50 p-3 rounded-2xl border border-green-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-green-600 mb-1 tracking-wider">Niveau 1</p>
                  <p className="text-lg font-black text-green-700">27%</p>
               </div>
               <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-blue-600 mb-1 tracking-wider">Niveau 2</p>
                  <p className="text-lg font-black text-blue-700">2%</p>
               </div>
               <div className="bg-purple-50/50 p-3 rounded-2xl border border-purple-100 text-center">
                  <p className="text-[10px] uppercase font-bold text-purple-600 mb-1 tracking-wider">Niveau 3</p>
                  <p className="text-lg font-black text-purple-700">3%</p>
               </div>
            </div>
          </div>
        </Card>

        {/* Network Stats */}
        <div className="grid grid-cols-2 gap-4">
           <Card className="border-0 shadow-md rounded-3xl bg-white group hover-elevate transition-all duration-300">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                 <div className="bg-green-100 p-4 rounded-2xl text-green-700 mb-3 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6" />
                 </div>
                 <p className="text-3xl font-black text-gray-900 leading-none mb-1">{stats?.totalReferrals}</p>
                 <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Filleuls Totaux</p>
              </CardContent>
           </Card>
           <Card className="border-0 shadow-md rounded-3xl bg-white group hover-elevate transition-all duration-300">
              <CardContent className="p-5 flex flex-col items-center justify-center text-center">
                 <div className="bg-amber-100 p-4 rounded-2xl text-amber-700 mb-3 group-hover:scale-110 transition-transform">
                    <Award className="w-6 h-6" />
                 </div>
                 <p className="text-3xl font-black text-gray-900 leading-none mb-1">{stats?.level1}</p>
                 <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">Filleuls Directs</p>
              </CardContent>
           </Card>
        </div>

        {/* Growth Section */}
        <Card className="border-0 shadow-md rounded-3xl bg-white overflow-hidden">
           <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-6 py-4">
              <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                 <TrendingUp className="w-4 h-4 text-primary" />
                 Analyse du réseau
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-4">
              <div className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                     <Award className="w-5 h-5" />
                   </div>
                   <div>
                     <p className="text-[10px] uppercase font-black text-blue-600 tracking-widest">Niveau 1 (Direct)</p>
                     <p className="text-sm font-bold text-slate-900">Commission de 27%</p>
                   </div>
                 </div>
                 <span className="text-xl font-black text-blue-700">{stats?.level1Earnings?.toLocaleString() || 0} F</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-green-50/30 p-4 rounded-2xl border border-green-100">
                   <p className="text-[9px] uppercase font-black text-green-600 tracking-widest mb-1">Niveau 2</p>
                   <p className="text-sm font-black text-green-700">{stats?.level2Earnings?.toLocaleString() || 0} F</p>
                   <p className="text-[8px] font-bold text-green-500 mt-1">Gains 2%</p>
                 </div>
                 <div className="bg-purple-50/30 p-4 rounded-2xl border border-purple-100">
                   <p className="text-[9px] uppercase font-black text-purple-600 tracking-widest mb-1">Niveau 3</p>
                   <p className="text-sm font-black text-purple-700">{stats?.level3Earnings?.toLocaleString() || 0} F</p>
                   <p className="text-[8px] font-bold text-purple-500 mt-1">Gains 3%</p>
                 </div>
              </div>
           </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
