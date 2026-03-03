-- ============================================
-- TheJapanLocalMedia Database Migration
-- Supabase SQL Editor で実行してください
-- ============================================

-- Enums
DO $$ BEGIN CREATE TYPE member_rank AS ENUM ('standard', 'gold', 'platinum', 'diamond'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('member', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE user_status AS ENUM ('pending', 'active', 'suspended'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE content_type AS ENUM ('article', 'video', 'external'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE content_status AS ENUM ('draft', 'scheduled', 'published'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE interaction_type AS ENUM ('view', 'like', 'bookmark'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE unlock_condition_type AS ENUM ('content_views_3', 'profile_completed', 'first_share', 'feedback_sent'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  member_id TEXT UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  location TEXT,
  company TEXT,
  position TEXT,
  avatar_url TEXT,
  rank member_rank DEFAULT 'standard',
  role user_role DEFAULT 'member',
  status user_status DEFAULT 'pending',
  screening_answer TEXT,
  invited_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- member_id 自動生成トリガー
CREATE OR REPLACE FUNCTION generate_member_id() RETURNS TRIGGER AS $$
DECLARE new_id TEXT; counter INT := 0;
BEGIN
  LOOP
    new_id := 'JK-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE member_id = new_id) THEN
      NEW.member_id := new_id; EXIT;
    END IF;
    counter := counter + 1;
    IF counter > 100 THEN RAISE EXCEPTION 'member_id generation failed'; END IF;
  END LOOP;
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_member_id ON profiles;
CREATE TRIGGER set_member_id BEFORE INSERT ON profiles FOR EACH ROW WHEN (NEW.member_id IS NULL) EXECUTE FUNCTION generate_member_id();

-- updated_at 自動更新
CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- invite_codes
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES profiles(id),
  used_by UUID REFERENCES profiles(id),
  is_used BOOLEAN DEFAULT FALSE,
  click_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- invite_slots
CREATE TABLE IF NOT EXISTS invite_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  initial_slots INT DEFAULT 2,
  bonus_slots INT DEFAULT 0,
  used_slots INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- slot_unlock_conditions
CREATE TABLE IF NOT EXISTS slot_unlock_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  condition unlock_condition_type NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, condition)
);

-- referrals
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id),
  referred_id UUID REFERENCES profiles(id),
  invite_code_id UUID REFERENCES invite_codes(id),
  clicked_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- contents
CREATE TABLE IF NOT EXISTS contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type content_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  body TEXT,
  status content_status DEFAULT 'draft',
  publish_date TIMESTAMPTZ,
  author_id UUID REFERENCES profiles(id),
  author_name TEXT,
  author_bio TEXT,
  thumbnail_url TEXT,
  url TEXT,
  duration TEXT,
  views INT DEFAULT 0,
  likes INT DEFAULT 0,
  premium BOOLEAN DEFAULT FALSE,
  required_rank member_rank DEFAULT 'standard',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_contents_updated_at ON contents;
CREATE TRIGGER update_contents_updated_at BEFORE UPDATE ON contents FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL
);

-- content_tags
CREATE TABLE IF NOT EXISTS content_tags (
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (content_id, tag_id)
);

-- content_interactions
CREATE TABLE IF NOT EXISTS content_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES contents(id) ON DELETE CASCADE,
  type interaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id, type)
);

-- rewards
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  required_referrals INT NOT NULL,
  icon TEXT DEFAULT 'Gift',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO rewards (title, description, required_referrals, icon)
SELECT '非公開有料コンテンツ（1万円相当）', '10人を招待した方へ贈る特別コンテンツです', 10, 'Gift'
WHERE NOT EXISTS (SELECT 1 FROM rewards WHERE required_referrals = 10);

INSERT INTO rewards (title, description, required_referrals, icon)
SELECT '10万円級プレミアムサロン参加', '100人を招待した方へのVIP招待権', 100, 'Star'
WHERE NOT EXISTS (SELECT 1 FROM rewards WHERE required_referrals = 100);

INSERT INTO rewards (title, description, required_referrals, icon)
SELECT '主宰者・一流人材との1on1予約', '1000人達成者だけが得られる特権', 1000, 'Crown'
WHERE NOT EXISTS (SELECT 1 FROM rewards WHERE required_referrals = 1000);

-- reward_claims
CREATE TABLE IF NOT EXISTS reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  reward_id UUID REFERENCES rewards(id),
  status TEXT DEFAULT 'pending',
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  granted_at TIMESTAMPTZ
);

-- broadcasts
CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_rank member_rank,
  status TEXT DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- notification_preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  email_new_content BOOLEAN DEFAULT TRUE,
  email_newsletter BOOLEAN DEFAULT TRUE,
  email_invite_update BOOLEAN DEFAULT TRUE,
  line_new_content BOOLEAN DEFAULT FALSE,
  line_reward BOOLEAN DEFAULT FALSE,
  push_browser BOOLEAN DEFAULT FALSE
);

