'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Image from 'next/image'

interface Category {
  _id: string
  name: string
}

interface Shop {
  _id: string
  name: string
}

interface Collection {
  _id: string
  title: string
  slug: string
  description: string
  subtitle?: string
  image: string
  backgroundImage?: string
  category?: {
    _id: string
    name: string
  }
  shop?: {
    _id: string
    name: string
  }
  featured: boolean
  isActive: boolean
  sortOrder: number
  tags: string[]
  seo: {
    metaTitle: string
    metaDescription: string
    metaKeywords: string
  }
  createdAt: string
  updatedAt: string
}

interface CollectionForm {
  title: string
  slug: string
  description: string
  subtitle: string
  image: string
  backgroundImage: string
  category: string
  shop: string
  featured: boolean
  isActive: boolean
  sortOrder: number
  tags: string[]
  seo: {
    metaTitle: string
    metaDescription: string
    metaKeywords: string
  }
}

export default function EditCollectionPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [tagInput, setTagInput] = useState('')
  const [collection, setCollection] = useState<Collection | null>(null)
  
  const [formData, setFormData] = useState<CollectionForm>({
    title: '',
    slug: '',
    description: '',
    subtitle: '',
    image: '',
    backgroundImage: '',
    category: '',
    shop: '',
    featured: false,
    isActive: true,
    sortOrder: 0,
    tags: [],
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ''
    }
  })

  useEffect(() => {
    if (params.id) {
      fetchCollection()
      fetchCategories()
      fetchShops()
    }
  }, [params.id])

  const fetchCollection = async () => {
    try {
      setInitialLoading(true)
      const response = await fetch(`/api/collections/${params.id}?populate=true`)
      const data = await response.json()
      
      if (data.success && data.data) {
        const collectionData = data.data
        setCollection(collectionData)
        
        setFormData({
          title: collectionData.title || '',
          slug: collectionData.slug || '',
          description: collectionData.description || '',
          subtitle: collectionData.subtitle || '',
          image: collectionData.image || '',
          backgroundImage: collectionData.backgroundImage || '',
          category: collectionData.category?._id || '',
          shop: collectionData.shop?._id || '',
          featured: collectionData.featured || false,
          isActive: collectionData.isActive !== false,
          sortOrder: collectionData.sortOrder || 0,
          tags: collectionData.tags || [],
          seo: {
            metaTitle: collectionData.seo?.metaTitle || '',
            metaDescription: collectionData.seo?.metaDescription || '',
            metaKeywords: collectionData.seo?.metaKeywords || ''
          }
        })
      } else {
        setError(data.error || 'Collection non trouvée')
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la collection:', error)
      setError('Erreur de connexion')
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
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/collections/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        router.push('/dashboard/collections')
      } else {
        setError(data.error || 'Erreur lors de la mise à jour de la collection')
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
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="fas fa-exclamation-triangle fa-3x text-warning"></i>
          </div>
          <h4 className="text-muted">Collection non trouvée</h4>
          <p className="text-muted">La collection que vous cherchez n'existe pas ou a été supprimée.</p>
          <button 
            className="btn btn-primary"
            onClick={() => router.push('/dashboard/collections')}
          >
            Retour aux collections
          </button>
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
              <h2 className="h3 mb-0 fw-bold text-dark">Modifier la Collection</h2>
              <p className="text-muted mb-0">Modifiez les informations de la collection "{collection.title}"</p>
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
                    <label htmlFor="title" className="form-label fw-semibold">Titre *</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder="Nom de la collection"
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
                      placeholder="url-de-la-collection"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="subtitle" className="form-label fw-semibold">Sous-titre</label>
                  <input
                    type="text"
                    className="form-control"
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="Sous-titre de la collection"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Description de la collection"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-semibold">Images</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="image" className="form-label fw-semibold">Image principale</label>
                    <input
                      type="url"
                      className="form-control"
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      placeholder="https://exemple.com/image.jpg"
                    />
                    {formData.image && (
                      <div className="mt-2">
                        <Image
                          src={formData.image}
                          alt="Aperçu"
                          width={100}
                          height={100}
                          className="rounded object-cover"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="backgroundImage" className="form-label fw-semibold">Image de fond</label>
                    <input
                      type="url"
                      className="form-control"
                      id="backgroundImage"
                      name="backgroundImage"
                      value={formData.backgroundImage}
                      onChange={handleInputChange}
                      placeholder="https://exemple.com/background.jpg"
                    />
                    {formData.backgroundImage && (
                      <div className="mt-2">
                        <Image
                          src={formData.backgroundImage}
                          alt="Aperçu fond"
                          width={100}
                          height={60}
                          className="rounded object-cover"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </div>
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
            {/* Informations de la collection */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-semibold">Informations</h5>
              </div>
              <div className="card-body">
                <div className="mb-2">
                  <small className="text-muted">ID:</small>
                  <div className="font-monospace small">{collection._id}</div>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Créée le:</small>
                  <div>{new Date(collection.createdAt).toLocaleDateString('fr-FR')}</div>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Modifiée le:</small>
                  <div>{new Date(collection.updatedAt).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
            </div>

            {/* Paramètres */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="mb-0 fw-semibold">Paramètres</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label htmlFor="category" className="form-label fw-semibold">Catégorie</label>
                  <select
                    className="form-select"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
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
                  <label htmlFor="sortOrder" className="form-label fw-semibold">Ordre d'affichage</label>
                  <input
                    type="number"
                    className="form-control"
                    id="sortOrder"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
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
                    Collection mise en avant
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
                    Collection active
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