"use client";

import React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import MainNavigation from "../components/ui/MainNavigation";

// Types pour les features et les modules de cours
interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  subtitle?: string;
  details?: string;
  codeExample?: string;
}

interface CourseModule {
  title: string;
  description: string;
  image: string;
  level: string;
  lessons: number;
  duration: string;
  path: string;
}

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);

  // Changer automatiquement la fonctionnalité mise en avant
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Données des fonctionnalités
  const features: Feature[] = [
    {
      title: "Formulaire de contact multilingue",
      description:
        "Découvrez notre formulaire de contact internationalisé avec prise en charge de plusieurs langues.",
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
      subtitle: "Support multilingue",
      details:
        "Notre formulaire est disponible en anglais et en français avec une interface utilisateur adaptative.",
      codeExample: "",
    },
    {
      title: "Apprentissage interactif",
      description:
        "Apprenez Next.js à travers des leçons interactives avec visualisation en temps réel du code que vous écrivez.",
      subtitle: "Éditeur de code en temps réel",
      details:
        "Modifiez le code et voyez immédiatement les résultats avec notre interface interactive",
      codeExample: "React, useState, useEffect",
      icon: (
        <div className="relative">
          <div className="absolute -inset-0.5 bg-indigo-400 rounded-lg opacity-50 group-hover:opacity-75 transition duration-200 animate-tilt"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-indigo-600 relative z-10 group-hover:text-indigo-400 transition duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Parcours progressif",
      description:
        "Évoluez du niveau débutant au niveau expert avec un parcours d'apprentissage structuré et adapté à votre rythme.",
      subtitle: "Apprentissage structuré",
      details:
        "Suivez un chemin d'apprentissage clairement défini avec des objectifs à chaque étape",
      codeExample: "React, Components, Props",
      icon: (
        <div className="relative">
          <div className="absolute -inset-0.5 bg-green-400 rounded-lg opacity-50 group-hover:opacity-75 transition duration-200 animate-tilt"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-green-600 relative z-10 group-hover:text-green-400 transition duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Système de gamification",
      description:
        "Gagnez des points XP, débloquez des badges et suivez votre progression pour rester motivé tout au long de votre apprentissage.",
      subtitle: "Apprentissage ludique",
      details:
        "Restez motivé grâce à notre système de récompenses et de suivi de progression",
      codeExample: "React, State Management",
      icon: (
        <div className="relative">
          <div className="absolute -inset-0.5 bg-purple-400 rounded-lg opacity-50 group-hover:opacity-75 transition duration-200 animate-tilt"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-purple-600 relative z-10 group-hover:text-purple-400 transition duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
        </div>
      ),
    },
    {
      title: "Portfolio professionnel",
      description:
        "Créez un portfolio professionnel à partir des projets que vous réalisez pendant votre parcours d'apprentissage.",
      subtitle: "Projets concrets",
      details:
        "Développez des projets réels que vous pouvez présenter à votre future employeur",
      codeExample: "Next.js, API Routes, Static Generation",
      icon: (
        <div className="relative">
          <div className="absolute -inset-0.5 bg-orange-400 rounded-lg opacity-50 group-hover:opacity-75 transition duration-200 animate-tilt"></div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-orange-600 relative z-10 group-hover:text-orange-400 transition duration-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
      ),
    },
  ];

  // Données des modules de cours
  const courseModules: CourseModule[] = [
    {
      title: "JavaScript Fondamentaux",
      description:
        "Maîtrisez les bases de JavaScript, le langage essentiel pour le développement web moderne.",
      image: "/javascript-module.jpg",
      level: "Débutant",
      lessons: 12,
      duration: "4-6 heures",
      path: "/javascript-fundamentals",
    },
    {
      title: "React Fondamentaux",
      description:
        "Apprenez React, la bibliothèque qui révolutionne la création d'interfaces utilisateur.",
      image: "/react-module.jpg",
      level: "Intermédiaire",
      lessons: 15,
      duration: "6-8 heures",
      path: "/react-fundamentals",
    },
    {
      title: "Next.js Débutant",
      description:
        "Découvrez Next.js, le framework React qui simplifie le développement d'applications web.",
      image: "/nextjs-beginner.jpg",
      level: "Intermédiaire",
      lessons: 10,
      duration: "5-7 heures",
      path: "/learning-path",
    },
  ];

  return (
    <div className="bg-pattern min-h-screen">
      <MainNavigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white -z-10"></div>
        <div className="absolute inset-y-0 right-0 -z-10">
          <svg
            className="h-full w-48 md:w-96 text-indigo-50 opacity-50"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 0 L100 0 L100 100 L0 100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                <span className="block text-gray-900">Apprenez Next.js</span>
                <span className="block title-gradient mt-1">
                  Apprenez de façon interactive
                </span>
              </h1>

              <p className="mt-6 text-xl text-gray-600 max-w-3xl">
                Maîtrisez Next.js à travers un parcours d'apprentissage gamifié
                et interactif. Visualisez votre code en temps réel et
                construisez votre portfolio professionnel.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/learning-path" className="btn btn-primary">
                  Commencer à apprendre
                </Link>
                <Link
                  href="/javascript-fundamentals"
                  className="btn btn-outline"
                >
                  Explorer les fondamentaux
                </Link>
              </div>
            </div>

            <div className="mt-12 lg:mt-0 relative">
              <div className="relative mx-auto w-full rounded-lg shadow-xl overflow-hidden">
                <div className="aspect-w-5 aspect-h-3 bg-gray-800 rounded-lg overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-4 sm:p-8 w-full">
                      <div className="code-editor w-full h-full bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                          <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          </div>
                          <div className="text-xs text-gray-400">App.js</div>
                        </div>
                        <div className="p-4 text-left">
                          <pre className="text-xs sm:text-sm text-gray-300 font-mono">
                            <span className="text-blue-400">import</span>{" "}
                            <span className="text-yellow-300">React</span>{" "}
                            <span className="text-blue-400">from</span>{" "}
                            <span className="text-green-300">'react'</span>;
                            <br />
                            <br />
                            <span className="text-blue-400">
                              export default function
                            </span>{" "}
                            <span className="text-yellow-300">HomePage</span>(){" "}
                            {"{"}
                            <br />
                            &nbsp;&nbsp;
                            <span className="text-blue-400">return</span> (
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&lt;
                            <span className="text-red-400">div</span>&gt;
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;
                            <span className="text-red-400">h1</span>{" "}
                            <span className="text-purple-400">className</span>=
                            <span className="text-green-300">"title"</span>&gt;
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bienvenue
                            sur NextMimo!
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/
                            <span className="text-red-400">h1</span>&gt;
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;
                            <span className="text-red-400">p</span>&gt;
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Apprenez
                            Next.js de façon interactive
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&lt;/
                            <span className="text-red-400">p</span>&gt;
                            <br />
                            &nbsp;&nbsp;&nbsp;&nbsp;&lt;/
                            <span className="text-red-400">div</span>&gt;
                            <br />
                            &nbsp;&nbsp;);
                            <br />
                            {"}"}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Effet de brillance */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-30 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités */}
      <section className="relative py-28 bg-gradient-to-br from-white via-indigo-50 to-[#f8fbff]">
        {/* Éléments décoratifs géométriques */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-b from-indigo-100/20 to-transparent -z-10" />
        <div className="absolute left-0 bottom-0 w-40 h-40 bg-indigo-600/5 rounded-full blur-[100px]" />

        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <span className="inline-block mb-4 text-sm font-semibold text-indigo-600 uppercase tracking-widest">
              Maîtrise Next.js 14
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Apprentissage Par{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
                l'Expérience
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Une méthodologie professionnelle combinant théorie approfondie et
              mise en pratique immédiate.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Colonne des fonctionnalités */}
            <div className="space-y-8 lg:col-span-1">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveFeature(idx)}
                  className={`p-6 rounded-2xl cursor-pointer transition-all ${
                    idx === activeFeature
                      ? "bg-white shadow-2xl border-2 border-indigo-100/50"
                      : "hover:bg-white/50 hover:shadow-lg"
                  }`}
                >
                  <div className="flex items-start gap-5">
                    <div
                      className={`p-3 rounded-lg ${
                        idx === activeFeature
                          ? "bg-indigo-600/10 text-indigo-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Carte de visualisation principale */}
            <div className="lg:col-span-2 relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-[2rem] transform rotate-1 shadow-xl" />
              <div className="relative h-full min-h-[500px] bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
                <div className="h-full flex flex-col">
                  <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      Sandbox Live — {features[activeFeature].title}
                    </div>
                  </div>

                  <div className="flex-1 grid lg:grid-cols-2 gap-8 p-8">
                    <div className="space-y-6">
                      <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                        {features[activeFeature].icon}
                        <h3 className="mt-4 text-xl font-semibold text-gray-900">
                          {features[activeFeature].subtitle}
                        </h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {features[activeFeature].details}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-5">
                      <div className="h-full bg-gray-800 rounded-lg overflow-hidden">
                        {/* Éditeur de code simulé */}
                        <div className="p-4 bg-gray-900/50 text-sm font-mono text-gray-300">
                          <span className="text-blue-400">import</span>{" "}
                          {features[activeFeature].codeExample}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Modules de cours */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Commencez votre parcours d'apprentissage
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Des fondamentaux de JavaScript à la maîtrise de Next.js, notre
              parcours complet vous guide étape par étape.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courseModules.map((module, index) => (
              <div
                key={index}
                className="card card-hover overflow-hidden transform transition-transform hover:-translate-y-1 duration-300"
              >
                <div className="h-48 w-full bg-indigo-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-600 opacity-90"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white p-6">
                      <h3 className="text-2xl font-bold">{module.title}</h3>
                      <div className="mt-2 flex items-center justify-center space-x-2">
                        <span className="badge badge-primary bg-white bg-opacity-20">
                          {module.level}
                        </span>
                        <span className="badge badge-primary bg-white bg-opacity-20">
                          {module.lessons} leçons
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-4">{module.description}</p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {module.duration}
                    </div>

                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1 text-indigo-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Projets inclus
                    </div>
                  </div>

                  <Link href={module.path} className="btn btn-primary w-full">
                    Commencer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="py-16 sm:py-24 bg-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Prêt à devenir un expert Next.js ?
            </h2>
            <p className="mt-4 text-xl text-indigo-100 max-w-3xl mx-auto">
              Rejoignez des milliers d'apprenants et commencez votre parcours
              dès aujourd'hui.
            </p>

            <div className="mt-10">
              <Link
                href="/learning-path"
                className="btn bg-white text-indigo-700 hover:bg-indigo-50 focus:ring-indigo-200"
              >
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
