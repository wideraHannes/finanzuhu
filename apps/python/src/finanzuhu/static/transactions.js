(() => {
  const $ = (selector) => document.querySelector(selector);
  const rowsNode = $("#transaction-rows");
  const searchInput = $("#search-input");
  const categoryFilter = $("#category-filter");
  const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
  const shortDate = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "UTC" });
  let search = "";
  let type = "";
  let sortColumn = "date";
  let descending = true;
  let timer;
  let requestId = 0;

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function formatMethod(method) {
    return method.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
  }

  function updateSortHeaders() {
    document.querySelectorAll("[data-sort]").forEach((button) => {
      const active = button.dataset.sort === sortColumn;
      const heading = button.closest("th");
      heading.setAttribute("aria-sort", active ? (descending ? "descending" : "ascending") : "none");
      button.querySelector("span").textContent = active ? (descending ? "↓" : "↑") : "↕";
    });
  }

  function showState(state) {
    $("#table-loading").hidden = state !== "loading";
    $("#transaction-error").hidden = state !== "error";
    $("#transaction-empty").hidden = state !== "empty";
    $("#table-scroll").hidden = state !== "table";
  }

  async function loadTransactions() {
    const activeRequest = ++requestId;
    showState("loading");
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (categoryFilter.value) params.set("category", categoryFilter.value);
    if (type) params.set("type", type);
    try {
      const response = await fetch(`/api/transactions?${params.toString()}`);
      if (!response.ok) throw new Error("Could not load transactions");
      const data = await response.json();
      if (activeRequest !== requestId) return;
      if (categoryFilter.options.length === 1) {
        data.categories.forEach((category) => categoryFilter.add(new Option(category, category)));
      }
      const filtered = Boolean(search || categoryFilter.value || type);
      $("#transaction-count").textContent = filtered ? `${data.items.length} of ${data.total} bookings` : `${data.total} bookings`;
      if (!data.items.length) {
        rowsNode.innerHTML = "";
        showState("empty");
        return;
      }
      const sorted = [...data.items].sort((a, b) => {
        const comparison = sortColumn === "amount" ? a.amount - b.amount : a.date.localeCompare(b.date);
        return comparison * (descending ? -1 : 1);
      });
      rowsNode.innerHTML = sorted.map((transaction) => `<tr><td class="date-cell">${shortDate.format(new Date(`${transaction.date}T00:00:00Z`))}</td><td class="description-cell"><strong>${escapeHTML(transaction.description)}</strong><span>${escapeHTML(transaction.counterparty)}</span></td><td class="optional-column"><span class="category-pill">${escapeHTML(transaction.category)}</span></td><td class="optional-column method-cell">${escapeHTML(formatMethod(transaction.method))}</td><td class="amount-cell ${transaction.amount >= 0 ? "positive" : "negative"}">${transaction.amount > 0 ? "+" : ""}${euro.format(transaction.amount)}</td></tr>`).join("");
      updateSortHeaders();
      showState("table");
    } catch {
      if (activeRequest === requestId) showState("error");
    }
  }

  searchInput.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      search = searchInput.value.trim();
      loadTransactions();
    }, 200);
  });
  categoryFilter.addEventListener("change", loadTransactions);
  document.querySelectorAll("[data-type]").forEach((button) => button.addEventListener("click", () => {
    type = button.dataset.type;
    document.querySelectorAll("[data-type]").forEach((candidate) => candidate.setAttribute("aria-pressed", String(candidate === button)));
    loadTransactions();
  }));
  document.querySelectorAll("[data-sort]").forEach((button) => button.addEventListener("click", () => {
    if (sortColumn === button.dataset.sort) descending = !descending;
    else {
      sortColumn = button.dataset.sort;
      descending = true;
    }
    updateSortHeaders();
    loadTransactions();
  }));
  $("#clear-filters").addEventListener("click", () => {
    clearTimeout(timer);
    searchInput.value = "";
    search = "";
    categoryFilter.value = "";
    type = "";
    document.querySelectorAll("[data-type]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.type === "")));
    loadTransactions();
  });
  $("#retry-transactions").addEventListener("click", loadTransactions);
  loadTransactions();
})();
