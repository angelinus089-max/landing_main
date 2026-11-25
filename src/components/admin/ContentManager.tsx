import { useState } from 'react'
import { useAppState } from '../../state/AppState'
import type { ArtistItem, Exhibition, SpaceItem } from '../../types'
import InstagramInput from '../../utils/InstagramInput'
import DatalistInput from '../../utils/DatalistInput'
import ImageUploadList from './ImageUploadList'
import LinksEditor from './LinksEditor'
import ExpandableTextarea from './ExpandableTextarea'
import { useSelection } from '../../utils/useSelection'
import { ARCHIVED_TAG, FEATURED_TAG, MANUAL_ENDED_TAG, isArchived, getExhibitionStatus } from '../../data/featured'

type Tab = 'exhibition' | 'space' | 'artist'

export default function ContentManager() {
  const [tab, setTab] = useState<Tab>('exhibition')

  return (
    <div>
      <h2 className="mb-6 text-lg font-medium text-slate-900">콘텐츠 관리</h2>
      <div className="mb-8 flex gap-2">
        <TabButton active={tab === 'exhibition'} onClick={() => setTab('exhibition')}>전시 정보</TabButton>
        <TabButton active={tab === 'space'} onClick={() => setTab('space')}>공간</TabButton>
        <TabButton active={tab === 'artist'} onClick={() => setTab('artist')}>작가</TabButton>
      </div>
      {tab === 'exhibition' && <ExhibitionManager />}
      {tab === 'space' && <SpaceManager />}
      {tab === 'artist' && <ArtistManager />}
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 text-sm transition ${active ? 'bg-slate-900 text-white' : 'border border-slate-200 text-slate-600 hover:border-slate-900'}`}
    >
      {children}
    </button>
  )
}

function ListShell({
  onAdd,
  addLabel,
  allSelected,
  onToggleAll,
  selectedCount,
  onDeleteSelected,
  onArchiveSelected,
  children,
}: {
  onAdd: () => void
  addLabel: string
  allSelected: boolean
  onToggleAll: () => void
  selectedCount: number
  onDeleteSelected: () => void
  onArchiveSelected: () => void
  children: React.ReactNode
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onAdd}
        className="mb-2 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        + {addLabel}
      </button>
      <p className="mb-4 text-xs text-slate-400">↑↓ 버튼으로 순서를 바꾸면 홈페이지 아카이브에 노출되는 순서도 함께 바뀌어요. 보관하면 홈페이지에서 보이지 않아요.</p>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input type="checkbox" checked={allSelected} onChange={onToggleAll} />
          전체 선택
        </label>
        {selectedCount > 0 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onArchiveSelected}
              className="border border-slate-200 px-3 py-1.5 text-xs text-slate-600 transition hover:border-slate-900"
            >
              선택 보관 ({selectedCount})
            </button>
            <button
              type="button"
              onClick={onDeleteSelected}
              className="border border-rose-200 px-3 py-1.5 text-xs text-rose-500 transition hover:bg-rose-50"
            >
              선택 삭제 ({selectedCount})
            </button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function moveInArray<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const swapIndex = index + direction
  if (swapIndex < 0 || swapIndex >= list.length) return list
  const next = [...list]
  ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
  return next
}

function ItemRow({
  image,
  title,
  subtitle,
  badge,
  checked,
  onToggleCheck,
  archived,
  onToggleArchive,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  disableUp,
  disableDown,
}: {
  image: string
  title: string
  subtitle: string
  badge?: React.ReactNode
  checked: boolean
  onToggleCheck: () => void
  archived: boolean
  onToggleArchive: () => void
  onEdit: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  disableUp: boolean
  disableDown: boolean
}) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 border border-slate-200 px-4 py-3 ${archived ? 'bg-slate-50 opacity-60' : ''}`}>
      <div className="flex min-w-0 items-center gap-3">
        <input type="checkbox" checked={checked} onChange={onToggleCheck} className="shrink-0" />
        <div className="flex shrink-0 flex-col gap-0.5">
          <button type="button" onClick={onMoveUp} disabled={disableUp} className="border border-slate-200 px-1.5 text-xs text-slate-500 disabled:opacity-30">↑</button>
          <button type="button" onClick={onMoveDown} disabled={disableDown} className="border border-slate-200 px-1.5 text-xs text-slate-500 disabled:opacity-30">↓</button>
        </div>
        {image && <img src={image} alt="" className="h-12 w-12 shrink-0 object-cover" />}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="break-words text-sm font-medium text-slate-900">{title}</p>
            {badge}
            {archived && <span className="shrink-0 bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">보관됨</span>}
          </div>
          <p className="break-words text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button type="button" onClick={onEdit} className="border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-sage">수정</button>
        <button type="button" onClick={onToggleArchive} className="border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-slate-900">
          {archived ? '보관 해제' : '보관'}
        </button>
        <button type="button" onClick={onDelete} className="border border-rose-200 px-3 py-1.5 text-xs text-rose-500 hover:bg-rose-50">삭제</button>
      </div>
    </div>
  )
}

