import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const ALLOWED = {
  q1: ['男性', '女性', '回答しない'],
  q2: ['パパ・ママ', 'これからなる可能性が少しでもある', 'その他'],
};

const SCALE_FIELDS = [
  'q3_before',
  'q3_after',
  'q4_before',
  'q4_after',
  'q5_before',
  'q5_after',
];

function isValidScale(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 10;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'DATABASE_URL is not configured.' });
    }

    const body = req.body || {};

    if (!ALLOWED.q1.includes(body.q1) || !ALLOWED.q2.includes(body.q2)) {
      return res.status(400).json({ error: '回答内容が正しくありません。' });
    }

    for (const field of SCALE_FIELDS) {
      if (!isValidScale(body[field])) {
        return res.status(400).json({ error: '回答内容が正しくありません。' });
      }
    }

    await sql`
      INSERT INTO survey_responses (
        gender,
        status,
        q3_before,
        q3_after,
        q4_before,
        q4_after,
        q5_before,
        q5_after
      )
      VALUES (
        ${body.q1},
        ${body.q2},
        ${Number(body.q3_before)},
        ${Number(body.q3_after)},
        ${Number(body.q4_before)},
        ${Number(body.q4_after)},
        ${Number(body.q5_before)},
        ${Number(body.q5_after)}
      )
    `;

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Failed to save survey response:', error);
    return res.status(500).json({ error: 'アンケートを保存できませんでした。' });
  }
}
