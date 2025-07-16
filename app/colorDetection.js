import { createWorker } from "tesseract.js";

// Définition des couleurs supportées avec leurs plages RGB
const COLOR_DEFINITIONS = {
  // Couleurs principales hôtelières
  red: { r: [150, 255], g: [0, 100], b: [0, 100], priority: 1 },
  orange: { r: [200, 255], g: [100, 200], b: [0, 100], priority: 2 },
  yellow: { r: [200, 255], g: [200, 255], b: [0, 150], priority: 3 },
  green: { r: [0, 150], g: [150, 255], b: [0, 150], priority: 4 },
  blue: { r: [0, 150], g: [0, 150], b: [150, 255], priority: 5 },
  purple: { r: [100, 200], g: [0, 150], b: [150, 255], priority: 6 },
  pink: { r: [200, 255], g: [100, 200], b: [150, 255], priority: 7 },
  white: { r: [200, 255], g: [200, 255], b: [200, 255], priority: 8 },
  lightgray: { r: [180, 220], g: [180, 220], b: [180, 220], priority: 9 },
  gray: { r: [100, 180], g: [100, 180], b: [100, 180], priority: 10 },
  black: { r: [0, 80], g: [0, 80], b: [0, 80], priority: 11 }
};

// Fonction pour calculer la distance entre deux couleurs
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt(Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2));
}

// Fonction pour déterminer si une couleur RGB correspond à une définition de couleur
function isColorInRange(r, g, b, colorDef) {
  return (
    r >= colorDef.r[0] && r <= colorDef.r[1] &&
    g >= colorDef.g[0] && g <= colorDef.g[1] &&
    b >= colorDef.b[0] && b <= colorDef.b[1]
  );
}

// Fonction pour obtenir la couleur dominante d'une zone
function getDominantColor(r, g, b) {
  const matches = [];
  
  // Vérifier chaque couleur définie
  Object.entries(COLOR_DEFINITIONS).forEach(([colorName, colorDef]) => {
    if (isColorInRange(r, g, b, colorDef)) {
      matches.push({
        name: colorName,
        priority: colorDef.priority,
        distance: colorDistance(r, g, b, 
          (colorDef.r[0] + colorDef.r[1]) / 2,
          (colorDef.g[0] + colorDef.g[1]) / 2,
          (colorDef.b[0] + colorDef.b[1]) / 2
        )
      });
    }
  });
  
  if (matches.length === 0) {
    return {
      name: "unknown",
      confidence: 0,
      rgb: { r, g, b }
    };
  }
  
  // Trier par priorité puis par distance
  matches.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.distance - b.distance;
  });
  
  return {
    name: matches[0].name,
    confidence: Math.max(0, 100 - (matches[0].distance / 255 * 100)),
    rgb: { r, g, b }
  };
}

export async function getColorFromImage(canvas, roomNumber) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  const col = ((roomNumber % 100) - 1) % 20;
  const row = Math.floor(roomNumber / 100) - 1;
  const cellWidth = width / 20;
  const cellHeight = height / 6;
  const x = col * cellWidth;
  const y = row * cellHeight;

  // Échantillonner plus de points pour une meilleure précision
  const samplePoints = [];
  for (let i = 0.2; i <= 0.8; i += 0.2) {
    for (let j = 0.2; j <= 0.8; j += 0.2) {
      samplePoints.push({
        x: x + cellWidth * i,
        y: y + cellHeight * j
      });
    }
  }

  let totalR = 0, totalG = 0, totalB = 0;
  let validSamples = 0;

  samplePoints.forEach((point) => {
    try {
      const pixelData = ctx.getImageData(Math.floor(point.x), Math.floor(point.y), 1, 1).data;
      totalR += pixelData[0];
      totalG += pixelData[1];
      totalB += pixelData[2];
      validSamples++;
    } catch (error) {
      console.warn(`Erreur lors de l'échantillonnage du pixel à (${point.x}, ${point.y}):`, error);
    }
  });

  if (validSamples === 0) {
    return {
      name: "error",
      confidence: 0,
      rgb: { r: 0, g: 0, b: 0 }
    };
  }

  const avgR = Math.round(totalR / validSamples);
  const avgG = Math.round(totalG / validSamples);
  const avgB = Math.round(totalB / validSamples);

  const result = getDominantColor(avgR, avgG, avgB);
  
  console.log(`Chambre ${roomNumber}: Couleur détectée: ${result.name} (${result.confidence.toFixed(1)}% confiance) - RGB(${avgR}, ${avgG}, ${avgB})`);
  
  return result;
}

