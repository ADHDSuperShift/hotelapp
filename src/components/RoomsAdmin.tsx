import React, { useState } from 'react'
import { useAppContext } from '@/contexts/AppContext'
import type { Room } from '@/types/rooms'
import { configureAmplify } from '@/lib/amplify'
import { downloadRoomsCloud, uploadRoomsCloud, uploadImageToCloud } from '@/lib/cloudSync'

const emptyRoom = (): Room => ({
  id: crypto.randomUUID(),
  name: '',
  image: '',
  images: ['', '', ''],
  price: 0,
  description: '',
  amenities: [],
  maxGuests: 2,
  size: '',
  features: []
})

export const RoomsAdmin: React.FC = () => {
  const { rooms, setRooms } = useAppContext()
  const [editing, setEditing] = useState<Room | null>(null)
  const [syncing, setSyncing] = useState(false)

  const upsertRoom = (room: Room) => {
    setRooms(prev => {
      const idx = prev.findIndex(r => r.id === room.id)
      if (idx === -1) return [...prev, room]
      const next = [...prev]
      next[idx] = room
      return next
    })
    setEditing(null)
  }

  const removeRoom = (id: string) => {
    if (!confirm('Delete this room?')) return
    setRooms(prev => prev.filter(r => r.id !== id))
  }

  const onEdit = (room: Room) => setEditing(room)
  const onAdd = () => setEditing(emptyRoom())

  const pullFromCloud = async () => {
    setSyncing(true)
    try {
      configureAmplify()
      const cloud = await downloadRoomsCloud()
      if (cloud && Array.isArray(cloud)) {
        setRooms(cloud)
        alert('Rooms pulled from cloud')
      } else {
        alert('No cloud rooms found')
      }
    } catch (e) {
      alert('Cloud pull failed. Ensure Amplify Storage is configured.')
    } finally {
      setSyncing(false)
    }
  }

  const pushToCloud = async () => {
    setSyncing(true)
    try {
      configureAmplify()
      await uploadRoomsCloud(rooms)
      alert('Rooms pushed to cloud')
    } catch (e) {
      alert('Cloud push failed. Ensure Amplify Storage is configured.')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-800">Rooms Management</h2>
        <div className="flex gap-2">
          <button onClick={pullFromCloud} disabled={syncing} className="border px-3 py-2 rounded hover:bg-slate-50">Pull from Cloud</button>
          <button onClick={pushToCloud} disabled={syncing} className="border px-3 py-2 rounded hover:bg-slate-50">Push to Cloud</button>
          <button onClick={onAdd} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">Add Room</button>
        </div>
      </div>

      {/* List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map(room => (
          <div key={room.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="aspect-video bg-slate-100 rounded mb-3 overflow-hidden">
              {room.image ? (
                <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>
              )}
            </div>
            <div className="font-semibold">{room.name || 'Untitled Room'}</div>
            <div className="text-sm text-slate-600">R{room.price} • {room.maxGuests} guests • {room.size || 'size N/A'}</div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => onEdit(room)} className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-50">Edit</button>
              <button onClick={() => removeRoom(room.id)} className="px-3 py-1 rounded border border-red-300 text-red-600 hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Drawer/Modal - simple inline card for now */}
      {editing && (
        <div className="border rounded-xl p-4 bg-white shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{editing.name ? 'Edit Room' : 'New Room'}</h3>
            <button onClick={() => setEditing(null)} className="text-slate-500 hover:text-slate-700">✕</button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (R)</label>
              <input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: Number(e.target.value) })} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Guests</label>
              <input type="number" value={editing.maxGuests} onChange={e => setEditing({ ...editing, maxGuests: Number(e.target.value) })} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Size</label>
              <input value={editing.size} onChange={e => setEditing({ ...editing, size: e.target.value })} className="w-full p-2 border rounded" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} className="w-full p-2 border rounded h-24" />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
              {editing.images.map((img, i) => (
                <div key={i} className="space-y-2">
                  <label className="block text-sm font-medium mb-1">Image {i + 1} URL</label>
                  <input value={img} onChange={e => {
                    const next = [...editing.images]
                    next[i] = e.target.value
                    setEditing({ ...editing, images: next, image: next[0] || editing.image })
                  }} className="w-full p-2 border rounded" />
                  <input type="file" accept="image/*" onChange={async e => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    try {
                      configureAmplify()
                      const up = await uploadImageToCloud(file)
                      const next = [...editing.images]
                      next[i] = up.url
                      setEditing({ ...editing, images: next, image: next[0] || editing.image })
                    } finally {
                      e.currentTarget.value = ''
                    }
                  }} className="w-full p-2 border rounded" />
                </div>
              ))}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Amenities (comma separated)</label>
              <input value={editing.amenities.join(', ')} onChange={e => setEditing({ ...editing, amenities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full p-2 border rounded" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Features (comma separated)</label>
              <input value={editing.features.join(', ')} onChange={e => setEditing({ ...editing, features: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} className="w-full p-2 border rounded" />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={() => editing && upsertRoom(editing)} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">Save Room</button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded border">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomsAdmin
