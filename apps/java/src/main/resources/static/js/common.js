const currency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const longDate = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
const shortDate = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
export const eur = value => currency.format(value);
export const signedEUR = value => (value > 0 ? '+' : '') + eur(value);
export const date = (value, short = false) => (short ? shortDate : longDate).format(new Date(`${value}T00:00:00`));
export const $ = selector => document.querySelector(selector);
export function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined) node.textContent = text;
  if (className) node.className = className;
  return node;
}
const cache = new Map();
export async function request(url) {
  if (cache.has(url)) return cache.get(url);
  const pending = (async () => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Request failed');
        return await response.json();
      } catch (error) {
        if (attempt === 1) throw error;
      }
    }
  })();
  cache.set(url, pending);
  try { return await pending; } catch (error) { cache.delete(url); throw error; }
}
