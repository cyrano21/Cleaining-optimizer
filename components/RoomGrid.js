import React from "react";

const RoomGrid = ({ rooms, onRoomClick, onRoomAction }) => {
  const getRoomColor = (room) => {
    if (room.isBarred) return "bg-red-500";
    switch (room.status) {
      case "departure":
        return "bg-orange-500";
      case "stay":
        return room.isStarred ? "bg-yellow-500" : "bg-green-500";
      case "clean":
        return "bg-white";
      case "dnd":
        return "bg-purple-500";
      case "refused":
        return "bg-pink-500";
      default:
        return "bg-gray-200";
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        État des chambres
      </h2>
      <div className="grid grid-cols-3 gap-2 h-[calc(100vh-200px)] overflow-y-auto">
        {rooms.map((room) => (
          <button
            key={room.number}
            onClick={() => onRoomClick(room.number)}
            className={`${getRoomColor(
              room
            )} p-2 rounded-md shadow hover:shadow-lg transition-shadow duration-200 relative`}
          >
            <span className="font-bold">{room.number}</span>
            <span className="text-xs block">{room.type}</span>
            {room.isControlled && (
              <span className="absolute top-0 right-0 text-xs">✓</span>
            )}
            {room.isStarred && (
              <span className="absolute bottom-0 right-0 text-xs">⭐</span>
            )}
            {room.notes && (
              <span className="text-xs block truncate">{room.notes}</span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-4 space-x-2">
        <button
          onClick={() => onRoomAction("departure")}
          className="bg-orange-500 text-white px-2 py-1 rounded"
        >
          Départ
        </button>
        <button
          onClick={() => onRoomAction("stay")}
          className="bg-green-500 text-white px-2 py-1 rounded"
        >
          Recouche
        </button>
        <button
          onClick={() => onRoomAction("clean")}
          className="bg-white border border-gray-300 px-2 py-1 rounded"
        >
          Propre
        </button>
        <button
          onClick={() => onRoomAction("dnd")}
          className="bg-purple-500 text-white px-2 py-1 rounded"
        >
          DND
        </button>
        <button
          onClick={() => onRoomAction("refused")}
          className="bg-pink-500 text-white px-2 py-1 rounded"
        >
          Refus
        </button>
        <button
          onClick={() => onRoomAction("control")}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Contrôle
        </button>
        <button
          onClick={() => onRoomAction("star")}
          className="bg-yellow-500 text-white px-2 py-1 rounded"
        >
          ⭐
        </button>
        <button
          onClick={() => onRoomAction("bar")}
          className="bg-red-500 text-white px-2 py-1 rounded"
        >
          Barrer
        </button>
      </div>
    </div>
  );
};

export default RoomGrid;
