import * as XLSX from 'xlsx-js-style';
import Papa from 'papaparse';

// Mapping des en-têtes courants vers notre format
const HEADER_MAPPINGS = {
  // Numéros de chambre
  'chambre': 'number',
  'numero': 'number',
  'room': 'number',
  'room number': 'number',
  'numéro': 'number',
  'n°': 'number',
  
  // États
  'état': 'state',
  'etat': 'state',
  'status': 'state',
  'state': 'state',
  
  // Type de chambre
  'type': 'type',
  'category': 'type',
  'catégorie': 'type',
  
  // Notes
  'notes': 'notes',
  'commentaires': 'notes',
  'comments': 'notes',
  'remarques': 'notes',
  
  // Attribution
  'femme de chambre': 'assignedTo',
  'assignation': 'assignedTo',
  'assigned': 'assignedTo',
  'maid': 'assignedTo'
};

// Mapping des états courants vers nos états
const STATE_MAPPINGS = {
  // États de départ
  'départ': 'Départ',
  'depart': 'Départ',
  'checkout': 'Départ',
  'check-out': 'Départ',
  'out': 'Départ',
  
  // États de recouche
  'recouche': 'Recouche',
  'stay': 'Recouche',
  'staying': 'Recouche',
  'occupied': 'Recouche',
  
  // États libres
  'libre': 'Libre',
  'free': 'Libre',
  'available': 'Libre',
  'vacant': 'Libre'
};

// Mapping des types de chambre
const ROOM_TYPE_MAPPINGS = {
  'king': 'KING',
  'twin': 'TWIN',
  'suite': 'SUITE',
  'double twin': 'TWTW',
  'twin twin': 'TWTW'
};

// Mapping des couleurs vers les états
const COLOR_STATE_MAPPINGS = {
  // Blanc -> Libre
  'FFFFFF': 'Libre',
  'FFFFFE': 'Libre',
  'FEFEFE': 'Libre',
  'FCFCFC': 'Libre',
  'F9F9F9': 'Libre',
  'F7F7F7': 'Libre',
  'F5F5F5': 'Libre',
  'F2F2F2': 'Libre',
  'F0F0F0': 'Libre',
  
  // Rose -> Départ
  'FFC0CB': 'Départ',
  'FFB6C1': 'Départ',
  'FF69B4': 'Départ',
  'FF1493': 'Départ',
  'DB7093': 'Départ',
  'FFA0AB': 'Départ',
  'FFD1DC': 'Départ',
  'FFE4E1': 'Départ',
  
  // Vert -> Recouche
  '00FF00': 'Recouche',
  '32CD32': 'Recouche',
  '98FB98': 'Recouche',
  '90EE90': 'Recouche',
  '00FA9A': 'Recouche',
  '3CB371': 'Recouche',
  '2E8B57': 'Recouche',
  '228B22': 'Recouche',
  '008000': 'Recouche'
};

// Mapping des titres de section vers les états
const SECTION_TITLE_MAPPINGS = {
  // Départs
  'depart': 'Départ',
  'départ': 'Départ',
  'departs': 'Départ',
  'départs': 'Départ',
  'check-out': 'Départ',
  'checkout': 'Départ',
  'check out': 'Départ',
  'sortant': 'Départ',
  'sortants': 'Départ',
  'chambres à départ': 'Départ',
  'chambres a depart': 'Départ',
  'liste des départs': 'Départ',
  'liste des departs': 'Départ',
  
  // Recouches
  'recouche': 'Recouche',
  'recouches': 'Recouche',
  'stay': 'Recouche',
  'staying': 'Recouche',
  'restant': 'Recouche',
  'restants': 'Recouche',
  'chambres occupées': 'Recouche',
  'chambres occupees': 'Recouche',
  'clients restants': 'Recouche',
  'liste des recouches': 'Recouche',
  
  // Libres
  'libre': 'Libre',
  'libres': 'Libre',
  'vacant': 'Libre',
  'vacants': 'Libre',
  'disponible': 'Libre',
  'disponibles': 'Libre',
  'chambres libres': 'Libre',
  'chambres disponibles': 'Libre'
};

// Fonction pour détecter le type de fichier
function detectFileType(file) {
  const extension = file.name.split('.').pop().toLowerCase();
  if (extension === 'csv') return 'csv';
  if (['xls', 'xlsx', 'xlsb', 'xlsm'].includes(extension)) return 'excel';
  return 'unknown';
}

