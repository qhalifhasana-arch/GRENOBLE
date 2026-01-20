import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Sprout } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const registerSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  phoneNumber: z.string().min(8, "Numéro de téléphone invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  country: z.string().min(1, "Veuillez sélectionner un pays"),
  referralCode: z.string().optional(),
});

export default function Register() {
  const { register } = useAuth();
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      password: "",
      country: "",
      referralCode: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>) => {
    register.mutate(values);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
           <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-4 rounded-full">
                <Sprout className="w-12 h-12 text-primary" />
              </div>
           </div>
           <h1 className="text-4xl font-extrabold text-primary tracking-tight">GREENIX</h1>
           <p className="text-muted-foreground">Investissement Agricole Durable</p>
           
           <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg inline-block font-semibold text-sm mt-2 border border-amber-200">
             🎁 Bonus d’inscription : 700 FCFA
           </div>
        </div>

        <Card className="border-0 shadow-xl shadow-primary/5">
          <CardHeader>
            <CardTitle className="text-center text-xl">Créer un compte</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean" {...field} className="rounded-xl bg-gray-50 border-gray-200 focus:bg-white" />
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
                          <Input placeholder="Dupont" {...field} className="rounded-xl bg-gray-50 border-gray-200 focus:bg-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pays</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded-xl bg-gray-50 border-gray-200">
                            <SelectValue placeholder="Sélectionnez votre pays" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Togo">🇹🇬 Togo</SelectItem>
                          <SelectItem value="Bénin">🇧🇯 Bénin</SelectItem>
                          <SelectItem value="Sénégal">🇸🇳 Sénégal</SelectItem>
                          <SelectItem value="Côte d'Ivoire">🇨🇮 Côte d'Ivoire</SelectItem>
                          <SelectItem value="Burkina Faso">🇧🇫 Burkina Faso</SelectItem>
                          <SelectItem value="Mali">🇲🇱 Mali</SelectItem>
                          <SelectItem value="Congo-Brazzaville">🇨🇬 Congo-Brazzaville</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="+228..." {...field} className="rounded-xl bg-gray-50 border-gray-200 focus:bg-white" />
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
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} className="rounded-xl bg-gray-50 border-gray-200 focus:bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referralCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code de parrainage (Optionnel)</FormLabel>
                      <FormControl>
                        <Input placeholder="Code parrain" {...field} className="rounded-xl bg-gray-50 border-gray-200 focus:bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 text-lg font-semibold shadow-lg shadow-primary/30 mt-4"
                  disabled={register.isPending}
                >
                  {register.isPending ? <Loader2 className="animate-spin mr-2" /> : "S'inscrire"}
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-muted-foreground mb-4">Vous avez déjà un compte ?</p>
              <Link href="/login">
                <Button variant="outline" className="w-full rounded-xl py-6 border-primary text-primary font-bold hover:bg-primary/5">
                  Se connecter
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          En vous inscrivant, vous acceptez nos <span className="text-primary underline cursor-pointer">conditions d'utilisation</span>.
        </p>
      </div>
    </div>
  );
}
