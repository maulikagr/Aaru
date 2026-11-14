/**
 * Genshin Impact Enka Profile Viewer
 * Frontend Application Controller
 */

// Application State
const state = {
  player: null,
  characters: [],
  selectedCharIndex: 0,
  team: [null, null, null, null],
  activeElementFilter: "all"
};

// Element Colors
const ELEMENT_COLORS = {
  Pyro: "#ef4444",
  Hydro: "#06b6d4",
  Cryo: "#38bdf8",
  Electro: "#a855f7",
  Dendro: "#10b981",
  Anemo: "#14b8a6",
  Geo: "#eab308"
};

const ELEMENT_CLASSES = {
  Pyro: "elem-pyro",
  Hydro: "elem-hydro",
  Cryo: "elem-cryo",
  Electro: "elem-electro",
  Dendro: "elem-dendro",
  Anemo: "elem-anemo",
  Geo: "elem-geo"
};

const RECENT_PROFILES_KEY = "enkaViewer_recentProfiles";

// DOM References
const el = {
  inputUid: document.getElementById("input-uid"),
  btnFetch: document.getElementById("btn-fetch"),
  // Status Banner
  statusBanner: document.getElementById("status-banner"),
  statusIcon: document.getElementById("status-icon"),
  statusTitle: document.getElementById("status-title"),
  statusMessage: document.getElementById("status-message"),
  btnCloseStatus: document.getElementById("btn-close-status"),
  // Player Profile
  playerProfileSection: document.getElementById("player-profile-section"),
  playerAvatar: document.getElementById("player-avatar"),
  playerArBadge: document.getElementById("player-ar-badge"),
  playerNickname: document.getElementById("player-nickname"),
  playerWl: document.getElementById("player-wl"),
  playerSignature: document.getElementById("player-signature"),
  playerUidDisplay: document.getElementById("player-uid-display"),
  playerAchievements: document.getElementById("player-achievements"),
  playerAbyss: document.getElementById("player-abyss"),
  playerCharsCount: document.getElementById("player-chars-count"),
  // Character Tabs
  characterTabsSection: document.getElementById("character-tabs-section"),
  characterTabsContainer: document.getElementById("character-tabs-container"),
  // Enka Build Card
  enkaCardSection: document.getElementById("enka-card-section"),
  enkaCard: document.getElementById("enka-card"),
  cardElementGlow: document.getElementById("card-element-glow"),
  charElementPill: document.getElementById("char-element-pill"),
  charLevelBadge: document.getElementById("char-level-badge"),
  charFriendship: document.getElementById("char-friendship"),
  charName: document.getElementById("char-name"),
  charSplash: document.getElementById("char-splash"),
  charConstellations: document.getElementById("char-constellations"),
  charTalentsContainer: document.getElementById("char-talents-container"),
  // Combat Stats
  statHpTotal: document.getElementById("stat-hp-total"),
  statHpSub: document.getElementById("stat-hp-sub"),
  statAtkTotal: document.getElementById("stat-atk-total"),
  statAtkSub: document.getElementById("stat-atk-sub"),
  statDefTotal: document.getElementById("stat-def-total"),
  statDefSub: document.getElementById("stat-def-sub"),
  statEm: document.getElementById("stat-em"),
  statCritRate: document.getElementById("stat-crit-rate"),
  statCritDmg: document.getElementById("stat-crit-dmg"),
  statEr: document.getElementById("stat-er"),
  statDmgLabel: document.getElementById("stat-dmg-label"),
  statDmgVal: document.getElementById("stat-dmg-val"),
  // Weapon
  weaponIcon: document.getElementById("weapon-icon"),
  weaponName: document.getElementById("weapon-name"),
  weaponRefine: document.getElementById("weapon-refine"),
  weaponLevel: document.getElementById("weapon-level"),
  weaponBaseAtk: document.getElementById("weapon-base-atk"),
  weaponSubstat: document.getElementById("weapon-substat"),
  // Artifacts & Sets
  setBonusesContainer: document.getElementById("set-bonuses-container"),
  artifactsList: document.getElementById("artifacts-list"),
  // Main View Tabs (Showcase vs Damage Calc)
  headerTabShowcase: document.getElementById("header-tab-showcase"),
  headerTabDamageCalc: document.getElementById("header-tab-damage-calc"),
  profileViewTabs: document.getElementById("profile-view-tabs"),
  profileTabShowcase: document.getElementById("profile-tab-showcase"),
  profileTabDamageCalc: document.getElementById("profile-tab-damage-calc"),
  profileContentShowcase: document.getElementById("profile-content-showcase"),
  profileContentDamageCalc: document.getElementById("profile-content-damage-calc"),
  // Team Builder (Drag and Drop)
  teamSlotsContainer: document.getElementById("team-slots-container"),
  characterPoolGrid: document.getElementById("character-pool-grid"),
  teamCount: document.getElementById("team-count"),
  poolCount: document.getElementById("pool-count"),
  btnClearTeam: document.getElementById("btn-clear-team"),
  teamResonanceContainer: document.getElementById("team-resonance-container"),
  elementFilterBar: document.getElementById("element-filter-bar"),
  // DPS Calculation
  btnCalcDps: document.getElementById("btn-calc-dps"),
  dpsResultsSection: document.getElementById("dps-results-section"),
  dpsMetricTeamDps: document.getElementById("dps-metric-team-dps"),
  dpsMetricTotalDmg: document.getElementById("dps-metric-total-dmg"),
  dpsMetricDuration: document.getElementById("dps-metric-duration"),
  dpsTargetRes: document.getElementById("dps-target-res"),
  dpsShareBar: document.getElementById("dps-share-bar"),
  dpsShareLegend: document.getElementById("dps-share-legend"),
  rotationStepsCount: document.getElementById("rotation-steps-count"),
  rotationTimelineContainer: document.getElementById("rotation-timeline-container"),
  characterBreakdownGrid: document.getElementById("character-breakdown-grid"),
  dpsActiveBuffsList: document.getElementById("dps-active-buffs-list"),
  dpsOptimizationBanner: document.getElementById("dps-optimization-banner")
};

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
  setupEventListeners();

  // Auto-fetch from URL if UID is provided via the route
  const urlUid = window.__PROFILE_UID__;
  if (urlUid && urlUid.trim()) {
    el.inputUid.value = urlUid.trim();
    fetchProfile(urlUid.trim());
  }
});

