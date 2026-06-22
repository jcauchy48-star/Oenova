// Constantes
const STORAGE_KEY = "mini-cave-a-vin";
const MOVEMENTS_KEY = "mini-cave-a-vin-movements";
const SCHEMA_VERSION = 2;
const currentYear = new Date().getFullYear();

const COLORS = ["Rouge", "Blanc", "Rose", "Effervescent", "Liquoreux"];
const STATUSES = ["en cave", "bu", "vendu", "offert", "reserve"];
const FORMATS = ["37.5cl", "75cl", "Magnum", "Jeroboam", "autre"];
const SUPPLIERS = ["", "caviste", "domaine", "grande distribution", "encheres", "autre"];
const CSV_COLUMNS = [
  "domain", "cuvee", "color", "region", "appellation", "vintage", "quantity",
  "format", "status", "price", "purchasePrice", "estimatedValue", "drinkFrom",
  "drinkTo", "cellarName", "rack", "row", "column", "location", "tags",
  "favorite", "rating", "purchaseDate", "supplier", "consumedAt", "notes"
];

const sampleWines = [
  {
    domain: "Domaine Leflaive",
    cuvee: "Bourgogne Blanc",
    color: "Blanc",
    region: "Bourgogne",
    appellation: "Bourgogne",
    vintage: 2020,
    quantity: 4,
    price: 44,
    purchasePrice: 44,
    estimatedValue: 52,
    drinkFrom: 2024,
    drinkTo: 2028,
    cellarName: "Cave principale",
    rack: "A1",
    row: "1",
    column: "4",
    location: "Casier A1",
    tags: ["garde", "blanc"],
    notes: "A garder pour poissons nobles, volailles cremees ou fromages affines."
  },
  {
    domain: "Chateau Poujeaux",
    cuvee: "Grand vin",
    color: "Rouge",
    region: "Bordeaux",
    appellation: "Moulis-en-Medoc",
    vintage: 2016,
    quantity: 6,
    price: 32,
    purchasePrice: 32,
    estimatedValue: 40,
    drinkFrom: 2022,
    drinkTo: 2032,
    cellarName: "Cave principale",
    rack: "C2",
    row: "2",
    column: "1",
    location: "Casier C2",
    tags: ["repas", "rouge"],
    notes: "Structure encore presente, parfait avec une cote de boeuf."
  },
  {
    domain: "Champagne Billecart-Salmon",
    cuvee: "Brut Reserve",
    color: "Effervescent",
    region: "Champagne",
    appellation: "Champagne",
    vintage: 0,
    quantity: 3,
    price: 49,
    purchasePrice: 49,
    estimatedValue: 49,
    drinkFrom: currentYear,
    drinkTo: currentYear + 2,
    cellarName: "Armoire de service",
    rack: "Haut",
    row: "",
    column: "",
    location: "Haut de cave",
    tags: ["aperitif"],
    notes: "Bouteilles pretes pour aperitif ou grande occasion improvisee."
  }
].map(normalizeWine);

// Etat
let wines = loadCellar();
let movements = loadMovements();
let deferredInstallPrompt = null;

