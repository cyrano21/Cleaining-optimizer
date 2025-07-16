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
import AdvancedFilters from "../components/AdvancedFilters";
import QualityAssurance from "../components/QualityAssurance";
import ThemeManager from "../components/ThemeManager";
import LiveStats from "../components/LiveStats";
import NotificationCenter from "../components/NotificationCenter";
import AuthenticationModal from "../components/AuthenticationModal";
import FemmeChambureView from "../components/FemmeChambureView";
import AnimatedTransitions, { AnimatedCard, PageTransition } from "../components/AnimatedTransitions";
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
    cleaned: false,
    controlled: false,
  },
  {
    number: "102",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "103",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "104",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "105",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "106",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "107",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "108",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "109",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "110",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "111",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "112",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "113",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "114",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "115",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "116",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "117",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "118",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "119",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "120",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  // Étage 2
  {
    number: "201",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "202",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "203",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "204",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "205",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "206",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "207",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "208",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "209",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "210",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "211",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "212",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "213",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "214",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "215",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "216",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "217",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "218",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "219",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "220",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  // Étage 3
  {
    number: "301",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "302",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "303",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "304",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "305",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "306",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "307",
    state: "Libre",
    type: "TWTW",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "308",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "309",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
  {
    number: "310",
    state: "Libre",
    type: "KING",
    notes: "",
    assignedTo: null,
    checked: false,
    cleaned: false,
    controlled: false,
  },
];

export default function HomePage() {
  const [rooms, setRooms] = useState(defaultRooms);
  const [staffList, setStaffList] = useState([]);
  const [selectedNote, setSelectedNote] = useState({});
  const [manualAssignmentActive, setManualAssignmentActive] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedDashboard, setSelectedDashboard] = useState("gouvernante");
  const [selectedFloor, setSelectedFloor] = useState("tous");
  const [userRole, setUserRole] = useState("gouvernante"); // Variable principale comme l'original
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [currentTheme, setCurrentTheme] = useState("default");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    // Simulation de chargement initial
    setTimeout(() => setIsLoading(false), 1500);
    
    // Charger les données sauvegardées au démarrage
    const savedRooms = localStorage.getItem("rooms");
    const savedStaff = localStorage.getItem("staff");
    const savedUserRole = localStorage.getItem("userRole");
    
    if (savedRooms) setRooms(JSON.parse(savedRooms));
    if (savedStaff) setStaffList(JSON.parse(savedStaff));
    if (savedUserRole) setUserRole(savedUserRole);
  }, []);

  useEffect(() => {
    // Sauvegarder les données à chaque changement
    if (isClient) {
      localStorage.setItem("rooms", JSON.stringify(rooms));
      localStorage.setItem("staff", JSON.stringify(staffList));
      localStorage.setItem("userRole", userRole);
    }
  }, [rooms, staffList, userRole, isClient]);

  useEffect(() => {
    // Mise à jour de l'heure en temps réel
    if (!isClient) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [isClient]);

  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleRoomClick = (roomNumber) => {
    if (manualAssignmentActive) {
      if (selectedEmployee) {
        assignRoom(roomNumber, selectedEmployee);
        addNotification(`Chambre ${roomNumber} assignée à ${selectedEmployee}`, "success");
      } else {
        addNotification("Veuillez sélectionner un employé avant d'assigner une chambre.", "warning");
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
            addNotification(`Chambre ${roomNumber} changée à ${newState}`, "info");
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
      addNotification(`Employé ${name} ajouté avec succès`, "success");
    } else {
      addNotification("Un employé avec ce nom existe déjà.", "error");
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

  const toggleCleaned = (roomNumber) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber ? { ...room, cleaned: !room.cleaned } : room
      )
    );
  };

  const toggleControlled = (roomNumber) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber ? { ...room, controlled: !room.controlled } : room
      )
    );
  };

  const handleNoteChange = (roomNumber, note) => {
    setSelectedNote((prev) => ({ ...prev, [roomNumber]: note }));
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.number === roomNumber ? { ...room, notes: note } : room
      )
    );
  };

  const handleImport = async (importedRooms) => {
    try {
      setRooms(importedRooms);
      addNotification(`${importedRooms.length} chambres importées avec succès`, "success");
    } catch (error) {
      console.error("Erreur lors de l'importation:", error);
      addNotification("Une erreur est survenue lors de l'importation du fichier.", "error");
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
      addNotification("Application réinitialisée", "info");
    }
  };

  const generateReport = () => {
    const report = {
      totalRooms: rooms.length,
      departures: rooms.filter((room) => room.state === "Départ").length,
      recouches: rooms.filter((room) => room.state === "Recouche").length,
      assignedRooms: rooms.filter((room) => room.assignedTo).length,
      cleanedRooms: rooms.filter((room) => room.cleaned).length,
      controlledRooms: rooms.filter((room) => room.controlled).length,
      staffCount: staffList.length,
    };

    console.log("Rapport généré:", report);
    addNotification("Rapport généré avec succès", "success");
    return report;
  };

  const downloadReport = () => {
    const report = generateReport();
    const reportData = {
      date: new Date().toLocaleDateString("fr-FR"),
      time: new Date().toLocaleTimeString("fr-FR"),
      summary: report,
      rooms: rooms.map(room => ({
        number: room.number,
        state: room.state,
        assignedTo: room.assignedTo,
        cleaned: room.cleaned,
        controlled: room.controlled,
        notes: room.notes
      })),
      staff: staffList
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport_hotel_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification("Rapport téléchargé avec succès", "success");
  };

  // Filtrer les chambres selon l'étage sélectionné et les filtres avancés
  const applyFilters = (roomsList, filters) => {
    let filtered = roomsList;
    
    // Filtre par étage
    if (selectedFloor !== "tous") {
      filtered = filtered.filter(room => room.number.startsWith(selectedFloor));
    }
    
    // Filtres avancés
    if (filters.state && filters.state !== "all") {
      filtered = filtered.filter(room => room.state === filters.state);
    }
    if (filters.cleaningStatus === "cleaned") {
      filtered = filtered.filter(room => room.cleaned);
    } else if (filters.cleaningStatus === "not_cleaned") {
      filtered = filtered.filter(room => !room.cleaned);
    }
    if (filters.controlStatus === "controlled") {
      filtered = filtered.filter(room => room.controlled);
    } else if (filters.controlStatus === "not_controlled") {
      filtered = filtered.filter(room => !room.controlled);
    }
    if (filters.assignedStatus === "assigned") {
      filtered = filtered.filter(room => room.assignedTo);
    } else if (filters.assignedStatus === "not_assigned") {
      filtered = filtered.filter(room => !room.assignedTo);
    }
    if (filters.assignedTo && filters.assignedTo !== "all") {
      filtered = filtered.filter(room => room.assignedTo === filters.assignedTo);
    }
    
    return filtered;
  };

  // Logique de filtrage selon l'original : userRole détermine tout
  const getFilteredRooms = () => {
    if (userRole === "gouvernante") {
      // Gouvernante voit toutes les chambres
      return rooms;
    } else {
      // Femme de chambre ne voit que ses chambres assignées
      return rooms.filter(room => room.assignedTo === userRole);
    }
  };

  const filteredRoomsByRole = getFilteredRooms();
  const filteredRooms = applyFilters(filteredRoomsByRole, activeFilters);

  // Filtrer les chambres selon la recherche
  const searchFilteredRooms = filteredRooms.filter(room => {
    if (!searchQuery) return true;
    return room.number.includes(searchQuery) || 
           (room.assignedTo && room.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())) ||
           room.notes.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleFiltersChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  const handleQualityUpdate = (roomNumber, qualityData) => {
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.number === roomNumber 
          ? { ...room, ...qualityData }
          : room
      )
    );
  };

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
  };

  // Obtenir les données du thème
  const themes = {
    default: {
      gradient: "from-pink-400 via-purple-500 to-indigo-600",
      headerGradient: "from-pink-500 via-purple-600 to-indigo-700",
    },
    dark: {
      gradient: "from-gray-900 via-purple-900 to-indigo-900",
      headerGradient: "from-gray-800 via-purple-800 to-indigo-800",
    },
    ocean: {
      gradient: "from-blue-400 via-cyan-500 to-teal-600",
      headerGradient: "from-blue-500 via-cyan-600 to-teal-700",
    },
    sunset: {
      gradient: "from-orange-400 via-red-500 to-pink-600",
      headerGradient: "from-orange-500 via-red-600 to-pink-700",
    },
    forest: {
      gradient: "from-green-400 via-emerald-500 to-teal-600",
      headerGradient: "from-green-500 via-emerald-600 to-teal-700",
    },
    luxury: {
      gradient: "from-yellow-400 via-yellow-500 to-orange-600",
      headerGradient: "from-yellow-500 via-yellow-600 to-orange-700",
    },
    minimal: {
      gradient: "from-gray-100 via-gray-200 to-gray-300",
      headerGradient: "from-gray-200 via-gray-300 to-gray-400",
    },
  };

  const currentThemeData = themes[currentTheme] || themes.default;

  return (
    <PageTransition isLoading={isLoading}>
      <AnimatedTransitions />
      
      {/* Application selon l'original : pas de modal complexe */}
      <div className={`min-h-screen bg-gradient-to-br ${currentThemeData.gradient}`}>
        {/* Gestionnaire de thème */}
        <ThemeManager 
          currentTheme={currentTheme} 
          onThemeChange={handleThemeChange} 
        />

        {/* Centre de notifications */}
        <NotificationCenter
          rooms={filteredRooms}
          staffList={staffList}
          notifications={notifications}
          setNotifications={setNotifications}
        />

        {/* Header avec fond gradient */}
        <div className={`bg-gradient-to-r ${currentThemeData.headerGradient} shadow-lg`}>
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-4xl font-bold text-white">
                Hôtel Cleaning Optimizer Pro
              </h1>
              <div className="text-right">
                <div className="text-white text-sm mb-1">
                  Rôle actuel : <strong>{userRole === "gouvernante" ? "Gouvernante" : userRole}</strong>
                </div>
              </div>
            </div>
            
            {/* Sélecteur de rôle simple comme l'original */}
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex flex-col items-center">
                <label className="text-white text-sm font-medium mb-2">Sélecteur de rôle</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  className="px-4 py-2 rounded-lg border-2 border-white bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
                >
                  <option value="gouvernante">👩‍💼 Gouvernante</option>
                  {staffList.map((staff) => (
                    <option key={staff.name} value={staff.name}>
                      🧹 {staff.name} (Étage {staff.preferredFloor})
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sélecteur d'étage seulement pour gouvernante */}
              {userRole === "gouvernante" && (
                <div className="flex flex-col items-center">
                  <label className="text-white text-sm font-medium mb-2">Filtre par étage</label>
                  <select
                    value={selectedFloor}
                    onChange={(e) => setSelectedFloor(e.target.value)}
                    className="px-4 py-2 rounded-lg border-2 border-white bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow-lg"
                  >
                    <option value="tous">Tous les étages</option>
                    <option value="2">2ème étage ({rooms.filter(r => r.number.startsWith('2')).length} chambres)</option>
                    <option value="3">3ème étage ({rooms.filter(r => r.number.startsWith('3')).length} chambres)</option>
                    <option value="4">4ème étage ({rooms.filter(r => r.number.startsWith('4')).length} chambres)</option>
                    <option value="5">5ème étage ({rooms.filter(r => r.number.startsWith('5')).length} chambres)</option>
                    <option value="6">6ème étage ({rooms.filter(r => r.number.startsWith('6')).length} chambres)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg animate-slide-in ${
              notification.type === "success"
                ? "bg-green-500 text-white"
                : notification.type === "error"
                ? "bg-red-500 text-white"
                : notification.type === "warning"
                ? "bg-yellow-500 text-white"
                : "bg-blue-500 text-white"
            }`}
          >
            {notification.message}
          </div>
        ))}
      </div>

        {/* Contenu principal - Conditionnel selon userRole comme l'original */}
        <div className="container mx-auto px-4 py-8">
          {userRole === "gouvernante" ? (
            /* Vue Gouvernante - Composants complets */
            <>
              {/* Statistiques en temps réel */}
              <LiveStats rooms={rooms} staffList={staffList} />

              {/* Filtres avancés */}
              <AdvancedFilters 
                rooms={rooms}
                staffList={staffList}
                onFiltersChange={handleFiltersChange}
                selectedDashboard={selectedDashboard}
              />

              {/* Première ligne - Import et Recherche */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <AnimatedCard delay={100}>
                  <div className="p-6">
                    <ImportData onImport={handleImport} />
                  </div>
                </AnimatedCard>
                <AnimatedCard delay={200}>
                  <div className="p-6">
                    <RoomSearch 
                      rooms={searchFilteredRooms} 
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                    />
                  </div>
                </AnimatedCard>
              </div>

              {/* Deuxième ligne - État des chambres (grande carte) */}
              <AnimatedCard delay={300} hoverEffect="hover-lift">
                <div className="p-6">
                  <RoomGrid
                    rooms={searchFilteredRooms}
                    onRoomClick={handleRoomClick}
                    toggleStar={toggleStar}
                    toggleCleaned={toggleCleaned}
                    toggleControlled={toggleControlled}
                    staffList={staffList}
                    handleNoteChange={handleNoteChange}
                    selectedNote={selectedNote}
                    manualAssignmentActive={manualAssignmentActive}
                    selectedEmployee={selectedEmployee}
                    selectedDashboard={selectedDashboard}
                  />
                </div>
              </AnimatedCard>

              {/* Troisième ligne - Gestion complète */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <AnimatedCard delay={400}>
                  <div className="p-6">
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
                </AnimatedCard>
                <AnimatedCard delay={500}>
                  <div className="p-6">
                    <StaffManagement staffList={staffList} addStaff={addStaff} />
                  </div>
                </AnimatedCard>
                <AnimatedCard delay={600}>
                  <div className="p-6">
                    <RoomDistribution
                      rooms={rooms}
                      setRooms={setRooms}
                      staffList={staffList}
                    />
                  </div>
                </AnimatedCard>
              </div>

              {/* Quatrième ligne - Rapports et Contrôles */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <AnimatedCard delay={700}>
                  <div className="p-6">
                    <DailyReport rooms={rooms} selectedNote={selectedNote} />
                  </div>
                </AnimatedCard>
                <AnimatedCard delay={800}>
                  <div className="p-6">
                    <Controls onReset={handleReset} onGenerateReport={generateReport} />
                  </div>
                </AnimatedCard>
              </div>

              {/* Cinquième ligne - Garantie Qualité */}
              <AnimatedCard delay={900} hoverEffect="hover-glow">
                <QualityAssurance
                  rooms={rooms}
                  staffList={staffList}
                  onQualityUpdate={handleQualityUpdate}
                />
              </AnimatedCard>
            </>
          ) : (
            /* Vue Femme de chambre - Interface limitée comme l'original */
            <>
              <AnimatedCard delay={100}>
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-indigo-600 mb-4">
                    🧹 Vos chambres assignées - {userRole}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Vous voyez uniquement les chambres qui vous sont assignées.
                  </p>
                  
                  {/* Grille filtrée pour cette femme de chambre */}
                  <RoomGrid
                    rooms={searchFilteredRooms}
                    onRoomClick={handleRoomClick}
                    toggleStar={toggleStar}
                    toggleCleaned={toggleCleaned}
                    toggleControlled={toggleControlled}
                    staffList={staffList}
                    handleNoteChange={handleNoteChange}
                    selectedNote={selectedNote}
                    manualAssignmentActive={false}
                    selectedEmployee={userRole}
                    selectedDashboard="femme_chambre"
                  />
                </div>
              </AnimatedCard>

              {/* Section d'erreurs simplifiée */}
              <AnimatedCard delay={200} className="mt-8">
                <div className="p-6">
                  <h3 className="text-xl font-bold text-red-600 mb-4">
                    🚨 Signaler une erreur
                  </h3>
                  <textarea
                    placeholder="Décrivez le problème rencontré..."
                    className="w-full p-3 border rounded-lg resize-none"
                    rows="3"
                  />
                  <button className="mt-3 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg">
                    Signaler l'erreur
                  </button>
                </div>
              </AnimatedCard>
            </>
          )}
        </div>

        {/* Bouton de téléchargement flottant */}
        <button
          onClick={downloadReport}
          className="fixed bottom-6 right-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 animate-float"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Télécharger le Rapport</span>
        </button>
      </div>
    </PageTransition>
  );
}