function TagCheckboxes({ options, selected, onToggle }: { options: string[]; selected: string[]; onToggle: (tag: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((tag) => (
        <label
          key={tag}
          className={`cursor-pointer border px-3 py-1 text-xs transition ${selected.includes(tag) ? 'border-sage bg-sage-light text-sage-dark' : 'border-slate-200 text-slate-500'}`}
        >
          <input type="checkbox" className="hidden" checked={selected.includes(tag)} onChange={() => onToggle(tag)} />
          #{tag}
        </label>
      ))}
    </div>
  )
}

function toggleTag(list: string[], tag: string) {
  return list.includes(tag) ? list.filter((t) => t !== tag) : [...list, tag]
}

function parsePeriod(period: string): { start: string; end: string } {
  const match = period.match(/^(\d{4})\.(\d{2})\.(\d{2})\s*-\s*(\d{4})\.(\d{2})\.(\d{2})$/)
  if (!match) return { start: '', end: '' }
  return { start: `${match[1]}-${match[2]}-${match[3]}`, end: `${match[4]}-${match[5]}-${match[6]}` }
}

function formatPeriod(start: string, end: string): string {
  if (!start || !end) return ''
  return `${start.replaceAll('-', '.')} - ${end.replaceAll('-', '.')}`
}

function FormShell({
  children,
  error,
  onSave,
  onCancel,
  saving,
}: {
  children: React.ReactNode
  error: string
  onSave: () => void
  onCancel: () => void
  saving: boolean
}) {
  return (
    <div className="border border-slate-200 p-6">
      <div className="flex flex-col gap-4">{children}</div>
      {error && <p className="mt-3 text-xs text-rose-500">{error}</p>}
      <div className="mt-6 flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={onSave}
          className="bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
        >
          {saving ? '저장 중...' : '저장'}
        </button>
        <button type="button" onClick={onCancel} className="border border-slate-200 px-4 py-2 text-sm text-slate-600">
          취소
        </button>
      </div>
    </div>
  )
}

