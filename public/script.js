const map = L.map('map').setView([37.507, 15.083], 17);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

fetch('/api/sensors')
  .then(res => res.json())
  .then(data => {
    data.forEach(sensor => {
      L.marker([sensor.lat, sensor.lng])
        .addTo(map)
        .bindPopup(`<b>${sensor.tipo}</b><br>Valore: ${sensor.valore}`);
    });
  });

fetch('/api/dss')
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('dss-list');
    data.forEach(d => {
      L.circleMarker(d.posizione, { color: 'red' })
        .addTo(map)
        .bindPopup(`<b>Decisione DSS:</b><br>${d.decisione}`);
      const item = document.createElement('li');
      item.textContent = `${d.tipo}: ${d.decisione}`;
      list.appendChild(item);
    });
  });
// Grafico con valori sensor
fetch('/api/sensors')
  .then(res => res.json())
  .then(data => {
    const labels = data.map(s => `${s.tipo} #${s.id}`);
    const valori = data.map(s => s.valore);

    new Chart(document.getElementById('sensorChart'), {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Valori sensori',
          data: valori,
          backgroundColor: 'rgba(0, 123, 255, 0.6)'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        }
      }
    });
  });
// Grafico con decisioni DSS
fetch('/api/storico')
  .then(res => res.json())
  .then(dati => {
    const tabella = document.getElementById('storico');
    dati.forEach(row => {
      const riga = document.createElement('tr');
      riga.innerHTML = `<td>${row.tipo}</td><td>${row.valore}</td><td>${row.timestamp}</td>`;
      tabella.appendChild(riga);
    });
  });

  document.getElementById('formSegnalazione').addEventListener('submit', e => {
  e.preventDefault();
  const form = new FormData(e.target);
  fetch('/api/segnalazioni', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(form.entries()))
  })
  .then(res => res.json())
  .then(resp => {
    alert("Segnalazione inviata con successo!");
    e.target.reset();
  });
});
// Invia segnalazione al server