// Event Listeners
function setupEventListeners() {
  el.btnFetch.onclick = () => {
    const uid = el.inputUid.value.trim();
    if (uid) fetchProfile(uid);
  };

  el.inputUid.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const uid = el.inputUid.value.trim();
      if (uid) fetchProfile(uid);
    }
  });

  if (el.btnCloseStatus) {
    el.btnCloseStatus.onclick = () => hideStatusBanner();
  }

  // Initialize sketch tabs in profile header and page
  const headerTabsContainer = document.getElementById("header-main-tabs");
  if (headerTabsContainer && window.SketchTabs) {
    window.headerSketchTabs = window.SketchTabs.init(headerTabsContainer, {
      strokeColor: "#f59e0b",
      roughness: 1.3,
      onTabChange: (tabName) => switchTab(tabName)
    });
  }

  const profileTabsContainer = document.getElementById("profile-page-tabs");
  if (profileTabsContainer && window.SketchTabs) {
    window.profileSketchTabs = window.SketchTabs.init(profileTabsContainer, {
      strokeColor: "#f59e0b",
      roughness: 1.3,
      onTabChange: (tabName) => switchTab(tabName)
    });
  }

  // Tab switching listeners (both in header and on page)
  if (el.profileTabShowcase) el.profileTabShowcase.onclick = () => switchTab("showcase");
  if (el.profileTabDamageCalc) el.profileTabDamageCalc.onclick = () => switchTab("damage-calc");
  if (el.headerTabShowcase) el.headerTabShowcase.onclick = () => switchTab("showcase");
  if (el.headerTabDamageCalc) el.headerTabDamageCalc.onclick = () => switchTab("damage-calc");
}

// Switch between Showcase and Damage Calc tabs
function switchTab(tabName) {
  if (tabName === "damage-calc") {
    if (el.headerTabShowcase) el.headerTabShowcase.classList.remove("active");
    if (el.profileTabShowcase) el.profileTabShowcase.classList.remove("active");
    if (el.headerTabDamageCalc) el.headerTabDamageCalc.classList.add("active");
    if (el.profileTabDamageCalc) el.profileTabDamageCalc.classList.add("active");

    if (el.profileContentShowcase) el.profileContentShowcase.classList.add("hidden");
    if (el.profileContentDamageCalc) el.profileContentDamageCalc.classList.remove("hidden");

    if (state.characters.length > 0) {
      renderTeamSlots();
      renderCharacterPool();
    }
  } else {
    if (el.headerTabDamageCalc) el.headerTabDamageCalc.classList.remove("active");
    if (el.profileTabDamageCalc) el.profileTabDamageCalc.classList.remove("active");
    if (el.headerTabShowcase) el.headerTabShowcase.classList.add("active");
    if (el.profileTabShowcase) el.profileTabShowcase.classList.add("active");

    if (el.profileContentDamageCalc) el.profileContentDamageCalc.classList.add("hidden");
    if (el.profileContentShowcase) el.profileContentShowcase.classList.remove("hidden");
  }

  // Synchronize sketch underlines
  if (window.headerSketchTabs) window.headerSketchTabs.activate(tabName);
  if (window.profileSketchTabs) window.profileSketchTabs.activate(tabName);
}

