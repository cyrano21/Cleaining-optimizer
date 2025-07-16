// components/Controls.js
import React from "react";
import PropTypes from 'prop-types';

const Controls = ({ onReset, onGenerateReport }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-indigo-500">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">Contrôles</h2>
      <div className="flex justify-between">
        <button
          onClick={onReset}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Réinitialiser l&apos;application
        </button>
        <button
          onClick={onGenerateReport}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Générer le rapport
        </button>
      </div>
    </div>
  );
};

Controls.propTypes = {
  onReset: PropTypes.func.isRequired,
  onGenerateReport: PropTypes.func.isRequired,
};

export default Controls;
