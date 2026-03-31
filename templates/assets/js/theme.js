(function () {
  var storageKey = "kb-color-scheme-mode";
  var modes = ["system", "light", "dark"];
  var root = document.documentElement;
  var body = document.body;
  var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function isValidMode(value) {
    return modes.indexOf(value) !== -1;
  }

  function getStoredMode() {
    var stored = window.localStorage.getItem(storageKey);
    if (isValidMode(stored)) {
      return stored;
    }

    return "system";
  }

  function getResolvedScheme(mode) {
    return mode === "system" ? (mediaQuery.matches ? "dark" : "light") : mode;
  }

  function getModeLabel(mode) {
    if (mode === "light") {
      return "亮色";
    }

    if (mode === "dark") {
      return "暗色";
    }

    return "跟随系统";
  }

  function getNextMode(mode) {
    var currentIndex = modes.indexOf(mode);
    var nextIndex = currentIndex >= 0 ? currentIndex + 1 : 0;

    return modes[nextIndex % modes.length];
  }

  function applyMode(mode) {
    var scheme = getResolvedScheme(mode);

    root.dataset.colorSchemeMode = mode;
    root.dataset.colorScheme = scheme;
    var meta = document.querySelector('meta[name="theme-color"]');

    if (meta) {
      meta.setAttribute("content", scheme === "dark" ? "#13100c" : "#f4efe6");
    }

    syncToggle(mode, scheme);
  }

  function syncToggle(mode, scheme) {
    var toggles = document.querySelectorAll("[data-theme-toggle]");
    var currentLabel = getModeLabel(mode);
    var nextMode = getNextMode(mode);
    var nextLabel = getModeLabel(nextMode);

    toggles.forEach(function (toggle) {
      toggle.setAttribute("aria-label", "当前为" + currentLabel + "，点击切换到" + nextLabel + "模式");
      toggle.setAttribute("title", "当前为" + currentLabel + "，点击切换到" + nextLabel + "模式");
      toggle.setAttribute("data-theme-mode", mode);
      toggle.setAttribute("data-theme-resolved", scheme);

      var label = toggle.querySelector("[data-theme-label]");
      if (label) {
        label.textContent = currentLabel;
      }
    });
  }

  function persistMode(mode) {
    window.localStorage.setItem(storageKey, mode);
  }

  function toggleMode() {
    var currentMode = root.dataset.colorSchemeMode || getStoredMode();
    var nextMode = getNextMode(currentMode);
    persistMode(nextMode);
    applyMode(nextMode);
  }

  document.addEventListener("click", function (event) {
    var toggle = event.target.closest("[data-theme-toggle]");
    if (!toggle) {
      return;
    }

    event.preventDefault();
    toggleMode();
  });

  function handleSystemChange() {
    if ((root.dataset.colorSchemeMode || getStoredMode()) === "system") {
      applyMode("system");
    }
  }

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleSystemChange);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handleSystemChange);
  }

  window.requestAnimationFrame(function () {
    if (body) {
      body.classList.add("is-ready");
    }
  });

  applyMode(getStoredMode());
})();
