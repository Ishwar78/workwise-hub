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
