// components/DailyReport.js

import React, { useMemo } from "react";
import PropTypes from "prop-types";

export default function DailyReport({ rooms }) {
  const reportData = useMemo(() => {
    const departures = rooms.filter((room) => room.state === "Départ");
    const recouches = rooms.filter((room) => room.state === "Recouche");
    const dnd = recouches.filter((room) => room.notes?.includes("DND")).length;
    const refus = recouches.filter((room) =>
      room.notes?.includes("Refus")
    ).length;
    const departsTardifs = departures.filter((room) =>
      room.notes?.includes("Départ tardif")
    ).length;
    const libreEtPropre = recouches.filter((room) =>
      room.notes?.includes("LP")
    ).length;
    const changementsdraps = recouches.filter((room) => room.star).length;
    const checkedRooms = rooms.filter((room) => room.checked).length;

    return {
      departures: departures.length,
      recouches: recouches.length,
      dndOrRefus: dnd + refus,
      checkedRooms,
      dnd,
      refus,
      departsTardifs,
      libreEtPropre,
      changementsdraps,
    };
  }, [rooms]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-indigo-500">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">
        Rapport journalier
      </h2>
      <div className="flex space-x-4">
        <div className="w-1/2">
          <h3 className="text-lg font-semibold mb-2 text-indigo-500">
            Rapport strict
          </h3>
          <div className="space-y-2 text-lg">
            <p className="font-bold text-indigo-600">
              Date: {new Date().toLocaleDateString()}
            </p>
            <p className="text-pink-500">Départs: {reportData.departures}</p>
            <p className="text-green-500">Recouches: {reportData.recouches}</p>
            <p className="text-red-500">DND/Refus: {reportData.dndOrRefus}</p>
            <p className="font-semibold">
              Total à nettoyer: {reportData.departures + reportData.recouches}
            </p>
            <p className="font-semibold text-blue-500">
              Chambres nettoyées: {reportData.checkedRooms}
            </p>
          </div>
        </div>
        <div className="w-1/2">
          <h3 className="text-lg font-semibold mb-2 text-indigo-500">
            Rapport détaillé
          </h3>
          <div className="space-y-2 text-lg">
            <p className="text-red-500">DND: {reportData.dnd}</p>
            <p className="text-red-500">Refus: {reportData.refus}</p>
            <p className="text-yellow-500">
              Départs tardifs: {reportData.departsTardifs}
            </p>
            <p className="text-blue-500">
              Libre et Propre: {reportData.libreEtPropre}
            </p>
            <p className="text-purple-500">
              Changements de draps: {reportData.changementsdraps}
            </p>
            <p className="text-green-500">
              Chambres contrôlées: {reportData.checkedRooms}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

DailyReport.propTypes = {
  rooms: PropTypes.array.isRequired,
};
