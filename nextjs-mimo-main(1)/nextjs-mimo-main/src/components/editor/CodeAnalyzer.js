"use client";

import { useState } from 'react';

export default function CodeAnalyzer({ code, language }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeCode = async () => {
    if (!code) {
      setError("Aucun code à analyser");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });

      if (!response.ok) {
        throw new Error(`Erreur d'analyse: ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      console.error("Erreur d'analyse du code:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4 my-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Analyseur de Code</h2>
        <button 
          onClick={analyzeCode}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          disabled={loading || !code}
        >
          {loading ? 'Analyse en cours...' : 'Analyser mon code'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 rounded-md border border-red-200 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-gray-600">Analyse en cours...</span>
        </div>
      )}

      {analysis && !loading && (
        <div className="mt-4">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-600">{analysis.score}</span>
            </div>
            <div className="ml-4">
              <h3 className="font-semibold">Score de qualité</h3>
              <p className="text-sm text-gray-600">
                {analysis.score >= 90 ? 'Excellent code!' : 
                 analysis.score >= 70 ? 'Bon code avec quelques améliorations possibles' : 
                 'Des améliorations sont recommandées'}
              </p>
            </div>
          </div>

          {analysis.suggestions && analysis.suggestions.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Suggestions d'amélioration</h3>
              <div className="space-y-2">
                {analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="p-3 bg-amber-50 rounded-md border border-amber-200">
                    <div className="flex items-start">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 mt-1.5 ${
                        suggestion.type === 'optimization' ? 'bg-red-500' :
                        suggestion.type === 'bestpractice' ? 'bg-indigo-500' :
                        suggestion.type === 'debug' ? 'bg-orange-500' :
                        'bg-blue-500'
                      }`}></span>
                      <div>
                        <p className="text-sm font-medium">{suggestion.message}</p>
                        {suggestion.example && (
                          <pre className="mt-1 text-xs p-2 bg-gray-100 rounded">{suggestion.example}</pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {analysis.bestPractices && analysis.bestPractices.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Bonnes pratiques à suivre</h3>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                {analysis.bestPractices.map((practice, index) => (
                  <li key={index}>{practice}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}