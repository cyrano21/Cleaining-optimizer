import { Product } from '@/hooks/useProducts';

export const exportToCSV = (products: Product[], filename: string = 'products') => {
  const headers = [
    'ID',
    'Titre',
    'Description',
    'Prix',
    'Prix Comparé',
    'SKU',
    'Quantité',
    'Catégorie',
    'Statut',
    'En Vedette',
    'Tags',
    'Boutique',
    'Date de Création',
    'Date de Modification'
  ];

  const csvContent = [
    headers.join(','),
    ...products.map(product => [
      product._id,
      `"${product.title?.replace(/"/g, '""') || ''}`,
      `"${product.description?.replace(/"/g, '""') || ''}`,
      product.price || 0,
      product.comparePrice || '',
      product.sku || '',
      product.quantity || 0,
      product.category || '',
      product.status || '',
      product.featured ? 'Oui' : 'Non',
      `"${product.tags?.join('; ') || ''}`,
      `"${product.store?.name || product.store?.slug || ''}`,
      new Date(product.createdAt).toLocaleDateString('fr-FR'),
      new Date(product.updatedAt).toLocaleDateString('fr-FR')
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportToJSON = (products: Product[], filename: string = 'products') => {
  const jsonContent = JSON.stringify(products, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};