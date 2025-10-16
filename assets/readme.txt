Custom Icon Instructions
========================

This project ships without bundled binary icon assets. To add your own branding:

1. Export a square PNG named `logo.png` at 1024×1024 (higher resolutions are fine). Drop the file into this folder (`assets/logo.png`).
2. Create the Windows icon bundle from the PNG. Two reliable options:
   - **icoconvert.com** → upload `logo.png`, choose "ICO for Windows", check 16/32/48/256 px, download the archive and extract `favicon.ico`.
   - **ImageMagick** (installed locally):
     ```powershell
     magick assets/logo.png -define icon:auto-resize=256,128,64,48,32,16 assets/icon.ico
     ```
3. Verify the output file exists (`assets/icon.ico`) and contains the multi-size resources (Properties ➜ Details on Windows).
4. Edit `package.json` and under `"build": { "win": { ... } }` add:
   ```json
   "icon": "assets/icon.ico"
   ```
5. (Optional) Export additional PNG sizes (512, 256, 128) if you intend to create platform-specific icons for macOS/Linux later.

Once the PNG and ICO files are present, rebuild installers with `npm run dist` (or `npm run dist:win` for Windows-only packages).
