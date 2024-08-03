/* eslint-disable react/prop-types */
import React from "react";

export default function RoomGrid({
  rooms,
  onRoomClick,
  toggleStar,
  handleNoteChange,
  selectedNote,
  manualAssignmentActive,
  selectedEmployee,
}) {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-indigo-500">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">
        État des chambres
      </h2>
      {manualAssignmentActive && selectedEmployee && (
        <p className="mb-4 text-sm text-indigo-600">
          Assignation manuelle active pour : {selectedEmployee}
        </p>
      )}
      <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-96">
        {rooms.map((room) => (
          <div
            key={room.number}
            className={`flex flex-col border border-gray-300 rounded-lg overflow-hidden ${
              room.state === "Départ"
                ? "bg-pink-200"
                : room.state === "Recouche"
                ? "bg-green-200"
                : "bg-white"
            } ${manualAssignmentActive ? "cursor-pointer" : ""} ${
              room.assignedTo === selectedEmployee
                ? "ring-2 ring-indigo-500"
                : ""
            }`}
            onClick={() => onRoomClick(room.number)}
          >
            <div className="p-2 text-center font-bold">{room.number}</div>
            <div className="flex-grow p-2 text-xs">
              <div className="border-b border-gray-300">{room.type}</div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {room.assignedTo ||
                    (manualAssignmentActive ? "Assigner" : "")}
                </span>
                {room.state === "Recouche" && (
                  <span
                    className={`cursor-pointer ${
                      room.star ? "text-yellow-500" : "text-gray-300"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleStar(room.number);
                    }}
                  >
                    ★
                  </span>
                )}
              </div>
              <div className="mt-1">
                <select
                  className="w-full text-xs border rounded"
                  value={selectedNote[room.number] || ""}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleNoteChange(room.number, e.target.value);
                  }}
                >
                  <option value="">Sélectionner une note</option>
                  <option value="DND">DND</option>
                  <option value="Refus">Refus</option>
                  <option value="Départ tardif">Départ tardif</option>
                  <option value="LP">LP</option>
                  <option value="Autres">Autres</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
