import { useState } from 'react';

export default function Tabs({ tabs, defaultTab = 0, className = '' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  return (
    <div className={className}>
      <div className="flex border-b">
        {tabs.map((tab, index) => (
          <button 
            key={index}
            className={`flex-1 py-3 px-4 text-center ${activeTab === index ? 'border-b-2 border-indigo-600 text-indigo-600 font-medium' : 'text-gray-600 hover:text-gray-800'}`}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="py-4">
        {tabs[activeTab].content}
      </div>
    </div>
  );
}
