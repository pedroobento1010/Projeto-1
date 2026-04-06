/**
 * Sabor Gamer — script.js Final Refinado
 */

// ============================================================
// Hierarquia de hardware
// ============================================================
const CPU_MAP = { 1: "fraco", 2: "médio", 3: "forte" };
const GPU_MAP = { 1: "integrada", 2: "básica", 3: "gamer" };

const CPU_ORDEM = { "fraco": 1, "médio": 2, "forte": 3 };
const GPU_ORDEM = { "integrada": 1, "básica": 2, "gamer": 3 };

// ============================================================
// Referências aos elementos do DOM
// ============================================================
const rangeRam = document.getElementById("range-ram");
const rangeCpu = document.getElementById("range-cpu");
const rangeGpu = document.getElementById("range-gpu");

const valRam = document.getElementById("val-ram");
const valCpu = document.getElementById("val-cpu");
const valGpu = document.getElementById("val-gpu");

const filterChecks = document.querySelectorAll(".filter-check");
const filterGenres = document.querySelectorAll(".filter-genre");

const btnReset   = document.getElementById("btn-reset");
const cardsGrid  = document.getElementById("cards-grid");
const resultsCount = document.getElementById("results-count");
const stateEmpty = document.getElementById("state-empty");

const infoToggle = document.getElementById("info-toggle");
const hardwareInfo = document.getElementById("hardware-info");

const modalOverlay = document.getElementById("modal-overlay");
const modalClose = document.getElementById("modal-close");
const modalBody = document.getElementById("modal-body");

const btnLogin = document.getElementById("btn-login");
const navAbout = document.getElementById("nav-about");

// Referências do Dropdown
const dropBtn = document.querySelector(".dropbtn");
const dropdownContent = document.querySelector(".dropdown-content");

// Referências de Ordenação
const sortSelect = document.getElementById("sort-select");
let ordemAtual = "nome";

// ============================================================
// Banco de dados de jogos
// ============================================================
let todosOsJogos = [];

// ============================================================
// Funções de Inicialização
// ============================================================
async function inicializar() {
  try {
    const resposta = await fetch("jogos.json");
    if (!resposta.ok) throw new Error();
    todosOsJogos = await resposta.json();
  } catch (e) {
    console.error("Erro ao carregar jogos.json");
  }

  configurarEventos();
  atualizarFiltros();
}

function configurarEventos() {
  // Sliders
  rangeRam.addEventListener("input", atualizarFiltros);
  rangeCpu.addEventListener("input", atualizarFiltros);
  rangeGpu.addEventListener("input", atualizarFiltros);
  
  // Ordenação
  sortSelect.addEventListener("change", (e) => {
    ordemAtual = e.target.value;
    atualizarFiltros();
  });
  
  // Checkboxes de Plataforma
  filterChecks.forEach(check => {
    check.addEventListener("change", atualizarFiltros);
  });
  
  // Checkboxes de Gênero
  filterGenres.forEach(genre => {
    genre.addEventListener("change", atualizarFiltros);
  });
  
  // Botões
  btnReset.addEventListener("click", resetarFiltros);
  
  infoToggle.addEventListener("click", () => {
    hardwareInfo.classList.toggle("hidden");
  });

  modalClose.addEventListener("click", fecharModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) fecharModal();
  });

  // Eventos de Menu
  btnLogin.addEventListener("click", () => {
    alert("Sistema de Contas: Em breve! Este é um projeto acadêmico.");
  });

  navAbout.addEventListener("click", (e) => {
    e.preventDefault();
    alert("Sabor Gamer - Projeto College\n\nEste site foi desenvolvido como um projeto acadêmico para ajudar usuários com computadores limitados a encontrar jogos compatíveis e otimizar seu hardware.");
  });

  // Lógica do Dropdown de Emuladores (Clique para abrir/fechar)
  dropBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownContent.classList.toggle("show");
    dropBtn.classList.toggle("active");
  });

  // Fechar dropdown ao clicar fora
  window.addEventListener("click", (e) => {
    if (!e.target.matches('.dropbtn')) {
      if (dropdownContent.classList.contains('show')) {
        dropdownContent.classList.remove('show');
        dropBtn.classList.remove('active');
      }
    }
  });
}

