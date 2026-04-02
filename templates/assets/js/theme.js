(function () {
  var storageKey = "kb-color-scheme-mode";
  var modes = ["system", "light", "dark"];
  var drawerCloseDuration = 560;
  var root = document.documentElement;
  var body = document.body;
  var mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function isValidMode(value) {
    return modes.indexOf(value) !== -1;
  }

  function getStoredMode() {
    if (root.dataset.themeToggleEnabled === "false") {
      return root.dataset.colorSchemeMode || "system";
    }

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
    var toggleEnabled = root.dataset.themeToggleEnabled !== "false";

    toggles.forEach(function (toggle) {
      toggle.hidden = !toggleEnabled;
      toggle.disabled = !toggleEnabled;

      if (!toggleEnabled) {
        return;
      }

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
    if (root.dataset.themeToggleEnabled === "false") {
      return;
    }

    window.localStorage.setItem(storageKey, mode);
  }

  function toggleMode() {
    if (root.dataset.themeToggleEnabled === "false") {
      return;
    }

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

  function shouldReduceMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function scrollPageToTop() {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion() ? "auto" : "smooth",
    });
  }

  function closeAccountMenus(currentMenu) {
    var menus = document.querySelectorAll(".account-menu[open]");

    menus.forEach(function (menu) {
      if (!currentMenu || menu !== currentMenu) {
        menu.removeAttribute("open");
      }
    });
  }

  function syncDrawerState() {
    var hasOpenDrawer = document.querySelector(".menu-drawer[open], .menu-drawer.is-closing") !== null;

    if (body) {
      body.classList.toggle("is-drawer-open", hasOpenDrawer);
    }
  }

  function resetMenuDrawerState(drawer) {
    if (!drawer) {
      return;
    }

    if (drawer.__closeTimer) {
      window.clearTimeout(drawer.__closeTimer);
      drawer.__closeTimer = null;
    }

    drawer.classList.remove("is-closing");
  }

  function closeMenuDrawer(drawer) {
    if (!drawer || !drawer.hasAttribute("open") || drawer.classList.contains("is-closing")) {
      return;
    }

    drawer.classList.add("is-closing");
    syncDrawerState();

    drawer.__closeTimer = window.setTimeout(function () {
      drawer.removeAttribute("open");
      drawer.classList.remove("is-closing");
      drawer.__closeTimer = null;
      syncDrawerState();
    }, drawerCloseDuration);
  }

  function closeMenuDrawers(currentDrawer) {
    var drawers = document.querySelectorAll(".menu-drawer[open]");

    drawers.forEach(function (drawer) {
      if (!currentDrawer || drawer !== currentDrawer) {
        closeMenuDrawer(drawer);
      }
    });

    syncDrawerState();
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

  function bindMenuDrawers() {
    var drawers = document.querySelectorAll(".menu-drawer");

    drawers.forEach(function (drawer) {
      drawer.addEventListener("toggle", function () {
        if (drawer.open) {
          resetMenuDrawerState(drawer);
          closeAccountMenus();
        }

        syncDrawerState();
      });
    });
  }

  function bindPaginationLinks() {
    var paginationLinks = document.querySelectorAll("[data-pagination-link]");

    paginationLinks.forEach(function (link) {
      var page = parseInt(link.dataset.page, 10);
      var container = link.closest("[data-pagination-pattern-url]");
      var patternUrl = container ? container.dataset.paginationPatternUrl : window.location.href;

      if (!Number.isFinite(page)) {
        return;
      }

      link.dataset.paginationHref = buildPageUrl(patternUrl, page);
    });
  }

  function bindPageJumpForms() {
    var forms = document.querySelectorAll("[data-page-jump-form]");

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
    var accountMenu = event.target.closest(".account-menu");
    if (!accountMenu) {
      closeAccountMenus();
    }

    var drawerClose = event.target.closest("[data-menu-drawer-close]");
    if (drawerClose) {
      var drawer = drawerClose.closest(".menu-drawer");
      if (drawer) {
        event.preventDefault();
        closeMenuDrawer(drawer);
      }
      return;
    }

    var drawerLink = event.target.closest(".menu-drawer-link");
    if (drawerLink) {
      closeMenuDrawers();
      return;
    }

    var paginationLink = event.target.closest("[data-pagination-link]");
    if (paginationLink) {
      var href = paginationLink.dataset.paginationHref;

      if (href) {
        event.preventDefault();
        window.location.assign(href);
      }
      return;
    }

    var scrollTopTrigger = event.target.closest("[data-scroll-top]");
    if (scrollTopTrigger) {
      event.preventDefault();
      scrollPageToTop();
      return;
    }

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
    if (event.key === "Escape") {
      closeAccountMenus();
      closeMenuDrawers();
    }

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

  bindMenuDrawers();
  bindPaginationLinks();
  bindPageJumpForms();
  applyMode(getStoredMode());
})();
