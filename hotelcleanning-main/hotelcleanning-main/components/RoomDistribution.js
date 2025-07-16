// components/RoomDistribution.js
import React, { useState } from "react";
import PropTypes from 'prop-types';

const RoomDistribution = ({ rooms, setRooms, staffList }) => {
  const [distributionList, setDistributionList] = useState([]);

  const distributeRooms = () => {
    const roomsToDistribute = rooms.filter(
      (room) =>
        (room.state === "Départ" || room.state === "Recouche") &&
        !room.assignedTo
    );
    const availableStaff = [...staffList];

    const updatedRooms = rooms.map((room) => {
      if (roomsToDistribute.includes(room)) {
        if (availableStaff.length > 0) {
          const staffIndex = Math.floor(Math.random() * availableStaff.length);
          const selectedStaff = availableStaff[staffIndex];

          // Préférence pour l'étage
          const preferredStaff = availableStaff.find(
            (staff) => staff.preferredFloor === room.number.charAt(0)
          );

          const assignedStaff = preferredStaff || selectedStaff;
          availableStaff.splice(availableStaff.indexOf(assignedStaff), 1);

          return { ...room, assignedTo: assignedStaff.name };
        }
      }
      return room;
    });

    setRooms(updatedRooms);
    setDistributionList(updatedRooms.filter((room) => room.assignedTo));
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-indigo-500">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600">
        Distribution des chambres
      </h2>
      <button
        onClick={distributeRooms}
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mb-4 transition duration-300"
      >
        Distribution automatique
      </button>
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {distributionList.map((room) => (
          <div
            key={room.number}
            className="flex justify-between items-center p-2 border-b"
          >
            <span>Chambre {room.number}</span>
            <span>Assignée à: {room.assignedTo}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

RoomDistribution.propTypes = {
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      number: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      assignedTo: PropTypes.string,
    })
  ).isRequired,
  setRooms: PropTypes.func.isRequired,
  staffList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default RoomDistribution;
