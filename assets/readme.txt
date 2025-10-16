Custom Icon Instructions
========================

This project ships without bundled binary icon assets. To add your own branding:

1. Place your high-resolution artwork as `assets/logo.png`. Use a square canvas (minimum 1024×1024) so the downscaled icons stay crisp.
2. Generate a Windows `.ico` file that contains the standard sizes 16, 32, 48, 64, 128, 256. Two quick options:
   - **ImageMagick** (installed separately):<br>`magick assets/logo.png -define icon:auto-resize=256,128,64,48,32,16 assets/icon.ico`
   - **icoConvert.com**: upload `logo.png`, tick the size boxes above, and download the `.ico` bundle.
3. Update `package.json` to point to the icon by editing the Windows build block:
   ````json
   "build": {
     "win": {
       "target": "nsis",
       "icon": "assets/icon.ico"
     }
   }
   ````
   Keep the indentation consistent with the rest of the file.
4. Re-run the launcher compiler if you need the standalone `.exe` helper icon:
   ```powershell
   pwsh ./tools/make-launcher.ps1 -Output MosaicStudioLauncher.exe
   ```
   The script automatically embeds `assets/icon.ico` when it finds the file.
5. Regenerate installers with `npm run dist` (or `npm run dist:win`) so the new icon is embedded in the packaged app.