// Selection DOM
const elements = {
  dialog: document.querySelector("#wineDialog"),
  form: document.querySelector("#wineForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  wineId: document.querySelector("#wineId"),
  openFormButton: document.querySelector("#openFormButton"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  deleteButton: document.querySelector("#deleteButton"),
  markConsumedFormButton: document.querySelector("#markConsumedFormButton"),
  exportButton: document.querySelector("#exportButton"),
  importButton: document.querySelector("#importButton"),
  exportCsvButton: document.querySelector("#exportCsvButton"),
  importCsvButton: document.querySelector("#importCsvButton"),
  printButton: document.querySelector("#printButton"),
  importFileInput: document.querySelector("#importFileInput"),
  importCsvFileInput: document.querySelector("#importCsvFileInput"),
  installButton: document.querySelector("#installButton"),
  searchInput: document.querySelector("#searchInput"),
  colorFilter: document.querySelector("#colorFilter"),
  regionFilter: document.querySelector("#regionFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  drinkFilter: document.querySelector("#drinkFilter"),
  cellarFilter: document.querySelector("#cellarFilter"),
  rackFilter: document.querySelector("#rackFilter"),
  tagFilter: document.querySelector("#tagFilter"),
  favoriteFilter: document.querySelector("#favoriteFilter"),
  stockFilter: document.querySelector("#stockFilter"),
  vintageMinFilter: document.querySelector("#vintageMinFilter"),
  vintageMaxFilter: document.querySelector("#vintageMaxFilter"),
  priceMinFilter: document.querySelector("#priceMinFilter"),
  priceMaxFilter: document.querySelector("#priceMaxFilter"),
  resetFiltersButton: document.querySelector("#resetFiltersButton"),
  sortSelect: document.querySelector("#sortSelect"),
  wineList: document.querySelector("#wineList"),
  watchList: document.querySelector("#watchList"),
  movementList: document.querySelector("#movementList"),
  emptyState: document.querySelector("#emptyState"),
  resultCount: document.querySelector("#resultCount"),
  compactStats: document.querySelector("#compactStats"),
  statBottles: document.querySelector("#statBottles"),
  statRefs: document.querySelector("#statRefs"),
  statValue: document.querySelector("#statValue"),
  statReady: document.querySelector("#statReady"),
  statPurchaseValue: document.querySelector("#statPurchaseValue"),
  statGainLoss: document.querySelector("#statGainLoss"),
  statExpired: document.querySelector("#statExpired"),
  statTopValue: document.querySelector("#statTopValue"),
  statusMessage: document.querySelector("#statusMessage"),
  photoPreview: document.querySelector("#photoPreview"),
  photoInputHidden: document.querySelector("#photoInputHidden"),
  printView: document.querySelector("#printView")
};

const fields = {
  domain: document.querySelector("#domainInput"),
  cuvee: document.querySelector("#cuveeInput"),
  color: document.querySelector("#wineColorInput"),
  region: document.querySelector("#regionInput"),
  appellation: document.querySelector("#appellationInput"),
  vintage: document.querySelector("#vintageInput"),
  quantity: document.querySelector("#quantityInput"),
  price: document.querySelector("#priceInput"),
  drinkFrom: document.querySelector("#drinkFromInput"),
  drinkTo: document.querySelector("#drinkToInput"),
  location: document.querySelector("#locationInput"),
  notes: document.querySelector("#notesInput"),
  format: document.querySelector("#formatInput"),
  status: document.querySelector("#statusInput"),
  purchaseDate: document.querySelector("#purchaseDateInput"),
  supplier: document.querySelector("#supplierInput"),
  purchasePrice: document.querySelector("#purchasePriceInput"),
  estimatedValue: document.querySelector("#estimatedValueInput"),
  cellarName: document.querySelector("#cellarNameInput"),
  rack: document.querySelector("#rackInput"),
  row: document.querySelector("#rowInput"),
  column: document.querySelector("#columnInput"),
  tags: document.querySelector("#tagsInput"),
  favorite: document.querySelector("#favoriteInput"),
  rating: document.querySelector("#ratingInput"),
  consumedAt: document.querySelector("#consumedAtInput"),
  photo: document.querySelector("#photoInput")
};

// Initialisation
bindEvents();
saveCellar(wines);
saveMovements(movements);
render();

// Evenements
function bindEvents() {
  elements.openFormButton.addEventListener("click", () => openForm());
  elements.closeDialogButton.addEventListener("click", () => elements.dialog.close());
  elements.form.addEventListener("submit", saveWineFromForm);
  elements.deleteButton.addEventListener("click", deleteCurrentWine);
  elements.markConsumedFormButton.addEventListener("click", () => markWineConsumed(elements.wineId.value));
  elements.exportButton.addEventListener("click", exportJson);
  elements.importButton.addEventListener("click", () => elements.importFileInput.click());
  elements.exportCsvButton.addEventListener("click", exportCsv);
  elements.importCsvButton.addEventListener("click", () => elements.importCsvFileInput.click());
  elements.printButton.addEventListener("click", printInventory);
  elements.importFileInput.addEventListener("change", importJson);
  elements.importCsvFileInput.addEventListener("change", importCsv);
  elements.resetFiltersButton.addEventListener("click", resetFilters);
  fields.photo.addEventListener("change", handlePhotoSelection);
  document.querySelector("#removePhotoButton").addEventListener("click", removePhoto);

  [
    elements.searchInput, elements.colorFilter, elements.regionFilter, elements.statusFilter,
    elements.drinkFilter, elements.cellarFilter, elements.rackFilter, elements.tagFilter,
    elements.favoriteFilter, elements.stockFilter, elements.vintageMinFilter,
    elements.vintageMaxFilter, elements.priceMinFilter, elements.priceMaxFilter,
    elements.sortSelect
  ].forEach((control) => control.addEventListener("input", render));

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    elements.installButton.hidden = false;
  });

  elements.installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    elements.installButton.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    elements.installButton.hidden = true;
  });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js");
    });
  }
}

// Storage et migration
function loadCellar() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return sampleWines;
  }

  try {
    const parsed = JSON.parse(stored);
    const rawWines = Array.isArray(parsed) ? parsed : parsed.wines;
    if (!Array.isArray(rawWines)) return sampleWines;
    return rawWines.map(normalizeWine);
  } catch {
    return sampleWines;
  }
}

function saveCellar(nextWines = wines) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    wines: nextWines
  }));
}

function loadMovements() {
  const stored = localStorage.getItem(MOVEMENTS_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(normalizeMovement) : [];
  } catch {
    return [];
  }
}

function saveMovements(nextMovements = movements) {
  localStorage.setItem(MOVEMENTS_KEY, JSON.stringify(nextMovements));
}

