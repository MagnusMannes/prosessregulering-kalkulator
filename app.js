const aInput = document.getElementById('aCoeffs');
const bInput = document.getElementById('bCoeffs');
const biasInput = document.getElementById('bias');
const equationText = document.getElementById('equationText');
const equationLatex = document.getElementById('equationLatex');
const applyFormulaBtn = document.getElementById('applyFormula');
const exampleStableBtn = document.getElementById('exampleStable');
const resetFormulaBtn = document.getElementById('resetFormula');
const svg = document.getElementById('diagramCanvas');

let model = {
  a: [-1.2, 0.32],
  b: [0.5, 0.2],
  bias: 0.1
};

applyFormulaBtn.addEventListener('click', () => {
  model = readModelFromInputs();
  renderEquation();
  renderDiagram();
});

exampleStableBtn.addEventListener('click', () => {
  aInput.value = '-0.9, 0.22';
  bInput.value = '0.45, 0.16, 0.05';
  biasInput.value = '0';
  model = readModelFromInputs();
  renderEquation();
  renderDiagram();
});

resetFormulaBtn.addEventListener('click', () => {
  aInput.value = '';
  bInput.value = '';
  biasInput.value = '0';
  model = readModelFromInputs();
  renderEquation();
  renderDiagram();
});

[aInput, bInput, biasInput].forEach((el) => {
  el.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      model = readModelFromInputs();
      renderEquation();
      renderDiagram();
    }
  });
});

function readModelFromInputs() {
  return {
    a: parseList(aInput.value),
    b: parseList(bInput.value),
    bias: Number(biasInput.value || 0)
  };
}

function parseList(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map(Number)
    .filter((num) => !Number.isNaN(num));
}

function renderEquation() {
  const latex = buildEquationLatex(model);
  equationText.value = latex;

  if (window.katex) {
    window.katex.render(`\\displaystyle ${latex}`, equationLatex, {
      throwOnError: false,
      displayMode: true
    });
  } else {
    equationLatex.textContent = latex;
  }
}

function buildEquationLatex(systemModel) {
  const yTerms = systemModel.a.map((coeff, i) => `${format(coeff)}\\,y[k-${i + 1}]`);
  const uTerms = systemModel.b.map((coeff, i) => `${format(coeff)}\\,u[k-${i + 1}]`);
  const rightTerms = [...uTerms];

  if (systemModel.bias !== 0) {
    rightTerms.push(format(systemModel.bias));
  }

  const left = ['y[k]', ...yTerms].join(' + ') || 'y[k]';
  const right = rightTerms.length ? rightTerms.join(' + ') : '0';
  return `${left} = ${right}`;
}

function format(value) {
  return Number(value).toFixed(2).replace(/\.00$/, '');
}

function renderDiagram() {
  while (svg.firstChild) svg.removeChild(svg.firstChild);
  addDefs();

  const cx = 700;
  const cy = 350;

  drawCircle(cx - 180, cy, 56, 'Σ');
  drawBlock(cx + 10, cy - 40, 220, 80, 'y[k]', 'url(#outGrad)');
  drawArrow(cx - 124, cy, cx + 10, cy);

  model.b.forEach((coeff, i) => {
    const y = 120 + i * 105;
    drawBlock(120, y, 250, 74, `${format(coeff)} · z⁻${i + 1}`, 'url(#inGrad)');
    drawText('u[k]', 48, y + 45, '#95deff', 30);
    drawArrow(370, y + 37, cx - 180, cy);
  });

  if (model.bias !== 0) {
    drawBlock(120, 470, 250, 74, `${format(model.bias)}`, 'url(#inGrad)');
    drawText('bias', 48, 515, '#95deff', 30);
    drawArrow(370, 507, cx - 180, cy);
  }

  model.a.forEach((coeff, i) => {
    const y = 120 + i * 105;
    drawBlock(980, y, 270, 74, `${format(coeff)} · z⁻${i + 1}`, 'url(#fbGrad)');
    drawArrow(cx + 120, cy - 40, 1115, y + 74);
    drawArrow(980, y + 37, cx - 180, cy);
  });

  drawText('Lesbart blokkdiagram (sentrert)', 490, 58, '#d7e4ff', 36);
}

function addDefs() {
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
  <linearGradient id="inGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#1f789b"></stop>
    <stop offset="100%" stop-color="#123f63"></stop>
  </linearGradient>
  <linearGradient id="fbGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#5a3e9d"></stop>
    <stop offset="100%" stop-color="#2f245b"></stop>
  </linearGradient>
  <linearGradient id="outGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#2f7fdc"></stop>
    <stop offset="100%" stop-color="#1b3e8f"></stop>
  </linearGradient>
  <marker id="arrow" markerWidth="14" markerHeight="10" refX="10" refY="5" orient="auto">
    <polygon points="0 0, 14 5, 0 10" fill="#bfd1ff"></polygon>
  </marker>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity="0.35"/>
  </filter>`;
  svg.append(defs);
}

function drawBlock(x, y, w, h, text, fill) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('filter', 'url(#shadow)');

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', w);
  rect.setAttribute('height', h);
  rect.setAttribute('rx', 18);
  rect.setAttribute('fill', fill);
  rect.setAttribute('stroke', '#c4d3ff');
  rect.setAttribute('stroke-width', '1.4');

  const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.setAttribute('x', x + w / 2);
  label.setAttribute('y', y + h / 2 + 10);
  label.setAttribute('text-anchor', 'middle');
  label.setAttribute('fill', '#f5f9ff');
  label.setAttribute('font-size', '34');
  label.textContent = text;

  g.append(rect, label);
  svg.append(g);
}

function drawCircle(x, y, r, text) {
  const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  c.setAttribute('cx', x);
  c.setAttribute('cy', y);
  c.setAttribute('r', r);
  c.setAttribute('fill', '#537eea');
  c.setAttribute('stroke', '#d2ddff');
  c.setAttribute('stroke-width', '2');

  const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.setAttribute('x', x);
  label.setAttribute('y', y + 14);
  label.setAttribute('text-anchor', 'middle');
  label.setAttribute('fill', '#f5f9ff');
  label.setAttribute('font-size', '44');
  label.textContent = text;

  svg.append(c, label);
}

function drawArrow(x1, y1, x2, y2) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1);
  line.setAttribute('y1', y1);
  line.setAttribute('x2', x2);
  line.setAttribute('y2', y2);
  line.setAttribute('stroke', '#bfd1ff');
  line.setAttribute('stroke-width', '3');
  line.setAttribute('marker-end', 'url(#arrow)');
  svg.append(line);
}

function drawText(text, x, y, color, size) {
  const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  t.setAttribute('x', x);
  t.setAttribute('y', y);
  t.setAttribute('fill', color);
  t.setAttribute('font-size', String(size));
  t.setAttribute('font-family', 'Inter, sans-serif');
  t.textContent = text;
  svg.append(t);
}

renderEquation();
renderDiagram();
