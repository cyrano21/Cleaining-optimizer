// pages/api/categories/[id].js
import dbConnect from '../../../utils/dbConnect';
import Category from '../../../models/Category';

export default async function handler(req, res) {
  await dbConnect();
  const {
    query: { id },
    method
  } = req;

  switch (method) {
    case 'GET':
      try {
        const category = await Category.findById(id);
        if (!category) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json(category);
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'PUT':
      try {
        const category = await Category.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(200).json(category);
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'DELETE':
      try {
        const deleted = await Category.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
        res.status(204).end();
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
