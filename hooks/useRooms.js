import { useState, useEffect } from 'react';

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
}