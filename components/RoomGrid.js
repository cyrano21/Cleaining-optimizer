export default function RoomGrid({
  rooms,
  onRoomClick,
  toggleStar,
  toggleRoomChecked,
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
            } ${room.checked ? "border-4 border-blue-500" : ""}`}
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
              <button
                className={`mt-1 w-full text-xs py-1 px-2 rounded ${
                  room.checked ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRoomChecked(room.number);
                }}
              >
                {room.checked ? "Contrôlée" : "Marquer comme contrôlée"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
