/**
 * Electron适配层（复用原实现）
 */
(function() {
  console.log('[Electron适配层] 正在初始化...');
  window.authBridge = {
    generateMachineCode: async function() {
      try { return await window.electronAPI.getMachineCode(); } catch { return 'ERROR0000000000'; }
    },
    verifyAuthCode: async function(machineCode, authCode) {
      try { const ok = await window.electronAPI.verifyAuthCode(machineCode, authCode); return ok ? 'true' : 'false'; } catch { return 'false'; }
    }
  };
  window.qtClipboard = { copyText: async (text) => { try { return await window.electronAPI.copyToClipboard(text); } catch { return false; } } };
  window.copyToClipboard = async function(text){ return await window.qtClipboard.copyText(text); };
  if (typeof QWebChannel === 'undefined') {
    window.QWebChannel = function(transport, callback) { setTimeout(() => { callback({ objects: { authBridge: window.authBridge, clipboardBridge: window.qtClipboard } }); }, 0); };
  }
  console.log('[Electron适配层] ✓ 初始化完成！');
})();
