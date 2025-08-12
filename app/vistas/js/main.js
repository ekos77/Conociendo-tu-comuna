// ======================
// 1. VARIABLES GLOBALES
// ======================
let map, geojsonLayer, table;
let allFeatures = [];
let datosPorComuna = {};
let currentTileLayer;
const tileLayers = {
  dark: 'http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
  light: 'http://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'
};


// ======================
// 2. INICIALIZACIÓN
// ======================
document.addEventListener("DOMContentLoaded", () => {
  initMapa();
  cargarCSV();
  cargarGeoJSON();
  configurarEventos();
  mostrarModalUnaVez();

});



 
 


// ======================
// 3. MAPA
// ======================
function initMapa() {
  const temaGuardado = localStorage.getItem("tema");
  const temaInicial = temaGuardado || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  map = L.map('map').setView([-33.45, -70.66], 5);

  currentTileLayer = L.tileLayer(tileLayers[temaInicial], {
    attribution: '&copy; Conociendo tu comuna'
  }).addTo(map);

  // Aplicar tema a html para Bootstrap
  document.documentElement.setAttribute('data-bs-theme', temaInicial);
  document.documentElement.classList.add(temaInicial);

  // Ajustar switch si ya existe en DOM (por si integras)
  const switchInput = document.getElementById("darkModeSwitch");
  if (switchInput) {
    switchInput.checked = temaInicial === "dark";
  }
} 
function cambiarCapaTiles(tema) {
  if (currentTileLayer) {
    map.removeLayer(currentTileLayer);
  }
  currentTileLayer = L.tileLayer(tileLayers[tema], {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
}


function getRandomColor() {
  const r = Math.floor(150 + Math.random() * 105);
  const g = Math.floor(150 + Math.random() * 105);
  const b = Math.floor(150 + Math.random() * 105);
  return `rgb(${r},${g},${b})`;
}

// ======================
// 4. CARGA DE DATOS
// ======================
function cargarCSV() {
  fetch('app/vistas/csv/educacion_por_comuna.csv')
    .then(res => res.text())
    .then(csv => {
      const filas = csv.trim().split('\n');
      const headers = filas[0].split(';');

      filas.slice(1).forEach(row => {
        const cols = row.split(';');
        const comuna = cols[0].toLowerCase();
        datosPorComuna[comuna] = {};
        headers.forEach((h, i) => {
          datosPorComuna[comuna][h] = cols[i];
        });
      });

      renderTabla();
    });
}

function cargarGeoJSON() {
  // fetch('app/vistas/geojson/comunas.geojson')
  fetch('app/vistas/geojson/map.geojson')

    .then(res => res.json())
    .then(data => {
      allFeatures = data.features;

      geojsonLayer = L.geoJSON(allFeatures, {
        style: () => ({
          color: 'black',
          weight: 1,
          fillColor: getRandomColor(),
          fillOpacity: 0.5
        }),
        onEachFeature: (feature, layer) => {
          const nombre = feature.properties.Comuna || "Desconocida";
          layer.on('click', () => {
            mostrarDatosAnalizados(nombre);
            cerrarAlert();
          });
        }
      }).addTo(map);
    });
}

// ======================
// 5. TABLA
// ======================
function renderTabla(filtros = null) {

  // Obtener tema guardado o por defecto
  const tema = localStorage.getItem("tema") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  document.documentElement.setAttribute('data-bs-theme', tema);
  document.documentElement.classList.add(tema); 
  let comunasFiltradas = Object.keys(datosPorComuna);
  if (filtros?.length) {
    comunasFiltradas = comunasFiltradas.filter(c =>
      filtros.some(f => c.includes(f))
    );
  }

  const data = comunasFiltradas.map(c => {
    const d = datosPorComuna[c];
    return [
      d["Comuna"], d["Poblacion censada"], d["Nunca asistio"],
      d["Diferencial"], d["Parvularia"], d["Basica"],
      d["Media"], d["Superior"]
    ];
  });

  if (table) {
    table.clear().rows.add(data).draw();
  } else {
    table = new DataTable('#tabla-datos', {
      data,
      pageLength: 15,
      responsive: true,
      order: [[2, 'desc']],
      language: { url: "https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json" }
    });
  }
}


function cambiarTemaDataTable(tema) {
  if (table) {
    const data = table.rows().data().toArray();
    table.destroy();
    table = new DataTable('#tabla-datos', {
      data,
      pageLength: 10,
      responsive: true,
      order: [[2, 'desc']],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.8/i18n/es-ES.json"
      }
    });
  }
}

function configurarSwitchModoOscuro() {
  const switchInput = document.getElementById("darkModeSwitch");
  if (!switchInput) return; // si no existe, no hace nada

  // Inicializar switch según localStorage
  const temaGuardado = localStorage.getItem("tema");
  if (temaGuardado) {
    switchInput.checked = temaGuardado === "dark";
  } else {
    const sistemaOscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
    switchInput.checked = sistemaOscuro;
  }

  switchInput.addEventListener("change", () => {
    const nuevoTema = switchInput.checked ? "dark" : "light";
    document.documentElement.setAttribute('data-bs-theme', nuevoTema);
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(nuevoTema);
    localStorage.setItem("tema", nuevoTema);

    cambiarCapaTiles(nuevoTema);
    cambiarTemaDataTable(nuevoTema);
  });
}




// ======================
// 6. LATERAL DE COMPARACIONES
// ======================
function mostrarDatosAnalizados(comuna) {
  // fetch("app/vistas/csv/convinar.csv")
  fetch("app/vistas/csv/combinado_11.csv")
    .then(r => r.text())
    .then(txt => {
      const datos = txt.split("\n").slice(1).map(row => {
        const [com, nunca, profe, aep1, aep2] = row.split(";").map(p => p.trim());
        return com ? {
          comuna: com,
          nunca: parseFloat(nunca),
          profe: parseFloat(profe),
          aep1: parseFloat(aep1),
          aep2: parseFloat(aep2)
        } : null;
      }).filter(Boolean);

      const comunaData = datos.find(d => d.comuna.toLowerCase() === comuna.toLowerCase());
      const lateral = document.querySelector("#lateral");

      if (!comunaData || lateral.innerHTML.includes(`<td>${comuna}</td>`)) return;

      const items = [
        { indicador: `${comunaData.nunca.toFixed(2)}% Sin escolaridad`, valor: comunaData.nunca },
        { indicador: `${comunaData.profe.toFixed(2)}% Profesionales`, valor: comunaData.profe }
      ]; 
items.forEach((d, i) => {
  lateral.insertAdjacentHTML('beforeend', `
    <tr data-comuna="${comuna.toLowerCase()}">
      ${i === 0 ? `<td rowspan="${items.length}" class="text-center align-middle">
                     <button class="btn btn-danger btn-sm btn-borrar-comuna" type="button">
                       <i class="bi bi-x-lg"></i>
                     </button>
                   </td>` : ""}
      ${i === 0 ? `<td rowspan="${items.length}" class="text-center align-middle"><a class="link-opacity-100" href="#"    data-bs-toggle="modal" 
  data-bs-target="#modalMiTabla" 
  data-com="${comuna}" >${comuna}</a>
      </td>` : ""}
      <td>${d.indicador}</td>
      <td>
        <div class="progress" style="height: 30px;">
          <div class="progress-bar" style="width: ${d.valor}%" aria-valuenow="${d.valor}">
            ${d.valor.toFixed(2)}%
          </div>
        </div>
      </td>
      ${i === 0 ? `<td rowspan="${items.length}" class="text-center align-middle">${comunaData.aep1.toFixed(2)} años</td>` : ""}
    </tr>
  `);
}); 

    });


}

function configurarBotonBorrarComuna() {
  document.querySelector("#lateral").addEventListener("click", e => {
    if (e.target.closest(".btn-borrar-comuna")) {
      const fila = e.target.closest("tr");
      const comuna = fila.getAttribute("data-comuna");
      if (!comuna) return;
      document.querySelectorAll(`#lateral tr[data-comuna="${comuna}"]`).forEach(tr => tr.remove());
    }
  });
} 

function cerrarAlert() {
  const alert = document.querySelector('#alert');
  if (alert) new bootstrap.Alert(alert).close();
}

// ======================
// 7. EVENTOS
// ======================
function configurarEventos() {

    configurarSwitchModoOscuro();

  document.getElementById('comunas-input').addEventListener('input', () => {
    const filtros = document.getElementById('comunas-input').value
      .toLowerCase()
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    if (geojsonLayer) {
      geojsonLayer.clearLayers();
      const filtradas = allFeatures.filter(f =>
        filtros.some(filtro => (f.properties.Comuna || '').toLowerCase().includes(filtro))
      );
      geojsonLayer.addData(filtradas);
    }
  }); 

}
// ======================
// 8. CERRAR TR
// ======================
 configurarBotonBorrarComuna();
 
 

// ======================
// 9. MODAL
// ======================
function mostrarModalUnaVez() {
  if (!sessionStorage.getItem('modalMostrado')) {
    new bootstrap.Modal(document.getElementById('exampleModal')).show();
    sessionStorage.setItem('modalMostrado', 'true');
  }
}

// ======================
// 10. POBLAR MODAL
// ======================

// // Función para convertir CSV a array de objetos
// function csvToJson(csvText) {
//   const lines = csvText.trim().split("\n");
//   const headers = lines[0].split(";").map(h => h.trim());
  
//   return lines.slice(1).map(line => {
//     const values = line.split(";").map(v => v.trim());
//     const obj = {};
//     headers.forEach((header, index) => {
//       // Si es número lo convertimos, si no lo dejamos como string
//       const num = Number(values[index]);
//       obj[header] = isNaN(num) ? values[index] : num;
//     });
//     return obj;
//   });
// }

// // Función para poblar tabla en modal
// function poblarModalConDatos(jsonData, modalBody) {
//   if (!jsonData.length) {
//     modalBody.innerHTML = "<div class='alert alert-warning'>No hay datos</div>";
//     return;
//   }

//   let html = '<table class="table table-striped"><thead><tr>';
//   const keys = Object.keys(jsonData[0]);
//   keys.forEach(k => html += `<th>${k}</th>`);
//   html += '</tr></thead><tbody>';
//   jsonData.forEach(item => {
//     html += '<tr>';
//     keys.forEach(k => html += `<td>${item[k]}</td>`);
//     html += '</tr>';
//   });
//   html += '</tbody></table>';
//   modalBody.innerHTML = html;
// }

// // Evento al abrir modal
// const modalEl = document.getElementById('modalMiTabla');
// modalEl.addEventListener('show.bs.modal', event => {
//   const button = event.relatedTarget;
//   const comuna = button.getAttribute('data-com').trim().toLowerCase();
//   const modalBody = modalEl.querySelector('.modal-body');

//   fetch('app/vistas/csv/combinado_11.csv')
//     .then(res => res.text())
//     .then(csvText => {
//       const data = csvToJson(csvText);
//       const datosComuna = data.filter(row => row.Comuna.toLowerCase() === comuna);
//       poblarModalConDatos(datosComuna, modalBody);
//     })
//     .catch(err => {
//       modalBody.innerHTML = `<div class="alert alert-danger">Error cargando datos</div>`;
//       console.error(err);
//     });
// });
// Función para convertir CSV a array de objetos
function csvToJson(csvText) {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(";").map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(";").map(v => v.trim());
    const obj = {};
    headers.forEach((header, index) => {
      const num = Number(values[index]);
      obj[header] = isNaN(num) ? values[index] : num;
    });
    return obj;
  });
}

