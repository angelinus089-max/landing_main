export const FEATURED_TAG = '__featured__'
export const ARCHIVED_TAG = '__archived__'

export function isFeatured(tags: string[]): boolean {
  return tags.includes(FEATURED_TAG)
}

export function isArchived(tags: string[]): boolean {
  return tags.includes(ARCHIVED_TAG)
}

export function visibleTags(tags: string[]): string[] {
  return tags.filter((tag) => tag !== FEATURED_TAG && tag !== ARCHIVED_TAG)
}
