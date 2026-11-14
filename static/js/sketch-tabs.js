/**
 * Sketch Tabs - Hand-drawn animated underline tabs
 * Inspired by DoodleUI & Rough.js
 */

(function () {
  let seedCounter = 100;

  // Pseudo-random number generator for consistent organic curves
  function pseudoRand(s) {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  }

  // Generates hand-drawn wavy organic SVG path
  function generateSketchPath(width, roughness = 1.3, bowing = 1.8, seed = 42) {
    if (width <= 0) return "";
    let s = seed;
    const rand = (min, max) => {
      s += 1.337;
      return min + pseudoRand(s) * (max - min);
    };

    const startY = 4 + rand(-roughness, roughness) * 0.4;
    const cp1X = width * 0.3 + rand(-4, 4);
    const cp1Y = 4 + bowing + rand(-roughness, roughness);
    const cp2X = width * 0.7 + rand(-4, 4);
    const cp2Y = 4 + bowing * 0.9 + rand(-roughness, roughness);
    const endY = 4 + rand(-roughness, roughness) * 0.4;

    // Primary hand-drawn stroke
    let d = `M 2 ${startY.toFixed(2)} C ${cp1X.toFixed(2)} ${cp1Y.toFixed(2)}, ${cp2X.toFixed(2)} ${cp2Y.toFixed(2)}, ${(width - 2).toFixed(2)} ${endY.toFixed(2)}`;

    // Secondary subtle sketch stroke for organic doodle effect
    const s2StartY = 5 + rand(-roughness, roughness) * 0.3;
    const s2CpX = width * 0.5 + rand(-5, 5);
    const s2CpY = 5 + bowing * 1.1 + rand(-roughness, roughness);
    const s2EndY = 4.5 + rand(-roughness, roughness) * 0.3;
    d += ` M 4 ${s2StartY.toFixed(2)} Q ${s2CpX.toFixed(2)} ${s2CpY.toFixed(2)} ${(width - 4).toFixed(2)} ${s2EndY.toFixed(2)}`;

    return d;
  }

  // Initializes a sketch tabs container
  function initSketchTabs(container, options = {}) {
    if (!container) return;

    const tabs = Array.from(container.querySelectorAll(".sketch-tab"));
    if (tabs.length === 0) return;

    const strokeColor = options.strokeColor || container.dataset.sketchColor || "#f59e0b";
    const roughness = parseFloat(options.roughness || container.dataset.roughness || "1.3");
    const bowing = parseFloat(options.bowing || container.dataset.bowing || "1.8");

    // Ensure underline element exists
    let underline = container.querySelector(".sketch-underline");
    let path = container.querySelector(".sketch-path");

    if (!underline) {
      underline = document.createElement("div");
      underline.className = "sketch-underline";
      underline.innerHTML = `
        <svg class="w-full h-[12px] overflow-visible" xmlns="http://www.w3.org/2000/svg">
          <path class="sketch-path" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linecap="round" />
        </svg>
      `;
      container.appendChild(underline);
      path = underline.querySelector(".sketch-path");
    }

    function updateUnderline(activeTab, animateDraw = true) {
      if (!activeTab || !underline || !path) return;

      const left = activeTab.offsetLeft + 6;
      const top = activeTab.offsetTop + activeTab.offsetHeight - 6;
      const width = Math.max(16, activeTab.offsetWidth - 12);

      underline.style.left = `${left}px`;
      underline.style.top = `${top}px`;
      underline.style.width = `${width}px`;

      seedCounter += 7;
      const d = generateSketchPath(width, roughness, bowing, seedCounter);
      path.setAttribute("d", d);
      path.setAttribute("stroke", strokeColor);

      if (animateDraw) {
        underline.style.opacity = "0";
        underline.style.transform = "scaleX(0.85)";
        underline.style.transformOrigin = "left center";

        requestAnimationFrame(() => {
          underline.style.transition =
            "left 220ms ease, width 220ms ease, top 220ms ease, opacity 240ms ease, transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)";
          underline.style.opacity = "1";
          underline.style.transform = "scaleX(1)";
        });
      }
    }

    function activateTab(tab, triggerCallback = true) {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      const tabValue = tab.getAttribute("data-tab");

      // Check for associated panels
      const parentContainer = container.closest(".sketch-tabs-wrapper") || container.parentElement;
      if (parentContainer) {
        const panels = parentContainer.querySelectorAll(".sketch-panel, .sketch-tab-panel");
        panels.forEach((p) => {
          if (p.getAttribute("data-panel") === tabValue) {
            p.classList.add("active");
            p.classList.remove("hidden");
          } else {
            p.classList.remove("active");
            p.classList.add("hidden");
          }
        });
      }

      updateUnderline(tab, true);

      if (triggerCallback && typeof options.onTabChange === "function") {
        options.onTabChange(tabValue, tab);
      }
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activateTab(tab, true));
    });

    // Initial positioning
    const activeTab = container.querySelector(".sketch-tab.active") || tabs[0];
    if (activeTab) {
      activeTab.classList.add("active");
      // Initial render without jarring animation
      setTimeout(() => updateUnderline(activeTab, false), 50);
    }

    // Auto-update position on window resize
    const ro = new ResizeObserver(() => {
      const currentActive = container.querySelector(".sketch-tab.active");
      if (currentActive) updateUnderline(currentActive, false);
    });
    ro.observe(container);

    return {
      activate: (tabValue) => {
        const target = tabs.find((t) => t.getAttribute("data-tab") === tabValue);
        if (target) activateTab(target, false);
      },
      refresh: () => {
        const currentActive = container.querySelector(".sketch-tab.active");
        if (currentActive) updateUnderline(currentActive, false);
      },
    };
  }

  // Expose globally
  window.SketchTabs = {
    init: initSketchTabs,
    initAll: function () {
      document.querySelectorAll(".sketch-tabs-nav, .sketch-tab-list").forEach((container) => {
        initSketchTabs(container);
      });
    },
  };

  document.addEventListener("DOMContentLoaded", () => {
    window.SketchTabs.initAll();
  });
})();
