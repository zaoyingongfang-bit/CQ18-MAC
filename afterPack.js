/**
 * electron-builder 构建后钩子
 * 对 macOS 应用进行 ad-hoc 签名（本地自签名）
 * 这样应用会显示"无法验证开发者"而不是"已损坏"
 */

const { exec } = require('child_process');
const path = require('path');

exports.default = async function(context) {
  // 仅在 macOS 平台执行
  if (context.electronPlatformName !== 'darwin') {
    return;
  }

  const appPath = path.join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.app`
  );

  console.log(`\n🔐 执行 ad-hoc 签名: ${appPath}\n`);

  return new Promise((resolve, reject) => {
    // 使用 codesign 进行 ad-hoc 签名（- 表示 ad-hoc）
    // --force 强制重新签名
    // --deep 递归签名所有嵌入的框架和库
    const cmd = `codesign --force --deep --sign - "${appPath}"`;
    
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ ad-hoc 签名失败:', error);
        console.error('stderr:', stderr);
        // 不阻止构建，继续执行
        resolve();
      } else {
        console.log('✅ ad-hoc 签名成功');
        if (stdout) console.log(stdout);
        resolve();
      }
    });
  });
};
