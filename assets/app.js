// Shared logic for all pages
// Data keys
const APARTMENTS_KEY = 'apartmentsList';
const SPOTS_KEY = 'spotsList';
const PREASSIGNED_KEY = 'preassignedList';
const LAST_ASSIGNMENT_KEY = 'lastAssignmentPDF';

// Utility functions
function getList(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}
function setList(key, list) {
    localStorage.setItem(key, JSON.stringify(list));
}
function getLastAssignmentDate() {
    const info = JSON.parse(localStorage.getItem(LAST_ASSIGNMENT_KEY) || '{}');
    return info.date ? new Date(info.date) : null;
}
function setLastAssignmentPDF(dateTime, dataUrl) {
    localStorage.setItem(LAST_ASSIGNMENT_KEY, JSON.stringify({ date: dateTime, pdf: dataUrl }));
}
function getLastAssignmentPDF() {
    const info = JSON.parse(localStorage.getItem(LAST_ASSIGNMENT_KEY) || '{}');
    return info.pdf || null;
}

// Page logic
const pageType = window.pageType;
const app = document.getElementById('app');

if (pageType === 'apartments') {
    renderApartmentGenerator();
    function renderApartmentGenerator() {
        const list = getList(APARTMENTS_KEY);
        app.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Apartamentos</h2>
    <div class="flex items-center mb-4 space-x-4">
      <button id="generateBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Gerar Lista de Apartamentos</button>
      <button id="deleteAllBtn" class="bg-red-500 text-white px-4 py-2 rounded">Excluir Todos</button>
      <span class="text-gray-700">Total: <span id="aptCount" class="font-bold">${list.length}</span></span>
    </div>
    <ul id="itemList" class="bg-white rounded shadow p-4">
      ${list.map((item, i) => `<li class="flex justify-between items-center py-1 border-b"><span>${item}</span><button data-i="${i}" class="text-red-500">Excluir</button></li>`).join('')}
    </ul>
    <div class="mt-4 text-sm text-gray-600">Clique para gerar apartamentos de 001A/B até 164A/B.</div>
  `;
        document.getElementById('generateBtn').onclick = function () {
            const apartments = [];
            for (let i = 0; i <= 16; i++) {
                for (let j = 1; j <= 4; j++) {
                    const unit = (i * 10 + j).toString().padStart(3, '0');
                    apartments.push(`${unit}A`, `${unit}B`);
                }
            }
            setList(APARTMENTS_KEY, apartments);
            renderApartmentGenerator();
        };
        document.getElementById('deleteAllBtn').onclick = function () {
            setList(APARTMENTS_KEY, []);
            renderApartmentGenerator();
        };
        document.querySelectorAll('#itemList button').forEach(btn => {
            btn.onclick = function () {
                list.splice(btn.dataset.i, 1);
                setList(APARTMENTS_KEY, list);
                renderApartmentGenerator();
            };
        });
    }
} else if (pageType === 'spots') {
    renderSpotsGenerator();
    function renderSpotsGenerator() {
        const list = getList(SPOTS_KEY);
        app.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Vagas de Estacionamento</h2>
    <div class="flex items-center mb-4 space-x-4">
      <button id="generateSpotsBtn" class="bg-blue-500 text-white px-4 py-2 rounded">Gerar Vagas de 1 a 136</button>
      <button id="deleteAllSpotsBtn" class="bg-red-500 text-white px-4 py-2 rounded">Excluir Todos</button>
      <span class="text-gray-700">Total: <span id="spotsCount" class="font-bold">${list.length}</span></span>
    </div>
    <ul id="itemList" class="bg-white rounded shadow p-4">
      ${list.map((item, i) => `<li class="flex justify-between items-center py-1 border-b"><span>${item}</span><button data-i="${i}" class="text-red-500">Excluir</button></li>`).join('')}
    </ul>
    <div class="mt-4 text-sm text-gray-600">Clique para gerar vagas de estacionamento de 1 até 136.</div>
  `;
        document.getElementById('generateSpotsBtn').onclick = function () {
            const spots = [];
            for (let i = 1; i <= 136; i++) {
                spots.push(i.toString());
            }
            setList(SPOTS_KEY, spots);
            renderSpotsGenerator();
        };
        document.getElementById('deleteAllSpotsBtn').onclick = function () {
            setList(SPOTS_KEY, []);
            renderSpotsGenerator();
        };
        document.querySelectorAll('#itemList button').forEach(btn => {
            btn.onclick = function () {
                list.splice(btn.dataset.i, 1);
                setList(SPOTS_KEY, list);
                renderSpotsGenerator();
            };
        });
    }
} else if (pageType === 'preassigned') {
    renderPreassignedEditor();
} else if (pageType === 'assign') {
    renderAssignmentPage();
}