function normalizeWine(wine = {}) {
  const quantity = toNumber(wine.quantity, 1);
  const price = toNumber(wine.price ?? wine.purchasePrice, 0);
  const purchasePrice = toNumber(wine.purchasePrice ?? wine.price, price);
  const estimatedValue = toNumber(wine.estimatedValue ?? wine.price, price);
  const status = normalizeStatus(wine.status, quantity);

  return {
    id: wine.id || crypto.randomUUID(),
    schemaVersion: SCHEMA_VERSION,
    domain: cleanString(wine.domain) || "Domaine sans nom",
    cuvee: cleanString(wine.cuvee) || "Cuvee sans nom",
    color: normalizeColor(wine.color),
    region: cleanString(wine.region) || "Region non renseignee",
    appellation: cleanString(wine.appellation),
    vintage: normalizeVintage(wine.vintage),
    quantity: Math.max(0, quantity),
    price: Math.max(0, price),
    format: FORMATS.includes(wine.format) ? wine.format : "75cl",
    status,
    purchaseDate: cleanString(wine.purchaseDate),
    supplier: SUPPLIERS.includes(wine.supplier) ? wine.supplier : "",
    purchasePrice: Math.max(0, purchasePrice),
    estimatedValue: Math.max(0, estimatedValue),
    drinkFrom: normalizeYear(wine.drinkFrom),
    drinkTo: normalizeYear(wine.drinkTo),
    cellarName: cleanString(wine.cellarName),
    rack: cleanString(wine.rack),
    row: cleanString(wine.row),
    column: cleanString(wine.column),
    location: cleanString(wine.location),
    tags: normalizeTags(wine.tags),
    favorite: Boolean(wine.favorite),
    rating: clamp(toNumber(wine.rating, 0), 0, 5),
    consumedAt: cleanString(wine.consumedAt),
    photo: typeof wine.photo === "string" ? wine.photo : "",
    notes: cleanString(wine.notes)
  };
}

function normalizeMovement(movement = {}) {
  return {
    id: movement.id || crypto.randomUUID(),
    wineId: cleanString(movement.wineId),
    type: cleanString(movement.type) || "modification",
    date: cleanString(movement.date) || new Date().toISOString(),
    label: cleanString(movement.label) || "Mouvement",
    quantityChange: toNumber(movement.quantityChange, 0)
  };
}

// Rendu
function render() {
  wines = wines.map(normalizeWine);
  renderFilterOptions();
  const filtered = getFilteredWines();
  renderStats();
  renderCompactStats();
  renderWineList(filtered);
  renderAlerts();
  renderMovements();
}

function renderFilterOptions() {
  updateSelectOptions(elements.regionFilter, uniqueValues(wines.map((wine) => wine.region)), "Toutes", "all");
  updateSelectOptions(elements.cellarFilter, uniqueValues(wines.map((wine) => wine.cellarName).filter(Boolean)), "Toutes", "all");
  updateSelectOptions(elements.rackFilter, uniqueValues(wines.map((wine) => wine.rack).filter(Boolean)), "Tous", "all");
  updateSelectOptions(elements.tagFilter, uniqueValues(wines.flatMap((wine) => wine.tags)), "Tous", "all");
}

function renderStats() {
  const active = wines.filter((wine) => wine.status !== "bu" && wine.status !== "vendu" && wine.status !== "offert");
  const totalBottles = active.reduce((sum, wine) => sum + wine.quantity, 0);
  const purchaseTotal = active.reduce((sum, wine) => sum + wine.quantity * wine.purchasePrice, 0);
  const estimatedTotal = active.reduce((sum, wine) => sum + wine.quantity * wine.estimatedValue, 0);
  const ready = active.filter((wine) => drinkStatus(wine).state === "ready").length;
  const expired = active.filter((wine) => drinkStatus(wine).state === "late").length;
  const top = [...active].sort((a, b) => bottleValue(b) - bottleValue(a))[0];

  elements.statBottles.textContent = totalBottles;
  elements.statRefs.textContent = wines.length;
  elements.statValue.textContent = formatMoney(estimatedTotal);
  elements.statReady.textContent = ready;
  elements.statPurchaseValue.textContent = formatMoney(purchaseTotal);
  elements.statGainLoss.textContent = formatMoney(estimatedTotal - purchaseTotal);
  elements.statExpired.textContent = expired;
  elements.statTopValue.textContent = top ? `${top.domain} (${formatMoney(bottleValue(top))})` : "-";
}

function renderCompactStats() {
  const byColor = countBy(wines, "color");
  const byRegion = countBy(wines, "region");
  const topRegions = Object.entries(byRegion).sort((a, b) => b[1] - a[1]).slice(0, 2);
  elements.compactStats.innerHTML = [
    `Couleurs: ${Object.entries(byColor).map(([key, value]) => `${escapeHtml(key)} ${value}`).join(" · ") || "-"}`,
    `Regions: ${topRegions.map(([key, value]) => `${escapeHtml(key)} ${value}`).join(" · ") || "-"}`,
    `Top 5 valeur: ${getTopValuedWines().map((wine) => escapeHtml(wine.domain)).join(", ") || "-"}`
  ].map((text) => `<span class="compact-stat">${text}</span>`).join("");
}

