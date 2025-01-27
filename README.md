Here’s a `README.md` for your extension:

---

# Spinnaker Navigator Extension

Spinnaker Navigator is a browser extension that adds navigation arrows to Spinnaker application pages, allowing you to quickly jump between applications in a project. The extension works dynamically and only activates on the configured Spinnaker domain.

## Features

- **Navigate Between Applications**: Adds "Previous" and "Next" buttons to Spinnaker application pages for easy navigation.
- **Configurable Domain**: Supports custom Spinnaker instances by allowing users to set their domain in the extension's settings.
- **Cross-Browser Support**: Works on both Firefox and Chrome.

## Installation

### Firefox
1. Go to `about:debugging#/runtime/this-firefox`.
2. Click **"Load Temporary Add-on"** and select the `manifest.json` file from the extension folder.
3. Configure the domain in the settings page (see [Usage](#usage)).

### Chrome
1. Open `chrome://extensions/`.
2. Enable **Developer mode** (top-right toggle).
3. Click **"Load unpacked"** and select the extension folder.
4. Configure the domain in the settings page (see [Usage](#usage)).

## Usage

1. Open the extension's settings:
   - In Firefox: Navigate to `about:addons`, find the Spinnaker Navigator extension, and click **Preferences**.
   - In Chrome: Go to `chrome://extensions/`, find the extension, and click **Details** → **Extension Options**.
2. Enter your Spinnaker domain (e.g., `https://spinnaker.example.com`) and save.
3. Update manifest.json content_scripts and host_permissions domain to point to your spinnaker domain, e.g "*://spinnaker.example.com/*"
4. Navigate to your Spinnaker instance. The navigation arrows will appear on project -> application pages (e.g., `/executions`).

## Development

### Prerequisites
- A recent version of Firefox or Chrome.

### Folder Structure
```
/extension
  ├── content.js        # Main logic for adding navigation arrows
  ├── options.html      # Settings page for configuring the domain
  ├── options.js        # Logic for saving/loading settings
  ├── manifest.json     # Extension metadata
  ├── icon.png          # Icon for the extension
  └── README.md         # Documentation
```

### Debugging
1. Use the browser's developer console to view logs and debug issues.
2. Ensure the `manifest.json` includes the correct `permissions` for the storage API:
   ```json
   "permissions": ["storage"]
   ```

## Known Limitations

- The navigation arrows only work on application pages with the `/executions` path.
- Requires manual reloading of the extension during development.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests for enhancements or bug fixes.

## TODO

It is annoying that you have to configure both the plugin's settings + set the correct domain in manifest.json. I didn't have time to fix it so it is left like this. An improvement would be to only set the domain once and both the manifest and domain would be set. Maybe just skip the options page completely and run a search and replace in the json and js files that need the domain or something fancier idk.

## License

This project is licensed under the MIT License.
