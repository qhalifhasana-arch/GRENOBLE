import { useTeamStats } from "@/hooks/use-team";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Users, TrendingUp, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Team() {
  const { data: stats, isLoading } = useTeamStats();
  const { toast } = useToast();

  const copyLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      toast({ title: "Lien copié !", description: "Partagez-le avec vos amis." });
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-28" data-testid="team-page">
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 px-5 pt-12 pb-14 rounded-b-[2rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
          <Users className="w-40 h-40 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-2xl font-extrabold text-white mb-1">Mon Équipe</h1>
          <p className="text-white/70 text-sm">Invitez et gagnez ensemble</p>

          <div className="mt-6 bg-white/15 backdrop-blur-sm p-6 rounded-2xl border border-white/20 text-center">
            <p className="text-xs uppercase tracking-widest font-bold text-white/60 mb-1">Commissions Totales</p>
            <h2 className="text-4xl font-extrabold text-white" data-testid="text-total-commission">{stats?.totalCommission?.toLocaleString()} <span className="text-base font-semibold text-white/70">FCFA</span></h2>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 space-y-4 relative z-10 max-w-2xl mx-auto">
        <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2.5 rounded-xl">
                <Copy className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-800">Lien de parrainage</h3>
                <p className="text-xs text-gray-400">Partagez votre lien exclusif</p>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="bg-gray-50 p-3 rounded-xl flex-1 truncate text-sm text-gray-600 font-mono border border-gray-100" data-testid="text-referral-link">
                {stats?.referralLink}
              </div>
              <Button onClick={copyLink} className="rounded-xl h-auto px-5 bg-primary hover:bg-primary/90 shadow-sm font-bold text-sm" data-testid="button-copy-link">
                Copier
              </Button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              <div className="bg-green-50 p-4 rounded-xl border border-green-100/80 text-center">
                <p className="text-xs uppercase font-bold text-green-600 tracking-wider">Niv. 1</p>
                <p className="text-lg font-extrabold text-green-700">27%</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100/80 text-center">
                <p className="text-xs uppercase font-bold text-blue-600 tracking-wider">Niv. 2</p>
                <p className="text-lg font-extrabold text-blue-700">2%</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100/80 text-center">
                <p className="text-xs uppercase font-bold text-purple-600 tracking-wider">Niv. 3</p>
                <p className="text-lg font-extrabold text-purple-700">3%</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm rounded-2xl bg-white card-hover">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="bg-green-100 p-3 rounded-xl text-green-700 mb-3">
                <Users className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-gray-900 mb-0.5" data-testid="text-total-referrals">{stats?.totalReferrals}</p>
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Filleuls Totaux</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-2xl bg-white card-hover">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center">
              <div className="bg-amber-100 p-3 rounded-xl text-amber-700 mb-3">
                <Award className="w-5 h-5" />
              </div>
              <p className="text-3xl font-extrabold text-gray-900 mb-0.5" data-testid="text-direct-referrals">{stats?.level1}</p>
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Filleuls Directs</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100 px-5 py-4">
            <CardTitle className="text-base font-extrabold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Détail des commissions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-100 p-2.5 rounded-lg text-blue-600">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs uppercase font-bold text-blue-600 tracking-wider">Niveau 1</p>
                  <p className="text-xs font-semibold text-gray-700">Commission 27%</p>
                </div>
              </div>
              <span className="text-base font-extrabold text-blue-700">{stats?.level1Earnings?.toLocaleString() || 0} F</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50/50 p-3 rounded-xl border border-green-100/80">
                <p className="text-xs uppercase font-bold text-green-600 tracking-wider mb-1">Niveau 2</p>
                <p className="text-base font-extrabold text-green-700">{stats?.level2Earnings?.toLocaleString() || 0} F</p>
                <p className="text-xs font-semibold text-green-500 mt-1">2% des gains</p>
              </div>
              <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100/80">
                <p className="text-xs uppercase font-bold text-purple-600 tracking-wider mb-1">Niveau 3</p>
                <p className="text-base font-extrabold text-purple-700">{stats?.level3Earnings?.toLocaleString() || 0} F</p>
                <p className="text-xs font-semibold text-purple-500 mt-1">3% des gains</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
