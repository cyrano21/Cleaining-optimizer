// utils/hotelUtils.js
export const analyzeRoomData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        // Cette fonction simule l'analyse du fichier
        // Dans une application réelle, vous devriez implémenter une logique d'analyse appropriée
        const content = event.target.result;
        const lines = content.split("\n");
        const rooms = lines.map((line) => {
          const [number, state, type, notes] = line.split(",");
          return {
            number,
            state,
            type,
            notes: notes || "",
            assignedTo: null,
            checked: false,
          };
        });
        resolve(rooms);
      } catch (error) {
        reject(new Error("Erreur lors de l'analyse du fichier"));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};
