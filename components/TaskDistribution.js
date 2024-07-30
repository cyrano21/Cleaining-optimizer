"use client";

import { useState, useEffect } from "react";

export default function TaskDistribution({
  rooms = [],
  staff = [],
  distribution = {},
  setDistribution,
}) {
  function distributeRooms() {
    if (!rooms.length || !staff.length) return;

    const newDistribution = {};
    const departures = rooms.filter((room) => room.status === "departure");
    const stayovers = rooms.filter((room) => room.status === "stayover");

    staff.forEach((employee) => {
      newDistribution[employee.name] = {
        departures: [],
        stayovers: [],
        total: 0,
      };
    });

    // Distribution des départs
    departures.forEach((room, index) => {
      const employeeIndex = index % staff.length;
      const employeeName = staff[employeeIndex].name;
      newDistribution[employeeName].departures.push(room.number);
      newDistribution[employeeName].total += 1;
    });

    // Distribution des recouches
    stayovers.forEach((room, index) => {
      const employeeIndex = index % staff.length;
      const employeeName = staff[employeeIndex].name;
      if (
        newDistribution[employeeName].total <
        (staff[employeeIndex].contract === "6h" ? 18 : 15)
      ) {
        newDistribution[employeeName].stayovers.push(room.number);
        newDistribution[employeeName].total += 1;
      }
    });

    setDistribution(newDistribution);
  }

  useEffect(() => {
    distributeRooms();
  }, [rooms, staff]);

  if (!distribution || Object.keys(distribution).length === 0) {
    return <div>Loading task distribution...</div>;
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 col-span-2">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Distribution des Tâches
      </h2>
      <button
        onClick={distributeRooms}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        Redistribuer les Chambres
      </button>
      <ul>
        {Object.entries(distribution).map(([name, tasks]) => (
          <li key={name} className="mt-4">
            <h3 className="text-xl font-bold">{name}</h3>
            <p>
              Départs: {tasks.departures.join(", ")} ({tasks.departures.length})
            </p>
            <p>
              Recouches: {tasks.stayovers.join(", ")} ({tasks.stayovers.length})
            </p>
            <p>Total: {tasks.total}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