function renderListEditor(title, key, placeholder) {
    const list = getList(key);
    app.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">${title}</h2>
    <form id="addForm" class="flex mb-4">
      <input id="itemInput" class="flex-1 p-2 border rounded-l" placeholder="${placeholder}" />
      <button type="submit" class="bg-blue-500 text-white px-4 rounded-r">Adicionar</button>
    </form>
    <ul id="itemList" class="bg-white rounded shadow p-4">
      ${list.map((item, i) => `<li class="flex justify-between items-center py-1 border-b"><span>${item}</span><button data-i="${i}" class="text-red-500">Excluir</button></li>`).join('')}
    </ul>
  `;
    document.getElementById('addForm').onsubmit = function (e) {
        e.preventDefault();
        const val = document.getElementById('itemInput').value.trim();
        if (val) {
            // Split by comma, trim, and filter out empty/duplicate values
            const items = val.split(',').map(v => v.trim()).filter(v => v && !list.includes(v));
            if (items.length > 0) {
                list.push(...items);
                setList(key, list);
                renderListEditor(title, key, placeholder);
            }
        }
    };
    document.querySelectorAll('#itemList button').forEach(btn => {
        btn.onclick = function () {
            list.splice(btn.dataset.i, 1);
            setList(key, list);
            renderListEditor(title, key, placeholder);
        };
    });
}

function renderPreassignedEditor() {
    const apartments = getList(APARTMENTS_KEY);
    const spots = getList(SPOTS_KEY);
    let preassigned = getList(PREASSIGNED_KEY);
    app.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Vagas Pré-Atribuídas</h2>
    <form id="addForm" class="flex mb-4 space-x-2">
      <input id="unitInput" class="p-2 border rounded" placeholder="Apartamento (ex. 101A)" />
      <input id="spotInput" class="p-2 border rounded" placeholder="Vaga (ex. 22)" />
      <button type="submit" class="bg-blue-500 text-white px-4 rounded">Adicionar</button>
    </form>
    <ul id="itemList" class="bg-white rounded shadow p-4">
      ${preassigned.map((pair, i) => `<li class="flex justify-between items-center py-1 border-b"><span>${pair.unit} → ${pair.spot}</span><button data-i="${i}" class="text-red-500">Excluir</button></li>`).join('')}
    </ul>
    <div class="mt-4 text-sm text-gray-600">Apenas apartamentos e vagas já definidos podem ser pré-attribuídos.</div>
  `;
    document.getElementById('addForm').onsubmit = function (e) {
        e.preventDefault();
        const unit = document.getElementById('unitInput').value.trim();
        const spot = document.getElementById('spotInput').value.trim();
        if (!apartments.includes(unit)) {
            alert('Apartamento não encontrado na lista.');
            return;
        }
        if (!spots.includes(spot)) {
            alert('Vaga não encontrada na lista.');
            return;
        }
        if (preassigned.some(p => p.unit === unit || p.spot === spot)) {
            alert('Apartamento ou vaga já pré-atribuído.');
            return;
        }
        preassigned.push({ unit, spot });
        setList(PREASSIGNED_KEY, preassigned);
        renderPreassignedEditor();
    };
    document.querySelectorAll('#itemList button').forEach(btn => {
        btn.onclick = function () {
            preassigned.splice(btn.dataset.i, 1);
            setList(PREASSIGNED_KEY, preassigned);
            renderPreassignedEditor();
        };
    });
}

