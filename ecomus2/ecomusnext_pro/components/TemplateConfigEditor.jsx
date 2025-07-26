import React, { useState, useEffect } from 'react';
import { getTemplateConfig, getComponent, getComponentsByCategory, TEMPLATE_DEFAULTS } from '@/lib/template-config';

const TemplateConfigEditor = ({ templateId, onSave }) => {
  const [config, setConfig] = useState(null);
  const [sections, setSections] = useState([]);
  const [availableComponents, setAvailableComponents] = useState({});
  const [isModified, setIsModified] = useState(false);

  useEffect(() => {
    const templateConfig = getTemplateConfig(templateId);
    setConfig(templateConfig);
    setSections(templateConfig?.sections || []);
    setAvailableComponents(getComponentsByCategory());
  }, [templateId]);

  const updateSection = (sectionId, updates) => {
    setSections(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, ...updates }
          : section
      )
    );
    setIsModified(true);
  };

  const toggleSection = (sectionId) => {
    updateSection(sectionId, { 
      enabled: !sections.find(s => s.id === sectionId)?.enabled 
    });
  };

  const updateSectionOrder = (sectionId, newOrder) => {
    updateSection(sectionId, { order: parseInt(newOrder) });
  };

  const updateSectionProps = (sectionId, propKey, propValue) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) {
      updateSection(sectionId, {
        props: {
          ...section.props,
          [propKey]: propValue
        }
      });
    }
  };

  const addNewSection = () => {
    const newId = `section-${Date.now()}`;
    const newSection = {
      id: newId,
      component: 'hero-default',
      enabled: true,
      order: sections.length + 1,
      props: {
        variant: 'default',
        title: 'New Section',
        subtitle: 'Configure this section'
      }
    };
    setSections(prev => [...prev, newSection]);
    setIsModified(true);
  };

  const removeSection = (sectionId) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
    setIsModified(true);
  };

  const handleSave = () => {
    const updatedConfig = {
      ...config,
      sections: sections.sort((a, b) => a.order - b.order)
    };
    
    if (onSave) {
      onSave(templateId, updatedConfig);
    }
    setIsModified(false);
  };

  const resetToDefault = () => {
    const defaultConfig = TEMPLATE_DEFAULTS[templateId];
    if (defaultConfig) {
      setConfig(defaultConfig);
      setSections(defaultConfig.sections);
      setIsModified(true);
    }
  };

  if (!config) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading template configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{config.name}</h1>
            <p className="text-gray-600">Configure sections and layout for template: {templateId}</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={resetToDefault}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Reset to Default
            </button>
            <button
              onClick={addNewSection}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Section
            </button>
            <button
              onClick={handleSave}
              disabled={!isModified}
              className={`px-6 py-2 rounded-lg transition-colors ${
                isModified
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
        
        {isModified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              ⚠️ You have unsaved changes. Don't forget to save your configuration.
            </p>
          </div>
        )}
      </div>

      {/* Sections List */}
      <div className="space-y-4">
        {sections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <div key={section.id} className="bg-white rounded-lg shadow-sm border">
              {/* Section Header */}
              <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleSection(section.id)}
                      className={`w-10 h-6 rounded-full p-1 transition-colors ${
                        section.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        section.enabled ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">{section.component}</h3>
                      <p className="text-sm text-gray-600">ID: {section.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <label className="text-sm text-gray-600">
                      Order:
                      <input
                        type="number"
                        value={section.order}
                        onChange={(e) => updateSectionOrder(section.id, e.target.value)}
                        className="ml-2 w-16 px-2 py-1 border rounded text-center"
                        min="1"
                      />
                    </label>
                    
                    <button
                      onClick={() => removeSection(section.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove section"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Configuration */}
              {section.enabled && (
                <div className="p-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Component Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Component Type
                      </label>
                      <select
                        value={section.component}
                        onChange={(e) => updateSection(section.id, { component: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(availableComponents).map(([category, components]) => (
                          <optgroup key={category} label={category.toUpperCase()}>
                            {components.map(component => (
                              <option key={component} value={component}>
                                {component}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {/* Props Configuration */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Properties
                      </label>
                      <div className="space-y-3">
                        {/* Variant */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Variant</label>
                          <select
                            value={section.props?.variant || 'default'}
                            onChange={(e) => updateSectionProps(section.id, 'variant', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            <option value="default">Default</option>
                            <option value="electronic">Electronic</option>
                            <option value="fashion">Fashion</option>
                            <option value="cosmetic">Cosmetic</option>
                          </select>
                        </div>
                        
                        {/* Title */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Title</label>
                          <input
                            type="text"
                            value={section.props?.title || ''}
                            onChange={(e) => updateSectionProps(section.id, 'title', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                            placeholder="Section title"
                          />
                        </div>
                        
                        {/* Subtitle */}
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Subtitle</label>
                          <input
                            type="text"
                            value={section.props?.subtitle || ''}
                            onChange={(e) => updateSectionProps(section.id, 'subtitle', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                            placeholder="Section subtitle"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Props JSON Editor */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Advanced Properties (JSON)
                    </label>
                    <textarea
                      value={JSON.stringify(section.props, null, 2)}
                      onChange={(e) => {
                        try {
                          const props = JSON.parse(e.target.value);
                          updateSection(section.id, { props });
                        } catch (error) {
                          // Invalid JSON, ignore
                        }
                      }}
                      className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Section properties in JSON format"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
      </div>

      {/* Templates Available */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Available Templates</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.keys(TEMPLATE_DEFAULTS).map(template => (
            <div
              key={template}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                template === templateId
                  ? 'border-blue-500 bg-blue-100'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
              onClick={() => window.location.href = `?template=${template}`}
            >
              <h4 className="font-medium text-gray-900">{TEMPLATE_DEFAULTS[template].name}</h4>
              <p className="text-sm text-gray-600">{template}</p>
              <p className="text-xs text-gray-500 mt-1">
                {TEMPLATE_DEFAULTS[template].sections.length} sections
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateConfigEditor;
