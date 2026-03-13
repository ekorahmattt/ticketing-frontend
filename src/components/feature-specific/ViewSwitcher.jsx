import React from 'react';

export default function ViewSwitcher({ view, setView }) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
      <button 
        onClick={() => setView('list')}
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${view === 'list' ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
      >
        List View
      </button>
      <button 
        onClick={() => setView('map')}
        className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${view === 'map' ? 'bg-white dark:bg-gray-700 shadow text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
      >
        Denah View
      </button>
    </div>
  );
}
