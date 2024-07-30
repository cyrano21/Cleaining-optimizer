"use client";

import React, { useMemo } from "react";
import { useAppContext } from "../context/AppContext";

export default function DailyReport() {
  const { rooms } = useAppContext();

  const report = useMemo(() => {
    const totalRooms = rooms.length;
    const departures = rooms.filter(
      (room) => room.status === "departure"
    ).length;
    const stayovers = rooms.filter((room) => room.status === "stayover").length;
    const dndRefusals = rooms.filter(
      (room) => room.status === "dnd" || room.status === "refusal"
    ).length;
    const vacant = rooms.filter(
      (room) => room.status === "blank" || room.status === ""
    ).length;
    const outOfOrder = rooms.filter(
      (room) => room.status === "out_of_order"
    ).length;

    return {
      totalRooms,
      departures,
      stayovers,
      dndRefusals,
      vacant,
      outOfOrder,
    };
  }, [rooms]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 col-span-2">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Rapport Journalier
      </h2>
      <p>Total des chambres: {report.totalRooms}</p>
      <p>Départs: {report.departures}</p>
      <p>Recouches: {report.stayovers}</p>
      <p>DND/Refus: {report.dndRefusals}</p>
      <p>Chambres vides: {report.vacant}</p>
      <p>Hors service: {report.outOfOrder}</p>
    </div>
  );
}
