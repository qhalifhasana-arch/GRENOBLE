import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Sprout, TrendingUp, Wallet, ArrowRight, Send, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Investment, Product, Setting } from "@shared/schema";
import { api } from "@shared/routes";
import { Card, CardContent } from "@/components/ui/card";
import { getFlagForCountry } from "@/lib/countries";
import seedlingImg from "@/assets/images/seedling-hands.jpg";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: investments } = useQuery<(Investment & { product: Product })[]>({
    queryKey: [api.investments.list.path],
  });

  const { data: settings } = useQuery<Setting[]>({
    queryKey: [api.settings.public.path],
  });

  const dailyEarnings = investments?.reduce((sum, inv) => sum + inv.product.dailyRate, 0) || 0;
  const activeCount = investments?.filter((inv) => inv.status === "active").length || 0;
  const countryFlag = getFlagForCountry(user?.country || "");

  return (
    <div className="min-h-screen bg-gray-50 pb-28" data-testid="dashboard-page">
      <div className="relative bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 px-6 pt-12 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 opacity-[0.07]">
          <Sprout className="w-56 h-56 text-white" />
        </div>
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 opacity-[0.05]">
          <TrendingUp className="w-40 h-40 text-white" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-green-300/70 text-sm font-semibold uppercase tracking-widest mb-1">Bienvenue</p>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                {user?.firstName} {user?.lastName}
              </h1>
            </div>
            <div className="bg-white/15 backdrop-blur-sm p-3 rounded-2xl border border-white/20" data-testid="country-flag">
              <span className="text-3xl">{countryFlag}</span>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/15">
            <p className="text-green-200/60 text-xs font-bold uppercase tracking-widest mb-2">Capital Disponible</p>
            <h2 className="text-5xl font-black text-white tracking-tight mb-1" data-testid="text-balance">
              {user?.balance?.toLocaleString()} <span className="text-lg font-semibold text-green-200/70">FCFA</span>
            </h2>
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1 bg-green-400/20 rounded-full px-3 py-1">
                <TrendingUp className="w-3 h-3 text-green-300" />
                <span className="text-green-200 text-xs font-bold">+{dailyEarnings.toLocaleString()} FCFA/jour</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-8 relative z-10 space-y-5 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/deposit" className="block">
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100/80 flex items-center gap-3 active:scale-[0.97] transition-transform" data-testid="button-deposit">
              <div className="bg-green-100 p-3.5 rounded-xl text-green-700">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Recharger</p>
                <p className="text-lg font-extrabold text-gray-900">Dépôt</p>
              </div>
            </div>
          </Link>
          <Link href="/withdraw" className="block">
            <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100/80 flex items-center gap-3 active:scale-[0.97] transition-transform" data-testid="button-withdraw">
              <div className="bg-amber-100 p-3.5 rounded-xl text-amber-700">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest font-bold text-gray-400">Encaisser</p>
                <p className="text-lg font-extrabold text-gray-900">Retrait</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden group card-hover">
            <CardContent className="p-5">
              <div className="bg-emerald-50 w-11 h-11 rounded-xl flex items-center justify-center text-emerald-600 mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Revenu/Jour</p>
              <p className="text-lg font-extrabold text-gray-900" data-testid="text-daily-earnings">{dailyEarnings.toLocaleString()} F</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden group card-hover">
            <CardContent className="p-5">
              <div className="bg-blue-50 w-11 h-11 rounded-xl flex items-center justify-center text-blue-600 mb-3">
                <Wallet className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-1">Produits Actifs</p>
              <p className="text-lg font-extrabold text-gray-900" data-testid="text-active-count">{activeCount}</p>
            </CardContent>
          </Card>
        </div>

        <Link href="/support" className="block">
          <div className="flex items-center gap-3 bg-sky-50 p-4 rounded-2xl border border-sky-100 hover:bg-sky-100/70 transition-all active:scale-[0.98]" data-testid="link-support">
            <div className="bg-sky-500 p-2.5 rounded-xl text-white">
              <Send className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-sky-800">Support & Communauté</p>
              <p className="text-xs text-sky-600">Telegram - Aide en ligne</p>
            </div>
            <ArrowRight className="w-5 h-5 text-sky-400" />
          </div>
        </Link>

        <Card className="border-0 shadow-lg rounded-3xl overflow-hidden" data-testid="card-promo-agriculture">
          <div className="relative">
            <img
              src={seedlingImg}
              alt="Jeune pousse agricole"
              className="w-full h-48 object-cover"
              data-testid="img-seedling"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-green-900/95 via-green-800/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
              <h3 className="text-white text-xl font-extrabold mb-1.5 drop-shadow-lg">Cultivez vos revenus</h3>
              <p className="text-green-100/80 text-sm mb-4 max-w-[240px] mx-auto leading-relaxed drop-shadow">Découvrez nos projets agricoles à haut rendement.</p>
              <Link href="/products">
                <Button className="bg-white text-green-800 hover:bg-green-50 rounded-xl px-6 h-12 font-bold text-sm uppercase tracking-wider shadow-md transition-all active:scale-95" data-testid="button-catalog">
                  Voir le Catalogue VIP <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
