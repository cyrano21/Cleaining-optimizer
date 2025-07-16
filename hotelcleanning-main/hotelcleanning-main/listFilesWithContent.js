const fs = require("fs");
const path = require("path");

// Fonction pour lister les fichiers et dossiers récursivement et extraire le contenu des fichiers pertinents
const listFilesWithContent = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      if (!filepath.includes("node_modules") && !filepath.includes(".next")) {
        filelist = listFilesWithContent(filepath, filelist);
      }
    } else {
      if ([".js", ".jsx", ".css"].includes(path.extname(filepath))) {
        const content = fs.readFileSync(filepath, "utf-8");
        filelist.push({ filepath, content });
      }
    }
  });
  return filelist;
};

// Chemin du répertoire de votre projet
const projectDir = path.resolve(__dirname);

// Lister les fichiers et dossiers avec leur contenu
const filesWithContent = listFilesWithContent(projectDir);

// Créer un fichier de sortie
const outputFile = "fileListWithContent.txt";
const outputStream = fs.createWriteStream(outputFile, { flags: "w" });

// Écrire les fichiers et leur contenu dans le fichier de sortie
filesWithContent.forEach(({ filepath, content }) => {
  outputStream.write(`File: ${filepath}\n`);
  outputStream.write("----------------------------------------\n");
  outputStream.write(content);
  outputStream.write("\n\n");
});

outputStream.end();
console.log(`Liste des fichiers et contenu enregistrée dans ${outputFile}`);
