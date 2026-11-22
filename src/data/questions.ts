export interface OnboardingQuestion {
  question: string
  options: string[]
}

export const OTHER_OPTION = '기타 (직접 입력)'

const rawSpaceQuestions: OnboardingQuestion[] = [
  {
    question: '현재 운영 중인 공간은 어떤 분위기에 가깝나요?',
    options: ['차분하고 따뜻한 무드', '모던하고 세련된 무드', '힙하고 개성 있는 무드', '아직 잘 모르겠어요'],
  },
  {
    question: '어느 정도 크기의 작품을 원하시나요?',
    options: ['테이블용 미니 액자 (A6 정도)', '벽면용 포스터 사이즈 (A3~A2)', '미니·포스터 혼합 배치 (다양한 연출)'],
  },
  {
    question: '한 번에 몇 개의 작품을 전시하길 원하시나요?',
    options: ['포인트로 1~2개', '갤러리처럼 3~5개', '벽면을 가득 채우는 6개 이상'],
  },
  {
    question: '이번 전시를 통해 가장 기대하는 점은 무엇인가요?',
    options: ['인테리어 분위기 환기', '방문객 체류시간 증가', 'SNS 포토존 형성'],
  },
]

const rawArtistQuestions: OnboardingQuestion[] = [
  {
    question: '작가님의 작품은 어떤 분위기에 가깝나요?',
    options: ['일상적인 따뜻함', '강렬하고 힙한 색채', '여백이 있는 미니멀', '감각적인 추상'],
  },
  {
    question: '어떤 형태의 공간에 작품이 전시되기를 원하시나요?',
    options: ['넓고 쾌적한 대형 카페 및 라운지', '아늑한 소규모 개인 카페', '트렌디한 식당 및 다이닝 바', '공간 형태 상관없음'],
  },
  {
    question: '전시를 진행하고 싶은 위치는 어디인가요?',
    options: ['서울 지역 내', '서울 및 경기 수도권 전체', '지역 상관 없음 (택배 가능)'],
  },
  {
    question: '이번 전시를 통해 기대하는 가장 큰 목표는 무엇인가요?',
    options: ['대중적인 인지도 확보', '인스타그램 팔로워 유입', '작품 판매 및 굿즈 수익'],
  },
]

function withOther(questions: OnboardingQuestion[]): OnboardingQuestion[] {
  return questions.map((q) => ({ ...q, options: [...q.options, OTHER_OPTION] }))
}

export const spaceQuestions: OnboardingQuestion[] = withOther(rawSpaceQuestions)
export const artistQuestions: OnboardingQuestion[] = withOther(rawArtistQuestions)
