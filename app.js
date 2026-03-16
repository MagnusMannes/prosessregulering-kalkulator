const palette = document.getElementById('palette');
const dropZone = document.getElementById('dropZone');
const equationText = document.getElementById('equationText');
const template = document.getElementById('termTemplate');
const clearEquationBtn = document.getElementById('clearEquation');
const quickExampleBtn = document.getElementById('quickExample');
const generateDiagramBtn = document.getElementById('generateDiagram');
const svg = document.getElementById('diagramCanvas');

const terms = [];
let termCounter = 0;
let draggedCardId = null;

const blockLabels = {
  input: 'Inngangsledd',
  output: 'Tilbakemeldingsledd',
  constant: 'Konstantledd'
};

palette.addEventListener('dragstart', (event) => {
  const type = event.target.dataset?.type;
  if (!type) return;
  event.dataTransfer.setData('text/plain', type);
});

dropZone.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('active');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('active');
});

dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('active');

  const type = event.dataTransfer.getData('text/plain');
  if (type) {
    addTerm(type);
    return;
  }

  const targetCard = event.target.closest('.term-card');
  if (!targetCard || !draggedCardId) return;
  reorderTerms(draggedCardId, Number(targetCard.dataset.id));
});

clearEquationBtn.addEventListener('click', () => {
  terms.length = 0;
  renderTerms();
  renderEquation();
  renderDiagram();
});

quickExampleBtn.addEventListener('click', () => {
  terms.length = 0;
  addTerm('output', { coeff: -1.2, delay: 1 });
  addTerm('output', { coeff: 0.32, delay: 2 });
  addTerm('input', { coeff: 0.5, delay: 1 });
  addTerm('input', { coeff: 0.2, delay: 2 });
  addTerm('constant', { coeff: 0.1, delay: 0 });
});

generateDiagramBtn.addEventListener('click', () => renderDiagram());

function addTerm(type, preset = {}) {
  termCounter += 1;
  terms.push({
    id: termCounter,
    type,
    coeff: preset.coeff ?? 1,
    delay: preset.delay ?? 1
  });
  renderTerms();
  renderEquation();
}

function reorderTerms(fromId, toId) {
  const fromIndex = terms.findIndex((term) => term.id === fromId);
  const toIndex = terms.findIndex((term) => term.id === toId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

  const [moved] = terms.splice(fromIndex, 1);
  terms.splice(toIndex, 0, moved);
  renderTerms();
  renderEquation();
}

function renderTerms() {
  const cards = dropZone.querySelectorAll('.term-card');
  cards.forEach((card) => card.remove());

  const helperText = dropZone.querySelector('p');
  if (helperText) helperText.style.display = terms.length ? 'none' : 'block';

  terms.forEach((term) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.dataset.id = String(term.id);
    node.querySelector('.term-title').textContent = blockLabels[term.type];

    node.addEventListener('dragstart', () => {
      draggedCardId = term.id;
    });

    node.addEventListener('dragend', () => {
      draggedCardId = null;
    });

    node.querySelector('.delete-term').addEventListener('click', () => {
      const index = terms.findIndex((candidate) => candidate.id === term.id);
      terms.splice(index, 1);
      renderTerms();
      renderEquation();
      renderDiagram();
    });

    const fields = node.querySelector('.term-fields');
    fields.append(
      inputField('Koeffisient', term.coeff, (value) => {
        term.coeff = Number(value);
        renderEquation();
      }),
      inputField('Forsinkelse (d)', term.delay, (value) => {
        term.delay = Math.max(0, Number(value));
        renderEquation();
      })
    );

    dropZone.append(node);
  });
}

function inputField(labelText, value, onChange) {
  const label = document.createElement('label');
  label.textContent = labelText;

  const input = document.createElement('input');
  input.type = 'number';
  input.step = '0.01';
  input.value = String(value);

  input.addEventListener('input', () => {
    onChange(input.value || 0);
    renderDiagram();
  });

  label.append(input);
  return label;
}

