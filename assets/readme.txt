Custom Icon Instructions
========================

This project ships without bundled binary icon assets. To add your own branding:

1. Prepare a square PNG named `logo.png` (at least 512×512) and place it in `assets/`.
2. When packaging for Windows, convert `logo.png` into an `.ico` bundle that contains 16, 32, 48, 256 px variants. You can use free tools such as:
   - https://icoconvert.com/
   - ImageMagick: `magick logo.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico`
3. Save the generated `icon.ico` to `assets/icon.ico`.
4. Restore the Windows builder icon setting by editing `package.json` and adding the line:
   ````json
   "icon": "assets/icon.ico"
   ````
   under `build.win`.
5. Optionally export `logo.png` in additional sizes for macOS/Linux if you plan to provide platform-specific icons.

After the files are in place, rebuild the installer (`npm run dist` or `npm run dist:win`).
