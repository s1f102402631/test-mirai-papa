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
  score INTEGER CHECK (score BETWEEN 0 AND 100),
  diagnosis_type TEXT
);

-- 既存のテーブルに診断結果の列を追加する（すでにある場合は何もしない）
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS score INTEGER CHECK (score BETWEEN 0 AND 100);
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS diagnosis_type TEXT;

CREATE INDEX IF NOT EXISTS survey_responses_submitted_at_idx
  ON survey_responses (submitted_at);
