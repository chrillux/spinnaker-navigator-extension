(function () {
  // Detect the appropriate storage API
  const storage = chrome?.storage?.sync || browser?.storage?.sync || chrome?.storage?.local || browser?.storage?.local;

  if (!storage) {
    console.error("Storage API is not available. Check permissions in manifest.json.");
    return;
  }

  const searchBarSelector = '.global-search'; // Adjust if necessary
  const dropdownSelector = 'ul[aria-labelledby="project"].dropdown-menu.dropdown-menu-right'; // Refined selector
  const appLinkSelector = 'a'; // Links inside the dropdown
  const navContainerId = 'spinnaker-nav-container'; // Unique ID for the navigation container

  const validURLPattern = /^https:\/\/.*\/#\/projects\/.*\/applications\/([^/]+)\/executions$/;

  // Retrieve the saved domain from storage
  storage.get("spinnakerDomain", (data) => {
    const savedDomain = data && data.spinnakerDomain || (data && data["spinnakerDomain"]);

    if (!savedDomain) {
      console.log("No Spinnaker domain configured. Exiting.");
      return;
    }

    if (!window.location.href.startsWith(savedDomain)) {
      console.log(`Current URL does not match the saved Spinnaker domain (${savedDomain}). Exiting.`);
      return;
    }

    console.log(`Spinnaker domain matched: ${savedDomain}. Initializing extension...`);

    // Function to add navigation arrows
    const addNavigationArrows = () => {
      const currentURL = window.location.href;

      // Extract the application name from the current URL
      const match = currentURL.match(validURLPattern);
      if (!match) {
        removeNavigationArrows();
        return false;
      }

      // Locate the search bar
      const searchBar = document.querySelector(searchBarSelector);
      if (!searchBar) {
        setTimeout(addNavigationArrows, 100); // Retry after 100ms
        return false; // Retry later
      }

      // Locate the correct dropdown menu
      const dropdown = document.querySelector(dropdownSelector);
      if (!dropdown) {
        setTimeout(addNavigationArrows, 100);
        return false; 
      }

      // Locate all links within the dropdown
      const applications = Array.from(dropdown.querySelectorAll(appLinkSelector));
      if (applications.length === 0) {
        setTimeout(addNavigationArrows, 100);
        return false;
      }

      const currentAppName = match[1];

      // Find the precise index of the current application
      const currentIndex = applications.findIndex((app) => {
        const appHref = new URL(app.getAttribute("href"), window.location.origin).hash;
        const appName = appHref.match(/\/applications\/([^/]+)/)?.[1];
        return appName === currentAppName;
      });

      if (currentIndex === -1) {
        // Current application not found in the dropdown links. Retry later.
        return false;
      }

      // Create navigation buttons
      const navContainer = document.createElement("div");
      navContainer.id = navContainerId; // Assign unique ID to avoid duplicates
      navContainer.style.display = "inline-flex";
      navContainer.style.alignItems = "center";
      navContainer.style.marginLeft = "10px";

      const prevButton = document.createElement("button");
      prevButton.textContent = "← Previous";
      prevButton.disabled = currentIndex <= 1;
      prevButton.style.marginRight = "5px";
      prevButton.style.padding = "5px 10px";
      prevButton.style.cursor = "pointer";
      prevButton.onclick = () => {
        if (currentIndex > 0) {
          const prevApplication = applications[currentIndex - 1].getAttribute("href");
          const prevExecutionURL = prevApplication + "/executions";
          window.location.href = prevExecutionURL;
        }
      };

      const nextButton = document.createElement("button");
      nextButton.textContent = "Next →";
      nextButton.disabled = currentIndex >= applications.length - 1;
      nextButton.style.padding = "5px 10px";
      nextButton.style.cursor = "pointer";
      nextButton.onclick = () => {
        if (currentIndex < applications.length - 1) {
          const nextApplication = applications[currentIndex + 1].getAttribute("href");
          const nextExecutionURL = nextApplication + "/executions";
          window.location.href = nextExecutionURL;
        }
      };

      removeNavigationArrows(); // Remove existing arrows if any
      navContainer.appendChild(prevButton);
      navContainer.appendChild(nextButton);

      // Add the navigation container next to the search bar
      searchBar.parentNode.insertBefore(navContainer, searchBar.nextSibling);

      return true;
    };

    const removeNavigationArrows = () => {
      const navContainer = document.getElementById(navContainerId);
      if (navContainer) {
        navContainer.remove();
      }
    };

    // Monitor URL changes using MutationObserver
    let lastURL = window.location.href;

    const observer = new MutationObserver(() => {
      const currentURL = window.location.href;
      if (currentURL !== lastURL) {
        lastURL = currentURL;
        addNavigationArrows(); // Check the new URL and add/remove arrows as needed
      }
    });

    // Start observing the document for URL changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Immediately call `addNavigationArrows` to initialize on page load
    addNavigationArrows();
  });
})();
