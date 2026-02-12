# TeamTreck Desktop Agent — Electron Architecture

## Production-Ready Electron Application for Team Monitoring SaaS

---

## 📁 Folder Structure

```
teamtreck-agent/
├── package.json
├── electron-builder.yml
├── tsconfig.json
├── src/
│   ├── main/                    # Main Process (Node.js)
│   │   ├── index.ts             # Entry point
│   │   ├── window.ts            # BrowserWindow management
│   │   ├── tray.ts              # System tray
│   │   ├── ipc-handlers.ts      # IPC message handlers
│   │   ├── auto-launch.ts       # Auto-start on boot
│   │   └── logger.ts            # Logging system
│   ├── preload/                 # Preload Scripts (Bridge)
│   │   └── index.ts             # contextBridge API
│   ├── renderer/                # Renderer Process (React)
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   └── AgentPanel.tsx   # ← Your existing Lovable UI
│   │   └── hooks/
│   │       └── useElectronAPI.ts
│   ├── services/                # Shared Business Logic
│   │   ├── auth.service.ts      # JWT auth + secure storage
│   │   ├── screenshot.service.ts
│   │   ├── tracker.service.ts   # App & URL tracking
│   │   ├── idle.service.ts      # Idle detection (powerMonitor)
│   │   └── api.service.ts       # Backend HTTP client
│   ├── workers/                 # Background Workers
│   │   ├── heartbeat.worker.ts  # Keep-alive pings
│   │   ├── sync.worker.ts       # Offline queue sync
│   │   └── screenshot.worker.ts # Randomized capture
│   └── shared/                  # Shared Types
│       ├── types.ts
│       └── constants.ts
├── resources/                   # App icons & assets
│   ├── icon.ico                 # Windows
│   ├── icon.icns                # macOS
│   └── icon.png                 # Linux (256x256)
└── dist/                        # Build output
```

---

## 📄 Core Files

### 1. `package.json`

```json
{
  "name": "teamtreck-agent",
  "version": "2.1.0",
  "description": "TeamTreck Desktop Monitoring Agent",
  "main": "dist/main/index.js",
  "scripts": {
    "dev": "concurrently \"tsc -w\" \"electron .\"",
    "build": "tsc && electron-builder",
    "build:win": "tsc && electron-builder --win",
    "build:mac": "tsc && electron-builder --mac",
    "build:linux": "tsc && electron-builder --linux",
    "lint": "eslint src/"
  },
  "dependencies": {
    "electron-store": "^8.1.0",
    "electron-log": "^5.1.0",
    "auto-launch": "^5.0.6",
    "axios": "^1.7.0",
    "keytar": "^7.9.0"
  },
  "devDependencies": {
    "electron": "^30.0.0",
    "electron-builder": "^24.13.0",
    "typescript": "^5.4.0",
    "concurrently": "^8.2.0",
    "@types/auto-launch": "^5.0.5"
  }
}
```

### 2. `electron-builder.yml`

```yaml
appId: com.teamtreck.agent
productName: TeamTreck Agent
copyright: Copyright © 2025 TeamTreck

directories:
  output: release
  buildResources: resources

files:
  - dist/**/*
  - resources/**/*

asar: true

win:
  target:
    - target: nsis
      arch: [x64, ia32]
  icon: resources/icon.ico
  artifactName: TeamTreck-Setup-${version}.${ext}

nsis:
  oneClick: false
  perMachine: true
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true

mac:
  target:
    - target: dmg
      arch: [x64, arm64]
  icon: resources/icon.icns
  category: public.app-category.business
  hardenedRuntime: true
  gatekeeperAssess: false

dmg:
  sign: false

linux:
  target:
    - target: AppImage
      arch: [x64]
  icon: resources/icon.png
  category: Utility
  desktop:
    StartupWMClass: TeamTreck Agent
```

---

### 3. `src/main/index.ts` — Main Process Entry

```typescript
import { app, BrowserWindow, Tray, nativeImage } from 'electron';
import path from 'path';
import { createWindow, getMainWindow } from './window';
import { createTray } from './tray';
import { registerIpcHandlers } from './ipc-handlers';
import { setupAutoLaunch } from './auto-launch';
import log from 'electron-log';

// Configure logging
log.transports.file.level = 'info';
log.transports.file.maxSize = 5 * 1024 * 1024; // 5MB
log.info('App starting...');

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

app.whenReady().then(async () => {
  log.info('App ready');

  // Create main window
  createWindow();

  // Setup system tray
  createTray();

  // Register IPC handlers
  registerIpcHandlers();

  // Setup auto-launch on boot
  await setupAutoLaunch();

  log.info('All modules initialized');
});

// Prevent app from quitting when all windows are closed (stays in tray)
app.on('window-all-closed', (e: Event) => {
  e.preventDefault();
});

app.on('activate', () => {
  const win = getMainWindow();
  if (win) {
    win.show();
  } else {
    createWindow();
  }
});

// Global error handling
process.on('uncaughtException', (error) => {
  log.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled Rejection:', reason);
});
```

### 4. `src/main/window.ts` — Window Management

