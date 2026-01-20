import { useTeamStats } from "@/hooks/use-team";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Copy, Users, TrendingUp, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Team() {
  const { data: stats, isLoading } = useTeamStats();
  const { toast } = useToast();

  const copyLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      toast({ title: "Lien copié !", description: "Partagez-le avec vos amis." });
    }
  };

  const chartData = [
    { name: "Niv 1", members: stats?.level1 || 0, earnings: stats?.level1Earnings || 0 },
    { name: "Niv 2", members: stats?.level2 || 0, earnings: stats?.level2Earnings || 0 },
    { name: "Niv 3", members: stats?.level3 || 0, earnings: stats?.level3Earnings || 0 },
  ];

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gradient-to-r from-amber-400 to-orange-500 px-6 pt-12 pb-8 rounded-b-[2rem] shadow-lg text-white">
        <h1 className="text-2xl font-bold font-display mb-1">Mon Équipe</h1>
        <p className="text-white/90 text-sm">Gagnez des commissions sur 3 niveaux</p>
        
        <div className="mt-6 flex flex-col items-center">
           <p className="text-xs uppercase tracking-wider opacity-80 mb-1">Commissions Totales</p>
           <h2 className="text-4xl font-extrabold mb-4">{stats?.totalCommission?.toLocaleString()} FCFA</h2>
        </div>
      </div>

      <div className="p-4 -mt-6 space-y-6">
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-500 mb-2">Votre lien de parrainage</p>
            <div className="flex gap-2">
              <div className="bg-gray-100 p-3 rounded-xl flex-1 truncate text-sm text-gray-700 font-mono">
                {stats?.referralLink}
              </div>
              <Button onClick={copyLink} size="icon" className="rounded-xl shrink-0">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
               <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-blue-100">
                  Niveau 1: 27%
               </div>
               <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-purple-100">
                  Niveau 2: 2%
               </div>
               <div className="bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap border border-pink-100">
                  Niveau 3: 3%
               </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
           <Card className="border-0 shadow-md rounded-2xl bg-white">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                 <div className="bg-green-100 p-3 rounded-full text-green-700 mb-2">
                    <Users className="w-5 h-5" />
                 </div>
                 <p className="text-2xl font-bold text-gray-800">{stats?.totalReferrals}</p>
                 <p className="text-xs text-muted-foreground">Filleuls Totaux</p>
              </CardContent>
           </Card>
           <Card className="border-0 shadow-md rounded-2xl bg-white">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                 <div className="bg-orange-100 p-3 rounded-full text-orange-700 mb-2">
                    <Award className="w-5 h-5" />
                 </div>
                 <p className="text-2xl font-bold text-gray-800">{stats?.level1}</p>
                 <p className="text-xs text-muted-foreground">Filleuls Directs</p>
              </CardContent>
           </Card>
        </div>

        <Card className="border-0 shadow-md rounded-2xl">
           <CardContent className="p-6">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                 <TrendingUp className="w-4 h-4 text-primary" />
                 Gains par Niveau
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                       cursor={{ fill: '#f3f4f6' }}
                    />
                    <Bar dataKey="earnings" fill="#e6ac00" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
