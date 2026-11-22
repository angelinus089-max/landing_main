import { supabase } from './supabase'
import type { ArtistItem, Exhibition, InquiryData, LeadData, LinkItem, SpaceItem } from '../types'

function throwIfError<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data
}

// ---------- Image upload ----------
export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('images').upload(path, file)
  if (error) throw new Error(error.message)
  const { data } = supabase.storage.from('images').getPublicUrl(path)
  return data.publicUrl
}

// ---------- Site settings ----------
export async function fetchSiteInstagram(): Promise<string> {
  const res = await supabase.from('site_settings').select('instagram').eq('id', true).single()
  return (throwIfError(res) as { instagram: string }).instagram ?? ''
}

export async function updateSiteInstagramApi(instagram: string): Promise<void> {
  throwIfError(await supabase.from('site_settings').update({ instagram }).eq('id', true))
}

// ---------- Reordering (repurposes created_at, no schema change) ----------
async function reorderTable(table: string, orderedIds: string[]): Promise<void> {
  const base = Date.now()
  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from(table)
        .update({ created_at: new Date(base + index * 1000).toISOString() })
        .eq('id', id),
    ),
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) throw new Error(failed.error.message)
}

export const reorderExhibitionsApi = (orderedIds: string[]) => reorderTable('exhibitions', orderedIds)
export const reorderSpacesApi = (orderedIds: string[]) => reorderTable('spaces', orderedIds)
export const reorderArtistsApi = (orderedIds: string[]) => reorderTable('artists', orderedIds)

// ---------- Exhibitions ----------
export async function fetchExhibitions(): Promise<Exhibition[]> {
  const res = await supabase.from('exhibitions').select('id, title, space, artist, period, images, tags, description').order('created_at', { ascending: true })
  return throwIfError(res) as Exhibition[]
}

function exhibitionToRow(item: Omit<Exhibition, 'id'>) {
  return {
    title: item.title,
    space: item.space,
    artist: item.artist,
    period: item.period,
    images: item.images,
    tags: item.tags,
    description: item.description,
  }
}

export async function createExhibition(item: Omit<Exhibition, 'id'>): Promise<Exhibition> {
  const res = await supabase.from('exhibitions').insert(exhibitionToRow(item)).select().single()
  return throwIfError(res) as Exhibition
}

export async function updateExhibition(item: Exhibition): Promise<Exhibition> {
  const res = await supabase.from('exhibitions').update(exhibitionToRow(item)).eq('id', item.id).select().single()
  return throwIfError(res) as Exhibition
}

export async function deleteExhibition(id: string): Promise<void> {
  throwIfError(await supabase.from('exhibitions').delete().eq('id', id))
}

export async function deleteExhibitionsBulkApi(ids: string[]): Promise<void> {
  throwIfError(await supabase.from('exhibitions').delete().in('id', ids))
}

// ---------- Spaces ----------
export async function fetchSpaces(): Promise<SpaceItem[]> {
  const res = await supabase
    .from('spaces')
    .select('id, name, address, mood_tags, images, description, instagram, instagram_public, links, admin_memo')
    .order('created_at', { ascending: true })
  const rows = throwIfError(res) as Array<Record<string, unknown>>
  return rows.map(rowToSpace)
}

export async function createSpace(item: Omit<SpaceItem, 'id'>): Promise<SpaceItem> {
  const res = await supabase.from('spaces').insert(spaceToRow(item)).select().single()
  return rowToSpace(throwIfError(res) as Record<string, unknown>)
}

export async function updateSpace(item: SpaceItem): Promise<SpaceItem> {
  const { id, ...rest } = item
  const res = await supabase.from('spaces').update(spaceToRow(rest)).eq('id', id).select().single()
  return rowToSpace(throwIfError(res) as Record<string, unknown>)
}

export async function deleteSpace(id: string): Promise<void> {
  throwIfError(await supabase.from('spaces').delete().eq('id', id))
}

export async function deleteSpacesBulkApi(ids: string[]): Promise<void> {
  throwIfError(await supabase.from('spaces').delete().in('id', ids))
}

function rowToSpace(row: Record<string, unknown>): SpaceItem {
  return {
    id: row.id as string,
    name: row.name as string,
    address: row.address as string,
    moodTags: (row.mood_tags as string[]) ?? [],
    images: (row.images as string[]) ?? [],
    description: row.description as string,
    instagram: (row.instagram as string) ?? '',
    instagramPublic: (row.instagram_public as boolean) ?? true,
    links: (row.links as LinkItem[]) ?? [],
    adminMemo: (row.admin_memo as string) ?? '',
  }
}

function spaceToRow(item: Omit<SpaceItem, 'id'>) {
  return {
    name: item.name,
    address: item.address,
    mood_tags: item.moodTags,
    images: item.images,
    description: item.description,
    instagram: item.instagram,
    instagram_public: item.instagramPublic,
    links: item.links,
    admin_memo: item.adminMemo,
  }
}

// ---------- Artists ----------
export async function fetchArtists(): Promise<ArtistItem[]> {
  const res = await supabase
    .from('artists')
    .select('id, name, instagram, genre_tags, images, description, instagram_public, links, admin_memo')
    .order('created_at', { ascending: true })
  const rows = throwIfError(res) as Array<Record<string, unknown>>
  return rows.map(rowToArtist)
}

