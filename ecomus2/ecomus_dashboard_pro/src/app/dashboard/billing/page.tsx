"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Download, Calendar, DollarSign } from "lucide-react";

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  description: string;
}

interface Subscription {
  id: string;
  plan: string;
  status: "active" | "cancelled" | "expired";
  nextBilling: string;
  amount: number;
}

export default function BillingPage() {
  const { data: session } = useSession();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuler le chargement des données de facturation
    const fetchBillingData = async () => {
      try {
        // Données simulées - à remplacer par de vrais appels API
        const mockInvoices: Invoice[] = [
          {
            id: "INV-001",
            date: "2024-01-15",
            amount: 29.99,
            status: "paid",
            description: "Abonnement mensuel - Plan Pro",
          },
          {
            id: "INV-002",
            date: "2024-02-15",
            amount: 29.99,
            status: "paid",
            description: "Abonnement mensuel - Plan Pro",
          },
          {
            id: "INV-003",
            date: "2024-03-15",
            amount: 29.99,
            status: "pending",
            description: "Abonnement mensuel - Plan Pro",
          },
        ];

        const mockSubscription: Subscription = {
          id: "SUB-001",
          plan: "Plan Pro",
          status: "active",
          nextBilling: "2024-04-15",
          amount: 29.99,
        };

        setInvoices(mockInvoices);
        setSubscription(mockSubscription);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données de facturation:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid":
        return "Payé";
      case "pending":
        return "En attente";
      case "overdue":
        return "En retard";
      case "active":
        return "Actif";
      case "cancelled":
        return "Annulé";
      case "expired":
        return "Expiré";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Facturation</h1>
          <p className="text-muted-foreground">
            Gérez vos abonnements et consultez vos factures
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="invoices">Factures</TabsTrigger>
          <TabsTrigger value="subscription">Abonnement</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Abonnement actuel
                </CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subscription?.plan}</div>
                <p className="text-xs text-muted-foreground">
                  {subscription?.amount}€/mois
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Prochaine facturation
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {subscription?.nextBilling
                    ? new Date(subscription.nextBilling).toLocaleDateString(
                        "fr-FR"
                      )
                    : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Renouvellement automatique
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Factures payées
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {invoices.filter((inv) => inv.status === "paid").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total:{" "}
                  {invoices
                    .filter((inv) => inv.status === "paid")
                    .reduce((sum, inv) => sum + inv.amount, 0)}
                  €
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Statut</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={getStatusColor(subscription?.status || "")}>
                  {getStatusText(subscription?.status || "")}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique des factures</CardTitle>
              <CardDescription>
                Consultez et téléchargez vos factures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{invoice.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(invoice.date).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">{invoice.amount}€</div>
                        <Badge className={getStatusColor(invoice.status)}>
                          {getStatusText(invoice.status)}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestion de l&apos;abonnement</CardTitle>
              <CardDescription>
                Modifiez votre plan ou gérez votre abonnement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {subscription && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{subscription.plan}</h3>
                      <p className="text-sm text-muted-foreground">
                        {subscription.amount}€/mois
                      </p>
                    </div>
                    <Badge className={getStatusColor(subscription.status)}>
                      {getStatusText(subscription.status)}
                    </Badge>
                  </div>

                  <div className="flex space-x-4">
                    <Button variant="outline">Changer de plan</Button>
                    <Button variant="outline">Mettre à jour le paiement</Button>
                    <Button variant="destructive">
                      Annuler l&apos;abonnement
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
