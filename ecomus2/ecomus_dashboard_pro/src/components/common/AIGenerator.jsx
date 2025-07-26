'use client';

import { useState } from 'react';
import { Sparkles, Image, FileText, Wand2, Download, Copy, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function AIGenerator({ 
  productId, 
  onContentGenerated, 
  className = '' 
}) {
  const [activeTab, setActiveTab] = useState('images');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [aiModel, setAiModel] = useState('huggingface');
  const [imageStyle, setImageStyle] = useState('realistic');
  const [textType, setTextType] = useState('description');

  const tabs = [
    { id: 'images', label: 'Images IA', icon: Image },
    { id: 'text', label: 'Texte IA', icon: FileText },
    { id: 'analysis', label: 'Analyse IA', icon: Sparkles }
  ];

  const imageStyles = [
    { id: 'realistic', label: 'Réaliste' },
    { id: 'artistic', label: 'Artistique' },
    { id: 'minimalist', label: 'Minimaliste' },
    { id: 'vintage', label: 'Vintage' },
    { id: 'modern', label: 'Moderne' }
  ];

  const textTypes = [
    { id: 'description', label: 'Description produit' },
    { id: 'features', label: 'Caractéristiques' },
    { id: 'marketing', label: 'Texte marketing' },
    { id: 'seo', label: 'Description SEO' }
  ];

  const generateContent = async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez entrer une description');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          type: activeTab,
          model: aiModel,
          productId,
          options: {
            style: imageStyle,
            textType: textType
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la génération');
      }

      setGeneratedContent(data);
      
      if (onContentGenerated) {
        onContentGenerated(data);
      }

      toast.success('Contenu généré avec succès !');

    } catch (error) {
      console.error('Generation error:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copié dans le presse-papiers');
  };

  const downloadImage = (imageUrl, filename = 'generated-image.png') => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Image téléchargée');
  };

  const regenerateContent = () => {
    generateContent();
  };

  const promptSuggestions = {
    images: [
      "Un produit élégant sur fond blanc minimaliste",
      "Style photographique professionnel, éclairage studio",
      "Ambiance chaleureuse et accueillante",
      "Design moderne et épuré"
    ],
    text: [
      "Créez une description attrayante et détaillée",
      "Mettez en avant les avantages et caractéristiques",
      "Ton professionnel et engageant",
      "Optimisé pour le référencement"
    ],
    analysis: [
      "Analysez les tendances du marché",
      "Identifiez les points forts du produit",
      "Suggestions d'amélioration",
      "Comparaison avec la concurrence"
    ]
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Générateur IA</h2>
            <p className="text-sm text-gray-600">Créez du contenu avec l'intelligence artificielle</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modèle IA
            </label>
            <select
              value={aiModel}
              onChange={(e) => setAiModel(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="huggingface">Hugging Face (Recommandé)</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>

          {activeTab === 'images' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Style d'image
              </label>
              <select
                value={imageStyle}
                onChange={(e) => setImageStyle(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {imageStyles.map((style) => (
                  <option key={style.id} value={style.id}>
                    {style.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de texte
              </label>
              <select
                value={textType}
                onChange={(e) => setTextType(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {textTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description / Prompt
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Décrivez ce que vous souhaitez générer...`}
            rows="4"
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            disabled={isGenerating}
          />
          
          {/* Suggestions */}
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {promptSuggestions[activeTab]?.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(suggestion)}
                  className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                  disabled={isGenerating}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={generateContent}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Générer du contenu
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <AnimatePresence>
          {generatedContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="border rounded-lg p-6 bg-gradient-to-r from-blue-50 to-purple-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Contenu généré
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={regenerateContent}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-colors"
                    title="Régénérer"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Image Results */}
              {activeTab === 'images' && generatedContent.images && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generatedContent.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={`Image générée ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <button
                          onClick={() => downloadImage(image.url, `generated-${index + 1}.png`)}
                          className="p-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Text Results */}
              {(activeTab === 'text' || activeTab === 'analysis') && generatedContent.text && (
                <div className="space-y-4">
                  {Object.entries(generatedContent.text).map(([key, value]) => (
                    <div key={key} className="bg-white rounded-lg p-4 border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 capitalize">
                          {key.replace('_', ' ')}
                        </h4>
                        <button
                          onClick={() => copyToClipboard(value)}
                          className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                          title="Copier"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Analysis Results */}
              {activeTab === 'analysis' && generatedContent.analysis && (
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-semibold text-gray-900 mb-3">Analyse du produit</h4>
                  <div className="space-y-3">
                    {generatedContent.analysis.strengths && (
                      <div>
                        <p className="font-medium text-green-700 mb-1">Points forts:</p>
                        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                          {generatedContent.analysis.strengths.map((strength, index) => (
                            <li key={index}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {generatedContent.analysis.improvements && (
                      <div>
                        <p className="font-medium text-orange-700 mb-1">Améliorations suggérées:</p>
                        <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                          {generatedContent.analysis.improvements.map((improvement, index) => (
                            <li key={index}>{improvement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
