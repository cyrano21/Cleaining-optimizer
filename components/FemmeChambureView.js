// components/FemmeChambureView.js
import React, { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import Image from 'next/image';
import { AnimatedCard } from "./AnimatedTransitions";

export default function FemmeChambureView({ 
  user,
  rooms, 
  onRoomClick,
  toggleCleaned,
  toggleControlled,
  handleNoteChange,
  selectedNote,
  onLogout
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('rooms');
  const [workHistory, setWorkHistory] = useState([]);
  const [boardPhotos, setBoardPhotos] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Charger l'historique depuis localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem(`workHistory_${user.name}`);
    if (savedHistory) {
      setWorkHistory(JSON.parse(savedHistory));
    }
    
    const savedPhotos = localStorage.getItem(`boardPhotos_${user.name}`);
    if (savedPhotos) {
      setBoardPhotos(JSON.parse(savedPhotos));
    }
  }, [user.name]);

  // Sauvegarder l'activité dans l'historique
  const logActivity = (activity) => {
    const newActivity = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('fr-FR'),
      time: new Date().toLocaleTimeString('fr-FR'),
      activity: activity,
      user: user.name
    };
    
    const updatedHistory = [newActivity, ...workHistory].slice(0, 100); // Garder les 100 dernières activités
    setWorkHistory(updatedHistory);
    localStorage.setItem(`workHistory_${user.name}`, JSON.stringify(updatedHistory));
  };

  // Initialiser la caméra
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Caméra arrière par défaut
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      videoRef.current.srcObject = stream;
      setIsCameraActive(true);
      setShowCamera(true);
    } catch (error) {
      alert('Impossible d\'accéder à la caméra: ' + error.message);
    }
  };

  // Arrêter la caméra
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraActive(false);
    setShowCamera(false);
  };

  // Prendre une photo
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);
    
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    const newPhoto = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('fr-FR'),
      time: new Date().toLocaleTimeString('fr-FR'),
      data: photoData,
      user: user.name,
      description: `Planning du ${new Date().toLocaleDateString('fr-FR')}`
    };
    
    const updatedPhotos = [newPhoto, ...boardPhotos].slice(0, 50); // Garder les 50 dernières photos
    setBoardPhotos(updatedPhotos);
    localStorage.setItem(`boardPhotos_${user.name}`, JSON.stringify(updatedPhotos));
    
    logActivity(`📸 Photo du planning prise`);
    stopCamera();
  };

  // Supprimer une photo
  const deletePhoto = (photoId) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) {
      const updatedPhotos = boardPhotos.filter(photo => photo.id !== photoId);
      setBoardPhotos(updatedPhotos);
      localStorage.setItem(`boardPhotos_${user.name}`, JSON.stringify(updatedPhotos));
      logActivity(`🗑️ Photo du planning supprimée`);
    }
  };

  // Filtrer uniquement les chambres assignées à cette femme de chambre
  const myRooms = rooms.filter(room => room.assignedTo === user.name);
  
  const stats = {
    total: myRooms.length,
    cleaned: myRooms.filter(r => r.cleaned).length,
    controlled: myRooms.filter(r => r.controlled).length,
    completed: myRooms.filter(r => r.cleaned && r.controlled).length,
    pending: myRooms.filter(r => !r.cleaned).length,
    libre: myRooms.filter(r => r.state === "Libre").length,
    depart: myRooms.filter(r => r.state === "Départ").length,
    recouche: myRooms.filter(r => r.state === "Recouche").length,
  };

  // Intercepter les actions pour les logger
  const handleRoomCleaned = (roomNumber) => {
    toggleCleaned(roomNumber);
    logActivity(`🧹 Chambre ${roomNumber} nettoyée`);
  };

  const handleRoomControlled = (roomNumber) => {
    toggleControlled(roomNumber);
    logActivity(`✅ Chambre ${roomNumber} contrôlée`);
  };

  const handleNoteChanged = (roomNumber, note) => {
    handleNoteChange(roomNumber, note);
    if (note) {
      logActivity(`📝 Note ajoutée à la chambre ${roomNumber}: ${note}`);
    }
  };

  const getStateColor = (state) => {
    switch (state) {
      case "Libre":
        return "bg-green-50 border-green-200 text-green-800";
      case "Départ":
        return "bg-pink-50 border-pink-200 text-pink-800";
      case "Recouche":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getStateIcon = (state) => {
    switch (state) {
      case "Libre":
        return "🟢";
      case "Départ":
        return "🔴";
      case "Recouche":
        return "🟡";
      default:
        return "⚪";
    }
  };

  const getProgressPercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  // Grouper l'historique par date
  const historyByDate = workHistory.reduce((acc, activity) => {
    if (!acc[activity.date]) {
      acc[activity.date] = [];
    }
    acc[activity.date].push(activity);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600">
      {/* Header simplifié pour femme de chambre */}
      <div className="bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-700 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🧹 Espace Personnel
              </h1>
              <p className="text-cyan-100">
                Bonjour {user.name} ! Gérez vos chambres et votre historique
              </p>
            </div>
            <div className="text-right">
              <div className="text-white text-sm mb-2">
                {currentTime.toLocaleDateString("fr-FR")}
              </div>
              <button
                onClick={onLogout}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm"
              >
                🚪 Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Navigation par onglets */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-lg">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'rooms'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              🏠 Mes Chambres
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'photos'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              📸 Photos Planning ({boardPhotos.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              📋 Historique ({workHistory.length})
            </button>
          </div>
        </div>

        {/* Onglet Mes Chambres */}
        {activeTab === 'rooms' && (
          <>
            {/* Statistiques personnelles */}
            <AnimatedCard className="mb-8">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  📊 Votre Progression
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-blue-500 text-sm">Total</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.cleaned}</div>
                    <div className="text-green-500 text-sm">Nettoyées</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats.controlled}</div>
                    <div className="text-purple-500 text-sm">Contrôlées</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    <div className="text-yellow-500 text-sm">Restantes</div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progression</span>
                    <span className="text-sm font-medium text-gray-700">{getProgressPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </AnimatedCard>

            {/* Liste des chambres */}
            <AnimatedCard delay={200}>
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  🏠 Vos Chambres Assignées
                </h2>
                
                {myRooms.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🏨</div>
                    <p className="text-gray-600">Aucune chambre assignée pour le moment</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {myRooms.map((room) => (
                      <div
                        key={room.number}
                        className={`border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-lg cursor-pointer ${getStateColor(room.state)}`}
                        onClick={() => onRoomClick(room.number)}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-lg">
                              {getStateIcon(room.state)} Chambre {room.number}
                            </h3>
                            <p className="text-sm font-medium">{room.state}</p>
                          </div>
                          <div className="text-right">
                            {room.cleaned && room.controlled && (
                              <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                🎉 Terminée
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions rapides */}
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRoomCleaned(room.number);
                            }}
                            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                              room.cleaned
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-green-100'
                            }`}
                          >
                            {room.cleaned ? '✅ Nettoyé' : '🧹 Nettoyer'}
                          </button>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRoomControlled(room.number);
                            }}
                            className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                              room.controlled
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-purple-100'
                            }`}
                          >
                            {room.controlled ? '✅ Contrôlé' : '🔍 Contrôler'}
                          </button>
                        </div>

                        {/* Zone de notes */}
                        <div>
                          <select
                            value={selectedNote[room.number] || ""}
                            onChange={(e) => handleNoteChanged(room.number, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full p-2 border rounded text-sm"
                          >
                            <option value="">Sélectionner une note...</option>
                            <option value="DND">🚫 DND</option>
                            <option value="Refus">❌ Refus</option>
                            <option value="LP">✅ Libre et Propre</option>
                            <option value="Départ tardif">⏰ Départ tardif</option>
                            <option value="Problème technique">🔧 Problème technique</option>
                            <option value="Maintenance">⚙️ Maintenance</option>
                          </select>
                          {selectedNote[room.number] && (
                            <div className="mt-2 text-sm bg-gray-100 p-2 rounded">
                              📝 {selectedNote[room.number]}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedCard>

            {/* Message de motivation */}
            {stats.total > 0 && (
              <AnimatedCard delay={400} className="mt-8">
                <div className="p-6 text-center">
                  <div className="text-4xl mb-3">
                    {getProgressPercentage() === 100 ? "🎉" : 
                     getProgressPercentage() >= 75 ? "💪" :
                     getProgressPercentage() >= 50 ? "👍" : "🚀"}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {getProgressPercentage() === 100 ? "Félicitations ! Toutes vos chambres sont terminées !" :
                     getProgressPercentage() >= 75 ? "Excellent travail ! Vous y êtes presque !" :
                     getProgressPercentage() >= 50 ? "Bon rythme ! Continuez comme ça !" :
                     "C'est parti ! Vous pouvez le faire !"}
                  </h3>
                  <p className="text-gray-600">
                    {getProgressPercentage() === 100 ? 
                      "Vous pouvez prendre une pause bien méritée." :
                      `Plus que ${stats.pending} chambre${stats.pending > 1 ? 's' : ''} à nettoyer.`
                    }
                  </p>
                </div>
              </AnimatedCard>
            )}
          </>
        )}

        {/* Onglet Photos */}
        {activeTab === 'photos' && (
          <AnimatedCard>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  📸 Photos de Planning
                </h2>
                <button
                  onClick={startCamera}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  📷 Prendre une photo
                </button>
              </div>

              {/* Interface caméra */}
              {showCamera && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">📷 Prendre une photo du planning</h3>
                      <button
                        onClick={stopCamera}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        ❌ Fermer
                      </button>
                    </div>
                    
                    <div className="relative mb-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-64 object-cover rounded-lg bg-gray-100"
                      />
                      <canvas
                        ref={canvasRef}
                        className="hidden"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <button
                        onClick={takePhoto}
                        disabled={!isCameraActive}
                        className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-3 px-4 rounded-lg transition-colors"
                      >
                        📸 Capturer
                      </button>
                      <button
                        onClick={stopCamera}
                        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
                      >
                        ❌ Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Galerie de photos */}
              {boardPhotos.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📸</div>
                  <p className="text-gray-600">Aucune photo de planning enregistrée</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Prenez des photos de vos plannings pour les conserver
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {boardPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                    >
                      <Image
                        src={photo.data}
                        alt={photo.description}
                        width={400}
                        height={192}
                        className="w-full h-48 object-cover"
                        unoptimized={true}
                      />
                      <div className="p-4">
                        <p className="font-medium text-gray-800">{photo.description}</p>
                        <p className="text-gray-600 text-sm">
                          📅 {photo.date} à {photo.time}
                        </p>
                        <div className="flex gap-2 mt-3">
                          <a
                            href={photo.data}
                            download={`planning_${photo.date.replace(/\//g, '-')}_${photo.time.replace(/:/g, '-')}.jpg`}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded text-sm text-center transition-colors"
                          >
                            💾 Télécharger
                          </a>
                          <button
                            onClick={() => deletePhoto(photo.id)}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded text-sm transition-colors"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AnimatedCard>
        )}

        {/* Onglet Historique */}
        {activeTab === 'history' && (
          <AnimatedCard>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  📋 Historique de Travail
                </h2>
                <div className="text-sm text-gray-600">
                  {workHistory.length} activité{workHistory.length > 1 ? 's' : ''} enregistrée{workHistory.length > 1 ? 's' : ''}
                </div>
              </div>

              {workHistory.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📋</div>
                  <p className="text-gray-600">Aucune activité enregistrée</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Vos actions seront automatiquement enregistrées ici
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(historyByDate)
                    .sort(([a], [b]) => new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-')))
                    .slice(0, 30) // Afficher les 30 derniers jours
                    .map(([date, activities]) => (
                      <div key={date} className="border-l-4 border-blue-500 pl-4">
                        <h3 className="font-bold text-gray-800 mb-3">
                          📅 {date}
                        </h3>
                        <div className="space-y-2">
                          {activities.map((activity) => (
                            <div
                              key={activity.id}
                              className="bg-gray-50 p-3 rounded-lg border-l-4 border-gray-300"
                            >
                              <div className="flex justify-between items-start">
                                <span className="text-gray-800">{activity.activity}</span>
                                <span className="text-gray-500 text-sm">{activity.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </AnimatedCard>
        )}
      </div>
    </div>
  );
}

FemmeChambureView.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  rooms: PropTypes.arrayOf(
    PropTypes.shape({
      number: PropTypes.string.isRequired,
      state: PropTypes.string.isRequired,
      cleaned: PropTypes.bool,
      controlled: PropTypes.bool,
      assignedTo: PropTypes.string,
    })
  ).isRequired,
  onRoomClick: PropTypes.func.isRequired,
  toggleCleaned: PropTypes.func.isRequired,
  toggleControlled: PropTypes.func.isRequired,
  handleNoteChange: PropTypes.func.isRequired,
  selectedNote: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
};
