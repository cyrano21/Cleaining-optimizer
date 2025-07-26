"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Briefcase, Mail, Globe, Calendar, Star, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface PublicUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  position?: string;
  company?: string;
  website?: string;
  joinDate: string;
  isVerified: boolean;
  rating?: number;
  reviewCount?: number;
  publicFields: string[];
}

interface UserActivity {
  id: string;
  type: 'review' | 'purchase' | 'comment';
  title: string;
  date: string;
  rating?: number;
}

export default function PublicUserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const response = await fetch(`/api/users/${userId}/public`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data.profile);
          setActivities(data.activities || []);
        } else {
          toast.error("Profil utilisateur non trouvé");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchPublicProfile();
    }
  }, [userId]);

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? "Utilisateur non suivi" : "Utilisateur suivi");
      }
    } catch (error) {
      toast.error("Erreur lors de l'action");
    }
  };

  const handleMessage = () => {
    // Redirection vers la messagerie
    window.location.href = `/messages/new?to=${userId}`;
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
            <h2 className="text-2xl font-bold text-gray-600">Profil non trouvé</h2>
            <p className="text-gray-500 mt-2">Ce profil utilisateur n'existe pas ou n'est pas public.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* En-tête du profil */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile.avatar} alt={`${profile.firstName} ${profile.lastName}`} />
                <AvatarFallback className="text-2xl">
                  {profile.firstName[0]}{profile.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  {profile.isVerified && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      Vérifié
                    </Badge>
                  )}
                </div>
                
                {profile.rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-medium">{profile.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-500">({profile.reviewCount} avis)</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {profile.publicFields.includes('position') && profile.position && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span>{profile.position}</span>
                    {profile.company && <span className="text-gray-500">chez {profile.company}</span>}
                  </div>
                )}
                
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
                
                {profile.publicFields.includes('website') && profile.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      {profile.website}
                    </a>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Membre depuis {new Date(profile.joinDate).toLocaleDateString('fr-FR', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}</span>
                </div>
              </div>

              {profile.publicFields.includes('bio') && profile.bio && (
                <div>
                  <h3 className="font-medium mb-2">À propos</h3>
                  <p className="text-gray-600">{profile.bio}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleFollow} variant={isFollowing ? "outline" : "default"}>
                {isFollowing ? "Ne plus suivre" : "Suivre"}
              </Button>
              <Button onClick={handleMessage} variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets d'activité */}
      <Tabs defaultValue="activity" className="w-full">
        <TabsList>
          <TabsTrigger value="activity">Activité récente</TabsTrigger>
          <TabsTrigger value="reviews">Avis donnés</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4">
          {activities.length > 0 ? (
            activities.map((activity) => (
              <Card key={activity.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{activity.title}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    {activity.rating && (
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="ml-1">{activity.rating}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">Aucune activité récente</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="reviews">
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Les avis seront affichés ici</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}