(() => {
  const currentScriptUrl = new URL(document.currentScript?.getAttribute("src") || "js/main.js", window.location.href);
  const siteRootUrl = new URL("../", currentScriptUrl);
  const loopHeroVideoUrl = new URL("assets/media/2023-2024/PRESENTAZIONE SOCIAL.mp4", siteRootUrl).href;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saveData = Boolean(navigator.connection && navigator.connection.saveData);

  const bindTapToPause = (video) => {
    if (!video || video.dataset.tapPauseBound === "true") return;
    video.dataset.tapPauseBound = "true";

    video.addEventListener("click", () => {
      if (video.paused) {
        video.dataset.userPaused = "false";
        video.play().catch(() => {});
      } else {
        video.dataset.userPaused = "true";
        video.pause();
      }
    });
  };

  const optimizeHeroVideos = () => {
    const videos = Array.from(document.querySelectorAll(".hero video, .page-hero-video"));
    if (videos.length === 0) return;

    videos.forEach((video) => {
      bindTapToPause(video);

      if (saveData) {
        video.preload = "none";
      }

      if (reduceMotion || saveData) {
        video.pause();
      }
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            const userPaused = video.dataset.userPaused === "true";
            if (entry.isIntersecting && !reduceMotion && !saveData && !userPaused) {
              video.play().catch(() => {});
            } else if (!userPaused) {
              video.pause();
            }
          });
        },
        { threshold: 0.2 }
      );

      videos.forEach((video) => observer.observe(video));
    }
  };

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navList = document.querySelector("[data-nav-list]");

  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      const opened = navList.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(opened));
    });

    navList.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navList.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const normalizePath = (value) => {
    let output = String(value || "").replace(/\/+/g, "/");
    if (output.endsWith("/index.html")) {
      output = output.slice(0, -"/index.html".length) || "/";
    }
    if (output.length > 1 && output.endsWith("/")) {
      output = output.slice(0, -1);
    }
    return output || "/";
  };

  const currentPath = normalizePath(window.location.pathname);
  document.querySelectorAll("[data-nav-list] a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }
    const targetPath = normalizePath(new URL(href, window.location.href).pathname);
    if (targetPath === currentPath) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  const footerYear = document.querySelector("[data-year]");
  if (footerYear) {
    footerYear.textContent = String(new Date().getFullYear());
  }

  const ensureLoopingHeroVideos = () => {
    const homeSource = document.querySelector(".hero video source");
    if (homeSource && homeSource.getAttribute("src") !== loopHeroVideoUrl) {
      homeSource.setAttribute("src", loopHeroVideoUrl);
      const homeVideo = homeSource.closest("video");
      if (homeVideo) {
        homeVideo.load();
      }
    }

    document.querySelectorAll(".page-hero").forEach((hero) => {
      if (hero.querySelector(".page-hero-video")) {
        return;
      }

      const video = document.createElement("video");
      video.className = "page-hero-video";
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("aria-hidden", "true");

      const source = document.createElement("source");
      source.src = loopHeroVideoUrl;
      source.type = "video/mp4";
      video.appendChild(source);

      const overlay = document.createElement("div");
      overlay.className = "page-hero-video-overlay";
      overlay.setAttribute("aria-hidden", "true");

      hero.prepend(overlay);
      hero.prepend(video);
    });
  };

  ensureLoopingHeroVideos();
  optimizeHeroVideos();

  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length > 0 && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    reveals.forEach((el) => observer.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("visible"));
  }

  const counters = document.querySelectorAll("[data-counter]");

  const runCounter = (el) => {
    const target = Number(el.getAttribute("data-counter"));
    if (!Number.isFinite(target)) return;

    if (reduceMotion) {
      el.textContent = String(target);
      return;
    }

    let frame = 0;
    const totalFrames = 42;

    const animate = () => {
      frame += 1;
      const progress = frame / totalFrames;
      const value = Math.round(target * progress);
      el.textContent = String(value);

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  };

  if (counters.length > 0 && "IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  const tiltTargets = document.querySelectorAll(".card, .topic-card, .types-card");
  if (!reduceMotion) {
    tiltTargets.forEach((card) => {
      card.setAttribute("data-tilt", "true");
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 8;
        const rotateX = (0.5 - y) * 8;
        card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  document.querySelectorAll("[data-eco-tabs]").forEach((tabsRoot) => {
    const buttons = tabsRoot.querySelectorAll(".eco-tab-btn");
    const panels = tabsRoot.querySelectorAll(".eco-tab-panel");
    if (buttons.length === 0 || panels.length === 0) return;

    const activate = (id) => {
      buttons.forEach((btn) => {
        const selected = btn.getAttribute("data-tab-target") === id;
        btn.setAttribute("aria-selected", String(selected));
      });
      panels.forEach((panel) => {
        const active = panel.getAttribute("data-tab-id") === id;
        panel.classList.toggle("is-active", active);
      });
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        activate(btn.getAttribute("data-tab-target"));
      });
    });

    activate(buttons[0].getAttribute("data-tab-target"));
  });

  document.querySelectorAll("[data-eco-quiz]").forEach((quiz) => {
    const result = quiz.querySelector("[data-quiz-result]");
    quiz.addEventListener("submit", (event) => {
      event.preventDefault();

      let total = 0;
      let correct = 0;
      quiz.querySelectorAll(".q").forEach((block) => {
        total += 1;
        const selected = block.querySelector("input[type='radio']:checked");
        if (selected && selected.value === "ok") {
          correct += 1;
        }
      });

      if (result) {
        result.textContent = `Punteggio: ${correct}/${total}. ${correct >= 2 ? "Ottimo orientamento green." : "Buon inizio: prova a rivedere le sezioni dell'annata."}`;
      }
    });
  });

  const formatDate = (isoValue) => {
    if (!isoValue) return "data non disponibile";
    const date = new Date(isoValue);
    if (Number.isNaN(date.getTime())) return "data non disponibile";
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const newsContainer = document.querySelector("[data-news-feed]");
  if (newsContainer) {
    const newsPath = newsContainer.getAttribute("data-news-path") || "../data/news.json";
    const updatedNode = document.querySelector("[data-news-updated]");
    const statusNode = document.querySelector("[data-news-status]");

    const candidatePaths = (() => {
      const cleanPath = newsPath.split("?")[0];
      const localPath = cleanPath.replace(/^\.\.?\//, "");
      const repoName = window.location.pathname.split("/").filter(Boolean)[0] || "";
      const values = [cleanPath];

      values.push(`/${localPath}`);
      if (repoName) {
        values.push(`/${repoName}/${localPath}`);
      }

      return Array.from(new Set(values.filter(Boolean)));
    })();

    const fetchWithRetry = async (path, maxAttempts = 4) => {
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const separator = path.includes("?") ? "&" : "?";
          const response = await fetch(`${path}${separator}t=${Date.now()}`);
          if (!response.ok) {
            throw new Error(`http_${response.status}`);
          }
          return await response.json();
        } catch (error) {
          if (attempt === maxAttempts) {
            throw error;
          }
          await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
        }
      }
      throw new Error("unreachable");
    };

    const staticFallbackItems = [
      {
        title: "Green School Treviso: monitoraggi e azioni in istituto",
        summary: "Approfondimenti sulle attivita locali di riduzione sprechi, monitoraggio consumi e coinvolgimento della comunita scolastica.",
        source: "Green School IIS",
        url: "https://greenschoolvv.altervista.org/",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "IIS Vittorio Veneto: aggiornamenti istituzionali",
        summary: "Comunicazioni ufficiali e iniziative scolastiche utili al percorso Green School del territorio.",
        source: "IIS Vittorio Veneto",
        url: "https://www.iisvittorioveneto.edu.it/",
        publishedAt: new Date().toISOString(),
      },
      {
        title: "QualEnergia: scenario energia e sostenibilita",
        summary: "Notizie tecniche su transizione energetica, rinnovabili e politiche ambientali da fonti specializzate.",
        source: "QualEnergia",
        url: "https://www.qualenergia.it/",
        publishedAt: new Date().toISOString(),
      },
    ];

    const renderItems = (items) => {
      newsContainer.innerHTML = items
        .map((item) => {
          const title = escapeHtml(item.title || "Notizia");
          const summary = escapeHtml(item.summary || "Nessun riepilogo disponibile.");
          const source = escapeHtml(item.source || "Fonte non indicata");
          const url = escapeHtml(item.url || "#");
          const pubDate = formatDate(item.publishedAt);
          return `
            <article class="card news-item reveal visible">
              <div class="news-meta">
                <span class="news-chip">${source}</span>
                <span class="news-chip">${pubDate}</span>
              </div>
              <h3>${title}</h3>
              <p>${summary}</p>
              <a class="news-link" href="${url}" target="_blank" rel="noopener noreferrer">Apri notizia</a>
            </article>
          `;
        })
        .join("");
    };

    const renderFallback = () => {
      renderItems(staticFallbackItems);
      if (statusNode) {
        statusNode.textContent = "fallback locale attivo";
      }
      if (updatedNode) {
        updatedNode.textContent = formatDate(new Date().toISOString());
      }
    };

    const loadNews = async () => {
      for (const path of candidatePaths) {
        try {
          const payload = await fetchWithRetry(path, 4);
          return payload;
        } catch (error) {
          continue;
        }
      }
      throw new Error("all_paths_failed");
    };

    loadNews()
      .then((payload) => {
        const items = Array.isArray(payload.items) ? payload.items : [];

        if (updatedNode) {
          updatedNode.textContent = formatDate(payload.updatedAt);
        }
        if (statusNode) {
          statusNode.textContent = items.length > 0 ? "attivo" : "in attesa di contenuti";
        }

        if (items.length === 0) {
          renderFallback();
          return;
        }

        renderItems(items);
      })
      .catch(() => {
        renderFallback();
      });
  }
})();
