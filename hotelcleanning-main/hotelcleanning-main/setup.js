const fs = require("fs");
const path = require("path");

// Structure des dossiers et fichiers à créer
const structure = {
  pages: {
    "index.js": `import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import RoomGrid from '../components/RoomGrid';
import StaffList from '../components/StaffList';
import TaskDistribution from '../components/TaskDistribution';
import DailyReport from '../components/DailyReport';
import SimulationForm from '../components/SimulationForm';

export default function Home() {
    const [rooms, setRooms] = useState([]);
    const [staff, setStaff] = useState([]);
    const [distribution, setDistribution] = useState({});
    const [report, setReport] = useState({});

    useEffect(() => {
        // Initialiser les chambres et le personnel
        initializeRooms();
        loadStaffFromLocalStorage();
    }, []);

    function initializeRooms() {
        // Logique d'initialisation des chambres
        const newRooms = [];
        for (let floor = 1; floor <= 6; floor++) {
            for (let room = 1; room <= 20; room++) {
                if (floor === 6 && room === 16) continue; // Pas de chambre 616
                const roomNumber = floor * 100 + room;
                newRooms.push({
                    number: roomNumber,
                    type: roomNumber <= 320 ? 'TWTW' : 'KING',
                    status: 'blank',
                    notes: '',
                    isStarred: false,
                    isBarred: false,
                    isControlled: false
                });
            }
        }
        setRooms(newRooms);
    }

    function loadStaffFromLocalStorage() {
        // Logique de chargement du personnel depuis le stockage local
        const savedStaff = JSON.parse(localStorage.getItem('hotelStaff')) || [];
        setStaff(savedStaff);
    }

    function resetApplication() {
        initializeRooms();
        setDistribution({});
        setReport({});
    }

    return (
        <Layout>
            <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">Hôtel Cleaning Optimizer</h1>
            <SimulationForm setRooms={setRooms} />
            <RoomGrid rooms={rooms} setRooms={setRooms} />
            <StaffList staff={staff} setStaff={setStaff} />
            <TaskDistribution rooms={rooms} staff={staff} distribution={distribution} setDistribution={setDistribution} />
            <DailyReport rooms={rooms} distribution={distribution} report={report} setReport={setReport} />
            <button onClick={resetApplication} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                Réinitialiser l'Application
            </button>
        </Layout>
    );
}`,
    api: {
      "rooms.js": `// API pour gérer les chambres`,
      "staff.js": `// API pour gérer le personnel`,
      "distribution.js": `// API pour la distribution des tâches`,
    },
  },
  components: {
    "Layout.js": `export default function Layout({ children }) {
    return (
        <>
            <div className="container mx-auto px-4 py-8">
                {children}
            </div>
        </>
    );
}`,
    "RoomGrid.js": `import { useState } from 'react';

export default function RoomGrid({ rooms, setRooms }) {
    const [selectedRooms, setSelectedRooms] = useState([]);

    function toggleRoomSelection(roomNumber) {
        setSelectedRooms(prev =>
            prev.includes(roomNumber)
                ? prev.filter(num => num !== roomNumber)
                : [...prev, roomNumber]
        );
    }

    function changeRoomStatus(roomNumber, newStatus) {
        setRooms(prev =>
            prev.map(room =>
                room.number === roomNumber ? { ...room, status: newStatus } : room
            )
        );
    }

    function toggleRoomStar(roomNumber) {
        setRooms(prev =>
            prev.map(room =>
                room.number === roomNumber ? { ...room, isStarred: !room.isStarred } : room
            )
        );
    }

    function toggleRoomBar(roomNumber) {
        setRooms(prev =>
            prev.map(room =>
                room.number === roomNumber ? { ...room, isBarred: !room.isBarred } : room
            )
        );
    }

    function addNote(roomNumber, note) {
        setRooms(prev =>
            prev.map(room =>
                room.number === roomNumber ? { ...room, notes: room.notes + ' ' + note } : room
            )
        );
    }

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 col-span-2">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">État des chambres</h2>
            <div className="grid grid-cols-3 gap-2 h-[calc(100vh-200px)] overflow-y-auto">
                {rooms.map(room => (
                    <div key={room.number} className="space-y-2">
                        <div
                            className={'flex flex-col border border-gray-300 rounded-lg overflow-hidden ' +
                                (selectedRooms.includes(room.number) ? 'bg-gray-200' : '')
                            }
                            onClick={() => toggleRoomSelection(room.number)}
                        >
                            <div className="p-2 text-center font-bold cursor-pointer bg-white">
                                {room.number} {room.type}
                            </div>
                            <div className="flex flex-col p-1 text-xs">
                                <div>{room.notes}</div>
                                {room.isStarred && <div className="bg-yellow-100 p-1 rounded mt-1">⭐</div>}
                                <button
                                    className="bg-blue-500 text-white rounded px-2 py-1 text-xs mt-1"
                                    onClick={() => changeRoomStatus(room.number, 'departure')}
                                >
                                    Départ
                                </button>
                                <button
                                    className="bg-green-500 text-white rounded px-2 py-1 text-xs mt-1"
                                    onClick={() => changeRoomStatus(room.number, 'stayover')}
                                >
                                    Recouche
                                </button>
                                <button
                                    className="bg-yellow-500 text-white rounded px-2 py-1 text-xs mt-1"
                                    onClick={() => toggleRoomStar(room.number)}
                                >
                                    ⭐
                                </button>
                                <button
                                    className="bg-red-500 text-white rounded px-2 py-1 text-xs mt-1"
                                    onClick={() => toggleRoomBar(room.number)}
                                >
                                    Barrer
                                </button>
                                <input
                                    type="text"
                                    placeholder="Ajouter une note"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            addNote(room.number, e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}`,
    "StaffList.js": `import { useState } from 'react';

export default function StaffList({ staff, setStaff }) {
    const [newStaffName, setNewStaffName] = useState('');
    const [newStaffContract, setNewStaffContract] = useState('6h');
    const [newStaffPreferredFloor, setNewStaffPreferredFloor] = useState('');

    function addStaff(e) {
        e.preventDefault();
        if (newStaffName) {
            const newStaff = {
                name: newStaffName,
                contract: newStaffContract,
                preferredFloor: newStaffPreferredFloor,
            };
            setStaff(prev => [...prev, newStaff]);
            localStorage.setItem('hotelStaff', JSON.stringify([...staff, newStaff]));
            setNewStaffName('');
            setNewStaffContract('6h');
            setNewStaffPreferredFloor('');
        }
    }

    function removeStaff(name) {
        setStaff(prev => prev.filter(s => s.name !== name));
        localStorage.setItem('hotelStaff', JSON.stringify(staff.filter(s => s.name !== name)));
    }

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 col-span-1">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Liste du Personnel</h2>
            <p>Nombre total d'employés: {staff.length}</p>
            <form onSubmit={addStaff}>
                <input
                    type="text"
                    value={newStaffName}
                    onChange={e => setNewStaffName(e.target.value)}
                    placeholder="Nom de l'employé"
                    className="w-full p-2 mb-2 border rounded"
                />
                <select
                    value={newStaffContract}
                    onChange={e => setNewStaffContract(e.target.value)}
                    className="w-full p-2 mb-2 border rounded"
                >
                    <option value="5h">5h</option>
                    <option value="6h">6h</option>
                </select>
                <input
                    type="text"
                    value={newStaffPreferredFloor}
                    onChange={e => setNewStaffPreferredFloor(e.target.value)}
                    placeholder="Étage préféré"
                    className="w-full p-2 mb-2 border rounded"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                >
                    Ajouter
                </button>
            </form>
            <ul>
                {staff.map((employee, index) => (
                    <li key={index} className="flex justify-between items-center mt-2">
                        <span>{employee.name}</span>
                        <span>Contrat: {employee.contract}</span>
                        <span>Étage préféré: {employee.preferredFloor || 'Non spécifié'}</span>
                        <button
                            onClick={() => removeStaff(employee.name)}
                            className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                            Supprimer
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}`,
    "TaskDistribution.js": `import { useState, useEffect } from 'react';

export default function TaskDistribution({ rooms, staff, distribution, setDistribution }) {
    function distributeRooms() {
        const newDistribution = {};
        const departures = rooms.filter(room => room.status === 'departure');
        const stayovers = rooms.filter(room => room.status === 'stayover');

        staff.forEach(employee => {
            newDistribution[employee.name] = { departures: [], stayovers: [], total: 0 };
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
            if (newDistribution[employeeName].total < (staff[employeeIndex].contract === '6h' ? 18 : 15)) {
                newDistribution[employeeName].stayovers.push(room.number);
                newDistribution[employeeName].total += 1;
            }
        });

        setDistribution(newDistribution);
    }

    useEffect(() => {
        distributeRooms();
    }, [rooms, staff]);

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 col-span-2">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Distribution des Tâches</h2>
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
                        <p>Départs: {tasks.departures.join(', ')} ({tasks.departures.length})</p>
                        <p>Recouches: {tasks.stayovers.join(', ')} ({tasks.stayovers.length})</p>
                        <p>Total: {tasks.total}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}`,
    "DailyReport.js": `import { useEffect } from 'react';

export default function DailyReport({ rooms, distribution, report, setReport }) {
    useEffect(() => {
        updateDailyReport();
    }, [rooms, distribution]);

    function updateDailyReport() {
        const newReport = {
            totalRooms: rooms.length,
            departures: rooms.filter(room => room.status === 'departure').length,
            stayovers: rooms.filter(room => room.status === 'stayover').length,
            dndRefusals: rooms.filter(room => room.notes.includes('DND') || room.notes.includes('Refus')).length,
            controlled: rooms.filter(room => room.isControlled).length,
        };
        setReport(newReport);
    }

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 col-span-2">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Rapport Journalier</h2>
            <p>Total des chambres: {report.totalRooms}</p>
            <p>Départs: {report.departures}</p>
            <p>Recouches: {report.stayovers}</p>
            <p>DND/Refus: {report.dndRefusals}</p>
            <p>Chambres contrôlées: {report.controlled}</p>
        </div>
    );
}`,
    "SimulationForm.js": `import { useState } from 'react';

export default function SimulationForm({ setRooms }) {
    const [departures, setDepartures] = useState(0);
    const [stayovers, setStayovers] = useState(0);

    function simulateReport() {
        setRooms(prev => {
            const newRooms = [...prev];
            let departureCount = 0;
            let stayoverCount = 0;
            newRooms.forEach((room, index) => {
                if (departureCount < departures) {
                    room.status = 'departure';
                    departureCount++;
                } else if (stayoverCount < stayovers) {
                    room.status = 'stayover';
                    stayoverCount++;
                } else {
                    room.status = 'blank';
                }
            });
            return newRooms;
        });
    }

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 col-span-1">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Simulation de rapport</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label htmlFor="departures" className="block text-sm font-medium text-gray-700">Nombre de départs</label>
                    <input
                        type="number"
                        id="departures"
                        name="departures"
                        min="0"
                        max="119"
                        value={departures}
                        onChange={e => setDepartures(parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <div>
                    <label htmlFor="stayovers" className="block text-sm font-medium text-gray-700">Nombre de recouches</label>
                    <input
                        type="number"
                        id="stayovers"
                        name="stayovers"
                        min="0"
                        max="119"
                        value={stayovers}
                        onChange={e => setStayovers(parseInt(e.target.value))}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
            </div>
            <button
                onClick={simulateReport}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
            >
                Simuler le rapport
            </button>
        </div>
    );
}`,
  },
  hooks: {
    "useRooms.js": `import { useState, useEffect } from 'react';

export function useRooms() {
    const [rooms, setRooms] = useState([]);

    useEffect(() => {
        // Logique d'initialisation des chambres
        const newRooms = [];
        for (let floor = 1; floor <= 6; floor++) {
            for (let room = 1; room <= 20; room++) {
                if (floor === 6 && room === 16) continue; // Pas de chambre 616
                const roomNumber = floor * 100 + room;
                newRooms.push({
                    number: roomNumber,
                    type: roomNumber <= 320 ? 'TWTW' : 'KING',
                    status: 'blank',
                    notes: '',
                    isStarred: false,
                    isBarred: false,
                    isControlled: false
                });
            }
        }
        setRooms(newRooms);
    }, []);

    return [rooms, setRooms];
}`,
    "useStaff.js": `import { useState, useEffect } from 'react';

export function useStaff() {
    const [staff, setStaff] = useState([]);

    useEffect(() => {
        // Logique de chargement du personnel depuis le stockage local
        const savedStaff = JSON.parse(localStorage.getItem('hotelStaff')) || [];
        setStaff(savedStaff);
    }, []);

    return [staff, setStaff];
}`,
  },
  context: {
    "AppContext.js": `import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppWrapper({ children }) {
    const [rooms, setRooms] = useState([]);
    const [staff, setStaff] = useState([]);

    return (
        <AppContext.Provider value={{ rooms, setRooms, staff, setStaff }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    return useContext(AppContext);
}`,
  },
  utils: {
    "roomUtils.js": `// Fonctions utilitaires pour les chambres`,
    "distributionUtils.js": `// Fonctions utilitaires pour la distribution`,
  },
  styles: {
    "globals.css": `@tailwind base;
@tailwind components;
@tailwind utilities;`,
  },
  "next.config.mjs": `const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
}

export default nextConfig`,
  "tailwind.config.js": `/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    plugins: [],
}`,
  "postcss.config.mjs": `module.exports = {
    plugins: {
        tailwindcss: {},
        autoprefixer: {},
    },
}`,
  ".gitignore": `node_modules
.next
out
`,
  "jsconfig.json": `{
    "compilerOptions": {
        "baseUrl": ".",
        "paths": {
            "@/components/*": ["components/*"],
            "@/pages/*": ["pages/*"],
            "@/hooks/*": ["hooks/*"],
            "@/context/*": ["context/*"],
            "@/utils/*": ["utils/*"]
        }
    }
}`,
  ".eslintrc.json": `{
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": [
        "next/core-web-vitals",
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaFeatures": {
            "jsx": true
        },
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "react"
    ],
    "rules": {
        "react/react-in-jsx-scope": "off"
    }
}`,
};

// Fonction pour créer les fichiers et dossiers
function createStructure(basePath, structure) {
  Object.keys(structure).forEach((key) => {
    const fullPath = path.join(basePath, key);
    if (typeof structure[key] === "string") {
      fs.writeFileSync(fullPath, structure[key]);
    } else {
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath);
      }
      createStructure(fullPath, structure[key]);
    }
  });
}

// Chemin de base (racine de l'application)
const basePath = "c:/Users/Louis Olivier/Documents/hotel_cleaning/";

// Créer la structure des fichiers et dossiers
createStructure(basePath, structure);

console.log("Structure de fichiers créée avec succès.");
