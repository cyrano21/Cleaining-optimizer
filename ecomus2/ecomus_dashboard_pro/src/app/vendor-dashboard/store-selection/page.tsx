'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  Typography, 
  Button, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress
} from '@mui/material';
import { 
  Store as StoreIcon, 
  Visibility as ViewIcon,
  Send as SendIcon,
  Check as CheckIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

interface Store {
  id: string;
  name: string;
  slug: string;
  homeTheme: string;
  homeName: string;
  homeDescription: string;
  homeTemplate: string;
  previewUrl: string;
}

interface CurrentStore {
  id: string;
  name: string;
  slug: string;
  homeName: string;
  vendorStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
}

export default function VendorStoreSelectionPage() {
  const { data: session } = useSession();
  const [stores, setStores] = useState<Store[]>([]);
  const [currentStore, setCurrentStore] = useState<CurrentStore | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [requestDialog, setRequestDialog] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [canRequest, setCanRequest] = useState(false);

  useEffect(() => {
    if (session?.user?.role === 'vendor') {
      fetchStores();
    }
  }, [session, selectedCategory, searchTerm]);

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/vendor/stores/request?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setStores(data.availableStores);
        setCurrentStore(data.currentStore);
        setCategories(data.categories);
        setCanRequest(data.canRequest);
      } else {
        toast.error('Erreur lors du chargement des stores');
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des stores');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestStore = async () => {
    if (!selectedStore) return;

    try {
      const response = await fetch('/api/vendor/stores/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storeId: selectedStore.id, 
          message: requestMessage 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchStores();
        setRequestDialog(false);
        setRequestMessage('');
      } else {
        toast.error(data.message || 'Erreur lors de la demande');
      }
    } catch (error) {
      toast.error('Erreur lors de la demande');
    }
  };

  const handleCancelRequest = async () => {
    try {
      const response = await fetch('/api/vendor/stores/request', {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(data.message);
        fetchStores();
      } else {
        toast.error(data.message || 'Erreur lors de l\'annulation');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckIcon />;
      case 'pending': return <PendingIcon />;
      case 'rejected': return <CancelIcon />;
      default: return undefined;
    }
  };

  const filteredStores = stores.filter(store => 
    (!selectedCategory || store.homeTheme === selectedCategory) &&
    (!searchTerm || 
      store.homeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.homeDescription.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="p-6">
        <LinearProgress />
        <Typography className="text-center mt-4">Chargement des stores...</Typography>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Typography variant="h4" className="font-bold">
          Sélection de Store
        </Typography>
      </div>

      {/* Current Store Status */}
      {currentStore && (
        <Alert 
          severity={currentStore.isActive ? 'success' : 'info'}
          action={
            currentStore.vendorStatus === 'pending' && (
              <Button color="inherit" size="small" onClick={handleCancelRequest}>
                Annuler la demande
              </Button>
            )
          }
        >
          <div>
            <Typography variant="h6">{currentStore.homeName}</Typography>
            <div className="flex items-center gap-2">
              <Chip 
                label={currentStore.vendorStatus}
                color={getStatusColor(currentStore.vendorStatus)}
                icon={getStatusIcon(currentStore.vendorStatus)}
                size="small"
              />
              {currentStore.isActive && (
                <Chip label="Active" color="success" size="small" />
              )}
            </div>
          </div>
        </Alert>
      )}

      {/* Filters */}
      {canRequest && (
        <div className="flex gap-4 items-center">
          <TextField
            placeholder="Rechercher une store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            className="flex-1 max-w-md"
          />
          
          <FormControl size="small" className="min-w-[200px]">
            <InputLabel>Catégorie</InputLabel>
            <Select
              value={selectedCategory}
              label="Catégorie"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">Toutes les catégories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      )}

      {/* Message si pas de possibilité de demande */}
      {!canRequest && !currentStore && (
        <Alert severity="info">
          Vous avez déjà une demande en cours ou une store assignée.
        </Alert>
      )}

      {/* Grid des stores disponibles */}
      {canRequest && (
        <Grid container spacing={3}>
          {filteredStores.map((store) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={store.id}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardMedia
                  component="div"
                  sx={{ height: 200, bgcolor: 'grey.200' }}
                  className="relative"
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <StoreIcon className="text-gray-400" style={{ fontSize: 60 }} />
                  </div>
                  <Chip 
                    label={store.homeTheme}
                    size="small"
                    className="absolute top-2 right-2"
                  />
                </CardMedia>
                
                <CardContent className="space-y-3">
                  <div>
                    <Typography variant="h6" className="font-semibold">
                      {store.homeName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {store.name}
                    </Typography>
                  </div>

                  <Typography variant="body2" className="text-gray-600 line-clamp-3">
                    {store.homeDescription}
                  </Typography>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => window.open(store.previewUrl, '_blank')}
                    >
                      Aperçu
                    </Button>
                    
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<SendIcon />}
                      onClick={() => {
                        setSelectedStore(store);
                        setRequestDialog(true);
                      }}
                    >
                      Demander
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Message si aucune store disponible */}
      {canRequest && filteredStores.length === 0 && (
        <div className="text-center py-12">
          <StoreIcon className="mx-auto text-gray-400 mb-4" style={{ fontSize: 80 }} />
          <Typography variant="h6" color="text.secondary">
            Aucune store disponible
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm || selectedCategory 
              ? 'Essayez de modifier vos filtres'
              : 'Toutes les stores sont déjà assignées'
            }
          </Typography>
        </div>
      )}

      {/* Dialog de demande */}
      <Dialog open={requestDialog} onClose={() => setRequestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Demander la store "{selectedStore?.homeName}"
        </DialogTitle>
        <DialogContent className="space-y-4">
          <Typography variant="body2" color="text.secondary">
            {selectedStore?.homeDescription}
          </Typography>
          
          <TextField
            label="Message pour l'administrateur (optionnel)"
            multiline
            rows={4}
            fullWidth
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Expliquez pourquoi cette store vous intéresse..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRequestDialog(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleRequestStore}
            variant="contained"
            startIcon={<SendIcon />}
          >
            Envoyer la demande
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
