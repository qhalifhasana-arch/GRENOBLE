import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Phone, KeyRound, ChevronRight, Eye, EyeOff } from "lucide-react";
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
import heroAgricultureImg from "@/assets/images/hero-agriculture.jpg";

const loginSchema = z.object({
  phoneNumber: z.string().min(1, "Le numéro de téléphone est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export default function Login() {
  const { login } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
      <div className="relative w-full h-48 sm:h-56 overflow-hidden">
        <img
          src={heroAgricultureImg}
          alt="Champs agricoles verdoyants"
          className="w-full h-full object-cover"
          data-testid="img-hero-agriculture"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-green-950/40 via-green-900/60 to-green-950" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl border border-white/25 mb-3 shadow-lg">
            <span className="text-3xl">🌱</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight drop-shadow-lg">GreenHarvest</h1>
          <p className="text-green-200/90 text-base font-medium mt-1 drop-shadow">Investissement Agricole Durable</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center px-5 py-6">
        <div className="w-full max-w-md lg:max-w-lg space-y-6">

          {!selectedCountry ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-white mb-1">Choisissez votre pays</h2>
                <p className="text-green-300/60 text-sm">Sélectionnez votre pays pour continuer</p>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                {COUNTRIES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => setSelectedCountry(country)}
                    className="bg-white/10 backdrop-blur-sm border border-white/15 hover:bg-white/20 hover:border-white/30 rounded-2xl p-5 flex flex-col items-center gap-2 transition-all active:scale-95 group"
                    data-testid={`country-select-${country.code}`}
                  >
                    <span className="text-5xl group-hover:scale-110 transition-transform">{country.flag}</span>
                    <span className="text-white text-sm font-bold">{country.name}</span>
                    <span className="text-green-300/50 text-xs">{country.phonePrefix}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <button
                type="button"
                onClick={() => setSelectedCountry(null)}
                className="flex items-center gap-3 w-full bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-5 hover:bg-white/15 transition-all"
                data-testid="button-change-country"
              >
                <span className="text-4xl">{selectedCountry.flag}</span>
                <div className="flex-1 text-left">
                  <p className="text-white font-bold text-base">{selectedCountry.name}</p>
                  <p className="text-green-300/60 text-sm">{selectedCountry.phonePrefix}</p>
                </div>
                <span className="text-green-300/40 text-sm font-medium">Changer</span>
              </button>

              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-7 border border-white/10 space-y-5">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-200/80 text-sm font-bold uppercase tracking-wider">Téléphone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400/60" />
                              <Input
                                type="tel"
                                placeholder={`${selectedCountry.phonePrefix} ...`}
                                {...field}
                                className="pl-11 h-14 rounded-xl bg-white/10 border-white/10 text-lg text-white placeholder:text-white/30 focus:bg-white/15 focus:border-green-400/40"
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
                          <FormLabel className="text-green-200/80 text-sm font-bold uppercase tracking-wider">Mot de passe</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400/60" />
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field}
                                className="pl-11 pr-12 h-14 rounded-xl bg-white/10 border-white/10 text-lg text-white placeholder:text-white/30 focus:bg-white/15 focus:border-green-400/40"
                                data-testid="input-password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400/60 hover:text-green-300 transition-colors"
                                data-testid="toggle-password"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-[56px] bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-green-900/40 mt-2 transition-all active:scale-[0.98]"
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
                  <span className="text-base text-green-300/60 hover:text-green-200 cursor-pointer transition-colors" data-testid="link-register">
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
