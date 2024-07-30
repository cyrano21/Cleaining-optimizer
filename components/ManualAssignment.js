import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";

const ManualAssignment = () => {
  const { rooms, setRooms } = useAppContext();
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [roomStatus, setRoomStatus] = useState("departure");
  const [changeSheets, setChangeSheets] = useState(false);
  const [roomNotes, setRoomNotes] = useState("");
  const [lateCheckout, setLateCheckout] = useState("");

  const handleAssign = () => {
    const updatedRooms = rooms.map((room) => {
      if (selectedRooms.includes(room.number)) {
        return {
          ...room,
          status: roomStatus,
          changeSheets,
          notes: roomNotes,
          lateCheckout,
        };
      }
      return room;
    });
    setRooms(updatedRooms);
    clearSelection();
  };

  const clearSelection = () => {
    setSelectedRooms([]);
    setRoomStatus("departure");
    setChangeSheets(false);
    setRoomNotes("");
    setLateCheckout("");
  };

  const markAsControlled = () => {
    const updatedRooms = rooms.map((room) => {
      if (selectedRooms.includes(room.number)) {
        return {
          ...room,
          controlled: true,
        };
      }
      return room;
    });
    setRooms(updatedRooms);
    clearSelection();
  };

  const addStarToRoom = () => {
    const updatedRooms = rooms.map((room) => {
      if (selectedRooms.includes(room.number)) {
        return {
          ...room,
          star: true,
        };
      }
      return room;
    });
    setRooms(updatedRooms);
    clearSelection();
  };

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8" w-tid="22">
      <div className="bg-white shadow-lg rounded-lg p-6" w-tid="23">
        <h2 className="text-2xl font-bold mb-4 text-gray-800" w-tid="24">
          Assignation manuelle des chambres
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" w-tid="25">
          <select
            id="roomStatusSelect"
            className="w-full bg-gray-200 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            value={roomStatus}
            onChange={(e) => setRoomStatus(e.target.value)}
            w-tid="26"
          >
            <option value="departure" w-tid="27">
              Départ (Orange)
            </option>
            <option value="stayover" w-tid="28">
              Recouche (Vert)
            </option>
            <option value="blank" w-tid="29">
              Libre et Propre (Blanc)
            </option>
          </select>
          <div className="flex items-center" w-tid="30">
            <input
              type="checkbox"
              id="changeSheets"
              name="changeSheets"
              className="mr-2 leading-tight"
              checked={changeSheets}
              onChange={() => setChangeSheets(!changeSheets)}
              w-tid="31"
            />
            <label for="changeSheets" className="text-sm" w-tid="32">
              Changement de draps (3ème jour)
            </label>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4" w-tid="33">
          <input
            type="text"
            id="roomNotes"
            placeholder="Notes (ex: LP)"
            className="w-full bg-gray-200 text-gray-700 border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            value={roomNotes}
            onChange={(e) => setRoomNotes(e.target.value)}
            w-tid="34"
          />
          <input
            type="text"
            id="lateCheckout"
            placeholder="Départ tardif (ex: 14:00)"
            className="w-full bg-gray-200 text-gray-700 border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            value={lateCheckout}
            onChange={(e) => setLateCheckout(e.target.value)}
            w-tid="35"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" w-tid="36">
          <button
            onClick={handleAssign}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            w-tid="37"
          >
            Assigner
          </button>
          <button
            onClick={clearSelection}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            w-tid="38"
          >
            Effacer sélection
          </button>
          <button
            onClick={markAsControlled}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            w-tid="39"
          >
            Marquer contrôlée
          </button>
        </div>
        <button
          onClick={addStarToRoom}
          className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          w-tid="40"
        >
          Ajouter une étoile (Recouche avec changement de draps)
        </button>
      </div>
    </div>
  );
};

export default ManualAssignment;
