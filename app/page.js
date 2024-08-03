// app/page.js
"use client";

import React, { useState, useEffect } from "react";
import RoomGrid from "../components/RoomGrid";
import ImportData from "../components/ImportData";
import StaffManagement from "../components/StaffManagement";
import RoomDistribution from "../components/RoomDistribution";
import ManualAssignment from "../components/ManualAssignment";
import RoomSearch from "../components/RoomSearch";
import DailyReport from "../components/DailyReport";
import Controls from "../components/Controls";
import { analyzeRoomData } from "../utils/hotelUtils";

// Initialisation des chambres avec les données par défaut
const defaultRooms = [
  {
    number: "101",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "102",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "103",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "104",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "105",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "106",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "107",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "108",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "109",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "110",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "111",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "112",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "113",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "114",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "115",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "116",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "117",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "118",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "119",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "120",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "201",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "202",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "203",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "204",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "205",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "206",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "207",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "208",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "209",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "210",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "211",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "212",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "213",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "214",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "215",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "216",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "217",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "218",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "219",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "220",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "301",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "302",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "303",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "304",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "305",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "306",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "307",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "308",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "309",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "310",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "311",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "312",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "313",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "314",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "315",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "316",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "317",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "318",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "319",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "320",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "401",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "402",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "403",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "404",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "405",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "406",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "407",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "408",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "409",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "410",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "411",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "412",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "413",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "414",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "415",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "416",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "417",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "418",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "419",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "420",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "501",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "502",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "503",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "504",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "505",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "506",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "507",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "508",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "509",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "510",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "511",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "512",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "513",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "514",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "515",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "516",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "517",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "518",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "519",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "520",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "601",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "602",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "603",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "604",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "605",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "606",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "607",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "608",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "609",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "610",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "611",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "612",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "613",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "614",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "615",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "616",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "617",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "618",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "619",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
  {
    number: "620",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
  },
];

export default function HomePage() {
  const [rooms, setRooms] = useState(defaultRooms);
  const [staffList, setStaffList] = useState([]);
  const [selectedNote, setSelectedNote] = useState({});
  const [manualAssignmentActive, setManualAssignmentActive] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(""); // Ajout de cet état


  const toggleRoomChecked = (roomNumber) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber ? { ...room, checked: !room.checked } : room
      )
    );
  };

  useEffect(() => {
    // Charger les données sauvegardées au démarrage
    const savedRooms = localStorage.getItem("rooms");
    const savedStaff = localStorage.getItem("staff");
    if (savedRooms) setRooms(JSON.parse(savedRooms));
    if (savedStaff) setStaffList(JSON.parse(savedStaff));
  }, []);

  useEffect(() => {
    // Sauvegarder les données à chaque changement
    localStorage.setItem("rooms", JSON.stringify(rooms));
    localStorage.setItem("staff", JSON.stringify(staffList));
  }, [rooms, staffList]);

  const handleRoomClick = (roomNumber) => {
    if (manualAssignmentActive) {
      if (selectedEmployee) {
        assignRoom(roomNumber, selectedEmployee);
      } else {
        alert("Veuillez sélectionner un employé avant d'assigner une chambre.");
      }
    } else {
      setRooms((prevRooms) =>
        prevRooms.map((room) => {
          if (room.number === roomNumber) {
            let newState;
            switch (room.state) {
              case "Libre":
                newState = "Départ";
                break;
              case "Départ":
                newState = "Recouche";
                break;
              case "Recouche":
                newState = "Libre";
                break;
              default:
                newState = "Libre";
            }
            return { ...room, state: newState };
          }
          return room;
        })
      );
    }
  };
  const addStaff = (name, contractType, preferredFloor) => {
    if (!staffList.some((staff) => staff.name === name)) {
      setStaffList([...staffList, { name, contractType, preferredFloor }]);
    } else {
      alert("Un employé avec ce nom existe déjà.");
    }
  };

  const assignRoom = (roomNumber, employeeName) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber
          ? { ...room, assignedTo: employeeName }
          : room
      )
    );
  };

  const toggleStar = (roomNumber) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber ? { ...room, star: !room.star } : room
      )
    );
  };

  const handleNoteChange = (roomNumber, note) => {
    setSelectedNote((prev) => ({ ...prev, [roomNumber]: note }));
  };

  const handleImport = async (file) => {
    try {
      const importedRooms = await analyzeRoomData(file);
      setRooms(importedRooms);
    } catch (error) {
      console.error("Erreur lors de l'importation:", error);
      alert("Une erreur est survenue lors de l'importation du fichier.");
    }
  };

  const handleReset = () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir réinitialiser l'application ? Toutes les données seront perdues."
      )
    ) {
      setRooms(defaultRooms);
      setStaffList([]);
      setSelectedNote({});
      localStorage.clear();
    }
  };

  const generateReport = () => {
    const report = {
      totalRooms: rooms.length,
      departures: rooms.filter((room) => room.state === "Départ").length,
      recouches: rooms.filter((room) => room.state === "Recouche").length,
      assignedRooms: rooms.filter((room) => room.assignedTo).length,
      cleanedRooms: rooms.filter((room) => room.checked).length,
      staffCount: staffList.length,
    };

    console.log("Rapport généré:", report);
    alert("Rapport généré. Veuillez consulter la console pour les détails.");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-indigo-700">
        Hôtel Cleaning Optimizer Pro
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <ImportData onImport={handleImport} />
          <RoomGrid
            rooms={rooms}
            onRoomClick={handleRoomClick}
            toggleStar={toggleStar}
            staffList={staffList}
            handleNoteChange={handleNoteChange}
            selectedNote={selectedNote}
            manualAssignmentActive={manualAssignmentActive}
            selectedEmployee={selectedEmployee}
            toggleRoomChecked={toggleRoomChecked}
          />
          <ManualAssignment
            staff={staffList}
            rooms={rooms}
            assignRoom={assignRoom}
            manualAssignmentActive={manualAssignmentActive}
            setManualAssignmentActive={setManualAssignmentActive}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
          />
        </div>
        <div className="space-y-8">
          <StaffManagement staffList={staffList} addStaff={addStaff} />
          <RoomDistribution
            rooms={rooms}
            setRooms={setRooms}
            staffList={staffList}
          />
        </div>
        <div className="space-y-8">
          <RoomSearch rooms={rooms} />
          <DailyReport rooms={rooms} selectedNote={selectedNote} />
          <Controls onReset={handleReset} onGenerateReport={generateReport} />
        </div>
      </div>
    </div>
  );
}
