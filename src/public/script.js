// frontend logic: enviar pdf, receber produtos, montar UI e editar/printar

const uploadForm = document.getElementById("uploadForm");
const pdfInput = document.getElementById("pdf");
const statusEl = document.getElementById("status");
const container = document.getElementById("etiquetas");
const btnPrint = document.getElementById("btnPrint");
const btnClear = document.getElementById("btnClear");

uploadForm.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  if (!pdfInput.files || pdfInput.files.length === 0) {
    alert("Selecione um PDF");
    return;
  }

  const fd = new FormData();
  fd.append("pdf", pdfInput.files[0]);

  statusEl.innerText = "Lendo PDF...";
  try {
    const resp = await fetch("/process", { method: "POST", body: fd });
    const json = await resp.json();
    if (json.error) {
      statusEl.innerText = json.error;
      return;
    }
    statusEl.innerText = "";
    renderProdutos(json.produtos || []);
  } catch (err) {
    console.error(err);
    statusEl.innerText = "Erro ao enviar PDF";
  }
});

btnPrint.addEventListener("click", () => {
  window.print();
});

btnClear.addEventListener("click", () => {
  container.innerHTML = "";
});

// Renderiza produtos como etiquetas editáveis
function renderProdutos(produtos) {
  container.innerHTML = "";
  produtos.forEach((p, idx) => {
    const el = document.createElement("div");
    el.className = "etiqueta";
    el.dataset.index = idx;

    // conteudo principal
    el.innerHTML = `
        <div class="topo" title="${escapeHtml(p.descricao)}">${escapeHtml(p.descricao)}</div>
        <div class="linha">
          <div class="de">
            <label>De:</label>
            <input class="input-edit cheio" value="${escapeHtml(p.cheio)}">
            <span class="previewCheio">${escapeHtml(p.cheio)}</span>
          </div>
          <div class="por">
            <label>Por:</label>
            <input class="input-edit promo" value="${escapeHtml(p.promo)}">
            <span class="previewPromo">${escapeHtml(p.promo)}</span>
          </div>
        </div>
        <div class="footer">
          <button class="btnUp">▲</button>
          <button class="btnDown">▼</button>
          <button class="btnDup">Duplicar</button>
          <button class="btnDel">Excluir</button>
        </div>
    `;

    // eventos dos inputs
    const inputCheio = el.querySelector(".cheio");
    const inputPromo = el.querySelector(".promo");
    const preview = el.querySelector(".previewPromo");
    const previewCheio = el.querySelector(".previewCheio");

    inputPromo.addEventListener("input", () => {
      preview.innerText = inputPromo.value;
    });

    inputCheio.addEventListener("input", () => {
      previewCheio.innerText = inputCheio.value;
    });

    // botões
    el.querySelector(".btnDel").addEventListener("click", () => {
      el.remove();
    });

    el.querySelector(".btnDup").addEventListener("click", () => {
      const clone = el.cloneNode(true);
      // reattach listeners for cloned node
      attachListenersToEtiqueta(clone);
      container.insertBefore(clone, el.nextSibling);
    });

    el.querySelector(".btnUp").addEventListener("click", () => {
      const prev = el.previousElementSibling;
      if (prev) container.insertBefore(el, prev);
    });

    el.querySelector(".btnDown").addEventListener("click", () => {
      const next = el.nextElementSibling;
      if (next) container.insertBefore(next, el);
    });

    container.appendChild(el);
    attachListenersToEtiqueta(el);
  });
}

function attachListenersToEtiqueta(el) {
  const inputPromo = el.querySelector(".promo");
  const preview = el.querySelector(".previewPromo");
  if (inputPromo && preview) {
    inputPromo.addEventListener("input", () => {
      preview.innerText = inputPromo.value;
    });
  }

  // duplicate/delete/move buttons already wired during creation
}

function attachListenersToEtiquetaCheio(el) {
  const inputCheio = el.querySelector(".cheio");
  const previewCheio = el.querySelector(".previewCheio");

  if (inputCheio && previewCheio) {
    inputCheio.addEventListener("input", () => {
      previewCheio.innerText = inputCheio.value;
    });
  }
}

function escapeHtml(s) {
  if (s == null) return "";
  return String(s).replace(/[&<>"']/g, (c) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
