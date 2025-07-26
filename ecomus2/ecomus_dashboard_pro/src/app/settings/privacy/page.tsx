"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { 
  Eye, 
  EyeOff, 
  Shield, 
  Users, 
  Globe, 
  Lock,
  ExternalLink,
  Info
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface PrivacySettings {
  isPublicProfile: boolean;
  allowPublicView: boolean;
  publicFields: string[];
}

const AVAILABLE_FIELDS = [
  { id: 'firstName', label: 'Prénom', description: 'Votre prénom' },
  { id: 'lastName', label: 'Nom', description: 'Votre nom de famille' },
  { id: 'email', label: 'Email', description: 'Votre adresse email' },
  { id: 'phone', label: 'Téléphone', description: 'Votre numéro de téléphone' },
  { id: 'avatar', label: 'Photo de profil', description: 'Votre avatar' },
  { id: 'bio', label: 'Biographie', description: 'Votre description personnelle' },
  { id: 'location', label: 'Localisation', description: 'Votre ville/région' },
  { id: 'position', label: 'Poste', description: 'Votre fonction/métier' },
  { id: 'company', label: 'Entreprise', description: 'Votre entreprise' },
  { id: 'website', label: 'Site web', description: 'Votre site personnel' },
  { id: 'joinDate', label: 'Date d\'inscription', description: 'Quand vous avez rejoint la plateforme' }
];

const VENDOR_FIELDS = [
  { id: 'businessName', label: 'Nom de l\'entreprise', description: 'Le nom de votre boutique' },
  { id: 'description', label: 'Description de l\'entreprise', description: 'Description de votre activité' },
  { id: 'category', label: 'Catégorie', description: 'Votre secteur d\'activité' }
];

export default function PrivacySettingsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    isPublicProfile: true,
    allowPublicView: true,
    publicFields: ['firstName', 'lastName', 'avatar', 'bio', 'joinDate']
  });

  const isVendor = session?.user?.role === 'vendor';
  const availableFields = isVendor ? [...AVAILABLE_FIELDS, ...VENDOR_FIELDS] : AVAILABLE_FIELDS;

  useEffect(() => {
    loadPrivacySettings();
  }, []);

  const loadPrivacySettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/privacy');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings || settings);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const savePrivacySettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/settings/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Paramètres de confidentialité sauvegardés');
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldToggle = (fieldId: string, checked: boolean) => {
    setSettings(prev => ({
      ...prev,
      publicFields: checked 
        ? [...prev.publicFields, fieldId]
        : prev.publicFields.filter(id => id !== fieldId)
    }));
  };

  const getPublicProfileUrl = () => {
    if (!session?.user?.id) return '';
    const baseUrl = window.location.origin;
    return isVendor 
      ? `${baseUrl}/vendors/${session.user.id}`
      : `${baseUrl}/users/${session.user.id}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Paramètres de confidentialité</h1>
          <p className="text-gray-600 mt-2">
            Gérez la visibilité de votre profil et les informations publiques
          </p>
        </div>
        
        {settings.isPublicProfile && (
          <Link href={getPublicProfileUrl()} target="_blank">
            <Button variant="outline" className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Voir mon profil public
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6">
        {/* Paramètres généraux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Visibilité du profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Profil public</h3>
                  <Badge variant={settings.isPublicProfile ? "default" : "secondary"}>
                    {settings.isPublicProfile ? "Activé" : "Désactivé"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Permet aux autres utilisateurs de voir votre profil
                </p>
              </div>
              <Switch
                checked={settings.isPublicProfile}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, isPublicProfile: checked }))
                }
              />
            </div>

            {settings.isPublicProfile && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium">Autoriser la vue publique</h3>
                    <p className="text-sm text-gray-600">
                      Permet aux visiteurs non connectés de voir votre profil
                    </p>
                  </div>
                  <Switch
                    checked={settings.allowPublicView}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, allowPublicView: checked }))
                    }
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Champs publics */}
        {settings.isPublicProfile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Informations publiques
              </CardTitle>
              <p className="text-sm text-gray-600">
                Choisissez quelles informations sont visibles sur votre profil public
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {availableFields.map((field) => {
                  const isChecked = settings.publicFields.includes(field.id);
                  const isRequired = ['firstName', 'lastName', 'joinDate'].includes(field.id);
                  
                  return (
                    <div key={field.id} className="flex items-center space-x-3">
                      <Checkbox
                        id={field.id}
                        checked={isChecked}
                        disabled={isRequired}
                        onChange={(e) => 
                          handleFieldToggle(field.id, e.target.checked)
                        }
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={field.id} 
                          className={`text-sm font-medium cursor-pointer ${
                            isRequired ? 'text-gray-500' : ''
                          }`}
                        >
                          {field.label}
                          {isRequired && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Obligatoire
                            </Badge>
                          )}
                        </label>
                        <p className="text-xs text-gray-500">{field.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informations et conseils */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h3 className="font-medium text-blue-900">Conseils de confidentialité</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Votre nom et date d'inscription sont toujours visibles sur les profils publics</li>
                  <li>• Les informations privées ne sont jamais partagées sans votre autorisation</li>
                  <li>• Vous pouvez modifier ces paramètres à tout moment</li>
                  {isVendor && (
                    <li>• En tant que vendeur, un profil public améliore votre visibilité</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={loadPrivacySettings}>
            Annuler
          </Button>
          <Button onClick={savePrivacySettings} disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>
    </div>
  );
}