/**
 * Menú Gógoblu — carga productos disponibles desde Google Sheets (Apps Script)
 */
const API_URL =
  'https://script.google.com/macros/s/AKfycbysusR8DwUt4gwAePY6LXYnQra-psCAC6Vs-dGrjCVwO1H86bZS1pyKUiseolmLUfD8/exec';

const REFRESH_MS = 45000;

const CATEGORIA_PLANETA = {
  'bebidas calientes': '1',
  'productos dulces': '2',
  'productos salados': '3',
  'bebidas frias': '4',
  'bebidas frías': '4',
  licores: '5'
};

const TITULOS_PLANETA = {
  1: '☕ Bebidas calientes ☕',
  2: '🧁 Productos dulces 🧁',
  3: '🥐 Productos salados 🥐',
  4: '🥤 Bebidas frías 🥤',
  5: '🍺 Licores 🍺',
  6: '🎲 Juegos de mesa 🎲',
  7: '🧮 ¡Sudoku! 🧮'
};

const JUEGOS_MESA = [
  'Carcassonne', 'Catán', 'Uno', 'Dos', 'Virus', 'Naipes', 'Parqués',
  'Get on board', 'Dominó', 'Jenga', 'Ticket to ride', 'Hues and cues',
  'Sushi Go', 'The mind', 'Pictionary', 'Scrabble', 'Azul', 'Risk',
  'Basta 2.0', 'Looping plane', 'Polilla tramposa', 'Fantasma Blitz',
  'Monopoly Deal', 'Flip 7', 'Ajedrez', 'Take 6', 'Astucia naval',
  'Spot it', 'Gatitos explosivos', 'Cabo', 'Cranium', 'Adivina Quién',
  'Sling Hockey', 'Sleeping queens', 'Cockroach poker', 'Bandido',
  'Cards vs Gravity', 'Taco, gato, cabra, queso, pizza', 'Tinderblox',
  'Kollide', 'King Domino', 'Go Town', 'Mor-c (de la casa)',
  'Creactiva (de la casa)', 'Monta la ola (de la casa)',
  'Incoleto (de la casa)', 'Palabras de pelos (de la casa)'
].join('\n- ');

const planetMessages = {
  1: { title: TITULOS_PLANETA[1], text: 'Cargando menú…' },
  2: { title: TITULOS_PLANETA[2], text: 'Cargando menú…' },
  3: { title: TITULOS_PLANETA[3], text: 'Cargando menú…' },
  4: { title: TITULOS_PLANETA[4], text: 'Cargando menú…' },
  5: { title: TITULOS_PLANETA[5], text: 'Cargando menú…' },
  6: { title: TITULOS_PLANETA[6], text: '- ' + JUEGOS_MESA },
  7: { title: TITULOS_PLANETA[7], text: '' }
};

let adicionesTexto = 'Cargando adiciones…';

function esCategoriaAdicion(cat) {
  const key = normalizar(cat);
  return key === 'adicion' || key === 'adiciones';
}

