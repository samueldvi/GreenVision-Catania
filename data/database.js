const Database = require('better-sqlite3');
const db = new Database('./data/greenvision.db');

// Crea tabella se non esiste
db.prepare(`
  CREATE TABLE IF NOT EXISTS storico (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT,
    valore REAL,
    lat REAL,
    lng REAL,
    timestamp TEXT
  )
`).run();

module.exports = db;

db.prepare(`
  CREATE TABLE IF NOT EXISTS segnalazioni (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    zona TEXT,
    messaggio TEXT,
    timestamp TEXT
  )
`).run();
