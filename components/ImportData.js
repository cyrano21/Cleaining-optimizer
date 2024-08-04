/* eslint-disable react/prop-types */
import React, { useState } from "react";

const ImportData = ({ onImport }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleScan = () => {
    if (file) {
      onImport(file);
    } else {
      alert("Veuillez sélectionner un fichier à scanner.");
    }
  };

  return (
    <div className="segment bg-white shadow-lg rounded-lg p-6 border-t-4 border-indigo-500">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">
        Importation des données
      </h2>
      <div className="flex items-center space-x-4">
        <input
          type="file"
          id="fileInput"
          accept=".pdf,.jpg,.png"
          className="hidden"
          onChange={handleFileChange}
        />
        <label
          htmlFor="fileInput"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded cursor-pointer transition duration-300"
        >
          Choisir un fichier
        </label>
        <button
          onClick={handleScan}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Scanner le fichier
        </button>
      </div>
      {file && <p className="mt-2">Fichier sélectionné : {file.name}</p>}
    </div>
  );
};

export default ImportData;