function normalizar(t) {
  return String(t || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function formatPrecio(n) {
  const v = Number(n) || 0;
  return v.toLocaleString('es-CO');
}

function formatearLista(items) {
  if (!items.length) return '(Sin productos disponibles por ahora)';
  return items
    .map(p => `- ${p.producto} ......... ${formatPrecio(p.precio)}`)
    .join('\n');
}

async function cargarMenuDesdeApi() {
  try {
    const res = await fetch(`${API_URL}?action=menu&_=${Date.now()}`);
    const json = await res.json();
    if (!json.ok || !Array.isArray(json.data)) {
      throw new Error(json.error || 'Respuesta inválida');
    }

    const porPlaneta = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    const adiciones = [];

    json.data.forEach(item => {
      if (esCategoriaAdicion(item.categoria)) {
        adiciones.push(item);
        return;
      }
      const key = normalizar(item.categoria);
      const pid = CATEGORIA_PLANETA[key];
      if (!pid) return;
      porPlaneta[pid].push(item);
    });

    Object.keys(porPlaneta).forEach(id => {
      porPlaneta[id].sort((a, b) =>
        String(a.producto).localeCompare(String(b.producto), 'es')
      );
      planetMessages[id].text = formatearLista(porPlaneta[id]);
    });

    adiciones.sort((a, b) =>
      String(a.producto).localeCompare(String(b.producto), 'es')
    );
    adicionesTexto = formatearLista(adiciones);

    setEstadoMenu('Menú actualizado');
  } catch (err) {
    console.error('Error cargando menú:', err);
    setEstadoMenu('Sin conexión al inventario');
    [1, 2, 3, 4, 5].forEach(id => {
      if (planetMessages[id].text === 'Cargando menú…') {
        planetMessages[id].text =
          'No se pudo cargar el menú.\nRevisa la conexión e intenta de nuevo.';
      }
    });
    if (adicionesTexto === 'Cargando adiciones…') {
      adicionesTexto = 'No se pudieron cargar las adiciones.';
    }
  }
}

function setEstadoMenu(msg) {
  let el = document.getElementById('menu-sync-status');
  if (!el) {
    el = document.createElement('p');
    el.id = 'menu-sync-status';
    el.className = 'menu-sync-status';
    const container = document.querySelector('.container');
    if (container) container.appendChild(el);
  }
  el.textContent = msg;
}

// —— UI existente ——
const popup = document.getElementById('popup');
const popupTitle = document.getElementById('popup-title');
const popupText = document.getElementById('popup-text');
const popupClose = document.getElementById('popup-close');
const sudokuContainer = document.getElementById('sudoku-container');
const planets = document.querySelectorAll('.planet');

function generateRandomSudoku() {
  const base = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
  ];
  const shuffle = array => array.sort(() => Math.random() - 0.5);
  const rows = shuffle([0, 1, 2])
    .concat(shuffle([3, 4, 5]))
    .concat(shuffle([6, 7, 8]));
  const cols = shuffle([0, 1, 2])
    .concat(shuffle([3, 4, 5]))
    .concat(shuffle([6, 7, 8]));
  return rows.map(row => cols.map(col => base[row][col]));
}

function renderSudokuBoard(container) {
  const board = generateRandomSudoku();
  container.innerHTML = '';
  const table = document.createElement('table');
  table.classList.add('sudoku-table');
  for (let i = 0; i < 9; i++) {
    const row = document.createElement('tr');
    for (let j = 0; j < 9; j++) {
      const cell = document.createElement('td');
      cell.contentEditable = board[i][j] === 0;
      cell.textContent = board[i][j] !== 0 ? board[i][j] : '';
      cell.classList.add('sudoku-cell');
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  container.appendChild(table);
}

function validateSudoku(container) {
  const rows = Array.from(container.querySelectorAll('tr')).map(row =>
    Array.from(row.querySelectorAll('td')).map(
      cell => parseInt(cell.textContent) || 0
    )
  );
  const isValidRow = row =>
    new Set(row.filter(n => n !== 0)).size === row.filter(n => n !== 0).length;
  const isValidCol = col =>
    new Set(rows.map(row => row[col]).filter(n => n !== 0)).size ===
    rows.map(row => row[col]).filter(n => n !== 0).length;
  const isValidGrid = (startRow, startCol) => {
    const nums = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        nums.push(rows[startRow + i][startCol + j]);
      }
    }
    return (
      new Set(nums.filter(n => n !== 0)).size === nums.filter(n => n !== 0).length
    );
  };
  return (
    rows.every(isValidRow) &&
    rows[0].every((_, col) => isValidCol(col)) &&
    [0, 3, 6].every(row =>
      [0, 3, 6].every(col => isValidGrid(row, col))
    )
  );
}

planets.forEach(planet => {
  planet.addEventListener('click', () => {
    const id = planet.dataset.popup;
    sudokuContainer.classList.add('hidden');
    if (id !== '7') sudokuContainer.innerHTML = '';

    popupTitle.textContent = planetMessages[id].title;
    if (id === '7') {
      sudokuContainer.classList.remove('hidden');
      popupText.textContent = '';
      renderSudokuBoard(sudokuContainer);
    } else {
      popupText.textContent = planetMessages[id].text;
    }
    popup.classList.remove('hidden');
  });
});

const btnAdiciones = document.getElementById('btn-adiciones');
if (btnAdiciones) {
  btnAdiciones.addEventListener('click', () => {
    sudokuContainer.classList.add('hidden');
    sudokuContainer.innerHTML = '';
    popupTitle.textContent = '➕ Adiciones';
    popupText.textContent = adicionesTexto;
    popup.classList.remove('hidden');
  });
}

popupClose.addEventListener('click', () => {
  if (popupTitle.textContent === planetMessages[7].title) {
    if (validateSudoku(sudokuContainer)) {
      alert('¡Buen trabajo!');
      popup.classList.add('hidden');
    } else {
      alert('Síguelo intentando');
    }
  } else {
    popup.classList.add('hidden');
  }
});

const tooltip = document.createElement('div');
tooltip.classList.add('tooltip');
document.body.appendChild(tooltip);

planets.forEach(planet => {
  const id = planet.dataset.popup;
  const title = planetMessages[id]?.title || 'Planeta desconocido';
  planet.addEventListener('mouseover', e => {
    tooltip.textContent = title;
    tooltip.style.left = `${e.pageX + 10}px`;
    tooltip.style.top = `${e.pageY + 10}px`;
    tooltip.classList.add('visible');
  });
  planet.addEventListener('mousemove', e => {
    tooltip.style.left = `${e.pageX + 10}px`;
    tooltip.style.top = `${e.pageY + 10}px`;
  });
  planet.addEventListener('mouseout', () => {
    tooltip.classList.remove('visible');
  });
});

cargarMenuDesdeApi();
setInterval(cargarMenuDesdeApi, REFRESH_MS);