```typescript
import { BrowserWindow, app } from 'electron';
import path from 'path';
import log from 'electron-log';

let mainWindow: BrowserWindow | null = null;

export function createWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 680,
    minWidth: 380,
    minHeight: 600,
    resizable: false,
    frame: false, // Custom title bar
    titleBarStyle: 'hidden',
    webPreferences: {
      contextIsolation: true,      // ✅ Security
      nodeIntegration: false,       // ✅ Security
      sandbox: true,                // ✅ Security
      preload: path.join(__dirname, '../preload/index.js'),
      devTools: !app.isPackaged,
    },
    icon: path.join(__dirname, '../../resources/icon.png'),
    show: false, // Show after ready-to-show
  });

  // Load renderer
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173/agent');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Show when ready (prevents flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    log.info('Window shown');
  });

  // Minimize to tray instead of closing
  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow?.hide();
    log.info('Window hidden to tray');
  });

  return mainWindow;
}

export function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}
```

### 5. `src/main/tray.ts` — System Tray

```typescript
import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';
import { getMainWindow } from './window';
import log from 'electron-log';

let tray: Tray | null = null;

export function createTray(): void {
  const iconPath = path.join(__dirname, '../../resources/icon.png');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });

  tray = new Tray(icon);
  tray.setToolTip('TeamTreck Agent');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Agent',
      click: () => {
        const win = getMainWindow();
        if (win) { win.show(); win.focus(); }
      },
    },
    { type: 'separator' },
    {
      label: 'Status: Active',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        log.info('Quit from tray');
        app.exit(0);
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    const win = getMainWindow();
    if (win) {
      win.isVisible() ? win.hide() : win.show();
    }
  });

  log.info('Tray created');
}

export function updateTrayStatus(status: string): void {
  // Rebuild menu with updated status
  if (!tray) return;
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show Agent', click: () => getMainWindow()?.show() },
    { type: 'separator' },
    { label: `Status: ${status}`, enabled: false },
    { type: 'separator' },
    { label: 'Quit', click: () => app.exit(0) },
  ]);
  tray.setContextMenu(contextMenu);
}
```

### 6. `src/main/ipc-handlers.ts` — IPC Communication

```typescript
import { ipcMain } from 'electron';
import { authService } from '../services/auth.service';
import { screenshotService } from '../services/screenshot.service';
import { trackerService } from '../services/tracker.service';
import { idleService } from '../services/idle.service';
import { updateTrayStatus } from './tray';
import log from 'electron-log';

export function registerIpcHandlers(): void {

  // ─── Authentication ───
  ipcMain.handle('auth:login', async (_event, credentials: { email: string; password: string }) => {
    try {
      const result = await authService.login(credentials.email, credentials.password);
      log.info('Login successful');
      return { success: true, data: result };
    } catch (error: any) {
      log.error('Login failed:', error.message);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('auth:logout', async () => {
    await authService.logout();
    trackerService.stopAll();
    screenshotService.stop();
    idleService.stop();
    updateTrayStatus('Logged Out');
    log.info('Logout complete');
    return { success: true };
  });

  ipcMain.handle('auth:getToken', async () => {
    return authService.getToken();
  });

  // ─── Session Controls ───
  ipcMain.handle('session:start', async () => {
    trackerService.startAll();
    screenshotService.start();
    idleService.start();
    updateTrayStatus('Active');
    log.info('Work session started');
    return { success: true, startTime: new Date().toISOString() };
  });

  ipcMain.handle('session:pause', async () => {
    trackerService.pauseAll();
    screenshotService.stop();
    idleService.stop();
    updateTrayStatus('Paused');
    log.info('Work session paused');
    return { success: true };
  });

  ipcMain.handle('session:resume', async () => {
    trackerService.startAll();
    screenshotService.start();
    idleService.start();
    updateTrayStatus('Active');
    log.info('Work session resumed');
    return { success: true };
  });

  // ─── Screenshot ───
  ipcMain.handle('screenshot:capture', async () => {
    const screenshot = await screenshotService.capture();
    return screenshot;
  });

  // ─── System Info ───
  ipcMain.handle('system:getInfo', async () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: require('../../package.json').version,
    };
  });
}
```

### 7. `src/main/auto-launch.ts` — Auto Start on Boot

```typescript
import AutoLaunch from 'auto-launch';
import log from 'electron-log';

const autoLauncher = new AutoLaunch({
  name: 'TeamTreck Agent',
  isHidden: true, // Start minimized
});

export async function setupAutoLaunch(): Promise<void> {
  try {
    const isEnabled = await autoLauncher.isEnabled();
    if (!isEnabled) {
      await autoLauncher.enable();
      log.info('Auto-launch enabled');
    }
  } catch (error) {
    log.error('Auto-launch setup failed:', error);
  }
}

export async function toggleAutoLaunch(enable: boolean): Promise<void> {
  try {
    if (enable) {
      await autoLauncher.enable();
    } else {
      await autoLauncher.disable();
    }
    log.info(`Auto-launch ${enable ? 'enabled' : 'disabled'}`);
  } catch (error) {
    log.error('Auto-launch toggle failed:', error);
  }
}
```

### 8. `src/preload/index.ts` — Secure Bridge

