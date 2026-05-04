import { Pool, type QueryResultRow } from "pg";

const pool = new Pool({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
});

export const getVisits = async <TRow extends QueryResultRow = QueryResultRow>(): Promise<TRow[]> => {
  const result = await pool.query<TRow>("SELECT * FROM visits");
  return result.rows;
};

interface VisitsRow extends QueryResultRow {
  ip: string;
  pedestrians: number;
}

export const getPedestriansFor = async (ip: string): Promise<number | undefined> => {
  const result = await pool.query<VisitsRow>("SELECT pedestrians FROM visits WHERE ip = $1 LIMIT 1", [ip]);
  const row = result.rows[0];

  if (!row) {
    return undefined;
  }

  const pedestriansCount = Number(row.pedestrians);
  return Number.isNaN(pedestriansCount) ? undefined : pedestriansCount;
};

export const saveVisitsFor = async (ip: string, visits: number): Promise<void> => {
  const updateResult = await pool.query("UPDATE visits SET pedestrians = $1 WHERE ip = $2", [visits, ip]);

  if (updateResult.rowCount && updateResult.rowCount > 0) {
    return;
  }

  await pool.query("INSERT INTO visits (ip, pedestrians) VALUES ($1, $2)", [ip, visits]);
};
