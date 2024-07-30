"use client";

import React, { useState, useEffect, useRef } from "react";
import { createWorker } from "tesseract.js";
import { getColorFromImage } from "./colorDetection"; // Vous devrez implémenter cette fonction

const HotelCleaningOptimizer = () => {
  const [rooms, setRooms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [distribution, setDistribution] = useState({});
  const [report, setReport] = useState({});
  const [selectedRooms, setSelectedRooms] = useState([]);
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
  const [simulationData, setSimulationData] = useState({
    departures: 0,
    stays: 0,
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    initializeRooms();
    loadStaffFromLocalStorage();
  }, []);

  useEffect(() => {
    updateReport();
  }, [rooms, distribution]);

  const initializeRooms = () => {
    const newRooms = [];
    for (let floor = 1; floor <= 6; floor++) {
      for (let room = 1; room <= 20; room++) {
        if ((floor === 1 && room === 13) || (floor === 6 && room === 16))
          continue;
        const roomNumber = floor * 100 + room;
        newRooms.push({
          number: roomNumber,
          type: roomNumber <= 320 ? "TWTW" : "KING",
          status: "clean",
          isStarred: false,
          isBarred: false,
          isControlled: false,
          notes: "",
          lateDeparture: null,
        });
      }
    }
    setRooms(newRooms);
  };





  const loadStaffFromLocalStorage = () => {
    const savedStaff = JSON.parse(localStorage.getItem("hotelStaff")) || [];
    setStaff(savedStaff);
  };

  const saveStaffToLocalStorage = (newStaff) => {
    localStorage.setItem("hotelStaff", JSON.stringify(newStaff));
  };


  const toggleRoomSelection = (roomNumber) => {
    setSelectedRooms((prev) =>
      prev.includes(roomNumber)
        ? prev.filter((num) => num !== roomNumber)
        : [...prev, roomNumber]
    );
  };

  const handleRoomAction = (action) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (selectedRooms.includes(room.number)) {
          switch (action) {
            case "departure":
              return { ...room, status: "departure" };
            case "stayover":
              return { ...room, status: "stay" };
            case "clean":
              return {
                ...room,
                status: "clean",
                isControlled: false,
                isStarred: false,
              };
            case "dnd":
              return { ...room, notes: room.notes + " DND" };
            case "refused":
              return { ...room, notes: room.notes + " Refus" };
            case "control":
              return { ...room, isControlled: true };
            case "star":
              return { ...room, isStarred: !room.isStarred };
            case "bar":
              return { ...room, isBarred: !room.isBarred };
            default:
              return room;
          }
        }
        return room;
      })
    );
    setSelectedRooms([]);
  };

  const addStaff = () => {
    const name = document.getElementById("staffName").value;
    const contract = document.getElementById("staffContract").value;
    const floor = document.getElementById("staffFloor").value;
    if (name && contract) {
      const newStaff = [...staff, { name, contract, preferredFloor: floor }];
      setStaff(newStaff);
      saveStaffToLocalStorage(newStaff);
      document.getElementById("staffName").value = "";
      document.getElementById("staffFloor").value = "";
    }
  };

  const removeStaff = (name) => {
    const newStaff = staff.filter((employee) => employee.name !== name);
    setStaff(newStaff);
    saveStaffToLocalStorage(newStaff);
  };

  const distributeRooms = () => {
    const newDistribution = {};
    staff.forEach((employee) => {
      newDistribution[employee.name] = { departures: [], stays: [], total: 0 };
    });

    const departures = rooms.filter(
      (room) => room.status === "departure" && !room.isBarred
    );
    const stays = rooms.filter(
      (room) => room.status === "stay" && !room.isBarred
    );

    const assignRoom = (room, employeeName) => {
      if (room.status === "departure") {
        newDistribution[employeeName].departures.push(room.number);
        newDistribution[employeeName].total += 3;
      } else {
        newDistribution[employeeName].stays.push(room.number);
        newDistribution[employeeName].total += room.isStarred ? 2 : 1;
      }
    };

    const sortedStaff = [...staff].sort((a, b) => {
      if (a.contract === "6" && b.contract === "5") return -1;
      if (a.contract === "5" && b.contract === "6") return 1;
      return 0;
    });

    [...departures, ...stays].forEach((room) => {
      const availableStaff = sortedStaff.filter((employee) => {
        const maxRooms = employee.contract === "6" ? 18 : 15;
        return newDistribution[employee.name].total < maxRooms;
      });

      if (availableStaff.length === 0) return;

      const preferredEmployee = availableStaff.find(
        (employee) =>
          employee.preferredFloor &&
          Math.floor(room.number / 100) === parseInt(employee.preferredFloor)
      );

      if (preferredEmployee) {
        assignRoom(room, preferredEmployee.name);
      } else {
        const leastBusyEmployee = availableStaff.reduce((min, employee) =>
          newDistribution[employee.name].total < newDistribution[min.name].total
            ? employee
            : min
        );
        assignRoom(room, leastBusyEmployee.name);
      }
    });

    setDistribution(newDistribution);
  };

  const updateReport = () => {
    const newReport = {
      totalRooms: rooms.filter(
        (room) =>
          !room.isBarred &&
          (room.status === "departure" || room.status === "stay")
      ).length,
      departures: rooms.filter(
        (room) => room.status === "departure" && !room.isBarred
      ).length,
      stays: rooms.filter((room) => room.status === "stay" && !room.isBarred)
        .length,
      dndRefusals: rooms.filter(
        (room) =>
          (room.notes.includes("DND") || room.notes.includes("Refus")) &&
          !room.isBarred
      ).length,
      controlled: rooms.filter((room) => room.isControlled && !room.isBarred)
        .length,
      lateDepartures: rooms.filter(
        (room) => room.lateDeparture && !room.isBarred
      ).length,
      sheetChanges: rooms.filter((room) => room.isStarred && !room.isBarred)
        .length,
    };
    setReport(newReport);
  };

  const handleSimulation = () => {
    const { departures, stays } = simulationData;
    let departureCount = 0;
    let stayCount = 0;

    setRooms((prevRooms) =>
      prevRooms.map((room) => {
        if (departureCount < departures && !room.isBarred) {
          departureCount++;
          return { ...room, status: "departure" };
        } else if (stayCount < stays && !room.isBarred) {
          stayCount++;
          return { ...room, status: "stay" };
        } else {
          return { ...room, status: "clean" };
        }
      })
    );
  };

  const resetApplication = () => {
    initializeRooms();
    setDistribution({});
    setReport({});
    setSelectedRooms([]);
    setSimulationData({ departures: 0, stays: 0 });
  };


  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      if (uploadedFile.type === "application/pdf") {
        setPreviewUrl(URL.createObjectURL(uploadedFile));
      } else {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target.result);
        reader.readAsDataURL(uploadedFile);
      }
    }
  };

  const handleScan = async () => {
    if (!file) {
      alert("Veuillez d'abord télécharger un fichier.");
      return;
    }

    let imageData;
    if (file.type === "application/pdf") {
      // Convertir la première page du PDF en image
      const pdf = await pdfjs.getDocument(previewUrl).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport: viewport }).promise;
      imageData = canvas;
    } else {
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);
      imageData = canvas;
    }

    const newRooms = await Promise.all(
      rooms.map(async (room) => {
        const color = await getColorFromImage(imageData, room.number);
        let status = "clean";
        if (color === "orange") status = "departure";
        else if (color === "green") status = "stay";

        const notes = await extractTextFromImage(imageData, room.number);

        return { ...room, status, notes };
      })
    );

    setRooms(newRooms);
    alert("Scan terminé");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
        Hôtel Cleaning Optimizer
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white shadow-lg rounded-lg p-6 col-span-1">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Simulation de rapport
          </h2>
          <div className="mt-8 bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Scan de Rapport
            </h2>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,application/pdf"
              className="hidden"
            />
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => fileInputRef.current.click()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Télécharger un fichier
              </button>
              <button
                onClick={handleScan}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Scanner le document
              </button>
            </div>
            {previewUrl && (
              <div className="mt-4">
                <h3 className="text-xl font-bold mb-2">Prévisualisation</h3>
                {file.type === "application/pdf" ? (
                  <Document
                    file={previewUrl}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  >
                    <Page pageNumber={pageNumber} />
                  </Document>
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-auto"
                  />
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="departures"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre de départs
              </label>
              <input
                type="number"
                id="departures"
                value={simulationData.departures}
                onChange={(e) =>
                  setSimulationData({
                    ...simulationData,
                    departures: parseInt(e.target.value),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label
                htmlFor="stays"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre de recouches
              </label>
              <input
                type="number"
                id="stays"
                value={simulationData.stays}
                onChange={(e) =>
                  setSimulationData({
                    ...simulationData,
                    stays: parseInt(e.target.value),
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>
          <button
            onClick={handleSimulation}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Simuler le rapport
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 col-span-2">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            État des chambres
          </h2>
          <div className="grid grid-cols-3 gap-2 h-[calc(100vh-200px)] overflow-y-auto">
            {rooms.map((room) => (
              <div
                key={room.number}
                className="flex flex-col border border-gray-300 rounded-lg overflow-hidden"
              >
                <div
                  className={`p-2 text-center font-bold cursor-pointer ${
                    room.status === "departure"
                      ? "bg-orange-500"
                      : room.status === "stay"
                      ? "bg-green-500"
                      : "bg-white"
                  } ${room.status !== "clean" ? "text-white" : ""}`}
                  onClick={() => toggleRoomSelection(room.number)}
                >
                  {room.number}
                </div>
                <div className="flex flex-col p-1 text-xs">
                  <div>{room.type}</div>
                  <div className="bg-yellow-100 p-1 rounded mt-1">
                    {room.notes}
                  </div>
                  <button
                    className="bg-blue-500 text-white rounded px-2 py-1 text-xs mt-1"
                    onClick={() => handleRoomAction("star")}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Assignation manuelle des chambres
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <select
              id="roomStatusSelect"
              className="w-full bg-gray-200 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              onChange={(e) => handleRoomAction(e.target.value)}
            >
              <option value="departure">Départ (Orange)</option>
              <option value="stayover">Recouche (Vert)</option>
              <option value="clean">Libre et Propre (Blanc)</option>
            </select>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="changeSheets"
                name="changeSheets"
                className="mr-2 leading-tight"
                onChange={() => handleRoomAction("star")}
              />
              <label htmlFor="changeSheets" className="text-sm">
                Changement de draps (3ème jour)
              </label>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              id="roomNotes"
              placeholder="Notes (ex: LP)"
              className="w-full bg-gray-200 text-gray-700 border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            />
            <input
              type="text"
              id="lateCheckout"
              placeholder="Départ tardif (ex: 14:00)"
              className="w-full bg-gray-200 text-gray-700 border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleRoomAction("control")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Assigner
            </button>
            <button
              onClick={() => setSelectedRooms([])}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Effacer sélection
            </button>
            <button
              onClick={() => handleRoomAction("control")}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Marquer contrôlée
            </button>
          </div>
          <button
            onClick={() => handleRoomAction("star")}
            className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-300"
          >
            Ajouter une étoile (Recouche avec changement de draps)
          </button>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Liste du Personnel
          </h2>
          <p className="text-lg font-semibold mb-4">
            Nombre total d'employés:{" "}
            <span id="totalEmployees">{staff.length}</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              id="staffName"
              placeholder="Nom de l'employé"
              className="w-full bg-gray-200 text-gray-700 border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            />
            <select
              id="staffContract"
              className="w-full bg-gray-200 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            >
              <option value="5">Contrat 5h</option>
              <option value="6">Contrat 6h</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="number"
              id="staffFloor"
              placeholder="Étage privilégié"
              min="1"
              max="6"
              className="w-full bg-gray-200 text-gray-700 border border-gray-300 rounded py-2 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            />
            <button
              onClick={addStaff}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
              Ajouter Employé
            </button>
          </div>
          <div id="staffList" className="space-y-4 overflow-y-auto max-h-64">
            {staff.map((employee, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-100 p-2 rounded"
              >
                <span>
                  {employee.name} ({employee.contract}h, Étage:{" "}
                  {employee.preferredFloor || "N/A"})
                </span>
                <button
                  onClick={() => removeStaff(employee.name)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Distribution des Tâches
          </h2>
          <button
            onClick={distributeRooms}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 mb-4"
          >
            Distribuer les Chambres
          </button>
          <div
            id="taskDistribution"
            className="space-y-4 overflow-y-auto max-h-64"
          >
            {Object.entries(distribution).map(([name, tasks]) => (
              <div key={name} className="bg-gray-100 p-2 rounded">
                <h3 className="font-bold">{name}</h3>
                <p>
                  Départs: {tasks.departures.join(", ")} (
                  {tasks.departures.length})
                </p>
                <p>
                  Recouches: {tasks.stays.join(", ")} ({tasks.stays.length})
                </p>
                <p>Total: {tasks.total}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Rapport Journalier
          </h2>
          <div id="dailyReport" className="space-y-4 overflow-y-auto max-h-64">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Résumé</h3>
                <p className="mb-1">
                  <span className="font-semibold">
                    Total des chambres à nettoyer:
                  </span>{" "}
                  {report.totalRooms}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Départs:</span>{" "}
                  {report.departures}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">Recouches:</span>{" "}
                  {report.stays}
                </p>
                <p className="mb-1">
                  <span className="font-semibold">DND + Refus:</span>{" "}
                  {report.dndRefusals}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2">Contrôle</h3>
                <p className="mb-1">
                  <span className="font-semibold">Total contrôlé:</span>{" "}
                  {report.controlled}
                </p>
              </div>
            </div>
            <div className="mt-4 bg-yellow-100 p-4 rounded-lg">
              <h3 className="font-bold text-lg mb-2">Détails</h3>
              <p className="mb-1">
                <span className="font-semibold">Départs tardifs:</span>{" "}
                {report.lateDepartures}
              </p>
              <p className="mb-1">
                <span className="font-semibold">Changements de draps:</span>{" "}
                {report.sheetChanges}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleScan}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
          Scanner un rapport
        </button>
      </div>

      <button
        onClick={resetApplication}
        className="mt-8 w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        Réinitialiser l'Application
      </button>
    </div>
  );
};

export default HotelCleaningOptimizer;
