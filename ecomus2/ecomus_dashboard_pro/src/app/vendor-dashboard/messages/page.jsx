"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { 
  MessageSquare, 
  Send, 
  Search, 
  Filter, 
  Users, 
  Clock,
  Star,
  Paperclip,
  MoreVertical,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function MessagesPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, unread, important

  // Données de démonstration pour les conversations
  const demoConversations = [
    {
      id: 1,
      customer: {
        name: "Marie Dubois",
        email: "marie.dubois@email.com",
        avatar: null
      },
      subject: "Question sur commande #12345",
      lastMessage: "Bonjour, j'aimerais savoir où en est ma commande passée la semaine dernière...",
      unreadCount: 2,
      isImportant: false,
      status: "open",
      updatedAt: "2024-01-15T10:30:00Z",
      messages: [
        {
          id: 1,
          sender: "customer",
          content: "Bonjour, j'aimerais savoir où en est ma commande passée la semaine dernière...",
          timestamp: "2024-01-15T09:00:00Z",
          isRead: true
        },
        {
          id: 2,
          sender: "vendor",
          content: "Bonjour Marie, je vérifie le statut de votre commande et je reviens vers vous rapidement.",
          timestamp: "2024-01-15T09:15:00Z",
          isRead: true
        },
        {
          id: 3,
          sender: "customer",
          content: "Merci beaucoup ! J'attends votre retour.",
          timestamp: "2024-01-15T10:30:00Z",
          isRead: false
        }
      ]
    },
    {
      id: 2,
      customer: {
        name: "Jean Martin",
        email: "jean.martin@email.com",
        avatar: null
      },
      subject: "Problème avec le produit reçu",
      lastMessage: "Le produit que j'ai reçu ne correspond pas à la description...",
      unreadCount: 1,
      isImportant: true,
      status: "urgent",
      updatedAt: "2024-01-14T16:45:00Z",
      messages: [
        {
          id: 1,
          sender: "customer",
          content: "Le produit que j'ai reçu ne correspond pas à la description. Pouvez-vous m'aider ?",
          timestamp: "2024-01-14T16:45:00Z",
          isRead: false
        }
      ]
    },
    {
      id: 3,
      customer: {
        name: "Sophie Laurent",
        email: "sophie.laurent@email.com",
        avatar: null
      },
      subject: "Demande de remboursement",
      lastMessage: "Conversation résolue - Remboursement effectué",
      unreadCount: 0,
      isImportant: false,
      status: "resolved",
      updatedAt: "2024-01-13T14:20:00Z",
      messages: [
        {
          id: 1,
          sender: "customer",
          content: "Je souhaiterais un remboursement pour ma commande.",
          timestamp: "2024-01-13T10:00:00Z",
          isRead: true
        },
        {
          id: 2,
          sender: "vendor",
          content: "Bien sûr, je traite votre demande immédiatement.",
          timestamp: "2024-01-13T11:00:00Z",
          isRead: true
        },
        {
          id: 3,
          sender: "vendor",
          content: "Votre remboursement a été effectué. Vous devriez le recevoir sous 3-5 jours ouvrés.",
          timestamp: "2024-01-13T14:20:00Z",
          isRead: true
        }
      ]
    }
  ];

  useEffect(() => {
    // Simulation du chargement des conversations
    setTimeout(() => {
      setConversations(demoConversations);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === "unread") return matchesSearch && conv.unreadCount > 0;
    if (filterStatus === "important") return matchesSearch && conv.isImportant;
    return matchesSearch;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // Simuler l'envoi d'un message
    const message = {
      id: Date.now(),
      sender: "vendor",
      content: newMessage,
      timestamp: new Date().toISOString(),
      isRead: true
    };

    // Mettre à jour la conversation sélectionnée
    const updatedConversations = conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: newMessage,
          updatedAt: new Date().toISOString()
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, message]
    });
    setNewMessage("");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "urgent":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Urgent</span>;
      case "resolved":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Résolu</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">Ouvert</span>;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gérez vos conversations avec les clients
          </p>
        </div>
        
        {/* Statistiques rapides */}
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {conversations.filter(c => c.unreadCount > 0).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Non lus</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {conversations.filter(c => c.isImportant).length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Importants</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {conversations.filter(c => c.status === 'resolved').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Résolus</div>
          </div>
        </div>
      </div>

      {/* Interface de messagerie */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-[600px] flex">
        
        {/* Liste des conversations */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          
          {/* Recherche et filtres */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une conversation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1 text-xs rounded-full ${filterStatus === "all" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterStatus("unread")}
                className={`px-3 py-1 text-xs rounded-full ${filterStatus === "unread" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}
              >
                Non lus
              </button>
              <button
                onClick={() => setFilterStatus("important")}
                className={`px-3 py-1 text-xs rounded-full ${filterStatus === "important" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}
              >
                Importants
              </button>
            </div>
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  selectedConversation?.id === conversation.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {conversation.customer.name.charAt(0)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-white truncate">
                        {conversation.customer.name}
                      </h4>
                      <div className="flex items-center gap-1">
                        {conversation.isImportant && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        )}
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 truncate">
                      {conversation.subject}
                    </p>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-2">
                      {conversation.lastMessage}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {getStatusBadge(conversation.status)}
                      <span className="text-xs text-gray-400">
                        {formatTime(conversation.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Zone de conversation */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Header de la conversation */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedConversation.customer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {selectedConversation.customer.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedConversation.customer.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedConversation.status)}
                    <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
                      <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <h4 className="mt-2 font-medium text-gray-700 dark:text-gray-300">
                  {selectedConversation.subject}
                </h4>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "vendor" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-lg ${
                        message.sender === "vendor"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender === "vendor" 
                          ? "text-blue-100" 
                          : "text-gray-500 dark:text-gray-400"
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Zone de saisie */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <Paperclip className="h-4 w-4 text-gray-500" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Tapez votre message..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Message d'accueil */
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Sélectionnez une conversation
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choisissez une conversation dans la liste pour commencer à échanger avec vos clients.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
