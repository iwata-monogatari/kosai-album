CREATE TABLE operator_sessions (
    ticket_hash TEXT PRIMARY KEY,
    session_hash TEXT UNIQUE,
    expires INTEGER NOT NULL
);