function renderWineList(filtered) {
  elements.wineList.innerHTML = "";
  elements.emptyState.hidden = filtered.length > 0;
  elements.resultCount.textContent = `${filtered.length} resultat${filtered.length > 1 ? "s" : ""}`;

  filtered.forEach((wine) => {
    const status = drinkStatus(wine);
    const card = document.createElement("article");
    card.className = "wine-card";
    card.dataset.color = wine.color;
    card.innerHTML = `
      <div class="wine-photo">${wine.photo ? `<img src="${escapeAttribute(wine.photo)}" alt="">` : `<span>${escapeHtml(wine.color.slice(0, 1))}</span>`}</div>
      <div>
        <div class="wine-title-row">
          <div class="wine-title">${escapeHtml(wineName(wine))}</div>
          <button class="favorite-toggle" type="button" data-action="favorite" data-id="${escapeAttribute(wine.id)}" aria-pressed="${wine.favorite}">${wine.favorite ? "Favori" : "Favori +"}</button>
        </div>
        <div class="wine-meta">
          <span>${escapeHtml(wine.color)}</span>
          <span>${escapeHtml(wine.region)}</span>
          <span>${escapeHtml(wine.appellation || "Sans appellation")}</span>
          <span>${wine.vintage ? escapeHtml(String(wine.vintage)) : "Non millesime"}</span>
          <span>${escapeHtml(wine.format)}</span>
          <span>${escapeHtml(wine.status)}</span>
          <span>${escapeHtml(formatLocation(wine) || "Emplacement non renseigne")}</span>
          ${hasLocationConflict(wine) ? `<span class="pill warning">Emplacement partage</span>` : ""}
        </div>
        <p class="wine-notes">${escapeHtml(wine.notes || "Aucune note pour le moment.")}</p>
        <div class="tag-list">${wine.tags.map((tag) => `<span class="tag-badge">${escapeHtml(tag)}</span>`).join("")}</div>
      </div>
      <div class="wine-facts">
        <span class="pill ${status.state === "late" ? "danger" : status.state}">${status.label}</span>
        <strong>${wine.quantity} bouteille${wine.quantity > 1 ? "s" : ""}</strong>
        <span>${formatMoney(bottleValue(wine))}</span>
        <button class="card-action" type="button" data-action="consume" data-id="${escapeAttribute(wine.id)}">Marquer bue</button>
        <button class="card-action" type="button" data-action="edit" data-id="${escapeAttribute(wine.id)}">Modifier</button>
      </div>
    `;
    elements.wineList.append(card);
  });

  elements.wineList.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => handleCardAction(button.dataset.action, button.dataset.id));
  });
}

function renderAlerts() {
  const alerts = getAlerts();
  elements.watchList.innerHTML = "";

  if (!alerts.length) {
    elements.watchList.innerHTML = `<p>Aucune alerte pour le moment.</p>`;
    return;
  }

  alerts.slice(0, 8).forEach((alert) => {
    const item = document.createElement("div");
    item.className = `watch-card ${alert.severity}`;
    item.innerHTML = `
      <strong>${escapeHtml(alert.title)}</strong>
      <p>${escapeHtml(alert.message)}</p>
    `;
    elements.watchList.append(item);
  });
}

