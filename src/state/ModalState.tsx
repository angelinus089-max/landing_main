import { createContext, useContext, useState, type ReactNode } from 'react'
import type { MatchTarget } from '../types'

export type DetailKind = 'exhibition' | 'space' | 'artist'

interface DetailTarget {
  kind: DetailKind
  id: string
}

interface ModalStateShape {
  matchingOpen: boolean
  matchingInitialTarget: MatchTarget | null
  openMatching: (target?: MatchTarget) => void
  closeMatching: () => void

  inquiryOpen: boolean
  openInquiry: () => void
  closeInquiry: () => void

  detailTarget: DetailTarget | null
  openDetail: (kind: DetailKind, id: string) => void
  closeDetail: () => void
}

const ModalStateContext = createContext<ModalStateShape | null>(null)

export function ModalStateProvider({ children }: { children: ReactNode }) {
  const [matchingOpen, setMatchingOpen] = useState(false)
  const [matchingInitialTarget, setMatchingInitialTarget] = useState<MatchTarget | null>(null)
  const [inquiryOpen, setInquiryOpen] = useState(false)
  const [detailTarget, setDetailTarget] = useState<DetailTarget | null>(null)

  const value: ModalStateShape = {
    matchingOpen,
    matchingInitialTarget,
    openMatching: (target) => {
      setMatchingInitialTarget(target ?? null)
      setMatchingOpen(true)
    },
    closeMatching: () => setMatchingOpen(false),

    inquiryOpen,
    openInquiry: () => setInquiryOpen(true),
    closeInquiry: () => setInquiryOpen(false),

    detailTarget,
    openDetail: (kind, id) => setDetailTarget({ kind, id }),
    closeDetail: () => setDetailTarget(null),
  }

  return <ModalStateContext.Provider value={value}>{children}</ModalStateContext.Provider>
}

export function useModalState() {
  const ctx = useContext(ModalStateContext)
  if (!ctx) throw new Error('useModalState must be used within ModalStateProvider')
  return ctx
}
