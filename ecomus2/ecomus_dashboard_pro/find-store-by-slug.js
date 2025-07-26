require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI);

const Store = mongoose.model('Store', new mongoose.Schema({}, { strict: false, collection: 'stores' }));

Store.find({ slug: "cosmetiques-beaute" }).then(stores => {
  console.log(stores);
  if (stores.length === 0) {
    console.log("Aucune boutique trouvée avec ce slug.");
  }
  mongoose.disconnect();
}).catch(err => {
  console.error(err);
  mongoose.disconnect();
});
