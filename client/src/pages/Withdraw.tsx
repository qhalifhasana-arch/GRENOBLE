import { useWithdraw, useTransactions } from "@/hooks/use-transactions";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowDownLeft, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import { Transaction } from "@shared/schema";

const withdrawSchema = z.object({
  amount: z.coerce.number().min(1000, "Minimum 1000 FCFA"),
  firstName: z.string().min(2, "Requis"),
  lastName: z.string().min(2, "Requis"),
  mobileNumber: z.string().min(8, "Numéro invalide"),
  method: z.string().min(1, "Requis"),
});

export default function Withdraw() {
  const { user } = useAuth();
  const withdraw = useWithdraw();
  const { data: transactions } = useTransactions();

  const paymentNameParts = user?.paymentName?.split(' ') || [];
  const defaultFirstName = paymentNameParts.length > 0 ? paymentNameParts[0] : (user?.firstName || "");
  const defaultLastName = paymentNameParts.length > 1 ? paymentNameParts.slice(1).join(' ') : (user?.lastName || "");

  const form = useForm<z.infer<typeof withdrawSchema>>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
      firstName: defaultFirstName,
      lastName: defaultLastName,
      mobileNumber: user?.paymentPhone || user?.phoneNumber || "",
      method: user?.paymentMethod || "mobile_money",
    },
  });

  const onSubmit = (values: z.infer<typeof withdrawSchema>) => {
    withdraw.mutate(values);
  };

  const withdrawals = transactions?.filter((t: Transaction) => t.type === 'withdrawal') || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-24" data-testid="withdraw-page">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 px-5 pt-12 pb-8 rounded-b-[2rem]">
        <h1 className="text-xl font-extrabold text-white">Retrait Sécurisé</h1>
        <p className="text-gray-400 text-xs mt-1">Transférez vos gains vers votre mobile money</p>
      </div>

      <div className="px-5 -mt-6 space-y-5">
        <Card className="border-0 shadow-sm rounded-2xl">
          <CardHeader className="px-5 py-4 border-b border-gray-50">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-extrabold text-gray-800 flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                Demande de Retrait
              </CardTitle>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 font-bold text-xs">
                {user?.balance?.toLocaleString()} FCFA
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-500">Montant à retirer (FCFA)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="rounded-xl h-12 bg-gray-50 border-gray-100 font-bold text-base" data-testid="input-withdraw-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-500">Prénom</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-xl h-11 bg-gray-50 border-gray-100 font-medium" data-testid="input-withdraw-firstname" />
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
                        <FormLabel className="text-xs font-semibold text-gray-500">Nom</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-xl h-11 bg-gray-50 border-gray-100 font-medium" data-testid="input-withdraw-lastname" />
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
                      <FormLabel className="text-xs font-semibold text-gray-500">Numéro Mobile Money</FormLabel>
                      <FormControl>
                        <Input type="tel" {...field} className="rounded-xl h-11 bg-gray-50 border-gray-100 font-medium" data-testid="input-withdraw-mobile" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black text-white font-bold rounded-xl shadow-md mt-2 transition-all active:scale-[0.98]"
                  disabled={withdraw.isPending}
                  data-testid="button-confirm-withdraw"
                >
                  {withdraw.isPending ? <Loader2 className="animate-spin mr-2" /> : "Confirmer le retrait"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-sm font-extrabold text-gray-800 mb-3 px-1">Historique des retraits</h3>
          <div className="space-y-2">
            {withdrawals.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm border border-gray-100">
                Aucun retrait effectué
              </div>
            ) : (
              withdrawals.map((tx: Transaction) => (
                <div key={tx.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center" data-testid={`withdrawal-${tx.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="bg-red-50 p-2 rounded-xl text-red-500">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">Retrait</p>
                      <p className="text-[10px] text-gray-400">{format(new Date(tx.createdAt!), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-gray-800">-{tx.amount.toLocaleString()} F</p>
                    <Badge variant="secondary" className={`text-[10px] ${
                      tx.status === 'completed' ? 'bg-green-50 text-green-700' :
                      tx.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
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
