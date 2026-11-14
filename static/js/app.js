/**
 * Genshin Impact Enka Profile Viewer
 * Frontend Application Controller
 */

// Application State
const state = {
  player: null,
  characters: [],
  selectedCharIndex: 0
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
  profileContentDamageCalc: document.getElementById("profile-content-damage-calc")
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
