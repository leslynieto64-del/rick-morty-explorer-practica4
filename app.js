'use strict';

const API_URL = 'https://rickandmortyapi.com/api/character';

const filtersForm = document.getElementById('filters-form');
const nameFilter = document.getElementById('name-filter');
const statusFilter = document.getElementById('status-filter');
const speciesFilter = document.getElementById('species-filter');
const genderFilter = document.getElementById('gender-filter');
const clearFiltersButton = document.getElementById('clear-filters');
const charactersGrid = document.getElementById('characters-grid');
const statusMessage = document.getElementById('status-message');
const resultsSection = document.querySelector('.results-section');
const resultsSummary = document.getElementById('results-summary');
const pagination = document.getElementById('pagination');
const previousPageButton = document.getElementById('previous-page');
const nextPageButton = document.getElementById('next-page');
const pageIndicator = document.getElementById('page-indicator');
const retryButton = document.getElementById('retry-button');

let nextPageUrl = null;
let previousPageUrl = null;
let lastRequestedUrl = API_URL;
let activeController = null;
let requestVersion = 0;

const statusLabels = {
  Alive: 'Vivo',
  Dead: 'Muerto',
  unknown: 'Desconocido'
};

const genderLabels = {
  Female: 'Femenino',
  Male: 'Masculino',
  Genderless: 'Sin género',
  unknown: 'Desconocido'
};

/** Construye la URL con los filtros seleccionados por el usuario. */
function buildFilteredUrl() {
  const url = new URL(API_URL);
  const name = nameFilter.value.trim();
  const species = speciesFilter.value.trim();

  if (name) url.searchParams.set('name', name);
  if (statusFilter.value) url.searchParams.set('status', statusFilter.value);
  if (species) url.searchParams.set('species', species);
  if (genderFilter.value) url.searchParams.set('gender', genderFilter.value);

  return url.toString();
}

function showMessage(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message';
  if (type) statusMessage.classList.add(`is-${type}`);
  statusMessage.hidden = false;
}

function hideMessage() {
  statusMessage.hidden = true;
  statusMessage.textContent = '';
  statusMessage.className = 'status-message';
}

function resetResultControls() {
  charactersGrid.replaceChildren();
  resultsSummary.textContent = '';
  pagination.hidden = true;
  previousPageButton.disabled = true;
  nextPageButton.disabled = true;
  retryButton.hidden = true;
}

function translateStatus(status) {
  return statusLabels[status] || status || 'Desconocido';
}

function translateGender(gender) {
  return genderLabels[gender] || gender || 'Desconocido';
}

function createDetail(label, value) {
  const wrapper = document.createElement('div');
  const term = document.createElement('dt');
  const description = document.createElement('dd');

  term.textContent = label;
  description.textContent = value || 'Desconocido';
  wrapper.append(term, description);
  return wrapper;
}

/** Crea una tarjeta sin insertar contenido externo mediante innerHTML. */
function createCharacterCard(character) {
  const article = document.createElement('article');
  article.className = 'character-card';

  const imageWrap = document.createElement('div');
  imageWrap.className = 'character-image-wrap';

  const image = document.createElement('img');
  image.className = 'character-image';
  image.src = character.image;
  image.alt = `Imagen de ${character.name}`;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => {
    image.remove();
    const fallback = document.createElement('div');
    fallback.className = 'image-fallback';
    fallback.textContent = 'Imagen no disponible';
    imageWrap.append(fallback);
  }, { once: true });
  imageWrap.append(image);

  const content = document.createElement('div');
  content.className = 'character-content';

  const titleRow = document.createElement('div');
  titleRow.className = 'character-title-row';
  const title = document.createElement('h3');
  title.textContent = character.name || 'Nombre desconocido';
  const id = document.createElement('span');
  id.className = 'character-id';
  id.textContent = `#${character.id}`;
  titleRow.append(title, id);

  const status = document.createElement('span');
  const statusClass = String(character.status || 'unknown').toLowerCase();
  status.className = `status-badge status-${statusClass === 'alive' || statusClass === 'dead' ? statusClass : 'unknown'}`;
  status.textContent = translateStatus(character.status);

  const details = document.createElement('dl');
  details.className = 'character-details';
  details.append(
    createDetail('Especie', character.species),
    createDetail('Género', translateGender(character.gender)),
    createDetail('Origen', character.origin && character.origin.name),
    createDetail('Última ubicación', character.location && character.location.name),
    createDetail('Episodios', Array.isArray(character.episode) ? String(character.episode.length) : 'Desconocido')
  );

  content.append(titleRow, status, details);
  article.append(imageWrap, content);
  return article;
}

