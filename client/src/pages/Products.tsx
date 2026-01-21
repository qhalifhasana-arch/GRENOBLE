import { useProducts, useInvest } from "@/hooks/use-products";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Clock, CalendarDays, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import greenImg from "@assets/stock_images/modern_hydroponic_gr_796c3d1e.jpg";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const invest = useInvest();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="relative h-60 overflow-hidden shadow-lg border-b-4 border-primary">
        <img src={greenImg} className="absolute inset-0 w-full h-full object-cover" alt="Agriculture" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-3xl font-black text-white font-display mb-1">Catalogue VIP</h1>
          <p className="text-green-200 text-xs font-bold uppercase tracking-widest">Investissez dans le futur durable</p>
        </div>
      </div>

      <div className="p-4 space-y-6 -mt-6 relative z-20">
        {isLoading ? (
          <div className="flex justify-center p-12 bg-white rounded-3xl shadow-xl">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
          </div>
        ) : (
          products?.map((product) => (
            <Card key={product.id} className="border-0 shadow-xl overflow-hidden rounded-[2.5rem] bg-white group hover-elevate transition-all duration-500">
              <div className="h-40 bg-gradient-to-br from-green-600 to-emerald-800 relative p-8 flex flex-col justify-between overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <TrendingUp className="w-32 h-32 text-white" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/20 backdrop-blur-xl px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Pack VIP {product.vipLevel}
                  </Badge>
                  <div className="text-white text-right">
                     <p className="text-[10px] uppercase font-black tracking-tighter opacity-70">Retour Total</p>
                     <p className="font-black text-2xl tracking-tighter">{product.totalReturn.toLocaleString()} <span className="text-xs">FCFA</span></p>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white font-display relative z-10 tracking-tight">{product.name}</h3>
              </div>
              
              <CardContent className="pt-8 pb-6 px-8 grid grid-cols-2 gap-6 relative bg-white">
                <div className="space-y-1.5">
                  <div className="flex items-center text-muted-foreground text-[10px] font-black uppercase tracking-widest gap-2">
                    <Zap className="w-3 h-3 text-amber-500" /> Rendement /Jour
                  </div>
                  <p className="font-black text-xl text-slate-900 tracking-tight">{product.dailyRate.toLocaleString()} <span className="text-[10px] font-bold">FCFA</span></p>
                </div>
                <div className="space-y-1.5 text-right">
                  <div className="flex items-center justify-end text-muted-foreground text-[10px] font-black uppercase tracking-widest gap-2">
                    <Clock className="w-3 h-3 text-blue-500" /> Cycle Complet
                  </div>
                  <p className="font-black text-xl text-slate-900 tracking-tight">{product.duration} <span className="text-[10px] font-bold uppercase">Jours</span></p>
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50/80 p-6 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-0.5">Capital Requis</p>
                  <p className="text-2xl font-black text-primary tracking-tighter">{product.price.toLocaleString()} <span className="text-xs font-bold uppercase">FCFA</span></p>
                </div>
                <Button 
                  onClick={() => invest.mutate(product.id)}
                  disabled={invest.isPending}
                  className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl h-14 px-8 shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  {invest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Acheter maintenant"}
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}
