export type MatchTarget = 'space' | 'artist'

export interface LeadAnswer {
  question: string
  answer: string
}

export interface LeadData {
  id: string
  type: MatchTarget
  name: string
  email?: string
  instagram?: string
  address?: string
  contact?: string
  participation?: '개인' | '단체'
  groupSize?: string
  answers: LeadAnswer[]
  status: '대기 중' | '연락 완료' | '매칭 진행 중' | '거절'
  memo: string
}

export type InquiryType = '작가 문의' | '공간주 문의' | '일반 문의'

export interface InquiryData {
  id: string
  type: InquiryType
  email: string
  detail1?: string
  message: string
  status: '대기 중' | '답변 완료'
  memo: string
}

export interface Exhibition {
  id: string
  title: string
  space: string
  artist: string
  period: string
  images: string[]
  tags: string[]
  description: string
}

export interface LinkItem {
  label: string
  url: string
  public: boolean
}

export interface SpaceItem {
  id: string
  name: string
  address: string
  moodTags: string[]
  images: string[]
  description: string
  instagram: string
  instagramPublic: boolean
  links: LinkItem[]
  adminMemo: string
}

export interface ArtistItem {
  id: string
  name: string
  instagram: string
  instagramPublic: boolean
  links: LinkItem[]
  genreTags: string[]
  images: string[]
  description: string
  adminMemo: string
}
