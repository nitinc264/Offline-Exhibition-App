/*
 * ============================================================
 * CS Direkt — Interactive Science Exhibition Explorer
 * Task 2
 *
 * Browser + Electron compatible
 *
 * Browser:
 *   index.html -> app.js -> data.json
 *
 * Electron:
 *   index.html -> app.js -> preload.js -> main.js -> data.json
 *
 * Offline-first:
 *   - Local data.json
 *   - Local HTML/CSS/JS
 *   - No external API
 *   - No CDN
 *   - No remote fonts
 *   - No remote assets required
 *
 * Layer 1:
 *   Home / theme discovery
 *
 * Layer 2:
 *   Theme exploration / exhibit cards / exhibit details
 * ============================================================
 */

"use strict";

/* ============================================================
   APPLICATION STATE
   ============================================================ */

const state = {
  data: null,
  selectedFloor: null,
  selectedExhibit: null,
  searchTerm: "",
  currentView: "home"
};

const els = {};

/* ============================================================
   START APPLICATION
   ============================================================ */

document.addEventListener("DOMContentLoaded", async () => {
  cacheElements();
  bindEvents();
  await loadExhibitionData();
});

/* ============================================================
   CACHE DOM ELEMENTS
   ============================================================ */

function cacheElements() {
  // Views
  els.homeView = document.getElementById("home-view");
  els.exploreView = document.getElementById("explore-view");
  els.aboutView = document.getElementById("about-view");

  // Main navigation
  els.brandHomeBtn = document.getElementById("brandHomeBtn");
  els.exploreBtn = document.getElementById("exploreBtn");
  els.overviewBtn = document.getElementById("overviewBtn");
  els.backHomeBtn = document.getElementById("backHomeBtn");

  // Theme/exhibit containers
  els.themeGrid = document.getElementById("themeGrid");
  els.themeList = document.getElementById("themeList");
  els.exhibitGrid = document.getElementById("exhibitGrid");
  els.exhibitSearch = document.getElementById("exhibitSearch");

  // Hero stats
  els.totalExhibits = document.getElementById("totalExhibits");
  els.totalFloors = document.getElementById("totalFloors");
  els.interactiveExhibits = document.getElementById(
    "interactiveExhibits"
  );

  // Explore header
  els.floorLabel = document.getElementById("floorLabel");
  els.exploreTitle = document.getElementById("explore-title");
  els.exploreDescription = document.getElementById(
    "exploreDescription"
  );
  els.detailCount = document.getElementById("detailCount");
  els.breadcrumbTheme = document.getElementById(
    "breadcrumbTheme"
  );
  els.exhibitsHeading = document.getElementById(
    "exhibitsHeading"
  );
  els.exhibitsSubheading = document.getElementById(
    "exhibitsSubheading"
  );

  // Modal
  els.exhibitModal = document.getElementById("exhibitModal");
  els.closeModalBtn = document.getElementById(
    "closeModalBtn"
  );
  els.modalBackBtn = document.getElementById(
    "modalBackBtn"
  );

  els.modalFloor = document.getElementById("modalFloor");
  els.modalTitle = document.getElementById("modalTitle");
  els.modalTheme = document.getElementById("modalTheme");
  els.modalDescription = document.getElementById(
    "modalDescription"
  );
  els.modalLearning = document.getElementById(
    "modalLearning"
  );
  els.modalInteraction = document.getElementById(
    "modalInteraction"
  );
  els.modalType = document.getElementById("modalType");
  els.modalMedia = document.getElementById("modalMedia");

  // Top navigation links
  els.navLinks = Array.from(
    document.querySelectorAll(".nav-link")
  );
}

/* ============================================================
   EVENT BINDINGS
   ============================================================ */

