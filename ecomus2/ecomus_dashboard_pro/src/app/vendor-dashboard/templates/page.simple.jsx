"use client";

import { useState } from 'react';
import TemplateGallery from '@/components/stores/TemplateGallery';

export default function TemplateManagementSimple() {
  const [selectedTemplate, setSelectedTemplate] = useState("home-01");

  const handleTemplateSelect = async (templateId) => {
    setSelectedTemplate(templateId);
    alert(`Template sélectionné: ${templateId}`);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Galerie de Templates</h1>
          <p className="text-gray-600 mt-2">
            Choisissez parmi notre collection de templates. Template actuel: {selectedTemplate}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <TemplateGallery
            currentTemplate={selectedTemplate}
            onTemplateSelect={handleTemplateSelect}
            showAdminAccess={true}
          />
        </div>
      </div>
    </div>
  );
}