function renderAssignmentPage() {
    const apartments = getList(APARTMENTS_KEY);
    const spots = getList(SPOTS_KEY);
    const preassigned = getList(PREASSIGNED_KEY);
    const lastDate = getLastAssignmentDate();
    let error = '';
    if (apartments.length !== spots.length) {
        error = 'Number of apartment units and parking spots must be equal.';
    }
    // Check preassigned validity
    for (const p of preassigned) {
        if (!apartments.includes(p.unit) || !spots.includes(p.spot)) {
            error = 'Preassigned unit or spot not found in lists.';
            break;
        }
    }
    // Check for duplicate assignments
    const assignedUnits = new Set(preassigned.map(p => p.unit));
    const assignedSpots = new Set(preassigned.map(p => p.spot));
    if (assignedUnits.size !== preassigned.length || assignedSpots.size !== preassigned.length) {
        error = 'Vagas pré-atribuídas não podem ser duplicadas.';
    }
    app.innerHTML = `
    <div class="mb-4">
      <button id="assignBtn" class="bg-blue-500 text-white px-4 py-2 rounded" ${lastDate && new Date().getFullYear() === lastDate.getFullYear() ? 'disabled' : ''}>Sortear Vagas</button>
      <span id="lastDrawDate" class="ml-4 text-gray-600">${lastDate ? `Último sorteio: ${lastDate.toLocaleString('pt-BR')}` : 'Nunca sorteado'}</span>
      <div id="pdfSection" class="mt-4"></div>
    </div>
    <div id="errorMsg" class="text-red-500 mb-4">${error}</div>
    <div id="result"></div>
  `;
    document.getElementById('assignBtn').onclick = function () {
        if (error) {
            alert(error);
            return;
        }
        assignSpots(apartments, spots, preassigned);
        // After assignment, update lastDate and disable button
        document.getElementById('assignBtn').disabled = true;
        document.getElementById('lastDrawDate').textContent = `Último sorteio: ${getLastAssignmentDate().toLocaleString('pt-BR')}`;
        document.getElementById('pdfSection').innerHTML = `<a href="${getLastAssignmentPDF()}" download="assignment.pdf" class="bg-green-500 text-white px-4 py-2 rounded">Download do Último sorteio (PDF)</a>`;
    };
    // Show download if PDF exists
    const pdfData = getLastAssignmentPDF();
    if (pdfData) {
        document.getElementById('pdfSection').innerHTML = `<a href="${pdfData}" download="assignment.pdf" class="bg-green-500 text-white px-4 py-2 rounded">Download do Último sorteio (PDF)</a>`;
    }
}

function assignSpots(apartments, spots, preassigned) {
    // Remove preassigned from lists
    const unassignedUnits = apartments.filter(u => !preassigned.some(p => p.unit === u));
    const unassignedSpots = spots.filter(s => !preassigned.some(p => p.spot === s));
    // Shuffle spots
    for (let i = unassignedSpots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [unassignedSpots[i], unassignedSpots[j]] = [unassignedSpots[j], unassignedSpots[i]];
    }
    // Assign
    const assignments = [...preassigned];
    for (let i = 0; i < unassignedUnits.length; i++) {
        assignments.push({ unit: unassignedUnits[i], spot: unassignedSpots[i] });
    }
    // Validate
    const unitSet = new Set();
    const spotSet = new Set();
    for (const a of assignments) {
        if (unitSet.has(a.unit) || spotSet.has(a.spot)) {
            document.getElementById('errorMsg').textContent = 'Atribuição duplicada.';
            return;
        }
        unitSet.add(a.unit);
        spotSet.add(a.spot);
    }
    // Show result
    document.getElementById('result').innerHTML = `<h3 class="text-lg font-bold mb-2">Resultado do Sorteio</h3><ul class="bg-white rounded shadow p-4">${assignments.map(a => `<li>${a.unit} → ${a.spot}${preassigned.some(p => p.unit === a.unit) ? ' (Pré-Atribuído)' : ''}</li>`).join('')}</ul>`;
    // Generate PDF
    generatePDF(preassigned, assignments);
}

function generatePDF(preassigned, assignments) {
    const dateTime = new Date();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let y = 10;
    const pageHeight = doc.internal.pageSize.getHeight();
    const bottomMargin = 20;
    doc.setFontSize(16);
    doc.text('Sorteio de Vagas de Estacionamento', 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Data: ${dateTime.toLocaleString('pt-BR')}`, 10, y);
    y += 10;
    doc.text('Código Fonte: https://github.com/rbrugnollo/VagasTorres', 10, y);
    y += 10;
    doc.text('Sorteio Final:', 10, y);
    y += 8;
    // Table header
    doc.setFont(undefined, 'bold');
    doc.text('Apartamento', 12, y);
    doc.text('Vaga', 60, y);
    doc.text('Pré-Atribuído', 100, y);
    doc.setFont(undefined, 'normal');
    y += 7;
    assignments.forEach(a => {
        if (y > pageHeight - bottomMargin) {
            doc.addPage();
            y = 10;
            doc.setFont(undefined, 'bold');
            doc.text('Apartamento', 12, y);
            doc.text('Vaga', 60, y);
            doc.text('Pré-Atribuído', 100, y);
            doc.setFont(undefined, 'normal');
            y += 7;
        }
        doc.text(a.unit, 12, y);
        doc.text(a.spot, 60, y);
        doc.text(preassigned.some(p => p.unit === a.unit) ? 'Sim' : 'Não', 100, y);
        y += 6;
    });
    // Save PDF to localStorage
    const pdfData = doc.output('dataurlstring');
    setLastAssignmentPDF(dateTime, pdfData);
    document.getElementById('pdfSection').innerHTML = `<a href="${pdfData}" download="assignment.pdf" class="bg-green-500 text-white px-4 py-2 rounded">Download do Último sorteio (PDF)</a>`;
}
