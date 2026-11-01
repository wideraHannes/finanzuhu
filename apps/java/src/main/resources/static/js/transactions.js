import { $, signedEUR, date, element, request } from './common.js';

let filters = { q: '', category: '', type: '' };
let sort = { column: 'date', descending: true };
let data;
let revision = 0;
let timer;

function render() {
  if (!data) return;
  const filtered = Boolean(filters.q || filters.category || filters.type);
  $('#booking-count').textContent = filtered ? `${data.items.length} of ${data.total} bookings` : `${data.total} bookings`;
  const rows = [...data.items].sort((a, b) => {
    const comparison = sort.column === 'amount' ? a.amount - b.amount : a.date.localeCompare(b.date);
    return comparison * (sort.descending ? -1 : 1);
  });
  $('#bookings').replaceChildren(...rows.map(transaction => {
    const row = element('tr');
    const info = element('td', undefined, 'description');
    info.append(element('p', transaction.description), element('p', transaction.counterparty, 'muted small'));
    const method = transaction.method.replaceAll('_', ' ');
    row.append(element('td', date(transaction.date, true), 'muted date'), info,
      element('td', transaction.category, 'wide'), element('td', method[0].toUpperCase() + method.slice(1), 'wide muted'),
      element('td', signedEUR(transaction.amount), `amount ${transaction.amount >= 0 ? 'income' : 'expense'}`));
    return row;
  }));
  $('#empty-results').hidden = rows.length !== 0;
  for (const column of ['date', 'amount']) {
    const heading = $(`#${column}-heading`);
    if (sort.column === column) heading.setAttribute('aria-sort', sort.descending ? 'descending' : 'ascending');
    else heading.removeAttribute('aria-sort');
    heading.querySelector('span').textContent = sort.column === column ? (sort.descending ? '↓' : '↑') : '↕';
  }
}

async function load() {
  const version = ++revision;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  $('#transactions-error').hidden = true;
  $('#transactions-loading').hidden = false;
  $('#transactions-table').setAttribute('aria-busy', 'true');
  $('#empty-results').hidden = true;
  $('#bookings').replaceChildren();
  try {
    const result = await request(`/api/transactions${params.size ? `?${params}` : ''}`);
    if (version !== revision) return;
    data = result;
    $('#category').replaceChildren(new Option('All categories', ''), ...data.categories.map(category => new Option(category, category)));
    $('#category').value = filters.category;
    render();
  } catch {
    if (version !== revision) return;
    data = undefined;
    $('#transactions-error').hidden = false;
    $('#booking-count').textContent = 'The ledger could not be loaded.';
  } finally {
    if (version === revision) {
      $('#transactions-loading').hidden = true;
      $('#transactions-table').setAttribute('aria-busy', 'false');
    }
  }
}

$('#filters').addEventListener('submit', event => event.preventDefault());
$('#search').addEventListener('input', () => {
  clearTimeout(timer);
  // Invalidate an older response as soon as typing starts.
  revision++;
  timer = setTimeout(() => { filters.q = $('#search').value; load(); }, 200);
});
$('#category').addEventListener('change', () => { filters.category = $('#category').value; load(); });
document.querySelectorAll('[data-type]').forEach(button => button.addEventListener('click', () => {
  filters.type = button.dataset.type;
  document.querySelectorAll('[data-type]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  load();
}));
document.querySelectorAll('[data-sort]').forEach(button => button.addEventListener('click', () => {
  sort = { column: button.dataset.sort, descending: sort.column === button.dataset.sort ? !sort.descending : true };
  render();
}));
$('#clear-filters').addEventListener('click', () => {
  clearTimeout(timer);
  filters = { q: '', category: '', type: '' };
  $('#search').value = ''; $('#category').value = '';
  document.querySelectorAll('[data-type]').forEach(item => item.setAttribute('aria-pressed', String(item.dataset.type === '')));
  load();
});
$('#transactions-retry').addEventListener('click', load);
load();
