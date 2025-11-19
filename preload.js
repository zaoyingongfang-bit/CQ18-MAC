/**
 * Electron预加载脚本
 * 桥接主进程和渲染进程，提供安全的API
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getMachineCode: () => ipcRenderer.invoke('get-machine-code'),
  verifyAuthCode: (machineCode, authCode) => ipcRenderer.invoke('verify-auth-code', machineCode, authCode),
  copyToClipboard: (text) => ipcRenderer.invoke('copy-to-clipboard', text),
  openExternalProgram: (path) => ipcRenderer.invoke('open-external-program', path),
  encryptFile: (inputPath) => ipcRenderer.invoke('encrypt-file', inputPath),
  decryptFile: (encryptedPath) => ipcRenderer.invoke('decrypt-file', encryptedPath),
  checkEncryptedFile: (fileName) => ipcRenderer.invoke('check-encrypted-file', fileName),
  checkRecordingSoftware: () => ipcRenderer.invoke('check-recording-software'),
  saveAuthFileToCDrive: (fileName, fileData) => ipcRenderer.invoke('save-auth-file-to-c-drive', fileName, fileData),
});

console.log('✓ Electron API已注入到网页（包含文件加密、防录屏功能）');
