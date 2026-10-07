import { neon } from '@neondatabase/serverless';

// 診断タイプごとのアンケート集計を返す。個々の回答は返さない
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    if (!process.env.DATABASE_URL) {
      return res.status(500).json({ error: 'DATABASE_URL is not configured.' });
    }

    const sql = neon(process.env.DATABASE_URL);
    const groups = await sql`
      SELECT
        diagnosis_type,
        COUNT(*)::int AS count,
        AVG(score)::float8 AS avg_score,
        AVG(q3_before)::float8 AS q3_before,
        AVG(q3_after)::float8 AS q3_after,
        AVG(q4_before)::float8 AS q4_before,
        AVG(q4_after)::float8 AS q4_after,
        AVG(q5_before)::float8 AS q5_before,
        AVG(q5_after)::float8 AS q5_after
      FROM survey_responses
      GROUP BY diagnosis_type
    `;

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      total: groups.reduce((sum, g) => sum + g.count, 0),
      groups,
    });
  } catch (error) {
    console.error('Failed to load survey results:', error);
    return res.status(500).json({ error: '集計を読み込めませんでした。' });
  }
}
