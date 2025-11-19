// 授权验证系统
class AuthSystem {
  constructor() {
    // ⭐⭐⭐ Electron版本：从主进程获取机器码（绑定硬件，不含分辨率）
    this.machineCode = '正在获取中...';
    
    // ⭐ 基于种子生成独立的存储key，但保持向后兼容
    const seed = 'ZAOYINFANG2024';  // 您可以手动修改这里
    this.currentSeed = seed;
    
    // 为了兼容，如果是默认种子就用原key，否则用新key
    if (seed === 'ZAOYINFANG2024') {
      this.authKey = 'app_authorization'; // 保持原有用户的授权
    } else {
      this.authKey = 'auth_' + seed.replace(/[^A-Z0-9]/g, ''); // 新版本用独立key
    }
    
    this.isAuthorized = false;  // ⭐ 初始设为false，等机器码获取后再检查
    
    // 立即异步获取机器码，然后检查授权
    this.initMachineCode();
  }
  
  // ⭐⭐⭐ Electron版本：从主进程获取稳定的机器码
  async initMachineCode() {
    try {
      if (window.electronAPI && window.electronAPI.getMachineCode) {
        // Electron环境：从主进程获取（绑定CPU、主板、BIOS）
        this.machineCode = await window.electronAPI.getMachineCode();
        console.log('[Electron] 机器码获取成功:', this.machineCode);
        
        // ⭐⭐⭐ 关键：机器码获取完成后，重新检查授权状态
        this.isAuthorized = this.checkAuthorization();
        console.log('[Electron] 授权状态:', this.isAuthorized);
        
        // 更新界面显示
        this.updateMachineCodeDisplay();
        
        // ⭐⭐⭐ 关键！发出事件，通知app.js授权状态已更新
        window.dispatchEvent(new CustomEvent('auth-status-updated', { 
          detail: { isAuthorized: this.isAuthorized } 
        }));
        console.log('[Electron] 已发出授权状态更新事件');
        
        // ⭐⭐⭐ 关键！如果已授权但页面还显示授权界面，刷新页面
        if (this.isAuthorized) {
          console.log('[Electron] 检测到已授权！');
          
          // 检查是否有授权弹窗
          const authModals = document.querySelectorAll('.modal.active');
          let hasAuthModal = false;
          authModals.forEach(modal => {
            if (modal.querySelector('.auth-modal-content') || modal.querySelector('.auth-container')) {
              hasAuthModal = true;
              modal.remove();
              console.log('[Electron] 已关闭授权弹窗');
            }
          });
          
          // ⭐⭐⭐ 如果初次加载且已授权，刷新页面显示主界面
          if (!sessionStorage.getItem('auth_initialized')) {
            console.log('[Electron] 首次加载且已授权，刷新页面显示主界面');
            sessionStorage.setItem('auth_initialized', 'true');
            location.reload();
            return;
          }
          
          // 触发授权成功事件
          window.dispatchEvent(new CustomEvent('auth-success'));
          console.log('[Electron] 授权状态已确认');
        } else {
          console.log('[Electron] 未授权，需要授权');
        }
        
      } else if (window.authBridge && typeof window.authBridge.generateMachineCode === 'function') {
        // PyQt6环境：使用authBridge
        const machineCodePromise = window.authBridge.generateMachineCode();
        this.machineCode = await machineCodePromise;
        console.log('[PyQt6] 机器码获取成功:', this.machineCode);
        
        // ⭐⭐⭐ 关键：机器码获取完成后，重新检查授权状态
        this.isAuthorized = this.checkAuthorization();
        console.log('[PyQt6] 授权状态:', this.isAuthorized);
        
        // 更新界面显示
        this.updateMachineCodeDisplay();
        
        // ⭐⭐⭐ 发出事件
        window.dispatchEvent(new CustomEvent('auth-status-updated', { 
          detail: { isAuthorized: this.isAuthorized } 
        }));
        
        // 如果已授权，刷新页面显示主界面
        if (this.isAuthorized && !sessionStorage.getItem('auth_initialized')) {
          console.log('[PyQt6] 首次加载且已授权，刷新页面');
          sessionStorage.setItem('auth_initialized', 'true');
          location.reload();
        }
        
      } else {
        // 备用：JavaScript生成（不推荐）
        console.warn('[备用] 使用JavaScript生成机器码');
        this.machineCode = this.generateMachineCodeFallback();
        this.isAuthorized = this.checkAuthorization();
        this.updateMachineCodeDisplay();
        
        // 如果已授权，刷新页面
        if (this.isAuthorized && !sessionStorage.getItem('auth_initialized')) {
          console.log('[备用] 首次加载且已授权，刷新页面');
          sessionStorage.setItem('auth_initialized', 'true');
          location.reload();
          return;
        }
        
        // 发出事件
        window.dispatchEvent(new CustomEvent('auth-status-updated', { 
          detail: { isAuthorized: this.isAuthorized } 
        }));
      }
    } catch (error) {
      console.error('[错误] 机器码获取失败:', error);
      this.machineCode = this.generateMachineCodeFallback();
      this.isAuthorized = this.checkAuthorization();
      this.updateMachineCodeDisplay();
      
      // 如果已授权，刷新页面
      if (this.isAuthorized && !sessionStorage.getItem('auth_initialized')) {
        console.log('[错误恢复] 首次加载且已授权，刷新页面');
        sessionStorage.setItem('auth_initialized', 'true');
        location.reload();
        return;
      }
      
      // 发出事件
      window.dispatchEvent(new CustomEvent('auth-status-updated', { 
        detail: { isAuthorized: this.isAuthorized } 
      }));
    }
  }
  
