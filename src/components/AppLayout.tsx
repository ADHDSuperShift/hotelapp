import React, { useState, useMemo } from 'react';
import { RoomCard } from './RoomCard';
import { BookingModal } from './BookingModal';
import { SearchFilters } from './SearchFilters';
import { AdminPanel } from './AdminPanel';
import { VirtualTour } from './VirtualTour';
import { RestaurantSection } from './RestaurantSection';
import { BarSection } from './BarSection';
import { WineBoutique } from './WineBoutique';
import { EventsSection } from './EventsSection';
import { MapSection } from './MapSection';

const AppLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'admin'>('home');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [guestCount, setGuestCount] = useState(0);
  const [sortBy, setSortBy] = useState('name');

  const rooms = [
    { id: '1', name: 'Karoo Luxury Suite', image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969143551_21b4a709.webp', price: 5500, description: 'Premium suite with panoramic mountain views', amenities: ['King Bed', 'Mountain View', 'Private Balcony', 'Mini Bar'], maxGuests: 2 },
    { id: '2', name: 'Garden View Room', image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969145361_ed87253d.webp', price: 2400, description: 'Elegant room overlooking landscaped gardens', amenities: ['Queen Bed', 'Garden View', 'Work Desk', 'Coffee Machine'], maxGuests: 2 },
    { id: '3', name: 'Mountain Vista Suite', image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969147518_7539ab38.webp', price: 6200, description: 'Spacious suite with dramatic Karoo landscapes', amenities: ['King Bed', 'Sitting Area', 'Fireplace', 'Spa Bath'], maxGuests: 3 },
    { id: '4', name: 'Executive Room', image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969149296_97e82a5a.webp', price: 3200, description: 'Modern comfort for business travelers', amenities: ['Queen Bed', 'Work Station', 'High-Speed WiFi', 'Business Center'], maxGuests: 2 },
    { id: '5', name: 'Deluxe Family Suite', image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969152522_f0e1c115.webp', price: 4800, description: 'Perfect for families with connecting rooms', amenities: ['Two Bedrooms', 'Family Lounge', 'Kitchenette', 'Game Area'], maxGuests: 4 },
    { id: '6', name: 'Romantic Getaway', image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969154275_f9f83d3b.webp', price: 4200, description: 'Intimate setting for couples', amenities: ['King Bed', 'Jacuzzi', 'Champagne Service', 'Rose Petals'], maxGuests: 2 }
  ];

  const filteredRooms = useMemo(() => {
    return rooms
      .filter(room => {
        const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGuests = guestCount === 0 || room.maxGuests >= guestCount;
        
        let matchesPrice = true;
        if (priceRange) {
          const [min, max] = priceRange.includes('+') 
            ? [parseInt(priceRange), Infinity]
            : priceRange.split('-').map(p => parseInt(p));
          matchesPrice = room.price >= min && (max === undefined || room.price <= max);
        }
        
        return matchesSearch && matchesGuests && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low': return a.price - b.price;
          case 'price-high': return b.price - a.price;
          case 'guests': return b.maxGuests - a.maxGuests;
          default: return a.name.localeCompare(b.name);
        }
      });
  }, [rooms, searchTerm, priceRange, guestCount, sortBy]);

  const selectedRoomData = rooms.find(r => r.id === selectedRoom);

  if (currentView === 'admin') {
    return <AdminPanel />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl sm:text-2xl font-serif">Barrydale Karoo Boutique Hotel</h1>
            <nav className="flex space-x-4 sm:space-x-6">
              <button onClick={() => setCurrentView('home')} className="text-sm sm:text-base hover:text-yellow-400">Home</button>
              <button onClick={() => setCurrentView('admin')} className="text-sm sm:text-base hover:text-yellow-400">Admin</button>
            </nav>
          </div>
        </div>
      </header>

      <section className="relative h-screen flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969138608_e3c91bb8.webp)' }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative text-center text-white max-w-4xl px-4">
          <h2 className="text-4xl sm:text-6xl font-serif mb-6">Experience Luxury in the Karoo</h2>
          <p className="text-lg sm:text-xl mb-8">Discover unparalleled comfort and breathtaking landscapes at South Africa's premier boutique hotel</p>
          <button 
            onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-yellow-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-yellow-700 transition-all transform hover:scale-105 text-base sm:text-lg font-semibold"
          >
            Book Your Stay
          </button>
        </div>
      </section>

      <VirtualTour />

      <section id="rooms" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-serif text-slate-800 mb-4">Luxury Accommodations</h2>
            <p className="text-lg sm:text-xl text-slate-600">Choose from our collection of carefully curated rooms and suites</p>
          </div>

          <SearchFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            guestCount={guestCount}
            setGuestCount={setGuestCount}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBook={(roomId) => setSelectedRoom(roomId)}
                onViewDetails={(roomId) => alert(`Viewing details for room ${roomId}`)}
              />
            ))}
          </div>
        </div>
      </section>

      <RestaurantSection />
      <BarSection />
      <WineBoutique />
      <EventsSection onBookEvent={(eventId) => alert(`Booking event ${eventId}`)} />
      <MapSection />

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-serif mb-4">Contact</h3>
              <p className="text-sm">123 Karoo Road, Barrydale</p>
              <p className="text-sm">Phone: +27 28 572 1000</p>
              <p className="text-sm">Email: info@barrydalekaroo.co.za</p>
            </div>
            <div>
              <h3 className="text-xl font-serif mb-4">Amenities</h3>
              <ul className="space-y-2 text-sm">
                <li>Fine Dining Restaurant</li>
                <li>Premium Bar & Lounge</li>
                <li>Wine Boutique</li>
                <li>Event Facilities</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-serif mb-4">Services</h3>
              <ul className="space-y-2 text-sm">
                <li>Wedding Venues</li>
                <li>Corporate Events</li>
                <li>Wine Tastings</li>
                <li>Private Dining</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-serif mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <button className="hover:text-yellow-400 text-sm">Facebook</button>
                <button className="hover:text-yellow-400 text-sm">Instagram</button>
                <button className="hover:text-yellow-400 text-sm">Twitter</button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {selectedRoom && selectedRoomData && (
        <BookingModal
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          roomName={selectedRoomData.name}
          roomPrice={selectedRoomData.price}
        />
      )}
    </div>
  );
};

export default AppLayout;