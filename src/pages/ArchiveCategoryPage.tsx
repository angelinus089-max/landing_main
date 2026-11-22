import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { ArtistCard, ExhibitionCard, SpaceCard } from '../components/Cards'
import { isArchived } from '../data/featured'

const TITLES: Record<string, string> = {
  exhibition: '진행 중인 전시',
  space: '공간 둘러보기',
  artist: '작가 둘러보기',
}

type SortMode = 'registered' | 'alphabetical'

function sortByName<T>(list: T[], sort: SortMode, getName: (item: T) => string): T[] {
  if (sort === 'registered') return list
  return [...list].sort((a, b) => getName(a).localeCompare(getName(b), 'ko'))
}

export default function ArchiveCategoryPage() {
  const { category } = useParams<{ category: string }>()
  const { exhibitions, spaces, artists } = useAppState()
  const [sort, setSort] = useState<SortMode>('registered')

  const title = (category && TITLES[category]) || '아카이브'

  const visibleExhibitions = useMemo(() => exhibitions.filter((e) => !isArchived(e.tags)), [exhibitions])
  const visibleSpaces = useMemo(() => spaces.filter((s) => !isArchived(s.moodTags)), [spaces])
  const visibleArtists = useMemo(() => artists.filter((a) => !isArchived(a.genreTags)), [artists])

  const sortedExhibitions = useMemo(() => sortByName(visibleExhibitions, sort, (e) => e.title), [visibleExhibitions, sort])
  const sortedSpaces = useMemo(() => sortByName(visibleSpaces, sort, (s) => s.name), [visibleSpaces, sort])
  const sortedArtists = useMemo(() => sortByName(visibleArtists, sort, (a) => a.name), [visibleArtists, sort])

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-xl font-medium text-slate-900">{title}</h1>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          className="border border-slate-200 px-4 py-2 text-sm text-slate-600"
        >
          <option value="registered">등록순</option>
          <option value="alphabetical">가나다순</option>
        </select>
      </div>

      {category === 'exhibition' && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {sortedExhibitions.map((item) => (
            <ExhibitionCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {category === 'space' && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {sortedSpaces.map((item) => (
            <SpaceCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {category === 'artist' && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {sortedArtists.map((item) => (
            <ArtistCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}