// Save profile summary to localStorage for the homepage
function saveToRecentProfiles(uid, player) {
  try {
    let profiles = [];
    const stored = localStorage.getItem(RECENT_PROFILES_KEY);
    if (stored) profiles = JSON.parse(stored);

    // Remove existing entry for this UID
    profiles = profiles.filter(p => p.uid !== uid);

    // Add new entry at the front
    profiles.unshift({
      uid: uid,
      nickname: player.nickname || "Traveler",
      level: player.level || 0,
      worldLevel: player.worldLevel || 0,
      signature: player.signature || "",
      achievements: player.achievements || 0,
      profileIconUrl: player.profileIconUrl || "",
      abyss: player.abyss || "",
      towerFloor: player.towerFloor || 0,
      towerStar: player.towerStar || 0,
      stygianSeconds: player.stygianSeconds || 0,
      stygianIndex: player.stygianIndex || 0,
      theaterAct: player.theaterAct || 0,
      theaterMode: player.theaterMode || 0,
      theaterStar: player.theaterStar || 0,
      characterCount: player.characterCount || 0,
      lastChecked: Date.now()
    });

    // Keep only last 20 entries
    if (profiles.length > 20) profiles = profiles.slice(0, 20);

    localStorage.setItem(RECENT_PROFILES_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

// Fetch Profile from Backend
async function fetchProfile(uid) {
  el.btnFetch.disabled = true;
  el.btnFetch.innerHTML = `<i data-lucide="loader-2" class="w-4 h-4 animate-spin"></i> Fetching...`;
  if (window.lucide) lucide.createIcons();

  try {
    const res = await fetch("/api/player", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid })
    });
    const data = await res.json();

    if (data.success) {
      state.player = data.player || {};
      state.characters = data.characters || [];

      // Save to localStorage for homepage
      saveToRecentProfiles(uid, state.player);

      // Update the browser URL to match the UID
      if (window.location.pathname !== `/profile/${uid}`) {
        window.history.replaceState(null, "", `/profile/${uid}`);
      }

      // Render Player Banner
      renderPlayerProfile(state.player);

      if (data.status === "hidden_showcase") {
        showStatusBanner(
          "warning",
          `Account Found: ${state.player.nickname} (AR ${state.player.level})`,
          data.warning || "Your in-game Character Showcase details are private. In Genshin Impact: Paimon Menu ➔ Edit Profile ➔ toggle ON 'Show Character Details'."
        );
        el.characterTabsSection.classList.add("hidden");
        el.enkaCardSection.classList.add("hidden");
      } else {
        showStatusBanner(
          "success",
          `Profile Synced: ${state.player.nickname}`,
          data.message || `Successfully loaded ${state.characters.length} showcased characters!`
        );

        if (state.characters.length > 0) {
          state.selectedCharIndex = 0;
          renderCharacterTabs(state.characters);
          selectCharacter(0);
          el.characterTabsSection.classList.remove("hidden");
          el.enkaCardSection.classList.remove("hidden");

          // Initialize Team Builder
          initTeamBuilder();
          try {
            localStorage.setItem("enka_profile_data_" + uid, JSON.stringify(data));
          } catch (e) {}
        } else {
          el.characterTabsSection.classList.add("hidden");
          el.enkaCardSection.classList.add("hidden");
        }
      }
    } else {
      showStatusBanner("error", "Enka Query Failed", data.error || "Unable to fetch account profile.");
    }
  } catch (err) {
    console.error("Fetch profile error:", err);
    showStatusBanner("error", "Network Error", "Could not communicate with the application backend.");
  } finally {
    el.btnFetch.disabled = false;
    el.btnFetch.innerHTML = `<i data-lucide="cloud-download" class="w-4 h-4"></i> <span>Fetch Data</span>`;
    if (window.lucide) lucide.createIcons();
  }
}

// Render Player Profile Card
function renderPlayerProfile(player) {
  el.playerAvatar.src = player.profileIconUrl || "https://enka.network/ui/UI_AvatarIcon_Side_PlayerBoy.png";
  el.playerArBadge.textContent = `AR ${player.level || 60}`;
  el.playerNickname.textContent = player.nickname || "Traveler";
  el.playerWl.textContent = `WL ${player.worldLevel || 8}`;
  el.playerSignature.textContent = player.signature ? `"${player.signature}"` : `"No signature set."`;
  el.playerUidDisplay.textContent = player.uid || "";
  el.playerAchievements.textContent = (player.achievements || 0).toLocaleString();
  el.playerAbyss.textContent = player.abyss || "Floor 12";
  el.playerCharsCount.textContent = `${player.characterCount || 0} Chars`;

  el.playerProfileSection.classList.remove("hidden");
  if (el.profileViewTabs) el.profileViewTabs.classList.remove("hidden");
}

// Render Character Selector Tabs
function renderCharacterTabs(characters) {
  el.characterTabsContainer.innerHTML = "";

  characters.forEach((char, idx) => {
    const elemColor = ELEMENT_COLORS[char.element] || "#fff";
    const isActive = idx === state.selectedCharIndex;

    const btn = document.createElement("button");
    btn.className = `char-tab-btn flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-900 border ${isActive ? 'active border-amber-400' : 'border-slate-800'} transition shrink-0 hover:border-slate-700`;
    btn.style.minWidth = "76px";

    btn.onclick = () => selectCharacter(idx);

    btn.innerHTML = `
      <div class="relative w-12 h-12 rounded-full overflow-hidden bg-slate-950 border-2" style="border-color: ${elemColor}">
        <img src="${char.iconUrl || ''}" alt="${char.name}" class="w-full h-full object-cover scale-110" onerror="this.src='https://enka.network/ui/UI_AvatarIcon_Side_PlayerBoy.png'" />
        <span class="absolute bottom-0 right-0 px-1 rounded-tl bg-slate-900/90 text-amber-400 font-bold text-[9px]">
          C${char.constellation || 0}
        </span>
      </div>
      <span class="text-[11px] font-bold text-white max-w-[70px] truncate text-center">${char.name}</span>
      <span class="text-[9px] text-slate-400 font-mono">Lv. ${char.level}</span>
    `;

    el.characterTabsContainer.appendChild(btn);
  });
}

