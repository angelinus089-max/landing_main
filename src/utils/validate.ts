const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TYPO_DOMAINS: Record<string, string> = {
  'gmeil.com': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'navr.com': 'naver.com',
  'naver.co': 'naver.com',
  'nvaer.com': 'naver.com',
  'daum.net': 'daum.net',
  'daun.net': 'daum.net',
  'hanmial.net': 'hanmail.net',
}

export function checkEmail(email: string): { valid: boolean; message?: string } {
  if (!email.trim()) return { valid: false, message: '이메일을 입력해주세요.' }
  if (!EMAIL_REGEX.test(email)) return { valid: false, message: '이메일 형식이 올바르지 않아요. (예: name@example.com)' }
  const domain = email.split('@')[1]?.toLowerCase()
  if (domain && TYPO_DOMAINS[domain] && TYPO_DOMAINS[domain] !== domain) {
    return { valid: false, message: `혹시 "${TYPO_DOMAINS[domain]}"를 입력하려 하셨나요? 이메일 주소를 다시 확인해주세요.` }
  }
  return { valid: true }
}

const INSTAGRAM_REGEX = /^[a-zA-Z0-9._]{1,30}$/

export function checkInstagram(id: string, required: boolean): { valid: boolean; message?: string } {
  if (!id.trim()) {
    return required ? { valid: false, message: '인스타그램 아이디를 입력해주세요.' } : { valid: true }
  }
  if (!INSTAGRAM_REGEX.test(id)) {
    return { valid: false, message: '인스타그램 아이디는 영문, 숫자, ".", "_"만 사용할 수 있어요. (예: @는 빼고 입력)' }
  }
  return { valid: true }
}

export function checkAddress(address: string): { valid: boolean; message?: string } {
  const value = address.trim()
  if (!value) return { valid: false, message: '주소를 입력해주세요.' }
  if (value.length < 5 || !value.includes(' ')) {
    return { valid: false, message: '네이버 지도에 검색되는 정확한 주소 형식으로 입력해주세요. (예: 서울시 강남구 테헤란로 123)' }
  }
  return { valid: true }
}
