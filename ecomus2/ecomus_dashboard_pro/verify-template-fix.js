const mongoose = require('mongoose');
require('dotenv').config();

const TemplateSubscriptionSchema = new mongoose.Schema({
  templateId: String,
  name: String,
  subscriptionTier: String,
  isActive: Boolean
});

const TemplateSubscription = mongoose.model('TemplateSubscription', TemplateSubscriptionSchema);

async function verifyTemplateFix() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté à MongoDB');

    const freeTemplates = await TemplateSubscription.find({ 
      subscriptionTier: 'free', 
      isActive: true 
    }).select('templateId name');
    
    const basicTemplates = await TemplateSubscription.find({ 
      subscriptionTier: 'basic', 
      isActive: true 
    }).select('templateId name');

    console.log('\nTemplates GRATUITS disponibles:');
    freeTemplates.forEach(t => console.log(`- ${t.name} (${t.templateId})`));
    
    console.log('\nTemplates BASIQUES disponibles:');
    basicTemplates.forEach(t => console.log(`- ${t.name} (${t.templateId})`));
    
    console.log(`\nTotal FREE: ${freeTemplates.length}`);
    console.log(`Total BASIC: ${basicTemplates.length}`);
    
    if (freeTemplates.length === 0) {
      console.log('\n❌ PROBLÈME: Aucun template gratuit disponible!');
    } else {
      console.log('\n✅ Des templates gratuits sont maintenant disponibles!');
    }

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await mongoose.disconnect();
  }
}

verifyTemplateFix();