import { useProducts, useInvest } from "@/hooks/use-products";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Clock, Zap, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";

import vip1Img from "@/assets/images/vip-1.webp";
import vip2Img from "@/assets/images/vip-2.webp";
import vip3Img from "@/assets/images/vip-3.webp";
import vip4Img from "@/assets/images/vip-4.webp";
import vip5Img from "@/assets/images/vip-5.webp";
import vip6Img from "@/assets/images/vip-6.webp";
import vip7Img from "@/assets/images/vip-7.webp";
import vip8Img from "@/assets/images/vip-8.webp";
import vip9Img from "@/assets/images/vip-9.webp";
import vip10Img from "@/assets/images/vip-10.webp";
import farmWorkers from "@/assets/images/farm-workers.webp";

const VIP_IMAGES: Record<number, string> = {
  1: vip1Img,
  2: vip2Img,
  3: vip3Img,
  4: vip4Img,
  5: vip5Img,
  6: vip6Img,
  7: vip7Img,
  8: vip8Img,
  9: vip9Img,
  10: vip10Img,
};

const VIP_LABELS: Record<number, string> = {
  1: "Potager & Herbes",
  2: "Champ de Blé",
  3: "Riziculture",
  4: "Culture de Tomates",
  5: "Plantation de Coton",
  6: "Plantation de Cacao",
  7: "Agro-industrie",
  8: "Plantation de Café",
  9: "Verger de Mangues",
  10: "Plantation de Cajou",
};

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const invest = useInvest();

  return (
    <div className="min-h-screen bg-gray-50 pb-28" data-testid="products-page">
      <div className="relative overflow-hidden rounded-b-[2rem]">
        <img src={farmWorkers} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/80 via-green-800/70 to-emerald-900/90" />
        <div className="relative px-5 pt-12 pb-10">
          <div className="max-w-2xl mx-auto flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm w-11 h-11 rounded-xl flex items-center justify-center">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Catalogue VIP</h1>
              <p className="text-green-100/80 text-sm">Investissez dans l'agriculture durable</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 space-y-5 relative z-10 max-w-2xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center p-12 bg-white rounded-2xl shadow-sm">
            <Loader2 className="animate-spin text-primary w-7 h-7" />
          </div>
        ) : (
          products?.map((product) => {
            const vipImage = VIP_IMAGES[product.vipLevel] || vip1Img;
            const vipLabel = VIP_LABELS[product.vipLevel] || "Agriculture";

            return (
              <Card key={product.id} className="border-0 shadow-md overflow-hidden rounded-2xl bg-white" data-testid={`card-product-${product.id}`}>
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={vipImage}
                    alt={vipLabel}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
                    <Badge className="bg-white/25 hover:bg-white/35 text-white border-0 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm">
                      Pack VIP {product.vipLevel}
                    </Badge>
                    <div className="bg-white/20 backdrop-blur-md rounded-lg px-3 py-1.5 text-right">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-white/70">Retour</p>
                      <p className="font-extrabold text-lg text-white leading-tight">{product.totalReturn.toLocaleString()} <span className="text-xs">F</span></p>
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <h3 className="text-xl font-extrabold text-white drop-shadow-md">{product.name}</h3>
                    <p className="text-white/70 text-xs font-semibold mt-0.5">{vipLabel}</p>
                  </div>
                </div>

                <CardContent className="p-5 grid grid-cols-2 gap-4 bg-white">
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-400 text-xs font-bold uppercase tracking-wider gap-1.5">
                      <Zap className="w-3 h-3 text-amber-500" /> Rendement/Jour
                    </div>
                    <p className="font-extrabold text-lg text-gray-900">{product.dailyRate.toLocaleString()} <span className="text-xs font-semibold text-gray-500">FCFA</span></p>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center justify-end text-gray-400 text-xs font-bold uppercase tracking-wider gap-1.5">
                      <Clock className="w-3 h-3 text-blue-500" /> Durée
                    </div>
                    <p className="font-extrabold text-lg text-gray-900">{product.duration} <span className="text-xs font-semibold text-gray-500 uppercase">Jours</span></p>
                  </div>
                </CardContent>

                <CardFooter className="bg-gray-50/80 p-5 border-t border-gray-100 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold uppercase text-gray-400 tracking-wider">Capital</p>
                    <p className="text-xl font-extrabold text-primary">{product.price.toLocaleString()} <span className="text-xs font-semibold">F</span></p>
                  </div>
                  <Button
                    onClick={() => invest.mutate(product.id)}
                    disabled={invest.isPending}
                    className="bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider text-sm rounded-xl h-12 px-8 shadow-sm active:scale-95 transition-all"
                    data-testid={`button-invest-${product.id}`}
                  >
                    {invest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Acheter"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>
      <BottomNav />
    </div>
  );
}