function bindEvents() {
  /*
   * Brand
   */
  if (els.brandHomeBtn) {
    els.brandHomeBtn.addEventListener("click", () => {
      showView("home");
    });
  }

  /*
   * Explore button
   */
  if (els.exploreBtn) {
    els.exploreBtn.addEventListener("click", () => {
      showView("explore");
      ensureFirstFloorSelected();
    });
  }

  /*
   * Overview button
   */
  if (els.overviewBtn) {
    els.overviewBtn.addEventListener("click", () => {
      showView("home");

      requestAnimationFrame(() => {
        const section =
          document.getElementById("themes-section");

        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    });
  }

  /*
   * Back to Home
   */
  if (els.backHomeBtn) {
    els.backHomeBtn.addEventListener("click", () => {
      showView("home");
    });
  }

  /*
   * Top navigation
   */
  els.navLinks.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.nav;

      if (target === "home") {
        showView("home");
      }

      if (target === "themes") {
        showView("explore");
        ensureFirstFloorSelected();
      }

      if (target === "about") {
        showView("about");
      }
    });
  });

  /*
   * Delegated click handling.
   *
   * Handles:
   * - Theme cards
   * - Theme sidebar
   * - Entire exhibit cards
   * - View exhibit details button
   * - General action buttons
   */
  document.addEventListener("click", (event) => {
    /*
     * --------------------------------------------------------
     * THEME CLICK
     * --------------------------------------------------------
     */
    const themeButton =
      event.target.closest("[data-theme-floor]");

    if (themeButton) {
      const floor =
        themeButton.dataset.themeFloor;

      selectFloor(floor);
      return;
    }

    /*
     * --------------------------------------------------------
     * EXHIBIT DETAIL BUTTON
     *
     * This is kept separately so it remains clickable.
     * --------------------------------------------------------
     */
    const exhibitButton =
      event.target.closest("[data-exhibit-index]");

    if (exhibitButton) {
      const index = Number(
        exhibitButton.dataset.exhibitIndex
      );

      const filteredExhibits =
        getFilteredExhibits();

      const exhibit =
        filteredExhibits[index];

      if (exhibit) {
        openExhibitModal(exhibit);
      }

      return;
    }

    /*
     * --------------------------------------------------------
     * ENTIRE EXHIBIT CARD CLICK
     *
     * Clicking anywhere on the card opens the same detail
     * modal, except when the actual "View exhibit details"
     * button was clicked.
     * --------------------------------------------------------
     */
    const exhibitCard =
      event.target.closest(
        "[data-exhibit-card-index]"
      );

    if (exhibitCard) {
      /*
       * Don't double-handle the explicit details button.
       */
      if (
        event.target.closest(
          "[data-exhibit-index]"
        )
      ) {
        return;
      }

      const index = Number(
        exhibitCard.dataset.exhibitCardIndex
      );

      const filteredExhibits =
        getFilteredExhibits();

      const exhibit =
        filteredExhibits[index];

      if (exhibit) {
        openExhibitModal(exhibit);
      }

      return;
    }

    /*
     * --------------------------------------------------------
     * GENERIC ACTION BUTTON
     * --------------------------------------------------------
     */
    const actionButton =
      event.target.closest("[data-action]");

    if (!actionButton) {
      return;
    }

    const action =
      actionButton.dataset.action;

    if (action === "home") {
      showView("home");
    }

    if (action === "explore") {
      showView("explore");
      ensureFirstFloorSelected();
    }

    if (action === "overview") {
      showView("home");

      requestAnimationFrame(() => {
        const section =
          document.getElementById(
            "themes-section"
          );

        if (section) {
          section.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    }
  });

  /*
   * Search
   */
  if (els.exhibitSearch) {
    els.exhibitSearch.addEventListener(
      "input",
      (event) => {
        state.searchTerm =
          event.target.value
            .trim()
            .toLowerCase();

        renderExhibits();
      }
    );
  }

  /*
   * Modal controls
   */
  if (els.closeModalBtn) {
    els.closeModalBtn.addEventListener(
      "click",
      closeExhibitModal
    );
  }

  if (els.modalBackBtn) {
    els.modalBackBtn.addEventListener(
      "click",
      closeExhibitModal
    );
  }

  /*
   * Click outside modal to close.
   */
  if (els.exhibitModal) {
    els.exhibitModal.addEventListener(
      "click",
      (event) => {
        if (
          event.target ===
          els.exhibitModal
        ) {
          closeExhibitModal();
        }
      }
    );
  }

  /*
   * Escape closes modal.
   */
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key === "Escape" &&
        els.exhibitModal &&
        !els.exhibitModal.hidden
      ) {
        closeExhibitModal();
      }
    }
  );

  /*
   * Keyboard support for entire exhibit cards.
   *
   * This lets the card behave like an accessible
   * button when focused with the keyboard.
   */
  document.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }

      const card =
        event.target.closest(
          "[data-exhibit-card-index]"
        );

      if (!card) {
        return;
      }

      /*
       * Don't trigger when focus is already on the
       * explicit details button.
       */
      if (
        event.target.closest(
          "[data-exhibit-index]"
        )
      ) {
        return;
      }

      event.preventDefault();

      const index = Number(
        card.dataset.exhibitCardIndex
      );

      const filteredExhibits =
        getFilteredExhibits();

      const exhibit =
        filteredExhibits[index];

      if (exhibit) {
        openExhibitModal(exhibit);
      }
    }
  );
}

