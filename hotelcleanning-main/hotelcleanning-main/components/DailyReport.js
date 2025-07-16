// components/DailyReport.js
import React from "react";

export default function DailyReport({ rooms, selectedNote }) {
  const totalRooms = rooms.length;
  const departures = rooms.filter((room) => room.state === "Départ").length;
  const recouches = rooms.filter((room) => room.state === "Recouche").length;
  const dndOrRefus = rooms.filter(
    (room) =>
      selectedNote[room.number] === "DND" ||
      selectedNote[room.number] === "Refus"
  ).length;
  const checkedRooms = rooms.filter((room) => room.checked).length;

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
            <p className="text-pink-500">Départs: {departures}</p>
            <p className="text-green-500">Recouches: {recouches}</p>
            <p className="text-red-500">DND/Refus: {dndOrRefus}</p>
            <p className="font-semibold">
              Total à nettoyer: {departures + recouches}
            </p>
            <p className="font-semibold text-blue-500">
              Chambres nettoyées: {checkedRooms}
            </p>
          </div>
        </div>
        <div className="w-1/2">
          <h3 className="text-lg font-semibold mb-2 text-indigo-500">
            Rapport détaillé
          </h3>
          <div className="space-y-2 text-lg">
            <p className="text-red-500">
              DND:{" "}
              {
                rooms.filter((room) => selectedNote[room.number] === "DND")
                  .length
              }
            </p>
            <p className="text-red-500">
              Refus:{" "}
              {
                rooms.filter((room) => selectedNote[room.number] === "Refus")
                  .length
              }
            </p>
            <p className="text-yellow-500">
              Départs tardifs:{" "}
              {
                rooms.filter(
                  (room) => selectedNote[room.number] === "Départ tardif"
                ).length
              }
            </p>
            <p className="text-blue-500">
              Libre et Propre:{" "}
              {
                rooms.filter((room) => selectedNote[room.number] === "LP")
                  .length
              }
            </p>
            <p className="text-purple-500">
              Changements de draps: {rooms.filter((room) => room.star).length}
            </p>
            <p className="text-green-500">
              Chambres contrôlées: {checkedRooms}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