// ============================================================
// Lógica de Filtro e Renderização
// ============================================================
function atualizarFiltros() {
  const ram = parseInt(rangeRam.value);
  const cpu = CPU_MAP[rangeCpu.value];
  const gpu = GPU_MAP[rangeGpu.value];
  
  const plataformasSelecionadas = Array.from(filterChecks)
    .filter(c => c.checked)
    .map(c => c.value);
  
  const generosSelecionados = Array.from(filterGenres)
    .filter(c => c.checked)
    .map(c => c.value);

  valRam.textContent = `${ram} GB`;
  valCpu.textContent = capitalizar(cpu);
  valGpu.textContent = capitalizar(gpu);

  const compativeis = todosOsJogos.filter(jogo => {
    const ramOk = jogo.ram <= ram;
    const cpuOk = CPU_ORDEM[jogo.cpu] <= CPU_ORDEM[cpu];
    const gpuOk = GPU_ORDEM[jogo.gpu] <= GPU_ORDEM[gpu];
    const plataformaOk = plataformasSelecionadas.includes(jogo.tipo);
    const generoOk = generosSelecionados.some(genero => jogo.genero.includes(genero));
    return ramOk && cpuOk && gpuOk && plataformaOk && generoOk;
  });

  renderizarJogos(compativeis);
}

function renderizarJogos(jogos) {
  // Aplicar ordenação
  let jogosOrdenados = [...jogos];
  
  if (ordemAtual === "nome") {
    jogosOrdenados.sort((a, b) => a.nome.localeCompare(b.nome));
  } else if (ordemAtual === "lancamento-desc") {
    jogosOrdenados.sort((a, b) => b.lancamento - a.lancamento);
  } else if (ordemAtual === "lancamento-asc") {
    jogosOrdenados.sort((a, b) => a.lancamento - b.lancamento);
  } else if (ordemAtual === "tamanho-asc") {
    jogosOrdenados.sort((a, b) => {
      const sizeA = parseFloat(a.tamanho) * (a.tamanho.includes("GB") ? 1024 : 1);
      const sizeB = parseFloat(b.tamanho) * (b.tamanho.includes("GB") ? 1024 : 1);
      return sizeA - sizeB;
    });
  } else if (ordemAtual === "tamanho-desc") {
    jogosOrdenados.sort((a, b) => {
      const sizeA = parseFloat(a.tamanho) * (a.tamanho.includes("GB") ? 1024 : 1);
      const sizeB = parseFloat(b.tamanho) * (b.tamanho.includes("GB") ? 1024 : 1);
      return sizeB - sizeA;
    });
  } else if (ordemAtual === "gpu-asc") {
    jogosOrdenados.sort((a, b) => GPU_ORDEM[a.gpu] - GPU_ORDEM[b.gpu]);
  } else if (ordemAtual === "gpu-desc") {
    jogosOrdenados.sort((a, b) => GPU_ORDEM[b.gpu] - GPU_ORDEM[a.gpu]);
  } else if (ordemAtual === "cpu-asc") {
    jogosOrdenados.sort((a, b) => CPU_ORDEM[a.cpu] - CPU_ORDEM[b.cpu]);
  } else if (ordemAtual === "cpu-desc") {
    jogosOrdenados.sort((a, b) => CPU_ORDEM[b.cpu] - CPU_ORDEM[a.cpu]);
  }
  
  cardsGrid.innerHTML = "";
  resultsCount.textContent = `${jogosOrdenados.length} jogo${jogosOrdenados.length !== 1 ? "s" : ""} encontrado${jogosOrdenados.length !== 1 ? "s" : ""}`;

  if (jogosOrdenados.length === 0) {
    stateEmpty.classList.remove("hidden");
  } else {
    stateEmpty.classList.add("hidden");
    jogosOrdenados.forEach(jogo => {
      const card = document.createElement("article");
      card.className = "game-card";
      card.innerHTML = `
        <div class="card-color-bar" style="background-color: ${jogo.cor}"></div>
        <div class="card-content">
          <div class="card-header">
            <div>
              <h3 class="card-title">${escaparHTML(jogo.nome)}</h3>
              <p class="card-genre">${escaparHTML(jogo.genero)}</p>
            </div>
            <span class="card-type-badge">${jogo.tipo}</span>
          </div>
          <p class="card-description">${escaparHTML(jogo.descricao)}</p>
          <div class="card-specs">
            <div class="spec-row">
              <span class="spec-label">💾 RAM</span>
              <span class="spec-badge ram">${jogo.ram} GB</span>
            </div>
            <div class="spec-row">
              <span class="spec-label">🔲 CPU</span>
              <span class="spec-badge cpu-${normalizar(jogo.cpu)}">${capitalizar(jogo.cpu)}</span>
            </div>
          </div>
        </div>
      `;
      card.addEventListener("click", () => abrirModal(jogo));
      cardsGrid.appendChild(card);
    });
  }
}