function renderMovements() {
  elements.movementList.innerHTML = "";
  const recent = [...movements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  if (!recent.length) {
    elements.movementList.innerHTML = `<p>Aucun mouvement.</p>`;
    return;
  }

  recent.forEach((movement) => {
    const item = document.createElement("div");
    item.className = "movement-card";
    item.innerHTML = `
      <strong>${escapeHtml(movement.label)}</strong>
      <p>${formatDateTime(movement.date)}${movement.quantityChange ? ` · ${movement.quantityChange > 0 ? "+" : ""}${movement.quantityChange}` : ""}</p>
    `;
    elements.movementList.append(item);
  });
}

// Filtres et tri
function getFilteredWines() {
  const term = elements.searchInput.value.trim().toLowerCase();
  const color = elements.colorFilter.value;
  const region = elements.regionFilter.value;
  const status = elements.statusFilter.value;
  const drink = elements.drinkFilter.value;
  const cellar = elements.cellarFilter.value;
  const rack = elements.rackFilter.value;
  const tag = elements.tagFilter.value;
  const favorite = elements.favoriteFilter.value;
  const stock = elements.stockFilter.value;
  const vintageMin = toNumber(elements.vintageMinFilter.value, 0);
  const vintageMax = toNumber(elements.vintageMaxFilter.value, 0);
  const priceMin = toNumber(elements.priceMinFilter.value, 0);
  const priceMax = toNumber(elements.priceMaxFilter.value, 0);

  return wines
    .filter((wine) => color === "all" || wine.color === color)
    .filter((wine) => region === "all" || wine.region === region)
    .filter((wine) => status === "all" || wine.status === status)
    .filter((wine) => cellar === "all" || wine.cellarName === cellar)
    .filter((wine) => rack === "all" || wine.rack === rack)
    .filter((wine) => tag === "all" || wine.tags.includes(tag))
    .filter((wine) => favorite === "all" || wine.favorite)
    .filter((wine) => stock === "all" || wine.quantity <= 1)
    .filter((wine) => drink === "all" || drinkStatus(wine).state === drink || (drink === "expired" && drinkStatus(wine).state === "late"))
    .filter((wine) => !vintageMin || (wine.vintage && wine.vintage >= vintageMin))
    .filter((wine) => !vintageMax || (wine.vintage && wine.vintage <= vintageMax))
    .filter((wine) => !priceMin || wine.estimatedValue >= priceMin || wine.price >= priceMin)
    .filter((wine) => !priceMax || wine.estimatedValue <= priceMax || wine.price <= priceMax)
    .filter((wine) => {
      if (!term) return true;
      return [
        wine.domain, wine.cuvee, wine.region, wine.appellation, wine.location,
        wine.cellarName, wine.rack, wine.row, wine.column, wine.status, ...wine.tags,
        String(wine.vintage || "Non millesime")
      ].join(" ").toLowerCase().includes(term);
    })
    .sort(sortWines);
}

function sortWines(a, b) {
  const sort = elements.sortSelect.value;
  if (sort === "name") return wineName(a).localeCompare(wineName(b));
  if (sort === "quantity") return b.quantity - a.quantity;
  if (sort === "value") return bottleValue(b) - bottleValue(a);
  if (sort === "vintage") return Number(b.vintage || 0) - Number(a.vintage || 0);
  if (sort === "favorite") return Number(b.favorite) - Number(a.favorite) || wineName(a).localeCompare(wineName(b));
  return Number(a.drinkTo || 9999) - Number(b.drinkTo || 9999);
}

function resetFilters() {
  [
    elements.searchInput, elements.vintageMinFilter, elements.vintageMaxFilter,
    elements.priceMinFilter, elements.priceMaxFilter
  ].forEach((input) => {
    input.value = "";
  });
  [
    elements.colorFilter, elements.regionFilter, elements.statusFilter, elements.drinkFilter,
    elements.cellarFilter, elements.rackFilter, elements.tagFilter, elements.favoriteFilter,
    elements.stockFilter
  ].forEach((select) => {
    select.value = "all";
  });
  elements.sortSelect.value = "drinkWindow";
  render();
}

// Formulaire
function openForm(wine = null) {
  elements.form.reset();
  elements.wineId.value = wine?.id || "";
  elements.dialogTitle.textContent = wine ? "Modifier une bouteille" : "Ajouter une bouteille";
  elements.deleteButton.hidden = !wine;
  elements.markConsumedFormButton.hidden = !wine;
  elements.photoInputHidden.value = wine?.photo || "";
  renderPhotoPreview(wine?.photo || "");

  if (wine) {
    Object.entries(fields).forEach(([key, input]) => {
      if (key === "photo") return;
      if (key === "tags") {
        input.value = wine.tags.join(", ");
      } else if (key === "favorite") {
        input.checked = wine.favorite;
      } else {
        input.value = wine[key] ?? "";
      }
    });
  } else {
    fields.vintage.value = currentYear;
    fields.quantity.value = 1;
    fields.price.value = "";
    fields.purchasePrice.value = "";
    fields.estimatedValue.value = "";
    fields.format.value = "75cl";
    fields.status.value = "en cave";
    fields.drinkFrom.value = currentYear;
    fields.drinkTo.value = currentYear + 5;
    fields.cellarName.value = "Cave principale";
  }

  elements.dialog.showModal();
  fields.domain.focus();
}

function saveWineFromForm(event) {
  event.preventDefault();
  const validation = validateForm();
  if (!validation.valid) {
    showStatus(validation.message, "error");
    return;
  }

  const oldWine = wines.find((wine) => wine.id === elements.wineId.value);
  const nextWine = normalizeWine({
    id: elements.wineId.value || crypto.randomUUID(),
    domain: fields.domain.value,
    cuvee: fields.cuvee.value,
    color: fields.color.value,
    region: fields.region.value,
    appellation: fields.appellation.value,
    vintage: fields.vintage.value,
    quantity: fields.quantity.value,
    price: fields.price.value,
    drinkFrom: fields.drinkFrom.value,
    drinkTo: fields.drinkTo.value,
    location: fields.location.value,
    notes: fields.notes.value,
    format: fields.format.value,
    status: fields.status.value,
    purchaseDate: fields.purchaseDate.value,
    supplier: fields.supplier.value,
    purchasePrice: fields.purchasePrice.value || fields.price.value,
    estimatedValue: fields.estimatedValue.value || fields.price.value,
    cellarName: fields.cellarName.value,
    rack: fields.rack.value,
    row: fields.row.value,
    column: fields.column.value,
    tags: fields.tags.value,
    favorite: fields.favorite.checked,
    rating: fields.rating.value,
    consumedAt: fields.consumedAt.value,
    photo: elements.photoInputHidden.value
  });

  const index = wines.findIndex((wine) => wine.id === nextWine.id);
  if (index >= 0) {
    wines[index] = nextWine;
    addMovement(nextWine.id, "modification", `Modification de ${wineName(nextWine)}`, 0);
    if (oldWine && locationKey(oldWine) !== locationKey(nextWine)) {
      addMovement(nextWine.id, "deplacement", `Deplacement de ${wineName(nextWine)} vers ${formatLocation(nextWine) || "emplacement non renseigne"}`, 0);
    }
  } else {
    wines = [nextWine, ...wines];
    addMovement(nextWine.id, "ajout", `Ajout de ${wineName(nextWine)}`, nextWine.quantity);
  }

  saveCellar(wines);
  saveMovements(movements);
  elements.dialog.close();
  render();
  showStatus("Bouteille enregistree.");
}

function validateForm() {
  const quantity = toNumber(fields.quantity.value, 0);
  const price = toNumber(fields.price.value, 0);
  const purchasePrice = toNumber(fields.purchasePrice.value, 0);
  const estimatedValue = toNumber(fields.estimatedValue.value, 0);
  const drinkFrom = normalizeYear(fields.drinkFrom.value);
  const drinkTo = normalizeYear(fields.drinkTo.value);
  const vintage = normalizeVintage(fields.vintage.value);
  const rating = toNumber(fields.rating.value, 0);

  if (!fields.domain.value.trim() || !fields.cuvee.value.trim()) return { valid: false, message: "Domaine et cuvee sont obligatoires." };
  if (quantity < 0) return { valid: false, message: "La quantite ne peut pas etre negative." };
  if (price < 0 || purchasePrice < 0 || estimatedValue < 0) return { valid: false, message: "Les prix ne peuvent pas etre negatifs." };
  if (drinkFrom && drinkTo && drinkFrom > drinkTo) return { valid: false, message: "La date de debut de degustation doit etre avant la date de fin." };
  if (vintage && (vintage < 1900 || vintage > 2100)) return { valid: false, message: "Le millesime doit etre compris entre 1900 et 2100, ou 0 pour non millesime." };
  if (rating < 0 || rating > 5) return { valid: false, message: "La note doit etre comprise entre 0 et 5." };
  return { valid: true };
}

function deleteCurrentWine() {
  const id = elements.wineId.value;
  const wine = wines.find((item) => item.id === id);
  if (!wine) return;
  if (!confirm(`Supprimer ${wineName(wine)} ? Cette action remplace l'inventaire local.`)) return;

  wines = wines.filter((item) => item.id !== id);
  addMovement(id, "suppression", `Suppression de ${wineName(wine)}`, -wine.quantity);
  saveCellar(wines);
  saveMovements(movements);
  elements.dialog.close();
  render();
  showStatus("Bouteille supprimee.");
}

function handleCardAction(action, id) {
  const wine = wines.find((item) => item.id === id);
  if (!wine) return;
  if (action === "edit") openForm(wine);
  if (action === "consume") markWineConsumed(id);
  if (action === "favorite") toggleFavorite(id);
}

function markWineConsumed(id) {
  const wine = wines.find((item) => item.id === id);
  if (!wine || wine.quantity <= 0) {
    showStatus("Aucune bouteille disponible a consommer.", "error");
    return;
  }
  if (!confirm(`Marquer une bouteille de ${wineName(wine)} comme bue ?`)) return;

  wine.quantity = Math.max(0, wine.quantity - 1);
  wine.consumedAt = new Date().toISOString().slice(0, 10);
  if (wine.quantity === 0) wine.status = "bu";
  addMovement(wine.id, "consommation", `Consommation de ${wineName(wine)}`, -1);
  saveCellar(wines);
  saveMovements(movements);
  if (elements.dialog.open) elements.dialog.close();
  render();
  showStatus("Bouteille marquee comme bue.");
}

function toggleFavorite(id) {
  const wine = wines.find((item) => item.id === id);
  if (!wine) return;
  wine.favorite = !wine.favorite;
  addMovement(wine.id, "modification", `${wine.favorite ? "Ajout aux favoris" : "Retrait des favoris"}: ${wineName(wine)}`, 0);
  saveCellar(wines);
  saveMovements(movements);
  render();
}

// Photos
function handlePhotoSelection(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showStatus("Le fichier choisi n'est pas une image.", "error");
    fields.photo.value = "";
    return;
  }

  compressImage(file).then((dataUrl) => {
    elements.photoInputHidden.value = dataUrl;
    renderPhotoPreview(dataUrl);
  }).catch(() => showStatus("Impossible de lire cette image.", "error"));
}