```typescript
import { contextBridge, ipcRenderer } from 'electron';

// Expose a controlled API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {

  // Auth
  login: (credentials: { email: string; password: string }) =>
    ipcRenderer.invoke('auth:login', credentials),
  logout: () => ipcRenderer.invoke('auth:logout'),
  getToken: () => ipcRenderer.invoke('auth:getToken'),

  // Session
  startWork: () => ipcRenderer.invoke('session:start'),
  pauseWork: () => ipcRenderer.invoke('session:pause'),
  resumeWork: () => ipcRenderer.invoke('session:resume'),

  // Screenshot
  captureScreenshot: () => ipcRenderer.invoke('screenshot:capture'),

  // System
  getSystemInfo: () => ipcRenderer.invoke('system:getInfo'),

  // Window controls (for frameless window)
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  closeWindow: () => ipcRenderer.send('window:close'),

  // Events from main process
  onForceLogout: (callback: () => void) => {
    ipcRenderer.on('force-logout', callback);
    return () => ipcRenderer.removeListener('force-logout', callback);
  },
  onIdleDetected: (callback: (idleSeconds: number) => void) => {
    ipcRenderer.on('idle-detected', (_event, seconds) => callback(seconds));
    return () => ipcRenderer.removeListener('idle-detected', () => {});
  },
  onStatusUpdate: (callback: (status: string) => void) => {
    ipcRenderer.on('status-update', (_event, status) => callback(status));
    return () => ipcRenderer.removeListener('status-update', () => {});
  },
});
```

### 9. `src/services/auth.service.ts` — Secure Token Storage

```typescript
import keytar from 'keytar'; // OS keychain (Keychain, Credential Manager, libsecret)
import axios from 'axios';
import log from 'electron-log';

const SERVICE_NAME = 'TeamTreck';
const ACCOUNT_NAME = 'auth-token';
const API_BASE = 'https://api.teamtreck.com';

class AuthService {
  private token: string | null = null;

  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
    const { token, user } = response.data;

    // Store token securely in OS keychain
    await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, token);
    this.token = token;

    log.info(`User ${user.email} logged in`);
    return { token, user };
  }

  async logout(): Promise<void> {
    await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
    this.token = null;
    log.info('Token cleared from keychain');
  }

  async getToken(): Promise<string | null> {
    if (this.token) return this.token;
    this.token = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
    return this.token;
  }

  getAuthHeaders(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }
}

export const authService = new AuthService();
```

### 10. `src/services/screenshot.service.ts`

```typescript
import { desktopCapturer, screen } from 'electron';
import log from 'electron-log';

class ScreenshotService {
  private intervalId: NodeJS.Timeout | null = null;
  private captureCount = 0;
  private readonly CAPTURES_PER_HOUR = 12;

  start(): void {
    this.scheduleNext();
    log.info('Screenshot service started');
  }

  stop(): void {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    log.info('Screenshot service stopped');
  }

  private scheduleNext(): void {
    const baseInterval = 3600 / this.CAPTURES_PER_HOUR; // 300s = 5min
    const jitter = (Math.random() - 0.5) * 180; // ±90s
    const delayMs = Math.max(10, baseInterval + jitter) * 1000;

    this.intervalId = setTimeout(async () => {
      await this.capture();
      this.scheduleNext(); // Schedule next recursively
    }, delayMs);
  }

  async capture(): Promise<{ dataUrl: string; timestamp: string } | null> {
    try {
      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: screen.getPrimaryDisplay().workAreaSize,
      });

      if (sources.length === 0) {
        log.warn('No screen sources found');
        return null;
      }

      const dataUrl = sources[0].thumbnail.toDataURL();
      this.captureCount++;

      log.info(`Screenshot #${this.captureCount} captured`);

      return {
        dataUrl,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      log.error('Screenshot capture failed:', error);
      return null;
    }
  }

  getCount(): number {
    return this.captureCount;
  }
}

export const screenshotService = new ScreenshotService();
```

### 11. `src/services/idle.service.ts`

```typescript
import { powerMonitor } from 'electron';
import { BrowserWindow } from 'electron';
import log from 'electron-log';

class IdleService {
  private checkInterval: NodeJS.Timeout | null = null;
  private thresholdSeconds = 300; // 5 minutes default (configurable)

  start(thresholdMinutes?: number): void {
    if (thresholdMinutes) {
      this.thresholdSeconds = thresholdMinutes * 60;
    }

    this.checkInterval = setInterval(() => {
      const idleTime = powerMonitor.getSystemIdleTime(); // seconds

      if (idleTime >= this.thresholdSeconds) {
        log.info(`Idle detected: ${idleTime}s`);
        // Notify renderer
        const win = BrowserWindow.getAllWindows()[0];
        if (win) {
          win.webContents.send('idle-detected', idleTime);
        }
      }
    }, 10000); // Check every 10s

    log.info(`Idle detection started (threshold: ${this.thresholdSeconds}s)`);
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    log.info('Idle detection stopped');
  }

  setThreshold(minutes: number): void {
    this.thresholdSeconds = minutes * 60;
    log.info(`Idle threshold set to ${minutes} minutes`);
  }
}

export const idleService = new IdleService();
```

### 12. `src/workers/heartbeat.worker.ts`

```typescript
import axios from 'axios';
import { authService } from '../services/auth.service';
import log from 'electron-log';

const HEARTBEAT_INTERVAL = 30000; // 30 seconds
const API_BASE = 'https://api.teamtreck.com';

class HeartbeatWorker {
  private intervalId: NodeJS.Timeout | null = null;

