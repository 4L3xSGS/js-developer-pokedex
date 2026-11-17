import {
  TYPES,
  GENERATIONS,
  request,
  artwork,
  getPokemon,
  selectPokemon,
  metric,
  readSaved,
} from "./poke-api.js";
const $ = (id) => document.getElementById(id);
const esc = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let storage;
try {
  storage = localStorage;
} catch {
  storage = { getItem: () => null, setItem: () => {} };
}
const saved = readSaved(storage, "lex-favorites", []);
const favorites = new Set(
  Array.isArray(saved) ? saved.filter(Number.isInteger) : [],
);
const selected = new Set();
let list = [],
  filtered = [],
  visible = 24,
  typeIds = null,
  onlyFavorites = false,
  revision = 0,
  detailRevision = 0;
const names = [
  "HP",
  "Ataque",
  "Defesa",
  "Atq. especial",
  "Def. especial",
  "Velocidade",
];
function persist(key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* Browsing remains available when storage is full. */
  }
}
const theme = readSaved(storage, "lex-theme", null);
if (theme === "light" || theme === "dark")
  document.documentElement.dataset.theme = theme;
$("theme").onclick = () => {
  const dark = document.documentElement.dataset.theme
    ? document.documentElement.dataset.theme === "dark"
    : !matchMedia("(prefers-color-scheme: light)").matches;
  document.documentElement.dataset.theme = dark ? "light" : "dark";
  persist("lex-theme", dark ? "light" : "dark");
};
Object.entries(TYPES).forEach(([value, label]) =>
  $("type").add(new Option(label, value)),
);
GENERATIONS.forEach((g, i) =>
  $("generation").add(new Option(`${i + 1} · ${g[2]}`, i + 1)),
);
function updateControls() {
  $("favorite-count").textContent = favorites.size;
  $("favorites").setAttribute("aria-pressed", onlyFavorites);
  $("compare-bar").hidden = !selected.size;
  $("compare-count").textContent = `${selected.size}/3 selecionados`;
  $("compare-open").disabled = selected.size < 2;
}
function render() {
  filtered = selectPokemon(list, {
    query: $("search").value,
    typeIds,
    generation: $("generation").value,
    favorites: onlyFavorites ? favorites : null,
    sort: $("sort").value,
  });
  $("grid").innerHTML = filtered
    .slice(0, visible)
    .map(
      (p) =>
        `<li class="card"><div class="card-top"><span>#${String(p.id).padStart(3, "0")}</span><button class="favorite" data-favorite="${p.id}" aria-label="Favoritar ${esc(p.name)}" aria-pressed="${favorites.has(p.id)}">${favorites.has(p.id) ? "♥" : "♡"}</button></div><button class="pokemon-open" data-detail="${p.id}"><div class="image-wrap"><img src="${artwork(p.id)}" alt="" width="220" height="220" loading="lazy" decoding="async"></div><span class="pokemon-name">${esc(p.name)}</span><span class="card-hint">Ver ficha completa ↗</span></button><label class="compare-choice"><input type="checkbox" data-compare="${p.id}" ${selected.has(p.id) ? "checked" : ""} ${selected.size === 3 && !selected.has(p.id) ? "disabled" : ""}> Comparar</label></li>`,
    )
    .join("");
  $("status").textContent =
    `${filtered.length} Pokémon encontrados · ${Math.min(visible, filtered.length)} na tela`;
  $("empty").hidden = filtered.length > 0;
  $("more").hidden = visible >= filtered.length;
  updateControls();
}
$("grid").addEventListener(
  "error",
  (event) => {
    if (event.target.tagName === "IMG") {
      event.target.alt = "Imagem indisponível";
      event.target.style.opacity = ".3";
    }
  },
  true,
);
async function applyFilters() {
  const current = ++revision;
  visible = 24;
  $("error").hidden = true;
  const type = $("type").value;
  $("grid").setAttribute("aria-busy", "true");
  $("more").hidden = true;
  try {
    const ids = type
      ? new Set(
          (await request(`type/${type}`)).pokemon.map((p) =>
            Number(p.pokemon.url.split("/").filter(Boolean).pop()),
          ),
        )
      : null;
    if (current !== revision) return;
    typeIds = ids;
    render();
  } catch {
    if (current === revision) {
      $("error").hidden = false;
      $("status").textContent = "Não foi possível aplicar os filtros.";
    }
  } finally {
    if (current === revision) $("grid").setAttribute("aria-busy", "false");
  }
}
$("filters").onsubmit = (e) => e.preventDefault();
let debounce;
$("search").oninput = () => {
  clearTimeout(debounce);
  debounce = setTimeout(applyFilters, 180);
};
["type", "generation", "sort"].forEach((id) => ($(id).onchange = applyFilters));
$("favorites").onclick = () => {
  onlyFavorites = !onlyFavorites;
  applyFilters();
};
$("more").onclick = () => {
  visible += 24;
  render();
};
$("grid").onclick = (e) => {
  const favorite = e.target.closest("[data-favorite]");
  if (favorite) {
    const id = Number(favorite.dataset.favorite);
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    persist("lex-favorites", [...favorites]);
    render();
    document.querySelector(`[data-favorite="${id}"]`)?.focus();
  }
  const detail = e.target.closest("[data-detail]");
  if (detail) openDetail(Number(detail.dataset.detail));
};
$("grid").onchange = (e) => {
  if (!e.target.matches("[data-compare]")) return;
  const id = Number(e.target.dataset.compare);
  if (e.target.checked && selected.size < 3) selected.add(id);
  else selected.delete(id);
  render();
  document.querySelector(`[data-compare="${id}"]`)?.focus();
};
function badges(p) {
  return p.types
    .map(
      (t) =>
        `<span class="badge" data-type="${esc(t.type.name)}">${TYPES[t.type.name] || esc(t.type.name)}</span>`,
    )
    .join("");
}
function stats(p) {
  return p.stats
    .map(
      (s, i) =>
        `<div class="stat"><span>${names[i]}</span><b>${s.base_stat}</b><meter min="0" max="255" value="${s.base_stat}" aria-label="${names[i]}"></meter></div>`,
    )
    .join("");
}
async function openDetail(id) {
  const current = ++detailRevision;
  $("detail-content").innerHTML =
    '<h2 id="detail-title">Ficha de campo</h2><p role="status">Carregando ficha…</p>';
  if (!$("detail").open) $("detail").showModal();
  try {
    const p = await getPokemon(id);
    if (current !== detailRevision) return;
    $("detail-content").innerHTML =
      `<p class="eyebrow">FICHA DE CAMPO / #${String(p.id).padStart(3, "0")}</p><h2 id="detail-title" class="capitalize">${esc(p.name)}</h2><div class="detail-layout"><div><img class="detail-art" src="${artwork(p.id)}" alt="${esc(p.name)}" width="300" height="300"><div>${badges(p)}</div></div><div><div class="measurements"><div><small>ALTURA</small><b>${metric(p.height)} m</b></div><div><small>PESO</small><b>${metric(p.weight)} kg</b></div></div><h3>Atributos base</h3>${stats(p)}<h3>Habilidades</h3><p class="capitalize">${p.abilities.map((a) => esc(a.ability.name.replaceAll("-", " "))).join(" · ")}</p><a href="./pokemon.html?name=${encodeURIComponent(p.name)}">Link desta ficha ↗</a></div></div>`;
  } catch {
    if (current === detailRevision)
      $("detail-content").innerHTML =
        '<h2 id="detail-title">Ficha indisponível</h2><p>Verifique a conexão e abra o Pokémon novamente.</p>';
  }
}
$("compare-clear").onclick = () => {
  selected.clear();
  render();
};
$("compare-open").onclick = async () => {
  $("comparison-content").innerHTML =
    '<p role="status">Carregando comparação…</p>';
  $("comparison").showModal();
  try {
    const pokemons = await Promise.all([...selected].map(getPokemon));
    $("comparison-content").innerHTML =
      `<div class="comparison-grid">${pokemons.map((p) => `<section><img src="${artwork(p.id)}" alt="" width="160" height="160"><h3 class="capitalize">${esc(p.name)}</h3>${badges(p)}${stats(p)}<p>Total: <b>${p.stats.reduce((sum, s) => sum + s.base_stat, 0)}</b></p></section>`).join("")}</div>`;
  } catch {
    $("comparison-content").textContent =
      "Não foi possível comparar. Feche e tente novamente.";
  }
};
document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.querySelector(".close").onclick = () => dialog.close();
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        dialog.close();
    }
  });
});
async function init() {
  $("error").hidden = true;
  $("status").textContent = "Carregando índice da PokéAPI…";
  try {
    const data = await request("pokemon?limit=1025");
    list = data.results.map((p) => ({
      name: p.name,
      id: Number(p.url.split("/").filter(Boolean).pop()),
    }));
    await applyFilters();
    const name = new URLSearchParams(location.search).get("name");
    if (name && /^[a-z0-9-]+$/i.test(name)) openDetail(name);
  } catch {
    $("error").hidden = false;
    $("status").textContent = "Coleção indisponível.";
  }
}
$("retry").onclick = () => (list.length ? applyFilters() : init());
updateControls();
init();
