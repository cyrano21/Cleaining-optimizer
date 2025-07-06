// pages/api/products/[id].js

import connectDB from '../../../config/db'
import mongoose from 'mongoose'
import Product from '../../../models/Product'
import { serializeProduct } from '../../../utils/productSerializer'
import {
  topDealsProducts,
  topElectronicProducts,
  bestOfferProducts,
  allProducts
} from '../../../data/e-commerce/products'

export default async function handler(req, res) {
  try {
    await connectDB()
  } catch (dbErr) {
    console.error('Erreur connexion DB:', dbErr)
    return res.status(500).json({ error: 'Erreur de connexion à la base de données' })
  }

  const { id } = req.query

  if (!id) {
    return res.status(400).json({ error: 'ID du produit manquant' })
  }

  if (req.method === 'GET') {
    let raw = null

    if (mongoose.isValidObjectId(id)) {
      raw = await Product.findById(id).populate('category').lean()
    }

    if (!raw) {
      raw =
        (await Product.findOne({ legacyId: id }).populate('category').lean()) ||
        (await Product.findOne({ slug: id }).populate('category').lean())
    }

    if (!raw) {
      const all = [
        ...topDealsProducts,
        ...topElectronicProducts,
        ...bestOfferProducts,
        ...allProducts
      ]
      raw = all.find(p => String(p.id) === String(id))
    }

    if (!raw) {
      return res.status(404).json({ error: 'Produit non trouvé' })
    }

    const serializedProduct = raw._id ? serializeProduct(raw) : raw
    return res.status(200).json(serializedProduct)
  }

  // ✅ Ajout de la mise à jour du produit
  if (req.method === 'PATCH') {
    try {
      const updated = await Product.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      }).populate('category').lean()

      if (!updated) {
        return res.status(404).json({ message: 'Produit non trouvé pour mise à jour' })
      }

      const serialized = serializeProduct(updated)
      return res.status(200).json(serialized)
    } catch (err) {
      console.error('Erreur lors de la mise à jour du produit:', err)
      return res.status(500).json({ message: 'Erreur lors de la mise à jour du produit' })
    }
  }

  return res.status(405).json({ error: 'Méthode non autorisée' })
}
