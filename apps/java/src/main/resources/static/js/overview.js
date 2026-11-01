import { $, eur, signedEUR, date, element, request } from './common.js';

let range = 'month';
let revision = 0;
let chart;
let summary;

function drawChart(data) {
  if (chart) chart.destroy();
  const style = getComputedStyle(document.documentElement);
  const color = name => style.getPropertyValue(name).trim();
  chart = new Chart($('#cashflow'), {
    type: 'bar',
    data: {
      labels: data.series.map(point => point.date),
      datasets: [
        { label: 'In', data: data.series.map(point => point.income), backgroundColor: color('--income'), yAxisID: 'flow', maxBarThickness: 18 },
        { label: 'Out', data: data.series.map(point => point.expenses), backgroundColor: color('--expense'), yAxisID: 'flow', maxBarThickness: 18 },
        { type: 'line', label: 'Balance', data: data.series.map(point => point.balance), borderColor: color('--violet'), backgroundColor: color('--violet'), yAxisID: 'balance', pointRadius: 0, pointHitRadius: 12, borderWidth: 2 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: color('--muted'), usePointStyle: true, boxWidth: 8 } },
        tooltip: { callbacks: { title: items => date(items[0].label), label: item => `${item.dataset.label}: ${eur(item.parsed.y)}` } }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: color('--muted'), maxTicksLimit: 8, callback: function(value) { const iso = this.getLabelForValue(value); return `${iso.slice(8)}.${iso.slice(5, 7)}.`; } } },
        flow: { position: 'left', beginAtZero: true, grid: { color: color('--border') }, ticks: { color: color('--muted') } },
        balance: { position: 'right', beginAtZero: false, grid: { drawOnChartArea: false }, min: Math.floor((Math.min(...data.series.map(p => p.balance)) - 100) / 500) * 500, max: Math.ceil((Math.max(...data.series.map(p => p.balance)) + 100) / 500) * 500, ticks: { color: color('--violet') } }
      }
    }
  });
}

async function loadSummary() {
  const version = ++revision;
  $('#summary-error').hidden = true;
  $('#summary-content').setAttribute('aria-busy', 'true');
  $('#chart-loading').hidden = false;
  try {
    const data = await request(`/api/summary?range=${range}`);
    if (version !== revision) return;
    summary = data;
    $('#balance').textContent = eur(data.balance);
    $('#balance').classList.remove('loading');
    $('#free-to-spend').textContent = eur(data.freeToSpend);
    $('#as-of').textContent = `as of ${date(data.asOf)}`;
    $('#income').textContent = eur(data.income);
    $('#expenses').textContent = eur(data.expenses);
    $('#net').textContent = signedEUR(data.net);
    $('#net').className = data.net >= 0 ? 'income' : 'expense';
    $('#categories').replaceChildren();
    if (!data.categories.length) $('#categories').append(element('li', 'No expenses in this range.', 'muted'));
    for (const category of data.categories.slice(0, 6)) {
      const row = element('li');
      const line = element('div', undefined, 'category-line');
      line.append(element('span', category.category), element('span', `${eur(category.total)}  ${Math.round(category.share * 100)}%`));
      const track = element('div', undefined, 'track');
      const fill = element('div');
      fill.style.width = `${Math.max(category.share * 100, 1)}%`;
      track.append(fill); row.append(line, track); $('#categories').append(row);
    }
    $('#chart-data').replaceChildren(...data.series.map(point => {
      const row = element('tr');
      for (const value of [date(point.date), eur(point.income), eur(point.expenses), eur(point.balance)]) row.append(element('td', value));
      return row;
    }));
    $('#summary-content').hidden = false;
    drawChart(data);
  } catch {
    if (version !== revision) return;
    $('#summary-error').hidden = false;
    $('#summary-content').hidden = true;
  } finally {
    if (version === revision) {
      $('#summary-content').setAttribute('aria-busy', 'false');
      $('#chart-loading').hidden = true;
    }
  }
}

async function loadRecent() {
  $('#recent-error').hidden = true;
  try {
    const data = await request('/api/transactions');
    $('#recent').replaceChildren(...data.items.slice(-8).reverse().map(transaction => {
      const row = element('li');
      const info = element('div');
      info.append(element('p', transaction.description), element('p', `${transaction.counterparty} · ${date(transaction.date)}`, 'muted small'));
      row.append(info, element('strong', signedEUR(transaction.amount), transaction.amount >= 0 ? 'income' : 'expense'));
      return row;
    }));
  } catch { $('#recent').replaceChildren(); $('#recent-error').hidden = false; }
}

document.querySelectorAll('[data-range]').forEach(button => button.addEventListener('click', () => {
  range = button.dataset.range;
  document.querySelectorAll('[data-range]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  loadSummary();
}));
$('#summary-retry').addEventListener('click', loadSummary);
$('#recent-retry').addEventListener('click', loadRecent);
document.addEventListener('themechange', () => { if (summary) drawChart(summary); });
loadSummary();
loadRecent();
