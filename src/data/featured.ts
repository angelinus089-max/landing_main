export const FEATURED_TAG = '__featured__'
export const ARCHIVED_TAG = '__archived__'
export const MANUAL_ENDED_TAG = '__ended__'

export type ExhibitionStatus = 'ongoing' | 'upcoming' | 'ended'

/**
 * 전시 기간 문자열(예: '2026.06.26 - 2026.07.27' 또는 '2026-06-26 ~ 2026-07-27')에서 시작일/종료일 추출
 */
export function parsePeriodDates(period: string): { start: Date | null; end: Date | null } {
  if (!period) return { start: null, end: null }
  const dates = period.match(/\b(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})\b/g)
  if (!dates || dates.length < 2) return { start: null, end: null }

  const parseSingle = (str: string) => {
    const parts = str.split(/[.\-/]/).map((n) => parseInt(n, 10))
    return new Date(parts[0], parts[1] - 1, parts[2])
  }

  const start = parseSingle(dates[0])
  const end = parseSingle(dates[1])
  // 종료일은 해당 날짜의 23시 59분 59초까지 유효
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

/**
 * 전시 상태 계산:
 * 1. 수동 종료(__ended__) 또는 보관(__archived__) 태그가 있으면 -> 'ended'
 * 2. 수동 강제 전시 중(__featured__) 태그가 있으면 -> 'ongoing'
 * 3. 기간이 입력되어 있으면 오늘 날짜 기준 자동 계산:
 *    - 오늘이 종료일 이후 -> 'ended' (기간 지나면 자동으로 종료!)
 *    - 오늘이 시작일 이전 -> 'upcoming'
 *    - 기간 중 -> 'ongoing'
 */
export function getExhibitionStatus(period: string, tags: string[] = []): ExhibitionStatus {
  if (isArchived(tags) || tags.includes(MANUAL_ENDED_TAG)) {
    return 'ended'
  }

  // 관리자가 강제로 '전시 중'으로 고정한 경우
  if (tags.includes(FEATURED_TAG)) {
    return 'ongoing'
  }

  const { start, end } = parsePeriodDates(period)
  const now = new Date()

  if (start && end) {
    if (now > end) return 'ended'
    if (now < start) return 'upcoming'
    return 'ongoing'
  }

  return 'ended'
}

export function isExhibitionOngoing(period: string, tags: string[] = []): boolean {
  return getExhibitionStatus(period, tags) === 'ongoing'
}

export function isFeatured(tags: string[]): boolean {
  return tags.includes(FEATURED_TAG)
}

export function isArchived(tags: string[]): boolean {
  return tags.includes(ARCHIVED_TAG)
}

export function visibleTags(tags: string[]): string[] {
  return tags.filter((tag) => !tag.startsWith('__'))
}