function removePhoto() {
  elements.photoInputHidden.value = "";
  fields.photo.value = "";
  renderPhotoPreview("");
}

function renderPhotoPreview(dataUrl) {
  elements.photoPreview.innerHTML = dataUrl ? `<img src="${escapeAttribute(dataUrl)}" alt="">` : "Aucune photo";
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const maxSize = 720;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

// Import / export
function exportJson() {
  const backup = {
    app: "Cave a vin",
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    wines,
    movements
  };
  downloadFile(JSON.stringify(backup, null, 2), `cave-a-vin-${today()}.json`, "application/json");
  showStatus("Sauvegarde JSON exportee.");
}

function importJson(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  readTextFile(file, (text) => {
    try {
      const data = JSON.parse(text);
      const importedWines = Array.isArray(data) ? data : data.wines;
      if (!Array.isArray(importedWines)) throw new Error("La cle wines est absente ou invalide.");
      if (!confirm("Importer cette sauvegarde remplacera la cave actuelle. Continuer ?")) return;
      wines = importedWines.map(normalizeWine);
      movements = Array.isArray(data.movements) ? data.movements.map(normalizeMovement) : movements;
      addMovement("", "import", `Import JSON de ${wines.length} reference(s)`, 0);
      saveCellar(wines);
      saveMovements(movements);
      render();
      showStatus("Sauvegarde JSON importee.");
    } catch (error) {
      showStatus(`Import JSON impossible: ${error.message}`, "error");
    } finally {
      elements.importFileInput.value = "";
    }
  });
}

function exportCsv() {
  const rows = wines.map((wine) => CSV_COLUMNS.map((column) => formatCsvValue(csvValue(wine, column))).join(";"));
  const csv = "\ufeff" + CSV_COLUMNS.join(";") + "\n" + rows.join("\n");
  downloadFile(csv, `cave-a-vin-${today()}.csv`, "text/csv;charset=utf-8");
  showStatus("Inventaire CSV exporte.");
}

function importCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  readTextFile(file, (text) => {
    try {
      const rows = parseCsv(text);
      if (rows.length < 2) throw new Error("Le fichier ne contient pas de donnees.");
      const headers = rows[0].map((header) => header.trim().replace(/^\ufeff/, ""));
      const missing = ["domain", "cuvee", "color", "quantity"].filter((column) => !headers.includes(column));
      if (missing.length) throw new Error(`Colonnes obligatoires manquantes: ${missing.join(", ")}.`);
      if (!confirm("Importer ce CSV remplacera la cave actuelle. Continuer ?")) return;
      wines = rows.slice(1)
        .filter((row) => row.some((cell) => cell.trim()))
        .map((row) => rowToWine(headers, row));
      addMovement("", "import", `Import CSV de ${wines.length} reference(s)`, 0);
      saveCellar(wines);
      saveMovements(movements);
      render();
      showStatus("CSV importe.");
    } catch (error) {
      showStatus(`Import CSV impossible: ${error.message}`, "error");
    } finally {
      elements.importCsvFileInput.value = "";
    }
  });
}