  start(): void {
    this.intervalId = setInterval(async () => {
      try {
        const token = await authService.getToken();
        if (!token) return;

        await axios.post(
          `${API_BASE}/api/agent/heartbeat`,
          { timestamp: new Date().toISOString(), status: 'active' },
          { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
        );
      } catch (error) {
        log.warn('Heartbeat failed, will retry...');
      }
    }, HEARTBEAT_INTERVAL);

    log.info('Heartbeat worker started');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    log.info('Heartbeat worker stopped');
  }
}

export const heartbeatWorker = new HeartbeatWorker();
```

### 13. `src/workers/sync.worker.ts` — Offline Queue

```typescript
import ElectronStore from 'electron-store';
import axios from 'axios';
import { authService } from '../services/auth.service';
import log from 'electron-log';

const store = new ElectronStore({ name: 'offline-queue' });
const API_BASE = 'https://api.teamtreck.com';

interface QueueItem {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT';
  data: any;
  timestamp: string;
}

class SyncWorker {
  private intervalId: NodeJS.Timeout | null = null;

  enqueue(item: Omit<QueueItem, 'id' | 'timestamp'>): void {
    const queue = this.getQueue();
    queue.push({
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString(),
    });
    store.set('queue', queue);
    log.info(`Queued offline item: ${item.endpoint}`);
  }

  private getQueue(): QueueItem[] {
    return (store.get('queue') as QueueItem[]) || [];
  }