function ExhibitionManager() {
  const { exhibitions, spaces, artists, addExhibition, updateExhibitionItem, deleteExhibitionItem, deleteExhibitionsBulk, reorderExhibitions, moodTags, genreTags } = useAppState()
  const [editing, setEditing] = useState<Exhibition | 'new' | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const allTags = [...moodTags, ...genreTags]
  const { selected, allSelected, toggle, toggleAll, clear } = useSelection(exhibitions.map((e) => e.id))

  if (editing) {
    const base: Exhibition = editing === 'new'
      ? { id: '', title: '', space: '', artist: '', period: '', images: [], tags: [], description: '' }
      : editing
    const initialRange = parsePeriod(base.period)

    return (
      <ExhibitionForm
        base={base}
        initialRange={initialRange}
        allTags={allTags}
        spaceNames={spaces.map((s) => s.name)}
        artistNames={artists.map((a) => a.name)}
        error={error}
        saving={saving}
        onCancel={() => { setEditing(null); setError('') }}
        onSave={async (next) => {
          setSaving(true)
          setError('')
          try {
            if (editing === 'new') await addExhibition(next)
            else await updateExhibitionItem({ ...next, id: base.id })
            setEditing(null)
          } catch {
            setError('저장에 실패했어요. 잠시 후 다시 시도해주세요.')
          } finally {
            setSaving(false)
          }
        }}
      />
    )
  }

  function handleDeleteSelected() {
    if (selected.length === 0) return
    if (!window.confirm(`선택한 ${selected.length}건을 삭제할까요?`)) return
    deleteExhibitionsBulk(selected)
    clear()
  }

  function handleArchiveSelected() {
    selected.forEach((id) => {
      const item = exhibitions.find((e) => e.id === id)
      if (item && !isArchived(item.tags)) updateExhibitionItem({ ...item, tags: [...item.tags, ARCHIVED_TAG] })
    })
    clear()
  }

  return (
    <ListShell
      onAdd={() => setEditing('new')}
      addLabel="신규 전시 등록"
      allSelected={allSelected}
      onToggleAll={toggleAll}
      selectedCount={selected.length}
      onDeleteSelected={handleDeleteSelected}
      onArchiveSelected={handleArchiveSelected}
    >
      {exhibitions.map((item, index) => {
        const status = getExhibitionStatus(item.period, item.tags)
        const statusBadge = (
          <span
            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${
              status === 'ongoing'
                ? 'bg-emerald-100 text-emerald-800'
                : status === 'upcoming'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-500'
            }`}
          >
            {status === 'ongoing' ? '● 전시 중' : status === 'upcoming' ? '○ 전시 예정' : '전시 종료'}
          </span>
        )

        return (
          <ItemRow
            key={item.id}
            image={item.images[0]}
            title={item.title}
            subtitle={`${item.space} x ${item.artist} · ${item.period}`}
            badge={statusBadge}
            checked={selected.includes(item.id)}
            onToggleCheck={() => toggle(item.id)}
            archived={isArchived(item.tags)}
            onToggleArchive={() => updateExhibitionItem({ ...item, tags: toggleTag(item.tags, ARCHIVED_TAG) })}
            onEdit={() => setEditing(item)}
            onDelete={() => deleteExhibitionItem(item.id)}
            onMoveUp={() => reorderExhibitions(moveInArray(exhibitions, index, -1).map((e) => e.id))}
            onMoveDown={() => reorderExhibitions(moveInArray(exhibitions, index, 1).map((e) => e.id))}
            disableUp={index === 0}
            disableDown={index === exhibitions.length - 1}
          />
        )
      })}
    </ListShell>
  )
}

function ExhibitionForm({
  base,
  initialRange,
  allTags,
  spaceNames,
  artistNames,
  error,
  saving,
  onSave,
  onCancel,
}: {
  base: Exhibition
  initialRange: { start: string; end: string }
  allTags: string[]
  spaceNames: string[]
  artistNames: string[]
  error: string
  saving: boolean
  onSave: (item: Omit<Exhibition, 'id'>) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(base.title)
  const [space, setSpace] = useState(base.space)
  const [artist, setArtist] = useState(base.artist)
  const [start, setStart] = useState(initialRange.start)
  const [end, setEnd] = useState(initialRange.end)
  const [images, setImages] = useState(base.images)
  const [tags, setTags] = useState(base.tags)
  const [description, setDescription] = useState(base.description)

  const currentPeriod = formatPeriod(start, end)
  const currentStatus = getExhibitionStatus(currentPeriod, tags)
  const isForcedOngoing = tags.includes(FEATURED_TAG)
  const isForcedEnded = tags.includes(MANUAL_ENDED_TAG)
  const isAuto = !isForcedOngoing && !isForcedEnded

  return (
    <FormShell error={error} saving={saving} onCancel={onCancel} onSave={() => onSave({ title, space, artist, period: currentPeriod, images, tags, description })}>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">사진 (여러 장 등록 가능, 첫 번째가 대표 이미지)</label>
        <ImageUploadList images={images} onChange={setImages} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">전시 타이틀</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="input" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">공간명 (등록된 공간에서 선택하거나 직접 입력)</label>
        <DatalistInput value={space} onChange={setSpace} options={spaceNames} listId="space-options" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">작가명 (등록된 작가에서 선택하거나 직접 입력)</label>
        <DatalistInput value={artist} onChange={setArtist} options={artistNames} listId="artist-options" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">전시 기간</label>
        <div className="flex items-center gap-2">
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="input" />
          <span className="text-slate-400">~</span>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="input" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">전시 상태 설정 ('전시 중' 배지 관리)</label>
        <div className="rounded border border-slate-200 bg-slate-50/70 p-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setTags((prev) => prev.filter((t) => t !== FEATURED_TAG && t !== MANUAL_ENDED_TAG))}
              className={`rounded border px-3 py-1.5 text-xs font-medium transition ${
                isAuto
                  ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              📅 기간에 따라 자동 판정 (기본)
            </button>
            <button
              type="button"
              onClick={() => setTags((prev) => [...prev.filter((t) => t !== MANUAL_ENDED_TAG && t !== FEATURED_TAG), FEATURED_TAG])}
              className={`rounded border px-3 py-1.5 text-xs font-medium transition ${
                isForcedOngoing
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              ★ 항상 '전시 중'으로 표시
            </button>
            <button
              type="button"
              onClick={() => setTags((prev) => [...prev.filter((t) => t !== FEATURED_TAG && t !== MANUAL_ENDED_TAG), MANUAL_ENDED_TAG])}
              className={`rounded border px-3 py-1.5 text-xs font-medium transition ${
                isForcedEnded
                  ? 'border-rose-600 bg-rose-600 text-white shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
              }`}
            >
              ✕ '전시 종료'로 표시 (숨김)
            </button>
          </div>
          <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-600">
            <span>실제 적용 상태:</span>
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-semibold ${
                currentStatus === 'ongoing'
                  ? 'bg-emerald-100 text-emerald-800'
                  : currentStatus === 'upcoming'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-200 text-slate-700'
              }`}
            >
              {currentStatus === 'ongoing' ? '🟢 전시 중' : currentStatus === 'upcoming' ? '🔵 전시 예정' : '⚪ 전시 종료'}
            </span>
            <span className="text-slate-400">
              {isForcedOngoing
                ? '(관리자가 수동으로 전시 중 고정함)'
                : isForcedEnded
                  ? '(관리자가 수동으로 전시 종료 지정함)'
                  : end && new Date() > new Date(end)
                    ? '(종료일이 지나 자동으로 종료됨)'
                    : start && new Date() < new Date(start)
                      ? '(시작 전이므로 예정 상태)'
                      : '(전시 기간 내이므로 전시 중)'}
            </span>
          </div>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">태그</label>
        <TagCheckboxes options={allTags} selected={tags} onToggle={(tag) => setTags((prev) => toggleTag(prev, tag))} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">설명</label>
        <ExpandableTextarea value={description} onChange={setDescription} />
      </div>
    </FormShell>
  )
}

function SpaceManager() {
  const { spaces, addSpace, updateSpaceItem, deleteSpaceItem, deleteSpacesBulk, reorderSpaces, moodTags } = useAppState()
  const [editing, setEditing] = useState<SpaceItem | 'new' | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { selected, allSelected, toggle, toggleAll, clear } = useSelection(spaces.map((s) => s.id))

  if (editing) {
    const base: SpaceItem = editing === 'new'
      ? { id: '', name: '', address: '', moodTags: [], images: [], description: '', instagram: '', instagramPublic: true, links: [], adminMemo: '' }
      : editing

    return (
      <SpaceForm
        base={base}
        allTags={moodTags}
        error={error}
        saving={saving}
        onCancel={() => { setEditing(null); setError('') }}
        onSave={async (next) => {
          setSaving(true)
          setError('')
          try {
            if (editing === 'new') await addSpace(next)
            else await updateSpaceItem({ ...next, id: base.id })
            setEditing(null)
          } catch {
            setError('저장에 실패했어요. 잠시 후 다시 시도해주세요.')
          } finally {
            setSaving(false)
          }
        }}
      />
    )
  }

  function handleDeleteSelected() {
    if (selected.length === 0) return
    if (!window.confirm(`선택한 ${selected.length}건을 삭제할까요?`)) return
    deleteSpacesBulk(selected)
    clear()
  }

  function handleArchiveSelected() {
    selected.forEach((id) => {
      const item = spaces.find((s) => s.id === id)
      if (item && !isArchived(item.moodTags)) updateSpaceItem({ ...item, moodTags: [...item.moodTags, ARCHIVED_TAG] })
    })
    clear()
  }

  return (
    <ListShell
      onAdd={() => setEditing('new')}
      addLabel="신규 공간 등록"
      allSelected={allSelected}
      onToggleAll={toggleAll}
      selectedCount={selected.length}
      onDeleteSelected={handleDeleteSelected}
      onArchiveSelected={handleArchiveSelected}
    >
      {spaces.map((item, index) => (
        <ItemRow
          key={item.id}
          image={item.images[0]}
          title={item.name}
          subtitle={item.address}
          checked={selected.includes(item.id)}
          onToggleCheck={() => toggle(item.id)}
          archived={isArchived(item.moodTags)}
          onToggleArchive={() => updateSpaceItem({ ...item, moodTags: toggleTag(item.moodTags, ARCHIVED_TAG) })}
          onEdit={() => setEditing(item)}
          onDelete={() => deleteSpaceItem(item.id)}
          onMoveUp={() => reorderSpaces(moveInArray(spaces, index, -1).map((s) => s.id))}
          onMoveDown={() => reorderSpaces(moveInArray(spaces, index, 1).map((s) => s.id))}
          disableUp={index === 0}
          disableDown={index === spaces.length - 1}
        />
      ))}
    </ListShell>
  )
}

function SpaceForm({
  base,
  allTags,
  error,
  saving,
  onSave,
  onCancel,
}: {
  base: SpaceItem
  allTags: string[]
  error: string
  saving: boolean
  onSave: (item: Omit<SpaceItem, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(base.name)
  const [address, setAddress] = useState(base.address)
  const [images, setImages] = useState(base.images)
  const [moodTags, setMoodTags] = useState(base.moodTags)
  const [description, setDescription] = useState(base.description)
  const [instagram, setInstagram] = useState(base.instagram)
  const [instagramPublic, setInstagramPublic] = useState(base.instagramPublic)
  const [links, setLinks] = useState(base.links)
  const [adminMemo, setAdminMemo] = useState(base.adminMemo)

  return (
    <FormShell
      error={error}
      saving={saving}
      onCancel={onCancel}
      onSave={() => onSave({ name, address, images, moodTags, description, instagram, instagramPublic, links, adminMemo })}
    >
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">사진 (여러 장 등록 가능, 첫 번째가 대표 이미지)</label>
        <ImageUploadList images={images} onChange={setImages} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">가게명</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">주소 (링크가 아닌 실제 주소를 한글로 입력해주세요)</label>
        <input value={address} onChange={(e) => setAddress(e.target.value)} className="input" placeholder="예: 서울시 강남구 테헤란로 123" />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm text-slate-600">인스타그램 아이디</label>
          <button
            type="button"
            onClick={() => setInstagramPublic((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-slate-500"
            title="홈페이지 공개 여부"
          >
            {instagramPublic ? '👁 홈페이지에 공개' : '🙈 비공개'}
          </button>
        </div>
        <InstagramInput value={instagram} onChange={setInstagram} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">추가 링크 (관리자 전용)</label>
        <LinksEditor links={links} onChange={setLinks} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">무드 태그</label>
        <TagCheckboxes options={allTags} selected={moodTags} onToggle={(tag) => setMoodTags((prev) => toggleTag(prev, tag))} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">설명</label>
        <ExpandableTextarea value={description} onChange={setDescription} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">관리자 메모 (홈페이지에 노출되지 않음)</label>
        <ExpandableTextarea value={adminMemo} onChange={setAdminMemo} rows={2} />
      </div>
    </FormShell>
  )
}

function ArtistManager() {
  const { artists, addArtist, updateArtistItem, deleteArtistItem, deleteArtistsBulk, reorderArtists, genreTags } = useAppState()
  const [editing, setEditing] = useState<ArtistItem | 'new' | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { selected, allSelected, toggle, toggleAll, clear } = useSelection(artists.map((a) => a.id))

  if (editing) {
    const base: ArtistItem = editing === 'new'
      ? { id: '', name: '', instagram: '', instagramPublic: true, links: [], adminMemo: '', genreTags: [], images: [], description: '' }
      : editing

    return (
      <ArtistForm
        base={base}
        allTags={genreTags}
        error={error}
        saving={saving}
        onCancel={() => { setEditing(null); setError('') }}
        onSave={async (next) => {
          setSaving(true)
          setError('')
          try {
            if (editing === 'new') await addArtist(next)
            else await updateArtistItem({ ...next, id: base.id })
            setEditing(null)
          } catch {
            setError('저장에 실패했어요. 잠시 후 다시 시도해주세요.')
          } finally {
            setSaving(false)
          }
        }}
      />
    )
  }

  function handleDeleteSelected() {
    if (selected.length === 0) return
    if (!window.confirm(`선택한 ${selected.length}건을 삭제할까요?`)) return
    deleteArtistsBulk(selected)
    clear()
  }

  function handleArchiveSelected() {
    selected.forEach((id) => {
      const item = artists.find((a) => a.id === id)
      if (item && !isArchived(item.genreTags)) updateArtistItem({ ...item, genreTags: [...item.genreTags, ARCHIVED_TAG] })
    })
    clear()
  }

  return (
    <ListShell
      onAdd={() => setEditing('new')}
      addLabel="신규 작가 등록"
      allSelected={allSelected}
      onToggleAll={toggleAll}
      selectedCount={selected.length}
      onDeleteSelected={handleDeleteSelected}
      onArchiveSelected={handleArchiveSelected}
    >
      {artists.map((item, index) => (
        <ItemRow
          key={item.id}
          image={item.images[0]}
          title={item.name}
          subtitle={`@${item.instagram} · ${item.genreTags.map((t) => `#${t}`).join(' ')}`}
          checked={selected.includes(item.id)}
          onToggleCheck={() => toggle(item.id)}
          archived={isArchived(item.genreTags)}
          onToggleArchive={() => updateArtistItem({ ...item, genreTags: toggleTag(item.genreTags, ARCHIVED_TAG) })}
          onEdit={() => setEditing(item)}
          onDelete={() => deleteArtistItem(item.id)}
          onMoveUp={() => reorderArtists(moveInArray(artists, index, -1).map((a) => a.id))}
          onMoveDown={() => reorderArtists(moveInArray(artists, index, 1).map((a) => a.id))}
          disableUp={index === 0}
          disableDown={index === artists.length - 1}
        />
      ))}
    </ListShell>
  )
}

function ArtistForm({
  base,
  allTags,
  error,
  saving,
  onSave,
  onCancel,
}: {
  base: ArtistItem
  allTags: string[]
  error: string
  saving: boolean
  onSave: (item: Omit<ArtistItem, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(base.name)
  const [images, setImages] = useState(base.images)
  const [genreTags, setGenreTags] = useState(base.genreTags)
  const [description, setDescription] = useState(base.description)
  const [instagram, setInstagram] = useState(base.instagram)
  const [instagramPublic, setInstagramPublic] = useState(base.instagramPublic)
  const [links, setLinks] = useState(base.links)
  const [adminMemo, setAdminMemo] = useState(base.adminMemo)

  return (
    <FormShell
      error={error}
      saving={saving}
      onCancel={onCancel}
      onSave={() => onSave({ name, images, genreTags, description, instagram, instagramPublic, links, adminMemo })}
    >
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">사진 (여러 장 등록 가능, 첫 번째가 대표 이미지)</label>
        <ImageUploadList images={images} onChange={setImages} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">작가명</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
      </div>
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm text-slate-600">인스타그램 아이디</label>
          <button
            type="button"
            onClick={() => setInstagramPublic((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-slate-500"
            title="홈페이지 공개 여부"
          >
            {instagramPublic ? '👁 홈페이지에 공개' : '🙈 비공개'}
          </button>
        </div>
        <InstagramInput value={instagram} onChange={setInstagram} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">추가 링크 (스토어 등, 관리자 전용)</label>
        <LinksEditor links={links} onChange={setLinks} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">장르 태그</label>
        <TagCheckboxes options={allTags} selected={genreTags} onToggle={(tag) => setGenreTags((prev) => toggleTag(prev, tag))} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">설명</label>
        <ExpandableTextarea value={description} onChange={setDescription} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm text-slate-600">관리자 메모 (홈페이지에 노출되지 않음)</label>
        <ExpandableTextarea value={adminMemo} onChange={setAdminMemo} rows={2} />
      </div>
    </FormShell>
  )
}
