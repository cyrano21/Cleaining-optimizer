"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Store, Star, Users, Package, Search, Filter } from "lucide-react";
import { toast } from "sonner";

interface Vendor {
  id: string;
  businessName: string;
  ownerName: string;
  avatar?: string;
  description?: string;
  location?: string;
  category?: string;
  isVerified: boolean;
  rating?: number;
  reviewCount?: number;
  totalProducts?: number;
  joinDate: string;
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rating");

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const params = new URLSearchParams({
          search: searchTerm,
          category: selectedCategory !== "all" ? selectedCategory : "",
          sortBy,
        });

        const response = await fetch(`/api/vendors/public?${params}`);
        if (response.ok) {
          const data = await response.json();
          setVendors(data.vendors || []);
        } else {
          toast.error("Erreur lors du chargement des vendeurs");
        }
      } catch (error) {
        console.error("Erreur lors du chargement des vendeurs:", error);
        toast.error("Erreur lors du chargement des vendeurs");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [searchTerm, selectedCategory, sortBy]);

  const categories = [
    { value: "all", label: "Toutes les catégories" },
    { value: "electronics", label: "Électronique" },
    { value: "fashion", label: "Mode" },
    { value: "home", label: "Maison & Jardin" },
    { value: "sports", label: "Sports & Loisirs" },
    { value: "books", label: "Livres" },
    { value: "beauty", label: "Beauté & Santé" },
  ];

  const sortOptions = [
    { value: "rating", label: "Mieux notés" },
    { value: "products", label: "Plus de produits" },
    { value: "recent", label: "Plus récents" },
    { value: "name", label: "Nom A-Z" },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement des vendeurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Nos Vendeurs</h1>
        <p className="text-muted-foreground">
          Découvrez tous nos vendeurs partenaires et leurs produits
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un vendeur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Vendors Grid */}
      {vendors.length === 0 ? (
        <div className="text-center py-12">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucun vendeur trouvé</h3>
          <p className="text-muted-foreground">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vendors.map((vendor) => (
            <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="relative">
                  <Avatar className="h-16 w-16 mx-auto mb-4">
                    <AvatarImage src={vendor.avatar} alt={vendor.businessName} />
                    <AvatarFallback>
                      {vendor.businessName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {vendor.isVerified && (
                    <Badge className="absolute -top-1 -right-1 bg-green-500">
                      ✓
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{vendor.businessName}</CardTitle>
                <p className="text-sm text-muted-foreground">{vendor.ownerName}</p>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {vendor.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {vendor.description}
                  </p>
                )}
                
                {vendor.location && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {vendor.location}
                  </div>
                )}
                
                {vendor.category && (
                  <Badge variant="secondary" className="text-xs">
                    {vendor.category}
                  </Badge>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  {vendor.rating && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span>{vendor.rating.toFixed(1)}</span>
                      {vendor.reviewCount && (
                        <span className="text-muted-foreground ml-1">
                          ({vendor.reviewCount})
                        </span>
                      )}
                    </div>
                  )}
                  
                  {vendor.totalProducts && (
                    <div className="flex items-center text-muted-foreground">
                      <Package className="h-4 w-4 mr-1" />
                      {vendor.totalProducts}
                    </div>
                  )}
                </div>
                
                <Link href={`/vendors/${vendor.id}`}>
                  <Button className="w-full" variant="outline">
                    Voir le profil
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}