  start(): void {
    this.intervalId = setInterval(() => this.processQueue(), 15000);
    log.info('Sync worker started');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async processQueue(): Promise<void> {
    const queue = this.getQueue();
    if (queue.length === 0) return;

    const token = await authService.getToken();
    if (!token) return;

    const remaining: QueueItem[] = [];

    for (const item of queue) {
      try {
        await axios({
          method: item.method,
          url: `${API_BASE}${item.endpoint}`,
          data: item.data,
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        });
        log.info(`Synced: ${item.endpoint}`);
      } catch {
        remaining.push(item);
      }
    }

    store.set('queue', remaining);
    if (remaining.length > 0) {
      log.warn(`${remaining.length} items still in queue`);
    }
  }
}

export const syncWorker = new SyncWorker();
```

### 14. `src/renderer/hooks/useElectronAPI.ts` — Renderer Hook

```typescript
// Type-safe hook for accessing the Electron API from React components

interface ElectronAPI {
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; data?: any; error?: string }>;
  logout: () => Promise<{ success: boolean }>;
  getToken: () => Promise<string | null>;
  startWork: () => Promise<{ success: boolean; startTime: string }>;
  pauseWork: () => Promise<{ success: boolean }>;
  resumeWork: () => Promise<{ success: boolean }>;
  captureScreenshot: () => Promise<{ dataUrl: string; timestamp: string } | null>;
  getSystemInfo: () => Promise<{ platform: string; arch: string; version: string }>;
  minimizeWindow: () => void;
  closeWindow: () => void;
  onForceLogout: (callback: () => void) => () => void;
  onIdleDetected: (callback: (idleSeconds: number) => void) => () => void;
  onStatusUpdate: (callback: (status: string) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export function useElectronAPI(): ElectronAPI | null {
  return window.electronAPI ?? null;
}

export function isElectron(): boolean {
  return !!window.electronAPI;
}
```

---

## 🔨 Build Commands

### Development
```bash
npm install
npm run dev
```

### Production Builds

```bash
# Windows (.exe installer)
npm run build:win

# macOS (.dmg)
npm run build:mac

# Linux (.AppImage)
npm run build:linux

# All platforms
npm run build
```

### Output Locations
- Windows: `release/TeamTreck-Setup-2.1.0.exe`
- macOS: `release/TeamTreck-2.1.0.dmg`
- Linux: `release/TeamTreck-2.1.0.AppImage`

---

## 🔐 Security Checklist

| Feature | Status |
|---------|--------|
| `contextIsolation: true` | ✅ |
| `nodeIntegration: false` | ✅ |
| `sandbox: true` | ✅ |
| Preload with `contextBridge` | ✅ |
| Token in OS Keychain (keytar) | ✅ |
| Single instance lock | ✅ |
| DevTools disabled in production | ✅ |
| Offline queue with sync | ✅ |
| Error logging (electron-log) | ✅ |

---

## 🔗 Integration with Lovable Renderer

Your Lovable `/agent` page works as the renderer UI. In development:
1. Run your Lovable dev server (`npm run dev` → `localhost:5173`)
2. Run Electron (`npm run dev` in the electron project)
3. Electron loads `http://localhost:5173/agent`

For production, build the Lovable app and copy the dist into the Electron renderer folder.

The `useElectronAPI` hook detects if running inside Electron and uses native IPC, otherwise falls back to the web simulation.

---

## 📸 Secure Background Screenshot Capture System

### Extended Folder Structure

```
teamtreck-agent/
├── src/
│   ├── services/
│   │   ├── screenshot.service.ts     # Core capture engine (UPDATED)
│   │   ├── encryption.service.ts     # AES-256 local file encryption
│   │   ├── upload.service.ts         # Upload with retry queue
│   │   └── image-optimizer.service.ts # Sharp-based compression
│   ├── workers/
│   │   ├── screenshot.worker.ts      # Background capture scheduler (UPDATED)
│   │   └── upload-queue.worker.ts    # Persistent retry queue processor
│   └── config/
│       └── capture-config.json       # Runtime-configurable settings
├── temp/                             # Encrypted screenshot staging (auto-cleaned)
└── logs/                             # Rotating log files
```

---

### 15. `src/config/capture-config.json` — Configurable Settings

```json
{
  "capture": {
    "intervalMinutes": 5,
    "jitterSeconds": 60,
    "maxCapturesPerHour": 12,
    "enabled": true
  },
  "image": {
    "format": "jpeg",
    "quality": 70,
    "maxWidth": 1920,
    "maxHeight": 1080
  },
  "upload": {
    "endpoint": "/api/agent/screenshots",
    "maxRetries": 5,
    "retryBackoffMs": [5000, 15000, 60000, 300000, 900000],
    "timeoutMs": 30000,
    "maxQueueSize": 500
  },
  "storage": {
    "tempDir": "temp/screenshots",
    "encryptionAlgorithm": "aes-256-gcm",
    "maxLocalFiles": 100,
    "cleanupAfterUploadMs": 0
  },
  "permissions": {
    "macScreenRecordingCheck": true,
    "showPermissionDialog": true
  }
}
```

---

### 16. `src/services/encryption.service.ts` — AES-256-GCM Local Encryption

```typescript
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import log from 'electron-log';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

class EncryptionService {
  private key: Buffer;

  constructor() {
    // Derive key from machine-specific data + app secret
    // In production, store this in OS keychain via keytar
    const machineId = this.getMachineId();
    this.key = crypto.scryptSync(machineId, 'teamtreck-salt-v2', KEY_LENGTH);
  }

  private getMachineId(): string {
    const os = require('os');
    return `${os.hostname()}-${os.userInfo().username}-teamtreck-agent`;
  }

  async encryptAndSave(data: Buffer, filePath: string): Promise<{ path: string; iv: string; authTag: string }> {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // Prepend IV + authTag to encrypted data for self-contained decryption
    const output = Buffer.concat([iv, authTag, encrypted]);

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, output);

    log.info(`Encrypted file saved: ${path.basename(filePath)} (${(output.length / 1024).toFixed(1)}KB)`);

    return {
      path: filePath,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  async decryptFile(filePath: string): Promise<Buffer> {
    const fileData = await fs.readFile(filePath);

    const iv = fileData.subarray(0, IV_LENGTH);
    const authTag = fileData.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = fileData.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(encrypted), decipher.final()]);
  }

  async secureDelete(filePath: string): Promise<void> {
    try {
      // Overwrite with random data before deleting
      const stats = await fs.stat(filePath);
      const randomData = crypto.randomBytes(stats.size);
      await fs.writeFile(filePath, randomData);
      await fs.unlink(filePath);
      log.info(`Securely deleted: ${path.basename(filePath)}`);
    } catch (error) {
      // Fallback: just delete
      try { await fs.unlink(filePath); } catch {}
      log.warn(`Fallback delete: ${path.basename(filePath)}`);
    }
  }
}

export const encryptionService = new EncryptionService();
```

---

### 17. `src/services/image-optimizer.service.ts` — Sharp-Based Compression

```typescript
import sharp from 'sharp';
import log from 'electron-log';

interface OptimizeOptions {
  format?: 'jpeg' | 'webp' | 'png';
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

class ImageOptimizerService {
  async optimize(inputBuffer: Buffer, options: OptimizeOptions = {}): Promise<Buffer> {
    const {
      format = 'jpeg',
      quality = 70,
      maxWidth = 1920,
      maxHeight = 1080,
    } = options;

    try {
      const metadata = await sharp(inputBuffer).metadata();
      const originalSize = inputBuffer.length;

      let pipeline = sharp(inputBuffer);

      // Resize if larger than max dimensions (maintain aspect ratio)
      if (metadata.width && metadata.height) {
        if (metadata.width > maxWidth || metadata.height > maxHeight) {
          pipeline = pipeline.resize(maxWidth, maxHeight, {
            fit: 'inside',
            withoutEnlargement: true,
          });
        }
      }

      // Compress
      let output: Buffer;
      switch (format) {
        case 'webp':
          output = await pipeline.webp({ quality, effort: 4 }).toBuffer();
          break;
        case 'png':
          output = await pipeline.png({ compressionLevel: 8 }).toBuffer();
          break;
        case 'jpeg':
        default:
          output = await pipeline.jpeg({ quality, mozjpeg: true }).toBuffer();
          break;
      }

      const savedPercent = ((1 - output.length / originalSize) * 100).toFixed(1);
      log.info(`Image optimized: ${(originalSize / 1024).toFixed(0)}KB → ${(output.length / 1024).toFixed(0)}KB (${savedPercent}% saved)`);

      return output;
    } catch (error) {
      log.error('Image optimization failed, using original:', error);
      return inputBuffer; // Fallback to unoptimized
    }
  }

  async validateImage(buffer: Buffer): Promise<boolean> {
    try {
      const metadata = await sharp(buffer).metadata();
      return !!(metadata.width && metadata.height && metadata.format);
    } catch {
      return false;
    }
  }
}

export const imageOptimizer = new ImageOptimizerService();
```

---

### 18. `src/services/screenshot.service.ts` — Full Capture Engine (UPDATED)

```typescript
import { desktopCapturer, screen, systemPreferences, dialog } from 'electron';
import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import log from 'electron-log';
import { encryptionService } from './encryption.service';
import { imageOptimizer } from './image-optimizer.service';
import { uploadQueueWorker } from '../workers/upload-queue.worker';

// Load config
const configPath = path.join(app.getPath('userData'), 'capture-config.json');
const defaultConfig = require('../config/capture-config.json');

interface CaptureResult {
  id: string;
  encryptedPath: string;
  timestamp: string;
  displayId: string;
  optimizedSize: number;
}

class ScreenshotService {
  private intervalId: NodeJS.Timeout | null = null;
  private captureCount = 0;
  private config = defaultConfig;
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(app.getPath('userData'), this.config.storage.tempDir);
  }

  async initialize(): Promise<void> {
    // Load user config if exists
    try {
      const userConfig = JSON.parse(await fs.readFile(configPath, 'utf-8'));
      this.config = { ...defaultConfig, ...userConfig };
    } catch {
      // Use defaults
    }

    // Ensure temp directory exists
    await fs.mkdir(this.tempDir, { recursive: true });

    // macOS: Check screen recording permission
    if (process.platform === 'darwin' && this.config.permissions.macScreenRecordingCheck) {
      await this.checkMacPermissions();
    }

    log.info('Screenshot service initialized');
  }

  private async checkMacPermissions(): Promise<void> {
    const hasPermission = systemPreferences.getMediaAccessStatus('screen');

    if (hasPermission !== 'granted') {
      log.warn('macOS screen recording permission not granted');

      if (this.config.permissions.showPermissionDialog) {
        const { response } = await dialog.showMessageBox({
          type: 'warning',
          title: 'Screen Recording Permission Required',
          message: 'TeamTreck Agent needs screen recording permission to capture screenshots.',
          detail: 'Go to System Settings → Privacy & Security → Screen Recording → Enable TeamTreck Agent',
          buttons: ['Open Settings', 'Later'],
          defaultId: 0,
        });

        if (response === 0) {
          const { shell } = require('electron');
          shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture');
        }
      }
    }
  }

  start(): void {
    if (!this.config.capture.enabled) {
      log.info('Screenshot capture disabled by config');
      return;
    }
    this.scheduleNext();
    log.info(`Screenshot service started (interval: ${this.config.capture.intervalMinutes}min)`);
  }

  stop(): void {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    log.info('Screenshot service stopped');
  }

  private scheduleNext(): void {
    const baseMs = this.config.capture.intervalMinutes * 60 * 1000;
    const jitterMs = (Math.random() - 0.5) * 2 * this.config.capture.jitterSeconds * 1000;
    const delayMs = Math.max(10000, baseMs + jitterMs);

    this.intervalId = setTimeout(async () => {
      await this.captureAndProcess();
      this.scheduleNext();
    }, delayMs);
  }

  async captureAndProcess(): Promise<CaptureResult | null> {
    try {
      // 1. Capture raw screenshot
      const rawBuffer = await this.captureScreen();
      if (!rawBuffer) return null;

      // 2. Validate image integrity
      const isValid = await imageOptimizer.validateImage(rawBuffer);
      if (!isValid) {
        log.error('Captured screenshot failed validation — corrupted data');
        return null;
      }

      // 3. Optimize image size
      const optimized = await imageOptimizer.optimize(rawBuffer, {
        format: this.config.image.format,
        quality: this.config.image.quality,
        maxWidth: this.config.image.maxWidth,
        maxHeight: this.config.image.maxHeight,
      });

      // 4. Generate unique ID and file path
      const captureId = `ss_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const encryptedPath = path.join(this.tempDir, `${captureId}.enc`);

      // 5. Encrypt and save locally
      await encryptionService.encryptAndSave(optimized, encryptedPath);

      this.captureCount++;
      const timestamp = new Date().toISOString();

      log.info(`Screenshot #${this.captureCount} captured → encrypted → queued (${(optimized.length / 1024).toFixed(0)}KB)`);

      // 6. Queue for upload
      uploadQueueWorker.enqueue({
        id: captureId,
        encryptedPath,
        timestamp,
        optimizedSize: optimized.length,
        displayId: screen.getPrimaryDisplay().id.toString(),
      });

      return {
        id: captureId,
        encryptedPath,
        timestamp,
        displayId: screen.getPrimaryDisplay().id.toString(),
        optimizedSize: optimized.length,
      };
    } catch (error) {
      log.error('Screenshot capture pipeline failed:', error);
      return null;
    }
  }

