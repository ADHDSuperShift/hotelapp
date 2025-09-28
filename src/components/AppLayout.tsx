import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { RoomCard } from './RoomCard';
import { BookingModal } from './BookingModal';
import { RoomDetailsModal } from './RoomDetailsModal';
import { SearchFilters } from './SearchFilters';
import { AdminPanel } from './AdminPanel';
import { VirtualTour } from './VirtualTour';
import { RestaurantSection } from './RestaurantSection';
import { BarSection } from './BarSection';
import { WineBoutique } from './WineBoutique';
import { EventsSection } from './EventsSection';
import { MapSection } from './MapSection';

const AppLayout: React.FC = () => {
  const { photos, rooms: ctxRooms, setRooms } = useAppContext();
  const [currentView, setCurrentView] = useState<'home' | 'accommodation' | 'restaurant' | 'bar' | 'events' | 'admin'>('home');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [guestCount, setGuestCount] = useState(0);
  const [sortBy, setSortBy] = useState('name');

  // Lightweight seed: if context is empty, set initial rooms once from this constant
  const seededRooms = [
    { 
      id: '1', 
      name: 'Presidential Karoo Suite', 
      images: [
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969143551_21b4a709.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969145361_ed87253d.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969147518_7539ab38.webp'
      ],
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969143551_21b4a709.webp', 
      price: 8500, 
      description: 'Our most luxurious suite featuring panoramic mountain views, private terrace, and exclusive amenities', 
      amenities: ['King Bed', 'Mountain View', 'Private Terrace', 'Butler Service', 'Champagne Bar', 'Marble Bathroom'], 
      maxGuests: 2,
      size: '120m²',
      features: ['Separate living area', 'Dining space', 'Walk-in closet', 'Premium linens']
    },
    { 
      id: '2', 
      name: 'Karoo Luxury Suite', 
      images: [
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969145361_ed87253d.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969147518_7539ab38.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969149296_97e82a5a.webp'
      ],
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969145361_ed87253d.webp', 
      price: 6200, 
      description: 'Premium suite with stunning garden and mountain views', 
      amenities: ['King Bed', 'Garden & Mountain View', 'Private Balcony', 'Mini Bar', 'Spa Bath'], 
      maxGuests: 2,
      size: '85m²',
      features: ['Sitting area', 'Mountain-facing balcony', 'Rainfall shower', 'Complimentary minibar']
    },
    { 
      id: '3', 
      name: 'Mountain Vista Suite', 
      images: [
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969147518_7539ab38.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969149296_97e82a5a.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969152522_f0e1c115.webp'
      ],
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969147518_7539ab38.webp', 
      price: 5800, 
      description: 'Spacious suite with dramatic Karoo landscapes and luxury amenities', 
      amenities: ['King Bed', 'Sitting Area', 'Fireplace', 'Spa Bath', 'Work Desk'], 
      maxGuests: 3,
      size: '75m²',
      features: ['Stone fireplace', 'Reading nook', 'Designer bathroom', 'Mountain views']
    },
    { 
      id: '4', 
      name: 'Executive Luxury Room', 
      images: [
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969149296_97e82a5a.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969152522_f0e1c115.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969154275_f9f83d3b.webp'
      ],
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969149296_97e82a5a.webp', 
      price: 4800, 
      description: 'Modern luxury for discerning business travelers', 
      amenities: ['Queen Bed', 'Executive Desk', 'High-Speed WiFi', 'Business Lounge Access', 'Premium Coffee'], 
      maxGuests: 2,
      size: '55m²',
      features: ['Ergonomic workspace', 'City view', 'Express laundry', 'Late checkout']
    },
    { 
      id: '5', 
      name: 'Deluxe Family Suite', 
      images: [
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969152522_f0e1c115.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969154275_f9f83d3b.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969143551_21b4a709.webp'
      ],
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969152522_f0e1c115.webp', 
      price: 6800, 
      description: 'Spacious family accommodation with connecting rooms and entertainment', 
      amenities: ['Two Bedrooms', 'Family Lounge', 'Kitchenette', 'Game Area', 'Kids Welcome Pack'], 
      maxGuests: 4,
      size: '95m²',
      features: ['Connecting rooms', 'Child-safe balcony', 'Family bathroom', 'Complimentary cribs']
    },
    { 
      id: '6', 
      name: 'Romantic Honeymoon Suite', 
      images: [
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969154275_f9f83d3b.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969143551_21b4a709.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969145361_ed87253d.webp'
      ],
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969154275_f9f83d3b.webp', 
      price: 7200, 
      description: 'Intimate luxury setting perfect for couples and special occasions', 
      amenities: ['King Bed', 'Jacuzzi', 'Champagne Service', 'Rose Petals', 'Couples Massage'], 
      maxGuests: 2,
      size: '70m²',
      features: ['Heart-shaped jacuzzi', 'Romantic lighting', 'Private dining', 'Sunset views']
    },
    { 
      id: '7', 
      name: 'Garden Terrace Suite', 
      images: [
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969147518_7539ab38.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969149296_97e82a5a.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969152522_f0e1c115.webp'
      ],
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969147518_7539ab38.webp', 
      price: 5200, 
      description: 'Ground floor suite with direct garden access and private terrace', 
      amenities: ['Queen Bed', 'Private Garden Access', 'Outdoor Shower', 'Coffee Machine', 'Garden View'], 
      maxGuests: 2,
      size: '65m²',
      features: ['Direct garden access', 'Outdoor rain shower', 'Private terrace', 'Garden furniture']
    },
    { 
      id: '8', 
      name: 'Wellness Retreat Room', 
      images: [
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969145361_ed87253d.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969147518_7539ab38.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969154275_f9f83d3b.webp'
      ],
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969145361_ed87253d.webp', 
      price: 4600, 
      description: 'Zen-inspired room focused on relaxation and wellness', 
      amenities: ['King Bed', 'Meditation Corner', 'Yoga Mat', 'Essential Oils', 'Herbal Tea Selection'], 
      maxGuests: 2,
      size: '60m²',
      features: ['Meditation space', 'Aromatherapy', 'Soundproofed', 'Organic amenities']
    },
    { 
      id: '9', 
      name: 'Heritage Classic Room', 
      images: [
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969149296_97e82a5a.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969152522_f0e1c115.webp',
        'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969143551_21b4a709.webp'
      ],
      image: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969149296_97e82a5a.webp', 
      price: 3800, 
      description: 'Elegantly restored room featuring original architectural details', 
      amenities: ['Queen Bed', 'Antique Furniture', 'Original Fireplace', 'Heritage Views', 'Classic Decor'], 
      maxGuests: 2,
      size: '50m²',
      features: ['Period furniture', 'Historical charm', 'Original features', 'Heritage courtyard view']
    }
  ];

  const rooms = ctxRooms.length ? ctxRooms : seededRooms;

  // Make seed available to AppContext hydration path if needed on first mount
  useEffect(() => {
    (window as any).__ROOMS_SEED__ = seededRooms
    // If there are no rooms yet in context, initialize once
    if (!ctxRooms.length) {
      setRooms(seededRooms)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  const selectedRoomDetailsData = rooms.find(r => r.id === selectedRoomDetails);

  if (currentView === 'admin') {
    return <AdminPanel />;
  }

  if (currentView === 'accommodation') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-slate-900 text-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl sm:text-2xl font-serif">Barrydale Karoo Boutique Hotel</h1>
              <nav className="flex space-x-4 sm:space-x-6">
                <button onClick={() => setCurrentView('home')} className="text-sm sm:text-base hover:text-yellow-400">Home</button>
                <button onClick={() => setCurrentView('accommodation')} className="text-sm sm:text-base hover:text-yellow-400 text-yellow-400">Accommodation</button>
                <button onClick={() => setCurrentView('restaurant')} className="text-sm sm:text-base hover:text-yellow-400">Restaurant</button>
                <button onClick={() => setCurrentView('bar')} className="text-sm sm:text-base hover:text-yellow-400">Bar</button>
                <button onClick={() => setCurrentView('events')} className="text-sm sm:text-base hover:text-yellow-400">Events</button>
                <button onClick={() => setCurrentView('admin')} className="text-sm sm:text-base hover:text-yellow-400">Admin</button>
              </nav>
            </div>
          </div>
        </header>
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {filteredRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onBookNow={setSelectedRoom}
                  onViewDetails={setSelectedRoomDetails}
                />
              ))}
            </div>
          </div>
        </main>
        {selectedRoom && selectedRoomData && (
          <BookingModal
            isOpen={!!selectedRoom}
            onClose={() => setSelectedRoom(null)}
            roomName={selectedRoomData.name}
            roomPrice={selectedRoomData.price}
          />
        )}
        {selectedRoomDetails && selectedRoomDetailsData && (
          <RoomDetailsModal
            room={selectedRoomDetailsData}
            isOpen={!!selectedRoomDetails}
            onClose={() => setSelectedRoomDetails(null)}
            onBookNow={(roomId) => {
              setSelectedRoomDetails(null);
              setSelectedRoom(roomId);
            }}
          />
        )}
      </div>
    );
  }

  if (currentView === 'restaurant') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-slate-900 text-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl sm:text-2xl font-serif">Barrydale Karoo Boutique Hotel</h1>
              <nav className="flex space-x-4 sm:space-x-6">
                <button onClick={() => setCurrentView('home')} className="text-sm sm:text-base hover:text-yellow-400">Home</button>
                <button onClick={() => setCurrentView('accommodation')} className="text-sm sm:text-base hover:text-yellow-400">Accommodation</button>
                <button onClick={() => setCurrentView('restaurant')} className="text-sm sm:text-base hover:text-yellow-400 text-yellow-400">Restaurant</button>
                <button onClick={() => setCurrentView('bar')} className="text-sm sm:text-base hover:text-yellow-400">Bar</button>
                <button onClick={() => setCurrentView('events')} className="text-sm sm:text-base hover:text-yellow-400">Events</button>
                <button onClick={() => setCurrentView('admin')} className="text-sm sm:text-base hover:text-yellow-400">Admin</button>
              </nav>
            </div>
          </div>
        </header>
        <main className="p-6">
          <RestaurantSection />
        </main>
      </div>
    );
  }

  if (currentView === 'bar') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-slate-900 text-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl sm:text-2xl font-serif">Barrydale Karoo Boutique Hotel</h1>
              <nav className="flex space-x-4 sm:space-x-6">
                <button onClick={() => setCurrentView('home')} className="text-sm sm:text-base hover:text-yellow-400">Home</button>
                <button onClick={() => setCurrentView('accommodation')} className="text-sm sm:text-base hover:text-yellow-400">Accommodation</button>
                <button onClick={() => setCurrentView('restaurant')} className="text-sm sm:text-base hover:text-yellow-400">Restaurant</button>
                <button onClick={() => setCurrentView('bar')} className="text-sm sm:text-base hover:text-yellow-400 text-yellow-400">Bar</button>
                <button onClick={() => setCurrentView('events')} className="text-sm sm:text-base hover:text-yellow-400">Events</button>
                <button onClick={() => setCurrentView('admin')} className="text-sm sm:text-base hover:text-yellow-400">Admin</button>
              </nav>
            </div>
          </div>
        </header>
        <main className="p-6">
          <BarSection />
          <WineBoutique />
        </main>
      </div>
    );
  }

  if (currentView === 'events') {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-slate-900 text-white sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl sm:text-2xl font-serif">Barrydale Karoo Boutique Hotel</h1>
              <nav className="flex space-x-4 sm:space-x-6">
                <button onClick={() => setCurrentView('home')} className="text-sm sm:text-base hover:text-yellow-400 text-yellow-400">Home</button>
                <button onClick={() => setCurrentView('accommodation')} className="text-sm sm:text-base hover:text-yellow-400">Accommodation</button>
                <button onClick={() => setCurrentView('restaurant')} className="text-sm sm:text-base hover:text-yellow-400">Restaurant</button>
                <button onClick={() => setCurrentView('bar')} className="text-sm sm:text-base hover:text-yellow-400">Bar</button>
                <button onClick={() => setCurrentView('events')} className="text-sm sm:text-base hover:text-yellow-400">Events</button>
                <button onClick={() => setCurrentView('admin')} className="text-sm sm:text-base hover:text-yellow-400">Admin</button>
              </nav>
            </div>
          </div>
        </header>
        <main className="p-6">
          <EventsSection />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl sm:text-2xl font-serif">Barrydale Karoo Boutique Hotel</h1>
            <nav className="flex space-x-4 sm:space-x-6">
              <button onClick={() => setCurrentView('home')} className="text-sm sm:text-base hover:text-yellow-400">Home</button>
              <button onClick={() => setCurrentView('accommodation')} className="text-sm sm:text-base hover:text-yellow-400">Accommodation</button>
              <button onClick={() => setCurrentView('restaurant')} className="text-sm sm:text-base hover:text-yellow-400">Restaurant</button>
              <button onClick={() => setCurrentView('bar')} className="text-sm sm:text-base hover:text-yellow-400">Bar</button>
              <button onClick={() => setCurrentView('events')} className="text-sm sm:text-base hover:text-yellow-400">Events</button>
              <button onClick={() => setCurrentView('admin')} className="text-sm sm:text-base hover:text-yellow-400">Admin</button>
            </nav>
          </div>
        </div>
      </header>

      <section className="relative h-screen flex items-center justify-center">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${(photos.find(p => p.section === 'hero')?.url) || 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969138608_e3c91bb8.webp' })` }}
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
                onBookNow={(roomId) => setSelectedRoom(roomId)}
                onViewDetails={setSelectedRoomDetails}
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

      {selectedRoomDetails && selectedRoomDetailsData && (
        <RoomDetailsModal
          room={selectedRoomDetailsData}
          isOpen={!!selectedRoomDetails}
          onClose={() => setSelectedRoomDetails(null)}
          onBookNow={(roomId) => {
            setSelectedRoomDetails(null);
            setSelectedRoom(roomId);
          }}
        />
      )}
    </div>
  );
};

export default AppLayout;