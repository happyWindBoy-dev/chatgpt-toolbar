import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  setUserConfig: (userConfig) => ipcRenderer.send('set-user-config', userConfig),
  getUserConfig: () => ipcRenderer.invoke('get:userConfig')

});