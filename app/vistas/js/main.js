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
  fetch("app/vistas/csv/convinar.csv")
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
  data-com="Santiago" >${comuna}</a>
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

  document.querySelector("#comunas-lista").addEventListener("input", function () {
    const filtros = this.value.split(/[,;]+/).map(f => f.trim().toLowerCase()).filter(Boolean);
    renderTabla(filtros.length ? filtros : null);
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

// Ejemplo JSON con datos por comuna
const modalPorComuna = {
  Santiago: [
    { nombre: "Juan", edad: 30 },
    { nombre: "Ana", edad: 25 }
  ],
  Providencia: [
    { nombre: "Luis", edad: 40 },
    { nombre: "María", edad: 35 }
  ]
};

// Función para poblar tabla en modal
function poblarModalConDatos(jsonData, modalBody) {
  let html = '<table class="table table-striped"><thead><tr>';
  const keys = Object.keys(jsonData[0] || {});
  keys.forEach(k => html += `<th>${k}</th>`);
  html += '</tr></thead><tbody>';
  jsonData.forEach(item => {
    html += '<tr>';
    keys.forEach(k => html += `<td>${item[k]}</td>`);
    html += '</tr>';
  });
  html += '</tbody></table>';
  modalBody.innerHTML = html;
}

// Evento al abrir modal
const modalEl = document.getElementById('modalMiTabla');
modalEl.addEventListener('show.bs.modal', event => {
  const button = event.relatedTarget; // botón que disparó el modal
  const comuna = button.getAttribute('data-com');
  const modalBody = modalEl.querySelector('.modal-body');

  const datos = modalPorComuna[comuna] || [];
  poblarModalConDatos(datos, modalBody);
});
