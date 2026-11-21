CREATE TABLE IF NOT EXISTS archive_stops(id TEXT PRIMARY KEY, state TEXT NOT NULL CHECK(state IN ('held','withdrawn')), at INTEGER NOT NULL, actor TEXT NOT NULL, reason TEXT NOT NULL);
