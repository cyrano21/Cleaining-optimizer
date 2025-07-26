"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Store, Mail, Phone, Globe, Calendar, Star, MessageCircle, Package, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface PublicVendorProfile {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  avatar?: string;
  description?: string;
  location?: string;
  category?: string;
  website?: string;
  phone?: string;
  joinDate: string;
  isVerified: boolean;
  rating?: number;
  reviewCount?: number;
  totalProducts?: number;
  totalSales?: number;
  responseTime?: string;
  publicFields: string[];
}

interface VendorProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  rating?: number;
  reviewCount?: number;
}

interface VendorReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  productName?: string;
}

export default function PublicVendorProfilePage() {
  const params = useParams();
  const vendorId = params.id as string;
  const [profile, setProfile] = useState<PublicVendorProfile | null>(null);
  const [products, setProducts] = useState<VendorProduct[]>([]);
  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        const response = await fetch(`/api/vendors/${vendorId}/public`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
          setProducts(data.products || []);
          setReviews(data.reviews || []);
        } else {
          toast.error("Profil vendeur non trouvé");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchVendorProfile();
    }
  }, [vendorId]);

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/vendors/${vendorId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? "Vendeur non suivi" : "Vendeur suivi");
      }
    } catch {
      toast.error("Erreur lors de l'action");
    }
  };

  const handleMessage = () => {
    window.location.href = `/messages/new?to=${vendorId}&type=vendor`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-600">
              Vendeur non trouvé
            </h2>
            <p className="text-gray-500 mt-2">
              Ce profil vendeur n&apos;existe pas ou n&apos;est pas public.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête du profil vendeur */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar} alt={profile.businessName} />
                <AvatarFallback className="text-2xl">
                  {profile.businessName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{profile.businessName}</h1>
                  {profile.isVerified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Store className="w-3 h-3 mr-1" />
                      Vendeur vérifié
                    </Badge>
                  )}
                  {profile.category && (
                    <Badge variant="outline">{profile.category}</Badge>
                  )}
                </div>
                
                {profile.publicFields.includes('ownerName') && (
                  <p className="text-gray-600">Géré par {profile.ownerName}</p>
                )}
                
                {profile.rating && (
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-medium">{profile.rating.toFixed(1)}</span>
                      <span className="text-gray-500 ml-1">({profile.reviewCount} avis)</span>
                    </div>
                    {profile.responseTime && (
                      <span className="text-sm text-gray-500">
                        Répond en {profile.responseTime}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {profile.totalProducts && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Package className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                    <div className="font-semibold">{profile.totalProducts}</div>
                    <div className="text-xs text-gray-500">Produits</div>
                  </div>
                )}
                
                {profile.totalSales && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                    <div className="font-semibold">{profile.totalSales}</div>
                    <div className="text-xs text-gray-500">Ventes</div>
                  </div>
                )}
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Users className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <div className="font-semibold">{profile.reviewCount || 0}</div>
                  <div className="text-xs text-gray-500">Clients</div>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <div className="font-semibold">
                    {new Date(profile.joinDate).getFullYear()}
                  </div>
                  <div className="text-xs text-gray-500">Depuis</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {profile.publicFields.includes('location') && profile.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{profile.location}</span>
                  </div>
                )}
                
                {profile.publicFields.includes('email') && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{profile.email}</span>
                  </div>
                )}
                
                {profile.publicFields.includes('phone') && profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                
                {profile.publicFields.includes('website') && profile.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
              </div>

              {profile.publicFields.includes('description') && profile.description && (
                <div>
                  <h3 className="font-medium mb-2">À propos de notre boutique</h3>
                  <p className="text-gray-600">{profile.description}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"}>
                {isFollowing ? "Ne plus suivre" : "Suivre"}
              </Button>
              <Button onClick={handleMessage} variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contacter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="reviews">Avis clients</TabsTrigger>
          <TabsTrigger value="about">À propos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products" className="space-y-4">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => window.location.href = `/products/${product.id}`}>
                  <CardContent className="p-4">
                    {product.image && (
                      <Image 
                        src={product.image} 
                        alt={product.name}
                        width={300}
                        height={128}
                        className="w-full h-32 object-cover rounded-md mb-3" 
                      />
                    )}
                    <h4 className="font-medium mb-2 line-clamp-2">{product.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg">{product.price}€</span>
                      {product.rating && (
                        <div className="flex items-center text-sm">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1">{product.rating}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            }
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Aucun produit disponible</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="reviews" className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{review.customerName}</h4>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${
                            i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                          }`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{review.comment}</p>
                  {review.productName && (
                    <p className="text-sm text-gray-500">Produit: {review.productName}</p>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Aucun avis pour le moment</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>Informations sur le vendeur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Membre depuis</h4>
                <p className="text-gray-600">
                  {new Date(profile.joinDate).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              {profile.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{profile.description}</p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium mb-2">Politiques</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>• Livraison sous 2-5 jours ouvrés</p>
                  <p>• Retours acceptés sous 14 jours</p>
                  <p>• Garantie fabricant respectée</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}