/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Tray,
  nativeImage,
  Menu,
  globalShortcut,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { menubar } from 'menubar';
import process from 'process';
import { getUserConfig, resolveHtmlPath, writeUserConfig } from './util';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

const image = nativeImage.createFromPath(getAssetPath('newiconTemplate.png'));

app.disableHardwareAcceleration();

app.commandLine.appendSwitch('disable-backgrounding-occluded-windows', 'true');

app.on('ready', () => {
  const tray = new Tray(image);
  const mb = menubar({
    browserWindow: {
      icon: image,
      frame: false,
      transparent: true,
      skipTaskbar: true,
      webPreferences: {
        webviewTag: true,
        nodeIntegration: true,
        sandbox: false,
        preload: app.isPackaged
          ? path.join(__dirname, 'preload.js')
          : path.join(__dirname, '../../.erb/dll/preload.js'),
      },
      width: 550,
      height: 650,
      show: false,
    },
    tray,

    showOnAllWorkspaces: true,
    preloadWindow: true,
    showDockIcon: true,
    icon: image,
    index: resolveHtmlPath('index.html'),
  });

  mb.on('ready', () => {
    const { window } = mb;
    app.dock.hide();

    window.setAlwaysOnTop(getUserConfig().alwaysOnTop);
    globalShortcut.register('CommandOrControl+Shift+g', () => {
      if (window.isVisible()) {
        mb.hideWindow();
      } else {
        mb.showWindow();
        if (process.platform == 'darwin') {
          mb.app.show();
        }
        mb.app.focus();
      }
    });

    ipcMain.on('set-user-config', (event, value) => {
      writeUserConfig(value);
      window.setAlwaysOnTop(getUserConfig().alwaysOnTop);
      window.reload();
    });

    ipcMain.handle('get:userConfig', getUserConfig);

    tray.on('right-click', () => {
      mb.tray.popUpContextMenu(
        Menu.buildFromTemplate([
          {
            label: 'Reload',
            click: () => {
              window.reload();
            },
          },
        ])
      );
    });
  });
});
