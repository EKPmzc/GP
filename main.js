const { app, BrowserWindow, globalShortcut, dialog } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    backgroundColor: '#11151c',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'src/index.html'));

  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('browser-window-focus', () => {
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (mainWindow) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });
});

app.on('browser-window-blur', () => {
  globalShortcut.unregisterAll();
});

// Provide graceful fallback when hardware acceleration fails
app.on('render-process-gone', (_event, webContents, details) => {
  dialog.showErrorBox(
    'Renderer process crashed',
    `The renderer process exited (${details.reason}). Restarting the window.`
  );
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.reload();
  }
});
