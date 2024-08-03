// Importer le module tesseract.js
import { createWorker } from "tesseract.js";

// Fonction pour obtenir la couleur principale d'une image sur un canevas
export async function getColorFromImage(canvas, roomNumber) {
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  // Calculer la colonne et la rangée à partir du numéro de la chambre
  const col = ((roomNumber % 100) - 1) % 20;
  const row = Math.floor(roomNumber / 100) - 1;
  const cellWidth = width / 20;
  const cellHeight = height / 6;
  const x = col * cellWidth;
  const y = row * cellHeight;

  // Points d'échantillonnage pour obtenir la couleur moyenne
  const samplePoints = [
    { x: x + cellWidth * 0.25, y: y + cellHeight * 0.25 },
    { x: x + cellWidth * 0.75, y: y + cellHeight * 0.25 },
    { x: x + cellWidth * 0.25, y: y + cellHeight * 0.75 },
    { x: x + cellWidth * 0.75, y: y + cellHeight * 0.75 },
    { x: x + cellWidth * 0.5, y: y + cellHeight * 0.5 },
  ];

  let totalR = 0,
    totalG = 0,
    totalB = 0;

  // Calculer la couleur moyenne en fonction des points d'échantillonnage
  samplePoints.forEach((point) => {
    const pixelData = ctx.getImageData(point.x, point.y, 1, 1).data;
    totalR += pixelData[0];
    totalG += pixelData[1];
    totalB += pixelData[2];
  });

  const avgR = totalR / samplePoints.length;
  const avgG = totalG / samplePoints.length;
  const avgB = totalB / samplePoints.length;

  // Déterminer la couleur en fonction des valeurs RVB moyennes
  if (avgR > 200 && avgG < 150 && avgB < 150) {
    return "orange";
  } else if (avgG > 200 && avgR < 150 && avgB < 150) {
    return "green";
  } else if (avgR > 200 && avgG > 200 && avgB > 200) {
    return "white";
  } else {
    console.log(
      `Couleur non reconnue pour la chambre ${roomNumber}: R${avgR} G${avgG} B${avgB}`
    );
    return "unknown";
  }
}

// Fonction pour extraire du texte d'une image sur un canevas
export async function extractTextFromImage(canvas, roomNumber) {
  const width = canvas.width;
  const height = canvas.height;

  const col = ((roomNumber % 100) - 1) % 20;
  const row = Math.floor(roomNumber / 100) - 1;
  const cellWidth = width / 20;
  const cellHeight = height / 6;
  const x = col * cellWidth;
  const y = row * cellHeight;

  // Créer un nouveau canevas pour la cellule spécifique
  const cellCanvas = document.createElement("canvas");
  cellCanvas.width = cellWidth;
  cellCanvas.height = cellHeight;
  const cellCtx = cellCanvas.getContext("2d");
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

  // Utiliser Tesseract.js pour extraire le texte
  const worker = await createWorker();
  await worker.loadLanguage("fra");
  await worker.initialize("fra");
  const {
    data: { text },
  } = await worker.recognize(cellCanvas);
  await worker.terminate();

  // Nettoyer et formater le texte extrait
  const cleanedText = text.trim().replace(/\n/g, " ");

  // Rechercher des motifs spécifiques
  const lpMatch = cleanedText.match(/LP/i);
  const timeMatch = cleanedText.match(/\d{1,2}:\d{2}/);

  let result = "";
  if (lpMatch) {
    result += "LP ";
  }
  if (timeMatch) {
    result += timeMatch[0];
  }

  return result.trim();
}
