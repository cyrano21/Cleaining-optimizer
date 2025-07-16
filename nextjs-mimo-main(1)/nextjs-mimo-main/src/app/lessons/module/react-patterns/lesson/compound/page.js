"use client"

import React from 'react';

export default function CompoundPatternPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Compound Component Pattern</h1>
      <p className="mb-4">
        This page demonstrates the Compound Component pattern in React.
      </p>
      <div className="bg-white p-6 rounded-lg shadow-md mt-6">
        <h2 className="text-xl font-semibold mb-4">Key Concepts</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Parent and child components that work together</li>
          <li>Shared state through React Context</li>
        </ul>
      </div>
    </div>
  );
}