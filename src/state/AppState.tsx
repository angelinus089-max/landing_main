import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { ArtistItem, Exhibition, InquiryData, LeadData, SpaceItem } from '../types'
import { supabase } from '../lib/supabase'
import {
  addTagApi,
  createArtist,
  createExhibition,
  createInquiry,
  createLead,
  createSpace,
  deleteArtist,
  deleteArtistsBulkApi,
  deleteExhibition,
  deleteExhibitionsBulkApi,
  deleteInquiriesApi,
  deleteLeadsApi,
  deleteSpace,
  deleteSpacesBulkApi,
  fetchArtists,
  fetchExhibitions,
  fetchInquiries,
  fetchLeads,
  fetchSiteInstagram,
  fetchSpaces,
  fetchTags,
  reorderArtistsApi,
  reorderExhibitionsApi,
  reorderSpacesApi,
  removeTagApi,
  updateArtist,
  updateExhibition,
  updateInquiryMemoApi,
  updateInquiryStatusApi,
  updateLeadMemoApi,
  updateLeadStatusApi,
  updateSiteInstagramApi,
  updateSpace,
} from '../lib/api'

interface AppStateShape {
  leads: LeadData[]
  addLead: (lead: Omit<LeadData, 'id' | 'status' | 'memo'>) => Promise<void>
  updateLeadStatus: (id: string, status: LeadData['status']) => Promise<void>
  updateLeadMemo: (id: string, memo: string) => Promise<void>
  deleteLeads: (ids: string[]) => Promise<void>

  inquiries: InquiryData[]
  addInquiry: (inquiry: Omit<InquiryData, 'id' | 'status' | 'memo'>) => Promise<void>
  updateInquiryStatus: (id: string, status: InquiryData['status']) => Promise<void>
  updateInquiryMemo: (id: string, memo: string) => Promise<void>
  deleteInquiries: (ids: string[]) => Promise<void>

  exhibitions: Exhibition[]
  addExhibition: (item: Omit<Exhibition, 'id'>) => Promise<void>
  updateExhibitionItem: (item: Exhibition) => Promise<void>
  deleteExhibitionItem: (id: string) => Promise<void>
  deleteExhibitionsBulk: (ids: string[]) => Promise<void>
  reorderExhibitions: (orderedIds: string[]) => Promise<void>

  spaces: SpaceItem[]
  addSpace: (item: Omit<SpaceItem, 'id'>) => Promise<void>
  updateSpaceItem: (item: SpaceItem) => Promise<void>
  deleteSpaceItem: (id: string) => Promise<void>
  deleteSpacesBulk: (ids: string[]) => Promise<void>
  reorderSpaces: (orderedIds: string[]) => Promise<void>

  artists: ArtistItem[]
  addArtist: (item: Omit<ArtistItem, 'id'>) => Promise<void>
  updateArtistItem: (item: ArtistItem) => Promise<void>
  deleteArtistItem: (id: string) => Promise<void>
  deleteArtistsBulk: (ids: string[]) => Promise<void>
  reorderArtists: (orderedIds: string[]) => Promise<void>

  moodTags: string[]
  addMoodTag: (label: string) => Promise<void>
  removeMoodTag: (label: string) => Promise<void>
  genreTags: string[]
  addGenreTag: (label: string) => Promise<void>
  removeGenreTag: (label: string) => Promise<void>

  siteInstagram: string
  updateSiteInstagram: (instagram: string) => Promise<void>
}