// Select Character & Render Detailed Enka Build Card
function selectCharacter(idx) {
  state.selectedCharIndex = idx;
  const char = state.characters[idx];
  if (!char) return;

  // Update tabs highlight
  const allTabs = el.characterTabsContainer.querySelectorAll(".char-tab-btn");
  allTabs.forEach((tab, i) => {
    if (i === idx) {
      tab.classList.add("active");
      tab.style.borderColor = "#f59e0b";
    } else {
      tab.classList.remove("active");
      tab.style.borderColor = "#1e293b";
    }
  });

  const elemColor = ELEMENT_COLORS[char.element] || "#ef4444";
  const elemClass = ELEMENT_CLASSES[char.element] || "elem-pyro";

  // Card Glow
  el.cardElementGlow.style.backgroundColor = elemColor;

  // Character Header
  el.charElementPill.className = `px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${elemClass}`;
  el.charElementPill.textContent = char.element;
  el.charLevelBadge.textContent = `Lv. ${char.level}/90`;
  el.charFriendship.textContent = `❤️ ${char.friendship || 10}`;
  el.charName.textContent = char.name;

  // Portrait Art
  el.charSplash.src = char.splashUrl || char.iconUrl || "";
  el.charSplash.onerror = () => {
    el.charSplash.src = char.iconUrl || "https://enka.network/ui/UI_AvatarIcon_Side_PlayerBoy.png";
  };

  // Constellations Indicator (6 dots)
  el.charConstellations.innerHTML = "";
  for (let c = 1; c <= 6; c++) {
    const isUnlocked = c <= (char.constellation || 0);
    const dot = document.createElement("div");
    dot.className = `const-dot ${isUnlocked ? 'active' : ''}`;
    dot.textContent = `C${c}`;
    el.charConstellations.appendChild(dot);
  }

  // Talents Sequence
  el.charTalentsContainer.innerHTML = "";
  (char.talents || []).forEach(t => {
    const tRow = document.createElement("div");
    tRow.className = "flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/60 border border-slate-800/80";
    tRow.innerHTML = `
      <span class="text-slate-300 font-medium">${t.name}</span>
      <span class="font-mono font-bold ${t.isBoosted ? 'text-amber-400' : 'text-white'}">
        Lv. ${t.level} ${t.isBoosted ? '✦' : ''}
      </span>
    `;
    el.charTalentsContainer.appendChild(tRow);
  });

  // Combat Stats
  const st = char.stats || {};
  // HP
  el.statHpTotal.textContent = (st.hp?.total || 0).toLocaleString();
  el.statHpSub.innerHTML = `${(st.hp?.base || 0).toLocaleString()} <span class="text-emerald-400">+${(st.hp?.bonus || 0).toLocaleString()}</span>`;
  // ATK
  el.statAtkTotal.textContent = (st.atk?.total || 0).toLocaleString();
  el.statAtkSub.innerHTML = `${(st.atk?.base || 0).toLocaleString()} <span class="text-emerald-400">+${(st.atk?.bonus || 0).toLocaleString()}</span>`;
  // DEF
  el.statDefTotal.textContent = (st.def?.total || 0).toLocaleString();
  el.statDefSub.innerHTML = `${(st.def?.base || 0).toLocaleString()} <span class="text-emerald-400">+${(st.def?.bonus || 0).toLocaleString()}</span>`;
  // Other Stats
  el.statEm.textContent = (st.em || 0).toLocaleString();
  el.statCritRate.textContent = st.critRate || "5.0%";
  el.statCritDmg.textContent = st.critDmg || "50.0%";
  el.statEr.textContent = st.energyRecharge || "100.0%";
  // Elemental DMG Bonus
  el.statDmgLabel.textContent = st.dmgBonus?.name || `${char.element} DMG Bonus`;
  el.statDmgVal.textContent = st.dmgBonus?.value || "0.0%";
  el.statDmgVal.style.color = elemColor;

  // Equipped Weapon Card
  const w = char.weapon || {};
  el.weaponIcon.src = w.iconUrl || "";
  el.weaponName.textContent = w.name || "Equipped Weapon";
  el.weaponRefine.textContent = `R${w.refinement || 1}`;
  el.weaponLevel.textContent = w.level || 90;
  el.weaponBaseAtk.textContent = w.baseAtk || 510;
  if (w.substat) {
    el.weaponSubstat.textContent = `${w.substat.name} ${w.substat.value}`;
  } else {
    el.weaponSubstat.textContent = "";
  }

  // Set Bonuses
  el.setBonusesContainer.innerHTML = "";
  if (char.setBonuses && char.setBonuses.length > 0) {
    char.setBonuses.forEach(sb => {
      const badge = document.createElement("span");
      badge.className = "px-2.5 py-1 rounded bg-slate-900 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold";
      badge.textContent = sb;
      el.setBonusesContainer.appendChild(badge);
    });
  } else {
    el.setBonusesContainer.innerHTML = `<span class="text-xs text-slate-500 italic">No set bonuses active</span>`;
  }

  // Artifacts (5 Slots)
  el.artifactsList.innerHTML = "";
  (char.artifacts || []).forEach(art => {
    const artCard = document.createElement("div");
    artCard.className = "artifact-card bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs space-y-1.5";

    let subsHtml = "";
    (art.substats || []).forEach(sub => {
      subsHtml += `
        <div class="flex items-center justify-between text-[11px] text-slate-300">
          <span class="text-slate-400">${sub.name}</span>
          <span class="font-mono font-bold text-white">${sub.value}</span>
        </div>
      `;
    });

    artCard.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
        <div class="flex items-center gap-2">
          <img src="${art.iconUrl}" alt="${art.slot}" class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 object-cover shrink-0" onerror="this.style.display='none'" />
          <div>
            <div class="font-bold text-white text-xs">${art.slot}</div>
            <div class="text-[10px] text-slate-400 truncate max-w-[140px]">${art.setName}</div>
          </div>
        </div>
        <div class="text-right">
          <span class="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px] font-bold border border-slate-700">
            +${art.level}
          </span>
          <div class="text-amber-400 font-bold text-xs font-mono mt-0.5">
            ${art.mainStat?.name}: <span class="text-white">${art.mainStat?.value}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-3 gap-y-0.5 pt-0.5">
        ${subsHtml}
      </div>
    `;

    el.artifactsList.appendChild(artCard);
  });

  if (window.lucide) lucide.createIcons();
}

// Status Banner Helpers
function showStatusBanner(type, title, message) {
  if (!el.statusBanner) return;
  el.statusBanner.classList.remove("hidden", "bg-emerald-950/60", "border-emerald-500/40", "text-emerald-200",
                                   "bg-amber-950/60", "border-amber-500/50", "text-amber-200",
                                   "bg-rose-950/60", "border-rose-500/50", "text-rose-200");

  if (type === "success") {
    el.statusBanner.classList.add("bg-emerald-950/60", "border", "border-emerald-500/40", "text-emerald-200");
    el.statusIcon.innerHTML = `<i data-lucide="check-circle" class="w-5 h-5 text-emerald-400"></i>`;
  } else if (type === "warning") {
    el.statusBanner.classList.add("bg-amber-950/60", "border", "border-amber-500/50", "text-amber-200");
    el.statusIcon.innerHTML = `<i data-lucide="alert-triangle" class="w-5 h-5 text-amber-400"></i>`;
  } else {
    el.statusBanner.classList.add("bg-rose-950/60", "border", "border-rose-500/50", "text-rose-200");
    el.statusIcon.innerHTML = `<i data-lucide="alert-octagon" class="w-5 h-5 text-rose-400"></i>`;
  }

  el.statusTitle.textContent = title;
  el.statusMessage.textContent = message;
  if (window.lucide) lucide.createIcons();
}

function hideStatusBanner() {
  if (el.statusBanner) el.statusBanner.classList.add("hidden");
}

// ==========================================
// 4-SLOT DRAG & DROP TEAM BUILDER
// ==========================================

function initTeamBuilder() {
  if (!el.teamSlotsContainer || !el.characterPoolGrid) return;

  const currentUid = state.player?.uid;
  if (currentUid) {
    try {
      const saved = localStorage.getItem("enka_team_" + currentUid);
      if (saved) {
        const savedIds = JSON.parse(saved);
        state.team = [null, null, null, null];
        savedIds.forEach((id, idx) => {
          if (idx < 4 && id) {
            const found = state.characters.find(c => String(c.avatarId) === String(id));
            if (found) state.team[idx] = found;
          }
        });
      }
    } catch (e) {
      console.warn("Could not restore saved team:", e);
    }
  }

  // Setup Element Filter Buttons
  if (el.elementFilterBar) {
    el.elementFilterBar.querySelectorAll(".elem-filter-btn").forEach(btn => {
      btn.onclick = () => {
        el.elementFilterBar.querySelectorAll(".elem-filter-btn").forEach(b => {
          b.classList.remove("active", "bg-amber-500/20", "text-amber-300", "border-amber-500/40");
          b.classList.add("text-slate-400");
        });
        btn.classList.add("active", "bg-amber-500/20", "text-amber-300", "border-amber-500/40");
        btn.classList.remove("text-slate-400");
        state.activeElementFilter = btn.getAttribute("data-element") || "all";
        renderCharacterPool();
      };
    });
  }

  // Setup Clear Team Button
  if (el.btnClearTeam) {
    el.btnClearTeam.onclick = () => {
      state.team = [null, null, null, null];
      saveActiveTeam();
      renderTeamSlots();
      renderCharacterPool();
      if (el.dpsResultsSection) el.dpsResultsSection.classList.add("hidden");
    };
  }

  // Setup Calculate Team DPS Button
  if (el.btnCalcDps) {
    el.btnCalcDps.onclick = () => {
      calculateTeamDps();
    };
  }

  renderTeamSlots();
  renderCharacterPool();
}

function saveActiveTeam() {
  const currentUid = state.player?.uid;
  if (!currentUid) return;
  try {
    const ids = state.team.map(c => c ? c.avatarId : null);
    localStorage.setItem("enka_team_" + currentUid, JSON.stringify(ids));
  } catch (e) {
    console.warn("Could not save team to localStorage:", e);
  }
}

function renderTeamSlots() {
  if (!el.teamSlotsContainer) return;
  el.teamSlotsContainer.innerHTML = "";

  let filledCount = 0;

  for (let i = 0; i < 4; i++) {
    const char = state.team[i];
    const slotEl = document.createElement("div");
    slotEl.dataset.slotIndex = i;

    if (char) {
      filledCount++;
      const elemColor = ELEMENT_COLORS[char.element] || "#fff";
      const elemClass = ELEMENT_CLASSES[char.element] || "elem-pyro";

      slotEl.className = "team-slot slot-drop-target filled rounded-2xl border border-slate-700/80 p-4 min-h-[250px] flex flex-col justify-between relative group transition cursor-grab active:cursor-grabbing overflow-hidden";
      slotEl.draggable = true;
      slotEl.style.background = `linear-gradient(145deg, rgba(15,23,42,0.95), ${elemColor}15)`;
      slotEl.style.borderColor = `${elemColor}50`;

      slotEl.innerHTML = `
        <!-- Top Bar: Slot label & Remove button -->
        <div class="flex items-center justify-between relative z-10">
          <span class="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700/80 text-[10px] font-mono font-bold text-amber-400">
            Slot ${i + 1}
          </span>
          <button class="btn-remove-slot p-1 rounded-lg bg-slate-900/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition active:scale-90" title="Remove from slot" data-slot-index="${i}">
            <i data-lucide="x" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <!-- Center: Character Avatar & Name -->
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

        <!-- Bottom: Weapon & Artifact Set -->
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

      // Dragstart from slot
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

      // Remove button listener
      const removeBtn = slotEl.querySelector(".btn-remove-slot");
      if (removeBtn) {
        removeBtn.onclick = (e) => {
          e.stopPropagation();
          state.team[i] = null;
          saveActiveTeam();
          renderTeamSlots();
          renderCharacterPool();
        };
      }

    } else {
      // Empty Slot
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

    // Common Drop Target Listeners
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
        handleDropOnSlot(payload, i);
      } catch (err) {
        console.warn("Invalid drop data:", err);
      }
    });

    el.teamSlotsContainer.appendChild(slotEl);
  }

  // Update Team Count
  if (el.teamCount) el.teamCount.textContent = filledCount;

  // Calculate and render resonances
  calculateResonances();

  if (window.lucide) lucide.createIcons();
}

