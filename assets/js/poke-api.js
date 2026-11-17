export const TYPES = {
  normal: "Normal",
  fire: "Fogo",
  water: "Água",
  electric: "Elétrico",
  grass: "Planta",
  ice: "Gelo",
  fighting: "Lutador",
  poison: "Veneno",
  ground: "Terra",
  flying: "Voador",
  psychic: "Psíquico",
  bug: "Inseto",
  rock: "Pedra",
  ghost: "Fantasma",
  dragon: "Dragão",
  dark: "Sombrio",
  steel: "Aço",
  fairy: "Fada",
};
export const GENERATIONS = [
  [1, 151, "Kanto"],
  [152, 251, "Johto"],
  [252, 386, "Hoenn"],
  [387, 493, "Sinnoh"],
  [494, 649, "Unova"],
  [650, 721, "Kalos"],
  [722, 809, "Alola"],
  [810, 905, "Galar / Hisui"],
  [906, 1025, "Paldea"],
];
const cache = new Map();
export async function request(path) {
  if (cache.has(path)) return cache.get(path);
  const promise = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/${path}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`PokéAPI: ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  })();
  cache.set(path, promise);
  try {
    return await promise;
  } catch (error) {
    cache.delete(path);
    throw error;
  }
}
export const artwork = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
export const getPokemon = (id) => request(`pokemon/${encodeURIComponent(id)}`);
export function selectPokemon(
  list,
  {
    query = "",
    typeIds = null,
    generation = "",
    favorites = null,
    sort = "id",
  } = {},
) {
  const q = query.trim().toLowerCase().replace(/^#/, "");
  const range = GENERATIONS[Number(generation) - 1];
  return list
    .filter(
      (p) =>
        (!q || p.name.includes(q) || String(p.id) === q) &&
        (!typeIds || typeIds.has(p.id)) &&
        (!range || (p.id >= range[0] && p.id <= range[1])) &&
        (!favorites || favorites.has(p.id)),
    )
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "desc"
          ? b.id - a.id
          : a.id - b.id,
    );
}
export const metric = (value) =>
  (value / 10).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
export function readSaved(storage, key, fallback) {
  try {
    return JSON.parse(storage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
