import React, { useState } from "react";

const SimulationForm = ({ onSimulate }) => {
  const [departures, setDepartures] = useState(0);
  const [stays, setStays] = useState(0);
  const [lateDepartures, setLateDepartures] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSimulate({ departures, stays, lateDepartures });
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Simulation de rapport
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="departures"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre de départs
            </label>
            <input
              type="number"
              id="departures"
              value={departures}
              onChange={(e) => setDepartures(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label
              htmlFor="stays"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre de recouches
            </label>
            <input
              type="number"
              id="stays"
              value={stays}
              onChange={(e) => setStays(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label
              htmlFor="lateDepartures"
              className="block text-sm font-medium text-gray-700"
            >
              Départs tardifs
            </label>
            <input
              type="number"
              id="lateDepartures"
              value={lateDepartures}
              onChange={(e) => setLateDepartures(parseInt(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Simuler le rapport
        </button>
      </form>
    </div>
  );
};

export default SimulationForm;
