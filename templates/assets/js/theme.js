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

  function openSearchWidget() {
    if (window.SearchWidget && typeof window.SearchWidget.open === "function") {
      window.SearchWidget.open();
      return true;
    }

    return false;
  }

  function isEditableTarget(target) {
    if (!target) {
      return false;
    }

    if (target.isContentEditable) {
      return true;
    }

    var tagName = target.tagName;
    return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";
  }

  function bindPageJumpForms() {
    var forms = document.querySelectorAll("[data-page-jump-form]");

    function buildPageUrl(patternUrl, page) {
      var url = new URL(patternUrl || window.location.href, window.location.href);
      var pathname = url.pathname;
      var pagePathPattern = /\/page\/\d+\/?$/;

      if (pagePathPattern.test(pathname)) {
        if (page <= 1) {
          url.pathname = pathname.replace(pagePathPattern, "/");
        } else {
          url.pathname = pathname.replace(pagePathPattern, "/page/" + page);
        }

        return url.toString();
      }

      if (page <= 1) {
        url.searchParams.delete("page");
      } else {
        url.searchParams.set("page", String(page));
      }

      return url.toString();
    }

    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();

        var input = form.querySelector("[data-page-jump-input]");
        if (!input) {
          return;
        }

        var currentPage = parseInt(input.value, 10);
        var maxPage = parseInt(input.max, 10);

        if (!Number.isFinite(currentPage)) {
          input.focus();
          return;
        }

        if (!Number.isFinite(maxPage) || maxPage < 1) {
          maxPage = currentPage;
        }

        var nextPage = Math.min(Math.max(currentPage, 1), maxPage);
        var prevUrl = form.dataset.pagePrevUrl;
        var nextUrl = form.dataset.pageNextUrl;
        var currentUrl = window.location.href;
        var patternUrl = nextPage > 1 ? (nextUrl || prevUrl || currentUrl) : (prevUrl || nextUrl || currentUrl);

        input.value = String(nextPage);
        window.location.assign(buildPageUrl(patternUrl, nextPage));
      });
    });
  }

  document.addEventListener("click", function (event) {
    var searchTrigger = event.target.closest("[data-search-trigger]");
    if (searchTrigger) {
      if (openSearchWidget()) {
        event.preventDefault();
      }
      return;
    }

    var toggle = event.target.closest("[data-theme-toggle]");
    if (!toggle) {
      return;
    }

    event.preventDefault();
    toggleMode();
  });

  document.addEventListener("keydown", function (event) {
    var isSearchShortcut =
      !event.altKey &&
      !event.shiftKey &&
      ((event.ctrlKey && !event.metaKey) || (!event.ctrlKey && event.metaKey)) &&
      String(event.key).toLowerCase() === "f";

    if (isSearchShortcut && !isEditableTarget(event.target) && openSearchWidget()) {
      event.preventDefault();
    }
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

  bindPageJumpForms();
  applyMode(getStoredMode());
})();
