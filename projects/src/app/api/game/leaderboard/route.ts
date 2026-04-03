import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

type LeaderboardResult = 'success' | 'failed';

declare global {
  // Reuse pool in dev to avoid creating too many connections.
  // eslint-disable-next-line no-var
  var __leaderboardPgPool: Pool | undefined;
}

function getPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  if (!global.__leaderboardPgPool) {
    global.__leaderboardPgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }

  return global.__leaderboardPgPool;
}

async function ensureLeaderboardTable(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS leaderboard_entries (
      id BIGSERIAL PRIMARY KEY,
      nickname VARCHAR(20) NOT NULL,
      rounds INTEGER NOT NULL CHECK (rounds > 0),
      result VARCHAR(10) NOT NULL CHECK (result IN ('success', 'failed')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS leaderboard_entries_rank_idx
    ON leaderboard_entries (result, rounds, created_at);
  `);
}

// 获取排行榜
export async function GET() {
  try {
    await ensureLeaderboardTable();
    const pool = getPool();

    const listResult = await pool.query<{
      id: string;
      nickname: string;
      rounds: number;
      result: LeaderboardResult;
      created_at: string;
    }>(`
      SELECT id::text, nickname, rounds, result, created_at
      FROM leaderboard_entries
      ORDER BY
        CASE WHEN result = 'success' THEN 0 ELSE 1 END ASC,
        rounds ASC,
        created_at ASC
      LIMIT 100
    `);

    const countResult = await pool.query<{ total: string }>(
      'SELECT COUNT(*)::text AS total FROM leaderboard_entries'
    );

    return NextResponse.json({
      leaderboard: listResult.rows,
      total: Number(countResult.rows[0]?.total ?? 0),
    });
  } catch (error) {
    console.error('Leaderboard GET error:', error);
    return NextResponse.json(
      { error: '获取排行榜失败' },
      { status: 500 }
    );
  }
}

// 添加排行榜记录
export async function POST(request: NextRequest) {
  try {
    await ensureLeaderboardTable();
    const pool = getPool();
    const body = await request.json();
    const { nickname, rounds, result } = body;

    if (!nickname || !rounds || !result) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const trimmedNickname = String(nickname).trim().slice(0, 20);
    const parsedRounds = Number(rounds);
    const parsedResult = result as LeaderboardResult;

    if (!trimmedNickname) {
      return NextResponse.json({ error: '昵称不能为空' }, { status: 400 });
    }
    if (!Number.isInteger(parsedRounds) || parsedRounds <= 0) {
      return NextResponse.json({ error: '轮数必须是正整数' }, { status: 400 });
    }
    if (parsedResult !== 'success' && parsedResult !== 'failed') {
      return NextResponse.json({ error: '结果参数非法' }, { status: 400 });
    }

    const insertResult = await pool.query<{
      id: string;
      nickname: string;
      rounds: number;
      result: LeaderboardResult;
      created_at: string;
    }>(
      `
      INSERT INTO leaderboard_entries (nickname, rounds, result)
      VALUES ($1, $2, $3)
      RETURNING id::text, nickname, rounds, result, created_at
      `,
      [trimmedNickname, parsedRounds, parsedResult]
    );

    return NextResponse.json({
      success: true,
      entry: insertResult.rows[0],
    });
  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { error: '提交失败' },
      { status: 500 }
    );
  }
}