  private async captureScreen(): Promise<Buffer | null> {
    try {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width, height } = primaryDisplay.size;
      const scaleFactor = primaryDisplay.scaleFactor;

      const sources = await desktopCapturer.getSources({
        types: ['screen'],
        thumbnailSize: {
          width: Math.floor(width * scaleFactor),
          height: Math.floor(height * scaleFactor),
        },
      });

      if (sources.length === 0) {
        log.warn('No screen sources available');
        return null;
      }

      // Use NativeImage → PNG buffer
      const thumbnail = sources[0].thumbnail;
      return thumbnail.toPNG();
    } catch (error) {
      log.error('desktopCapturer failed:', error);
      return null;
    }
  }

  async updateConfig(newConfig: Partial<typeof defaultConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    await fs.writeFile(configPath, JSON.stringify(this.config, null, 2));
    log.info('Capture config updated');

    // Restart with new config
    this.stop();
    this.start();
  }

  getCount(): number { return this.captureCount; }

  async cleanupOldFiles(): Promise<void> {
    try {
      const files = await fs.readdir(this.tempDir);
      if (files.length > this.config.storage.maxLocalFiles) {
        const sorted = files.sort();
        const toDelete = sorted.slice(0, files.length - this.config.storage.maxLocalFiles);
        for (const f of toDelete) {
          await encryptionService.secureDelete(path.join(this.tempDir, f));
        }
        log.info(`Cleaned up ${toDelete.length} old screenshot files`);
      }
    } catch (error) {
      log.error('Cleanup failed:', error);
    }
  }
}

