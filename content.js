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
      // Match the current URL against the valid URL pattern
      const match = window.location.href.match(validURLPattern);
      if (!match) return;

      // Extract project name, application name, and page type from the URL
      const projectName = match[1];
      const appName = match[2];
      const page = match[3];

      // Locate the dropdown menu in the project header
      const dropdown = document.querySelector('ul[aria-labelledby="project"].dropdown-menu.dropdown-menu-right');
      if (!dropdown) {
      // Retry after a short delay if the dropdown is not yet available
      setTimeout(insertNav, 100);
      return;
      }

      // Get all service links from the dropdown
      const services = Array.from(dropdown.querySelectorAll('a'));
      if (services.length <= 2) return; // Skip if there are not enough services

      // Remove any existing navigation bar to avoid duplicates
      if (document.getElementById("Q-bar")) {
      document.getElementById("Q-bar").remove();
      }

      // Create a new navigation bar element
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

      // Append the navigation bar to the project header container
      const container = document.querySelector(".project-header > .container");
      if (container) container.appendChild(navContainer);

      // Skip certain indices (e.g., migration links)
      const skip = [];
      const migrationIndex = services.findIndex((a) => a.textContent.includes("migrate-"));
      if (migrationIndex !== -1) skip.push(migrationIndex);

      // Configure the migrations button
      const migrationsLink = services[migrationIndex];
      if (migrationsLink) {
      document.getElementById("Q-migrations-btn").setAttribute("href", migrationsLink.getAttribute("href") + "/" + page);
      } else {
      document.getElementById("Q-migrations-btn").style.display = "none"; // Hide if no migration link is found
      }

      // Find the current service index based on the application name in the URL
      const currentIndex = services.findIndex(a => {
      const hash = new URL(a.href, window.location.origin).hash;
      const appMatch = hash.match(/\/applications\/([^/]+)/);
      return appMatch?.[1] === appName;
      });

      // Get references to the previous and next buttons
      const prevBtn = document.getElementById("Q-prev-btn");
      const nextBtn = document.getElementById("Q-next-btn");

      // Helper function to find the next valid index, skipping certain indices
      const getValidIndex = (start, step) => {
      let index = start;
      while (skip.includes(index)) index += step;
      return (index + services.length) % services.length;
      };

      // Configure the previous and next buttons if the current index is valid
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