// Renderizar cards
function poblarCards(datos, container) {
  const { ["Comuna"]: Comuna,  ["aep1"]: aep1, ["% nunca"]: nunca, ["% profe"]: profe, ["edad_5_14"]: edad_5_14, ["edad_15_64"]: edad_15_64, ["edad_65_mas"]: edad_65_mas } = datos;
  document.getElementById("modalMiTablaLabel").innerHTML = Comuna +" "+ aep1 + " escolaridad promedio 18+";
  container.innerHTML = `
    <div class="row mb-3">
      <div class="col-md-6">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title">% Nunca fue a la escuela</h5>
            <p class="display-6 text-danger">${nunca}%</p>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title">% Profesionales</h5>
            <p class="display-6 text-primary">${profe}%</p>
          </div>
        </div>
      </div>
    </div>
    <div class="row mb-3">
      <div class="col-md-4">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title">5 a 14</h5>
            <p class="display-6 text-danger">${edad_5_14}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title">15 a 64</h5>
            <p class="display-6 text-primary">${edad_15_64}</p>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card text-center">
          <div class="card-body">
            <h5 class="card-title">65+</h5>
            <p class="display-6 text-primary">${edad_65_mas}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Renderizar gráfico con Chart.js
// function poblarGrafico(datos, canvasEl) {
//   const labels = ["aep1", "aep2", "edad_5_14", "edad_15_64", "edad_65_mas"];
//   const valores = labels.map(l => datos[l]);

//   new Chart(canvasEl, {
//     type: 'bar',
//     data: {
//       labels,
//       datasets: [{
//         label: 'Valores numéricos',
//         data: valores,
//         backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b']
//       }]
//     },
//     options: {
//       responsive: true,
//       plugins: {
//         legend: { display: false },
//         tooltip: { enabled: true }
//       }
//     }
//   });
// }

// Renderizar tabla
function poblarModalConDatos(jsonData, modalBody) {
  if (!jsonData.length) {
    modalBody.innerHTML = "<div class='alert alert-warning'>No hay datos</div>";
    return;
  }

  const keys = Object.keys(jsonData[0]);
  let html = '<table class="table table-striped"><thead><tr>';
  keys.forEach(k => html += `<th>${k}</th>`);
  html += '</tr></thead><tbody>';
  jsonData.forEach(item => {
    html += '<tr>';
    keys.forEach(k => html += `<td>${item[k]}</td>`);
    html += '</tr>';
  });
  html += '</tbody></table>';

  modalBody.innerHTML += html;
}

// Evento al abrir modal
const modalEl = document.getElementById('modalMiTabla');
modalEl.addEventListener('show.bs.modal', event => {
  const button = event.relatedTarget;
  const comuna = button.getAttribute('data-com').trim().toLowerCase();
  const modalBody = modalEl.querySelector('.modal-body');
  modalBody.innerHTML = `
    <div id="cardsContainer"></div>
  `;

  fetch('app/vistas/csv/combinado_11.csv')
    .then(res => res.text())
    .then(csvText => {
      const data = csvToJson(csvText);
      const datosComuna = data.find(row => row.Comuna.toLowerCase() === comuna);
      if (!datosComuna) {
        modalBody.innerHTML = "<div class='alert alert-warning'>No se encontró la comuna</div>";
        return;
      }

      // Poblar cards
      poblarCards(datosComuna, document.getElementById("cardsContainer"));

      // Poblar gráfico
      // poblarGrafico(datosComuna, document.getElementById("graficoComuna"));

      // Poblar tabla
      // poblarModalConDatos([datosComuna], modalBody);
    })
    .catch(err => {
      modalBody.innerHTML = `<div class="alert alert-danger">Error cargando datos</div>`;
      console.error(err);
    });
});