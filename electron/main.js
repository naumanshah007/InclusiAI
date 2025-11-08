const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const waitOn = require('wait-on');

let mainWindow;
let nextProcess;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'InclusiAid - Empowering Independence Through AI',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../public/icons/icon-512x512.png'),
    titleBarStyle: 'default',
    backgroundColor: '#ffffff',
    show: false, // Don't show until ready
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the app
  if (isDev) {
    // In development, wait for Next.js dev server
    waitOn({
      resources: ['http://localhost:3000'],
      timeout: 30000,
    })
      .then(() => {
        mainWindow.loadURL('http://localhost:3000');
        if (isDev) {
          mainWindow.webContents.openDevTools();
        }
      })
      .catch((err) => {
        console.error('Error waiting for Next.js server:', err);
      });
  } else {
    // In production, wait for the Next.js server to start
    waitOn({
      resources: ['http://localhost:3000'],
      timeout: 30000,
    })
      .then(() => {
        mainWindow.loadURL('http://localhost:3000');
      })
      .catch((err) => {
        console.error('Error waiting for Next.js server:', err);
      });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startNextServer() {
  if (isDev) {
    // In development, assume Next.js dev server is already running
    return;
  }

  // In production, start the Next.js server from standalone build
  const appPath = app.getAppPath();
  const nextPath = path.join(appPath, '.next', 'standalone');
  const serverPath = path.join(nextPath, 'server.js');

  // Set environment variables
  const env = {
      ...process.env,
      PORT: '3000',
      NODE_ENV: 'production',
    };

  // Try to start the server
  try {
    nextProcess = spawn('node', [serverPath], {
      cwd: nextPath,
      env: env,
      stdio: 'inherit',
    });

    nextProcess.stdout?.on('data', (data) => {
      console.log(`Next.js: ${data}`);
    });

    nextProcess.stderr?.on('data', (data) => {
      console.error(`Next.js: ${data}`);
    });

    nextProcess.on('close', (code) => {
      console.log(`Next.js process exited with code ${code}`);
    });

    nextProcess.on('error', (err) => {
      console.error('Failed to start Next.js server:', err);
    });
  } catch (error) {
    console.error('Error starting Next.js server:', error);
  }
}

app.whenReady().then(() => {
  startNextServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (nextProcess) {
    nextProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (nextProcess) {
    nextProcess.kill();
  }
});