function printInventory() {
  const totalBottles = wines.reduce((sum, wine) => sum + wine.quantity, 0);
  const totalValue = wines.reduce((sum, wine) => sum + bottleValue(wine), 0);
  elements.printView.innerHTML = `
    <h1>Inventaire Cave a vin</h1>
    <p>Date d'export: ${escapeHtml(new Date().toLocaleDateString("fr-FR"))}</p>
    <p>Total: ${totalBottles} bouteilles · ${formatMoney(totalValue)}</p>
    <table>
      <thead>
        <tr>
          <th>Domaine</th><th>Cuvee</th><th>Couleur</th><th>Region</th><th>Millesime</th>
          <th>Quantite</th><th>Statut</th><th>Emplacement</th><th>Valeur</th>
        </tr>
      </thead>
      <tbody>
        ${wines.map((wine) => `
          <tr>
            <td>${escapeHtml(wine.domain)}</td>
            <td>${escapeHtml(wine.cuvee)}</td>
            <td>${escapeHtml(wine.color)}</td>
            <td>${escapeHtml(wine.region)}</td>
            <td>${wine.vintage || "NM"}</td>
            <td>${wine.quantity}</td>
            <td>${escapeHtml(wine.status)}</td>
            <td>${escapeHtml(formatLocation(wine))}</td>
            <td>${formatMoney(bottleValue(wine))}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
  window.print();
}

// Mouvements
function addMovement(wineId, type, label, quantityChange = 0) {
  movements = [
    normalizeMovement({
      id: crypto.randomUUID(),
      wineId,
      type,
      date: new Date().toISOString(),
      label,
      quantityChange
    }),
    ...movements
  ].slice(0, 300);
}

// Alertes
function getAlerts() {
  const alerts = [];
  const active = wines.filter((wine) => !["bu", "vendu", "offert"].includes(wine.status));

  active.forEach((wine) => {
    const status = drinkStatus(wine);
    if (status.state === "ready") {
      alerts.push({ type: "ready", severity: "info", title: "Pret a boire", message: `${wineName(wine)} est dans sa fenetre ideale.`, wineId: wine.id });
    }
    if (status.state === "soon") {
      alerts.push({ type: "soon", severity: "warning", title: "A boire bientot", message: `${wineName(wine)} arrive bientot a maturite.`, wineId: wine.id });
    }
    if (status.state === "late") {
      alerts.push({ type: "expired", severity: "danger", title: "Fenetre depassee", message: `${wineName(wine)} depasse sa fin conseillee (${wine.drinkTo}).`, wineId: wine.id });
    }
    if (wine.quantity <= 1) {
      alerts.push({ type: "low-stock", severity: "warning", title: "Stock faible", message: `${wineName(wine)}: ${wine.quantity} bouteille restante.`, wineId: wine.id });
    }
    if (bottleValue(wine) >= 250 || wine.estimatedValue >= 100) {
      alerts.push({ type: "high-value", severity: "info", title: "Valeur elevee", message: `${wineName(wine)} vaut environ ${formatMoney(bottleValue(wine))}.`, wineId: wine.id });
    }
  });

  getLocationConflicts().forEach(([key, conflictWines]) => {
    alerts.push({
      type: "location-conflict",
      severity: "warning",
      title: "Emplacement partage",
      message: `${conflictWines.length} references utilisent ${key}.`,
      wineId: conflictWines[0]?.id
    });
  });

  return alerts.sort((a, b) => severityWeight(b.severity) - severityWeight(a.severity));
}

