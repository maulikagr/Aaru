/**
 * Aaru - Genshin Impact Build & Damage Explorer Controller
 * Manages search, recently checked accounts (localStorage), and table rendering
 */

const STORAGE_KEY = "enkaViewer_recentProfiles";

// Server region from UID prefix
function getServerRegion(uid) {
  const prefix = String(uid).charAt(0);
  switch (prefix) {
    case "6": return { code: "NA", cls: "server-na" };
    case "7": return { code: "EU", cls: "server-eu" };
    case "8": return { code: "Asia", cls: "server-asia" };
    case "9": return { code: "SAR", cls: "server-sar" };
    case "1": case "2": return { code: "CN", cls: "server-asia" };
    case "5": return { code: "CN", cls: "server-asia" };
    default: return { code: "??", cls: "server-na" };
  }
}

// AR badge color class
function getArClass(level) {
  if (level >= 60) return "ar-60";
  if (level >= 55) return "ar-high";
  return "ar-mid";
}

// Relative time string
function timeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  if (days < 365) return `${days} day${days !== 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) !== 1 ? "s" : ""} ago`;
}

// Load recent profiles from localStorage
function loadRecentProfiles() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save recent profiles to localStorage
function saveRecentProfiles(profiles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

// Delete a profile from recent list
function deleteProfile(uid) {
  let profiles = loadRecentProfiles();
  profiles = profiles.filter(p => p.uid !== uid);
  saveRecentProfiles(profiles);
  renderTable();
}

// Render the accounts table
function renderTable() {
  const profiles = loadRecentProfiles();
  const tbody = document.getElementById("accounts-tbody");
  const emptyState = document.getElementById("empty-state");
  const pageInfo = document.getElementById("page-info");

  if (profiles.length === 0) {
    tbody.innerHTML = "";
    emptyState.classList.remove("hidden");
    pageInfo.classList.add("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  pageInfo.classList.remove("hidden");
  pageInfo.textContent = `1-${profiles.length} of ${profiles.length}`;

  // Sort by lastChecked descending (most recent first), then by achievements
  profiles.sort((a, b) => (b.lastChecked || 0) - (a.lastChecked || 0));

  tbody.innerHTML = "";
  profiles.forEach((p, idx) => {
    const server = getServerRegion(p.uid);
    const arClass = getArClass(p.level || 0);
    const tr = document.createElement("tr");
    tr.onclick = (e) => {
      // Don't navigate if they clicked the delete button
      if (e.target.closest(".btn-delete")) return;
      window.location.href = `/profile/${p.uid}`;
    };

    // Stygian display
    let stygianHtml = "-";
    if (p.stygianSeconds && p.stygianSeconds > 0) {
      stygianHtml = `<span class="stat-stygian">⏱ ${p.stygianSeconds}s</span>`;
    }

    // Abyss display
    let abyssHtml = "-";
    if (p.towerFloor && p.towerFloor > 0) {
      const abyssStars = p.towerStar || 0;
      abyssHtml = `<span class="stat-abyss">⭐ ${p.towerFloor} / ${abyssStars}</span>`;
    } else if (p.abyss && p.abyss !== "Not Cleared") {
      abyssHtml = `<span class="stat-abyss">⭐ ${p.abyss}</span>`;
    }

    // Theater display
    let theaterHtml = "-";
    if (p.theaterAct && p.theaterAct > 0) {
      const tStar = p.theaterStar || 0;
      theaterHtml = `<span class="stat-theater">🎭 ${p.theaterAct}</span> <span class="stat-theater" style="margin-left:4px">⭐ ${tStar}</span>`;
    }

    tr.innerHTML = `
      <td class="text-slate-500 font-mono text-xs">${idx + 1}</td>
      <td>
        <div class="nickname-cell">
          <span class="server-badge ${server.cls}">${server.code}</span>
          <img src="${p.profileIconUrl || ''}" alt="" class="nickname-avatar" onerror="this.style.display='none'" />
          <span class="font-medium text-white">${escapeHtml(p.nickname || "Traveler")}</span>
        </div>
      </td>
      <td class="text-slate-400 truncate max-w-[200px]">${escapeHtml(p.signature || "")}</td>
      <td><span class="ar-badge ${arClass}">AR${p.level || "?"}</span></td>
      <td class="text-right">
        <span class="stat-trophy font-mono font-semibold">🏆 ${(p.achievements || 0).toLocaleString()}</span>
      </td>
      <td>${stygianHtml}</td>
      <td>${abyssHtml}</td>
      <td>${theaterHtml}</td>
      <td class="text-right text-xs text-slate-500">${timeAgo(p.lastChecked || 0)}</td>
      <td>
        <button class="btn-delete" onclick="event.stopPropagation(); deleteProfile('${p.uid}')" title="Remove">
          <i data-lucide="x" class="w-3.5 h-3.5"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  if (window.lucide) lucide.createIcons();
}

// HTML escape helper
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Navigate to profile
function goToProfile(uid) {
  const cleaned = uid.trim();
  if (!cleaned) return;
  window.location.href = `/profile/${cleaned}`;
}

let homeNavSketchTabs = null;

// Tab Switching
function switchHomeTab(tabName) {
  const tabShowcase = document.getElementById("tab-home-showcase");
  const tabDamageCalc = document.getElementById("tab-home-damage-calc");
  const contentShowcase = document.getElementById("home-content-showcase");
  const contentDamageCalc = document.getElementById("home-content-damage-calc");

  if (tabName === "damage-calc") {
    if (tabShowcase) tabShowcase.classList.remove("active");
    if (tabDamageCalc) tabDamageCalc.classList.add("active");
    if (contentShowcase) contentShowcase.classList.add("hidden");
    if (contentDamageCalc) contentDamageCalc.classList.remove("hidden");
    initHomeTeamBuilder();
  } else {
    if (tabDamageCalc) tabDamageCalc.classList.remove("active");
    if (tabShowcase) tabShowcase.classList.add("active");
    if (contentDamageCalc) contentDamageCalc.classList.add("hidden");
    if (contentShowcase) contentShowcase.classList.remove("hidden");
  }

  if (homeNavSketchTabs) {
    homeNavSketchTabs.activate(tabName);
  }
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();

  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        goToProfile(searchInput.value);
      }
    });
  }

  // Initialize main navigation sketch tabs
  const navContainer = document.getElementById("home-main-tabs");
  if (navContainer && window.SketchTabs) {
    homeNavSketchTabs = window.SketchTabs.init(navContainer, {
      strokeColor: "#f59e0b",
      roughness: 1.4,
      onTabChange: (tabName) => {
        switchHomeTab(tabName);
      }
    });
  }

  // Initialize sketch demo tabs if present
  const demoTabsContainer = document.getElementById("sketch-demo-tabs");
  if (demoTabsContainer && window.SketchTabs) {
    window.SketchTabs.init(demoTabsContainer, {
      strokeColor: "#f59e0b",
      roughness: 1.5
    });
  }

  // Check if damage-calc tab should be active initially
  if (window.__ACTIVE_TAB__ === "damage_calc" || window.location.hash === "#damage-calc") {
    switchHomeTab("damage-calc");
  }

  // Render table from localStorage
  renderTable();
});

// ==========================================
// HOME PAGE 4-SLOT DRAG & DROP TEAM BUILDER
// ==========================================

const homeState = {
  characters: [],
  team: [null, null, null, null],
  activeUid: null,
  activeFilter: "all"
};

const HOME_ELEMENT_COLORS = {
  Pyro: "#ef4444", Hydro: "#06b6d4", Cryo: "#38bdf8", Electro: "#a855f7",
  Dendro: "#10b981", Anemo: "#14b8a6", Geo: "#eab308"
};

const HOME_ELEMENT_CLASSES = {
  Pyro: "elem-pyro", Hydro: "elem-hydro", Cryo: "elem-cryo", Electro: "elem-electro",
  Dendro: "elem-dendro", Anemo: "elem-anemo", Geo: "elem-geo"
};

function initHomeTeamBuilder() {
  const profiles = loadRecentProfiles();
  const notice = document.getElementById("home-no-chars-notice");
  const slotsContainer = document.getElementById("home-team-slots-container");
  const poolGrid = document.getElementById("home-character-pool-grid");

  if (!slotsContainer || !poolGrid) return;

  if (profiles.length === 0) {
    if (notice) notice.classList.remove("hidden");
    slotsContainer.innerHTML = "";
    poolGrid.innerHTML = "";
    return;
  }

  const latestUid = profiles[0].uid;
  homeState.activeUid = latestUid;

  // Setup Element Filter Buttons
  const filterBar = document.getElementById("home-element-filter-bar");
  if (filterBar) {
    filterBar.querySelectorAll(".elem-filter-btn").forEach(btn => {
      btn.onclick = () => {
        filterBar.querySelectorAll(".elem-filter-btn").forEach(b => {
          b.classList.remove("active", "bg-amber-500/20", "text-amber-300", "border-amber-500/40");
          b.classList.add("text-slate-400");
        });
        btn.classList.add("active", "bg-amber-500/20", "text-amber-300", "border-amber-500/40");
        btn.classList.remove("text-slate-400");
        homeState.activeFilter = btn.getAttribute("data-element") || "all";
        renderHomeCharacterPool();
      };
    });
  }

  // Setup Clear Team Button
  const clearBtn = document.getElementById("home-btn-clear-team");
  if (clearBtn) {
    clearBtn.onclick = () => {
      homeState.team = [null, null, null, null];
      saveHomeActiveTeam();
      renderHomeTeamSlots();
      renderHomeCharacterPool();
    };
  }

  let cachedData = null;
  try {
    const raw = localStorage.getItem("enka_profile_data_" + latestUid);
    if (raw) cachedData = JSON.parse(raw);
  } catch(e) {}

  if (cachedData && cachedData.characters && cachedData.characters.length > 0) {
    if (notice) notice.classList.add("hidden");
    setupHomeCharacters(cachedData.characters, latestUid);
  } else {
    fetch("/api/player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid: latestUid })
    }).then(res => res.json()).then(data => {
      if (data.success && data.characters && data.characters.length > 0) {
        try { localStorage.setItem("enka_profile_data_" + latestUid, JSON.stringify(data)); } catch(e) {}
        if (notice) notice.classList.add("hidden");
        setupHomeCharacters(data.characters, latestUid);
      } else {
        if (notice) notice.classList.remove("hidden");
      }
    }).catch(() => {
      if (notice) notice.classList.remove("hidden");
    });
  }
}

function setupHomeCharacters(characters, uid) {
  homeState.characters = characters;
  homeState.team = [null, null, null, null];

  try {
    const saved = localStorage.getItem("enka_team_" + uid);
    if (saved) {
      const savedIds = JSON.parse(saved);
      savedIds.forEach((id, idx) => {
        if (idx < 4 && id) {
          const found = characters.find(c => String(c.avatarId) === String(id));
          if (found) homeState.team[idx] = found;
        }
      });
    }
  } catch(e) {}

  renderHomeTeamSlots();
  renderHomeCharacterPool();
}

function saveHomeActiveTeam() {
  if (!homeState.activeUid) return;
  try {
    const ids = homeState.team.map(c => c ? c.avatarId : null);
    localStorage.setItem("enka_team_" + homeState.activeUid, JSON.stringify(ids));
  } catch(e) {}
}

function renderHomeTeamSlots() {
  const container = document.getElementById("home-team-slots-container");
  if (!container) return;
  container.innerHTML = "";

  let filledCount = 0;

  for (let i = 0; i < 4; i++) {
    const char = homeState.team[i];
    const slotEl = document.createElement("div");
    slotEl.dataset.slotIndex = i;

    if (char) {
      filledCount++;
      const elemColor = HOME_ELEMENT_COLORS[char.element] || "#fff";
      const elemClass = HOME_ELEMENT_CLASSES[char.element] || "elem-pyro";

      slotEl.className = "team-slot slot-drop-target filled rounded-2xl border border-slate-700/80 p-4 min-h-[250px] flex flex-col justify-between relative group transition cursor-grab active:cursor-grabbing overflow-hidden";
      slotEl.draggable = true;
      slotEl.style.background = `linear-gradient(145deg, rgba(15,23,42,0.95), ${elemColor}15)`;
      slotEl.style.borderColor = `${elemColor}50`;

      slotEl.innerHTML = `
        <div class="flex items-center justify-between relative z-10">
          <span class="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700/80 text-[10px] font-mono font-bold text-amber-400">
            Slot ${i + 1}
          </span>
          <button class="btn-remove-slot p-1 rounded-lg bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition active:scale-90" title="Remove from slot" data-slot-index="${i}">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <div class="flex flex-col items-center text-center my-2 relative z-10">
          <div class="relative w-16 h-16 rounded-full overflow-hidden bg-slate-950 border-2 mb-2 transition group-hover:scale-105" style="border-color: ${elemColor}; box-shadow: 0 0 16px ${elemColor}40">
            <img src="${char.iconUrl}" alt="${char.name}" class="w-full h-full object-cover scale-110" onerror="this.src='https://enka.network/ui/UI_AvatarIcon_Side_PlayerBoy.png'" />
            <span class="absolute bottom-0 right-0 px-1 rounded-tl bg-slate-900/95 text-amber-400 font-bold text-[9px] font-mono">
              C${char.constellation || 0}
            </span>
          </div>
          <div class="font-bold text-white text-sm tracking-tight truncate max-w-[150px]">${char.name}</div>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${elemClass}">${char.element}</span>
            <span class="text-[10px] text-slate-400 font-mono">Lv. ${char.level}</span>
          </div>
        </div>

        <div class="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 text-[10px] space-y-1 relative z-10 font-mono">
          <div class="flex items-center gap-1.5 truncate">
            <img src="${char.weapon?.iconUrl || ''}" class="w-4 h-4 rounded object-cover bg-slate-900 shrink-0" onerror="this.style.display='none'" />
            <span class="text-slate-300 truncate text-[10px]">${char.weapon?.name || 'Weapon'}</span>
            <span class="text-amber-400 font-bold ml-auto shrink-0">R${char.weapon?.refinement || 1}</span>
          </div>
          <div class="text-emerald-400 truncate text-[9px] font-sans">
            ${char.setBonuses?.[0] || 'No Set Bonus'}
          </div>
        </div>
      `;

      slotEl.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({
          type: "slot",
          fromIndex: i,
          avatarId: char.avatarId
        }));
        e.dataTransfer.effectAllowed = "move";
        slotEl.classList.add("dragging");
      });

      slotEl.addEventListener("dragend", () => {
        slotEl.classList.remove("dragging");
        document.querySelectorAll(".slot-drop-target").forEach(s => s.classList.remove("drag-over"));
      });

      const removeBtn = slotEl.querySelector(".btn-remove-slot");
      if (removeBtn) {
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          homeState.team[i] = null;
          saveHomeActiveTeam();
          renderHomeTeamSlots();
          renderHomeCharacterPool();
        };
      }

    } else {
      slotEl.className = "team-slot slot-drop-target rounded-2xl border-2 border-dashed border-slate-700/80 bg-slate-950/40 p-5 min-h-[250px] flex flex-col items-center justify-center text-center relative group transition cursor-pointer hover:border-slate-600 hover:bg-slate-950/60";
      slotEl.innerHTML = `
        <div class="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono font-bold text-slate-400">
          Slot ${i + 1}
        </div>
        <div class="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-amber-400 group-hover:border-amber-400/40 transition mb-3">
          <i data-lucide="user-plus" class="w-6 h-6"></i>
        </div>
        <div class="text-xs font-bold text-slate-300">Slot ${i + 1} Empty</div>
        <div class="text-[11px] text-slate-500 mt-1">Drag character here</div>
      `;
    }

    slotEl.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      slotEl.classList.add("drag-over");
    });

    slotEl.addEventListener("dragenter", (e) => {
      e.preventDefault();
      slotEl.classList.add("drag-over");
    });

    slotEl.addEventListener("dragleave", (e) => {
      if (!slotEl.contains(e.relatedTarget)) {
        slotEl.classList.remove("drag-over");
      }
    });

    slotEl.addEventListener("drop", (e) => {
      e.preventDefault();
      slotEl.classList.remove("drag-over");
      const raw = e.dataTransfer.getData("text/plain");
      if (!raw) return;

      try {
        const payload = JSON.parse(raw);
        handleHomeDrop(payload, i);
      } catch(err) {}
    });

    container.appendChild(slotEl);
  }

  const countBadge = document.getElementById("home-team-count");
  if (countBadge) countBadge.textContent = filledCount;

  calculateHomeResonances();
  if (window.lucide) lucide.createIcons();
}

function handleHomeDrop(payload, targetIndex) {
  const avatarId = payload.avatarId;
  const targetChar = homeState.characters.find(c => String(c.avatarId) === String(avatarId));
  if (!targetChar) return;

  if (payload.type === "slot") {
    const fromIndex = payload.fromIndex;
    if (fromIndex === targetIndex) return;
    const temp = homeState.team[targetIndex];
    homeState.team[targetIndex] = homeState.team[fromIndex];
    homeState.team[fromIndex] = temp;
  } else {
    const existingIndex = homeState.team.findIndex(c => c && String(c.avatarId) === String(avatarId));
    if (existingIndex !== -1) {
      if (existingIndex === targetIndex) return;
      const temp = homeState.team[targetIndex];
      homeState.team[targetIndex] = targetChar;
      homeState.team[existingIndex] = temp;
    } else {
      homeState.team[targetIndex] = targetChar;
    }
  }

  saveHomeActiveTeam();
  renderHomeTeamSlots();
  renderHomeCharacterPool();
}

function renderHomeCharacterPool() {
  const grid = document.getElementById("home-character-pool-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const filter = homeState.activeFilter || "all";
  const filtered = homeState.characters.filter(c => {
    if (filter === "all") return true;
    return c.element && c.element.toLowerCase() === filter.toLowerCase();
  });

  const poolCount = document.getElementById("home-pool-count");
  if (poolCount) poolCount.textContent = `${filtered.length} Characters`;

  filtered.forEach(char => {
    const teamSlotIdx = homeState.team.findIndex(c => c && String(c.avatarId) === String(char.avatarId));
    const isInTeam = teamSlotIdx !== -1;
    const elemColor = HOME_ELEMENT_COLORS[char.element] || "#fff";
    const elemClass = HOME_ELEMENT_CLASSES[char.element] || "elem-pyro";

    const card = document.createElement("div");
    card.className = `draggable-char-card relative rounded-xl bg-slate-950/70 border border-slate-800 p-2.5 flex flex-col items-center text-center gap-1.5 transition ${isInTeam ? 'in-team border-emerald-500/40 bg-emerald-950/15' : 'hover:border-slate-700'}`;
    card.draggable = true;
    card.dataset.avatarId = char.avatarId;

    card.innerHTML = `
      ${isInTeam ? `<span class="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold font-mono">Slot ${teamSlotIdx + 1}</span>` : ''}
      <div class="relative w-12 h-12 rounded-full overflow-hidden bg-slate-900 border-2 mt-1" style="border-color: ${elemColor}">
        <img src="${char.iconUrl}" alt="${char.name}" class="w-full h-full object-cover scale-110" onerror="this.src='https://enka.network/ui/UI_AvatarIcon_Side_PlayerBoy.png'" />
        <span class="absolute bottom-0 right-0 px-1 rounded-tl bg-slate-900/90 text-amber-400 font-bold text-[9px] font-mono">
          C${char.constellation || 0}
        </span>
      </div>
      <span class="text-xs font-bold text-white truncate max-w-[100px]">${char.name}</span>
      <div class="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
        <span class="${elemClass} px-1 rounded text-[8px] font-bold uppercase">${char.element}</span>
        <span>Lv. ${char.level}</span>
      </div>
      <div class="text-[9px] text-slate-400 truncate max-w-[100px] border-t border-slate-800/80 pt-1 w-full text-center">
        ${char.weapon?.name || 'Weapon'}
      </div>
    `;

    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", JSON.stringify({
        type: "pool",
        avatarId: char.avatarId
      }));
      e.dataTransfer.effectAllowed = "move";
      card.classList.add("dragging");
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      document.querySelectorAll(".slot-drop-target").forEach(s => s.classList.remove("drag-over"));
    });

    card.addEventListener("click", () => {
      if (isInTeam) {
        homeState.team[teamSlotIdx] = null;
      } else {
        const emptyIdx = homeState.team.findIndex(s => s === null);
        if (emptyIdx !== -1) {
          homeState.team[emptyIdx] = char;
        } else {
          homeState.team[0] = char;
        }
      }
      saveHomeActiveTeam();
      renderHomeTeamSlots();
      renderHomeCharacterPool();
    });

    grid.appendChild(card);
  });
}

function calculateHomeResonances() {
  const container = document.getElementById("home-team-resonance-container");
  if (!container) return;
  container.innerHTML = "";

  const filledChars = homeState.team.filter(Boolean);
  if (filledChars.length < 2) {
    container.classList.add("hidden");
    return;
  }

  const counts = {};
  filledChars.forEach(c => {
    if (c.element) counts[c.element] = (counts[c.element] || 0) + 1;
  });

  const RESONANCES = {
    Pyro: { name: "Fervent Flames", desc: "ATK +25%", icon: "flame", cls: "text-rose-400 border-rose-500/30 bg-rose-950/30" },
    Hydro: { name: "Soothing Water", desc: "Max HP +25%", icon: "droplets", cls: "text-cyan-400 border-cyan-500/30 bg-cyan-950/30" },
    Cryo: { name: "Shattering Ice", desc: "CRIT Rate +15% vs Frozen/Cryo", icon: "snowflake", cls: "text-sky-300 border-sky-500/30 bg-sky-950/30" },
    Electro: { name: "High Voltage", desc: "Reactions generate Electro particles", icon: "zap", cls: "text-purple-400 border-purple-500/30 bg-purple-950/30" },
    Anemo: { name: "Impetuous Winds", desc: "Stamina -15%, Movement SPD +10%, Skill CD -5%", icon: "wind", cls: "text-teal-300 border-teal-500/30 bg-teal-950/30" },
    Geo: { name: "Enduring Rock", desc: "Shield +15%, DMG +15% when shielded", icon: "mountain", cls: "text-amber-400 border-amber-500/30 bg-amber-950/30" },
    Dendro: { name: "Sprawling Greenery", desc: "EM +50 (+50 on reactions)", icon: "leaf", cls: "text-emerald-400 border-emerald-500/30 bg-emerald-950/30" }
  };

  const activeResonances = [];
  Object.keys(counts).forEach(elem => {
    if (counts[elem] >= 2 && RESONANCES[elem]) {
      activeResonances.push(RESONANCES[elem]);
    }
  });

  if (filledChars.length === 4 && Object.keys(counts).length === 4) {
    activeResonances.push({
      name: "Protective Canopy",
      desc: "All Elemental RES +15%, Physical RES +15%",
      icon: "shield",
      cls: "text-indigo-300 border-indigo-500/30 bg-indigo-950/30"
    });
  }

  if (activeResonances.length === 0) {
    container.classList.add("hidden");
    return;
  }

  container.classList.remove("hidden");
  activeResonances.forEach(res => {
    const badge = document.createElement("div");
    badge.className = `flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-medium ${res.cls}`;
    badge.innerHTML = `
      <i data-lucide="${res.icon}" class="w-3.5 h-3.5"></i>
      <span class="font-bold">${res.name}:</span>
      <span class="text-slate-300 text-[11px]">${res.desc}</span>
    `;
    container.appendChild(badge);
  });
}

