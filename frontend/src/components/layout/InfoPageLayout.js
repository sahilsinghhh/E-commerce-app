import React from 'react';
import { Link } from 'react-router-dom';

const InfoPageLayout = ({ title, children, lastUpdated }) => {
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link to="/" className="text-ink-600 hover:text-blue-800 transition-colors inline-flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-premium border border-ink-100 overflow-hidden">
          <div className="bg-gradient-to-r from-ink-900 to-ink-700 px-8 py-10 text-white">
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 tracking-tight text-white">{title}</h1>
            {lastUpdated && <p className="text-brand-400 font-medium text-sm mt-3">Last updated: {lastUpdated}</p>}
          </div>
          <div className="p-8 md:p-12 prose prose-blue max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-blue-600 hover:prose-a:text-blue-800">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPageLayout;
