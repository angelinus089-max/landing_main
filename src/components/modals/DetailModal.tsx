import { useEffect, useState } from 'react'
import { useModalState } from '../../state/ModalState'
import { useAppState } from '../../state/AppState'
import { useBodyScrollLock } from '../../utils/useBodyScrollLock'
import { isExhibitionOngoing, visibleTags } from '../../data/featured'

export default function DetailModal() {
  const { detailTarget, closeDetail } = useModalState()
  const { exhibitions, spaces, artists } = useAppState()
  const [activeImage, setActiveImage] = useState(0)
  useBodyScrollLock(!!detailTarget)

  useEffect(() => {
    setActiveImage(0)
  }, [detailTarget])

  if (!detailTarget) return null

  const { kind, id } = detailTarget
  const exhibition = kind === 'exhibition' ? exhibitions.find((e) => e.id === id) : undefined
  const space = kind === 'space' ? spaces.find((s) => s.id === id) : undefined
  const artist = kind === 'artist' ? artists.find((a) => a.id === id) : undefined

  const item = exhibition ?? space ?? artist
  if (!item) return null

  const title = exhibition ? exhibition.title : space ? space.name : artist!.name
  const images = item.images
  const tags = exhibition ? exhibition.tags : space ? space.moodTags : artist!.genreTags
  const description = item.description
  const aspect = exhibition ? '3/4' : space ? '4/3' : '1/1'
  const publicLinks = (space ?? artist)?.links.filter((link) => link.public && link.url) ?? []

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white animate-fade-in">
      <button
        type="button"
        onClick={closeDetail}
        className="fixed right-6 top-6 z-10 flex h-10 w-10 items-center justify-center bg-white text-xl text-slate-500 shadow-sm transition hover:text-slate-900"
      >
        ✕
      </button>
      <div className="mx-auto max-w-5xl px-6 py-20 animate-fade-in-up">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <div className="group relative bg-white" style={{ aspectRatio: aspect }}>
              <img
                key={images[activeImage]}
                src={images[activeImage]}
                alt={title}
                className="h-full w-full object-contain animate-fade-in"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-slate-700 opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-white"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImage((activeImage + 1) % images.length)}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center bg-white/90 text-slate-700 opacity-0 shadow-sm transition group-hover:opacity-100 hover:bg-white"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {images.map((src, index) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    className={`h-16 w-16 overflow-hidden bg-white border-2 transition ${index === activeImage ? 'border-sage' : 'border-transparent'}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            {exhibition && isExhibitionOngoing(exhibition.period, exhibition.tags) && (
              <span className="mb-2 inline-block bg-slate-900 px-2 py-1 text-[11px] font-medium text-white">전시 중</span>
            )}
            <h2 className="break-words text-2xl font-medium text-slate-900">{title}</h2>
            {exhibition && <p className="mt-2 break-words text-sm text-slate-500">{exhibition.space} x {exhibition.artist}</p>}
            {exhibition && <p className="mt-1 text-sm text-slate-400">{exhibition.period}</p>}
            {space && <AddressBlock address={space.address} />}
            {space && space.instagramPublic && space.instagram && <InstagramLine handle={space.instagram} />}
            {artist && artist.instagramPublic && artist.instagram && <InstagramLine handle={artist.instagram} />}
            {publicLinks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {publicLinks.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-slate-500 underline underline-offset-2 transition hover:text-slate-900"
                  >
                    {link.label || link.url}
                  </a>
                ))}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {visibleTags(tags).map((tag) => (
                <span key={tag} className="bg-sage-light px-3 py-1 text-xs text-sage-dark">
                  #{tag}
                </span>
              ))}
            </div>
            <p className="mt-6 whitespace-pre-line break-words text-sm leading-relaxed text-slate-600">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddressBlock({ address }: { address: string }) {
  return (
    <div className="mt-3 flex items-start gap-2">
      <svg viewBox="0 0 20 20" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400">
        <path
          d="M10 18s6-5.686 6-10a6 6 0 1 0-12 0c0 4.314 6 10 6 10Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <circle cx="10" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      <p className="min-w-0 flex-1 break-words text-sm text-slate-600">{address}</p>
    </div>
  )
}

function InstagramLine({ handle }: { handle: string }) {
  return (
    <a
      href={`https://instagram.com/${handle}`}
      target="_blank"
      rel="noreferrer"
      className="mt-2 flex items-center gap-1.5 text-sm text-slate-500 transition hover:text-slate-900"
    >
      <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0">
        <rect x="2" y="2" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="10" cy="10" r="3.6" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="14.3" cy="5.7" r="0.9" fill="currentColor" />
      </svg>
      @{handle}
    </a>
  )
}
