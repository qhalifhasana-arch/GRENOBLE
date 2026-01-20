import { useDeposit } from "@/hooks/use-transactions";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Wallet } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

const AMOUNTS = [3000, 5000, 10000, 20000, 50000, 100000];

const depositSchema = z.object({
  amount: z.coerce.number().min(3000, "Minimum 3000 FCFA"),
  firstName: z.string().min(2, "Requis"),
  lastName: z.string().min(2, "Requis"),
  method: z.string().min(1, "Requis"),
});

export default function Deposit() {
  const { user } = useAuth();
  const deposit = useDeposit();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const form = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      amount: 3000,
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      method: "mobile_money",
    },
  });

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    form.setValue("amount", amount);
  };

  const onSubmit = (values: z.infer<typeof depositSchema>) => {
    deposit.mutate(values);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-primary px-6 pt-12 pb-8 rounded-b-[2rem] shadow-lg">
        <h1 className="text-2xl font-bold text-white font-display mb-1">Effectuer un Dépôt</h1>
        <p className="text-green-100 text-sm">Rechargez votre compte en toute sécurité</p>
      </div>

      <div className="p-4 -mt-6">
        <Card className="border-0 shadow-lg rounded-2xl mb-6">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-500 mb-3">Sélectionner un montant</p>
            <div className="grid grid-cols-3 gap-3">
              {AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleAmountSelect(amount)}
                  className={cn(
                    "py-3 rounded-xl border text-sm font-bold transition-all",
                    selectedAmount === amount 
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                      : "bg-white border-gray-100 text-gray-700 hover:border-primary/50"
                  )}
                >
                  {amount.toLocaleString()}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">Détails du Paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant (FCFA)</FormLabel>
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
                  name="method"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Moyen de Paiement</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0 rounded-xl border border-gray-200 p-4">
                            <FormControl>
                              <RadioGroupItem value="mobile_money" />
                            </FormControl>
                            <FormLabel className="font-normal flex-1 cursor-pointer">
                              Mobile Money
                            </FormLabel>
                            <Wallet className="h-4 w-4 text-gray-400" />
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl py-6 text-lg shadow-lg shadow-secondary/30 mt-4"
                  disabled={deposit.isPending}
                >
                  {deposit.isPending ? <Loader2 className="animate-spin mr-2" /> : "Continuer vers le paiement"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
