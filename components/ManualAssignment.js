export default function ManualAssignment({
  staff,
  rooms,
  assignRoom,
  manualAssignmentActive,
  setManualAssignmentActive,
  selectedEmployee,
  setSelectedEmployee,
}) {
  const toggleManualAssignment = () => {
    setManualAssignmentActive((prev) => !prev);
    if (!manualAssignmentActive) {
      setSelectedEmployee(""); // Réinitialiser l'employé sélectionné lors de l'activation
    }
  };

  const handleRoomClick = (roomNumber) => {
    if (manualAssignmentActive && selectedEmployee) {
      assignRoom(roomNumber, selectedEmployee);
    }
  };

  const getNotes = (room) => {
    const notes = [];
    if (room.state === "Départ" && room.notes?.includes("Départ tardif")) {
      notes.push("Départ tardif");
    } else if (room.state === "Recouche") {
      if (room.notes?.includes("DND")) notes.push("DND");
      if (room.notes?.includes("Refus")) notes.push("Refus");
    }
    return notes;
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-indigo-500">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">
        Assignation manuelle
      </h2>
      {/* ... (le reste du code reste inchangé) ... */}
      <div className="space-y-4">
        {staff.map((staffMember) => (
          <div key={staffMember.name}>
            <span className="font-bold text-lg">{staffMember.name}</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2">
              {rooms
                .filter((room) => room.assignedTo === staffMember.name)
                .map((room) => (
                  <div
                    key={room.number}
                    className={`p-2 border rounded ${
                      room.state === "Départ"
                        ? "bg-pink-100"
                        : room.state === "Recouche"
                        ? "bg-green-100"
                        : "bg-white"
                    } ${room.checked ? "border-2 border-blue-500" : ""}`}
                    onClick={() => handleRoomClick(room.number)}
                  >
                    <div className="font-semibold">{room.number}</div>
                    {room.state === "Recouche" && room.star && (
                      <span className="text-yellow-500">★</span>
                    )}
                    <div className="text-xs mt-1">
                      {getNotes(room).map((note) => (
                        <span
                          key={note}
                          className="mr-1 bg-gray-200 px-1 rounded"
                        >
                          {note}
                        </span>
                      ))}
                    </div>
                    {room.checked && (
                      <div className="text-xs text-blue-500 mt-1">
                        Contrôlée
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
