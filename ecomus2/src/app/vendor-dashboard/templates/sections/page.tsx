"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

const SECTIONS = ["Hero", "FeaturedProducts", "Testimonials", "Newsletter", "Brands", "Categories"];

export default function SectionsManager() {
  const { slug } = useParams();
  const [activeSections, setActiveSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/stores/${slug}/sections`);
        setActiveSections(res.data.sections || []);
      } catch (error) {
        console.error("Erreur de chargement des sections", error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchSections();
  }, [slug]);

  const toggleSection = (section: string) => {
    setActiveSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await axios.patch(`/api/stores/${slug}/sections`, { sections: activeSections });
      alert("Sections sauvegardées avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde", error);
      alert("Erreur lors de la sauvegarde des sections");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Gérer les sections visibles de la boutique</h1>
      {SECTIONS.map(section => (
        <div key={section} className="flex items-center justify-between py-2">
          <span>{section}</span>
          <Switch checked={activeSections.includes(section)} onCheckedChange={() => toggleSection(section)} />
        </div>
      ))}
      <Button onClick={handleSave} disabled={loading} className="mt-4">
        {loading ? "Sauvegarde..." : "Sauvegarder"}
      </Button>
    </div>
  );
}
