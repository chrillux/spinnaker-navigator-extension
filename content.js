(function () {
  const storage = chrome?.storage?.sync || browser?.storage?.sync || chrome?.storage?.local || browser?.storage?.local;

  if (!storage) {
    console.error("Storage API is not available. Check permissions in manifest.json.");
    return;
  }

  const validURLPattern = /^https:\/\/.*\/#\/projects\/([^/]+)\/applications\/([^/]+)\/(executions|pipelines)/;

  storage.get("spinnakerDomain", (data) => {
    const savedDomain = data?.spinnakerDomain || data?.["spinnakerDomain"];
    if (!savedDomain || !window.location.href.startsWith(savedDomain)) return;

    const insertNav = () => {
      const match = window.location.href.match(validURLPattern);
      if (!match) return;

      const projectName = match[1];
      const appName = match[2];
      const page = match[3];

      const dropdown = document.querySelector('ul[aria-labelledby="project"].dropdown-menu.dropdown-menu-right');
      if (!dropdown) {
        setTimeout(insertNav, 100);
        return;
      }

      const services = Array.from(dropdown.querySelectorAll('a'));
      if (services.length <= 2) return;

      if (document.getElementById("Q-bar")) {
        document.getElementById("Q-bar").remove(); // avoid duplicates
      }

      const navContainer = document.createElement("div");
      navContainer.id = "Q-bar";
      navContainer.style.cssText = "float: right; width: auto; margin: 5px 25px; position: relative; right: 35%;";
      navContainer.innerHTML = `
        <ul class="nav" style="display: flex;">
          <li class="previous Q-btn"><a id="Q-prev-btn" href="#"><span>← Previous</span></a></li>
          <li class="Q-btn"><a id="Q-migrations-btn" href="#"><span>⚙️ Migrations</span></a></li>
          <li class="next Q-btn"><a id="Q-next-btn" href="#"><span>Next →</span></a></li>
        </ul>
      `;
      const container = document.querySelector(".project-header > .container");
      if (container) container.appendChild(navContainer);

      const skip = [];
      const migrationIndex = services.findIndex((a) => a.textContent.includes("migrate-"));
      if (migrationIndex !== -1) skip.push(migrationIndex);

      const migrationsLink = services[migrationIndex];
      if (migrationsLink) {
        document.getElementById("Q-migrations-btn").setAttribute("href", migrationsLink.getAttribute("href") + "/" + page);
      } else {
        document.getElementById("Q-migrations-btn").style.display = "none";
      }

      const currentIndex = services.findIndex(a => {
        const hash = new URL(a.href, window.location.origin).hash;
        const appMatch = hash.match(/\/applications\/([^/]+)/);
        return appMatch?.[1] === appName;
      });

      const prevBtn = document.getElementById("Q-prev-btn");
      const nextBtn = document.getElementById("Q-next-btn");

      const getValidIndex = (start, step) => {
        let index = start;
        while (skip.includes(index)) index += step;
        return (index + services.length) % services.length;
      };

      if (currentIndex !== -1) {
        const prevIndex = getValidIndex(currentIndex - 1, -1);
        const nextIndex = getValidIndex(currentIndex + 1, 1);

        const prevHref = services[prevIndex].getAttribute("href") + "/" + page;
        const nextHref = services[nextIndex].getAttribute("href") + "/" + page;

        prevBtn.setAttribute("href", prevHref);
        nextBtn.setAttribute("href", nextHref);
      }
    };

    // Watch for DOM changes and URL changes
    let lastURL = location.href;
    new MutationObserver(() => {
      const currentURL = location.href;
      if (currentURL !== lastURL) {
        lastURL = currentURL;
        insertNav();
      }
    }).observe(document.body, { childList: true, subtree: true });

    insertNav(); // initial call
  });
})();
