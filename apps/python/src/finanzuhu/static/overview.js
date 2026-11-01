(() => {
  const $ = (selector) => document.querySelector(selector);
  const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
  const signedEuro = (amount) => `${amount > 0 ? "+" : ""}${euro.format(amount)}`;
  const fullDate = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
  const compactEuro = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });
  const chart = $("#cashflow-chart");
  const rangeButtons = [...document.querySelectorAll("[data-range]")];
  let range = "month";
  let transactionsPromise;
  let summaryRequest = 0;

  async function getTransactions() {
    transactionsPromise ||= fetch("/api/transactions").then((response) => {
      if (!response.ok) throw new Error("Could not load transactions");
      return response.json();
    });
    return transactionsPromise;
  }

  function chartSvg(points) {
    if (!points.length) return "<p class='empty-copy'>No activity in this range.</p>";
    const width = 760;
    const height = 228;
    const left = 52;
    const right = width - 48;
    const top = 22;
    const bottom = height - 30;
    const plotHeight = bottom - top;
    const plotWidth = right - left;
    const maxFlow = Math.max(100, ...points.map((point) => Math.max(point.income, point.expenses))) * 1.15;
    const minBalance = Math.min(...points.map((point) => point.balance));
    const maxBalance = Math.max(...points.map((point) => point.balance));
    const balancePad = Math.max(100, (maxBalance - minBalance) * 0.12);
    const low = Math.floor((minBalance - balancePad) / 500) * 500;
    const high = Math.ceil((maxBalance + balancePad) / 500) * 500 || 500;
    const x = (index) => left + (points.length === 1 ? plotWidth / 2 : index * plotWidth / (points.length - 1));
    const flowY = (value) => bottom - value / maxFlow * plotHeight;
    const balanceY = (value) => bottom - (value - low) / (high - low || 1) * plotHeight;
    const bars = points.map((point, index) => {
      const slot = plotWidth / Math.max(points.length, 1);
      const barWidth = Math.min(9, slot * 0.24);
      const px = x(index);
      const inHeight = Math.max(0, bottom - flowY(point.income));
      const outHeight = Math.max(0, bottom - flowY(point.expenses));
      const title = `${fullDate.format(new Date(`${point.date}T00:00:00Z`))} · In ${euro.format(point.income)} · Out ${euro.format(point.expenses)} · Balance ${euro.format(point.balance)}`;
      return `<g><title>${title}</title><rect x="${px - barWidth - 1}" y="${bottom - inHeight}" width="${barWidth}" height="${inHeight}" rx="2" fill="var(--income)" opacity=".9"/><rect x="${px + 1}" y="${bottom - outHeight}" width="${barWidth}" height="${outHeight}" rx="2" fill="var(--expense)" opacity=".88"/></g>`;
    }).join("");
    const linePath = points.map((point, index) => `${index ? "L" : "M"}${x(index).toFixed(1)},${balanceY(point.balance).toFixed(1)}`).join(" ");
    const first = points[0].date.slice(5).replace("-", ".") + ".";
    const middlePoint = points[Math.floor((points.length - 1) / 2)].date;
    const middle = middlePoint.slice(5).replace("-", ".") + ".";
    const lastPoint = points.at(-1).date;
    const last = lastPoint.slice(5).replace("-", ".") + ".";
    const ticks = [0, .5, 1].map((fraction) => {
      const value = Math.round(low + (high - low) * fraction);
      const y = bottom - fraction * plotHeight;
      return `<line class="chart-gridline" x1="${left}" y1="${y}" x2="${right}" y2="${y}"/><text class="chart-axis" x="${left - 8}" y="${y + 4}" text-anchor="end">${compactEuro.format(maxFlow * fraction)}</text><text class="chart-axis balance-axis" x="${right + 8}" y="${y + 4}" text-anchor="start">${compactEuro.format(value)}</text>`;
    }).join("");
    return `<svg class="chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="chart-title chart-desc" preserveAspectRatio="none"><title id="chart-title">Income, expenses and account balance</title><desc id="chart-desc">Daily income and expense bars with the closing account balance as a line.</desc>${ticks}${bars}<path class="balance-path" d="${linePath}" fill="none" stroke="var(--owl)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><text class="chart-date" x="${left}" y="${height - 5}" text-anchor="start">${first}</text><text class="chart-date" x="${(left + right) / 2}" y="${height - 5}" text-anchor="middle">${middle}</text><text class="chart-date" x="${right}" y="${height - 5}" text-anchor="end">${last}</text></svg>`;
  }

  function renderCategories(categories) {
    const list = $("#categories-list");
    if (!categories.length) {
      list.innerHTML = "<p class='empty-copy'>No expenses in this range.</p>";
      return;
    }
    list.innerHTML = categories.slice(0, 6).map((item) => {
      const percent = Math.round(item.share * 100);
      return `<div class="category-row"><div class="category-meta"><span>${escapeHTML(item.category)}</span><span class="category-amount"><strong>${euro.format(item.total)}</strong><span>${percent}%</span></span></div><div class="share-track"><span style="width:${Math.max(percent, 1)}%"></span></div></div>`;
    }).join("");
  }

  function renderRecent(items) {
    const recent = items.slice(-8).reverse();
    $("#recent-list").innerHTML = recent.map((item) => `<div class="activity-row"><div class="activity-copy"><strong>${escapeHTML(item.description)}</strong><span>${escapeHTML(item.counterparty)} <i>·</i> ${fullDate.format(new Date(`${item.date}T00:00:00Z`))}</span></div><strong class="activity-amount ${item.amount >= 0 ? "positive" : "negative"}">${signedEuro(item.amount)}</strong></div>`).join("");
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  async function loadSummary() {
    const activeRequest = ++summaryRequest;
    $("#chart-error").hidden = true;
    rangeButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.range === range)));
    try {
      const [summaryResponse, transactions] = await Promise.all([fetch(`/api/summary?range=${encodeURIComponent(range)}`), getTransactions()]);
      if (!summaryResponse.ok) throw new Error("Could not load summary");
      const summary = await summaryResponse.json();
      if (activeRequest !== summaryRequest) return;
      $("#balance-value").textContent = euro.format(summary.balance);
      $("#free-to-spend").textContent = euro.format(summary.freeToSpend);
      $("#as-of-date").textContent = `as of ${fullDate.format(new Date(`${summary.asOf}T00:00:00Z`))}`;
      $("#income-value").textContent = euro.format(summary.income);
      $("#expenses-value").textContent = euro.format(summary.expenses);
      const net = $("#net-value");
      net.textContent = signedEuro(summary.net);
      net.classList.toggle("negative", summary.net < 0);
      net.classList.toggle("positive", summary.net >= 0);
      chart.innerHTML = chartSvg(summary.series);
      chart.setAttribute("aria-label", `Cashflow chart for ${range === "3m" ? "three months" : range}`);
      renderCategories(summary.categories);
      renderRecent(transactions.items);
    } catch (error) {
      if (activeRequest !== summaryRequest) return;
      console.error("Could not render the overview summary", error);
      chart.innerHTML = "";
      $("#chart-error").hidden = false;
      $("#categories-list").innerHTML = "<p class='empty-copy'>The summary could not be loaded.</p>";
      $("#recent-list").innerHTML = "<p class='empty-copy'>The bookings could not be loaded.</p>";
    }
  }

  rangeButtons.forEach((button) => button.addEventListener("click", () => {
    if (range === button.dataset.range) return;
    range = button.dataset.range;
    loadSummary();
  }));
  $("[data-retry-summary]").addEventListener("click", () => {
    transactionsPromise = undefined;
    loadSummary();
  });
  loadSummary();
})();