// Fonction améliorée pour extraire le texte avec meilleure gestion des erreurs
export async function extractTextFromImage(canvas, roomNumber) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  const col = ((roomNumber % 100) - 1) % 20;
  const row = Math.floor(roomNumber / 100) - 1;
  const cellWidth = width / 20;
  const cellHeight = height / 6;
  const x = col * cellWidth;
  const y = row * cellHeight;

  // Créer un nouveau canvas pour la cellule spécifique
  const cellCanvas = document.createElement("canvas");
  cellCanvas.width = cellWidth;
  cellCanvas.height = cellHeight;
  const cellCtx = cellCanvas.getContext("2d");
  
  try {
    cellCtx.drawImage(
      canvas,
      x,
      y,
      cellWidth,
      cellHeight,
      0,
      0,
      cellWidth,
      cellHeight
    );

    // Améliorer le contraste pour une meilleure reconnaissance OCR
    const imageData = cellCtx.getImageData(0, 0, cellWidth, cellHeight);
    const data = imageData.data;
    
    // Appliquer un filtrage pour améliorer la lisibilité
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      const enhanced = gray > 128 ? 255 : 0; // Seuillage binaire
      data[i] = enhanced;     // Rouge
      data[i + 1] = enhanced; // Vert
      data[i + 2] = enhanced; // Bleu
    }
    
    cellCtx.putImageData(imageData, 0, 0);

    // Utiliser Tesseract.js pour extraire le texte
    const worker = await createWorker();
    await worker.loadLanguage("fra");
    await worker.initialize("fra");
    
    // Configuration OCR optimisée
    await worker.setParameters({
      tessedit_char_whitelist: '0123456789:ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz ',
      tessedit_pageseg_mode: '8', // Traiter l'image comme un mot unique
    });
    
    const {
      data: { text, confidence },
    } = await worker.recognize(cellCanvas);
    await worker.terminate();

    // Nettoyer et formater le texte extrait
    const cleanedText = text.trim().replace(/\n/g, " ").replace(/\s+/g, " ");

    // Rechercher des motifs spécifiques avec plus de patterns
    const patterns = {
      lp: /LP/i,
      time: /\d{1,2}:\d{2}/,
      dnd: /DND/i,
      refus: /REFUS/i,
      ooo: /OOO/i, // Out of Order
      maintenance: /MAINT/i,
      departure: /DEP/i,
      arrival: /ARR/i,
      stay: /STAY/i,
      vip: /VIP/i
    };

    const results = [];
    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = cleanedText.match(pattern);
      if (match) {
        results.push({
          type: key,
          value: match[0],
          position: match.index
        });
      }
    });

    return {
      rawText: cleanedText,
      confidence: confidence,
      patterns: results,
      formatted: results.length > 0 ? results.map(r => r.value).join(" ") : cleanedText
    };

  } catch (error) {
    console.error(`Erreur lors de l'extraction de texte pour la chambre ${roomNumber}:`, error);
    return {
      rawText: "",
      confidence: 0,
      patterns: [],
      formatted: "",
      error: error.message
    };
  }
}

// Fonction pour analyser une image complète et extraire toutes les données
export async function analyzeFullImage(canvas) {
  const results = [];
  const totalRooms = 120; // 6 étages × 20 chambres
  
  console.log("Début de l'analyse complète de l'image...");
  
  for (let floor = 1; floor <= 6; floor++) {
    for (let room = 1; room <= 20; room++) {
      const roomNumber = floor * 100 + room;
      
      try {
        const colorResult = await getColorFromImage(canvas, roomNumber);
        const textResult = await extractTextFromImage(canvas, roomNumber);
        
        results.push({
          roomNumber: roomNumber.toString(),
          color: colorResult,
          text: textResult,
          timestamp: new Date().toISOString()
        });
        
        // Petite pause pour éviter de surcharger le système
        if (room % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error) {
        console.error(`Erreur lors de l'analyse de la chambre ${roomNumber}:`, error);
        results.push({
          roomNumber: roomNumber.toString(),
          color: { name: "error", confidence: 0, rgb: { r: 0, g: 0, b: 0 } },
          text: { rawText: "", confidence: 0, patterns: [], formatted: "", error: error.message },
          timestamp: new Date().toISOString()
        });
      }
    }
    
    console.log(`Étage ${floor} analysé (${floor}/6)`);
  }
  
  console.log("Analyse complète terminée");
  return results;
}