  // 更新机器码显示
  updateMachineCodeDisplay() {
    const elements = document.querySelectorAll('.code-text, #machine-code-display, .machine-code');
    elements.forEach(el => {
      el.textContent = this.machineCode;
    });
    console.log(`[UI] 机器码已更新到界面（${elements.length}个元素）`);
  }

  // 备用机器码生成方法（不包含分辨率）
  generateMachineCodeFallback() {
    // Canvas指纹（GPU硬件特征）
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('hw_fingerprint', 2, 2);
    const canvasFingerprint = canvas.toDataURL();
    
    // WebGL指纹（GPU硬件信息）
    const webglCanvas = document.createElement('canvas');
    const gl = webglCanvas.getContext('webgl') || webglCanvas.getContext('experimental-webgl');
    let webglFingerprint = 'none';
    if (gl) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      webglFingerprint = debugInfo ? 
        gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) + '|' + 
        gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 
        gl.getParameter(gl.VERSION) + '|' + gl.getParameter(gl.VENDOR);
    }
    
    // ⭐⭐⭐ 修复：不包含screen.width和screen.height（会随分辨率改变）
    const fingerprint = [
      // ❌ 删除：screen.width + 'x' + screen.height,
      // ❌ 删除：screen.availWidth + 'x' + screen.availHeight,
      screen.colorDepth,     // ✅ 保留：颜色深度（硬件特性，不常变）
      screen.pixelDepth,     // ✅ 保留：像素深度
      // CPU核心数（硬件特征）
      navigator.hardwareConcurrency || 'unknown',
      // 设备内存（相对稳定）
      navigator.deviceMemory || 'unknown',
      // 触摸点数（设备特征）
      navigator.maxTouchPoints || 0,
      // 时区（地理位置）
      new Date().getTimezoneOffset(),
      // GPU指纹（硬件特征）
      this.hashCode(canvasFingerprint),
      this.hashCode(webglFingerprint),
      // 平台信息（操作系统）
      navigator.platform,
      // 语言（系统语言）
      navigator.language
    ].join('|');
    
    // 多重哈希增强
    const hash1 = this.hashCode(fingerprint);
    const hash2 = this.hashCode(fingerprint.split('').reverse().join(''));
    const combined = (hash1 ^ hash2).toString(36).toUpperCase();
    return combined.substring(0, 16).padEnd(16, '0');
  }
  
  // IndexedDB存储支持（防止清除localStorage）
  async saveToIndexedDB(authData) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AuthDB', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['auth'], 'readwrite');
        const store = transaction.objectStore('auth');
        store.put(authData);
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('auth')) {
          db.createObjectStore('auth', { keyPath: 'id' });
        }
      };
    });
  }
  
  async loadFromIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('AuthDB', 1);
      
      request.onerror = () => resolve(null);
      
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('auth')) {
          resolve(null);
          return;
        }
        const transaction = db.transaction(['auth'], 'readonly');
        const store = transaction.objectStore('auth');
        const getRequest = store.get('authorization');
        
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = () => resolve(null);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('auth')) {
          db.createObjectStore('auth', { keyPath: 'id' });
        }
      };
    });
  }

  // 简单哈希函数
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  // ⭐ 验证手机号格式（中国手机号）
  validatePhoneNumber(phone) {
    // 中国手机号正则：1开头，第二位是3-9，共11位
    const phoneRegex = /^1[3-9]\d{9}$/;
    return phoneRegex.test(phone);
  }
  
  // ⭐ 获取已保存的手机号
  getPhoneNumber() {
    try {
      const stored = localStorage.getItem(this.authKey);
      if (stored) {
        const auth = JSON.parse(stored);
        return auth.phoneNumber || '';
      }
    } catch {
      return '';
    }
    return '';
  }
  
  // 生成授权码（与您的授权码生成器一致）
  generateAuthCode(machineCode, seed) {
    if (!seed) seed = this.currentSeed; // 使用构造函数中的种子
    const layer1 = this.hashCode(machineCode + seed);
    const layer2 = this.hashCode(seed + machineCode);
    const layer3 = this.hashCode(machineCode.split('').reverse().join('') + seed);
    
    const combined = (layer1 ^ layer2 ^ layer3).toString(36).toUpperCase();
    const final = combined.substring(0, 16).padEnd(16, 'X');
    
    const checksum = this.hashCode(final) % 100;
    return final + checksum.toString().padStart(2, '0');
  }
  
  // 验证授权码
  verifyAuthCode(inputCode) {
    const cleanCode = inputCode.toUpperCase().replace(/\s/g, '');
    const validCode = this.generateAuthCode(this.machineCode);
    
    console.log('[JS验证] 机器码:', this.machineCode);
    console.log('[JS验证] 输入授权码:', cleanCode);
    console.log('[JS验证] 计算授权码:', validCode);
    
    if (cleanCode !== validCode) return false;
    
    const stored = localStorage.getItem(this.authKey);
    if (stored) {
      try {
        const auth = JSON.parse(stored);
        if (auth.machineCode !== this.machineCode) {
          this.clearAuthorization();
          return false;
        }
      } catch {
        return false;
      }
    }
    
    return true;
  }

  // 检查是否已授权
  checkAuthorization() {
    let stored = localStorage.getItem(this.authKey);
    let auth = null;
    
    if (stored) {
      try {
        auth = JSON.parse(stored);
      } catch {
        stored = null;
      }
    }
    
    if (!stored) {
      this.loadFromIndexedDB().then(data => {
        if (data && data.authData) {
          localStorage.setItem(this.authKey, JSON.stringify(data.authData));
        }
      }).catch(error => {
        console.warn('IndexedDB加载失败:', error.message || error);
      });
      return false;
    }
    
    try {
      if (auth.machineCode !== this.machineCode) {
        this.clearAuthorization();
        return false;
      }
      
      // ⭐ 检查种子版本（关键：不同种子不能通用）
      if (auth.seedVersion && auth.seedVersion !== this.currentSeed) {
        this.clearAuthorization();
        return false;
      }
      
      if (!auth.authCode || auth.authCode.length !== 18) {
        this.clearAuthorization();
        return false;
      }
      
      const now = new Date().getTime();
      const authTime = auth.timestamp || 0;
      const daysPassed = (now - authTime) / (1000 * 60 * 60 * 24);
      
      if (daysPassed > 365) {
        this.clearAuthorization();
        return false;
      }
      
      return true;
    } catch {
      this.clearAuthorization();
      return false;
    }
  }

  // 保存授权
  saveAuthorization(authCode, phoneNumber = '') {
    const authData = {
      machineCode: this.machineCode,
      authCode: authCode,
      phoneNumber: phoneNumber,
      timestamp: new Date().getTime(),
      seedVersion: this.currentSeed  // ⭐ 记录种子版本
    };
    
    // 添加防篡改哈希
    authData.hash = this.hashCode(JSON.stringify({
      machineCode: authData.machineCode,
      authCode: authData.authCode,
      seedVersion: authData.seedVersion
    }));
    
    // 保存到localStorage
    localStorage.setItem(this.authKey, JSON.stringify(authData));
    
    // 保存到IndexedDB（冗余存储）
    this.saveToIndexedDB({
      id: 'authorization',
      authData: authData
    }).catch(err => console.warn('IndexedDB保存失败:', err));
    
    this.isAuthorized = true;
    
    // 设置定时检查（每30秒检查一次授权状态）
    this.startAuthCheck();
  }
  
  // 启动授权检查定时器
  startAuthCheck() {
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval);
    }
    
    this.authCheckInterval = setInterval(() => {
      if (!this.checkAuthorization()) {
        console.warn('授权验证失败，请重新授权');
        location.reload(); // 授权失败则刷新页面
      }
    }, 30000); // 每30秒检查一次
  }

  // 清除授权
  clearAuthorization() {
    localStorage.removeItem(this.authKey);
    this.isAuthorized = false;
  }
  
  // 加密数据
  encryptData(data) {
    const jsonStr = JSON.stringify(data);
    const key = 'WebStorageEncryptionKey2025@FileExport#Secure';
    let encrypted = '';
    
    for (let i = 0; i < jsonStr.length; i++) {
      const charCode = jsonStr.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      encrypted += String.fromCharCode(charCode);
    }
    
    return btoa(encrypted);
  }
  
  // 解密数据
  decryptData(encryptedData) {
    try {
      const encrypted = atob(encryptedData);
      const key = 'WebStorageEncryptionKey2025@FileExport#Secure';
      let decrypted = '';
      
      // XOR解密
      for (let i = 0; i < encrypted.length; i++) {
        const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        decrypted += String.fromCharCode(charCode);
      }
      
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error('授权文件已损坏或格式错误');
    }
  }
  
  
  // 导出授权文件（加密版）⭐⭐⭐ 修改：保存到C盘指定文件夹
  async exportAuthorization() {
    const stored = localStorage.getItem(this.authKey);
    if (!stored) {
      alert('没有找到授权信息');
      return;
    }
    
    const authData = JSON.parse(stored);
    const exportData = {
      version: '1.0',
      machineCode: this.machineCode,
      authCode: authData.authCode,
      timestamp: authData.timestamp,
      exportTime: new Date().getTime()
    };
    
    // 加密数据
    const encryptedData = this.encryptData(exportData);
    
    // 添加文件头标识（防止直接复制内容）
    const fileContent = 'ZAOYINAUTH' + encryptedData;
    // 确保文件名在所有系统上都兼容
    const safeMachineCode = this.machineCode.replace(/[^A-Z0-9]/g, ''); // 清理机器码中的特殊字符
    const fileName = `AuthFile_${safeMachineCode}.zaoyinauth`;
    
    // ⭐⭐⭐ Electron环境：保存到C盘指定文件夹
    if (window.electronAPI && window.electronAPI.saveAuthFileToCDrive) {
      try {
        const filePath = await window.electronAPI.saveAuthFileToCDrive(fileName, fileContent);
        if (filePath) {
          alert(`授权文件已导出到：\n${filePath}\n\n文件夹会自动打开`);
          // 打开文件夹
          if (window.electronAPI.openExternalProgram) {
            window.electronAPI.openExternalProgram('C:\\00造音工坊授权文件');
          }
        } else {
          alert('授权文件导出失败');
        }
        return;
      } catch (error) {
        console.error('Electron保存失败:', error);
      }
    }
    
    // 备用：浏览器环境，使用下载
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(fileContent);
    const blob = new Blob([uint8Array], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }
  
  // 导入授权文件（解密版）
  importAuthorization(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          // 读取文件内容
          const decoder = new TextDecoder();
          const fileContent = decoder.decode(e.target.result);
          
          // 验证文件头
          if (!fileContent.startsWith('ZAOYINAUTH')) {
            reject('授权文件格式错误或已损坏');
            return;
          }
          
          // 去除文件头，获取加密数据
          const encryptedData = fileContent.substring(10); // 'ZAOYINAUTH'.length = 10
          
          // 解密数据
          const importData = this.decryptData(encryptedData);
          
          // 验证版本
          if (!importData.version || !importData.machineCode || !importData.authCode) {
            reject('授权文件格式错误');
            return;
          }
          
          // 验证机器码是否匹配
          if (importData.machineCode !== this.machineCode) {
            reject('授权文件与当前设备不匹配');
            return;
          }
          
          // 验证授权码
          if (!this.verifyAuthCode(importData.authCode)) {
            reject('授权码验证失败');
            return;
          }
          
          // 保存授权
          this.saveAuthorization(importData.authCode);
          resolve('授权导入成功');
        } catch (error) {
          reject(error.message || '授权文件格式错误');
        }
      };
      reader.readAsArrayBuffer(file); // 以二进制方式读取
    });
  }

  // 获取机器码
  getMachineCode() {
    return this.machineCode;
  }
  
  // 兼容的复制文本函数（支持所有环境）
  copyToClipboard(text, button) {
    // 方法0: 优先使用 Qt 的剪贴板桥接（PyQt WebEngine 环境）
    if (typeof window.copyToClipboard === 'function') {
      try {
        const result = window.copyToClipboard(text);
        if (result) {
          this.showCopySuccess(button);
          return;
        }
      } catch (e) {
        console.log('Qt 剪贴板失败，尝试其他方法:', e);
      }
    }
    
    // 方法1: 尝试使用现代的 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
        .then(() => {
          this.showCopySuccess(button);
        })
        .catch((error) => {
          console.warn('剪贴板API失败:', error.message || error);
          // 如果失败，使用备用方法
          this.fallbackCopyTextToClipboard(text, button);
        });
    } else {
      // 如果不支持 Clipboard API，使用备用方法
      this.fallbackCopyTextToClipboard(text, button);
    }
  }
  
  // 备用复制方法（兼容所有浏览器和环境）
  fallbackCopyTextToClipboard(text, button) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // 使文本框不可见
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "2em";
    textArea.style.height = "2em";
    textArea.style.padding = "0";
    textArea.style.border = "none";
    textArea.style.outline = "none";
    textArea.style.boxShadow = "none";
    textArea.style.background = "transparent";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.showCopySuccess(button);
      } else {
        this.showCopyError(button);
      }
    } catch (err) {
      console.error('复制失败:', err);
      this.showCopyError(button);
    }
    
    document.body.removeChild(textArea);
  }
  
  // 显示复制成功
  showCopySuccess(button) {
    if (button) {
      const originalText = button.textContent;
      button.textContent = '已复制';
      button.style.background = '#10b981';
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
      }, 1500);
    }
  }
  
  // 显示复制失败
  showCopyError(button) {
    if (button) {
      const originalText = button.textContent;
      button.textContent = '复制失败';
      button.style.background = '#ef4444';
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
      }, 1500);
    }
  }

  // 显示授权弹窗（⭐ 新增手机号输入）
  showAuthModal(callback) {
    // 尝试获取上次保存的授权码和手机号
    const lastAuthCode = localStorage.getItem('last_auth_code') || '';
    const lastPhone = localStorage.getItem('last_phone_number') || '';
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-content auth-modal-content">
        <button class="modal-close auth-close-btn">×</button>
        <div class="auth-container">
          <div class="auth-icon">🔐</div>
          <h2>软件授权验证</h2>
          <p class="auth-description">本软件需要授权后才能使用，请先输入手机号再输入授权码</p>
          
          <div class="machine-code-box">
            <label>您的机器码：</label>
            <div class="code-display">
              <span class="code-text">${this.machineCode}</span>
              <button class="copy-btn copy-machine-code">复制</button>
            </div>
            <small>请将此机器码提供给开发者以获取授权码</small>
          </div>

          <div class="auth-input-box">
            <label>手机号：⭐</label>
            <input type="text" class="phone-input" placeholder="请输入手机号（11位）" maxlength="11" value="${lastPhone}">
            <div class="phone-error" style="display: none; color: #ff4444; font-size: 12px; margin-top: 5px;">请输入正确的11位手机号</div>
          </div>

          <div class="auth-input-box">
            <label>授权码：</label>
            <input type="text" class="auth-input" placeholder="请输入18位授权码" maxlength="18" value="${lastAuthCode}">
            <div class="auth-error" style="display: none;">授权码错误，请重新输入</div>
          </div>

          <div class="auth-buttons">
            <button class="auth-btn verify-btn">验证授权</button>
            <button class="auth-btn cancel-btn auth-cancel-btn">取消</button>
          </div>
          
          <div class="auth-actions">
            <button class="auth-action-btn import-btn">
              <span>📥</span>
              <span>导入授权文件</span>
            </button>
            <input type="file" class="file-input" accept=".zaoyinauth" style="display: none;">
          </div>

          <div class="auth-footer">
            <p>💡 提示：授权码与您的设备绑定，可导出授权文件在其他浏览器使用</p>
            <button class="wechat-contact-btn" onclick="window.authSystem.showWechatQR()">
              <span>💬</span>
              <span>联系微信获取授权</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const phoneInput = modal.querySelector('.phone-input');
    const phoneError = modal.querySelector('.phone-error');
    const input = modal.querySelector('.auth-input');
    const errorDiv = modal.querySelector('.auth-error');
    const verifyBtn = modal.querySelector('.verify-btn');
    const importBtn = modal.querySelector('.import-btn');
    const fileInput = modal.querySelector('.file-input');
    const copyBtn = modal.querySelector('.copy-machine-code');
    const closeBtn = modal.querySelector('.auth-close-btn');
    const cancelBtn = modal.querySelector('.auth-cancel-btn');
    
    // 绑定关闭按钮事件
    const closeModal = () => {
      modal.classList.remove('active');
      setTimeout(() => {
        modal.remove();
        if (callback) callback(false);
      }, 300);
    };
    
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    }
    
    if (cancelBtn) {
      cancelBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    }
    
    // 绑定复制按钮事件（使用兼容的复制方法）
    if (copyBtn) {
      copyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.copyToClipboard(this.machineCode, copyBtn);
      });
    }

    // 验证按钮点击（等待Python端验证就绪）
    verifyBtn.addEventListener('click', async () => {
      const phone = phoneInput.value.trim();
      const code = input.value.trim();
      
      if (!this.validatePhoneNumber(phone)) {
        phoneError.style.display = 'block';
        phoneInput.focus();
        phoneInput.style.borderColor = '#ff4444';
        return;
      } else {
        phoneError.style.display = 'none';
        phoneInput.style.borderColor = '';
      }
      
      // 禁用按钮，防止重复点击
      verifyBtn.disabled = true;
      verifyBtn.textContent = '验证中...';
      
      // ⭐ 等待WebChannel就绪（最多3秒）
      let waitCount = 0;
      while ((!window.authBridge || typeof window.authBridge.verifyAuthCode !== 'function') && waitCount < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
      }
      
      let isValid = false;
      
      // 使用Python端验证（必须可用）
      if (window.authBridge && typeof window.authBridge.verifyAuthCode === 'function') {
        try {
          // ⭐ 关键修复：PyQt的返回值是Promise，需要await等待
          const resultPromise = window.authBridge.verifyAuthCode(this.machineCode, code);
          console.log('[JS] Python返回Promise:', resultPromise);
          
          // ⭐ 等待Promise完成
          const result = await resultPromise;
          console.log('[JS] Promise完成，返回值:', result, '类型:', typeof result);
          
          isValid = (result === 'true');
          console.log('[JS] isValid:', isValid);
        } catch (e) {
          console.error('❌ 授权验证错误:', e);
          errorDiv.textContent = '验证失败，请重试';
          errorDiv.style.display = 'block';
          verifyBtn.disabled = false;
          verifyBtn.textContent = '验证授权';
          return;
        }
      } else {
        // WebChannel未就绪
        console.error('❌ 授权系统未就绪');
        errorDiv.textContent = '授权系统未就绪，请稍后重试';
        errorDiv.style.display = 'block';
        verifyBtn.disabled = false;
        verifyBtn.textContent = '验证授权';
        return;
      }
      
      console.log('[JS] 验证结果处理, isValid=', isValid);
      
      // 恢复按钮
      verifyBtn.disabled = false;
      verifyBtn.textContent = '验证授权';
      
      if (!isValid) {
        console.log('[JS] 验证失败');
        errorDiv.textContent = '授权码错误，请重新输入';
        errorDiv.style.display = 'block';
        return;
      }
      
      console.log('[JS] 验证通过！显示成功界面');
      
      if (isValid) {
        // 保存授权码和手机号以便下次自动填充
        localStorage.setItem('last_auth_code', code);
        localStorage.setItem('last_phone_number', phone);
        this.saveAuthorization(code, phone);
        
        // 显示成功提示，并提供导出选项
        modal.innerHTML = `
          <div class="modal-content auth-modal-content">
            <div class="auth-container auth-success">
              <div class="auth-icon success">✓</div>
              <h2>授权成功</h2>
              <p>软件已成功激活，感谢您的支持！</p>
              <button class="auth-btn export-auth-btn" style="margin-bottom: 10px;">
                <span>📥</span> 导出授权文件（可在其他浏览器使用）
              </button>
              <button class="auth-btn start-use-btn">开始使用</button>
            </div>
          </div>
        `;
        
        // 绑定导出按钮
        modal.querySelector('.export-auth-btn').addEventListener('click', () => {
          this.exportAuthorization();
        });
        
        // 绑定开始使用按钮
        modal.querySelector('.start-use-btn').addEventListener('click', () => {
          modal.classList.remove('active');
          setTimeout(() => {
            modal.remove();
            if (callback) callback(true);
          }, 300);
        });

        // 3秒后自动关闭
        setTimeout(() => {
          modal.classList.remove('active');
          setTimeout(() => {
            modal.remove();
            if (callback) callback(true);
          }, 300);
        }, 3000);
      } else {
        errorDiv.style.display = 'block';
        input.classList.add('error');
        setTimeout(() => {
          errorDiv.style.display = 'none';
          input.classList.remove('error');
        }, 2000);
      }
    });
    
    // 导入按钮点击事件
    importBtn.addEventListener('click', () => {
      fileInput.click();
    });
    
    // 文件选择事件
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const message = await this.importAuthorization(file);
        
        // 显示成功提示
        modal.innerHTML = `
          <div class="modal-content auth-modal-content">
            <div class="auth-container auth-success">
              <div class="auth-icon success">✓</div>
              <h2>导入成功</h2>
              <p>${message}</p>
              <button class="auth-btn start-use-btn-import">开始使用</button>
            </div>
          </div>
        `;
        
        // 绑定开始使用按钮
        modal.querySelector('.start-use-btn-import').addEventListener('click', () => {
          modal.classList.remove('active');
          setTimeout(() => {
            modal.remove();
            if (callback) callback(true);
          }, 300);
        });
        
        // 1.5秒后自动关闭
        setTimeout(() => {
          modal.classList.remove('active');
          setTimeout(() => {
            modal.remove();
            if (callback) callback(true);
          }, 300);
        }, 1500);
      } catch (error) {
        alert(error);
      }
    });

    // 回车键验证
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        verifyBtn.click();
      }
    });

    // 点击背景关闭弹窗
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // ESC键关闭弹窗
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  // 检查并显示授权
  checkAndShowAuth(callback) {
    if (this.isAuthorized) {
      if (callback) callback(true);
      return true;
    } else {
      this.showAuthModal(callback);
      return false;
    }
  }

  // 显示微信二维码
  showWechatQR() {
    const qrModal = document.createElement('div');
    qrModal.className = 'wechat-qr-modal';
    qrModal.innerHTML = `
      <div class="wechat-qr-content">
        <h3>💬 添加微信获取授权</h3>
        <p>扫描下方二维码添加微信</p>
        <img src="images/wechat-qr.jpg" alt="微信二维码">
        <button class="wechat-qr-close">关闭</button>
      </div>
    `;
    
    document.body.appendChild(qrModal);
    
    // 点击关闭按钮
    qrModal.querySelector('.wechat-qr-close').addEventListener('click', () => {
      qrModal.remove();
    });
    
    // 点击背景关闭
    qrModal.addEventListener('click', (e) => {
      if (e.target === qrModal) {
        qrModal.remove();
      }
    });
  }

  // 反调试检测(增强版)
  startAntiDebug() {
    // 检测开发者工具
    setInterval(() => {
      const start = new Date();
      debugger;
      const end = new Date();
      if (end - start > 100) {
        // 检测到调试器
        console.clear();
        document.body.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 50vh;">检测到开发者工具，已自动退出</h1>';
        setTimeout(() => window.close(), 1000);
      }
    }, 2000);
    
    // 检测窗口大小异常(开发者工具打开)
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    setInterval(() => {
      const widthDiff = Math.abs(window.innerWidth - lastWidth);
      const heightDiff = Math.abs(window.innerHeight - lastHeight);
      
      // 如果窗口尺寸突然变化超过100px，可能打开了开发者工具
      if (widthDiff > 100 || heightDiff > 100) {
        console.warn('检测到窗口尺寸异常');
      }
      
      lastWidth = window.innerWidth;
      lastHeight = window.innerHeight;
    }, 500);
    
    // 禁用右键和F12
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
        e.preventDefault();
      }
    });
    
    // 禁用控制台
    if (window.console) {
      const noop = () => {};
      ['log', 'debug', 'info', 'warn', 'error'].forEach(method => {
        try {
          const original = console[method];
          console[method] = function(...args) {
            // 只在开发环境输出
            if (window.location.hostname === 'localhost') {
              original.apply(console, args);
            }
          };
        } catch (e) {}
      });
    }
  }
  
  // 创建动态水印系统(优化版 - 专注视频区域)
  createDynamicWatermark() {
    // 创建全屏水印容器(用于首页和非视频内容)
    const watermarkContainer = document.createElement('div');
    watermarkContainer.id = 'dynamic-watermark-container';
    watermarkContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      overflow: hidden;
    `;
    
    // 创建多个水印元素(减少到4个，避免影响体验)
    const watermarkCount = 4;
    for (let i = 0; i < watermarkCount; i++) {
      const watermark = document.createElement('div');
      watermark.className = 'floating-watermark';
      watermark.style.cssText = `
        position: absolute;
        font-size: 12px;
        color: rgba(255, 100, 100, 0.25);
        font-weight: 500;
        transform: rotate(-25deg);
        white-space: nowrap;
        user-select: none;
        font-family: 'Courier New', monospace;
        text-shadow: 0 0 2px rgba(255, 255, 255, 0.2);
        letter-spacing: 1px;
      `;
      
      // 随机初始位置
      watermark.style.left = `${Math.random() * 100}%`;
      watermark.style.top = `${Math.random() * 100}%`;
      
      watermarkContainer.appendChild(watermark);
    }
    
    document.body.appendChild(watermarkContainer);
    
    // 更新水印内容和位置
    this.updateWatermarks();
    
    // 每5秒更新一次水印位置和内容(降低频率，更柔和)
    setInterval(() => this.updateWatermarks(), 5000);
    
    // 防止水印被删除或修改
    this.protectWatermark(watermarkContainer);
  }
  
  // 更新水印内容
  updateWatermarks() {
    const watermarks = document.querySelectorAll('.floating-watermark');
    const timestamp = new Date().toLocaleString('zh-CN');
    const machineCode = this.machineCode;
    
    watermarks.forEach((watermark, index) => {
      // 水印文本：机器码 + 时间戳
      watermark.textContent = `${machineCode} | ${timestamp}`;
      
      // 随机位置移动
      const newLeft = 10 + Math.random() * 80;
      const newTop = 10 + Math.random() * 80;
      
      watermark.style.transition = 'all 2s ease-in-out';
      watermark.style.left = `${newLeft}%`;
      watermark.style.top = `${newTop}%`;
      
      // 随机透明度变化
      watermark.style.opacity = 0.25 + Math.random() * 0.15;
    });
  }
  
  // 保护水印不被删除
  protectWatermark(container) {
    // 监听DOM变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
          // 如果水印容器被删除，重新创建
          mutation.removedNodes.forEach((node) => {
            if (node.id === 'dynamic-watermark-container') {
              console.warn('检测到水印被删除，正在恢复...');
              setTimeout(() => this.createDynamicWatermark(), 100);
            }
          });
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // 定期检查水印是否存在
    setInterval(() => {
      if (!document.getElementById('dynamic-watermark-container')) {
        console.warn('水印容器丢失，正在重建...');
        this.createDynamicWatermark();
      }
    }, 5000);
  }
  
  // 窗口失焦检测(检测是否切换到其他窗口)
  startBlurDetection() {
    let blurCount = 0;
    let blurStartTime = null;
    const maxBlurDuration = 60000; // 最多失焦60秒
    
    window.addEventListener('blur', () => {
      blurCount++;
      blurStartTime = Date.now();
      console.warn(`窗口失焦 (第${blurCount}次)`);
      
      // 如果频繁失焦，可能在录屏
      if (blurCount > 10) {
        console.error('检测到频繁切换窗口，可能正在录屏');
      }
    });
    
    window.addEventListener('focus', () => {
      if (blurStartTime) {
        const blurDuration = Date.now() - blurStartTime;
        if (blurDuration > maxBlurDuration) {
          console.warn(`长时间失焦: ${Math.round(blurDuration / 1000)}秒`);
          // 可以选择重新验证授权
          this.checkAuthorization();
        }
        blurStartTime = null;
      }
    });
  }
  
  // 检测屏幕录制API
  detectScreenCapture() {
    // 检测 getDisplayMedia (屏幕共享/录制 API)
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      
      navigator.mediaDevices.getDisplayMedia = function(...args) {
        console.error('⚠️ 检测到屏幕录制API调用！');
        alert('检测到屏幕录制尝试！为保护版权，程序将退出。');
        setTimeout(() => window.close(), 1000);
        
        return originalGetDisplayMedia.apply(this, args);
      };
    }
    
    // 检测 captureStream (Canvas/Video 录制)
    if (HTMLCanvasElement.prototype.captureStream) {
      const originalCaptureStream = HTMLCanvasElement.prototype.captureStream;
      
      HTMLCanvasElement.prototype.captureStream = function(...args) {
        console.error('⚠️ 检测到Canvas录制API调用！');
        return originalCaptureStream.apply(this, args);
      };
    }
    
    if (HTMLVideoElement.prototype.captureStream) {
      const originalVideoCaptureStream = HTMLVideoElement.prototype.captureStream;
      
      HTMLVideoElement.prototype.captureStream = function(...args) {
        console.error('⚠️ 检测到Video录制API调用！');
        return originalVideoCaptureStream.apply(this, args);
      };
    }
  }
}

// 代码混淆标记
(function() {
  const _0x1a2b = AuthSystem;
  window.AuthSystem = _0x1a2b;
})();

// 导出授权系统
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthSystem;
}