// Fonction pour normaliser les en-têtes
function normalizeHeader(header) {
  const normalized = header.toLowerCase().trim();
  return HEADER_MAPPINGS[normalized] || normalized;
}

// Fonction pour normaliser l'état
function normalizeState(state) {
  const normalized = state.toLowerCase().trim();
  return STATE_MAPPINGS[normalized] || state;
}

// Fonction pour normaliser le type de chambre
function normalizeRoomType(type) {
  const normalized = type.toLowerCase().trim();
  return ROOM_TYPE_MAPPINGS[normalized] || type.toUpperCase();
}

// Fonction pour détecter automatiquement le format des numéros de chambre
function detectRoomNumberFormat(numbers) {
  const patterns = numbers.map(num => {
    const cleaned = num.toString().trim();
    const hasLetter = /[a-zA-Z]/.test(cleaned);
    const digits = cleaned.match(/\d+/g);
    return {
      original: cleaned,
      hasLetter,
      digitCount: digits ? digits.join('').length : 0,
      pattern: cleaned.replace(/\d+/g, 'N').replace(/[a-zA-Z]+/g, 'L')
    };
  });
  
  // Trouver le pattern le plus commun
  const patternCounts = {};
  patterns.forEach(p => {
    patternCounts[p.pattern] = (patternCounts[p.pattern] || 0) + 1;
  });
  
  const dominantPattern = Object.entries(patternCounts)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  return {
    pattern: dominantPattern,
    hasLetters: dominantPattern.includes('L'),
    digitCount: (dominantPattern.match(/N/g) || []).length
  };
}

// Fonction pour normaliser un numéro de chambre selon le format détecté
function normalizeRoomNumber(number, format) {
  const cleaned = number.toString().trim();
  if (!format) return cleaned;
  
  const digits = cleaned.match(/\d+/g) || [];
  const letters = cleaned.match(/[a-zA-Z]+/g) || [];
  
  let normalized = format.pattern;
  digits.forEach(digit => {
    normalized = normalized.replace('N', digit);
  });
  letters.forEach(letter => {
    normalized = normalized.replace('L', letter.toUpperCase());
  });
  
  return normalized;
}

// Fonction pour convertir RGB en HEX
function rgbToHex(r, g, b) {
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0').toUpperCase();
}

// Fonction pour extraire la couleur d'une cellule Excel
function extractCellColor(cell) {
  if (!cell || !cell.s) return null;
  
  // Vérifier la couleur de fond
  if (cell.s.fgColor) {
    if (cell.s.fgColor.rgb) {
      return cell.s.fgColor.rgb.toUpperCase();
    }
  }
  
  // Vérifier la couleur de police
  if (cell.s.color) {
    if (cell.s.color.rgb) {
      return cell.s.color.rgb.toUpperCase();
    }
  }
  
  return null;
}