function handleDropOnSlot(payload, targetIndex) {
  const avatarId = payload.avatarId;
  const targetChar = state.characters.find(c => String(c.avatarId) === String(avatarId));
  if (!targetChar) return;

  if (payload.type === "slot") {
    const fromIndex = payload.fromIndex;
    if (fromIndex === targetIndex) return;

    // Swap characters between fromIndex and targetIndex
    const temp = state.team[targetIndex];
    state.team[targetIndex] = state.team[fromIndex];
    state.team[fromIndex] = temp;
  } else {
    // Coming from pool
    const existingIndex = state.team.findIndex(c => c && String(c.avatarId) === String(avatarId));

    if (existingIndex !== -1) {
      if (existingIndex === targetIndex) return;
      // Character is already in team: swap or move
      const temp = state.team[targetIndex];
      state.team[targetIndex] = targetChar;
      state.team[existingIndex] = temp;
    } else {
      // Character not in team: place into targetIndex
      state.team[targetIndex] = targetChar;
    }
  }

  saveActiveTeam();
  renderTeamSlots();
  renderCharacterPool();
}

function renderCharacterPool() {
  if (!el.characterPoolGrid) return;
  el.characterPoolGrid.innerHTML = "";

  const filter = state.activeElementFilter || "all";
  const filtered = state.characters.filter(c => {
    if (filter === "all") return true;
    return c.element && c.element.toLowerCase() === filter.toLowerCase();
  });

  if (el.poolCount) el.poolCount.textContent = `${filtered.length} Characters`;

  if (filtered.length === 0) {
    el.characterPoolGrid.innerHTML = `
      <div class="col-span-full py-8 text-center text-xs text-slate-500">
        No imported characters matching element "${filter}".
      </div>
    `;
    return;
  }

  filtered.forEach(char => {
    const teamSlotIdx = state.team.findIndex(c => c && String(c.avatarId) === String(char.avatarId));
    const isInTeam = teamSlotIdx !== -1;
    const elemColor = ELEMENT_COLORS[char.element] || "#fff";
    const elemClass = ELEMENT_CLASSES[char.element] || "elem-pyro";

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

    // Dragstart
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

    // Click to add / remove
    card.addEventListener("click", () => {
      if (isInTeam) {
        // Remove from team
        state.team[teamSlotIdx] = null;
      } else {
        // Add to first empty slot
        const emptyIdx = state.team.findIndex(s => s === null);
        if (emptyIdx !== -1) {
          state.team[emptyIdx] = char;
        } else {
          // If team full, replace slot 0
          state.team[0] = char;
        }
      }
      saveActiveTeam();
      renderTeamSlots();
      renderCharacterPool();
    });

    el.characterPoolGrid.appendChild(card);
  });
}

