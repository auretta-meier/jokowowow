const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Jika dijalankan secara native di development, connect ke localhost:3000
  // Jika dijalankan di production, Anda bisa meload file index.html dari folder dist
  // Di sini kita asumsikan server Express sudah berjalan di port 3000
  mainWindow.loadURL('http://localhost:3000').catch((err) => {
    console.log("Menunggu server lokal berjalan di port 3000...");
    setTimeout(() => {
        mainWindow.loadURL('http://localhost:3000');
    }, 3000);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
