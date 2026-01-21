import { useProducts, useInvest } from "@/hooks/use-products";
import { BottomNav } from "@/components/BottomNav";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Clock, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Products() {
  const { data: products, isLoading } = useProducts();
  const invest = useInvest();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white px-6 pt-12 pb-6 border-b sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-primary font-display">Produits Agricoles</h1>
        <p className="text-muted-foreground text-sm">Investissez dans des projets durables</p>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          products?.map((product) => (
            <Card key={product.id} className="border-0 shadow-md overflow-hidden card-hover rounded-2xl">
              <div className="h-32 bg-gradient-to-r from-green-600 to-emerald-700 relative p-6 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md">
                    VIP {product.vipLevel}
                  </Badge>
                  <div className="text-white text-right">
                     <p className="text-xs opacity-80">Retour Total</p>
                     <p className="font-bold text-lg">{product.totalReturn.toLocaleString()} FCFA</p>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white font-display">{product.name}</h3>
              </div>
              
              <CardContent className="pt-6 grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center text-muted-foreground text-xs gap-1">
                    <TrendingUp className="w-3 h-3" /> Revenu Journalier
                  </div>
                  <p className="font-bold text-primary">{product.dailyRate.toLocaleString()} FCFA</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center text-muted-foreground text-xs gap-1">
                    <Clock className="w-3 h-3" /> Durée
                  </div>
                  <p className="font-bold text-gray-800">{product.duration} Jours</p>
                </div>
              </CardContent>

              <CardFooter className="bg-gray-50/50 p-4 border-t">
                <div className="w-full flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Prix d'entrée</p>
                    <p className="text-lg font-bold text-primary">{product.price.toLocaleString()} FCFA</p>
                  </div>
                  <Button 
                    onClick={() => invest.mutate(product.id)}
                    disabled={invest.isPending}
                    className="bg-primary hover:bg-primary/90 rounded-xl px-6 shadow-lg shadow-primary/20"
                  >
                    {invest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Acheter maintenant"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}
