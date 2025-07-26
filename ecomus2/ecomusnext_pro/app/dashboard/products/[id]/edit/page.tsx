'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

interface Category {
  _id: string
  name: string
}

interface Collection {
  _id: string
  title: string
}

interface Shop {
  _id: string
  name: string
}

interface Seller {
  _id: string
  name: string
}

interface ProductForm {
  name: string
  slug: string
  description: string
  shortDescription: string
  price: number
  salePrice: number
  stock: number
  sku: string
  images: string[]
  category: string
  collection: string
  shop: string
  seller: string
  tags: string[]
  featured: boolean
  isActive: boolean
  weight: number
  dimensions: {
    length: number
    width: number
    height: number
  }
  seo: {
    metaTitle: string
    metaDescription: string
    metaKeywords: string
  }
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [sellers, setSellers] = useState<Seller[]>([])
  const [tagInput, setTagInput] = useState('')
  const [imageInput, setImageInput] = useState('')
  
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    slug: '',
    description: '',
    shortDescription: '',
    price: 0,
    salePrice: 0,
    stock: 0,
    sku: '',
    images: [],
    category: '',
    collection: '',
    shop: '',
    seller: '',
    tags: [],
    featured: false,
    isActive: true,
    weight: 0,
    dimensions: {
      length: 0,
      width: 0,
      height: 0
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ''
    }
  })

  useEffect(() => {
    if (params.id) {
      fetchProduct()
      fetchCategories()
      fetchCollections()
      fetchShops()
      fetchSellers()
    }
  }, [params.id])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        const product = data.data
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || '',
          shortDescription: product.shortDescription || '',
          price: product.price || 0,
          salePrice: product.salePrice || 0,
          stock: product.stock || 0,
          sku: product.sku || '',
          images: product.images || [],
          category: product.category?._id || product.category || '',
          collection: product.collection?._id || product.collection || '',
          shop: product.shop?._id || product.shop || '',
          seller: product.seller?._id || product.seller || '',
          tags: product.tags || [],
          featured: product.featured || false,
          isActive: product.isActive !== false,
          weight: product.weight || 0,
          dimensions: {
            length: product.dimensions?.length || 0,
            width: product.dimensions?.width || 0,
            height: product.dimensions?.height || 0
          },
          seo: {
            metaTitle: product.seo?.metaTitle || '',
            metaDescription: product.seo?.metaDescription || '',
            metaKeywords: product.seo?.metaKeywords || ''
          }
        })
      } else {
        setError('Produit non trouvé')
      }
    } catch (error) {
      console.error('Erreur lors du chargement du produit:', error)
      setError('Erreur lors du chargement du produit')
    } finally {
      setInitialLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.data || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error)
    }
  }

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      const data = await response.json()
      if (data.success) {
        setCollections(data.data || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des collections:', error)
    }
  }

  const fetchShops = async () => {
    try {
      const response = await fetch('/api/shops')
      const data = await response.json()
      if (data.success) {
        setShops(data.data || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des boutiques:', error)
    }
  }

  const fetchSellers = async () => {
    try {
      const response = await fetch('/api/sellers')
      const data = await response.json()
      if (data.success) {
        setSellers(data.data || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des vendeurs:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (name.startsWith('seo.')) {
      const seoField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          [seoField]: value
        }
      }))
    } else if (name.startsWith('dimensions.')) {
      const dimField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimField]: parseFloat(value) || 0
        }
      }))
    } else {
      const processedValue = type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
        ? parseFloat(value) || 0 
        : value
      
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }))
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleAddImage = () => {
    if (imageInput.trim() && !formData.images.includes(imageInput.trim())) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageInput.trim()]
      }))
      setImageInput('')
    }
  }

  const handleRemoveImage = (imageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(image => image !== imageToRemove)
    }))
  }

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6)
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase()
    const sku = `PRD-${timestamp}-${randomStr}`
    setFormData(prev => ({ ...prev, sku }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/dashboard/products')
      } else {
        setError(data.error || 'Erreur lors de la mise à jour du produit')
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="text-muted">Chargement du produit...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="h3 mb-0 fw-bold text-dark">Modifier le Produit</h2>
              <p className="text-muted mb-0">Modifiez les informations du produit</p>
            </div>
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={() => router.back()}
            >
              <i className="fas fa-arrow-left me-2"></i>Retour
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-lg-8">
            {/* Informations principales */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-semibold">Informations principales</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label fw-semibold">Nom du produit *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Nom du produit"
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="slug" className="form-label fw-semibold">Slug *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      required
                      placeholder="url-du-produit"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="shortDescription" className="form-label fw-semibold">Description courte</label>
                  <textarea
                    className="form-control"
                    id="shortDescription"
                    name="shortDescription"
                    rows={2}
                    value={formData.shortDescription}
                    onChange={handleInputChange}
                    placeholder="Description courte du produit"
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label fw-semibold">Description complète</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows={6}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description détaillée du produit"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Prix et stock */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-semibold">Prix et inventaire</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label htmlFor="price" className="form-label fw-semibold">Prix *</label>
                    <div className="input-group">
                      <span className="input-group-text">€</span>
                      <input
                        type="number"
                        className="form-control"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="salePrice" className="form-label fw-semibold">Prix promo</label>
                    <div className="input-group">
                      <span className="input-group-text">€</span>
                      <input
                        type="number"
                        className="form-control"
                        id="salePrice"
                        name="salePrice"
                        value={formData.salePrice}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="stock" className="form-label fw-semibold">Stock *</label>
                    <input
                      type="number"
                      className="form-control"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="sku" className="form-label fw-semibold">SKU</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        id="sku"
                        name="sku"
                        value={formData.sku}
                        onChange={handleInputChange}
                        placeholder="SKU du produit"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={generateSKU}
                        title="Générer un SKU"
                      >
                        <i className="fas fa-magic"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-semibold">Images du produit</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="url"
                      className="form-control"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                      placeholder="https://exemple.com/image.jpg"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleAddImage}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
                <div className="row">
                  {formData.images.map((image, index) => (
                    <div key={index} className="col-md-3 mb-3">
                      <div className="position-relative">
                        <Image
                          src={image}
                          alt={`Image ${index + 1}`}
                          width={150}
                          height={150}
                          className="rounded object-cover w-100"
                          style={{ objectFit: 'cover', height: '150px' }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                          onClick={() => handleRemoveImage(image)}
                          title="Supprimer"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                        {index === 0 && (
                          <span className="badge bg-primary position-absolute bottom-0 start-0 m-1">
                            Image principale
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-semibold">Tags</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Ajouter un tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={handleAddTag}
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="badge bg-primary d-flex align-items-center">
                      #{tag}
                      <button
                        type="button"
                        className="btn-close btn-close-white ms-2"
                        style={{ fontSize: '0.7em' }}
                        onClick={() => handleRemoveTag(tag)}
                        aria-label="Supprimer"
                      ></button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Dimensions et poids */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-semibold">Dimensions et poids</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label htmlFor="weight" className="form-label fw-semibold">Poids (kg)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="dimensions.length" className="form-label fw-semibold">Longueur (cm)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="dimensions.length"
                      name="dimensions.length"
                      value={formData.dimensions.length}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="dimensions.width" className="form-label fw-semibold">Largeur (cm)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="dimensions.width"
                      name="dimensions.width"
                      value={formData.dimensions.width}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label htmlFor="dimensions.height" className="form-label fw-semibold">Hauteur (cm)</label>
                    <input
                      type="number"
                      className="form-control"
                      id="dimensions.height"
                      name="dimensions.height"
                      value={formData.dimensions.height}
                      onChange={handleInputChange}
                      min="0"
                      step="0.1"
                      placeholder="0.0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-semibold">Référencement (SEO)</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="seo.metaTitle" className="form-label fw-semibold">Titre SEO</label>
                  <input
                    type="text"
                    className="form-control"
                    id="seo.metaTitle"
                    name="seo.metaTitle"
                    value={formData.seo.metaTitle}
                    onChange={handleInputChange}
                    placeholder="Titre pour les moteurs de recherche"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="seo.metaDescription" className="form-label fw-semibold">Description SEO</label>
                  <textarea
                    className="form-control"
                    id="seo.metaDescription"
                    name="seo.metaDescription"
                    rows={3}
                    value={formData.seo.metaDescription}
                    onChange={handleInputChange}
                    placeholder="Description pour les moteurs de recherche"
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="seo.metaKeywords" className="form-label fw-semibold">Mots-clés SEO</label>
                  <input
                    type="text"
                    className="form-control"
                    id="seo.metaKeywords"
                    name="seo.metaKeywords"
                    value={formData.seo.metaKeywords}
                    onChange={handleInputChange}
                    placeholder="mot-clé1, mot-clé2, mot-clé3"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Catégorisation */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-semibold">Catégorisation</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="category" className="form-label fw-semibold">Catégorie *</label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="collection" className="form-label fw-semibold">Collection</label>
                  <select
                    className="form-select"
                    id="collection"
                    name="collection"
                    value={formData.collection}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner une collection</option>
                    {collections.map((collection) => (
                      <option key={collection._id} value={collection._id}>
                        {collection.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="shop" className="form-label fw-semibold">Boutique</label>
                  <select
                    className="form-select"
                    id="shop"
                    name="shop"
                    value={formData.shop}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner une boutique</option>
                    {shops.map((shop) => (
                      <option key={shop._id} value={shop._id}>
                        {shop.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="seller" className="form-label fw-semibold">Vendeur</label>
                  <select
                    className="form-select"
                    id="seller"
                    name="seller"
                    value={formData.seller}
                    onChange={handleInputChange}
                  >
                    <option value="">Sélectionner un vendeur</option>
                    {sellers.map((seller) => (
                      <option key={seller._id} value={seller._id}>
                        {seller.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Paramètres */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-semibold">Paramètres</h5>
              </div>
              <div className="card-body">
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="featured">
                    Produit mis en avant
                  </label>
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="isActive">
                    Produit actif
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Mise à jour...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        Mettre à jour
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => router.back()}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}