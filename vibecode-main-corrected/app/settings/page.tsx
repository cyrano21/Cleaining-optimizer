"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Bell, Shield, Code, Save, Key } from "lucide-react"
import { currentUser } from "@/features/auth/actions"
import { toast } from "sonner"

interface Account {
  provider: string
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isConnectedViaGitHub, setIsConnectedViaGitHub] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: ""
  })
  
  const [apiSettings, setApiSettings] = useState({
    githubToken: ""
  })

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await currentUser()
        if (user) {
          const nameParts = user.name?.split(" ") || []
           setFormData({
             firstName: nameParts[0] || "",
             lastName: nameParts.slice(1).join(" ") || "",
             email: user.email || "",
             bio: ""
           })
           
           // Charger le token GitHub
           const githubTokenResponse = await fetch('/api/settings/github-token')
           if (githubTokenResponse.ok) {
             const githubTokenData = await githubTokenResponse.json()
             setApiSettings(prev => ({
               ...prev,
               githubToken: githubTokenData.githubToken || ""
             }))
           }
           
           // Vérifier si l'utilisateur est connecté via GitHub
           const accountsResponse = await fetch('/api/settings/user-accounts')
           if (accountsResponse.ok) {
             const accountsData = await accountsResponse.json()
             const hasGitHubAccount = accountsData.accounts?.some((account: Account) => account.provider === 'github')
             setIsConnectedViaGitHub(hasGitHubAccount)
           }
         }
       } catch {
         console.error("Error loading user data")
         toast.error("Failed to load user data")
       } finally {
         setIsLoading(false)
       }
     }

     loadUserData()
   }, [])

   const handleSave = async () => {
     try {
       // Sauvegarder le token GitHub
       const githubTokenResponse = await fetch('/api/settings/github-token', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json'
         },
         body: JSON.stringify({
           githubToken: apiSettings.githubToken
         })
       })
       
       if (!githubTokenResponse.ok) {
         const errorData = await githubTokenResponse.json()
         throw new Error(errorData.error || 'Failed to save GitHub token')
       }
       
       // Here you would implement other settings save functionality
       toast.success("Settings saved successfully")
     } catch (error: unknown) {
       console.error('Error saving settings:', error)
       toast.error(error instanceof Error ? error.message : "Failed to save settings")
     }
   }

   if (isLoading) {
     return (
       <div className="container mx-auto py-6 px-4 max-w-4xl">
         <div className="animate-pulse space-y-4">
           <div className="h-8 bg-gray-200 rounded w-1/4"></div>
           <div className="space-y-4">
             {[...Array(4)].map((_, i) => (
               <div key={i} className="h-48 bg-gray-200 rounded"></div>
             ))}
           </div>
         </div>
       </div>
     )
   } 
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>
              Manage your account information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  placeholder="Enter your first name" 
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Enter your last name" 
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="Enter your email" 
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell us about yourself" 
                className="min-h-[100px]" 
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Playground Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified about playground changes</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Privacy & Security</CardTitle>
            </div>
            <CardDescription>
              Manage your privacy and security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Public Profile</Label>
                <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Online Status</Label>
                <p className="text-sm text-muted-foreground">Let others see when you&apos;re online</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Two-Factor Authentication</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Disabled</Badge>
                <Button variant="outline" size="sm">Enable 2FA</Button>
              </div>
            </div>
            

          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>API Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure API tokens for enhanced functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Message informatif selon le type de connexion */}
            {isConnectedViaGitHub ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-green-800 mb-1">
                      ✅ Connecté via GitHub - Accès automatique activé
                    </h4>
                    <p className="text-sm text-green-700">
                      Vous avez accès automatiquement à vos dépôts privés GitHub ! Le champ ci-dessous est optionnel.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">
                      🔐 Accès aux dépôts privés GitHub
                    </h4>
                    <p className="text-sm text-blue-700">
                      Pour accéder aux dépôts privés, vous pouvez soit vous connecter avec GitHub, soit configurer manuellement votre token ci-dessous.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="githubToken">
                GitHub Personal Access Token {isConnectedViaGitHub ? "(Optionnel - Déjà connecté via GitHub)" : "(Requis pour les dépôts privés)"}
              </Label>
              <Input 
                id="githubToken" 
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" 
                value={apiSettings.githubToken}
                onChange={(e) => setApiSettings(prev => ({ ...prev, githubToken: e.target.value }))}
              />
              <p className="text-sm text-muted-foreground">
                Configuration manuelle pour importer des repositories privés et augmenter les limites de l&apos;API GitHub.
                <br />
                <a 
                  href="https://github.com/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Créer un token sur GitHub →
                </a>
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <p className="text-sm text-blue-800">
                  <strong>Scopes requis :</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-1 ml-4 list-disc">
                  <li><code>public_repo</code> - Pour les repositories publics</li>
                  <li><code>repo</code> - Pour les repositories privés</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              <CardTitle>Editor Preferences</CardTitle>
            </div>
            <CardDescription>
              Customize your coding environment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fontSize">Font Size</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12px</SelectItem>
                    <SelectItem value="14">14px</SelectItem>
                    <SelectItem value="16">16px</SelectItem>
                    <SelectItem value="18">18px</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Save</Label>
                <p className="text-sm text-muted-foreground">Automatically save changes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Line Numbers</Label>
                <p className="text-sm text-muted-foreground">Show line numbers in editor</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="flex items-center gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}