function renderEquation() {
  if (!terms.length) {
    equationText.value = 'Legg til ledd for å bygge en differenslikning.';
    return;
  }

  const yTerms = terms
    .filter((term) => term.type === 'output')
    .map((term) => `${formatCoeff(term.coeff)}·y[k-${term.delay}]`);

  const rhsTerms = terms
    .filter((term) => term.type !== 'output')
    .map((term) => {
      if (term.type === 'constant') return `${formatCoeff(term.coeff)}`;
      return `${formatCoeff(term.coeff)}·u[k-${term.delay}]`;
    });

  const leftSide = ['y[k]', ...yTerms].join(' ');
  const rightSide = rhsTerms.length ? rhsTerms.join(' + ') : '0';
  equationText.value = `${leftSide} = ${rightSide}`;
}

function formatCoeff(value) {
  if (Number.isNaN(value)) return '0';
  return Number(value).toFixed(2).replace(/\.00$/, '');
}

function renderDiagram() {
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }

  if (!terms.length) {
    drawText('Ingen ligning enda. Dra inn blokker for å begynne.', 360, 255, '#aab7db', 24);
    return;
  }

  addDefs();

  drawRect(450, 220, 120, 70, 'Σ summer');
  drawRect(640, 220, 160, 70, 'y[k]');
  drawArrow(570, 255, 640, 255);

  const inputTerms = terms.filter((term) => term.type === 'input' || term.type === 'constant');
  const outputTerms = terms.filter((term) => term.type === 'output');

  inputTerms.forEach((term, index) => {
    const y = 100 + index * 90;
    const label = term.type === 'constant' ? `${formatCoeff(term.coeff)}` : `${formatCoeff(term.coeff)} · z⁻${term.delay}`;
    drawRect(140, y, 170, 62, label, '#14304f');
    drawArrow(310, y + 31, 450, 255);
    drawText(term.type === 'constant' ? 'bias' : 'u[k]', 84, y + 36, '#89dbff', 19);
  });

  outputTerms.forEach((term, index) => {
    const y = 340 + index * 80;
    drawRect(640, y, 170, 62, `${formatCoeff(term.coeff)} · z⁻${term.delay}`, '#362048');
    drawArrow(720, 290, 720, y);
    drawArrow(640, y + 31, 450, 255);
  });

  drawText('Differenslikning -> blokkdiagram', 30, 40, '#d5ddff', 23);
}

function addDefs() {
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
  <marker id="arrow" markerWidth="10" markerHeight="8" refX="8" refY="4" orient="auto">
    <polygon points="0 0, 10 4, 0 8" fill="#b6c6ff"></polygon>
  </marker>`;
  svg.append(defs);
}

function drawRect(x, y, width, height, text, fill = '#20306b') {
  const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', width);
  rect.setAttribute('height', height);
  rect.setAttribute('rx', 14);
  rect.setAttribute('fill', fill);
  rect.setAttribute('stroke', '#9db1ff');
  rect.setAttribute('stroke-width', '1.2');

  const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.setAttribute('x', x + width / 2);
  label.setAttribute('y', y + height / 2 + 5);
  label.setAttribute('text-anchor', 'middle');
  label.setAttribute('fill', '#eef2ff');
  label.setAttribute('font-size', '20');
  label.textContent = text;

  group.append(rect, label);
  svg.append(group);
}

function drawArrow(x1, y1, x2, y2) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  path.setAttribute('x1', x1);
  path.setAttribute('y1', y1);
  path.setAttribute('x2', x2);
  path.setAttribute('y2', y2);
  path.setAttribute('stroke', '#b6c6ff');
  path.setAttribute('stroke-width', '2.2');
  path.setAttribute('marker-end', 'url(#arrow)');
  svg.append(path);
}

function drawText(content, x, y, fill, fontSize) {
  const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.setAttribute('x', x);
  label.setAttribute('y', y);
  label.setAttribute('fill', fill);
  label.setAttribute('font-size', String(fontSize));
  label.setAttribute('font-family', 'Inter, sans-serif');
  label.textContent = content;
  svg.append(label);
}

renderEquation();
renderDiagram();
