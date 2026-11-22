import { Link } from 'react-router-dom'
import { useAppState } from '../state/AppState'
import { ArtistCard, ExhibitionCard, SpaceCard } from '../components/Cards'
import { isArchived } from '../data/featured'

export default function ArchivePage() {
  const { exhibitions, spaces, artists } = useAppState()
  const visibleExhibitions = exhibitions.filter((e) => !isArchived(e.tags))
  const visibleSpaces = spaces.filter((s) => !isArchived(s.moodTags))
  const visibleArtists = artists.filter((a) => !isArchived(a.genreTags))

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <Section title="🔥 이달의 하이라이트 전시" moreLink="/archive/exhibition">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {visibleExhibitions.slice(0, 4).map((item) => (
            <ExhibitionCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      <Section title="✨ 새롭게 합류한 공간" moreLink="/archive/space">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {visibleSpaces.slice(0, 3).map((item) => (
            <SpaceCard key={item.id} item={item} />
          ))}
        </div>
      </Section>

      <Section title="🎨 주목받는 작가" moreLink="/archive/artist">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {visibleArtists.slice(0, 4).map((item) => (
            <ArtistCard key={item.id} item={item} />
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({
  title,
  moreLink,
  children,
}: {
  title: string
  moreLink: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-20">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-medium text-slate-900">{title}</h2>
        <Link to={moreLink} className="text-sm text-slate-400 transition hover:text-sage-dark">
          더보기 +
        </Link>
      </div>
      {children}
    </section>
  )
}