export async function createArtist(item: Omit<ArtistItem, 'id'>): Promise<ArtistItem> {
  const res = await supabase.from('artists').insert(artistToRow(item)).select().single()
  return rowToArtist(throwIfError(res) as Record<string, unknown>)
}

export async function updateArtist(item: ArtistItem): Promise<ArtistItem> {
  const { id, ...rest } = item
  const res = await supabase.from('artists').update(artistToRow(rest)).eq('id', id).select().single()
  return rowToArtist(throwIfError(res) as Record<string, unknown>)
}

export async function deleteArtist(id: string): Promise<void> {
  throwIfError(await supabase.from('artists').delete().eq('id', id))
}

export async function deleteArtistsBulkApi(ids: string[]): Promise<void> {
  throwIfError(await supabase.from('artists').delete().in('id', ids))
}

function rowToArtist(row: Record<string, unknown>): ArtistItem {
  return {
    id: row.id as string,
    name: row.name as string,
    instagram: (row.instagram as string) ?? '',
    instagramPublic: (row.instagram_public as boolean) ?? true,
    links: (row.links as LinkItem[]) ?? [],
    genreTags: (row.genre_tags as string[]) ?? [],
    images: (row.images as string[]) ?? [],
    description: row.description as string,
    adminMemo: (row.admin_memo as string) ?? '',
  }
}

function artistToRow(item: Omit<ArtistItem, 'id'>) {
  return {
    name: item.name,
    instagram: item.instagram,
    instagram_public: item.instagramPublic,
    links: item.links,
    genre_tags: item.genreTags,
    images: item.images,
    description: item.description,
    admin_memo: item.adminMemo,
  }
}

// ---------- Leads ----------
export async function fetchLeads(): Promise<LeadData[]> {
  const res = await supabase.from('leads').select('id, type, name, email, instagram, address, contact, participation, group_size, answers, status, memo').order('created_at', { ascending: false })
  const rows = throwIfError(res) as Array<Record<string, unknown>>
  return rows.map(rowToLead)
}

export async function createLead(lead: Omit<LeadData, 'id' | 'status' | 'memo'>): Promise<void> {
  throwIfError(
    await supabase.from('leads').insert({
      type: lead.type,
      name: lead.name,
      email: lead.email ?? null,
      instagram: lead.instagram ?? null,
      address: lead.address ?? null,
      contact: lead.contact ?? null,
      participation: lead.participation ?? null,
      group_size: lead.groupSize ?? null,
      answers: lead.answers,
    }),
  )
}

export async function updateLeadStatusApi(id: string, status: LeadData['status']): Promise<void> {
  throwIfError(await supabase.from('leads').update({ status }).eq('id', id))
}

export async function updateLeadMemoApi(id: string, memo: string): Promise<void> {
  throwIfError(await supabase.from('leads').update({ memo }).eq('id', id))
}

export async function deleteLeadsApi(ids: string[]): Promise<void> {
  throwIfError(await supabase.from('leads').delete().in('id', ids))
}

function rowToLead(row: Record<string, unknown>): LeadData {
  return {
    id: row.id as string,
    type: row.type as LeadData['type'],
    name: row.name as string,
    email: (row.email as string) ?? undefined,
    instagram: (row.instagram as string) ?? undefined,
    address: (row.address as string) ?? undefined,
    contact: (row.contact as string) ?? undefined,
    participation: (row.participation as LeadData['participation']) ?? undefined,
    groupSize: (row.group_size as string) ?? undefined,
    answers: (row.answers as LeadData['answers']) ?? [],
    status: row.status as LeadData['status'],
    memo: (row.memo as string) ?? '',
  }
}

// ---------- Inquiries ----------
export async function fetchInquiries(): Promise<InquiryData[]> {
  const res = await supabase.from('inquiries').select('id, type, email, detail1, message, status, memo').order('created_at', { ascending: false })
  return throwIfError(res) as InquiryData[]
}

export async function createInquiry(inquiry: Omit<InquiryData, 'id' | 'status' | 'memo'>): Promise<void> {
  throwIfError(
    await supabase.from('inquiries').insert({
      type: inquiry.type,
      email: inquiry.email,
      detail1: inquiry.detail1 ?? null,
      message: inquiry.message,
    }),
  )
}

export async function updateInquiryStatusApi(id: string, status: InquiryData['status']): Promise<void> {
  throwIfError(await supabase.from('inquiries').update({ status }).eq('id', id))
}

export async function updateInquiryMemoApi(id: string, memo: string): Promise<void> {
  throwIfError(await supabase.from('inquiries').update({ memo }).eq('id', id))
}

export async function deleteInquiriesApi(ids: string[]): Promise<void> {
  throwIfError(await supabase.from('inquiries').delete().in('id', ids))
}

// ---------- Tags ----------
export async function fetchTags(category: 'mood' | 'genre'): Promise<string[]> {
  const res = await supabase.from('tags').select('label').eq('category', category).order('label', { ascending: true })
  const rows = throwIfError(res) as Array<{ label: string }>
  return rows.map((r) => r.label)
}

export async function addTagApi(category: 'mood' | 'genre', label: string): Promise<void> {
  throwIfError(await supabase.from('tags').insert({ category, label }))
}

export async function removeTagApi(category: 'mood' | 'genre', label: string): Promise<void> {
  throwIfError(await supabase.from('tags').delete().eq('category', category).eq('label', label))
}