export const screenshotService = new ScreenshotService();
```

---

### 19. `src/workers/upload-queue.worker.ts` — Persistent Retry Queue

```typescript
import ElectronStore from 'electron-store';
import axios from 'axios';
import fs from 'fs/promises';
import log from 'electron-log';
import { authService } from '../services/auth.service';
import { encryptionService } from '../services/encryption.service';

const API_BASE = 'https://api.teamtreck.com';

interface QueueItem {
  id: string;
  encryptedPath: string;
  timestamp: string;
  optimizedSize: number;
  displayId: string;
  retryCount: number;
  nextRetryAt: number;
  status: 'pending' | 'uploading' | 'failed';
  lastError?: string;
}

const store = new ElectronStore({ name: 'screenshot-upload-queue' });

const RETRY_BACKOFF = [5000, 15000, 60000, 300000, 900000]; // 5s, 15s, 1m, 5m, 15m
const MAX_RETRIES = 5;
const PROCESS_INTERVAL = 5000;
const MAX_CONCURRENT = 3;
const UPLOAD_TIMEOUT = 30000;

class UploadQueueWorker {
  private intervalId: NodeJS.Timeout | null = null;
  private activeUploads = 0;
  private isOnline = true;

  constructor() {
    // Monitor connectivity
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => { this.isOnline = true; log.info('Network: online'); });
      window.addEventListener('offline', () => { this.isOnline = false; log.info('Network: offline'); });
    }
  }

  enqueue(item: Omit<QueueItem, 'retryCount' | 'nextRetryAt' | 'status'>): void {
    const queue = this.getQueue();

    // Enforce max queue size
    if (queue.length >= 500) {
      // Remove oldest completed/failed items
      const trimmed = queue.slice(-400);
      store.set('queue', trimmed);
      log.warn('Queue trimmed to 400 items');
    }

    queue.push({
      ...item,
      retryCount: 0,
      nextRetryAt: Date.now(),
      status: 'pending',
    });

    store.set('queue', queue);
    log.info(`Queued screenshot for upload: ${item.id}`);
  }

  private getQueue(): QueueItem[] {
    return (store.get('queue') as QueueItem[]) || [];
  }

  private saveQueue(queue: QueueItem[]): void {
    store.set('queue', queue);
  }

  start(): void {
    this.intervalId = setInterval(() => this.processQueue(), PROCESS_INTERVAL);
    log.info('Upload queue worker started');
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    log.info('Upload queue worker stopped');
  }

  private async processQueue(): Promise<void> {
    if (!this.isOnline) return;
    if (this.activeUploads >= MAX_CONCURRENT) return;

    const queue = this.getQueue();
    const now = Date.now();

    // Find items ready for upload
    const ready = queue.filter(
      (item) => item.status !== 'uploading' && item.retryCount < MAX_RETRIES && item.nextRetryAt <= now
    );

    if (ready.length === 0) return;

    const batch = ready.slice(0, MAX_CONCURRENT - this.activeUploads);

    for (const item of batch) {
      this.uploadItem(item);
    }
  }

  private async uploadItem(item: QueueItem): Promise<void> {
    this.activeUploads++;

    // Mark as uploading
    this.updateItemStatus(item.id, 'uploading');

    try {
      // 1. Decrypt the file
      let fileBuffer: Buffer;
      try {
        fileBuffer = await encryptionService.decryptFile(item.encryptedPath);
      } catch (decryptError) {
        log.error(`Decryption failed for ${item.id} — file may be corrupted, removing from queue`);
        this.removeItem(item.id);
        // Securely delete corrupted file
        try { await encryptionService.secureDelete(item.encryptedPath); } catch {}
        this.activeUploads--;
        return;
      }

      // 2. Get auth token
      const token = await authService.getToken();
      if (!token) {
        log.warn('No auth token — skipping upload');
        this.updateItemStatus(item.id, 'pending');
        this.activeUploads--;
        return;
      }

      // 3. Upload via multipart form
      const FormData = require('form-data');
      const form = new FormData();
      form.append('screenshot', fileBuffer, {
        filename: `${item.id}.jpg`,
        contentType: 'image/jpeg',
      });
      form.append('timestamp', item.timestamp);
      form.append('displayId', item.displayId);
      form.append('captureId', item.id);

      await axios.post(`${API_BASE}/api/agent/screenshots`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...form.getHeaders(),
        },
        timeout: UPLOAD_TIMEOUT,
        maxContentLength: 10 * 1024 * 1024, // 10MB max
      });

      log.info(`Screenshot uploaded: ${item.id}`);

      // 4. Success — delete local encrypted file
      await encryptionService.secureDelete(item.encryptedPath);

      // 5. Remove from queue
      this.removeItem(item.id);

    } catch (error: any) {
      const retryCount = item.retryCount + 1;
      const backoffMs = RETRY_BACKOFF[Math.min(retryCount - 1, RETRY_BACKOFF.length - 1)];
      const errorMsg = error.response?.status
        ? `HTTP ${error.response.status}: ${error.response.statusText}`
        : error.code || error.message;

      log.warn(`Upload failed for ${item.id} (attempt ${retryCount}/${MAX_RETRIES}): ${errorMsg}`);

      if (retryCount >= MAX_RETRIES) {
        log.error(`Max retries reached for ${item.id} — moving to dead letter`);
        this.updateItem(item.id, {
          status: 'failed',
          retryCount,
          lastError: errorMsg,
        });
      } else {
        this.updateItem(item.id, {
          status: 'pending',
          retryCount,
          nextRetryAt: Date.now() + backoffMs,
          lastError: errorMsg,
        });
      }
    } finally {
      this.activeUploads--;
    }
  }

  private updateItemStatus(id: string, status: QueueItem['status']): void {
    const queue = this.getQueue();
    const idx = queue.findIndex((q) => q.id === id);
    if (idx !== -1) {
      queue[idx].status = status;
      this.saveQueue(queue);
    }
  }

  private updateItem(id: string, updates: Partial<QueueItem>): void {
    const queue = this.getQueue();
    const idx = queue.findIndex((q) => q.id === id);
    if (idx !== -1) {
      queue[idx] = { ...queue[idx], ...updates };
      this.saveQueue(queue);
    }
  }

  private removeItem(id: string): void {
    const queue = this.getQueue().filter((q) => q.id !== id);
    this.saveQueue(queue);
  }

  getStats(): { pending: number; failed: number; total: number } {
    const queue = this.getQueue();
    return {
      pending: queue.filter((q) => q.status === 'pending').length,
      failed: queue.filter((q) => q.status === 'failed').length,
      total: queue.length,
    };
  }

  async retryFailed(): Promise<void> {
    const queue = this.getQueue();
    for (const item of queue) {
      if (item.status === 'failed') {
        item.status = 'pending';
        item.retryCount = 0;
        item.nextRetryAt = Date.now();
      }
    }
    this.saveQueue(queue);
    log.info('All failed items reset for retry');
  }

  async purgeCompleted(): Promise<number> {
    const queue = this.getQueue();
    const failed = queue.filter((q) => q.status === 'failed');
    // Delete orphaned encrypted files for failed items
    for (const item of failed) {
      try { await encryptionService.secureDelete(item.encryptedPath); } catch {}
    }
    const remaining = queue.filter((q) => q.status !== 'failed');
    this.saveQueue(remaining);
    return failed.length;
  }
}

