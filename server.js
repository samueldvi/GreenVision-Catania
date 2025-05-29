const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const sensorData = require('./data/sensors.json');
const db = require('./data/database.js');

app.use(cors());
app.use(express.static('public'));

app.get('/api/sensors', (req, res) => {
  sensorData.forEach(s => {
    db.prepare(`
      INSERT INTO storico (tipo, valore, lat, lng, timestamp)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(s.tipo, s.valore, s.lat, s.lng);
  });
  res.json(sensorData);
});
app.get('/api/storico', (req, res) => {
  const dati = db.prepare("SELECT * FROM storico ORDER BY timestamp DESC LIMIT 20").all();
  res.json(dati);
});

app.get('/api/dss', (req, res) => {
  const decisioni = sensorData.map(s => {
    if (s.tipo === "Umidità" && s.valore < 30) {
      return {
        id: s.id,
        tipo: s.tipo,
        decisione: "Attivare irrigazione – Umidità bassa",
        posizione: [s.lat, s.lng]
      };
    }
    if (s.tipo === "Temperatura" && s.valore > 35) {
      return {
        id: s.id,
        tipo: s.tipo,
        decisione: "Zona calda – Valutare piantumazione alberi",
        posizione: [s.lat, s.lng]
      };
    }
    return null;
  }).filter(d => d !== null);

  res.json(decisioni);
});

app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
const PDFDocument = require('pdfkit');
const fs = require('fs');

app.get('/report.pdf', (req, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="report.pdf"');
  doc.pipe(res);

  doc.fontSize(18).text('Report Ambientale - GreenVision Catania');
  doc.moveDown();

  sensorData.forEach(s => {
    doc.fontSize(12).text(`${s.tipo}: ${s.valore} (Lat: ${s.lat}, Lng: ${s.lng})`);
  });

  doc.end();
});
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/api/segnalazioni', (req, res) => {
  const { nome, zona, messaggio } = req.body;
  db.prepare(`
    INSERT INTO segnalazioni (nome, zona, messaggio, timestamp)
    VALUES (?, ?, ?, datetime('now'))
  `).run(nome, zona, messaggio);
  res.json({ status: "ok" });
});
