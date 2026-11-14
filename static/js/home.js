/**
 * Genshin Impact Enka Viewer - Homepage Controller
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
  } else {
    if (tabDamageCalc) tabDamageCalc.classList.remove("active");
    if (tabShowcase) tabShowcase.classList.add("active");
    if (contentDamageCalc) contentDamageCalc.classList.add("hidden");
    if (contentShowcase) contentShowcase.classList.remove("hidden");
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

  // Tab listeners
  const tabShowcase = document.getElementById("tab-home-showcase");
  const tabDamageCalc = document.getElementById("tab-home-damage-calc");
  if (tabShowcase) tabShowcase.addEventListener("click", () => switchHomeTab("showcase"));
  if (tabDamageCalc) tabDamageCalc.addEventListener("click", () => switchHomeTab("damage-calc"));

  // Check if damage-calc tab should be active initially
  if (window.__ACTIVE_TAB__ === "damage_calc" || window.location.hash === "#damage-calc") {
    switchHomeTab("damage-calc");
  }

  // Render table from localStorage
  renderTable();
});
