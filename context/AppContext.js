"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext();

const generateRooms = () => {
  const rooms = [];
  for (let floor = 1; floor <= 6; floor++) {
    for (let room = 1; room <= 20; room++) {
      if (floor === 6 && room === 16) continue; // Pas de chambre 616
      const roomNumber = floor * 100 + room;
      rooms.push({
        number: roomNumber,
        status: "",
        color: "",
        type: roomNumber < 320 ? "TWTW" : "KING",
        notes: [],
        lateCheckout: "",
        changeSheets: false,
        controlled: false,
        star: false,
      });
    }
  }
  return rooms;
};

export const AppProvider = ({ children }) => {
  const [rooms, setRooms] = useState(generateRooms());
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedStaff = localStorage.getItem("hotelStaff");
      if (storedStaff) {
        setStaff(JSON.parse(storedStaff));
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{ rooms, setRooms, staff, setStaff }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