// Helpers metier
function drinkStatus(wine) {
  const from = Number(wine.drinkFrom || 0);
  const to = Number(wine.drinkTo || 0);

  if (to && currentYear > to) {
    return { state: "late", label: "Depasse", sentence: `La fenetre conseillee se terminait en ${to}.` };
  }
  if (to && currentYear >= to - 1) {
    return { state: "soon", label: "Bientot", sentence: `A boire bientot, jusqu'en ${to}.` };
  }
  if (from && currentYear < from) {
    return { state: "wait", label: "A garder", sentence: `Patience jusqu'en ${from}.` };
  }
  return { state: "ready", label: "Pret", sentence: to ? `Ideal maintenant, jusqu'en ${to}.` : "Pret a deguster." };
}

function wineName(wine) {
  return `${wine.domain} - ${wine.cuvee}`;
}

function bottleValue(wine) {
  return Number(wine.quantity || 0) * Number(wine.estimatedValue || wine.price || 0);
}

function formatLocation(wine) {
  const structured = [wine.cellarName, wine.rack && `casier ${wine.rack}`, wine.row && `rangee ${wine.row}`, wine.column && `colonne ${wine.column}`].filter(Boolean).join(" · ");
  return structured || wine.location || "";
}

function locationKey(wine) {
  return [wine.cellarName, wine.rack, wine.row, wine.column].map((value) => cleanString(value).toLowerCase()).join("|");
}

function getLocationConflicts() {
  const map = new Map();
  wines.forEach((wine) => {
    const key = locationKey(wine);
    if (key.replaceAll("|", "")) {
      map.set(key, [...(map.get(key) || []), wine]);
    }
  });
  return [...map.entries()].filter(([, items]) => items.length > 1);
}

function hasLocationConflict(wine) {
  const key = locationKey(wine);
  return Boolean(key.replaceAll("|", "")) && wines.filter((item) => item.id !== wine.id && locationKey(item) === key).length > 0;
}

function getTopValuedWines() {
  return [...wines].sort((a, b) => bottleValue(b) - bottleValue(a)).slice(0, 5);
}

// Helpers CSV
function csvValue(wine, column) {
  if (column === "tags") return wine.tags.join(",");
  if (column === "favorite") return wine.favorite ? "true" : "false";
  return wine[column] ?? "";
}

function formatCsvValue(value) {
  const text = String(value ?? "");
  if (/[;,"\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function parseCsv(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const delimiter = firstLine.includes(";") ? ";" : ",";
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted && char === '"' && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (!quoted && char === delimiter) {
      row.push(cell);
      cell = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell);
  rows.push(row);
  return rows.filter((line) => line.some((value) => value.trim()));
}

function rowToWine(headers, row) {
  const data = {};
  headers.forEach((header, index) => {
    data[header] = row[index] || "";
  });
  data.tags = data.tags ? data.tags.split(",") : [];
  data.favorite = String(data.favorite).toLowerCase() === "true";
  return normalizeWine(data);
}

// Helpers generiques
function cleanString(value) {
  return String(value ?? "").trim();
}

function normalizeTags(value) {
  if (Array.isArray(value)) return uniqueValues(value.map(cleanString).filter(Boolean));
  return uniqueValues(String(value || "").split(",").map(cleanString).filter(Boolean));
}

function normalizeColor(value) {
  const normalized = cleanString(value).replace("Rosé", "Rose");
  return COLORS.includes(normalized) ? normalized : "Rouge";
}

function normalizeStatus(value, quantity) {
  const normalized = cleanString(value).replace("réservé", "reserve");
  if (STATUSES.includes(normalized)) return normalized;
  return quantity <= 0 ? "bu" : "en cave";
}

function normalizeVintage(value) {
  const year = toNumber(value, 0);
  if (!year) return 0;
  return clamp(Math.round(year), 1900, 2100);
}

function normalizeYear(value) {
  const year = toNumber(value, 0);
  if (!year) return 0;
  return clamp(Math.round(year), 1900, 2100);
}

function toNumber(value, fallback = 0) {
  const number = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(number) ? number : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "fr"));
}

function updateSelectOptions(select, values, allLabel, allValue) {
  const current = select.value;
  select.innerHTML = `<option value="${allValue}">${allLabel}</option>` + values.map((value) => `<option value="${escapeAttribute(value)}">${escapeHtml(value)}</option>`).join("");
  select.value = values.includes(current) ? current : allValue;
}

function countBy(items, key) {
  return items.reduce((result, item) => {
    const value = item[key] || "Non renseigne";
    result[value] = (result[value] || 0) + Number(item.quantity || 0);
    return result;
  }, {});
}

function formatMoney(value) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatDateTime(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function severityWeight(severity) {
  return { danger: 3, warning: 2, info: 1 }[severity] || 0;
}

function readTextFile(file, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(String(reader.result)));
  reader.addEventListener("error", () => showStatus("Impossible de lire ce fichier.", "error"));
  reader.readAsText(file);
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function showStatus(message, type = "success") {
  elements.statusMessage.textContent = message;
  elements.statusMessage.classList.toggle("error", type === "error");
  window.clearTimeout(showStatus.timeoutId);
  showStatus.timeoutId = window.setTimeout(() => {
    elements.statusMessage.textContent = "";
    elements.statusMessage.classList.remove("error");
  }, 4500);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value);
}
