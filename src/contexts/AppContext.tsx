import React, { createContext, useContext, useState, useEffect } from 'react';
import { idbLoadPhotos, idbSavePhotos, idbLoadRooms, idbSaveRooms } from '@/lib/persistence';
import type { Photo } from '@/types/photos';
import type { Room } from '@/types/rooms';

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  photos: Photo[];
  setPhotos: React.Dispatch<React.SetStateAction<Photo[]>>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

const defaultAppContext: AppContextType = {
  sidebarOpen: false,
  toggleSidebar: () => {},
  photos: [],
  setPhotos: () => {},
  rooms: [],
  setRooms: () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  // hydrate shared photos from IndexedDB/localStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const idb = await idbLoadPhotos<Photo[]>()
        if (idb && Array.isArray(idb)) {
          setPhotos(idb)
          return
        }
      } catch {}
      try {
        const raw = localStorage.getItem('hotel.photoEditor.photos.v1')
        if (raw) {
          const parsed: Photo[] = JSON.parse(raw)
          setPhotos(parsed)
          return
        }
      } catch {}
    })()
  }, [])

  // keep IDB in sync when photos change from anywhere
  useEffect(() => {
    (async () => {
      try { await idbSavePhotos(photos) } catch {}
      try { localStorage.setItem('hotel.photoEditor.photos.v1', JSON.stringify(photos)) } catch {}
    })()
  }, [photos])

  // hydrate rooms from IndexedDB/localStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const idb = await idbLoadRooms<Room[]>()
        if (idb && Array.isArray(idb)) {
          setRooms(idb)
          return
        }
      } catch {}
      try {
        const raw = localStorage.getItem('hotel.rooms.v1')
        if (raw) {
          const parsed: Room[] = JSON.parse(raw)
          setRooms(parsed)
          return
        }
      } catch {}
      // optional seed from window if provided by the app shell
      try {
        const seed = (window as any).__ROOMS_SEED__ as Room[] | undefined
        if (seed && seed.length) {
          setRooms(seed)
        }
      } catch {}
    })()
  }, [])

  // keep rooms persisted when they change
  useEffect(() => {
    (async () => {
      try { await idbSaveRooms(rooms) } catch {}
      try { localStorage.setItem('hotel.rooms.v1', JSON.stringify(rooms)) } catch {}
    })()
  }, [rooms])

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        photos,
        setPhotos,
  rooms,
  setRooms,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