/* ============================================================
   DATA LOADING
   ============================================================ */

async function loadExhibitionData() {
  try {
    let data = null;

    /*
     * Default runtime source.
     */
    let source =
      "browser-local-json";

    /*
     * --------------------------------------------------------
     * ELECTRON MODE
     * --------------------------------------------------------
     *
     * preload.js exposes:
     *
     * window.electronAPI.loadExhibitionData()
     *
     * This allows Electron to load the JSON from the local
     * filesystem without requiring localhost or internet.
     */
    if (
      window.electronAPI &&
      typeof window.electronAPI
        .loadExhibitionData ===
        "function"
    ) {
      data =
        await window.electronAPI
          .loadExhibitionData();

      source =
        "electron-local-file";
    }

    /*
     * --------------------------------------------------------
     * BROWSER MODE
     * --------------------------------------------------------
     *
     * Used by:
     *
     * python -m http.server 8000
     *
     * and:
     *
     * http://localhost:8000
     */
    else {
      const response =
        await fetch("./data.json", {
          cache: "no-store"
        });

      if (!response.ok) {
        throw new Error(
          `data.json returned HTTP ${response.status}`
        );
      }

      data =
        await response.json();
    }

    /*
     * Validate loaded data.
     */
    validateData(data);

    /*
     * Save application data.
     */
    state.data = data;

    /*
     * Render application.
     */
    updateOverviewStats();
    renderThemeGrid();
    renderThemeList();

    ensureFirstFloorSelected();

    console.info(
      `[CS Direkt] Loaded ${data.total_exhibits} exhibits across ${data.total_floors} floors.`
    );

    console.info(
      `[CS Direkt] Runtime source: ${source}`
    );
  } catch (error) {
    console.error(
      "[CS Direkt] Failed to load exhibition data:",
      error
    );

    renderDataError(error);
  }
}

/* ============================================================
   DATA VALIDATION
   ============================================================ */

function validateData(data) {
  if (
    !data ||
    typeof data !== "object"
  ) {
    throw new Error(
      "Invalid data.json: expected a JSON object."
    );
  }

  if (
    !Array.isArray(data.themes) ||
    data.themes.length === 0
  ) {
    throw new Error(
      "Invalid data.json: themes array is missing or empty."
    );
  }

  data.themes.forEach(
    (theme, themeIndex) => {
      if (!theme.floor_no) {
        throw new Error(
          `Theme ${themeIndex + 1}: floor_no is missing.`
        );
      }

      if (!theme.theme) {
        throw new Error(
          `Theme ${themeIndex + 1}: theme name is missing.`
        );
      }

      if (
        !Array.isArray(theme.exhibits)
      ) {
        throw new Error(
          `Theme ${themeIndex + 1}: exhibits array is missing.`
        );
      }

      theme.exhibits.forEach(
        (exhibit, exhibitIndex) => {
          if (!exhibit.title) {
            throw new Error(
              `Theme ${
                themeIndex + 1
              }, exhibit ${
                exhibitIndex + 1
              }: title is missing.`
            );
          }
        }
      );
    }
  );
}

/* ============================================================
   OVERVIEW STATISTICS
   ============================================================ */

function updateOverviewStats() {
  if (!state.data) {
    return;
  }

  const totalExhibits =
    Number(
      state.data.total_exhibits
    ) ||
    countAllExhibits();

  const totalFloors =
    Number(
      state.data.total_floors
    ) ||
    state.data.themes.length;

  const interactiveExhibits =
    countInteractiveExhibits();

  els.totalExhibits.textContent =
    totalExhibits;

  els.totalFloors.textContent =
    totalFloors;

  els.interactiveExhibits.textContent =
    interactiveExhibits;
}

