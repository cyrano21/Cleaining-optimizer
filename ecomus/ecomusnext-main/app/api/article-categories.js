// pages/api/article-categories.js
import dbConnect from '../../utils/dbConnect';
import ArticleCategory from '../../models/ArticleCategory';

export default async function handler(req, res) {
  await dbConnect();
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const categories = await ArticleCategory.find({});
        res.status(200).json(categories);
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'POST':
      try {
        const category = await ArticleCategory.create(req.body);
        res.status(201).json(category);
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
