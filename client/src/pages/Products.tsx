import { useProducts, useInvest } from "@/hooks/use-products";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const invest = useInvest();

  return (
    <div className="min-h-screen bg-gray-50 pb-24" data-testid="products-page">
      <div className="bg-gradient-to-br from-green-700 to-emerald-800 px-5 pt-12 pb-8 rounded-b-[2rem]">
        <h1 className="text-xl font-extrabold text-white">Catalogue VIP</h1>
        <p className="text-green-200/60 text-xs mt-1">Investissez dans le futur durable</p>
      </div>

      <div className="px-5 -mt-6 space-y-4 relative z-10">
        {isLoading ? (
          <div className="flex justify-center p-12 bg-white rounded-2xl shadow-sm">
            <Loader2 className="animate-spin text-primary w-7 h-7" />
          </div>
        ) : (
          products?.map((product) => (
            <Card key={product.id} className="border-0 shadow-sm overflow-hidden rounded-2xl bg-white" data-testid={`card-product-${product.id}`}>
              <div className="h-28 bg-gradient-to-br from-green-600 to-emerald-700 relative p-5 flex flex-col justify-between overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <TrendingUp className="w-24 h-24 text-white" />
                </div>
                <div className="flex justify-between items-start relative z-10">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                    Pack VIP {product.vipLevel}
                  </Badge>
                  <div className="text-white text-right">
                    <p className="text-[9px] uppercase font-bold tracking-wider opacity-60">Retour</p>
                    <p className="font-extrabold text-lg tracking-tight">{product.totalReturn.toLocaleString()} <span className="text-[10px]">F</span></p>
                  </div>
                </div>
                <h3 className="text-lg font-extrabold text-white relative z-10">{product.name}</h3>
              </div>

              <CardContent className="p-5 grid grid-cols-2 gap-4 bg-white">
                <div className="space-y-1">
                  <div className="flex items-center text-gray-400 text-[9px] font-bold uppercase tracking-wider gap-1.5">
                    <Zap className="w-3 h-3 text-amber-500" /> Rendement/Jour
                  </div>
                  <p className="font-extrabold text-base text-gray-900">{product.dailyRate.toLocaleString()} <span className="text-[10px] font-semibold text-gray-500">FCFA</span></p>
                </div>
                <div className="space-y-1 text-right">
                  <div className="flex items-center justify-end text-gray-400 text-[9px] font-bold uppercase tracking-wider gap-1.5">
                    <Clock className="w-3 h-3 text-blue-500" /> Durée
                  </div>
                  <p className="font-extrabold text-base text-gray-900">{product.duration} <span className="text-[10px] font-semibold text-gray-500 uppercase">Jours</span></p>
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50/80 p-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase text-gray-400 tracking-wider">Capital</p>
                  <p className="text-lg font-extrabold text-primary">{product.price.toLocaleString()} <span className="text-[10px] font-semibold">F</span></p>
                </div>
                <Button
                  onClick={() => invest.mutate(product.id)}
                  disabled={invest.isPending}
                  className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider text-[10px] rounded-xl h-11 px-6 shadow-sm active:scale-95 transition-all"
                  data-testid={`button-invest-${product.id}`}
                >
                  {invest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Acheter"}
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
