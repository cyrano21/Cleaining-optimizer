"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PortfolioBuilder() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioData, setPortfolioData] = useState({
    name: "",
    title: "Développeur Next.js",
    bio: "",
    email: "",
    github: "",
    linkedin: "",
    website: "",
    skills: ["Next.js", "React", "JavaScript", "Tailwind CSS"],
    theme: "modern",
    selectedProjects: [],
  });

  // Charger le profil utilisateur et ses données depuis l'API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Récupérer le profil utilisateur
        const profileResponse = await fetch("/api/profile");
        if (profileResponse.ok) {
          const profile = await profileResponse.json();

          // Pré-remplir les données du portfolio avec les informations du profil
          setPortfolioData((prevData) => ({
            ...prevData,
            name: profile.fullName || "",
            email: profile.email || "",
            github: profile.github || "",
            linkedin: profile.linkedin || "",
            website: profile.website || "",
            bio: profile.bio || "",
          }));
        }

        // Récupérer les projets de l'utilisateur
        const projectsResponse = await fetch("/api/user-projects");
        if (projectsResponse.ok) {
          const userProjects = await projectsResponse.json();
          setProjects(userProjects);

          // Pré-sélectionner les projets marqués comme favoris
          const featuredProjects = userProjects
            .filter((project) => project.featured)
            .map((project) => project.id);

          setPortfolioData((prevData) => ({
            ...prevData,
            selectedProjects: featuredProjects,
          }));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        // Charger des données locales en cas d'erreur pour la démo
        loadLocalProjects();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fonction de secours qui charge des projets locaux (pour la démo)
  const loadLocalProjects = () => {
    const storedProjects = JSON.parse(
      localStorage.getItem("portfolioProjects") || "[]",
    );

    if (storedProjects.length === 0) {
      const defaultProjects = [
        {
          id: "project-1",
          title: "Application Todo avec Next.js",
          description:
            "Une application de gestion de tâches créée avec Next.js et React.",
          thumbnail: "/images/projects/todo-app.jpg",
          technologies: ["Next.js", "React", "Tailwind CSS"],
          demoUrl: "https://todo-app-demo.vercel.app",
          codeUrl: "https://github.com/username/todo-app",
          moduleId: "components",
          lessonId: "components-lesson-3",
          completed: true,
          featured: false,
        },
        {
          id: "project-2",
          title: "Blog personnel",
          description:
            "Un blog personnel avec fonctionnalités de commentaires et système d'authentification.",
          thumbnail: "/images/projects/blog.jpg",
          technologies: ["Next.js", "React", "NextAuth", "MongoDB"],
          demoUrl: "https://blog-demo.vercel.app",
          codeUrl: "https://github.com/username/blog",
          moduleId: "data-fetching",
          lessonId: "data-fetching-lesson-5",
          completed: true,
          featured: true,
        },
      ];

      setProjects(defaultProjects);
      setPortfolioData((prevData) => ({
        ...prevData,
        selectedProjects: defaultProjects
          .filter((p) => p.featured)
          .map((p) => p.id),
      }));

      localStorage.setItem(
        "portfolioProjects",
        JSON.stringify(defaultProjects),
      );
    } else {
      setProjects(storedProjects);
      setPortfolioData((prevData) => ({
        ...prevData,
        selectedProjects: storedProjects
          .filter((p) => p.featured)
          .map((p) => p.id),
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPortfolioData({
      ...portfolioData,
      [name]: value,
    });
  };

  const handleSkillChange = (e) => {
    const skills = e.target.value
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
    setPortfolioData({
      ...portfolioData,
      skills,
    });
  };

  const toggleProjectSelection = (projectId) => {
    setPortfolioData((prevData) => {
      const selectedProjects = [...prevData.selectedProjects];

      if (selectedProjects.includes(projectId)) {
        return {
          ...prevData,
          selectedProjects: selectedProjects.filter((id) => id !== projectId),
        };
      } else {
        return {
          ...prevData,
          selectedProjects: [...selectedProjects, projectId],
        };
      }
    });
  };

  const toggleProjectFeatured = (projectId) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId 
          ? { ...project, featured: !project.featured } 
          : project
      )
    );
  };

  const savePortfolio = async () => {
    try {
      const response = await fetch("/api/portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(portfolioData),
      });

      if (response.ok) {
        alert("Portfolio sauvegardé avec succès!");
      } else {
        throw new Error("Erreur lors de la sauvegarde");
      }
    } catch (error) {
      console.error("Erreur:", error);

      localStorage.setItem("portfolioData", JSON.stringify(portfolioData));
      alert("Portfolio sauvegardé localement (mode hors ligne)");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Créer votre portfolio
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Informations personnelles */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nom complet
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={portfolioData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titre professionnel
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={portfolioData.title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Développeur Frontend"
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                  Biographie
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={portfolioData.bio}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Écrivez une courte biographie..."
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contacts</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={portfolioData.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label htmlFor="github" className="block text-sm font-medium text-gray-700">
                  GitHub
                </label>
                <input
                  type="text"
                  id="github"
                  name="github"
                  value={portfolioData.github}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="github.com/username"
                />
              </div>

              <div>
                <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                  LinkedIn
                </label>
                <input
                  type="text"
                  id="linkedin"
                  name="linkedin"
                  value={portfolioData.linkedin}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="linkedin.com/in/username"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                  Site web personnel
                </label>
                <input
                  type="text"
                  id="website"
                  name="website"
                  value={portfolioData.website}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="www.example.com"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Compétences</h3>

            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                Compétences (séparées par des virgules)
              </label>
              <textarea
                id="skills"
                name="skills"
                rows={3}
                value={portfolioData.skills.join(', ')}
                onChange={handleSkillChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="React, JavaScript, CSS, HTML..."
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Apparence</h3>

            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                Thème du portfolio
              </label>
              <select
                id="theme"
                name="theme"
                value={portfolioData.theme}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="modern">Moderne</option>
                <option value="minimal">Minimaliste</option>
                <option value="classic">Classique</option>
                <option value="dark">Sombre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Colonne de droite: Projets */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sélectionnez vos projets</h3>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-sm text-gray-600">
              Ces projets ont été créés pendant votre parcours d'apprentissage. Sélectionnez ceux que vous souhaitez inclure dans votre portfolio.
            </p>
          </div>

          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun projet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Vous n'avez pas encore de projets. Complétez des leçons pour créer des projets.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {projects.map((project) => (
                  <div 
                    key={project.id} 
                    className={`border rounded-lg overflow-hidden transition-colors ${
                      portfolioData.selectedProjects.includes(project.id) 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-indigo-300'
                    } ${!project.completed ? 'opacity-60' : ''}`}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">{project.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                        </div>
                        <div>
                          <label className="inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only"
                              checked={portfolioData.selectedProjects.includes(project.id)}
                              onChange={() => project.completed && toggleProjectSelection(project.id)}
                              disabled={!project.completed}
                            />
                            <div className={`relative w-10 h-5 rounded-full transition-colors ${
                              portfolioData.selectedProjects.includes(project.id) 
                                ? 'bg-indigo-600' 
                                : 'bg-gray-200'
                            }`}>
                              <div className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                                portfolioData.selectedProjects.includes(project.id) 
                                  ? 'transform translate-x-5' 
                                  : ''
                              }`}></div>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {project.technologies.map((tech, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        {portfolioData.selectedProjects.includes(project.id) && (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`feature-project-${project.id}`}
                              checked={project.featured}
                              onChange={() => toggleProjectFeatured(project.id)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`feature-project-${project.id}`} className="ml-2 block text-sm text-gray-700">
                              Mettre en avant
                            </label>
                          </div>
                        )}
                      </div>

                      {project.completed ? (
                        <div className="mt-4 flex justify-between">
                          <a 
                            href={project.demoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            Voir la démo
                          </a>
                          <a 
                            href={project.codeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-800"
                          >
                            Voir le code
                          </a>
                        </div>
                      ) : (
                        <div className="mt-4">
                          <span className="text-sm text-yellow-600">
                            ⚠️ Projet non complété - Terminez ce module pour l'ajouter à votre portfolio
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <Link 
          href="/portfolio/preview" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Prévisualiser
        </Link>
        <button
          type="button"
          onClick={savePortfolio}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
}