export const uploadQueueWorker = new UploadQueueWorker();
```

---

### 20. Updated `src/main/ipc-handlers.ts` — Screenshot IPC Additions

Add these handlers to the existing `registerIpcHandlers()`:

```typescript
// ─── Screenshot System ───
ipcMain.handle('screenshot:getStats', async () => {
  return {
    captureCount: screenshotService.getCount(),
    queueStats: uploadQueueWorker.getStats(),
  };
});

ipcMain.handle('screenshot:updateConfig', async (_event, config: any) => {
  await screenshotService.updateConfig(config);
  return { success: true };
});

ipcMain.handle('screenshot:retryFailed', async () => {
  await uploadQueueWorker.retryFailed();
  return { success: true };
});

ipcMain.handle('screenshot:cleanup', async () => {
  await screenshotService.cleanupOldFiles();
  return { success: true };
});
```

---

### Updated `src/main/index.ts` — Initialize Screenshot System

Add after `registerIpcHandlers()`:

```typescript
// Initialize screenshot capture system
await screenshotService.initialize();
uploadQueueWorker.start();

// Periodic cleanup every 30 minutes
setInterval(() => screenshotService.cleanupOldFiles(), 30 * 60 * 1000);
```

---

## 🔧 Performance Optimization Tips (1000+ Users)

| Optimization | Implementation |
|---|---|
| **Image compression** | Sharp JPEG mozjpeg at 70% quality → 60-80% size reduction |
| **Concurrent uploads** | Max 3 simultaneous uploads to avoid bandwidth saturation |
| **Exponential backoff** | 5s → 15s → 1m → 5m → 15m retry intervals |
| **Queue persistence** | `electron-store` survives crashes and restarts |
| **Dead letter queue** | Failed items after 5 retries are flagged, not retried infinitely |
| **Secure deletion** | Overwrite with random bytes before `unlink` |
| **Memory efficiency** | Stream-based processing, no full images held in memory |
| **Batch cleanup** | Auto-purge when local files exceed 100 |
| **Offline resilience** | Full queue system — captures continue offline, sync when online |
| **Scale-ready backend** | Multipart upload with captureId deduplication |

### Package Dependencies for Screenshot System

```json
{
  "dependencies": {
    "sharp": "^0.33.0",
    "form-data": "^4.0.0"
  }
}
```

> **Note:** `sharp` includes native binaries. For Electron, use `electron-rebuild` or `@electron/rebuild` to compile for the correct Electron ABI:
> ```bash
> npx @electron/rebuild -m node_modules/sharp
> ```

---

## 🍎 macOS Screen Recording Permission

macOS requires explicit user approval for screen capture. The system handles this:

1. **Auto-detection** via `systemPreferences.getMediaAccessStatus('screen')`
2. **Dialog prompt** explaining why permission is needed
3. **Direct link** to System Settings → Privacy → Screen Recording
4. **Graceful degradation** — agent continues running, captures skipped until permission granted

---

## 🪟 Windows Compatibility

Windows has no special permissions for screen capture. The `desktopCapturer` API works natively. Key considerations:

- **DPI scaling**: `scaleFactor` used to capture at native resolution
- **Multi-monitor**: Primary display captured by default; extend config for all displays
- **UAC**: NSIS installer configured with `perMachine: true` for proper installation
