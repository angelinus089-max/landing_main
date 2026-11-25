import { useModalState } from '../state/ModalState'
import { isExhibitionOngoing } from '../data/featured'
import type { ArtistItem, Exhibition, SpaceItem } from '../types'

export function ExhibitionCard({ item }: { item: Exhibition }) {
  const { openDetail } = useModalState()
  return (
    <button type="button" onClick={() => openDetail('exhibition', item.id)} className="group animate-fade-in-up text-left">
      <div className="relative aspect-[3/4] overflow-hidden bg-white">
        {isExhibitionOngoing(item.period, item.tags) && (
          <span className="absolute left-2 top-2 z-10 bg-slate-900 px-2 py-1 text-[11px] font-medium text-white">
            전시 중
          </span>
        )}
        <img src={item.images[0]} alt={item.title} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" />
      </div>
      <p className="mt-3 break-words text-sm font-medium text-slate-900">{item.title}</p>
      <p className="mt-1 break-words text-xs text-slate-400">{item.space} x {item.artist}</p>
      <p className="mt-0.5 text-xs text-slate-400">{item.period}</p>
    </button>
  )
}

export function SpaceCard({ item }: { item: SpaceItem }) {
  const { openDetail } = useModalState()
  return (
    <button type="button" onClick={() => openDetail('space', item.id)} className="group animate-fade-in-up text-left">
      <div className="aspect-[4/3] overflow-hidden bg-white">
        <img src={item.images[0]} alt={item.name} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" />
      </div>
      <p className="mt-3 break-words text-sm font-medium text-slate-900">{item.name}</p>
      <p className="mt-1 break-words text-xs text-slate-400">{item.address}</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {item.moodTags.map((tag) => (
          <span key={tag} className="bg-sage-light px-2 py-0.5 text-[11px] text-sage-dark">#{tag}</span>
        ))}
      </div>
    </button>
  )
}

export function ArtistCard({ item }: { item: ArtistItem }) {
  const { openDetail } = useModalState()
  return (
    <button type="button" onClick={() => openDetail('artist', item.id)} className="group animate-fade-in-up text-left">
      <div className="aspect-square overflow-hidden bg-white">
        <img src={item.images[0]} alt={item.name} className="h-full w-full object-contain transition duration-300 group-hover:scale-105" />
      </div>
      <p className="mt-3 break-words text-sm font-medium text-slate-900">{item.name}</p>
      {item.instagramPublic && item.instagram && <p className="mt-0.5 text-xs text-slate-400">@{item.instagram}</p>}
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {item.genreTags.map((tag) => (
          <span key={tag} className="bg-sage-light px-2 py-0.5 text-[11px] text-sage-dark">#{tag}</span>
        ))}
      </div>
    </button>
  )
}
