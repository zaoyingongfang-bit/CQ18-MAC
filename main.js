/**
 * Electron 主进程（mac 版最小实现）
 */
const { app, BrowserWindow, ipcMain, clipboard, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    resizable: false,
    frame: true,
    backgroundColor: '#1a1a2e',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true,
      partition: 'persist:zaoyinfang',
      offscreen: false,
      backgroundThrottling: false,
    },
    show: false
  });
  mainWindow.setMenu(null);
  mainWindow.loadFile('index.html');
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => { mainWindow = null; });

  // 禁用刷新
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F5' || (input.control && input.key === 'r')) event.preventDefault();
  });

  // will-download 拦截：mac 上对 EXE 弹提示，普通文件直接打开
  mainWindow.webContents.session.on('will-download', (event, item) => {
    const url = item.getURL();
    if (!url.startsWith('file://')) return;
    event.preventDefault();

    let filePath = decodeURIComponent(url.replace('file:///', ''));
    const imagesIndex = filePath.indexOf('images/');
    if (imagesIndex === -1) return;
    const relativePath = filePath.substring(imagesIndex);

    if (relativePath.includes('EXE程序/')) {
      dialog.showMessageBox(mainWindow, {
        type: 'info', title: '暂未提供',
        message: '该功能暂未在 macOS 提供',
        detail: '此按钮对应的是 Windows 可执行程序，Mac 版本稍后提供。'
      });
      return;
    }

    const normalPath = path.join(__dirname, relativePath);
    if (fs.existsSync(normalPath)) {
      shell.openPath(normalPath).catch(e => console.error('打开文件失败:', e));
    } else {
      console.error('文件不存在:', normalPath);
    }
  });

  // 新窗口拦截
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('file://')) {
      let filePath = decodeURIComponent(url.replace('file:///', ''));
      const imagesIndex = filePath.indexOf('images/');
      if (imagesIndex !== -1) {
        const relativePath = filePath.substring(imagesIndex);
        if (relativePath.includes('EXE程序/')) {
          dialog.showMessageBox(mainWindow, {
            type: 'info', title: '暂未提供',
            message: '该功能暂未在 macOS 提供',
            detail: '此按钮对应的是 Windows 可执行程序，Mac 版本稍后提供。'
          });
          return { action: 'deny' };
        } else {
          const normalPath = path.join(__dirname, relativePath);
          if (fs.existsSync(normalPath)) shell.openPath(normalPath);
        }
      }
    }
    return { action: 'deny' };
  });
}

// 生成跨平台机器码（16位）
function generateMachineCode() {
  try {
    const ifaces = os.networkInterfaces();
    let mac = '';
    for (const name in ifaces) {
      for (const addr of ifaces[name] || []) {
        if (!addr.internal && addr.mac && addr.mac !== '00:00:00:00:00:00') { mac = addr.mac; break; }
      }
      if (mac) break;
    }
    const base = `${os.platform()}|${os.arch()}|${os.hostname()}|${mac}`;
    const hash = crypto.createHash('md5').update(base, 'utf-8').digest('hex').toUpperCase();
    return hash.substring(0, 16);
  } catch (e) {
    return 'ERROR000000000000';
  }
}

// 与前端一致的授权算法
function verifyAuthCode(machineCode, authCode) {
  try {
    const seed = 'ZAOYINFANG2024';
    function hashCode(s){ let h=0; for(let i=0;i<s.length;i++){ h=((h<<5)-h)+s.charCodeAt(i); h=h&h; } return Math.abs(h); }
    const layer1 = hashCode(machineCode + seed);
    const layer2 = hashCode(seed + machineCode);
    const layer3 = hashCode(machineCode.split('').reverse().join('') + seed);
    const combined = (layer1 ^ layer2 ^ layer3).toString(36).toUpperCase();
    const final = combined.substring(0,16).padEnd(16,'X');
    const checksum = hashCode(final) % 100;
    const validCode = final + checksum.toString().padStart(2,'0');
    const cleanCode = (authCode||'').toUpperCase().replace(/\s/g,'');
    return cleanCode === validCode;
  } catch { return false; }
}

// IPC
ipcMain.handle('get-machine-code', async () => generateMachineCode());
ipcMain.handle('verify-auth-code', async (e, machineCode, authCode) => verifyAuthCode(machineCode, authCode));
ipcMain.handle('copy-to-clipboard', async (e, text) => { clipboard.writeText(String(text||'')); return true; });
ipcMain.handle('open-external-program', async (e, programPath) => { try { await shell.openPath(programPath); return true; } catch { return false; } });
ipcMain.handle('save-auth-file-to-c-drive', async (e, fileName, fileData) => {
  try {
    const folder = process.platform === 'win32' ? 'C:\\00造音工坊授权文件' : path.join(app.getPath('desktop'), '造音工坊授权文件');
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    const filePath = path.join(folder, fileName);
    fs.writeFileSync(filePath, fileData);
    return filePath;
  } catch { return null; }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
