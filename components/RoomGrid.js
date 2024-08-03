import React from "react";
import PropTypes from "prop-types";

export default function RoomGrid({
  rooms,
  onRoomClick,
  toggleStar,
  toggleRoomChecked,
  handleNoteChange,
  manualAssignmentActive,
  selectedEmployee,
}) {
  const getNoteOptions = (room) => {
    if (room.state === "Départ") {
      return ["Départ tardif"];
    } else if (room.state === "Recouche") {
      return ["DND", "Refus"];
    }
    return [];
  };

  const handleRoomClickInternal = (e, room) => {
    // Vérifier si le clic provient d'un élément interactif
    if (
      e.target.tagName === "INPUT" ||
      e.target.tagName === "BUTTON" ||
      e.target.tagName === "SELECT"
    ) {
      return; // Ne rien faire si le clic vient d'un input, bouton ou select
    }
    onRoomClick(room.number);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-2 sm:p-3 md:p-4 border-t-4 border-indigo-500">
      <h2 className="text-lg sm:text-xl font-bold mb-2 text-indigo-600">
        Chambres
      </h2>
      {manualAssignmentActive && selectedEmployee && (
        <p className="text-sm text-indigo-600 mb-1">
          Assignation : {selectedEmployee}
        </p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1 sm:gap-2 overflow-y-auto max-h-[calc(100vh-200px)]">
        {rooms.map((room) => (
          <div
            key={room.number}
            className={`flex flex-col border border-gray-300 rounded-lg overflow-hidden ${
              room.state === "Départ"
                ? "bg-pink-200"
                : room.state === "Recouche"
                ? "bg-green-200"
                : "bg-white"
            } ${room.checked ? "border-2 border-blue-500" : ""}
            ${
              manualAssignmentActive && !room.assignedTo ? "cursor-pointer" : ""
            }
            ${
              room.assignedTo === selectedEmployee
                ? "ring-2 ring-indigo-500"
                : ""
            }`}
            onClick={(e) => handleRoomClickInternal(e, room)}
          >
            <div className="p-1 sm:p-2 text-center font-bold text-xs sm:text-sm">
              {room.number}
            </div>
            <div className="flex-grow p-1 sm:p-2 text-xs">
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs sm:text-sm text-gray-600 truncate">
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
              <div className="mt-1 space-y-1">
                {getNoteOptions(room).map((note) => (
                  <label key={note} className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={room.notes?.includes(note) || false}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleNoteChange(room.number, note, e.target.checked);
                      }}
                      className="mr-1 h-3 w-3"
                    />
                    <span className="truncate">{note}</span>
                  </label>
                ))}
              </div>
              {(room.state === "Départ" || room.state === "Recouche") && (
                <button
                  className={`mt-1 w-full text-xs py-1 px-1 rounded ${
                    room.checked ? "bg-blue-500 text-white" : "bg-gray-200"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRoomChecked(room.number);
                  }}
                >
                  {room.checked ? "Contrôlée" : "Contrôler"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Validation des props
RoomGrid.propTypes = {
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      number: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      type: PropTypes.string,
      notes: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
      assignedTo: PropTypes.string,
      checked: PropTypes.bool.isRequired,
      star: PropTypes.bool,
    })
  ).isRequired,
  onRoomClick: PropTypes.func.isRequired,
  toggleStar: PropTypes.func.isRequired,
  toggleRoomChecked: PropTypes.func.isRequired,
  handleNoteChange: PropTypes.func.isRequired,
  manualAssignmentActive: PropTypes.bool.isRequired,
  selectedEmployee: PropTypes.string.isRequired,
};
