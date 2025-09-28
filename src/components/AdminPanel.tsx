import React, { useState } from 'react';
// import PhotoManager from './PhotoManager'; // Removed - frontend only mode

interface AdminPanelProps {}

export const AdminPanel: React.FC<AdminPanelProps> = () => {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'photos' | 'content' | 'events' | 'menu'>('dashboard');
  const [draggedImage, setDraggedImage] = useState<string | null>(null);

  const handleImageDrop = (e: React.DragEvent, section: string) => {
    e.preventDefault();
    if (draggedImage) {
      console.log(`Moving image ${draggedImage} to ${section}`);
      alert(`Image moved to ${section} section`);
      setDraggedImage(null);
    }
  };

  const handleDragStart = (imageId: string) => {
    setDraggedImage(imageId);
  };

  const sampleImages = [
    { id: '1', url: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969138608_e3c91bb8.webp', section: 'hero' },
    { id: '2', url: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969786734_f2deb808.webp', section: 'restaurant' },
    { id: '3', url: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969790377_b96b5579.webp', section: 'bar' }
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-serif text-slate-800 mb-8">Hotel Admin Console</h1>
        
        <div className="flex flex-wrap mb-6 border-b">
          {(['dashboard', 'photos', 'content', 'events', 'menu'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 mx-1 mb-2 text-sm sm:text-base font-medium capitalize transition-all ${
                activeSection === section
                  ? 'text-yellow-600 border-b-2 border-yellow-600'
                  : 'text-slate-600 hover:text-yellow-600'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
        {activeSection === 'dashboard' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Total Bookings</h3>
              <p className="text-3xl font-bold text-yellow-600">47</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Revenue This Month</h3>
              <p className="text-3xl font-bold text-green-600">R125,400</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Occupancy Rate</h3>
              <p className="text-3xl font-bold text-blue-600">78%</p>
            </div>
          </div>
        )}

        {activeSection === 'photos' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-slate-800">Photo Management</h2>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="text-center py-12">
                <p className="text-lg text-slate-600 mb-2">Photo Management Temporarily Unavailable</p>
                <p className="text-sm text-slate-500">Feature removed for frontend-only deployment</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'content' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Content Editor</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hero Title</label>
                <input
                  type="text"
                  defaultValue="Experience Luxury in the Karoo"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hero Subtitle</label>
                <textarea
                  defaultValue="Discover unparalleled comfort and breathtaking landscapes at South Africa's premier boutique hotel"
                  className="w-full p-3 border border-slate-300 rounded-lg h-24 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <button className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeSection === 'events' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Event Management</h2>
            <button className="mb-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
              Add New Event
            </button>
            <div className="space-y-4">
              <div className="border border-slate-200 p-4 rounded-lg">
                <h3 className="font-semibold">Wine Tasting Evening</h3>
                <p className="text-slate-600">March 15, 2024 - R350 per person</p>
                <div className="mt-2 space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'menu' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">Menu Management</h2>
            <button className="mb-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
              Add New Item
            </button>
            <div className="space-y-4">
              <div className="border border-slate-200 p-4 rounded-lg">
                <h3 className="font-semibold">Karoo Lamb Carpaccio</h3>
                <p className="text-slate-600">Starters - R185</p>
                <div className="mt-2 space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">Edit</button>
                  <button className="text-red-600 hover:text-red-800">Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};