import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, Transaction, Setting, Product } from "@shared/schema";
import { api } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";
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
  Shield,
  Link as LinkIcon,
  MessageSquare,
  Send,
  ArrowLeft,
  Settings as SettingsIcon,
  LayoutDashboard,
  Users as UsersIcon,
  History,
  Activity
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

export default function Admin() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [searchPhone, setSearchPhone] = useState("");

  const { data: adminStats } = useQuery<{ registrationsToday: number; depositsToday: number }>({
    queryKey: [api.admin.stats.path],
  });

  const { data: users, isLoading: loadingUsers } = useQuery<User[]>({
    queryKey: [api.admin.users.path],
  });

  const { data: transactions, isLoading: loadingTransactions } = useQuery<Transaction[]>({
    queryKey: [api.admin.transactions.path],
  });

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: settings } = useQuery<Setting[]>({
    queryKey: [api.admin.settings.path],
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await fetch(`/api/admin/transactions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
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
      });
      if (!res.ok) throw new Error("Failed to update setting");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.settings.path] });
      toast({ title: "Paramètre sauvegardé" });
    },
  });

  const addInvestmentMutation = useMutation({
    mutationFn: async ({ userId, productId }: { userId: number; productId: number }) => {
      const res = await fetch(`/api/invest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, bypassBalance: true }),
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
    return users.filter(u => u.phoneNumber.includes(searchPhone));
  }, [users, searchPhone]);

  if (loadingUsers || loadingTransactions) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
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
                      placeholder="Numéro de téléphone..." 
                      className="pl-12 rounded-2xl h-12 bg-white border-gray-200 shadow-sm focus:ring-primary"
                      value={searchPhone}
                      onChange={(e) => setSearchPhone(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="px-8 py-4 font-black uppercase text-[10px]">Investisseur</TableHead>
                      <TableHead className="py-4 font-black uppercase text-[10px]">Solde (Modifiable)</TableHead>
                      <TableHead className="py-4 font-black uppercase text-[10px]">Rôle / Statut</TableHead>
                      <TableHead className="px-8 py-4 font-black uppercase text-[10px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-gray-100">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs uppercase">{u.firstName[0]}{u.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-sm text-slate-900 leading-none mb-1">{u.firstName} {u.lastName}</p>
                              <p className="text-[11px] text-muted-foreground font-mono">{u.phoneNumber}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <BalanceEdit user={u} onUpdate={(balance) => updateUserMutation.mutate({ id: u.id, updates: { balance } })} />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              {u.isAdmin ? <Badge className="bg-purple-100 text-purple-700 border-0 text-[9px] font-black uppercase px-2 h-5">Admin</Badge> : <Badge variant="outline" className="text-[9px] h-5 border-gray-200">User</Badge>}
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-5 w-5 p-0 hover:bg-slate-100 rounded-full"
                                onClick={() => updateUserMutation.mutate({ id: u.id, updates: { isAdmin: !u.isAdmin } })}
                                title={u.isAdmin ? "Retirer admin" : "Promouvoir admin"}
                              >
                                <Shield className={`h-3 w-3 ${u.isAdmin ? 'text-purple-600' : 'text-slate-300'}`} />
                              </Button>
                            </div>
                            {u.isBanned ? <Badge variant="destructive" className="text-[9px] h-5 font-black uppercase px-2">Banni</Badge> : <Badge className="bg-green-100 text-green-700 border-0 text-[9px] h-5 font-black uppercase px-2">Actif</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="px-8 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className={`h-9 w-9 p-0 rounded-xl ${u.isBanned ? 'bg-green-50 border-green-100 text-green-600 hover:bg-green-100' : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100'}`}
                              onClick={() => updateUserMutation.mutate({ id: u.id, updates: { isBanned: !u.isBanned } })}
                              title={u.isBanned ? "Débannir" : "Bannir"}
                            >
                              {u.isBanned ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className={`h-9 w-9 p-0 rounded-xl ${u.withdrawalBlocked ? 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-100' : 'bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100'}`}
                              onClick={() => updateUserMutation.mutate({ id: u.id, updates: { withdrawalBlocked: !u.withdrawalBlocked } })}
                              title={u.withdrawalBlocked ? "Débloquer Retraits" : "Bloquer Retraits"}
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </Button>
                            <AddVIPDialog products={products || []} onAdd={(productId) => addInvestmentMutation.mutate({ userId: u.id, productId })} />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registrations">
            <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
              <CardHeader className="px-8 py-6 border-b border-gray-50 bg-blue-50/30">
                <CardTitle className="text-xl font-black text-slate-900">Toutes les Inscriptions</CardTitle>
                <CardDescription>Liste exhaustive des utilisateurs enregistrés</CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="px-8 py-4 font-black uppercase text-[10px]">Utilisateur</TableHead>
                      <TableHead className="py-4 font-black uppercase text-[10px]">Pays</TableHead>
                      <TableHead className="py-4 font-black uppercase text-[10px]">Inscrit le</TableHead>
                      <TableHead className="py-4 font-black uppercase text-[10px]">Solde Actuel</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((u) => (
                      <TableRow key={u.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-gray-100">
                              <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs uppercase">{u.firstName[0]}{u.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-sm text-slate-900 leading-none mb-1">{u.firstName} {u.lastName}</p>
                              <p className="text-[11px] text-muted-foreground font-mono">{u.phoneNumber}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-200 font-bold text-[10px]">{u.country}</Badge>
                        </TableCell>
                        <TableCell className="text-[11px] text-muted-foreground">
                          {format(new Date(u.createdAt || Date.now()), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <p className="font-black text-sm text-primary">{u.balance.toLocaleString()} FCFA</p>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="bg-blue-50/50 border-b border-blue-100 px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black">Liens Sociaux</CardTitle>
                      <CardDescription>Support & Communauté</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-black text-muted-foreground tracking-widest">Canal Telegram</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://t.me/..." 
                        className="rounded-2xl h-12 border-gray-100 bg-gray-50/50"
                        defaultValue={settings?.find(s => s.key === 'telegram_channel')?.value}
                        onBlur={(e) => updateSettingMutation.mutate({ key: 'telegram_channel', value: e.target.value })}
                      />
                      <div className="bg-sky-100 p-3 rounded-2xl text-sky-600 flex items-center">
                        <Send className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-black text-muted-foreground tracking-widest">Groupe de Discussion</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://t.me/join..." 
                        className="rounded-2xl h-12 border-gray-100 bg-gray-50/50"
                        defaultValue={settings?.find(s => s.key === 'telegram_group')?.value}
                        onBlur={(e) => updateSettingMutation.mutate({ key: 'telegram_group', value: e.target.value })}
                      />
                      <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600 flex items-center">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
                <CardHeader className="bg-primary/5 border-b border-primary/10 px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-xl text-primary">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black">Paiements</CardTitle>
                      <CardDescription>Dépôts & Bonus</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase font-black text-muted-foreground tracking-widest">Lien de Paiement Manuel</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="https://..." 
                        className="rounded-2xl h-12 border-gray-100 bg-gray-50/50"
                        defaultValue={settings?.find(s => s.key === 'payment_link')?.value}
                        onBlur={(e) => updateSettingMutation.mutate({ key: 'payment_link', value: e.target.value })}
                      />
                      <div className="bg-primary/10 p-3 rounded-2xl text-primary flex items-center">
                        <LinkIcon className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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

function BalanceEdit({ user, onUpdate }: { user: User, onUpdate: (balance: number) => void }) {
  const [val, setVal] = useState(user.balance.toString());
  return (
    <div className="flex items-center gap-2 max-w-[160px]">
      <Input 
        className="h-9 rounded-xl border-gray-100 font-bold text-xs" 
        value={val} 
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onUpdate(parseInt(val) || 0)}
      />
      <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-bold border-0 text-[10px]">FCFA</Badge>
    </div>
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

function TransactionTable({ transactions, onUpdate }: { transactions: Transaction[], onUpdate?: (id: number, status: string) => void }) {
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
            <TableHead className="py-4 font-black uppercase text-[10px]">Type / Montant</TableHead>
            <TableHead className="py-4 font-black uppercase text-[10px]">Détails</TableHead>
            <TableHead className={`py-4 font-black uppercase text-[10px] ${onUpdate ? 'text-right px-8' : 'text-left'}`}>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id} className="hover:bg-gray-50/30 transition-colors border-b border-gray-50 last:border-0">
              <TableCell className="px-8 py-4">
                <p className="font-black text-xs text-slate-900">ID: {tx.userId}</p>
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
                    >
                      Valider
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-9 px-4 rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold text-xs"
                      onClick={() => onUpdate(tx.id, 'rejected')}
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
