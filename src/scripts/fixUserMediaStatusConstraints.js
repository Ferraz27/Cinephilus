import sequelize from "../config/database.js";

async function run() {
  const expectedColumns = ["media_id", "season_number", "user_id"].sort();

  await sequelize.authenticate();

  const [constraints] = await sequelize.query(
    `
      SELECT
        con.conname AS name,
        ARRAY_AGG(att.attname ORDER BY cols.ordinality) AS columns
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN unnest(con.conkey) WITH ORDINALITY AS cols(attnum, ordinality) ON true
      JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = cols.attnum
      WHERE rel.relname = 'user_media_status'
        AND con.contype = 'u'
      GROUP BY con.conname
    `
  );

  const normalized = constraints.map((row) => ({
    name: row.name,
    columns: [...row.columns].sort(),
  }));

  for (const constraint of normalized) {
    if (constraint.columns.join(",") !== expectedColumns.join(",")) {
      await sequelize.query(
        `ALTER TABLE user_media_status DROP CONSTRAINT IF EXISTS "${constraint.name}"`
      );
    }
  }

  const [indexRows] = await sequelize.query(
    `
      SELECT
        idx.relname AS name,
        ind.indisprimary AS is_primary,
        ARRAY_AGG(att.attname ORDER BY cols.ordinality) AS columns
      FROM pg_index ind
      JOIN pg_class idx ON idx.oid = ind.indexrelid
      JOIN pg_class rel ON rel.oid = ind.indrelid
      JOIN unnest(ind.indkey) WITH ORDINALITY AS cols(attnum, ordinality) ON true
      JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = cols.attnum
      WHERE rel.relname = 'user_media_status'
        AND ind.indisunique = true
      GROUP BY idx.relname, ind.indisprimary
    `
  );

  for (const index of indexRows) {
    const columns = [...index.columns].sort();
    if (index.is_primary === true) {
      continue;
    }

    if (columns.join(",") !== expectedColumns.join(",")) {
      await sequelize.query(`DROP INDEX IF EXISTS "${index.name}"`);
    }
  }

  const [finalConstraints] = await sequelize.query(
    `
      SELECT
        con.conname AS name,
        ARRAY_AGG(att.attname ORDER BY cols.ordinality) AS columns
      FROM pg_constraint con
      JOIN pg_class rel ON rel.oid = con.conrelid
      JOIN unnest(con.conkey) WITH ORDINALITY AS cols(attnum, ordinality) ON true
      JOIN pg_attribute att ON att.attrelid = rel.oid AND att.attnum = cols.attnum
      WHERE rel.relname = 'user_media_status'
        AND con.contype = 'u'
      GROUP BY con.conname
    `
  );

  const hasExpectedConstraint = finalConstraints.some((row) =>
    [...row.columns].sort().join(",") === expectedColumns.join(",")
  );

  if (!hasExpectedConstraint) {
    await sequelize.query(
      `ALTER TABLE user_media_status
        ADD CONSTRAINT user_media_status_user_media_season_key
        UNIQUE (user_id, media_id, season_number)`
    );
  }

  await sequelize.close();
}

run().then(() => {
  console.log("Constraints fixed.");
}).catch((error) => {
  console.error("Failed to fix constraints:", error);
  process.exitCode = 1;
});
