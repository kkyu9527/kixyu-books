(function () {
  const content = document.querySelector("[data-reader-content]");

  if (!content) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior = prefersReducedMotion ? "auto" : "smooth";

  initOutline(content, scrollBehavior);
  initLightbox(content);

  function initOutline(contentRoot, behavior) {
    const outline = document.querySelector("[data-reader-outline]");
    const outlineBody = document.querySelector("[data-reader-outline-body]");

    if (!outline || !outlineBody) {
      return;
    }

    const headings = Array.from(contentRoot.querySelectorAll("h1, h2, h3, h4, h5, h6"));

    if (!headings.length) {
      outline.hidden = true;
      return;
    }

    const groups = buildGroups(headings);

    if (!groups.length) {
      outline.hidden = true;
      return;
    }

    outline.hidden = false;
    renderOutline(groups, outlineBody, behavior);
    bindOutlineState(groups, outlineBody);
  }

  function buildGroups(headings) {
    const levels = headings.map((heading) => Number(heading.tagName.slice(1)));
    const topLevel = Math.min.apply(null, levels);
    const usedIds = new Set();
    const groups = [];
    let currentGroup = null;

    headings.forEach((heading, index) => {
      ensureHeadingId(heading, index, usedIds);

      const item = {
        id: heading.id,
        title: heading.textContent.trim(),
        level: Number(heading.tagName.slice(1)),
        element: heading,
      };

      if (item.level === topLevel || !currentGroup) {
        currentGroup = {
          id: item.id,
          title: item.title,
          level: item.level,
          element: item.element,
          items: [item],
        };
        groups.push(currentGroup);
        return;
      }

      currentGroup.items.push(item);
    });

    return groups;
  }

  function renderOutline(groups, outlineBody, behavior) {
    outlineBody.innerHTML = "";

    groups.forEach((group, index) => {
      const section = document.createElement("section");
      section.className = "post-outline-section";
      section.dataset.groupId = group.id;

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "post-outline-trigger";
      trigger.dataset.targetId = group.id;
      trigger.setAttribute("aria-expanded", "false");
      trigger.innerHTML =
        '<span class="post-outline-order">' +
        String(index + 1).padStart(2, "0") +
        "</span>" +
        '<span class="post-outline-heading">' +
        escapeHtml(group.title) +
        "</span>";
      section.appendChild(trigger);

      const children = document.createElement("div");
      children.className = "post-outline-children";

      group.items.slice(1).forEach((item) => {
        const link = document.createElement("a");
        link.className = "post-outline-link";
        link.href = "#" + item.id;
        link.dataset.targetId = item.id;
        link.dataset.groupId = group.id;
        link.dataset.depth = String(item.level - group.level);
        link.textContent = item.title;
        children.appendChild(link);
      });

      if (children.childElementCount > 0) {
        section.appendChild(children);
      }

      outlineBody.appendChild(section);
    });

    outlineBody.addEventListener("click", function (event) {
      const target = event.target.closest("[data-target-id]");

      if (!target) {
        return;
      }

      event.preventDefault();
      const heading = document.getElementById(target.dataset.targetId);

      if (!heading) {
        return;
      }

      heading.scrollIntoView({
        behavior: behavior,
        block: "start",
      });
    });
  }

  function bindOutlineState(groups, outlineBody) {
    const headings = groups.flatMap((group) =>
      group.items.map((item) => ({
        id: item.id,
        groupId: group.id,
        element: item.element,
      }))
    );

    let ticking = false;

    const update = function () {
      ticking = false;

      const threshold = Math.max(120, Math.round(window.innerHeight * 0.18));
      let active = headings[0];

      headings.forEach((item) => {
        if (item.element.getBoundingClientRect().top <= threshold) {
          active = item;
        }
      });

      const sections = Array.from(outlineBody.querySelectorAll(".post-outline-section"));
      const targets = Array.from(outlineBody.querySelectorAll("[data-target-id]"));

      sections.forEach((section) => {
        const isActiveGroup = section.dataset.groupId === active.groupId;
        section.classList.toggle("is-active", isActiveGroup);

        const trigger = section.querySelector(".post-outline-trigger");

        if (trigger) {
          trigger.setAttribute("aria-expanded", isActiveGroup ? "true" : "false");
          trigger.classList.toggle("is-active", isActiveGroup);
        }
      });

      targets.forEach((target) => {
        const isActiveTarget = target.dataset.targetId === active.id;
        target.classList.toggle("is-active", isActiveTarget);
      });
    };

    const requestUpdate = function () {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();
  }

  function ensureHeadingId(heading, index, usedIds) {
    const rawId =
      heading.id ||
      heading.textContent
        .trim()
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[^\p{Letter}\p{Number}\s-]/gu, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    let id = rawId || "section-" + String(index + 1);
    let suffix = 1;

    while (usedIds.has(id)) {
      suffix += 1;
      id = (rawId || "section-" + String(index + 1)) + "-" + String(suffix);
    }

    heading.id = id;
    usedIds.add(id);
  }

  function initLightbox(contentRoot) {
    const lightbox = document.querySelector("[data-reader-lightbox]");
    const lightboxImage = document.querySelector("[data-reader-lightbox-image]");
    const lightboxCaption = document.querySelector("[data-reader-lightbox-caption]");
    const closeButton = document.querySelector("[data-reader-lightbox-close]");

    if (!lightbox || !lightboxImage || !lightboxCaption) {
      return;
    }

    const closeLightbox = function () {
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-lightbox-open");
      lightboxImage.removeAttribute("src");
      lightboxImage.removeAttribute("alt");
      lightboxCaption.textContent = "";
    };

    const openLightbox = function (sourceImage) {
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-lightbox-open");
      lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
      lightboxImage.alt = sourceImage.alt || "";
      lightboxCaption.textContent = sourceImage.alt || sourceImage.getAttribute("title") || "";
    };

    contentRoot.addEventListener("click", function (event) {
      const image = event.target.closest("img");

      if (!image) {
        return;
      }

      event.preventDefault();
      openLightbox(image);
    });

    if (closeButton) {
      closeButton.addEventListener("click", closeLightbox);
    }

    lightbox.addEventListener("click", function () {
      closeLightbox();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !lightbox.hidden) {
        closeLightbox();
      }
    });
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