function calculateResonances() {
  if (!el.teamResonanceContainer) return;
  el.teamResonanceContainer.innerHTML = "";

  const filledChars = state.team.filter(Boolean);
  if (filledChars.length < 2) {
    el.teamResonanceContainer.classList.add("hidden");
    return;
  }

  // Count elements
  const counts = {};
  filledChars.forEach(c => {
    if (c.element) {
      counts[c.element] = (counts[c.element] || 0) + 1;
    }
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

  // 4 unique elements = Protective Canopy
  if (filledChars.length === 4 && Object.keys(counts).length === 4) {
    activeResonances.push({
      name: "Protective Canopy",
      desc: "All Elemental RES +15%, Physical RES +15%",
      icon: "shield",
      cls: "text-indigo-300 border-indigo-500/30 bg-indigo-950/30"
    });
  }

  if (activeResonances.length === 0) {
    el.teamResonanceContainer.classList.add("hidden");
    return;
  }

  el.teamResonanceContainer.classList.remove("hidden");
  activeResonances.forEach(res => {
    const badge = document.createElement("div");
    badge.className = `flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-medium ${res.cls}`;
    badge.innerHTML = `
      <i data-lucide="${res.icon}" class="w-3.5 h-3.5"></i>
      <span class="font-bold">${res.name}:</span>
      <span class="text-slate-300 text-[11px]">${res.desc}</span>
    `;
    el.teamResonanceContainer.appendChild(badge);
  });
}

// ==========================================
// DPS & OPTIMAL ROTATION ENGINE
// ==========================================

async function calculateTeamDps() {
  const activeMembers = state.team.filter(Boolean);
  if (activeMembers.length === 0) {
    showStatusBanner("warning", "Empty Party", "Please drag at least one character into the team slots before calculating DPS.");
    return;
  }

  const currentUid = state.player?.uid || window.__PROFILE_UID__ || (window.location.pathname.startsWith("/profile/") ? window.location.pathname.split("/")[2] : null);

  if (el.btnCalcDps) {
    el.btnCalcDps.disabled = true;
    el.btnCalcDps.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>Fetching live Enka data & running 60s gcsim simulation...</span>
    `;
  }

  try {
    const res = await fetch("/api/calculate-dps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        team: activeMembers,
        uid: currentUid
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to calculate team DPS.");
    }

    renderDpsResults(data);

    if (el.dpsResultsSection) {
      el.dpsResultsSection.classList.remove("hidden");
      el.dpsResultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (err) {
    console.error("DPS Calculation Error:", err);
    showStatusBanner("error", "Calculation Failed", err.message || "An error occurred during DPS calculation.");
  } finally {
    if (el.btnCalcDps) {
      el.btnCalcDps.disabled = false;
      el.btnCalcDps.innerHTML = `
        <i data-lucide="cpu" class="w-4 h-4"></i>
        <span>Run 60s Simulation (gcsim)</span>
      `;
      if (window.lucide) lucide.createIcons();
    }
  }
}

function renderDpsResults(data) {
  if (!el.dpsResultsSection) return;
  el.dpsResultsSection.classList.remove("hidden");

  // 0. Target & Optimization Banner
  if (el.dpsOptimizationBanner) {
    if (data.vvComparison) {
      const vv = data.vvComparison;
      el.dpsOptimizationBanner.classList.remove("hidden");
      el.dpsOptimizationBanner.innerHTML = `
        <div class="p-4 rounded-2xl bg-gradient-to-r from-teal-950/60 via-slate-900/90 to-cyan-950/50 border border-teal-500/40 shadow-xl backdrop-blur-md">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center gap-1.5 font-mono">
                <i data-lucide="shield" class="w-3.5 h-3.5"></i> Target: Level 100 Ruin Guard (Abyss 12)
              </span>
              <span class="text-xs font-semibold text-white">4pc Viridescent Venerer Benchmark</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-base font-extrabold text-teal-300 font-mono">${Number(vv.optimizedTeamDps).toLocaleString()} DPS</span>
              <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 font-mono">+${vv.gainPercent}</span>
            </div>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">
            <span class="text-teal-300 font-semibold font-mono">In-Game Test Match:</span> ${vv.note} 
            Currently in your Enka showcase, <span class="text-white font-semibold">${vv.anemoCharacter}</span> has <span class="text-amber-400 font-mono">${vv.currentSet}</span> equipped (${Number(vv.currentTeamDps).toLocaleString()} DPS).
          </p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
    } else {
      el.dpsOptimizationBanner.classList.remove("hidden");
      el.dpsOptimizationBanner.innerHTML = `
        <div class="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between font-mono text-xs text-slate-300">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Target: Level 100 Ruin Guard
            </span>
            <span>Official 60-Second gcsim Combat Simulation</span>
          </div>
          <span class="text-slate-400 text-[11px]">10% Base Elemental RES • 250 Iterations</span>
        </div>
      `;
    }
  }

  // 1. Hero Metrics
  if (el.dpsMetricTeamDps) {
    el.dpsMetricTeamDps.textContent = Number(data.teamDps || 0).toLocaleString() + " DPS";
  }
  if (el.dpsMetricTotalDmg) {
    el.dpsMetricTotalDmg.textContent = Number(data.total60sDamage || data.totalRotationDamage || 0).toLocaleString();
  }
  if (el.dpsMetricDuration) {
    const dur = data.simulationDuration || data.rotationDuration || 60.0;
    el.dpsMetricDuration.textContent = `${dur.toFixed(1)}s (1 Min)`;
  }
  const engineEl = document.getElementById("dps-metric-engine");
  if (engineEl && data.engine) {
    engineEl.textContent = data.engine.split("(")[0].trim();
  }
  if (el.dpsTargetRes && data.enemyConfig) {
    const defRed = data.enemyConfig.defReduction && data.enemyConfig.defReduction !== "0%" ? ` • -${data.enemyConfig.defReduction} DEF Shred` : "";
    const resShred = data.enemyConfig.resShred && data.enemyConfig.resShred !== "0%" ? ` • -${data.enemyConfig.resShred} RES Shred` : "";
    const iters = data.iterations || data.enemyConfig.iterations || 250;
    el.dpsTargetRes.textContent = `${data.enemyConfig.baseRes} Base RES • ${iters} Iterations${resShred}${defRed}`;
  }

  // 2. Damage Contribution Segmented Bar & Legend
  if (el.dpsShareBar && el.dpsShareLegend) {
    el.dpsShareBar.innerHTML = "";
    el.dpsShareLegend.innerHTML = "";

    (data.characters || []).forEach(char => {
      const elemColor = ELEMENT_COLORS[char.element] || "#fbbf24";
      const sharePct = char.shareNumeric || 0;

      // Segment in progress bar
      const seg = document.createElement("div");
      seg.className = "h-full transition-all relative group";
      seg.style.width = `${sharePct}%`;
      seg.style.backgroundColor = elemColor;
      seg.setAttribute("title", `${char.name}: ${Number(char.totalDamage).toLocaleString()} (${char.damageShare})`);
      el.dpsShareBar.appendChild(seg);

      // Legend Item
      const legItem = document.createElement("div");
      legItem.className = "flex items-center gap-1.5 text-slate-300 font-mono text-[11px]";
      legItem.innerHTML = `
        <span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color: ${elemColor}"></span>
        <span class="font-bold text-white">${char.name}:</span>
        <span class="text-amber-400 font-semibold">${char.damageShare}</span>
        <span class="text-slate-500">(${Number(char.totalDamage).toLocaleString()})</span>
      `;
      el.dpsShareLegend.appendChild(legItem);
    });
  }

  // 3. Optimal Rotation Timeline
  if (el.rotationTimelineContainer) {
    el.rotationTimelineContainer.innerHTML = "";
    const steps = data.optimalRotation || [];
    if (el.rotationStepsCount) el.rotationStepsCount.textContent = `${steps.length} Steps`;

    steps.forEach((step, idx) => {
      const elemColor = ELEMENT_COLORS[step.element] || "#fbbf24";
      const elemClass = ELEMENT_CLASSES[step.element] || "elem-pyro";

      const stepCard = document.createElement("div");
      stepCard.className = "flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition";

      // Buffs badges HTML
      let buffsHtml = "";
      if (step.activeBuffs && step.activeBuffs.length > 0) {
        buffsHtml = step.activeBuffs.map(b => 
          `<span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700/80 text-[10px] text-slate-300 font-sans">${b}</span>`
        ).join("");
      }

      stepCard.innerHTML = `
        <div class="flex flex-col items-center shrink-0 w-12 pt-0.5">
          <span class="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-amber-400 font-mono text-[11px] font-bold">
            #${step.step || idx + 1}
          </span>
          <span class="text-[10px] font-mono text-slate-500 mt-1">${step.startTime}</span>
        </div>

        <div class="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border shrink-0 mt-0.5" style="border-color: ${elemColor}">
          <img src="${step.iconUrl}" alt="${step.character}" class="w-full h-full object-cover" onerror="this.src='https://enka.network/ui/UI_AvatarIcon_Side_PlayerBoy.png'" />
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-bold text-white text-xs">${step.character}</span>
            <span class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${elemClass}">${step.element}</span>
            <span class="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-bold font-mono">
              ${step.action}
            </span>
            <span class="text-[10px] text-slate-500 font-mono ml-auto">Duration: ${step.startTime} → ${step.endTime}</span>
          </div>
          <p class="text-xs text-slate-300 mt-1 leading-relaxed">${step.description}</p>
          ${buffsHtml ? `<div class="flex flex-wrap gap-1.5 mt-2">${buffsHtml}</div>` : ''}
        </div>
      `;
      el.rotationTimelineContainer.appendChild(stepCard);
    });
  }

  // 4. Per-Character Breakdown Cards Grid
  if (el.characterBreakdownGrid) {
    el.characterBreakdownGrid.innerHTML = "";

    (data.characters || []).forEach(char => {
      const elemColor = ELEMENT_COLORS[char.element] || "#fbbf24";
      const elemClass = ELEMENT_CLASSES[char.element] || "elem-pyro";

      const card = document.createElement("div");
      card.className = "bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 relative overflow-hidden";
      card.style.borderTop = `3px solid ${elemColor}`;

      let skillsHtml = "";
      (char.skillsBreakdown || []).forEach(sk => {
        const dpsLabel = sk.dps ? `${Number(sk.dps).toLocaleString()} DPS` : (sk.hits ? `${sk.hits} hits • Scaled on ${sk.statScaled}` : '');
        skillsHtml += `
          <div class="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0">
            <div>
              <span class="text-slate-200 font-medium block truncate max-w-[150px]">${sk.name}</span>
              <span class="text-[10px] text-slate-500 font-mono">${dpsLabel}</span>
            </div>
            <div class="text-right font-mono">
              <span class="font-bold text-amber-300 text-xs block">${Number(sk.damage).toLocaleString()}</span>
              <span class="text-[9px] text-slate-500">60s DMG</span>
            </div>
          </div>
        `;
      });

      card.innerHTML = `
        <div>
          <!-- Header -->
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-1.5">
                <span class="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${elemClass}">${char.element}</span>
                <span class="text-[10px] text-slate-400 font-mono">${char.role}</span>
              </div>
              <h5 class="font-bold text-white text-sm mt-0.5 truncate">${char.name}</h5>
            </div>
            <div class="text-right">
              <span class="text-amber-400 font-mono font-extrabold text-sm">${char.damageShare}</span>
              <div class="text-[9px] text-slate-500 font-mono">Team Share</div>
            </div>
          </div>

          <!-- Total Damage Badge -->
          <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 my-3 flex items-center justify-between font-mono">
            <div>
              <div class="text-[9px] uppercase tracking-wider text-slate-400">Total 60s DMG</div>
              <div class="text-base font-extrabold text-white">${Number(char.totalDamage).toLocaleString()}</div>
            </div>
            <div class="text-right">
              <div class="text-[9px] uppercase tracking-wider text-slate-400">DPS (DMG / 60s)</div>
              <div class="text-xs font-bold text-emerald-400">${Number(char.dpsContribution).toLocaleString()} /s</div>
            </div>
          </div>

          <!-- Active Reaction Tag -->
          <div class="flex items-center justify-between text-[11px] mb-2 px-1 font-mono">
            <span class="text-slate-400">Reaction / Buff:</span>
            <span class="text-cyan-400 font-semibold truncate max-w-[140px]">${char.reactionTag}</span>
          </div>

          <!-- Effective Combat Stats -->
          <div class="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-900/50 rounded-xl p-2 border border-slate-800/70 mb-3">
            <div>
              <span class="text-slate-400">Eff. ${char.primaryStatType}:</span>
              <span class="text-white font-bold ml-1">${Number(char.effectiveStat).toLocaleString()}</span>
            </div>
            <div class="text-right">
              <span class="text-slate-400">CRIT:</span>
              <span class="text-amber-300 font-bold ml-1">${char.critRate} / ${char.critDmg}</span>
            </div>
          </div>

          <!-- Skill Breakdown list -->
          <div class="space-y-1">
            <div class="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">60s Ability Damage Breakdown</div>
            <div class="bg-slate-900/60 rounded-xl p-2 border border-slate-800/60 space-y-0.5">
              ${skillsHtml || '<div class="text-[11px] text-slate-500 italic py-1">Direct combat contributions</div>'}
            </div>
          </div>
        </div>
      `;

      el.characterBreakdownGrid.appendChild(card);
    });
  }

  // 5. Active Synergy Buffs & Multipliers
  if (el.dpsActiveBuffsList) {
    el.dpsActiveBuffsList.innerHTML = "";
    const buffs = data.teamBuffs || [];
    if (buffs.length === 0) {
      el.dpsActiveBuffsList.innerHTML = `<span class="text-xs text-slate-500 italic">No external team buffs active</span>`;
    } else {
      buffs.forEach(b => {
        const badge = document.createElement("div");
        badge.className = "flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium";
        badge.innerHTML = `
          <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-400 shrink-0"></i>
          <span>${b}</span>
        `;
        el.dpsActiveBuffsList.appendChild(badge);
      });
    }
  }

  if (window.lucide) lucide.createIcons();
}

