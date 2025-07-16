"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function AnimatedLayout({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  
  useEffect(() => {
    // Animation très courte lors des changements de page
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200); // Réduit de 1000ms à 200ms
    
    return () => clearTimeout(timer);
  }, [pathname]); // Réagir aux changements de chemin
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }} // Réduit de 0.5 à 0.2
            className="fixed inset-0 flex items-center justify-center bg-white z-50"
          >
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                    borderRadius: ["20%", "50%", "20%"]
                  }}
                  transition={{
                    duration: 1, // Réduit de 2 à 1
                    ease: "easeInOut",
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500"
                />
                <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                  N
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">NextMimo</h2>
              <p className="text-gray-500">Chargement...</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={pathname} // Utiliser le chemin comme clé pour forcer l'animation lors des changements
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }} // Réduit de 0.5 à 0.2
            className="min-h-screen"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
