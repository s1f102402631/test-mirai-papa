CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  gender TEXT NOT NULL,
  status TEXT NOT NULL,
  q3_before INTEGER NOT NULL CHECK (q3_before BETWEEN 1 AND 10),
  q3_after INTEGER NOT NULL CHECK (q3_after BETWEEN 1 AND 10),
  q4_before INTEGER NOT NULL CHECK (q4_before BETWEEN 1 AND 10),
  q4_after INTEGER NOT NULL CHECK (q4_after BETWEEN 1 AND 10),
  q5_before INTEGER NOT NULL CHECK (q5_before BETWEEN 1 AND 10),
  q5_after INTEGER NOT NULL CHECK (q5_after BETWEEN 1 AND 10),
  q3_change INTEGER CHECK (q3_change BETWEEN -5 AND 5),
  q4_change INTEGER CHECK (q4_change BETWEEN -5 AND 5),
  q5_change INTEGER CHECK (q5_change BETWEEN -5 AND 5),
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  diagnosis_type TEXT,
  share_estimate INTEGER CHECK (share_estimate BETWEEN 0 AND 10)
);

-- 既存のテーブルに診断結果の列を追加する（すでにある場合は何もしない）
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS score INTEGER CHECK (score BETWEEN 0 AND 100);
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS diagnosis_type TEXT;
-- 「最後にひとつだけ」の質問（自分が担うと思う家事・育児の割合、0〜10割）
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS share_estimate INTEGER CHECK (share_estimate BETWEEN 0 AND 10);

CREATE INDEX IF NOT EXISTS survey_responses_submitted_at_idx
  ON survey_responses (submitted_at);

-- 変化量アンケート（−5〜＋5、0は変化なし）用の列を既存テーブルにも追加
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS q3_change INTEGER CHECK (q3_change BETWEEN -5 AND 5);
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS q4_change INTEGER CHECK (q4_change BETWEEN -5 AND 5);
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS q5_change INTEGER CHECK (q5_change BETWEEN -5 AND 5);
