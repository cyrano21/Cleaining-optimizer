import { useState, useEffect } from 'react';

export function useStaff() {
    const [staff, setStaff] = useState([]);

    useEffect(() => {
        // Logique de chargement du personnel depuis le stockage local
        const savedStaff = JSON.parse(localStorage.getItem('hotelStaff')) || [];
        setStaff(savedStaff);
    }, []);

    return [staff, setStaff];
}