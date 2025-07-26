// pages/api/orders/[id].js
import dbConnect from '../../../utils/dbConnect'
import Order from '../../../models/Order'
import { getSession } from 'next-auth/react'

export default async function handler(req, res) {
  const { id } = req.query

  // Connexion à la base
  await dbConnect()

  // On ne gère que GET ici (à étendre si besoin pour PUT/PATCH/DELETE)
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ message: `Méthode ${req.method} non autorisée` })
  }

  // Vérification de la session
  const session = await getSession({ req })
  if (!session) {
    return res.status(401).json({ message: 'Non authentifié' })
  }

  try {
    // Récupération de la commande
    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('items.product', 'name images')

    if (!order) {
      return res.status(404).json({ message: 'Commande non trouvée' })
    }

    // Seulement l'admin ou le propriétaire peuvent voir
    if (
      session.user.role !== 'admin' &&
      order.user._id.toString() !== session.user.id
    ) {
      return res.status(403).json({ message: 'Accès refusé' })
    }

    // Tout est bon
    return res.status(200).json(order)
  } catch (error) {
    console.error('Erreur API commande:', error)
    return res.status(500).json({ message: 'Erreur serveur' })
  }
}
