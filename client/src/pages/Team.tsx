import { useTeamStats } from "@/hooks/use-team";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, Users, TrendingUp, Award, Share2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Team() {
  const { data: stats, isLoading } = useTeamStats();
  const { toast } = useToast();

  const copyLink = () => {
    if (stats?.referralLink) {
      navigator.clipboard.writeText(stats.referralLink);
      toast({ title: "Lien copié !", description: "Partagez-le avec vos amis pour gagner des commissions." });
    }
  };

  const shareLink = () => {
    if (stats?.referralLink && navigator.share) {
      navigator.share({
        title: "GreenHarvest - Investissement Agricole",
        text: `Rejoignez GreenHarvest et recevez 700 FCFA de bonus ! Utilisez mon lien :`,
        url: stats.referralLink,
      }).catch(() => {});
    } else {
      copyLink();
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
          <p className="text-white/70 text-sm">Invitez et gagnez des commissions automatiques</p>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-white/15 backdrop-blur-sm p-5 rounded-2xl border border-white/20 text-center">
              <p className="text-[10px] uppercase tracking-widest font-bold text-white/60 mb-1">Commissions Totales</p>
              <h2 className="text-2xl font-extrabold text-white" data-testid="text-total-commission">{stats?.totalCommission?.toLocaleString() || 0} <span className="text-sm font-semibold text-white/70">FCFA</span></h2>
            </div>
            <div className="bg-white/15 backdrop-blur-sm p-5 rounded-2xl border border-white/20 text-center">
              <p className="text-[10px] uppercase tracking-widest font-bold text-white/60 mb-1">Total Filleuls</p>
              <h2 className="text-2xl font-extrabold text-white" data-testid="text-total-referrals">{((stats?.level1 || 0) + (stats?.level2 || 0) + (stats?.level3 || 0)).toLocaleString()}</h2>
              <p className="text-[10px] text-white/50 font-semibold mt-0.5">sur 3 niveaux</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 space-y-4 relative z-10 max-w-2xl mx-auto">
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden bg-gradient-to-br from-green-600 to-emerald-700">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2.5 rounded-xl">
                <LinkIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Votre lien de parrainage</h3>
                <p className="text-xs text-green-100/70">Partagez pour gagner 25% de commission</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-xl text-sm text-green-100 font-mono border border-white/15 truncate mb-3" data-testid="text-referral-link">
              {stats?.referralLink}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={copyLink} className="flex-1 rounded-xl h-12 bg-white text-green-700 hover:bg-green-50 shadow-sm font-bold text-sm" data-testid="button-copy-link">
                <Copy className="w-4 h-4 mr-2" />
                Copier le lien
              </Button>
              <Button onClick={shareLink} className="rounded-xl h-12 bg-white/20 text-white hover:bg-white/30 border border-white/20 px-4" data-testid="button-share-link">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            <div className="mt-4 bg-white/10 rounded-xl p-3 border border-white/10">
              <p className="text-xs text-green-100/80 text-center font-medium">Code parrainage : <span className="text-white font-bold text-sm" data-testid="text-referral-code">{stats?.referralCode}</span></p>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-green-50 p-4 rounded-xl border border-green-100/80 text-center">
            <p className="text-xs uppercase font-bold text-green-600 tracking-wider">Niv. 1</p>
            <p className="text-xl font-extrabold text-green-700">25%</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100/80 text-center">
            <p className="text-xs uppercase font-bold text-blue-600 tracking-wider">Niv. 2</p>
            <p className="text-xl font-extrabold text-blue-700">2%</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-100/80 text-center">
            <p className="text-xs uppercase font-bold text-purple-600 tracking-wider">Niv. 3</p>
            <p className="text-xl font-extrabold text-purple-700">3%</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Card className="border-0 shadow-sm rounded-2xl bg-white card-hover">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="bg-green-100 p-2.5 rounded-xl text-green-700 mb-2">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 mb-0.5" data-testid="text-level1-count">{stats?.level1 || 0}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Niveau 1</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-2xl bg-white card-hover">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="bg-blue-100 p-2.5 rounded-xl text-blue-700 mb-2">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 mb-0.5" data-testid="text-level2-count">{stats?.level2 || 0}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Niveau 2</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-2xl bg-white card-hover">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <div className="bg-purple-100 p-2.5 rounded-xl text-purple-700 mb-2">
                <Users className="w-4 h-4" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 mb-0.5" data-testid="text-level3-count">{stats?.level3 || 0}</p>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Niveau 3</p>
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
          <CardContent className="p-5 space-y-3">
            <div className="bg-green-50/50 p-4 rounded-xl border border-green-100/80 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="bg-green-100 p-2.5 rounded-lg text-green-600">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs uppercase font-bold text-green-600 tracking-wider">Niveau 1</p>
                  <p className="text-xs font-semibold text-gray-500">{stats?.level1 || 0} filleuls &middot; 25%</p>
                </div>
              </div>
              <span className="text-base font-extrabold text-green-700" data-testid="text-level1-earnings">{stats?.level1Earnings?.toLocaleString() || 0} F</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100/80">
                <p className="text-xs uppercase font-bold text-blue-600 tracking-wider mb-1">Niveau 2</p>
                <p className="text-base font-extrabold text-blue-700" data-testid="text-level2-earnings">{stats?.level2Earnings?.toLocaleString() || 0} F</p>
                <p className="text-xs font-semibold text-blue-400 mt-1">{stats?.level2 || 0} filleuls &middot; 2%</p>
              </div>
              <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100/80">
                <p className="text-xs uppercase font-bold text-purple-600 tracking-wider mb-1">Niveau 3</p>
                <p className="text-base font-extrabold text-purple-700" data-testid="text-level3-earnings">{stats?.level3Earnings?.toLocaleString() || 0} F</p>
                <p className="text-xs font-semibold text-purple-400 mt-1">{stats?.level3 || 0} filleuls &middot; 3%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