// Fonction pour détecter l'état basé sur la couleur
function detectStateFromColor(color) {
  if (!color) return null;
  
  // Recherche directe dans le mapping
  if (COLOR_STATE_MAPPINGS[color]) {
    return COLOR_STATE_MAPPINGS[color];
  }
  
  // Recherche de la couleur la plus proche
  let minDistance = Infinity;
  let closestState = null;
  
  const colorValue = parseInt(color, 16);
  const r1 = (colorValue >> 16) & 255;
  const g1 = (colorValue >> 8) & 255;
  const b1 = colorValue & 255;
  
  // Fonction pour calculer la luminosité
  const getLuminance = (r, g, b) => (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Si la couleur est très claire (proche du blanc)
  const luminance = getLuminance(r1, g1, b1);
  if (luminance > 0.95) {
    return 'Libre';
  }
  
  Object.entries(COLOR_STATE_MAPPINGS).forEach(([mappedColor, state]) => {
    const mappedValue = parseInt(mappedColor, 16);
    const r2 = (mappedValue >> 16) & 255;
    const g2 = (mappedValue >> 8) & 255;
    const b2 = mappedValue & 255;
    
    // Calculer la distance euclidienne dans l'espace RGB
    const distance = Math.sqrt(
      Math.pow(r1 - r2, 2) +
      Math.pow(g1 - g2, 2) +
      Math.pow(b1 - b2, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestState = state;
    }
  });
  
  return closestState;
}

// Fonction pour détecter si une chaîne est un titre de section
function detectSectionTitle(text) {
  if (!text) return null;
  const normalized = text.toLowerCase().trim();
  return SECTION_TITLE_MAPPINGS[normalized] || null;
}

// Fonction pour analyser le contenu et détecter les sections
function analyzeSections(data) {
  let currentSection = null;
  let sections = [];
  let currentSectionData = [];
  
  data.forEach((row, index) => {
    // Vérifier chaque champ du row pour un possible titre de section
    Object.values(row).forEach(value => {
      if (typeof value === 'string') {
        const sectionTitle = detectSectionTitle(value);
        if (sectionTitle) {
          // Si on trouve une nouvelle section, sauvegarder la précédente
          if (currentSection && currentSectionData.length > 0) {
            sections.push({
              state: currentSection,
              startIndex: index - currentSectionData.length,
              endIndex: index - 1,
              data: currentSectionData
            });
          }
          currentSection = sectionTitle;
          currentSectionData = [];
          return;
        }
      }
    });
    
    // Si nous sommes dans une section et que la ligne contient des données utiles
    if (currentSection && Object.keys(row).length > 0) {
      // Vérifier si la ligne contient un numéro de chambre
      const hasRoomNumber = Object.values(row).some(value => 
        value && /^\d+/.test(value.toString().trim())
      );
      
      if (hasRoomNumber) {
        currentSectionData.push(row);
      }
    }
  });
  
  // Ajouter la dernière section si elle existe
  if (currentSection && currentSectionData.length > 0) {
    sections.push({
      state: currentSection,
      startIndex: data.length - currentSectionData.length,
      endIndex: data.length - 1,
      data: currentSectionData
    });
  }
  
  return sections;
}

// Fonction principale pour analyser et importer les données
export async function smartImport(file) {
  return new Promise((resolve, reject) => {
    const fileType = detectFileType(file);
    
    if (fileType === 'unknown') {
      reject(new Error('Format de fichier non supporté'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        let data;
        let colorData = new Map();
        
        if (fileType === 'csv') {
          const result = Papa.parse(e.target.result, {
            header: true,
            skipEmptyLines: true
          });
          data = result.data;
        } else {
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          
          // Extraire les couleurs
          Object.keys(firstSheet).forEach(cell => {
            if (cell[0] !== '!') {
              const color = extractCellColor(firstSheet[cell]);
              if (color) {
                colorData.set(cell, color);
              }
            }
          });
          
          data = XLSX.utils.sheet_to_json(firstSheet);
        }
        
        // Analyser les sections
        const sections = analyzeSections(data);
        
        // Détecter le format des numéros de chambre
        const roomNumbers = data.map(row => {
          const possibleFields = ['number', 'chambre', 'numero', 'room'];
          const field = possibleFields.find(f => row[f]);
          return row[field];
        });
        const roomNumberFormat = detectRoomNumberFormat(roomNumbers);
        
        // Normaliser les données
        const normalizedData = data.map((row, index) => {
          const normalized = {};
          
          // Trouver la section correspondante
          const section = sections.find(s => 
            index >= s.startIndex && index <= s.endIndex
          );
          
          Object.entries(row).forEach(([key, value]) => {
            const normalizedKey = normalizeHeader(key);
            
            if (normalizedKey === 'number') {
              normalized[normalizedKey] = normalizeRoomNumber(value, roomNumberFormat);
              
              // Priorité 1: Couleur de la cellule
              if (fileType !== 'csv') {
                const cellRef = XLSX.utils.encode_cell({ r: index + 1, c: 0 });
                const color = colorData.get(cellRef);
                if (color) {
                  const stateFromColor = detectStateFromColor(color);
                  if (stateFromColor) {
                    normalized.state = stateFromColor;
                  }
                }
              }
              
              // Priorité 2: État de la section
              if (!normalized.state && section) {
                normalized.state = section.state;
              }
            } else if (normalizedKey === 'state' && !normalized.state) {
              normalized[normalizedKey] = normalizeState(value);
            } else if (normalizedKey === 'type') {
              normalized[normalizedKey] = normalizeRoomType(value);
            } else if (normalizedKey === 'notes') {
              normalized[normalizedKey] = value ? [value] : [];
            } else {
              normalized[normalizedKey] = value;
            }
          });
          
          return normalized;
        });
        
        resolve(normalizedData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    if (fileType === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
}
