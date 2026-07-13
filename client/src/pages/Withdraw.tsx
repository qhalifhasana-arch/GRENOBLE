import { useState, useMemo } from "react";
import { useWithdraw, useTransactions } from "@/hooks/use-transactions";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, ArrowDownLeft, Wallet, HandCoins, TrendingDown,
  ChevronRight, ArrowLeft, CheckCircle2
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { format } from "date-fns";
import { Transaction } from "@shared/schema";
import { COUNTRIES, getPaymentMethodsForCountry, type Country } from "@/lib/countries";
import withdrawBg from "@/assets/images/withdraw-harvest.webp";
import { cn } from "@/lib/utils";

const withdrawSchema = z.object({
  amount: z.coerce.number().min(1000, "Minimum 1000 FCFA"),
  firstName: z.string().min(2, "Requis"),
  lastName: z.string().min(2, "Requis"),
  country: z.string().min(1, "Choisissez votre pays"),
  method: z.string().min(1, "Choisissez un moyen de réception"),
  mobileNumber: z.string().min(8, "Numéro invalide"),
});

const QUICK_AMOUNTS = [1000, 5000, 10000, 25000, 50000];

export default function Withdraw() {
  const { user } = useAuth();
  const withdraw = useWithdraw();
  const { data: transactions } = useTransactions();

  const [step, setStep] = useState<"form" | "confirm" | "done">("form");
  const [submittedValues, setSubmittedValues] = useState<z.infer<typeof withdrawSchema> | null>(null);

  const defaultCountry = user?.country || "";
  const defaultMethods = getPaymentMethodsForCountry(defaultCountry);

  const form = useForm<z.infer<typeof withdrawSchema>>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: 0,
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      country: defaultCountry,
      method: defaultMethods[0] || "",
      mobileNumber: user?.paymentPhone || user?.phoneNumber || "",
    },
  });

  const selectedCountryName = form.watch("country");
  const selectedMethod = form.watch("method");
  const selectedCountry = useMemo(
    () => COUNTRIES.find((c) => c.name === selectedCountryName) || null,
    [selectedCountryName]
  );
  const availableMethods = useMemo(
    () => getPaymentMethodsForCountry(selectedCountryName),
    [selectedCountryName]
  );

  const handleCountrySelect = (country: Country) => {
    form.setValue("country", country.name);
    const methods = getPaymentMethodsForCountry(country.name);
    form.setValue("method", methods[0] || "");
  };

  const onPreSubmit = (values: z.infer<typeof withdrawSchema>) => {
    setSubmittedValues(values);
    setStep("confirm");
  };

  const confirmWithdraw = () => {
    if (!submittedValues) return;
    withdraw.mutate(submittedValues, {
      onSuccess: () => setStep("done"),
    });
  };

  const withdrawals = transactions?.filter((t: Transaction) => t.type === "withdrawal") || [];

  // ── DONE ──────────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen bg-gray-50 pb-28">
        <div className="relative overflow-hidden rounded-b-[2rem] h-48">
          <img src={withdrawBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/75 to-yellow-900/85" />
        </div>
        <div className="px-5 -mt-12 max-w-md mx-auto">
          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden text-center">
            <CardContent className="p-8 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-extrabold text-gray-900">Demande envoyée !</h2>
              <p className="text-gray-500 text-sm">
                Votre retrait de <span className="font-bold text-gray-800">{submittedValues?.amount?.toLocaleString()} FCFA</span> est en cours de traitement.
              </p>
              <p className="text-xs text-gray-400">
                Via <span className="font-semibold">{submittedValues?.method}</span> · {selectedCountry?.flag} {submittedValues?.country}
              </p>
              <Button
                onClick={() => { setStep("form"); setSubmittedValues(null); form.reset(); }}
                className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
              >
                Nouveau retrait
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── CONFIRM ───────────────────────────────────────────────────────────────
  if (step === "confirm" && submittedValues) {
    return (
      <div className="min-h-screen bg-gray-50 pb-28">
        <div className="relative overflow-hidden rounded-b-[2rem] h-48">
          <img src={withdrawBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-amber-900/75 to-yellow-900/85" />
          <div className="relative px-5 pt-10 flex items-center gap-3">
            <button onClick={() => setStep("form")} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <h1 className="text-xl font-extrabold text-white">Confirmation</h1>
          </div>
        </div>
        <div className="px-5 -mt-6 max-w-md mx-auto">
          <Card className="border-0 shadow-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <p className="text-gray-500 text-sm font-semibold text-center">Vérifiez les informations avant de confirmer</p>

              <div className="bg-amber-50 rounded-2xl p-4 space-y-3">
                {[
                  ["Montant", `${submittedValues.amount.toLocaleString()} FCFA`],
                  ["Pays", `${selectedCountry?.flag || ""} ${submittedValues.country}`],
                  ["Moyen de réception", submittedValues.method],
                  ["Numéro", `${selectedCountry?.phonePrefix || ""} ${submittedValues.mobileNumber}`],
                  ["Titulaire", `${submittedValues.firstName} ${submittedValues.lastName}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-medium">{k}</span>
                    <span className="text-gray-900 font-bold text-sm">{v}</span>
                  </div>
                ))}
              </div>

              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-red-700 text-xs font-semibold text-center">
                  ⚠️ Assurez-vous que le numéro est correct. Toute erreur entraîne la perte des fonds.
                </p>
              </div>

              <Button
                onClick={confirmWithdraw}
                disabled={withdraw.isPending}
                className="w-full h-13 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                {withdraw.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Traitement…</>
                  : "Confirmer le retrait"}
              </Button>
              <Button variant="outline" onClick={() => setStep("form")} className="w-full rounded-xl font-semibold">
                <ArrowLeft className="w-4 h-4 mr-2" /> Modifier
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  // ── FORM ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-28" data-testid="withdraw-page">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-b-[2rem]">
        <img src={withdrawBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/75 via-orange-800/70 to-yellow-900/85" />
        <div className="relative px-5 pt-12 pb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 backdrop-blur-sm w-11 h-11 rounded-xl flex items-center justify-center">
              <HandCoins className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Retrait Sécurisé</h1>
              <p className="text-amber-100/80 text-sm">Récoltez vos gains</p>
            </div>
          </div>
          <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-amber-100/70 text-xs font-semibold uppercase tracking-wider">Solde disponible</p>
              <p className="text-white text-2xl font-extrabold">
                {user?.balance?.toLocaleString()} <span className="text-base font-bold text-amber-200/80">FCFA</span>
              </p>
            </div>
            <Wallet className="w-8 h-8 text-amber-200/50" />
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6 space-y-5 max-w-2xl mx-auto">
        <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="px-5 py-4 border-b border-gray-50 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardTitle className="text-base font-extrabold text-gray-800 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-amber-600" />
              Demande de Retrait
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onPreSubmit)} className="space-y-5">

                {/* ── Montant ── */}
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-600">Montant à retirer (FCFA)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          className="rounded-xl h-13 bg-gray-50 border-gray-200 font-bold text-base"
                          data-testid="input-withdraw-amount"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-5 gap-1.5">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => form.setValue("amount", amt)}
                      className={cn(
                        "py-2 rounded-xl border text-xs font-bold transition-all active:scale-95",
                        form.watch("amount") === amt
                          ? "bg-amber-600 text-white border-amber-600"
                          : "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      )}
                    >
                      {amt >= 1000 ? `${amt / 1000}k` : amt}
                    </button>
                  ))}
                </div>

                {/* ── Pays ── */}
                <FormField
                  control={form.control}
                  name="country"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-600">Pays de réception</FormLabel>
                      <div className="grid grid-cols-2 gap-3 mt-1">
                        {COUNTRIES.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountrySelect(country)}
                            className={cn(
                              "flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all active:scale-[0.97] text-left",
                              selectedCountryName === country.name
                                ? "border-amber-500 bg-amber-50 shadow-sm"
                                : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/40"
                            )}
                          >
                            <span className="text-2xl">{country.flag}</span>
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "font-bold text-sm truncate",
                                selectedCountryName === country.name ? "text-amber-800" : "text-gray-700"
                              )}>{country.name}</p>
                              <p className="text-gray-400 text-xs font-medium">{country.phonePrefix}</p>
                            </div>
                            {selectedCountryName === country.name && (
                              <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── Moyen de réception ── */}
                {selectedCountryName && (
                  <FormField
                    control={form.control}
                    name="method"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-600">Moyen de réception</FormLabel>
                        <div className="space-y-2 mt-1">
                          {availableMethods.map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => form.setValue("method", method)}
                              className={cn(
                                "w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all active:scale-[0.98] text-left",
                                selectedMethod === method
                                  ? "border-amber-500 bg-amber-50"
                                  : "border-gray-200 bg-white hover:border-amber-200"
                              )}
                            >
                              <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0",
                                method.includes("Airtel") ? "bg-red-100" : "bg-blue-100"
                              )}>
                                {method.includes("Airtel") ? "🔴" : "🔵"}
                              </div>
                              <span className={cn(
                                "font-bold text-sm",
                                selectedMethod === method ? "text-amber-800" : "text-gray-700"
                              )}>{method}</span>
                              {selectedMethod === method && (
                                <div className="ml-auto w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                                  <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* ── Numéro Mobile Money ── */}
                <FormField
                  control={form.control}
                  name="mobileNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-600">Numéro de réception</FormLabel>
                      <div className="flex gap-2">
                        {selectedCountry && (
                          <div className="flex items-center gap-1.5 bg-gray-100 border border-gray-200 rounded-xl px-3 h-12 flex-shrink-0 font-bold text-gray-700 text-sm">
                            <span>{selectedCountry.flag}</span>
                            <span>{selectedCountry.phonePrefix}</span>
                          </div>
                        )}
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="XX XX XX XX"
                            {...field}
                            className="rounded-xl h-12 bg-gray-50 border-gray-200 font-medium flex-1"
                            data-testid="input-withdraw-mobile"
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ── Titulaire ── */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-600">Prénom</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-xl h-12 bg-gray-50 border-gray-200 font-medium" data-testid="input-withdraw-firstname" />
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
                        <FormLabel className="text-sm font-semibold text-gray-600">Nom</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-xl h-12 bg-gray-50 border-gray-200 font-medium" data-testid="input-withdraw-lastname" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-bold rounded-xl shadow-md mt-2 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  data-testid="button-confirm-withdraw"
                >
                  Continuer <ChevronRight className="w-4 h-4" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* ── Historique ── */}
        <div>
          <h3 className="text-base font-extrabold text-gray-800 mb-3 px-1 flex items-center gap-2">
            <ArrowDownLeft className="w-4 h-4 text-amber-600" />
            Historique des retraits
          </h3>
          <div className="space-y-2">
            {withdrawals.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-base border border-gray-100">
                Aucun retrait effectué
              </div>
            ) : (
              withdrawals.map((tx: Transaction) => (
                <div
                  key={tx.id}
                  className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm"
                  data-testid={`withdrawal-${tx.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600">
                      <ArrowDownLeft className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">{tx.method || "Retrait"}</p>
                      <p className="text-xs text-gray-400">{format(new Date(tx.createdAt!), "dd/MM/yyyy HH:mm")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-gray-800">-{tx.amount.toLocaleString()} F</p>
                    <Badge
                      variant="secondary"
                      className={cn("text-xs mt-0.5", {
                        "bg-green-50 text-green-700": tx.status === "completed",
                        "bg-amber-50 text-amber-700": tx.status === "pending",
                        "bg-red-50 text-red-700": tx.status === "rejected",
                      })}
                    >
                      {tx.status === "completed" ? "Validé" : tx.status === "pending" ? "En attente" : "Refusé"}
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
