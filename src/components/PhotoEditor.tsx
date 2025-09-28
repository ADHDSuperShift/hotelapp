import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, ImageIcon, Trash2, Edit2, FolderOpen, Star } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { idbLoadPhotos, idbSavePhotos } from '@/lib/persistence'
import { configureAmplify } from '@/lib/amplify'
import { downloadPhotosCloud, uploadPhotosCloud, uploadImageToCloud } from '@/lib/cloudSync'
import { useAppContext } from '@/contexts/AppContext'

type Photo = {
  id: string
  url: string
  title: string
  section: string
  featured: boolean
  order: number
}

type SectionGroup = {
  name: string
  key: string
  sections: { key: string; label: string }[]
}

const STORAGE_KEY = 'hotel.photoEditor.photos.v1'

const initialSeed: Photo[] = [
  { id: 'p1', url: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969138608_e3c91bb8.webp', title: 'Homepage Hero', section: 'hero', featured: true, order: 0 },
  { id: 'p2', url: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969786734_f2deb808.webp', title: 'Restaurant Cover', section: 'restaurant', featured: true, order: 0 },
  { id: 'p3', url: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969790377_b96b5579.webp', title: 'Bar Lounge', section: 'bar', featured: false, order: 0 },
  { id: 'p4', url: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969794284_13db8d39.webp', title: 'Wine Boutique', section: 'wine-boutique', featured: false, order: 0 },
  { id: 'p5', url: '/placeholder.svg', title: 'Map Placeholder', section: 'map', featured: false, order: 0 },
  { id: 'p6', url: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969143551_21b4a709.webp', title: 'Presidential Karoo Suite', section: 'presidential-karoo-suite', featured: true, order: 0 },
  { id: 'p7', url: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969145361_ed87253d.webp', title: 'Karoo Luxury Suite', section: 'karoo-luxury-suite', featured: false, order: 0 },
  { id: 'p8', url: 'https://d64gsuwffb70l.cloudfront.net/68d7bd0a24155df4f21072e9_1758969147518_7539ab38.webp', title: 'Mountain Vista Suite', section: 'mountain-vista-suite', featured: false, order: 0 },
]

const PhotoEditor = () => {
  const { photos, setPhotos } = useAppContext()
  const [syncing, setSyncing] = useState(false)
  
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null)
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSection, setEditSection] = useState('')
  const [editFeatured, setEditFeatured] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Cloud-first: upload images to S3 and store their public URL

  // Load/save from localStorage (frontend-only persistence)
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
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed: Photo[] = JSON.parse(raw)
          setPhotos(parsed)
          return
        }
      } catch {}
      setPhotos(initialSeed)
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try { await idbSavePhotos(photos) } catch {}
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(photos)) } catch {}
    })()
  }, [photos])

  // Canonical section groups matching the app
  const sectionGroups: SectionGroup[] = [
    {
      name: 'Public Areas',
      key: 'public-areas',
      sections: [
        { key: 'hero', label: 'Hero' },
        { key: 'virtual-tour', label: 'Virtual Tour' },
        { key: 'restaurant', label: 'Restaurant' },
        { key: 'bar', label: 'Bar' },
        { key: 'wine-boutique', label: 'Wine Boutique' },
        { key: 'events', label: 'Events' },
        { key: 'map', label: 'Map' },
      ],
    },
    {
      name: 'Accommodations',
      key: 'accommodations',
      sections: [
        { key: 'presidential-karoo-suite', label: 'Presidential Karoo Suite' },
        { key: 'karoo-luxury-suite', label: 'Karoo Luxury Suite' },
        { key: 'mountain-vista-suite', label: 'Mountain Vista Suite' },
        { key: 'executive-luxury-room', label: 'Executive Luxury Room' },
        { key: 'deluxe-family-suite', label: 'Deluxe Family Suite' },
        { key: 'romantic-honeymoon-suite', label: 'Romantic Honeymoon Suite' },
        { key: 'garden-terrace-suite', label: 'Garden Terrace Suite' },
        { key: 'wellness-retreat-room', label: 'Wellness Retreat Room' },
        { key: 'heritage-classic-room', label: 'Heritage Classic Room' },
      ],
    },
  ]

  const allSections = useMemo(() => sectionGroups.flatMap(g => g.sections.map(s => s.key)), [sectionGroups])

  const handleEditPhoto = (photo: Photo) => {
    setEditingPhoto(photo)
    setEditTitle(photo.title)
    setEditSection(photo.section)
    setEditFeatured(photo.featured)
    setNewPhotoFile(null)
  }

  const handleSaveEdit = async () => {
    if (!editingPhoto) return

    let newUrl: string | undefined
    if (newPhotoFile) {
      try {
        configureAmplify()
        const up = await uploadImageToCloud(newPhotoFile)
        newUrl = up.url
      } catch {
        newUrl = undefined
      }
    }

    const updatedPhotos = photos.map(photo =>
      photo.id === editingPhoto.id
        ? {
            ...photo,
            title: editTitle,
            section: editSection,
            featured: editFeatured,
            url: newUrl ?? photo.url,
          }
        : photo
    )
    
    setPhotos(updatedPhotos)
    setEditingPhoto(null)
    setNewPhotoFile(null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setNewPhotoFile(file)
    }
  }

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(photos.filter(photo => photo.id !== photoId))
  }

  const getPhotosBySection = (section: string) => {
    return photos
      .filter(photo => photo.section === section)
      .sort((a, b) => a.order - b.order)
  }

  // DnD sensors
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(String(active.id))
    const item = photos.find(p => p.id === String(active.id))
    setActiveSection(item?.section ?? null)
  }

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return
    const activePhoto = photos.find(p => p.id === String(active.id))
    if (!activePhoto) return

    // If hovering another photo, adopt its section
    const overPhoto = photos.find(p => p.id === String(over.id))
    if (overPhoto && overPhoto.section !== activePhoto.section) {
      setActiveSection(overPhoto.section)
    }

    // If hovering a container (section id)
    if (!overPhoto && allSections.includes(String(over.id))) {
      setActiveSection(String(over.id))
    }
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return
    const activeIdStr = String(active.id)
    const overIdStr = String(over.id)

    const activePhoto = photos.find(p => p.id === activeIdStr)
    const overPhoto = photos.find(p => p.id === overIdStr)

    if (!activePhoto) return

    // Move within same section (reorder)
    if (overPhoto && overPhoto.section === activePhoto.section) {
      const section = activePhoto.section
      const items = getPhotosBySection(section)
      const oldIndex = items.findIndex(p => p.id === activeIdStr)
      const newIndex = items.findIndex(p => p.id === overIdStr)
      if (oldIndex === -1 || newIndex === -1) return
      const reordered = arrayMove(items, oldIndex, newIndex)
      // apply new order
      const updated = photos.map(p => {
        if (p.section !== section) return p
        const idx = reordered.findIndex(x => x.id === p.id)
        return idx === -1 ? p : { ...p, order: idx }
      })
      setPhotos(updated)
      return
    }

    // Move across sections
    let targetSection: string | null = null
    if (overPhoto) {
      targetSection = overPhoto.section
    } else if (allSections.includes(overIdStr)) {
      targetSection = overIdStr
    }
    if (targetSection && targetSection !== activePhoto.section) {
      const maxOrder = Math.max(-1, ...getPhotosBySection(targetSection).map(p => p.order))
      setPhotos(prev => prev.map(p => p.id === activeIdStr ? { ...p, section: targetSection!, order: maxOrder + 1 } : p))
    }
  }

  const addPhotoToSection = async (file: File, section: string) => {
    let url = ''
    try {
      configureAmplify()
      const up = await uploadImageToCloud(file)
      url = up.url
    } catch {
      url = ''
    }
    const maxOrder = Math.max(-1, ...getPhotosBySection(section).map(p => p.order))
    const newPhoto: Photo = {
      id: `p_${Date.now()}`,
      url,
      title: file.name.replace(/\.[^.]+$/, ''),
      section,
      featured: false,
      order: maxOrder + 1,
    }
    setPhotos(prev => [...prev, newPhoto])
  }

  const SectionGrid: React.FC<{ sectionKey: string }> = ({ sectionKey }) => {
    const items = getPhotosBySection(sectionKey)
    const { setNodeRef } = useDroppable({ id: sectionKey })
    return (
      <div ref={setNodeRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" id={`grid-${sectionKey}`}>
        <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
          {items.map(photo => (
            <SortablePhotoCard key={photo.id} photo={photo} onEdit={() => handleEditPhoto(photo)} onDelete={() => handleDeletePhoto(photo.id)} />
          ))}
        </SortableContext>
        {/* Add tile */}
        <label className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
          <div className="text-center p-2">
            <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Add Photo</p>
          </div>
          <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) await addPhotoToSection(file, sectionKey)
            e.currentTarget.value = ''
          }} />
        </label>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Photo Editor</h1>
          <p className="text-muted-foreground">Manage hotel photos by section</p>
        </div>
  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button className="flex-1 sm:flex-none" onClick={() => {
            const data = JSON.stringify(photos, null, 2)
            const blob = new Blob([data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'photos.json'
            a.click()
            URL.revokeObjectURL(url)
          }}>
            <Upload className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <label className="inline-flex">
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                try {
                  const text = await file.text()
                  const parsed = JSON.parse(text)
                  if (Array.isArray(parsed)) {
                    // rudimentary validation
                    const normalized = parsed
                      .filter((p: any) => p && typeof p.id === 'string' && typeof p.url === 'string')
                      .map((p: any): Photo => ({
                        id: String(p.id),
                        url: String(p.url),
                        title: String(p.title ?? ''),
                        section: String(p.section ?? 'hero'),
                        featured: Boolean(p.featured),
                        order: Number.isFinite(p.order) ? Number(p.order) : 0,
                      }))
                    setPhotos(normalized)
                  }
                } catch (err) {
                  console.error('Import failed', err)
                } finally {
                  e.currentTarget.value = ''
                }
              }}
            />
            <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={(ev) => {
              const input = (ev.currentTarget.previousSibling as HTMLInputElement)
              input?.click()
            }}>
              Import JSON
            </Button>
          </label>
          <Button type="button" variant="outline" className="flex-1 sm:flex-none" onClick={() => {
            try { localStorage.removeItem(STORAGE_KEY) } catch {}
            setPhotos(initialSeed)
          }}>Reset</Button>
          <Button type="button" variant="outline" className="flex-1 sm:flex-none" disabled={syncing} onClick={async () => {
            setSyncing(true)
            try {
              configureAmplify()
              const cloud = await downloadPhotosCloud()
              if (cloud && Array.isArray(cloud)) {
                setPhotos(cloud as any)
                alert('Pulled from Amplify Storage')
              } else {
                alert('No cloud photos found')
              }
            } catch (e) {
              alert('Pull failed. Ensure Amplify Storage is configured.')
            } finally {
              setSyncing(false)
            }
          }}>Pull Cloud</Button>
          <Button type="button" variant="outline" className="flex-1 sm:flex-none" disabled={syncing} onClick={async () => {
            setSyncing(true)
            try {
              configureAmplify()
              await uploadPhotosCloud(photos as any)
              alert('Pushed to Amplify Storage')
            } catch (e) {
              alert('Push failed. Ensure Amplify Storage is configured.')
            } finally {
              setSyncing(false)
            }
          }}>Push Cloud</Button>
        </div>
      </div>
  <DndContext sensors={sensors} onDragStart={onDragStart} onDragOver={onDragOver} onDragEnd={onDragEnd}>
        <Tabs defaultValue={sectionGroups[0].key} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            {sectionGroups.map(group => (
              <TabsTrigger key={group.key} value={group.key}>{group.name}</TabsTrigger>
            ))}
          </TabsList>

          {sectionGroups.map(group => (
            <TabsContent key={group.key} value={group.key} className="space-y-6">
              <div className="grid gap-6">
                {group.sections.map(section => {
                  const sectionPhotos = getPhotosBySection(section.key)
                  return (
                    <Card key={section.key} className="w-full" id={section.key}>
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <FolderOpen className="w-5 h-5" />
                            {section.label}
                          </CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {sectionPhotos.length} photos
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <SectionGrid sectionKey={section.key} />
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Edit dialog controlled at parent level */}
        <Dialog open={!!editingPhoto} onOpenChange={(open) => !open && setEditingPhoto(null)}>
          <DialogContent className="max-w-sm sm:max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Photo</DialogTitle>
            </DialogHeader>
            {editingPhoto && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={newPhotoFile ? URL.createObjectURL(newPhotoFile) : editingPhoto.url}
                      alt={editingPhoto.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Photo title"
                  />

                  <Select value={editSection} onValueChange={setEditSection}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sectionGroups.map(group => (
                        <React.Fragment key={group.key}>
                          {group.sections.map(s => (
                            <SelectItem key={s.key} value={s.key}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={editFeatured}
                      onChange={(e) => setEditFeatured(e.target.checked)}
                    />
                    <label htmlFor="featured" className="text-sm">
                      Featured Photo
                    </label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveEdit} className="flex-1" size="sm">Save Changes</Button>
                  <Button onClick={() => setEditingPhoto(null)} variant="outline" className="flex-1" size="sm">Cancel</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <DragOverlay dropAnimation={null}>
          {activeId ? (
            (() => {
              const p = photos.find(ph => ph.id === activeId)
              if (!p) return null
              return (
                <div className="w-[260px]">
                  <div className="relative">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-xl">
                      <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                    {p.featured && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500 text-white">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium truncate">{p.title}</p>
                </div>
              )
            })()
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

export default PhotoEditor

// Sortable photo card
const SortablePhotoCard: React.FC<{ photo: Photo; onEdit: () => void; onDelete: () => void }> = ({ photo, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.9 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
        <img src={photo.url} alt={photo.title} className="w-full h-full object-cover select-none" {...attributes} {...listeners} />
        {photo.featured && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-yellow-500 text-white">
              <Star className="w-3 h-3 mr-1" />
              Featured
            </Badge>
          </div>
        )}
      </div>
      <div className="mt-2 space-y-2">
        <p className="text-sm font-medium truncate">{photo.title}</p>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" className="flex-1" onClick={onEdit}>
            <Edit2 className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={onDelete} className="px-2">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}