function countAllExhibits() {
  if (!state.data) {
    return 0;
  }

  return state.data.themes.reduce(
    (total, theme) => {
      return (
        total +
        theme.exhibits.length
      );
    },
    0
  );
}

function countInteractiveExhibits() {
  if (!state.data) {
    return 0;
  }

  return state.data.themes.reduce(
    (total, theme) => {
      const interactive =
        theme.exhibits.filter(
          (exhibit) =>
            String(
              exhibit.type || ""
            )
              .toLowerCase()
              .includes(
                "interactive"
              )
        );

      return (
        total +
        interactive.length
      );
    },
    0
  );
}

/* ============================================================
   DATA ERROR
   ============================================================ */

function renderDataError(error) {
  const message =
    escapeHtml(
      error?.message ||
        "Unknown data loading error."
    );

  if (els.themeGrid) {
    els.themeGrid.innerHTML = `
      <div class="empty-state">
        <strong>
          Exhibition data could not be loaded.
        </strong>

        <p style="margin:8px 0 0;">
          ${message}
        </p>

        <p style="margin:8px 0 0;">
          Make sure
          <code>data.json</code>
          is available in the project root.
        </p>
      </div>
    `;
  }

  if (els.themeList) {
    els.themeList.innerHTML = "";
  }

  if (els.exhibitGrid) {
    els.exhibitGrid.innerHTML = "";
  }
}

/* ============================================================
   LAYER 1 — THEME CARDS
   ============================================================ */

function renderThemeGrid() {
  if (!state.data) {
    return;
  }

  els.themeGrid.innerHTML =
    state.data.themes
      .map(
        (theme, index) => {
          const count =
            theme.exhibits.length;

          return `
            <button
              class="theme-card"
              type="button"
              data-theme-floor="${escapeAttr(
                theme.floor_no
              )}"
              aria-label="Explore ${escapeAttr(
                theme.theme
              )}"
            >
              <span class="theme-index">
                <span>
                  FLOOR
                  ${formatFloor(
                    theme.floor_no
                  )}
                </span>

                <span
                  class="theme-arrow"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </span>

              <span class="theme-title">
                ${escapeHtml(
                  theme.theme
                )}
              </span>

              <span class="theme-meta">
                ${count}
                ${
                  count === 1
                    ? "exhibit"
                    : "exhibits"
                }
                ·
                ${
                  index === 0
                    ? "Start the journey"
                    : "Explore the floor"
                }
              </span>
            </button>
          `;
        }
      )
      .join("");
}

/* ============================================================
   LAYER 2 — THEME LIST
   ============================================================ */

function renderThemeList() {
  if (!state.data) {
    return;
  }

  els.themeList.innerHTML =
    state.data.themes
      .map(
        (theme) => {
          return `
            <button
              class="theme-list-btn"
              type="button"
              data-theme-floor="${escapeAttr(
                theme.floor_no
              )}"
              data-theme-button="${escapeAttr(
                theme.floor_no
              )}"
            >
              ${escapeHtml(
                theme.theme
              )}
            </button>
          `;
        }
      )
      .join("");

  updateActiveThemeButton();
}

/* ============================================================
   SELECT FLOOR
   ============================================================ */

