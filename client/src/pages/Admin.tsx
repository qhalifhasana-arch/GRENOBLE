import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type User as SchemaUser, type Transaction, type Setting, type Product } from "@shared/schema";
import { api } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
import { getFlagForCountry } from "@/lib/countries";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Ban, 
  Unlock, 
  ShieldCheck, 
  UserPlus, 
  Wallet, 
  Search,
  Plus,
  Minus,
  Shield,
  Link as LinkIcon,
  MessageSquare,
  Send,
  ArrowLeft,
  Settings as SettingsIcon,
  LayoutDashboard,
  Users as UsersIcon,
  History,
  Activity,
  User as UserIcon,
  DollarSign,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

type EnrichedTransaction = Transaction & { userPhone?: string; userCountry?: string; userName?: string };

export default function Admin() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [searchPhone, setSearchPhone] = useState("");

  const { data: adminStats } = useQuery<{ registrationsToday: number; depositsToday: number }>({
    queryKey: [api.admin.stats.path],
    refetchInterval: 15000,
    staleTime: 5000,
  });

  const { data: users, isLoading: loadingUsers, isError: usersError } = useQuery<SchemaUser[]>({
    queryKey: [api.admin.users.path],
    refetchInterval: 15000,
    staleTime: 5000,
  });

  const { data: transactions, isLoading: loadingTransactions, isError: transactionsError } = useQuery<EnrichedTransaction[]>({
    queryKey: [api.admin.transactions.path],
    refetchInterval: 15000,
    staleTime: 5000,
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: settings } = useQuery<Setting[]>({
    queryKey: [api.admin.settings.path],
    refetchInterval: 30000,
    staleTime: 10000,
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/admin/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update transaction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.transactions.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.users.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
      toast({ title: "Transaction traitée" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.path] });
      toast({ title: "Utilisateur mis à jour" });
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const res = await fetch(`/api/admin/settings/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update setting");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.settings.path] });
      toast({ title: "Paramètre sauvegardé" });
    },
  });

  const adjustBalanceMutation = useMutation({
    mutationFn: async ({ userId, action, amount }: { userId: number; action: string; amount: number }) => {
      const res = await fetch(`/api/admin/users/${userId}/balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, amount }),
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Erreur" }));
        throw new Error(err.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.users.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.transactions.path] });
      toast({ title: "Solde mis à jour avec succès" });
    },
    onError: (err: Error) => {
      toast({ variant: "destructive", title: "Erreur", description: err.message });
    },
  });

  const addInvestmentMutation = useMutation({
    mutationFn: async ({ userId, productId }: { userId: number; productId: number }) => {
      const res = await fetch(`/api/invest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, bypassBalance: true }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add VIP");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Produit VIP ajouté manuellement" });
    },
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchPhone) return users;
    const q = searchPhone.toLowerCase();
    return users.filter(u =>
      u.phoneNumber.toLowerCase().includes(q) ||
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q)
    );
  }, [users, searchPhone]);

  if (loadingUsers || loadingTransactions) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (usersError || transactionsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-4 p-6">
        <XCircle className="w-12 h-12 text-red-500" />
        <p className="text-lg font-semibold text-gray-800">Session expirée</p>
        <p className="text-gray-500 text-center">Veuillez vous reconnecter pour accéder au panneau admin.</p>
        <Button onClick={() => window.location.href = "/login"} className="bg-emerald-600 hover:bg-emerald-700">
          Se reconnecter
        </Button>
      </div>
    );
  }

  const pendingDeposits = transactions?.filter(tx => tx.type === 'deposit' && tx.status === 'pending') || [];
  const pendingWithdrawals = transactions?.filter(tx => tx.type === 'withdrawal' && tx.status === 'pending') || [];
  const processedTransactions = transactions?.filter(tx => tx.status !== 'pending') || [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white p-6 pb-12 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Shield className="w-40 h-40" />
        </div>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-purple-500 hover:bg-purple-600 text-white font-black uppercase text-[10px]">Root Access</Badge>
              <span className="text-slate-400 text-xs font-mono">ID: {currentUser?.id}</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">Panneau de Contrôle</h1>
            <p className="text-slate-400 text-sm">Gestion globale de GREENIX Agriculture</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="bg-transparent border-slate-700 text-white hover:bg-slate-800 rounded-2xl gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-20 space-y-6">
        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg rounded-[2rem] bg-white overflow-hidden group hover-elevate transition-all">
            <CardContent className="p-6">
              <div className="bg-green-100 w-12 h-12 rounded-2xl flex items-center justify-center text-green-600 mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <UserPlus className="w-6 h-6" />
              </div>
              <p className="text-xs uppercase tracking-widest font-black text-muted-foreground mb-1">Inscriptions</p>
              <h3 className="text-3xl font-black text-slate-900">{adminStats?.registrationsToday || 0}</h3>
              <p className="text-[10px] text-green-600 font-bold mt-1">AUJOURD'HUI</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-[2rem] bg-white overflow-hidden group hover-elevate transition-all">
            <CardContent className="p-6">
              <div className="bg-amber-100 w-12 h-12 rounded-2xl flex items-center justify-center text-amber-600 mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Wallet className="w-6 h-6" />
              </div>
              <p className="text-xs uppercase tracking-widest font-black text-muted-foreground mb-1">Dépôts</p>
              <h3 className="text-3xl font-black text-slate-900">{adminStats?.depositsToday || 0}</h3>
              <p className="text-[10px] text-amber-600 font-bold mt-1">EN ATTENTE: {pendingDeposits.length}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-[2rem] bg-white overflow-hidden group hover-elevate transition-all">
            <CardContent className="p-6">
              <div className="bg-rose-100 w-12 h-12 rounded-2xl flex items-center justify-center text-rose-600 mb-4 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <Activity className="w-6 h-6" />
              </div>
              <p className="text-xs uppercase tracking-widest font-black text-muted-foreground mb-1">Retraits</p>
              <h3 className="text-3xl font-black text-slate-900">{pendingWithdrawals.length}</h3>
              <p className="text-[10px] text-rose-600 font-bold mt-1">À TRAITER</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg rounded-[2rem] bg-white overflow-hidden group hover-elevate transition-all">
            <CardContent className="p-6">
              <div className="bg-blue-100 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <UsersIcon className="w-6 h-6" />
              </div>
              <p className="text-xs uppercase tracking-widest font-black text-muted-foreground mb-1">Total Utilisateurs</p>
              <h3 className="text-3xl font-black text-slate-900">{users?.length || 0}</h3>
              <p className="text-[10px] text-blue-600 font-bold mt-1">COMPTES ACTIFS</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="validations" className="w-full">
          <div className="bg-white p-2 rounded-3xl shadow-sm border border-gray-100 mb-6 inline-flex w-full overflow-x-auto no-scrollbar">
            <TabsList className="bg-transparent border-0 h-auto gap-1">
              <TabsTrigger value="validations" className="rounded-2xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-sm transition-all whitespace-nowrap">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Validations
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-2xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-sm transition-all whitespace-nowrap">
                <UsersIcon className="w-4 h-4 mr-2" /> Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="registrations" className="rounded-2xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-sm transition-all whitespace-nowrap">
                <UserPlus className="w-4 h-4 mr-2" /> Inscriptions
              </TabsTrigger>
              <TabsTrigger value="settings" className="rounded-2xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-sm transition-all whitespace-nowrap">
                <SettingsIcon className="w-4 h-4 mr-2" /> Réglages Liens
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-2xl px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-white font-bold text-sm transition-all whitespace-nowrap">
                <History className="w-4 h-4 mr-2" /> Historique
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="validations">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Deposits Validation */}
              <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="bg-amber-50/50 border-b border-amber-100 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-black text-slate-900">Dépôts en attente</CardTitle>
                      <CardDescription>Vérifiez les preuves de paiement</CardDescription>
                    </div>
                    <Badge className="bg-amber-500 text-white font-black">{pendingDeposits.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <TransactionTable 
                    transactions={pendingDeposits} 
                    onUpdate={(id, status) => updateTransactionMutation.mutate({ id, status })}
                  />
                </CardContent>
              </Card>

              {/* Withdrawals Validation */}
              <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="bg-rose-50/50 border-b border-rose-100 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-black text-slate-900">Retraits à traiter</CardTitle>
                      <CardDescription>Effectuez les transferts mobile money</CardDescription>
                    </div>
                    <Badge className="bg-rose-500 text-white font-black">{pendingWithdrawals.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <TransactionTable 
                    transactions={pendingWithdrawals} 
                    onUpdate={(id, status) => updateTransactionMutation.mutate({ id, status })}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="px-8 py-6 border-b border-gray-50 bg-slate-50/30">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-black text-slate-900">Gestion des Utilisateurs</CardTitle>
                    <CardDescription>Contrôle complet des investisseurs</CardDescription>
                  </div>
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Rechercher par téléphone ou nom..." 
                      className="pl-12 rounded-2xl h-12 bg-white border-gray-200 shadow-sm focus:ring-primary"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                      data-testid="input-search-users"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                {filteredUsers.length === 0 ? (
                  <div className="py-12 text-center">
                    <UsersIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-400 font-medium">Aucun utilisateur trouvé</p>
                    {searchPhone && <p className="text-xs text-gray-300 mt-1">Essayez un autre terme de recherche</p>}
                  </div>
                ) : (
                <div className="divide-y divide-gray-50">
                  {filteredUsers.map((u) => (
                    <div key={u.id} className="p-5 hover:bg-gray-50/30 transition-colors" data-testid={`user-row-${u.id}`}>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="w-11 h-11 border border-gray-100 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">{u.firstName[0]}{u.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-900 leading-none mb-1 truncate">{u.firstName} {u.lastName}</p>
                            <p className="text-[12px] text-primary font-mono font-semibold" data-testid={`user-phone-${u.id}`}>{u.phoneNumber}</p>
                            <p className="text-[10px] text-gray-400">{u.country}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {u.isAdmin ? <Badge className="bg-purple-100 text-purple-700 border-0 text-[9px] font-black uppercase px-2 h-5">Admin</Badge> : <Badge variant="outline" className="text-[9px] h-5 border-gray-200">User</Badge>}
                          {u.isBanned ? <Badge variant="destructive" className="text-[9px] h-5 font-black uppercase px-2">Banni</Badge> : <Badge className="bg-green-100 text-green-700 border-0 text-[9px] h-5 font-black uppercase px-2">Actif</Badge>}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3 mb-3 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Solde actuel</p>
                            <p className="text-lg font-extrabold text-slate-900" data-testid={`user-balance-${u.id}`}>{u.balance.toLocaleString()} FCFA</p>
                          </div>
                          <div className="flex gap-1.5">
                            <BalanceActionDialog
                              user={u}
                              action="credit"
                              onUpdate={(amount) => adjustBalanceMutation.mutate({ userId: u.id, action: 'credit', amount })}
                            />
                            <BalanceActionDialog
                              user={u}
                              action="debit"
                              onUpdate={(amount) => adjustBalanceMutation.mutate({ userId: u.id, action: 'debit', amount })}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 px-3 rounded-xl bg-red-50 border-red-100 text-red-600 hover:bg-red-100 text-xs font-bold gap-1"
                              onClick={() => {
                                if (confirm(`Vider le compte de ${u.firstName} ${u.lastName} ? Le solde sera mis à 0 FCFA.`)) {
                                  adjustBalanceMutation.mutate({ userId: u.id, action: 'empty', amount: 0 });
                                }
                              }}
                              title="Vider le compte"
                              data-testid={`button-empty-${u.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Vider
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-8 px-3 rounded-lg text-xs font-bold gap-1 ${u.isBanned ? 'bg-green-50 border-green-100 text-green-600 hover:bg-green-100' : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'}`}
                          onClick={() => updateUserMutation.mutate({ id: u.id, updates: { isBanned: !u.isBanned } })}
                          data-testid={`button-ban-${u.id}`}
                        >
                          {u.isBanned ? <><Unlock className="w-3.5 h-3.5" /> Débannir</> : <><Ban className="w-3.5 h-3.5" /> Bannir</>}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-8 px-3 rounded-lg text-xs font-bold gap-1 ${u.withdrawalBlocked ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}
                          onClick={() => updateUserMutation.mutate({ id: u.id, updates: { withdrawalBlocked: !u.withdrawalBlocked } })}
                          data-testid={`button-block-${u.id}`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> {u.withdrawalBlocked ? 'Débloquer Retraits' : 'Bloquer Retraits'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 rounded-lg text-xs font-bold gap-1 bg-purple-50 border-purple-100 text-purple-600 hover:bg-purple-100"
                          onClick={() => updateUserMutation.mutate({ id: u.id, updates: { isAdmin: !u.isAdmin } })}
                          data-testid={`button-admin-${u.id}`}
                        >
                          <Shield className="w-3.5 h-3.5" /> {u.isAdmin ? 'Retirer Admin' : 'Promouvoir Admin'}
                        </Button>
                        <AddVIPDialog products={products || []} onAdd={(productId) => addInvestmentMutation.mutate({ userId: u.id, productId })} />
                      </div>
                    </div>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations">
            <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="px-6 py-5 border-b border-gray-50 bg-blue-50/30">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black text-slate-900">Nouvelles Inscriptions</CardTitle>
                    <CardDescription>Tous les comptes créés ({users?.length || 0} au total)</CardDescription>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
                    <UserPlus className="w-6 h-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3 max-h-[70vh] overflow-y-auto">
                {users && [...users].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).map((u, index) => (
                  <div key={u.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 hover:bg-gray-100/50 transition-colors" data-testid={`registration-card-${u.id}`}>
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="w-11 h-11 border-2 border-blue-200">
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-sm uppercase">{u.firstName[0]}{u.lastName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center">#{index + 1}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-sm text-slate-900">{u.firstName} {u.lastName}</p>
                        <p className="text-base font-black text-blue-600 mt-0.5" data-testid={`registration-phone-${u.id}`}>{u.phoneNumber}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge variant="outline" className="border-gray-200 font-bold text-[10px] gap-1">
                            {getFlagForCountry(u.country)} {u.country}
                          </Badge>
                          <span className="text-[10px] text-gray-400 font-semibold">
                            {format(new Date(u.createdAt || Date.now()), "dd/MM/yyyy 'à' HH:mm")}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-gray-400 font-bold">Solde</p>
                        <p className="font-black text-sm text-emerald-600">{u.balance.toLocaleString()} F</p>
                      </div>
                    </div>
                    {u.referrerId && (
                      <div className="mt-2 pt-2 border-t border-gray-200/60">
                        <p className="text-[10px] text-gray-400 font-semibold">Parrainé par : <span className="text-slate-600 font-bold">{users?.find(p => p.id === u.referrerId)?.firstName} {users?.find(p => p.id === u.referrerId)?.lastName}</span></p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <AdminSettingsPanel settings={settings || []} onUpdate={(key, value) => updateSettingMutation.mutateAsync({ key, value })} isPending={updateSettingMutation.isPending} />
          </TabsContent>

          <TabsContent value="history">
            <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="px-8 py-6 bg-slate-50/50 border-b border-gray-100">
                <CardTitle className="text-xl font-black">Archive des Transactions</CardTitle>
                <CardDescription>Tous les flux financiers validés ou refusés</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <TransactionTable transactions={processedTransactions} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function BalanceActionDialog({ user, action, onUpdate }: { user: SchemaUser, action: 'credit' | 'debit', onUpdate: (newBalance: number) => void }) {
  const [amount, setAmount] = useState("");
  const [open, setOpen] = useState(false);

  const isCredit = action === 'credit';
  const maxDebit = user.balance;

  const handleConfirm = () => {
    const numAmount = parseInt(amount) || 0;
    if (numAmount <= 0) return;
    if (!isCredit && numAmount > maxDebit) return;

    onUpdate(numAmount);
    setAmount("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className={`h-9 px-3 rounded-xl text-xs font-bold gap-1 ${isCredit ? 'bg-green-50 border-green-100 text-green-600 hover:bg-green-100' : 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100'}`}
          title={isCredit ? "Créditer" : "Débiter"}
          data-testid={`button-${action}-${user.id}`}
        >
          {isCredit ? <Plus className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
          {isCredit ? 'Créditer' : 'Débiter'}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2rem] border-0 shadow-2xl p-6 max-w-sm">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-black text-slate-900">
            {isCredit ? 'Créditer le compte' : 'Débiter le compte'}
          </DialogTitle>
          <CardDescription>
            {user.firstName} {user.lastName} — {user.phoneNumber}
          </CardDescription>
        </DialogHeader>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-4">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Solde actuel</p>
          <p className="text-2xl font-extrabold text-slate-900">{user.balance.toLocaleString()} <span className="text-sm font-bold text-gray-400">FCFA</span></p>
        </div>

        <div className="space-y-3 mb-4">
          <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
            Montant à {isCredit ? 'créditer' : 'débiter'} (FCFA)
          </Label>
          <Input
            type="number"
            min="1"
            max={isCredit ? undefined : maxDebit}
            placeholder="Entrez le montant..."
            className="rounded-xl h-14 bg-white border-gray-200 font-bold text-lg text-center"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            data-testid={`input-${action}-amount-${user.id}`}
          />
          {!isCredit && parseInt(amount) > maxDebit && (
            <p className="text-xs text-red-500 font-bold">Le montant dépasse le solde disponible</p>
          )}
          {amount && parseInt(amount) > 0 && (
            <div className={`rounded-xl p-3 border ${isCredit ? 'bg-green-50 border-green-100' : 'bg-amber-50 border-amber-100'}`}>
              <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isCredit ? 'text-green-600' : 'text-amber-600'}`}>Nouveau solde après opération</p>
              <p className="text-lg font-extrabold text-slate-900">
                {(isCredit ? user.balance + (parseInt(amount) || 0) : Math.max(0, user.balance - (parseInt(amount) || 0))).toLocaleString()} FCFA
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            className={`w-full h-13 rounded-xl font-bold uppercase tracking-wider shadow-md text-white ${isCredit ? 'bg-green-600 hover:bg-green-700 shadow-green-200' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'}`}
            onClick={handleConfirm}
            disabled={!amount || parseInt(amount) <= 0 || (!isCredit && parseInt(amount) > maxDebit)}
            data-testid={`button-confirm-${action}-${user.id}`}
          >
            {isCredit ? <Plus className="w-4 h-4 mr-2" /> : <Minus className="w-4 h-4 mr-2" />}
            Confirmer {isCredit ? 'le crédit' : 'le débit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddVIPDialog({ products, onAdd }: { products: Product[], onAdd: (id: number) => void }) {
  const [selected, setSelected] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-9 w-9 p-0 rounded-xl bg-green-50 border-green-100 text-green-600 hover:bg-green-100" title="Ajouter VIP">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[2.5rem] border-0 shadow-2xl p-8 max-w-sm">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-2xl font-black text-slate-900 leading-tight">Attribuer un Produit VIP</DialogTitle>
          <CardDescription>L'investissement sera ajouté instantanément au compte de l'utilisateur.</CardDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Catalogue VIP</Label>
            <Select onValueChange={setSelected}>
              <SelectTrigger className="rounded-2xl h-12 bg-gray-50 border-gray-100">
                <SelectValue placeholder="Sélectionner un pack" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
                {products.map(p => (
                  <SelectItem key={p.id} value={p.id.toString()} className="rounded-xl py-3 focus:bg-primary/5">
                    <div className="flex justify-between items-center w-full gap-8">
                      <span className="font-bold text-xs">VIP {p.vipLevel} - {p.name}</span>
                      <span className="text-primary font-black text-xs">{p.price.toLocaleString()} FCFA</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button 
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest shadow-lg shadow-primary/20"
            onClick={() => selected && onAdd(parseInt(selected))}
          >
            Confirmer l'ajout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminSettingsPanel({ settings, onUpdate, isPending }: { settings: Setting[], onUpdate: (key: string, value: string) => Promise<any>, isPending: boolean }) {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});

  const getVal = (key: string) => values[key] ?? settings.find(s => s.key === key)?.value ?? '';
  const setVal = (key: string, value: string) => setValues(prev => ({ ...prev, [key]: value }));

  const handleSave = async (key: string) => {
    try {
      await onUpdate(key, getVal(key));
      toast({ title: "Lien mis à jour avec succès" });
    } catch {
      toast({ variant: "destructive", title: "Erreur de mise à jour" });
    }
  };

  const linkFields = [
    { key: 'payment_link', label: 'Lien de Paiement (Dépôt)', placeholder: 'https://...', description: 'Ce lien s\'affiche quand un utilisateur fait un dépôt', icon: <Wallet className="w-5 h-5" />, color: 'bg-green-100 text-green-600' },
    { key: 'telegram_channel', label: 'Canal Telegram', placeholder: 'https://t.me/...', description: 'Lien du canal Telegram officiel', icon: <Send className="w-5 h-5" />, color: 'bg-sky-100 text-sky-600' },
    { key: 'telegram_group', label: 'Groupe de Discussion', placeholder: 'https://t.me/join...', description: 'Lien du groupe de discussion Telegram', icon: <MessageSquare className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-600' },
    { key: 'customer_service_link', label: 'Service Client', placeholder: 'https://t.me/...', description: 'Lien direct vers le service client', icon: <UserIcon className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
      <CardHeader className="bg-blue-50/50 border-b border-blue-100 px-8 py-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-black">Réglages des Liens</CardTitle>
            <CardDescription>Configurez les liens de la plateforme. Les modifications sont actives immédiatement.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        {linkFields.map((field) => (
          <div key={field.key} className="bg-gray-50/50 p-5 rounded-[1.5rem] border border-gray-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${field.color}`}>
                {field.icon}
              </div>
              <div>
                <Label className="text-sm font-black text-slate-900">{field.label}</Label>
                <p className="text-[10px] text-muted-foreground">{field.description}</p>
              </div>
            </div>
            <Input 
              placeholder={field.placeholder}
              className="rounded-2xl h-12 border-gray-200 bg-white font-medium"
              value={getVal(field.key)}
              onChange={(e) => setVal(field.key, e.target.value)}
              data-testid={`input-setting-${field.key}`}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getVal(field.key) ? (
                  <Badge className="bg-green-100 text-green-700 border-0 text-[9px] font-bold">Configuré</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-500 border-0 text-[9px] font-bold">Non configuré</Badge>
                )}
              </div>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl px-6 h-10 shadow-sm"
                onClick={() => handleSave(field.key)}
                disabled={isPending}
                data-testid={`button-save-${field.key}`}
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Mettre à jour
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TransactionTable({ transactions, onUpdate }: { transactions: EnrichedTransaction[], onUpdate?: (id: number, status: string) => void }) {
  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-3">
          <Activity className="w-6 h-6" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">Aucune demande en attente</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-gray-50/30">
          <TableRow>
            <TableHead className="px-8 py-4 font-black uppercase text-[10px]">Utilisateur</TableHead>
            <TableHead className="py-4 font-black uppercase text-[10px]">Montant</TableHead>
            <TableHead className="py-4 font-black uppercase text-[10px]">Pays</TableHead>
            <TableHead className="py-4 font-black uppercase text-[10px]">Détails</TableHead>
            <TableHead className={`py-4 font-black uppercase text-[10px] ${onUpdate ? 'text-right px-8' : 'text-left'}`}>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id} className="hover:bg-gray-50/30 transition-colors border-b border-gray-50 last:border-0">
              <TableCell className="px-8 py-4">
                <p className="font-black text-xs text-slate-900">{tx.userName || 'N/A'}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{tx.userPhone || 'N/A'}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{format(new Date(tx.createdAt || Date.now()), 'dd/MM/yy HH:mm')}</p>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <Badge variant={tx.type === 'deposit' ? 'default' : 'secondary'} className="w-fit text-[8px] h-4 font-black uppercase px-1.5 border-0">
                    {tx.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                  </Badge>
                  <p className="font-black text-sm text-slate-900">{tx.amount.toLocaleString()} FCFA</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="border-gray-200 font-bold text-[10px]">{tx.userCountry || 'N/A'}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-[10px] text-slate-700">{tx.method}</span>
                  {tx.mobileDetails && <span className="text-[10px] text-muted-foreground bg-gray-100 px-1.5 py-0.5 rounded w-fit mt-1">{tx.mobileDetails}</span>}
                </div>
              </TableCell>
              <TableCell className={`py-4 ${onUpdate ? 'px-8 text-right' : 'text-left'}`}>
                {onUpdate ? (
                  <div className="flex justify-end gap-2">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 h-9 px-4 rounded-xl text-white font-bold text-xs shadow-lg shadow-green-200"
                      onClick={() => onUpdate(tx.id, 'completed')}
                      data-testid={`button-validate-${tx.id}`}
                    >
                      Valider
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-9 px-4 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold text-xs"
                      onClick={() => onUpdate(tx.id, 'rejected')}
                      data-testid={`button-reject-${tx.id}`}
                    >
                      Refuser
                    </Button>
                  </div>
                ) : (
                  <Badge 
                    className={
                      `text-[9px] font-black uppercase px-2 h-5 border-0 ${
                        tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                        tx.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        'bg-red-100 text-red-700'
                      }`
                    }
                    data-testid={`status-transaction-${tx.id}`}
                  >
                    {tx.status}
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
