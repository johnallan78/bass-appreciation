const state = {
  items: [],
  search: "",
  instrument: "all",
  sort: "updated-desc",
  tag: "all",
};

const instrumentLabels = {
  "bass-guitar": "Bass guitar",
  "double-bass": "Double bass",
};

const listEl = document.getElementById("transcriptionList");
const searchEl = document.getElementById("searchInput");
const instrumentEl = document.getElementById("instrumentFilter");
const sortEl = document.getElementById("sortBy");
const tagsEl = document.getElementById("tagFilters");
const statusMessageEl = document.getElementById("statusMessage");
const resultsSummaryEl = document.getElementById("resultsSummary");

function normalizeRecord(entry) {
  const tags = Array.isArray(entry.tags) ? entry.tags.filter(Boolean) : [];
  const normalizedPath = String(entry.pdfPath || "").replace(/^\.?\//, "");

  return {
    id: String(entry.id || ""),
    title: String(entry.title || "Untitled transcription"),
    instrument: String(entry.instrument || "unknown"),
    composerOrArtist: String(entry.composerOrArtist || "Unknown"),
    difficulty: entry.difficulty ? String(entry.difficulty) : "",
    tags,
    pdfPath: normalizedPath,
    updatedAt: entry.updatedAt ? String(entry.updatedAt) : "",
  };
}

function parseDate(value) {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortItems(items) {
  const sorted = [...items];

  sorted.sort((a, b) => {
    if (state.sort === "title-asc") return a.title.localeCompare(b.title);
    if (state.sort === "title-desc") return b.title.localeCompare(a.title);
    if (state.sort === "updated-asc") return parseDate(a.updatedAt) - parseDate(b.updatedAt);
    return parseDate(b.updatedAt) - parseDate(a.updatedAt);
  });

  return sorted;
}

function filterItems() {
  const needle = state.search.trim().toLowerCase();

  return state.items.filter((item) => {
    const searchable = [item.title, item.composerOrArtist, item.tags.join(" ")].join(" ").toLowerCase();
    const matchesSearch = !needle || searchable.includes(needle);
    const matchesInstrument = state.instrument === "all" || item.instrument === state.instrument;
    const matchesTag = state.tag === "all" || item.tags.includes(state.tag);
    return matchesSearch && matchesInstrument && matchesTag;
  });
}

function formatDate(value) {
  const parsed = parseDate(value);
  if (!parsed) return "Date not set";
  return new Date(parsed).toLocaleDateString();
}

function renderEmptyState(message) {
  listEl.innerHTML = `<li class="empty-state">${escapeHtml(message)}</li>`;
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderList() {
  const filtered = sortItems(filterItems());
  const total = state.items.length;

  resultsSummaryEl.textContent = `${filtered.length} of ${total} transcriptions`;
  statusMessageEl.classList.remove("is-error");
  statusMessageEl.textContent = "";

  if (filtered.length === 0) {
    renderEmptyState(
      "No transcriptions match your current filters. Add PDF files to transcriptions/ and records in data/transcriptions.json.",
    );
    return;
  }

  listEl.innerHTML = filtered
    .map((item) => {
      const safePath = encodeURI(item.pdfPath);
      const instrumentLabel = instrumentLabels[item.instrument] || "Unknown instrument";
      const difficulty = item.difficulty ? `<span class="pill">${escapeHtml(item.difficulty)}</span>` : "";
      const tags = item.tags.map((tag) => `<span class="pill">#${escapeHtml(tag)}</span>`).join("");

      return `
        <li class="card">
          <h3>${escapeHtml(item.title)}</h3>
          <p class="meta">${escapeHtml(item.composerOrArtist)}</p>
          <div class="pill-row">
            <span class="pill pill--instrument">${escapeHtml(instrumentLabel)}</span>
            ${difficulty}
            ${tags}
          </div>
          <div class="card__footer">
            <small class="date">Updated: ${escapeHtml(formatDate(item.updatedAt))}</small>
            <a class="card__cta" href="./${safePath}" target="_blank" rel="noreferrer noopener">Open PDF</a>
          </div>
        </li>
      `;
    })
    .join("");
}

function renderTags() {
  const tags = [...new Set(state.items.flatMap((item) => item.tags))].sort((a, b) =>
    a.localeCompare(b),
  );

  const allTags = ["all", ...tags];
  tagsEl.innerHTML = allTags
    .map((tag) => {
      const isActive = tag === state.tag ? "is-active" : "";
      const label = tag === "all" ? "All tags" : `#${tag}`;
      return `<button type="button" class="tag-filter ${isActive}" data-tag="${escapeHtml(tag)}">${escapeHtml(label)}</button>`;
    })
    .join("");
}

function bindEvents() {
  searchEl.addEventListener("input", (event) => {
    state.search = event.target.value;
    renderList();
  });

  instrumentEl.addEventListener("change", (event) => {
    state.instrument = event.target.value;
    renderList();
  });

  sortEl.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderList();
  });

  tagsEl.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-tag]");
    if (!trigger) return;
    state.tag = trigger.dataset.tag;
    renderTags();
    renderList();
  });
}

async function load() {
  try {
    const response = await fetch("./data/transcriptions.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`Unable to load index: ${response.status}`);

    const payload = await response.json();
    const records = Array.isArray(payload) ? payload : payload.transcriptions;
    if (!Array.isArray(records)) throw new Error("Index format is invalid.");

    state.items = records.map(normalizeRecord).filter((item) => item.id && item.pdfPath);
    renderTags();
    renderList();
  } catch (error) {
    statusMessageEl.classList.add("is-error");
    statusMessageEl.textContent = `${error.message} Check data/transcriptions.json.`;
    renderEmptyState("Transcription index unavailable.");
    resultsSummaryEl.textContent = "0 of 0 transcriptions";
  }
}

bindEvents();
load();
