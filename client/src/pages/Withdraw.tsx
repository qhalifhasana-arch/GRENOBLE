import { useWithdraw, useTransactions } from "@/hooks/use-transactions";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowDownLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";

const withdrawSchema = z.object({
  amount: z.coerce.number().min(1000, "Minimum 1000 FCFA"),
  firstName: z.string().min(2, "Requis"),
  lastName: z.string().min(2, "Requis"),
  mobileNumber: z.string().min(8, "Numéro invalide"),
  method: z.string().default("mobile_money"),
});

export default function Withdraw() {
  const { user } = useAuth();
  const withdraw = useWithdraw();
  const { data: transactions } = useTransactions();
  
  const form = useForm<z.infer<typeof withdrawSchema>>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      mobileNumber: user?.phoneNumber || "",
      method: "mobile_money",
    },
  });

  const onSubmit = (values: z.infer<typeof withdrawSchema>) => {
    withdraw.mutate(values);
  };

  const withdrawals = transactions?.filter(t => t.type === 'withdrawal') || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-gray-900 px-6 pt-12 pb-8 rounded-b-[2rem] shadow-lg">
        <h1 className="text-2xl font-bold text-white font-display mb-1">Retrait Sécurisé</h1>
        <p className="text-gray-400 text-sm">Transférez vos gains vers votre mobile money</p>
      </div>

      <div className="p-4 -mt-6 space-y-6">
        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader>
             <div className="flex justify-between items-center">
               <CardTitle className="text-lg">Demande de Retrait</CardTitle>
               <Badge variant="outline" className="bg-gray-50">Solde: {user?.balance} FCFA</Badge>
             </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant à retirer (FCFA)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="rounded-xl bg-gray-50 border-gray-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-xl bg-gray-50 border-gray-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-xl bg-gray-50 border-gray-200" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro Mobile Money</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} className="rounded-xl bg-gray-50 border-gray-200" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl py-6 text-lg shadow-lg shadow-primary/30 mt-4"
                  disabled={withdraw.isPending}
                >
                  {withdraw.isPending ? <Loader2 className="animate-spin mr-2" /> : "Confirmer le retrait"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3 ml-1">Historique</h3>
          <div className="space-y-3">
            {withdrawals.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-muted-foreground text-sm border border-gray-100">
                Aucun retrait effectué
              </div>
            ) : (
              withdrawals.map((tx) => (
                <div key={tx.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-full text-red-600">
                      <ArrowDownLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">Retrait</p>
                      <p className="text-xs text-gray-400">{format(new Date(tx.createdAt!), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">-{tx.amount} FCFA</p>
                    <Badge variant="secondary" className={`text-xs ${
                      tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {tx.status === 'completed' ? 'Validé' : 
                       tx.status === 'pending' ? 'En attente' : 'Refusé'}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