function selectFloor(
  floorNo,
  moveToExplore = true
) {
  if (!state.data) {
    return;
  }

  const normalized =
    String(floorNo);

  const theme =
    state.data.themes.find(
      (item) =>
        String(item.floor_no) ===
        normalized
    );

  if (!theme) {
    console.warn(
      `[CS Direkt] Floor not found: ${floorNo}`
    );

    return;
  }

  state.selectedFloor =
    normalized;

  state.searchTerm = "";

  if (els.exhibitSearch) {
    els.exhibitSearch.value = "";
  }

  if (moveToExplore) {
    showView("explore");
  }

  updateExploreHeader(theme);
  updateActiveThemeButton();
  renderExhibits();

  if (moveToExplore) {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}

/* ============================================================
   ENSURE FIRST FLOOR
   ============================================================ */

function ensureFirstFloorSelected() {
  if (
    !state.data ||
    !Array.isArray(
      state.data.themes
    ) ||
    state.data.themes.length === 0
  ) {
    return;
  }

  if (!state.selectedFloor) {
    state.selectedFloor =
      String(
        state.data.themes[0]
          .floor_no
      );
  }

  selectFloor(
    state.selectedFloor,
    false
  );
}

/* ============================================================
   UPDATE EXPLORE HEADER
   ============================================================ */

function updateExploreHeader(
  theme
) {
  els.floorLabel.textContent =
    `FLOOR ${formatFloor(
      theme.floor_no
    )}`;

  els.exploreTitle.textContent =
    theme.theme;

  els.breadcrumbTheme.textContent =
    theme.theme;

  els.exploreDescription.textContent =
    buildThemeDescription(
      theme
    );

  els.detailCount.textContent =
    theme.exhibits.length;

  els.exhibitsHeading.textContent =
    `${theme.exhibits.length} Exhibits`;

  els.exhibitsSubheading.textContent =
    "Choose an exhibit to explore its learning objective and visitor interaction.";
}

/* ============================================================
   THEME DESCRIPTIONS
   ============================================================ */

function buildThemeDescription(
  theme
) {
  const descriptions = {
    "Space & Universe":
      "Trace the universe from cosmic scale and origins to planetary exploration and humanity's interplanetary future.",

    "Physics & Technology":
      "Experiment with fundamental physical principles and see how they become the foundation for technology and intelligent machines.",

    "Human Body & Life":
      "Move inward from the whole human body to organs, cells and molecular information.",

    "Earth, Climate & Environment":
      "Explore interconnected Earth systems, environmental pressures, climate dynamics and practical responses.",

    "Agriculture, Food & Future":
      "Discover how biology, farming technology and resource management can shape the future of food production."
  };

  return (
    descriptions[theme.theme] ||
    `Explore ${theme.exhibits.length} exhibits within the ${theme.theme} theme.`
  );
}

/* ============================================================
   ACTIVE THEME
   ============================================================ */

function updateActiveThemeButton() {
  document
    .querySelectorAll(
      "[data-theme-button]"
    )
    .forEach((button) => {
      const active =
        String(
          button.dataset
            .themeButton
        ) ===
        String(
          state.selectedFloor
        );

      button.classList.toggle(
        "active",
        active
      );
    });
}

/* ============================================================
   CURRENT THEME
   ============================================================ */

function getCurrentTheme() {
  if (!state.data) {
    return null;
  }

  return (
    state.data.themes.find(
      (theme) =>
        String(
          theme.floor_no
        ) ===
        String(
          state.selectedFloor
        )
    ) || null
  );
}

/* ============================================================
   SEARCH
   ============================================================ */

function getFilteredExhibits() {
  const theme =
    getCurrentTheme();

  if (!theme) {
    return [];
  }

  if (!state.searchTerm) {
    return theme.exhibits;
  }

  return theme.exhibits.filter(
    (exhibit) => {
      const searchableText = [
        exhibit.exhibit_no,
        exhibit.title,
        exhibit.type,
        exhibit.description,
        exhibit.learning,
        exhibit.visual_concept,
        exhibit.media,
        exhibit.interaction,
        exhibit.visual_assets_needed
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        state.searchTerm
      );
    }
  );
}

/* ============================================================
   RENDER EXHIBITS
   ============================================================ */

function renderExhibits() {
  if (!state.data) {
    return;
  }

  const theme =
    getCurrentTheme();

  if (!theme) {
    els.exhibitGrid.innerHTML = `
      <div class="empty-state">
        Select a theme to begin exploring.
      </div>
    `;

    return;
  }

  const exhibits =
    getFilteredExhibits();

  if (!exhibits.length) {
    els.exhibitGrid.innerHTML = `
      <div class="empty-state">
        No exhibits match
        <strong>
          ${escapeHtml(
            state.searchTerm
          )}
        </strong>.
        <br />
        Try another search term.
      </div>
    `;

    return;
  }

  /*
   * Render the exhibit cards.
   *
   * IMPORTANT:
   * data-exhibit-card-index makes the WHOLE CARD
   * clickable.
   */
  els.exhibitGrid.innerHTML =
    exhibits
      .map(
        (exhibit, index) => {
          const interactive =
            String(
              exhibit.type || ""
            )
              .toLowerCase()
              .includes(
                "interactive"
              );

          return `
            <article
              class="exhibit-card"
              data-exhibit-card-index="${index}"
              tabindex="0"
              role="button"
              aria-label="View details for ${escapeAttr(
                exhibit.title
              )}"
            >

              <div class="exhibit-topline">

                <span class="exhibit-no">
                  EXHIBIT
                  ${escapeHtml(
                    exhibit.exhibit_no
                  )}
                </span>

                <span class="tag">
                  ${
                    interactive
                      ? "Interactive"
                      : "Exhibit"
                  }
                </span>

              </div>

              <h3>
                ${escapeHtml(
                  exhibit.title
                )}
              </h3>

              <p>
                ${escapeHtml(
                  truncate(
                    exhibit.description,
                    170
                  )
                )}
              </p>

              <p class="exhibit-learn">
                ${escapeHtml(
                  truncate(
                    exhibit.learning,
                    150
                  )
                )}
              </p>

              <button
                class="exhibit-open-btn"
                type="button"
                data-exhibit-index="${index}"
              >
                View exhibit details →
              </button>

            </article>
          `;
        }
      )
      .join("");
}

/* ============================================================
   EXHIBIT DETAIL MODAL
   ============================================================ */

function openExhibitModal(
  exhibit
) {
  const theme =
    getCurrentTheme();

  if (!theme) {
    return;
  }

  state.selectedExhibit =
    exhibit;

  els.modalFloor.textContent =
    `FLOOR ${formatFloor(
      theme.floor_no
    )}`;

  els.modalTitle.textContent =
    exhibit.title;

  els.modalTheme.textContent =
    theme.theme;

  els.modalDescription.textContent =
    exhibit.description ||
    "No description provided.";

  els.modalLearning.textContent =
    exhibit.learning ||
    "No learning objective provided.";

  els.modalInteraction.textContent =
    exhibit.interaction ||
    "No visitor interaction information provided.";

  els.modalType.textContent =
    exhibit.type ||
    "Exhibit";

  els.modalMedia.textContent =
    exhibit.media ||
    "Media not specified";

  els.exhibitModal.hidden =
    false;

  document.body.style.overflow =
    "hidden";

  requestAnimationFrame(
    () => {
      if (els.closeModalBtn) {
        els.closeModalBtn.focus();
      }
    }
  );
}

function closeExhibitModal() {
  if (!els.exhibitModal) {
    return;
  }

  els.exhibitModal.hidden =
    true;

  state.selectedExhibit =
    null;

  document.body.style.overflow =
    "";
}

/* ============================================================
   VIEW NAVIGATION
   ============================================================ */

function showView(
  viewName
) {
  const views = {
    home: els.homeView,
    explore: els.exploreView,
    about: els.aboutView
  };

  if (!views[viewName]) {
    return;
  }

  state.currentView =
    viewName;

  Object.entries(views)
    .forEach(
      ([name, view]) => {
        const active =
          name === viewName;

        view.classList.toggle(
          "active-view",
          active
        );

        view.hidden =
          !active;
      }
    );

  els.navLinks.forEach(
    (button) => {
      const active =
        button.dataset.nav ===
          viewName ||
        (
          viewName ===
            "explore" &&
          button.dataset.nav ===
            "themes"
        );

      button.classList.toggle(
        "active",
        active
      );
    }
  );

  if (
    viewName ===
      "explore" &&
    state.data
  ) {
    const theme =
      getCurrentTheme();

    if (theme) {
      updateExploreHeader(
        theme
      );

      updateActiveThemeButton();

      renderExhibits();
    }
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

function formatFloor(
  value
) {
  const numeric =
    Number(value);

  if (
    Number.isFinite(numeric)
  ) {
    return String(
      Math.trunc(numeric)
    );
  }

  return String(value)
    .replace(
      /\.0$/,
      ""
    );
}

function truncate(
  value,
  maxLength
) {
  const text =
    String(value || "")
      .trim();

  if (
    text.length <=
    maxLength
  ) {
    return text;
  }

  return `${text
    .slice(0, maxLength - 1)
    .trimEnd()}…`;
}

function escapeHtml(
  value
) {
  return String(
    value ?? ""
  )
    .replaceAll(
      "&",
      "&amp;"
    )
    .replaceAll(
      "<",
      "&lt;"
    )
    .replaceAll(
      ">",
      "&gt;"
    )
    .replaceAll(
      '"',
      "&quot;"
    )
    .replaceAll(
      "'",
      "&#039;"
    );
}

function escapeAttr(
  value
) {
  return escapeHtml(
    value
  ).replaceAll(
    "`",
    "&#096;"
  );
}