const AppStateContext = createContext<AppStateShape | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<LeadData[]>([])
  const [inquiries, setInquiries] = useState<InquiryData[]>([])
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([])
  const [spaces, setSpaces] = useState<SpaceItem[]>([])
  const [artists, setArtists] = useState<ArtistItem[]>([])
  const [moodTags, setMoodTags] = useState<string[]>([])
  const [genreTags, setGenreTags] = useState<string[]>([])
  const [siteInstagram, setSiteInstagram] = useState('')

  async function loadPublicContent() {
    const [ex, sp, ar, insta] = await Promise.all([
      fetchExhibitions().catch((err) => { console.error('전시 로딩 실패:', err); return [] }),
      fetchSpaces().catch((err) => { console.error('공간 로딩 실패:', err); return [] }),
      fetchArtists().catch((err) => { console.error('작가 로딩 실패:', err); return [] }),
      fetchSiteInstagram().catch(() => ''),
    ])
    setExhibitions(ex)
    setSpaces(sp)
    setArtists(ar)
    setSiteInstagram(insta)
  }

  async function loadAdminOnlyData() {
    try {
      const [leadRows, inquiryRows, mood, genre] = await Promise.all([
        fetchLeads(),
        fetchInquiries(),
        fetchTags('mood'),
        fetchTags('genre'),
      ])
      setLeads(leadRows)
      setInquiries(inquiryRows)
      setMoodTags(mood)
      setGenreTags(genre)
    } catch {
      setLeads([])
      setInquiries([])
      setMoodTags([])
      setGenreTags([])
    }
  }

  useEffect(() => {
    loadPublicContent()
    loadAdminOnlyData()

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') loadAdminOnlyData()
      if (event === 'SIGNED_OUT') {
        setLeads([])
        setInquiries([])
        setMoodTags([])
        setGenreTags([])
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const value: AppStateShape = {
    leads,
    addLead: async (lead) => {
      await createLead(lead)
      await loadAdminOnlyData()
    },
    updateLeadStatus: async (id, status) => {
      await updateLeadStatusApi(id, status)
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    },
    updateLeadMemo: async (id, memo) => {
      await updateLeadMemoApi(id, memo)
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, memo } : l)))
    },
    deleteLeads: async (ids) => {
      await deleteLeadsApi(ids)
      setLeads((prev) => prev.filter((l) => !ids.includes(l.id)))
    },

    inquiries,
    addInquiry: async (inquiry) => {
      await createInquiry(inquiry)
      await loadAdminOnlyData()
    },
    updateInquiryStatus: async (id, status) => {
      await updateInquiryStatusApi(id, status)
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
    },
    updateInquiryMemo: async (id, memo) => {
      await updateInquiryMemoApi(id, memo)
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, memo } : i)))
    },
    deleteInquiries: async (ids) => {
      await deleteInquiriesApi(ids)
      setInquiries((prev) => prev.filter((i) => !ids.includes(i.id)))
    },

    exhibitions,
    addExhibition: async (item) => {
      const created = await createExhibition(item)
      setExhibitions((prev) => [...prev, created])
    },
    updateExhibitionItem: async (item) => {
      const updated = await updateExhibition(item)
      setExhibitions((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
    },
    deleteExhibitionItem: async (id) => {
      await deleteExhibition(id)
      setExhibitions((prev) => prev.filter((e) => e.id !== id))
    },
    deleteExhibitionsBulk: async (ids) => {
      await deleteExhibitionsBulkApi(ids)
      setExhibitions((prev) => prev.filter((e) => !ids.includes(e.id)))
    },
    reorderExhibitions: async (orderedIds) => {
      await reorderExhibitionsApi(orderedIds)
      setExhibitions((prev) => orderedIds.map((id) => prev.find((e) => e.id === id)).filter((e): e is Exhibition => !!e))
    },

    spaces,
    addSpace: async (item) => {
      const created = await createSpace(item)
      setSpaces((prev) => [...prev, created])
    },
    updateSpaceItem: async (item) => {
      const updated = await updateSpace(item)
      setSpaces((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
    },
    deleteSpaceItem: async (id) => {
      await deleteSpace(id)
      setSpaces((prev) => prev.filter((s) => s.id !== id))
    },
    deleteSpacesBulk: async (ids) => {
      await deleteSpacesBulkApi(ids)
      setSpaces((prev) => prev.filter((s) => !ids.includes(s.id)))
    },
    reorderSpaces: async (orderedIds) => {
      await reorderSpacesApi(orderedIds)
      setSpaces((prev) => orderedIds.map((id) => prev.find((s) => s.id === id)).filter((s): s is SpaceItem => !!s))
    },

    artists,
    addArtist: async (item) => {
      const created = await createArtist(item)
      setArtists((prev) => [...prev, created])
    },
    updateArtistItem: async (item) => {
      const updated = await updateArtist(item)
      setArtists((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    },
    deleteArtistItem: async (id) => {
      await deleteArtist(id)
      setArtists((prev) => prev.filter((a) => a.id !== id))
    },
    deleteArtistsBulk: async (ids) => {
      await deleteArtistsBulkApi(ids)
      setArtists((prev) => prev.filter((a) => !ids.includes(a.id)))
    },
    reorderArtists: async (orderedIds) => {
      await reorderArtistsApi(orderedIds)
      setArtists((prev) => orderedIds.map((id) => prev.find((a) => a.id === id)).filter((a): a is ArtistItem => !!a))
    },

    moodTags,
    addMoodTag: async (label) => {
      await addTagApi('mood', label)
      setMoodTags((prev) => (prev.includes(label) ? prev : [...prev, label]))
    },
    removeMoodTag: async (label) => {
      await removeTagApi('mood', label)
      setMoodTags((prev) => prev.filter((t) => t !== label))
    },
    genreTags,
    addGenreTag: async (label) => {
      await addTagApi('genre', label)
      setGenreTags((prev) => (prev.includes(label) ? prev : [...prev, label]))
    },
    removeGenreTag: async (label) => {
      await removeTagApi('genre', label)
      setGenreTags((prev) => prev.filter((t) => t !== label))
    },

    siteInstagram,
    updateSiteInstagram: async (instagram) => {
      await updateSiteInstagramApi(instagram)
      setSiteInstagram(instagram)
    },
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}