-- login_history
CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  device TEXT,
  ip_address TEXT,
  logged_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE invite_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー (全テーブル service role アクセス許可)
DO $$ BEGIN CREATE POLICY "Allow all" ON profiles FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Allow all" ON invite_codes FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Allow all" ON invite_slots FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Allow all" ON contents FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Allow all" ON content_interactions FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Allow all" ON referrals FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Allow all" ON rewards FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Allow all" ON notification_preferences FOR ALL USING (true) WITH CHECK (true); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- RPC関数
CREATE OR REPLACE FUNCTION verify_invite_code(input_code TEXT) RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  code_record invite_codes%ROWTYPE;
  referrer_profile profiles%ROWTYPE;
BEGIN
  SELECT * INTO code_record FROM invite_codes WHERE code = input_code AND (expires_at IS NULL OR expires_at > NOW());
  IF NOT FOUND THEN RETURN json_build_object('valid', false, 'error', 'Invalid or expired code'); END IF;
  UPDATE invite_codes SET click_count = click_count + 1 WHERE id = code_record.id;
  SELECT * INTO referrer_profile FROM profiles WHERE id = code_record.created_by;
  RETURN json_build_object('valid', true, 'referrer_name', referrer_profile.display_name, 'code_id', code_record.id);
END; $$;

CREATE OR REPLACE FUNCTION get_or_create_invite_code(p_clerk_user_id TEXT) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  profile_record profiles%ROWTYPE;
  existing_code TEXT;
  new_code TEXT;
BEGIN
  SELECT * INTO profile_record FROM profiles WHERE clerk_user_id = p_clerk_user_id;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT code INTO existing_code FROM invite_codes WHERE created_by = profile_record.id AND is_used = FALSE LIMIT 1;
  IF existing_code IS NOT NULL THEN RETURN existing_code; END IF;
  new_code := lower(substring(md5(random()::text || profile_record.id::text) FROM 1 FOR 8));
  INSERT INTO invite_codes (code, created_by) VALUES (new_code, profile_record.id);
  RETURN new_code;
END; $$;

CREATE OR REPLACE FUNCTION is_admin(p_clerk_user_id TEXT) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE clerk_user_id = p_clerk_user_id AND role = 'admin');
END; $$;

-- ============================================
-- デモアカウント用プロファイル挿入
-- ============================================
INSERT INTO profiles (clerk_user_id, display_name, email, status, role, rank, screening_answer)
VALUES ('user_3APV6bObTpwErWMetjjliJ8tldZ', 'デモ ユーザー', 'demo@thejapanlocalmedia.com', 'active', 'admin', 'standard', 'デモアカウント')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- デモ用サンプルコンテンツ
INSERT INTO contents (type, title, description, body, status, publish_date, author_name, author_bio)
VALUES
  ('article', '地方創生の最前線：地域コミュニティが生み出す新しい価値', '全国の地方創生事例から見える、成功の共通パターンとは',
   '## はじめに

地方創生という言葉が使われ始めてから、多くの取り組みが全国各地で行われてきました。

## 成功事例に共通するポイント

### 1. 地域の強みを活かす
地域には必ず、他にはない独自の資源があります。

### 2. 外部との連携
閉じたコミュニティではなく、外部の知見を積極的に取り入れる姿勢が重要です。

### 3. 持続可能な仕組みづくり
補助金に頼らない、自走できるビジネスモデルの構築が鍵となります。

## まとめ

地方創生の成功には、**地域の人々の情熱**と**外部との協力**が不可欠です。',
   'published', NOW(), '田中 太郎', '地方創生コンサルタント'),

  ('article', '観光DXで変わる地方の未来', 'デジタル技術を活用した観光振興の最新動向',
   '## 観光DXとは

観光産業におけるデジタルトランスフォーメーションは、地方の観光資源を世界に発信する大きなチャンスです。

## 具体的な取り組み

- オンライン予約システムの導入
- SNSを活用した情報発信
- データ分析による観光客の動向把握

## 今後の展望

AIやVR技術の進化により、観光体験はさらに豊かになるでしょう。',
   'published', NOW() - INTERVAL '3 days', '佐藤 花子', '観光DXアドバイザー'),

  ('video', '【特別対談】地域リーダーが語る まちづくりの本質', '第一線で活躍する地域リーダー3名による特別座談会',
   NULL, 'published', NOW() - INTERVAL '7 days', '鈴木 一郎', 'まちづくりプロデューサー'),

  ('external', '総務省「地方創生推進交付金」活用事例集', '全国の優良事例をまとめた総務省の公式資料です',
   NULL, 'published', NOW() - INTERVAL '14 days', '編集部', NULL);
