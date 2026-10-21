import { neon } from '@neondatabase/serverless';

const ALLOWED = {
  q1: ['男性', '女性', '回答しない'],
  q2: ['パパ・ママ', 'これからなる可能性が少しでもある', 'その他'],
};

const CHANGE_FIELDS = ['q3_change', 'q4_change', 'q5_change', 'q6_change', 'q7_change', 'q8_change', 'q9_change', 'q10_change'];

// デモアプリ.html の TYPES と同じ名前
const DIAGNOSIS_TYPES = [
  '自分軸の航海士',
  '暮らしの設計者',
  '家族バランサー',
  '伴走するパートナー',
  '家族チームメーカー',
  '未来の家族ナビゲーター',
];

function isValidChange(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= -5 && n <= 5;
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

    const sql = neon(process.env.DATABASE_URL);

    const body = req.body || {};

    if (!ALLOWED.q1.includes(body.q1) || !ALLOWED.q2.includes(body.q2)) {
      return res.status(400).json({ error: '回答内容が正しくありません。' });
    }

    for (const field of CHANGE_FIELDS) {
      if (!isValidChange(body[field])) {
        return res.status(400).json({ error: '回答内容が正しくありません。' });
      }
    }

    // 診断を終えずに回答した場合は score / diagnosis_type が無いので NULL で保存する
    let score = null;
    let diagnosisType = null;
    if (body.score !== undefined && body.score !== null) {
      score = Number(body.score);
      if (!Number.isInteger(score) || score < 0 || score > 100) {
        return res.status(400).json({ error: '回答内容が正しくありません。' });
      }
    }
    if (body.diagnosis_type !== undefined && body.diagnosis_type !== null) {
      if (!DIAGNOSIS_TYPES.includes(body.diagnosis_type)) {
        return res.status(400).json({ error: '回答内容が正しくありません。' });
      }
      diagnosisType = body.diagnosis_type;
    }
    // 「最後にひとつだけ」の質問（自分が担うと思う家事・育児の割合 0〜10割）。未回答なら NULL
    let shareEstimate = null;
    if (body.share_estimate !== undefined && body.share_estimate !== null) {
      shareEstimate = Number(body.share_estimate);
      if (!Number.isInteger(shareEstimate) || shareEstimate < 0 || shareEstimate > 10) {
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
        q5_after,
        q3_change,
        q4_change,
        q5_change,
        q6_change,
        q7_change,
        q8_change,
        q9_change,
        q10_change,
        score,
        diagnosis_type,
        share_estimate
      )
      VALUES (
        ${body.q1},
        ${body.q2},
        5,
        5,
        5,
        5,
        5,
        5,
        ${Number(body.q3_change)},
        ${Number(body.q4_change)},
        ${Number(body.q5_change)},
        ${Number(body.q6_change)},
        ${Number(body.q7_change)},
        ${Number(body.q8_change)},
        ${Number(body.q9_change)},
        ${Number(body.q10_change)},
        ${score},
        ${diagnosisType},
        ${shareEstimate}
      )
    `;

    return res.status(201).json({ ok: true });
  } catch (error) {
    console.error('Failed to save survey response:', error);
    return res.status(500).json({ error: 'アンケートを保存できませんでした。' });
  }
}
