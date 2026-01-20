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
  Link as LinkIcon
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
      toast({ title: "Transaction mise à jour" });
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

  const addInvestmentMutation = useMutation({
    mutationFn: async ({ userId, productId }: { userId: number; productId: number }) => {
      const res = await fetch(`/api/invest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, productId, bypassBalance: true }), // Backend needs to handle this
      });
      if (!res.ok) throw new Error("Failed to add investment");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Produit VIP ajouté avec succès" });
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
      toast({ title: "Paramètre mis à jour" });
    },
  });

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!searchPhone) return users;
    return users.filter(u => u.phoneNumber.includes(searchPhone));
  }, [users, searchPhone]);

  if (loadingUsers || loadingTransactions) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingDeposits = transactions?.filter(tx => tx.type === 'deposit' && tx.status === 'pending') || [];
  const pendingWithdrawals = transactions?.filter(tx => tx.type === 'withdrawal' && tx.status === 'pending') || [];
  const processedTransactions = transactions?.filter(tx => tx.status !== 'pending') || [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 pb-20">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panneau Admin</h1>
            <p className="text-muted-foreground">Gestion de la plateforme GREENIX</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Retour au Dashboard</Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Inscriptions d'Aujourd'hui</p>
                  <h3 className="text-3xl font-bold mt-1">{adminStats?.registrationsToday || 0}</h3>
                </div>
                <div className="bg-green-100 p-3 rounded-xl text-green-600">
                  <UserPlus className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-l-4 border-l-amber-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dépôts d'Aujourd'hui</p>
                  <h3 className="text-3xl font-bold mt-1">{adminStats?.depositsToday || 0}</h3>
                </div>
                <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="deposits" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-[750px] mb-8">
            <TabsTrigger value="deposits">Dépôts ({pendingDeposits.length})</TabsTrigger>
            <TabsTrigger value="withdrawals">Retraits ({pendingWithdrawals.length})</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="settings">Réglages</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="deposits">
            <Card>
              <CardHeader>
                <CardTitle>Validation des Dépôts</CardTitle>
                <CardDescription>Validez les nouveaux investissements</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable 
                  transactions={pendingDeposits} 
                  onUpdate={(id, status) => updateTransactionMutation.mutate({ id, status })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Validation des Retraits</CardTitle>
                <CardDescription>Gérez les demandes de retrait Mobile Money</CardDescription>
              </CardHeader>
              <CardContent>
                <TransactionTable 
                  transactions={pendingWithdrawals} 
                  onUpdate={(id, status) => updateTransactionMutation.mutate({ id, status })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Rechercher par numéro de téléphone..." 
                  className="pl-10"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Liste des Utilisateurs</CardTitle>
                  <CardDescription>Gérez les comptes et les permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Solde</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>{u.firstName} {u.lastName}</TableCell>
                          <TableCell>{u.phoneNumber}</TableCell>
                          <TableCell>
                            <BalanceEdit user={u} onUpdate={(balance) => updateUserMutation.mutate({ id: u.id, updates: { balance } })} />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {u.isAdmin ? <Badge className="bg-purple-100 text-purple-700">Admin</Badge> : <Badge variant="outline">Utilisateur</Badge>}
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 w-6 p-0"
                                onClick={() => updateUserMutation.mutate({ id: u.id, updates: { isAdmin: !u.isAdmin } })}
                                title={u.isAdmin ? "Retirer admin" : "Nommer admin"}
                              >
                                <Shield className={`h-3 w-3 ${u.isAdmin ? 'text-purple-600' : 'text-gray-400'}`} />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            {u.isBanned ? <Badge variant="destructive">Banni</Badge> : <Badge className="bg-green-100 text-green-700">Actif</Badge>}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2"
                                onClick={() => updateUserMutation.mutate({ id: u.id, updates: { isBanned: !u.isBanned } })}
                                title={u.isBanned ? "Débannir" : "Bannir"}
                              >
                                {u.isBanned ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4 text-red-500" />}
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 px-2"
                                onClick={() => updateUserMutation.mutate({ id: u.id, updates: { withdrawalBlocked: !u.withdrawalBlocked } })}
                                title={u.withdrawalBlocked ? "Débloquer Retraits" : "Bloquer Retraits"}
                              >
                                <ShieldCheck className={`w-4 h-4 ${u.withdrawalBlocked ? 'text-red-500' : 'text-green-500'}`} />
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
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configuration de la plateforme</CardTitle>
                <CardDescription>Modifiez les liens et paramètres globaux</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <FormLabel>Lien de Paiement (Dépôt)</FormLabel>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="https://..." 
                      defaultValue={settings?.find(s => s.key === 'payment_link')?.value}
                      onBlur={(e) => updateSettingMutation.mutate({ key: 'payment_link', value: e.target.value })}
                    />
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                {/* Add more settings as needed */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historique Complet</CardTitle>
                <CardDescription>Toutes les transactions traitées</CardDescription>
              </CardHeader>
              <CardContent>
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
    <div className="flex items-center gap-2">
      <Input 
        className="w-24 h-8 text-xs font-bold" 
        value={val} 
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onUpdate(parseInt(val) || 0)}
      />
      <span className="text-[10px] text-muted-foreground">FCFA</span>
    </div>
  );
}

function AddVIPDialog({ products, onAdd }: { products: Product[], onAdd: (id: number) => void }) {
  const [selected, setSelected] = useState("");
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 px-2" title="Ajouter VIP">
          <Plus className="w-4 h-4 text-green-600" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un produit VIP</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir un produit" />
            </SelectTrigger>
            <SelectContent>
              {products.map(p => (
                <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.price} FCFA)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={() => selected && onAdd(parseInt(selected))}>Confirmer l'ajout</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TransactionTable({ transactions, onUpdate }: { transactions: Transaction[], onUpdate?: (id: number, status: string) => void }) {
  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground italic">
        Aucune transaction à afficher
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID Util.</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Méthode / Détails</TableHead>
          <TableHead>Statut</TableHead>
          {onUpdate && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="font-medium">{tx.userId}</TableCell>
            <TableCell>
              <Badge variant={tx.type === 'deposit' ? 'default' : 'secondary'}>
                {tx.type === 'deposit' ? 'Dépôt' : 'Retrait'}
              </Badge>
            </TableCell>
            <TableCell className="font-bold">{tx.amount.toLocaleString()} FCFA</TableCell>
            <TableCell>
              <div className="text-xs">
                <span className="font-semibold">{tx.method}</span>
                {tx.mobileDetails && <div className="text-muted-foreground mt-1">{tx.mobileDetails}</div>}
              </div>
            </TableCell>
            <TableCell>
              <Badge 
                className={
                  tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                  tx.status === 'completed' ? 'bg-green-100 text-green-700' : 
                  'bg-red-100 text-red-700'
                }
              >
                {tx.status}
              </Badge>
            </TableCell>
            {onUpdate && (
              <TableCell>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-green-600 hover:bg-green-700 h-8 px-2"
                    onClick={() => onUpdate(tx.id, 'completed')}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="h-8 px-2"
                    onClick={() => onUpdate(tx.id, 'rejected')}
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{children}</label>;
}