function renderCharacters(characters) {
  const fragment = document.createDocumentFragment();
  characters.forEach((character) => fragment.append(createCharacterCard(character)));
  charactersGrid.replaceChildren(fragment);
}

function getFriendlyError(response) {
  if (response.status === 429) {
    return 'La API recibió demasiadas solicitudes. Espera un momento e inténtalo de nuevo.';
  }
  if (response.status >= 500) {
    return 'El servicio no está disponible temporalmente. Inténtalo de nuevo más tarde.';
  }
  return `No se pudo completar la consulta (HTTP ${response.status}). Inténtalo de nuevo.`;
}

function showEmptyState() {
  resetResultControls();
  showMessage('No se encontraron personajes con esos criterios.', 'empty');
}

async function loadCharacters(url) {
  if (activeController) activeController.abort();

  const controller = new AbortController();
  activeController = controller;
  const thisRequest = ++requestVersion;
  lastRequestedUrl = url;

  resetResultControls();
  resultsSection.setAttribute('aria-busy', 'true');
  showMessage('Cargando personajes...', 'loading');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal
    });

    if (thisRequest !== requestVersion) return;

    // La API responde 404 cuando no encuentra coincidencias para los filtros.
    if (response.status === 404) {
      showEmptyState();
      return;
    }

    if (!response.ok) {
      throw new Error(getFriendlyError(response));
    }

    const data = await response.json();
    if (!data || !data.info || !Array.isArray(data.results)) {
      throw new Error('La API devolvió una respuesta con un formato inesperado.');
    }

    if (thisRequest !== requestVersion) return;

    if (data.results.length === 0) {
      showEmptyState();
      return;
    }

    hideMessage();
    renderCharacters(data.results);
    resultsSummary.textContent = `${data.info.count} personaje${data.info.count === 1 ? '' : 's'} encontrado${data.info.count === 1 ? '' : 's'}`;

    nextPageUrl = data.info.next;
    previousPageUrl = data.info.prev;
    const currentUrl = new URL(url);
    const currentPage = Number(currentUrl.searchParams.get('page') || 1);
    const totalPages = Number(data.info.pages || 1);

    pageIndicator.textContent = `Página ${currentPage} de ${totalPages}`;
    previousPageButton.disabled = !previousPageUrl;
    nextPageButton.disabled = !nextPageUrl;
    pagination.hidden = false;
  } catch (error) {
    if (thisRequest !== requestVersion || error.name === 'AbortError') return;

    resetResultControls();
    if (error instanceof TypeError) {
      showMessage('No fue posible conectar con la API. Revisa tu conexión e inténtalo de nuevo.', 'error');
    } else {
      showMessage(error.message || 'Ocurrió un error inesperado. Inténtalo de nuevo.', 'error');
    }
    retryButton.hidden = false;
  } finally {
    if (thisRequest === requestVersion) {
      resultsSection.setAttribute('aria-busy', 'false');
      activeController = null;
    }
  }
}

filtersForm.addEventListener('submit', (event) => {
  event.preventDefault();
  loadCharacters(buildFilteredUrl());
});

clearFiltersButton.addEventListener('click', () => {
  filtersForm.reset();
  loadCharacters(API_URL);
});

previousPageButton.addEventListener('click', () => {
  if (previousPageUrl) loadCharacters(previousPageUrl);
});

nextPageButton.addEventListener('click', () => {
  if (nextPageUrl) loadCharacters(nextPageUrl);
});

retryButton.addEventListener('click', () => {
  loadCharacters(lastRequestedUrl);
});

loadCharacters(API_URL);
