"use client"

import React from 'react';

// Page client-side pour remplacer la version problématique
export default function JavascriptFundamentalsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">JavaScript Fundamentals</h1>
      <p className="mb-4">
        Welcome to the JavaScript Fundamentals page. This client-side rendered page replaces
        the problematic server component version.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Basic Concepts</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Variables and Data Types</li>
            <li>Operators and Expressions</li>
            <li>Control Flow</li>
            <li>Functions</li>
          </ul>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Advanced Topics</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Objects and Arrays</li>
            <li>DOM Manipulation</li>
            <li>Asynchronous JavaScript</li>
            <li>Modern JavaScript (ES6+)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
