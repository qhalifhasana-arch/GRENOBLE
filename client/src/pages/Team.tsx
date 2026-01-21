import { useTeamStats } from "@/hooks/use-team";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  
  const { data: investments, isLoading: loadingInvestments } = useQuery<(Investment & { product: Product })[]>({
    queryKey: [api.investments.list.path],
  });

  const copyLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      toast({ title: "Lien copié !", description: "Partagez-le avec vos amis." });
    }
  };

  if (isLoading || loadingInvestments) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

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
          </CardContent>
        </Card>

        <section className="space-y-4">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 px-2">
            <Wallet className="w-5 h-5 text-primary" />
            Mes Investissements VIP
          </h3>
          
          {investments?.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-200 shadow-none rounded-2xl bg-transparent">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground italic">Aucun investissement actif</p>
              </CardContent>
            </Card>
          ) : (
            investments?.map((inv) => {
              const startDate = new Date(inv.startDate || Date.now());
              const expiryDate = addDays(startDate, inv.product.duration);
              
              return (
                <Card key={inv.id} className="border-0 shadow-md rounded-2xl overflow-hidden bg-white">
                  <div className="p-4 bg-primary/5 flex justify-between items-center border-b border-primary/10">
                    <span className="font-bold text-primary">VIP {inv.product.vipLevel} - {inv.product.name}</span>
                    <Badge className="bg-green-100 text-green-700 border-0">{inv.status}</Badge>
                  </div>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" /> Fonds Investi
                      </span>
                      <span className="font-bold">{inv.product.price.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="w-4 h-4" /> Date d'achat
                      </span>
                      <span className="text-sm font-medium">
                        {format(startDate, 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Expiration
                      </span>
                      <span className="text-sm font-bold text-orange-600">
                        {format(expiryDate, 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </section>

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
      </div>
      <BottomNav />
    </div>
  );
}
