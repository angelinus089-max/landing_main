-- 전시
create table if not exists exhibitions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  space text not null,
  artist text not null,
  period text not null,
  images text[] not null default '{}',
  tags text[] not null default '{}',
  description text not null default '',
  created_at timestamptz not null default now()
);

-- 공간
create table if not exists spaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  mood_tags text[] not null default '{}',
  images text[] not null default '{}',
  description text not null default '',
  created_at timestamptz not null default now()
);

-- 작가
create table if not exists artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  instagram text not null default '',
  genre_tags text[] not null default '{}',
  images text[] not null default '{}',
  description text not null default '',
  created_at timestamptz not null default now()
);

-- 매칭 접수 리드 (신규등록)
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('space', 'artist')),
  name text not null,
  email text,
  instagram text,
  address text,
  participation text check (participation in ('개인', '단체')),
  group_size text,
  answers jsonb not null default '[]',
  status text not null default '대기 중' check (status in ('대기 중', '연락 완료', '매칭 진행 중', '거절')),
  memo text not null default '',
  created_at timestamptz not null default now()
);

-- 문의내역
create table if not exists inquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('작가 문의', '공간주 문의', '일반 문의')),
  email text not null,
  detail1 text,
  message text not null default '',
  status text not null default '대기 중' check (status in ('대기 중', '답변 완료')),
  memo text not null default '',
  created_at timestamptz not null default now()
);

-- 태그 (설정 > 태그 관리)
create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('mood', 'genre')),
  label text not null,
  unique (category, label)
);

-- RLS 활성화
alter table exhibitions enable row level security;
alter table spaces enable row level security;
alter table artists enable row level security;
alter table leads enable row level security;
alter table inquiries enable row level security;
alter table tags enable row level security;

-- 이전에 실행했던 "누구나 자유롭게" 정책은 제거합니다.
drop policy if exists "anon full access" on exhibitions;
drop policy if exists "anon full access" on spaces;
drop policy if exists "anon full access" on artists;
drop policy if exists "anon full access" on leads;
drop policy if exists "anon full access" on inquiries;
drop policy if exists "anon full access" on tags;

-- 콘텐츠(전시/공간/작가): 누구나 볼 수 있지만, 등록/수정/삭제는 로그인한 어드민만 가능
drop policy if exists "public read" on exhibitions;
drop policy if exists "admin write" on exhibitions;
create policy "public read" on exhibitions for select using (true);
create policy "admin write" on exhibitions for all to authenticated using (true) with check (true);

drop policy if exists "public read" on spaces;
drop policy if exists "admin write" on spaces;
create policy "public read" on spaces for select using (true);
create policy "admin write" on spaces for all to authenticated using (true) with check (true);

drop policy if exists "public read" on artists;
drop policy if exists "admin write" on artists;
create policy "public read" on artists for select using (true);
create policy "admin write" on artists for all to authenticated using (true) with check (true);

-- 태그: 어드민 설정 화면에서만 쓰이므로 로그인한 어드민만 접근
drop policy if exists "admin only" on tags;
create policy "admin only" on tags for all to authenticated using (true) with check (true);

-- 리드(매칭 접수): 누구나 접수(등록)는 가능하지만, 조회/수정/삭제는 로그인한 어드민만 가능
drop policy if exists "public insert" on leads;
drop policy if exists "admin manage" on leads;
create policy "public insert" on leads for insert to anon, authenticated with check (true);
create policy "admin manage" on leads for select to authenticated using (true);
create policy "admin update" on leads for update to authenticated using (true) with check (true);
create policy "admin delete" on leads for delete to authenticated using (true);

-- 문의: 누구나 접수는 가능하지만, 조회/수정/삭제는 로그인한 어드민만 가능
drop policy if exists "public insert" on inquiries;
create policy "public insert" on inquiries for insert to anon, authenticated with check (true);
create policy "admin select" on inquiries for select to authenticated using (true);
create policy "admin update" on inquiries for update to authenticated using (true) with check (true);
create policy "admin delete" on inquiries for delete to authenticated using (true);

-- 기본 태그 시드 (이미 있으면 건너뜀)
insert into tags (category, label)
select * from (values
  ('mood', '차분함'), ('mood', '우드톤'), ('mood', '모던'), ('mood', '세련됨'),
  ('mood', '힙함'), ('mood', '개성'), ('mood', '파스텔'),
  ('genre', '일러스트'), ('genre', '일상'), ('genre', '회화'),
  ('genre', '추상'), ('genre', '수채화'), ('genre', '식물')
) as t(category, label)
on conflict (category, label) do nothing;
