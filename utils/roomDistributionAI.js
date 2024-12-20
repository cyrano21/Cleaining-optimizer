import * as tf from '@tensorflow/tfjs';
import { Matrix } from 'ml-matrix';

// Facteurs de pondération pour différents critères
const WEIGHTS = {
  ROOM_PROXIMITY: 0.3,    // Proximité des chambres
  WORKLOAD: 0.4,         // Équilibrage de la charge de travail
  EXPERIENCE: 0.2,       // Expérience de la femme de chambre
  PREVIOUS_PERF: 0.1     // Performance précédente
};

// Calcule la distance entre deux chambres
function calculateRoomDistance(room1, room2) {
  const floor1 = parseInt(room1.number.substring(0, 1));
  const floor2 = parseInt(room2.number.substring(0, 1));
  const room1Num = parseInt(room1.number.substring(1));
  const room2Num = parseInt(room2.number.substring(1));
  
  return Math.abs(floor1 - floor2) * 10 + Math.abs(room1Num - room2Num);
}

// Calcule le score de proximité pour un groupe de chambres
function calculateProximityScore(rooms) {
  if (rooms.length <= 1) return 1;
  
  let totalDistance = 0;
  for (let i = 0; i < rooms.length - 1; i++) {
    totalDistance += calculateRoomDistance(rooms[i], rooms[i + 1]);
  }
  
  return 1 / (1 + totalDistance / rooms.length);
}

// Calcule la charge de travail basée sur le type de chambre et l'état
function calculateWorkload(room) {
  const typeWeights = {
    'KING': 1.2,
    'TWIN': 1.0,
    'SUITE': 1.5,
    'TWTW': 1.3
  };
  
  const stateWeights = {
    'Départ': 1.5,
    'Recouche': 1.0,
    'Libre': 0.8
  };
  
  return (typeWeights[room.type] || 1) * (stateWeights[room.state] || 1);
}

// Évalue la performance historique d'une femme de chambre
function evaluateHistoricalPerformance(maid, reportedErrors, resolvedErrors) {
  const totalErrors = reportedErrors.filter(error => error.maid === maid).length;
  const resolvedCount = resolvedErrors.filter(error => error.maid === maid).length;
  
  if (totalErrors === 0) return 1;
  return resolvedCount / totalErrors;
}

// Fonction principale d'optimisation
export async function optimizeRoomDistribution(rooms, staff, reportedErrors, resolvedErrors) {
  // Création de la matrice de scores
  const scoreMatrix = new Matrix(staff.length, rooms.length);
  
  // Calcul des scores pour chaque combinaison femme de chambre/chambre
  for (let i = 0; i < staff.length; i++) {
    const maid = staff[i];
    const historicalPerf = evaluateHistoricalPerformance(maid, reportedErrors, resolvedErrors);
    
    for (let j = 0; j < rooms.length; j++) {
      const room = rooms[j];
      
      // Calcul des différents facteurs
      const proximityScore = calculateProximityScore(
        rooms.filter(r => r.assignedTo === maid.id)
      );
      const workloadScore = 1 - (calculateWorkload(room) / 3); // Normalisé entre 0 et 1
      const experienceScore = maid.experience || 0.5; // Valeur par défaut si non définie
      
      // Score final pondéré
      const finalScore = (
        WEIGHTS.ROOM_PROXIMITY * proximityScore +
        WEIGHTS.WORKLOAD * workloadScore +
        WEIGHTS.EXPERIENCE * experienceScore +
        WEIGHTS.PREVIOUS_PERF * historicalPerf
      );
      
      scoreMatrix.set(i, j, finalScore);
    }
  }
  
  // Conversion en tensor TensorFlow
  const scoresTensor = tf.tensor2d(scoreMatrix.to2DArray());
  
  // Utilisation de l'algorithme hongrois pour l'attribution optimale
  const assignments = await tf.tidy(() => {
    const negScores = scoresTensor.mul(-1); // Convertir en problème de minimisation
    return tf.whereAsync(tf.equal(
      negScores,
      tf.min(negScores, 0, true)
    ));
  });
  
  // Conversion des résultats en attributions
  const result = await assignments.array();
  const distribution = new Map();
  
  for (let i = 0; i < result[0].length; i++) {
    const maidIndex = result[0][i];
    const roomIndex = result[1][i];
    const maid = staff[maidIndex];
    const room = rooms[roomIndex];
    
    if (!distribution.has(maid.id)) {
      distribution.set(maid.id, []);
    }
    distribution.get(maid.id).push(room);
  }
  
  // Nettoyage
  tf.dispose(assignments);
  tf.dispose(scoresTensor);
  
  return distribution;
}

// Fonction pour équilibrer la charge de travail
export function balanceWorkload(distribution, rooms) {
  const workloads = new Map();
  
  // Calcul de la charge de travail actuelle
  for (const [maidId, assignedRooms] of distribution.entries()) {
    const totalWorkload = assignedRooms.reduce(
      (sum, room) => sum + calculateWorkload(room),
      0
    );
    workloads.set(maidId, totalWorkload);
  }
  
  // Trouver la charge moyenne
  const avgWorkload = Array.from(workloads.values()).reduce((a, b) => a + b, 0) / workloads.size;
  
  // Rééquilibrer si nécessaire
  let modified = false;
  do {
    modified = false;
    for (const [maidId1, workload1] of workloads.entries()) {
      if (Math.abs(workload1 - avgWorkload) > 0.5) {
        for (const [maidId2, workload2] of workloads.entries()) {
          if (maidId1 !== maidId2) {
            const rooms1 = distribution.get(maidId1);
            const rooms2 = distribution.get(maidId2);
            
            // Chercher une paire de chambres à échanger
            for (let i = 0; i < rooms1.length; i++) {
              for (let j = 0; j < rooms2.length; j++) {
                const diff1 = calculateWorkload(rooms1[i]);
                const diff2 = calculateWorkload(rooms2[j]);
                
                if (Math.abs((workload1 - diff1 + diff2) - avgWorkload) <
                    Math.abs(workload1 - avgWorkload)) {
                  // Échanger les chambres
                  [rooms1[i], rooms2[j]] = [rooms2[j], rooms1[i]];
                  workloads.set(maidId1, workload1 - diff1 + diff2);
                  workloads.set(maidId2, workload2 + diff1 - diff2);
                  modified = true;
                  break;
                }
              }
              if (modified) break;
            }
          }
          if (modified) break;
        }
      }
    }
  } while (modified);
  
  return distribution;
}
