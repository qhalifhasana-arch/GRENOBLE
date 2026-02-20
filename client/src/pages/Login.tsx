import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Phone, KeyRound, ChevronRight } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { COUNTRIES, type Country } from "@/lib/countries";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  phoneNumber: z.string().min(1, "Le numéro de téléphone est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export default function Login() {
  const { login } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phoneNumber: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    login.mutate(values);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 via-green-900 to-emerald-950 flex flex-col" data-testid="login-page">
      <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-3 mb-2">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 mb-2">
              <span className="text-3xl">🌱</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">GreenHarvest</h1>
            <p className="text-green-300/80 text-sm font-medium">Investissement Agricole Durable</p>
          </div>

          {!selectedCountry ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="text-center mb-2">
                <h2 className="text-lg font-bold text-white mb-1">Choisissez votre pays</h2>
                <p className="text-green-300/60 text-xs">Sélectionnez votre pays pour continuer</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => setSelectedCountry(country)}
                    className="bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 hover:border-white/30 rounded-2xl p-4 flex flex-col items-center gap-2 transition-all active:scale-95 group"
                    data-testid={`country-select-${country.code}`}
                  >
                    <span className="text-4xl group-hover:scale-110 transition-transform">{country.flag}</span>
                    <span className="text-white text-xs font-bold">{country.name}</span>
                    <span className="text-green-300/50 text-[10px]">{country.phonePrefix}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <button
                type="button"
                onClick={() => setSelectedCountry(null)}
                className="flex items-center gap-3 w-full bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4 hover:bg-white/15 transition-all"
                data-testid="button-change-country"
              >
                <span className="text-3xl">{selectedCountry.flag}</span>
                <div className="flex-1 text-left">
                  <p className="text-white font-bold text-sm">{selectedCountry.name}</p>
                  <p className="text-green-300/60 text-xs">{selectedCountry.phonePrefix}</p>
                </div>
                <span className="text-green-300/40 text-xs font-medium">Changer</span>
              </button>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 space-y-5">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-200/80 text-xs font-bold uppercase tracking-wider">Téléphone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400/60" />
                              <Input
                                type="tel"
                                placeholder={`${selectedCountry.phonePrefix} ...`}
                                {...field}
                                className="pl-11 h-13 rounded-xl bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:bg-white/15 focus:border-green-400/40 text-base"
                                data-testid="input-phone"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-200/80 text-xs font-bold uppercase tracking-wider">Mot de passe</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400/60" />
                              <Input
                                type="password"
                                placeholder="••••••••"
                                {...field}
                                className="pl-11 h-13 rounded-xl bg-white/10 border-white/10 text-white placeholder:text-white/30 focus:bg-white/15 focus:border-green-400/40 text-base"
                                data-testid="input-password"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-14 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-base font-bold shadow-lg shadow-green-900/40 mt-2 transition-all active:scale-[0.98]"
                      disabled={login.isPending}
                      data-testid="button-login"
                    >
                      {login.isPending ? (
                        <Loader2 className="animate-spin mr-2 w-5 h-5" />
                      ) : (
                        <>
                          Se connecter
                          <ChevronRight className="w-5 h-5 ml-1" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>

              <div className="text-center pt-2">
                <Link href="/">
                  <span className="text-sm text-green-300/60 hover:text-green-200 cursor-pointer transition-colors" data-testid="link-register">
                    Pas encore de compte ? <strong className="text-green-300">Inscrivez-vous</strong>
                  </span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
