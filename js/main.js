(() => {
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

  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav-list] a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (href.endsWith(currentPath)) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });

  const footerYear = document.querySelector("[data-year]");
  if (footerYear) {
    footerYear.textContent = String(new Date().getFullYear());
  }

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
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  document.querySelectorAll("[data-strip]").forEach((strip) => {
    const toggle = strip.querySelector("[data-strip-toggle]");
    if (!toggle) return;

    const updateLabel = () => {
      const paused = strip.getAttribute("data-paused") === "true";
      toggle.textContent = paused ? "Riprendi movimento" : "Pausa movimento";
      toggle.setAttribute("aria-pressed", String(paused));
    };

    toggle.addEventListener("click", () => {
      const paused = strip.getAttribute("data-paused") === "true";
      strip.setAttribute("data-paused", paused ? "false" : "true");
      updateLabel();
    });

    updateLabel();
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

    const renderFallback = (message) => {
      newsContainer.innerHTML = `
        <article class="card news-item reveal visible">
          <h3>Feed temporaneamente non disponibile</h3>
          <p>${message}</p>
        </article>
      `;
      if (statusNode) {
        statusNode.textContent = "degradato";
      }
    };

    fetch(newsPath)
      .then((response) => {
        if (!response.ok) {
          throw new Error("news feed non raggiungibile");
        }
        return response.json();
      })
      .then((payload) => {
        const items = Array.isArray(payload.items) ? payload.items : [];

        if (updatedNode) {
          updatedNode.textContent = formatDate(payload.updatedAt);
        }
        if (statusNode) {
          statusNode.textContent = items.length > 0 ? "attivo" : "in attesa di contenuti";
        }

        if (items.length === 0) {
          renderFallback("Nessuna notizia disponibile al momento. Riprova più tardi.");
          return;
        }

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
      })
      .catch(() => {
        renderFallback("Errore nella sincronizzazione automatica. Il sistema riproverà al prossimo aggiornamento giornaliero.");
      });
  }
})();