// ============================================================
// Lógica do Modal
// ============================================================
function abrirModal(jogo) {
  const isSteam = jogo.tipo === "PC Steam";
  const btnText = isSteam ? "🛒 Ver na Steam" : "📥 Baixar Direto (ISO)";
  
  modalBody.innerHTML = `
    <div class="modal-info">
      <h2 class="modal-title">${escaparHTML(jogo.nome)}</h2>
      <span class="modal-genre-tag">${escaparHTML(jogo.genero)} | ${jogo.tipo}</span>
      
      <div class="modal-specs-table">
        <div class="table-row">
          <span class="table-label">💾 RAM Mínima</span>
          <span class="table-value">${jogo.ram} GB</span>
        </div>
        <div class="table-row">
          <span class="table-label">🔲 CPU Mínima</span>
          <span class="table-value">${capitalizar(jogo.cpu)}</span>
        </div>
        <div class="table-row">
          <span class="table-label">🖥️ GPU Mínima</span>
          <span class="table-value">${capitalizar(jogo.gpu)}</span>
        </div>
        <div class="table-row">
          <span class="table-label">💵 Preço</span>
          <span class="table-value">${escaparHTML(jogo.preco)}</span>
        </div>
        <div class="table-row">
          <span class="table-label">💳 Tipo</span>
          <span class="table-value">${escaparHTML(jogo.pagamento)}</span>
        </div>
        <div class="table-row">
          <span class="table-label">📅 Lançamento</span>
          <span class="table-value">${jogo.lancamento}</span>
        </div>
        <div class="table-row">
          <span class="table-label">📦 Tamanho</span>
          <span class="table-value">${escaparHTML(jogo.tamanho)}</span>
        </div>
        <div class="table-row">
          <span class="table-label">👨‍💻 Desenvolvedor</span>
          <span class="table-value">${escaparHTML(jogo.desenvolvedor)}</span>
        </div>
        <div class="table-row">
          <span class="table-label">⏱️ Duração</span>
          <span class="table-value">${escaparHTML(jogo.duracao)}</span>
        </div>
      </div>
      
      <a href="${escaparHTML(jogo.link)}" target="_blank" class="modal-btn">
        ${btnText}
      </a>
    </div>
  `;
  modalOverlay.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function fecharModal() {
  modalOverlay.classList.add("hidden");
  document.body.style.overflow = "";
}

// ============================================================
// Auxiliares
// ============================================================
function resetarFiltros() {
  rangeRam.value = 16;
  rangeCpu.value = 3;
  rangeGpu.value = 3;
  filterChecks.forEach(c => c.checked = true);
  filterGenres.forEach(c => c.checked = true);
  atualizarFiltros();
}

function escaparHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function capitalizar(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function normalizar(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(" ", "").toLowerCase();
}

// Iniciar
inicializar();
