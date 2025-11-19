// 主应用程序逻辑
class SoundCardDebugger {
  constructor() {
    this.config = CONFIG;
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.authSystem = new AuthSystem();
    // 将authSystem暴露为全局变量，供授权弹窗使用
    window.authSystem = this.authSystem;
    this.init();
  }

  init() {
    // 初始化主题
    this.applyTheme();
    
    // 创建背景动画
    this.createBackgroundAnimation();
    
    // 渲染设备图片（从配置文件读取）
    this.renderDeviceImage();
    
    // 渲染主功能按钮
    this.renderMainButtons();
    
    // 渲染底部信息
    this.renderFooter();
    
    // 绑定主题切换
    this.bindThemeToggle();
    
    // 绑定全局事件
    this.bindGlobalEvents();
    
    // 启用内容保护（防止复制、拖动、查看源代码）
    this.enableContentProtection();
    
    // 启动授权检查和反调试（免授权版本已注释）
    /*
    if (this.authSystem.isAuthorized) {
      this.authSystem.startAuthCheck();
      // 启动防盗录保护系统
      this.startAntiRecordingProtection();
    }
    */
    
    // 启动反调试（生产环境启用）
    if (window.location.protocol === 'file:') {
      // this.authSystem.startAntiDebug(); // 取消注释以启用
    }
  }

  // 应用主题
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = this.currentTheme === 'dark' 
        ? '<span>☀️</span><span>浅色模式</span>' 
        : '<span>🌙</span><span>深色模式</span>';
    }
  }

  // 切换主题
  toggleTheme() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.currentTheme);
    this.applyTheme();
  }

  // 绑定主题切换按钮
  bindThemeToggle() {
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }
  }

  // 创建背景动画粒子
  createBackgroundAnimation() {
    const bgAnimation = document.querySelector('.bg-animation');
    if (!bgAnimation) return;

    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 20}s`;
      particle.style.animationDuration = `${15 + Math.random() * 10}s`;
      bgAnimation.appendChild(particle);
    }
  }

  // 渲染设备图片（从配置文件读取）
  renderDeviceImage() {
    const deviceSection = document.querySelector('.device-section');
    if (!deviceSection) return;

    // 从配置文件读取设备信息
    const deviceInfo = this.config.device;
    
    // 创建设备图片元素
    const img = document.createElement('img');
    img.src = deviceInfo.image;
    img.alt = deviceInfo.name;
    img.className = 'device-image';
    img.setAttribute('draggable', 'false');
    img.setAttribute('ondragstart', 'return false;');
    
    // 添加到设备区域
    deviceSection.appendChild(img);
    
    console.log(`✓ 设备已加载: ${deviceInfo.name}`);
  }

  // 渲染主功能按钮
  renderMainButtons() {
    const controlsSection = document.querySelector('.controls-section');
    if (!controlsSection) return;

    controlsSection.innerHTML = '';

    // 第一排2个按钮
    const row1 = document.createElement('div');
    row1.className = 'button-row';
    
    // 第二排2个按钮
    const row2 = document.createElement('div');
    row2.className = 'button-row';

    this.config.mainButtons.forEach((button, index) => {
      const buttonElement = this.createButtonElement(button, index);
      
      // 前2个放第一排，后2个放第二排
      if (index < 2) {
        row1.appendChild(buttonElement);
      } else {
        row2.appendChild(buttonElement);
      }
    });

    controlsSection.appendChild(row1);
    controlsSection.appendChild(row2);
  }

  // 创建按钮元素（免授权版：直接执行）
  createButtonElement(button, index) {
    const btn = document.createElement('button');
    btn.className = 'control-button';
    btn.innerHTML = `
      <span class="button-icon">${button.icon}</span>
      <span class="button-label">${button.label}</span>
    `;
    
    // 淡入动画
    btn.style.opacity = '0';
    btn.style.animation = `fadeInButton 0.6s ${index * 0.1}s cubic-bezier(0.28, 0.11, 0.32, 1) forwards`;

    // 绑定点击事件 - 暂时免授权：直接执行
    btn.addEventListener('click', (e) => {
      this.createRipple(e, btn);

      // 直接执行功能（免授权版本）
      if (button.type === 'submenu') {
        setTimeout(() => this.displaySubmenuModal(button), 200);
      } else if (button.type === 'action') {
        setTimeout(() => this.handleAction(button), 200);
      }

      /*
      // 统一授权检查（原逻辑，便于恢复）
      this.authSystem.checkAndShowAuth((authorized) => {
        if (authorized) {
          if (button.type === 'submenu') {
            setTimeout(() => this.displaySubmenuModal(button), 200);
          } else if (button.type === 'action') {
            setTimeout(() => this.handleAction(button), 200);
          }
        }
      });
      */
    });

    return btn;
  }

  // 创建点击涟漪效果
  createRipple(event, button) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 800);
  }

  // 显示子菜单弹窗（需要授权）
  showSubmenuModal(button) {
    // 直接显示子菜单（免授权版本）
    this.displaySubmenuModal(button);

    /*
    // 检查授权（原逻辑，便于恢复）
    this.authSystem.checkAndShowAuth((authorized) => {
      if (authorized) {
        this.displaySubmenuModal(button);
      }
    });
    */
  }

  // 显示子菜单弹窗（已授权）
  displaySubmenuModal(button) {
    const modal = this.createModal();
    const content = modal.querySelector('.modal-content');
    content.classList.add('submenu-modal-content');
    
    // 如果子菜单超过9个，设置为两列布局
    if (button.submenu.length > 9) {
      content.classList.add('wide');
    }
    
    // 检查是否有二级菜单（nested-submenu类型）
    const hasNestedMenu = button.submenu.some(item => item.type === 'nested-submenu');
    
    // 只有"观看教程"或有二级菜单时，才使用特殊容器
    let container;
    if (hasNestedMenu) {
      container = document.createElement('div');
      container.className = 'submenu-main-content';
      // 添加菜单ID作为标识，以便应用不同样式
      container.setAttribute('data-menu-id', button.id);
    } else {
      container = content;
    }
    
    const titleDiv = document.createElement('h3');
    titleDiv.textContent = button.label;
    
    const gridDiv = document.createElement('div');
    gridDiv.className = 'submenu-grid';
    
    // 如果子菜单超过9个，使用两列布局
    if (button.submenu.length > 9) {
      gridDiv.classList.add('two-columns');
    }
    
    button.submenu.forEach((item, index) => {
      const itemElement = document.createElement('div');
      itemElement.className = 'submenu-item';
      
      // 为"观看教程"的第一个按钮添加特殊样式
      if (button.id === 'tutorial' && index === 0) {
        itemElement.classList.add('submenu-item-featured');
      }
      
      // 只给"观看教程"添加序号徽章（蓝色）
      if (button.id === 'tutorial') {
        if (index > 0) {
          const numberBadge = document.createElement('span');
          numberBadge.className = 'submenu-item-number';
          numberBadge.textContent = index.toString().padStart(2, '0');
          itemElement.appendChild(numberBadge);
          const labelSpan = document.createElement('span');
          labelSpan.textContent = item.label;
          itemElement.appendChild(labelSpan);
        } else {
          itemElement.textContent = item.label;
        }
      } else {
        itemElement.textContent = item.label;
      }
      
      itemElement.addEventListener('click', (e) => {
        // 不自动关闭弹窗，保持打开状态以便连续操作
        this.handleSubmenuClick(item, itemElement);
      });
      
      gridDiv.appendChild(itemElement);
    });
    
    container.appendChild(titleDiv);
    container.appendChild(gridDiv);
    
    // 只有使用了特殊容器时才需要append到content
    if (hasNestedMenu) {
      content.appendChild(container);
    }
    
    document.body.appendChild(modal);
    modal.classList.add('active');
  }

  // 处理子菜单点击
  handleSubmenuClick(item, parentElement) {
    switch (item.type) {
      case 'video':
        this.playVideo(item.path);
        break;
      case 'image':
        this.showImage(item.path);
        break;
      case 'exe':
        this.handleAction(item);
        break;
      case 'nested-submenu':
        // 处理二级子菜单
        this.showNestedSubmenu(item, parentElement);
        break;
      default:
        console.warn('未知的子菜单类型:', item.type);
    }
  }

  // 显示二级子菜单（向右扩展）
  showNestedSubmenu(item, parentElement) {
    const existingNested = document.querySelector('.nested-submenu-panel');
    if (existingNested) {
      const existingModalContent = existingNested.closest('.modal-content');
      existingNested.remove();
      existingModalContent.style.removeProperty('width');
      existingModalContent.style.removeProperty('min-width');
      existingModalContent.style.removeProperty('max-width');
      existingModalContent.classList.remove('has-nested-menu');
      existingModalContent.classList.remove('width-transition-enabled');
    }

    const nestedPanel = document.createElement('div');
    nestedPanel.className = 'nested-submenu-panel';
    
    const title = document.createElement('div');
    title.className = 'nested-submenu-title';
    title.innerHTML = `
      <span class="nested-back-icon">←</span>
      <span>${item.label}</span>
    `;
    
    const modal = parentElement.closest('.modal');
    const modalContent = modal.querySelector('.modal-content');
    
    title.addEventListener('click', () => {
      nestedPanel.classList.remove('active');
      setTimeout(() => {
        modalContent.style.removeProperty('width');
        modalContent.style.removeProperty('min-width');
        modalContent.style.removeProperty('max-width');
        modalContent.classList.remove('has-nested-menu');
        modalContent.classList.remove('width-transition-enabled');
        nestedPanel.remove();
      }, 400);
    });
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'nested-submenu-content';
    
    const grid = document.createElement('div');
    grid.className = 'nested-submenu-grid';
    
    const itemsPerColumn = 6;
    const totalItems = item.submenu.length;
    const columnCount = Math.ceil(totalItems / itemsPerColumn);
    
    let modalWidth, panelWidth;
    if (totalItems <= 6) {
      grid.style.gridTemplateColumns = '1fr';
      grid.style.gridTemplateRows = 'repeat(6, 1fr)';
      panelWidth = '450px';
      modalWidth = '960px';
      nestedPanel.setAttribute('data-columns', '1');
    } else if (totalItems <= 12) {
      grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
      grid.style.gridTemplateRows = 'repeat(6, 1fr)';
      panelWidth = '620px';
      modalWidth = '1120px';
      nestedPanel.setAttribute('data-columns', '2');
    } else {
      grid.style.gridTemplateColumns = `repeat(${columnCount}, 1fr)`;
      grid.style.gridTemplateRows = 'repeat(6, 1fr)';
      panelWidth = `${Math.min(450 + (columnCount - 1) * 280, 680)}px`;
      modalWidth = `${Math.min(960 + (columnCount - 1) * 280, 1120)}px`;
      nestedPanel.setAttribute('data-columns', columnCount.toString());
    }
    
    item.submenu.forEach((subItem, index) => {
      const subItemElement = document.createElement('div');
      subItemElement.className = 'nested-submenu-item';
      
      const numberBadge = document.createElement('span');
      numberBadge.className = 'nested-item-number';
      numberBadge.textContent = (index + 1).toString().padStart(2, '0');
      subItemElement.appendChild(numberBadge);
      
      const labelSpan = document.createElement('span');
      labelSpan.textContent = subItem.label;
      subItemElement.appendChild(labelSpan);
      
      subItemElement.style.animationDelay = `${index * 0.03}s`;
      subItemElement.addEventListener('click', () => {
        this.handleSubmenuClick(subItem);
      });
      
      grid.appendChild(subItemElement);
    });
    
    contentWrapper.appendChild(title);
    contentWrapper.appendChild(grid);
    nestedPanel.appendChild(contentWrapper);
    
    nestedPanel.style.setProperty('width', panelWidth, 'important');
    nestedPanel.style.setProperty('min-width', panelWidth, 'important');
    nestedPanel.style.setProperty('max-width', panelWidth, 'important');
    
    if (totalItems <= 6) {
      nestedPanel.style.setProperty('padding', '20px 8px', 'important');
      grid.style.setProperty('margin', '0 auto 0 25px', 'important');
    }
    
    modalContent.classList.add('has-nested-menu');
    modalContent.style.setProperty('width', modalWidth, 'important');
    modalContent.style.setProperty('min-width', modalWidth, 'important');
    modalContent.style.setProperty('max-width', modalWidth, 'important');
    
    modalContent.appendChild(nestedPanel);
    
    void modalContent.offsetWidth;
    void nestedPanel.offsetHeight;
    
    const modalEl = parentElement.closest('.modal') || document.querySelector('.modal');
    if (modalEl) {
      modalEl.scrollTop = 0;
    }
    
    setTimeout(() => {
      modalContent.classList.add('width-transition-enabled');
      setTimeout(() => {
        nestedPanel.classList.add('active');
      }, 10);
    }, 80);
  }

  // 处理动作（EXE或下载） - macOS 版本：拦截 EXE 显示提示
  async handleAction(item) {
    // ⭐ macOS 平台拦截：检测 EXE 类型或路径包含 'EXE程序'
    if (item.type === 'exe' || (item.localPath && item.localPath.includes('EXE程序/'))) {
      this.showMessage('该功能暂未在 macOS 提供\n\n此按钮对应的是 Windows 可执行程序，Mac 版本稍后提供。', 'info');
      return;
    }

    if (item.localPath) {
      const success = await this.openLocalFile(item.localPath);
      if (success) return;
    }

    if (item.downloadUrl) {
      this.downloadAndOpen(item.downloadUrl);
    } else {
      this.showMessage('未配置文件路径或下载链接');
    }
  }

  // 打开本地文件
  async openLocalFile(path) {
    try {
      const link = document.createElement('a');
      link.href = path;
      link.download = path.split('/').pop();
      link.click();
      return true;
    } catch (error) {
      console.error('打开本地文件失败:', error);
      return false;
    }
  }

  // 下载并打开文件
  downloadAndOpen(url) {
    const link = document.createElement('a');
    link.href = url;
    link.download = url.split('/').pop();
    link.target = '_blank';
    link.click();
  }

  // 播放视频
  playVideo(path) {
    const modal = this.createModal();
    
    const videoContainer = document.createElement('div');
    videoContainer.style.cssText = `
      position: relative;
      display: inline-block;
      max-width: 100%;
    `;
    
    const maximizeBtn = document.createElement('button');
    maximizeBtn.innerHTML = '⛶';
    maximizeBtn.title = '最大化播放（占满程序窗口1400x900）';
    maximizeBtn.style.cssText = `
      position: absolute;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      width: 50px;
      height: 50px;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-radius: 50%;
      font-size: 22px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      z-index: 10000;
    `;
    
    let isMaximized = false;
    maximizeBtn.onclick = () => {
      if (!isMaximized) {
        modal.style.padding = '0';
        modal.style.alignItems = 'stretch';
        modal.style.justifyContent = 'stretch';
        
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
          modalContent.style.maxWidth = '100%';
          modalContent.style.width = '100%';
          modalContent.style.height = '100%';
          modalContent.style.margin = '0';
          modalContent.style.padding = '0';
          modalContent.style.borderRadius = '0';
          modalContent.style.maxHeight = '100%';
        }
        
        videoContainer.style.width = '100%';
        videoContainer.style.height = '100%';
        
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.maxHeight = '100%';
        video.style.objectFit = 'contain';
        video.style.borderRadius = '0';
        
        maximizeBtn.style.bottom = '60px';
        maximizeBtn.innerHTML = '⊡';
        maximizeBtn.title = '还原正常大小';
        isMaximized = true;
        console.log('[视频] 已最大化到程序窗口（1400x900）');
      } else {
        modal.style.padding = '';
        modal.style.alignItems = '';
        modal.style.justifyContent = '';
        
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
          modalContent.style.maxWidth = '';
          modalContent.style.width = '';
          modalContent.style.height = '';
          modalContent.style.margin = '';
          modalContent.style.padding = '';
          modalContent.style.borderRadius = '';
          modalContent.style.maxHeight = '';
        }
        
        videoContainer.style.width = '';
        videoContainer.style.height = '';
        
        video.style.width = '100%';
        video.style.height = 'auto';
        video.style.maxHeight = '70vh';
        video.style.objectFit = 'contain';
        video.style.borderRadius = '12px';
        
        maximizeBtn.style.bottom = '80px';
        maximizeBtn.innerHTML = '⛶';
        maximizeBtn.title = '最大化播放（占满程序窗口1400x900）';
        isMaximized = false;
        console.log('[视频] 已还原正常大小');
      }
    };
    
    maximizeBtn.onmouseover = () => {
      maximizeBtn.style.backgroundColor = 'rgba(102, 126, 234, 0.9)';
      maximizeBtn.style.transform = 'translateX(-50%) scale(1.15)';
    };
    maximizeBtn.onmouseout = () => {
      maximizeBtn.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      maximizeBtn.style.transform = 'translateX(-50%) scale(1)';
    };
    
    videoContainer.appendChild(maximizeBtn);
    
    const video = document.createElement('video');
    video.src = path;
    video.controls = true;
    video.autoplay = true;
    video.style.width = '100%';
    video.style.height = 'auto';
    video.style.maxHeight = '70vh';
    video.style.borderRadius = '12px';
    video.style.display = 'block';
    video.setAttribute('draggable', 'false');
    video.setAttribute('oncontextmenu', 'return false;');
    video.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
    video.setAttribute('disablePictureInPicture', 'true');
    
    video.requestFullscreen = function() {
      console.log('[视频] 全屏已禁用，视频限制在1400x900窗口内');
      return Promise.reject(new Error('Fullscreen disabled'));
    };
    video.webkitRequestFullscreen = video.requestFullscreen;
    video.webkitEnterFullscreen = video.requestFullscreen;
    video.mozRequestFullScreen = video.requestFullscreen;
    video.msRequestFullscreen = video.requestFullscreen;
    
    video.addEventListener('dblclick', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    video.addEventListener('webkitfullscreenchange', (e) => {
      if (document.webkitIsFullScreen) {
        document.webkitExitFullscreen();
        console.log('[视频] 阻止进入全屏');
      }
    });
    video.addEventListener('fullscreenchange', (e) => {
      if (document.fullscreenElement === video) {
        document.exitFullscreen();
        console.log('[视频] 阻止进入全屏');
      }
    });
    
    videoContainer.appendChild(video);
    
    const watermarks = [];
    for (let i = 0; i < 3; i++) {
      const watermark = document.createElement('div');
      watermark.className = 'video-watermark';
      watermark.style.cssText = `
        position: absolute;
        color: rgba(255, 255, 255, 0.25);
        font-size: 13px;
        font-weight: normal;
        background-color: transparent;
        padding: 3px;
        pointer-events: none;
        user-select: none;
        z-index: 9999;
        white-space: nowrap;
      `;
      videoContainer.appendChild(watermark);
      watermarks.push(watermark);
    }
    
    const updateWatermarks = () => {
      const phoneNumber = this.authSystem.getPhoneNumber();
      const displayInfo = phoneNumber ? 
        `手机号:${phoneNumber}` : 
        `机器码:${this.authSystem.getMachineCode().substring(0, 8)}`;
      
      const now = new Date();
      const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/\//g, '-');
      
      const watermarkText = `${displayInfo} | ${timeString}`;
      
      const containerRect = videoContainer.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;
      
      watermarks.forEach((watermark, index) => {
        watermark.textContent = watermarkText;
        const maxX = containerWidth - 300;
        const maxY = containerHeight - 50;
        
        if (maxX > 50 && maxY > 50) {
          const x = 50 + Math.random() * (maxX - 50);
          const y = 50 + Math.random() * (maxY - 50);
          watermark.style.left = `${x}px`;
          watermark.style.top = `${y}px`;
        }
      });
    };
    
    setTimeout(updateWatermarks, 100);
    const watermarkInterval = setInterval(updateWatermarks, 2000);
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        clearInterval(watermarkInterval);
      }
    });
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.appendChild(videoContainer);
    
    document.body.appendChild(modal);
    modal.classList.add('active');
    this.modalStack.push(modal.dataset.modalId);
    this.updateAnimationState();
    
    console.log('✅ 视频水印系统已启动');
  }

  // 显示图片
  showImage(path) {
    const modal = this.createModal();
    const img = document.createElement('img');
    img.src = path;
    img.alt = '跳线图';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '80vh';
    img.style.borderRadius = '12px';
    img.setAttribute('draggable', 'false');
    img.setAttribute('oncontextmenu', 'return false;');
    img.setAttribute('ondragstart', 'return false;');
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.appendChild(img);
    
    document.body.appendChild(modal);
    modal.classList.add('active');
  }

  // ⭐ 模态框层级管理（防止闪烁和冲突）
  modalStack = [];
  
  // 创建模态框
  createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.dataset.modalId = `modal_${Date.now()}_${Math.random()}`;
    
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close">×</button>
      </div>
    `;
    
    const openModal = () => {
      this.modalStack.push(modal.dataset.modalId);
      this.updateAnimationState();
    };
    
    const closeModal = () => {
      modal.classList.remove('active');
      const index = this.modalStack.indexOf(modal.dataset.modalId);
      if (index > -1) {
        this.modalStack.splice(index, 1);
      }
      this.updateAnimationState();
      setTimeout(() => modal.remove(), 100);
    };
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-close')) {
        closeModal();
      }
    });
    
    const originalShow = () => {
      document.body.appendChild(modal);
      modal.classList.add('active');
      openModal();
    };
    
    modal._customShow = originalShow;
    return modal;
  }
  
  // ⭐ 更新动画状态
  updateAnimationState() {
    if (this.modalStack.length > 0) {
      document.body.classList.add('modal-open');
      document.body.classList.add('animations-paused');
    } else {
      document.body.classList.remove('modal-open');
      document.body.classList.remove('animations-paused');
    }
  }
  
  // 冻结页面
  freezePage() {
    const container = document.querySelector('.container');
    if (container) {
      container.style.visibility = 'hidden';
      container.style.pointerEvents = 'none';
    }
    document.body.classList.add('fully-frozen');
  }
  
  // 解冻页面
  unfreezePage() {
    const container = document.querySelector('.container');
    if (container) {
      container.style.visibility = 'visible';
      container.style.pointerEvents = 'auto';
    }
    document.body.classList.remove('fully-frozen');
  }

  // 显示消息提示
  showMessage(message, type = 'info') {
    const modal = this.createModal();
    const content = modal.querySelector('.modal-content');
    content.classList.add('message-content');
    
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `
      <h3>${type === 'info' ? 'ℹ️ 提示' : '⚠️ 警告'}</h3>
      <p style="white-space: pre-line;">${message}</p>
    `;
    
    content.appendChild(messageDiv);
    document.body.appendChild(modal);
    modal.classList.add('active');
  }

  // 显示机器码弹窗
  showMachineCodeModal(machineCode) {
    const modal = this.createModal();
    const content = modal.querySelector('.modal-content');
    content.classList.add('message-content');
    content.style.maxWidth = '500px';
    
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `
      <h3 style="margin-bottom: 20px;">🔑 您的机器码</h3>
      <div style="
        background: var(--bg-glass);
        padding: 15px;
        border-radius: 10px;
        margin-bottom: 15px;
        border: 2px solid var(--border-subtle);
      ">
        <div style="
          font-family: 'Courier New', monospace;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-accent);
          letter-spacing: 3px;
          text-align: center;
          margin-bottom: 15px;
        ">${machineCode}</div>
        <button class="copy-machine-code-modal" style="
          width: 100%;
          padding: 12px;
          background: var(--button-bg);
          color: var(--button-text);
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        ">📋 复制机器码</button>
      </div>
      <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">
        请将此机器码提供给开发者以获取授权码
      </p>
    `;
    
    content.appendChild(messageDiv);
    document.body.appendChild(modal);
    modal.classList.add('active');
    
    // 绑定复制按钮
    const copyBtn = modal.querySelector('.copy-machine-code-modal');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        this.authSystem.copyToClipboard(machineCode, copyBtn);
      });
      copyBtn.addEventListener('mouseenter', () => {
        copyBtn.style.transform = 'translateY(-2px)';
        copyBtn.style.boxShadow = 'var(--shadow-glow)';
      });
      copyBtn.addEventListener('mouseleave', () => {
        copyBtn.style.transform = '';
        copyBtn.style.boxShadow = '';
      });
    }
  }

  // 显示二维码
  showQRCode(imagePath, title) {
    const modal = this.createModal();
    const content = modal.querySelector('.modal-content');
    content.className = 'modal-content qr-modal-content';
    
    const qrDiv = document.createElement('div');
    qrDiv.innerHTML = `
      <h3>${title}</h3>
      <img src="${imagePath}" alt="${title}" draggable="false" oncontextmenu="return false;" ondragstart="return false;" />
      <p style="color: var(--text-secondary); margin-top: 15px;">请使用微信扫描二维码</p>
    `;
    
    content.appendChild(qrDiv);
    document.body.appendChild(modal);
    modal.classList.add('active');
  }

  // 显示二维码（带链接按钮）
  showQRCodeWithLink(imagePath, title, url) {
    const modal = this.createModal();
    const content = modal.querySelector('.modal-content');
    content.className = 'modal-content qr-modal-content';
    
    const qrDiv = document.createElement('div');
    
    let linkButton = '';
    if (url) {
      linkButton = `<button class="qr-link-btn" style="
        margin-top: 15px;
        padding: 10px 20px;
        background: var(--button-bg);
        color: var(--button-text);
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      " onclick="window.open('${url}', '_blank')">
        🔗 打开链接
      </button>`;
    }
    
    qrDiv.innerHTML = `
      <h3>${title}</h3>
      <img src="${imagePath}" alt="${title}" draggable="false" oncontextmenu="return false;" ondragstart="return false;" />
      <p style="color: var(--text-secondary); margin-top: 15px;">请扫描二维码或点击下方按钮</p>
      ${linkButton}
    `;
    
    content.appendChild(qrDiv);
    document.body.appendChild(modal);
    modal.classList.add('active');
  }

  // 渲染底部信息
  renderFooter() {
    const footer = document.querySelector('.footer-content');
    if (!footer) return;

    const { copyright, year, wechat, social } = this.config.footer;

    // 版权信息
    const copyrightDiv = document.createElement('div');
    copyrightDiv.className = 'copyright';
    copyrightDiv.textContent = `© ${year} ${copyright}`;

    // 社交链接
    const socialDiv = document.createElement('div');
    socialDiv.className = 'social-links';

    // 添加微信按钮
    if (wechat.enabled) {
      const wechatBtn = document.createElement('button');
      wechatBtn.className = 'social-btn';
      wechatBtn.innerHTML = `<span>💬</span><span>${wechat.label}</span>`;
      wechatBtn.addEventListener('click', () => {
        this.showQRCode(wechat.qrImage, wechat.label);
      });
      socialDiv.appendChild(wechatBtn);
    }

    // 添加讲师简介按钮
    if (this.config.instructor) {
      const instructorBtn = document.createElement('button');
      instructorBtn.className = 'social-btn instructor-btn';
      instructorBtn.innerHTML = `<span>👨‍🏫</span><span>讲师简介</span>`;
      instructorBtn.addEventListener('click', () => {
        this.showInstructorProfile();
      });
      socialDiv.appendChild(instructorBtn);
    }

    // 添加"更多课程/拜师"按钮
    const moreCoursesBtn = document.createElement('button');
    moreCoursesBtn.className = 'social-btn more-courses-btn';
    moreCoursesBtn.innerHTML = `<span>🎓</span><span>更多课程/拜师</span>`;
    moreCoursesBtn.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transform: scale(1.05);
      border: 2px solid rgba(255, 255, 255, 0.3);
    `;
    moreCoursesBtn.addEventListener('click', () => {
      this.showMoreCourses();
    });
    moreCoursesBtn.addEventListener('mouseenter', () => {
      moreCoursesBtn.style.transform = 'scale(1.1)';
      moreCoursesBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
    });
    moreCoursesBtn.addEventListener('mouseleave', () => {
      moreCoursesBtn.style.transform = 'scale(1.05)';
      moreCoursesBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    });
    socialDiv.appendChild(moreCoursesBtn);

    // 添加其他社交媒体按钮
    social.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'social-btn';
      btn.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;
      
      btn.addEventListener('click', (e) => {
        if (item.qrImage) {
          this.showQRCodeWithLink(item.qrImage, item.label, item.url);
        } else if (item.url) {
          window.open(item.url, '_blank');
        }
      });
      
      socialDiv.appendChild(btn);
    });

    footer.innerHTML = '';
    footer.appendChild(copyrightDiv);
    footer.appendChild(socialDiv);
  }
  
  // 显示更多课程页面（全屏窗口）
  showMoreCourses() {
    this.freezePage();
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.dataset.modalId = `modal_courses_${Date.now()}`;
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000000;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;
    
    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = `
      width: 1400px;
      height: 900px;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    
    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
      height: 50px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      color: white;
    `;
    
    const title = document.createElement('div');
    title.style.cssText = `
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    title.innerHTML = `<span>🎓</span><span>更多课程 - 造音工坊拜师通道</span>`;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
      background: transparent;
      border: none;
      color: white;
      font-size: 28px;
      cursor: pointer;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
    `;
    closeBtn.addEventListener('mouseenter', () => {
      closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
      closeBtn.style.transform = 'rotate(90deg)';
    });
    closeBtn.addEventListener('mouseleave', () => {
      closeBtn.style.background = 'transparent';
      closeBtn.style.transform = 'rotate(0deg)';
    });
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      const index = this.modalStack.indexOf(modal.dataset.modalId);
      if (index > -1) {
        this.modalStack.splice(index, 1);
      }
      this.updateAnimationState();
      this.unfreezePage();
      setTimeout(() => modal.remove(), 100);
    });
    
    toolbar.appendChild(title);
    toolbar.appendChild(closeBtn);
    
    const iframeContainer = document.createElement('div');
    iframeContainer.style.cssText = `
      flex: 1;
      width: 100%;
      height: 100%;
      background: #ffffff;
      position: relative;
      overflow: hidden;
    `;
    
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #667eea;
      font-size: 18px;
      z-index: 1;
    `;
    loadingDiv.innerHTML = `
      <div style="margin-bottom: 15px;">
        <div style="width: 50px; height: 50px; border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
      </div>
      <div>正在加载课程信息...</div>
    `;
    iframeContainer.appendChild(loadingDiv);
    
    const iframe = document.createElement('iframe');
    iframe.src = 'https://kechengjieshao.dsmusic.vip';
    iframe.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      background: #ffffff;
      visibility: hidden;
    `;
    
    iframe.addEventListener('load', () => {
      loadingDiv.style.display = 'none';
      iframe.style.visibility = 'visible';
    });
    
    iframe.addEventListener('error', () => {
      loadingDiv.innerHTML = `
        <div style="color: #ff4444;">⚠️ 网页加载失败</div>
        <div style="margin-top: 10px; font-size: 14px; color: #666;">
          请检查网络连接或联系客服
        </div>
      `;
    });
    
    iframeContainer.appendChild(iframe);
    
    contentWrapper.appendChild(toolbar);
    contentWrapper.appendChild(iframeContainer);
    modal.appendChild(contentWrapper);
    
    if (!document.getElementById('spin-animation-style')) {
      const style = document.createElement('style');
      style.id = 'spin-animation-style';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(modal);
    this.modalStack.push(modal.dataset.modalId);
    this.updateAnimationState();
    
    console.log('✓ 更多课程窗口已打开');
  }

  // 显示讲师简介（功能完整保留，篇幅较大省略部分实现细节）
  showInstructorProfile() {
    const instructor = this.config.instructor;
    if (!instructor) return;

    const modal = this.createModal();
    const content = modal.querySelector('.modal-content');
    content.className = 'modal-content instructor-profile-content';
    
    const profileDiv = document.createElement('div');
    profileDiv.className = 'instructor-profile';
    profileDiv.innerHTML = `
      <div class="instructor-header">
        <div class="instructor-avatar-wrapper">
          <img src="${instructor.avatar}" alt="${instructor.name}" class="instructor-avatar">
          <div class="instructor-badge">认证讲师</div>
        </div>
        <div class="instructor-intro">
          <h2 class="instructor-name">${instructor.name}</h2>
          <p class="instructor-title">${instructor.title}</p>
          <p class="instructor-experience">${instructor.experience}</p>
          <p class="instructor-description">${instructor.description}</p>
        </div>
      </div>
      <div class="instructor-sections">
        <div class="instructor-section">
          <div class="section-header"><span class="section-icon">🎓</span><h3>专业认证</h3></div>
          <ul class="certification-list">
            ${instructor.certifications.map(cert => `<li><span class="check-icon">✓</span>${cert}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
    
    content.appendChild(profileDiv);
    document.body.appendChild(modal);
    modal.classList.add('active');
  }

  // 绑定全局事件
  bindGlobalEvents() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModal = document.querySelector('.modal.active');
        if (activeModal) {
          activeModal.classList.remove('active');
          setTimeout(() => activeModal.remove(), 300);
        }
        const settingsMenu = document.getElementById('settings-menu');
        if (settingsMenu && settingsMenu.classList.contains('active')) {
          settingsMenu.classList.remove('active');
        }
      }
    });
    
    const settingsBtn = document.getElementById('settings-btn');
    const settingsMenu = document.getElementById('settings-menu');
    
    if (settingsBtn && settingsMenu) {
      settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('active');
      });
      
      document.addEventListener('click', (e) => {
        if (!settingsMenu.contains(e.target) && e.target !== settingsBtn) {
          settingsMenu.classList.remove('active');
        }
      });
    }
    
    const exportAuthBtn = document.getElementById('export-auth');
    if (exportAuthBtn) {
      exportAuthBtn.addEventListener('click', () => {
        if (this.authSystem.isAuthorized) {
          this.authSystem.exportAuthorization();
          settingsMenu.classList.remove('active');
        } else {
          alert('请先完成授权');
        }
      });
    }
    
    const viewMachineCodeBtn = document.getElementById('view-machine-code');
    if (viewMachineCodeBtn) {
      viewMachineCodeBtn.addEventListener('click', () => {
        const machineCode = this.authSystem.getMachineCode();
        this.showMachineCodeModal(machineCode);
        settingsMenu.classList.remove('active');
      });
    }
  }

  // 启用内容保护
  enableContentProtection() {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
    
    document.addEventListener('dragstart', (e) => {
      if (e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO') {
        e.preventDefault();
        return false;
      }
    });
    
    document.addEventListener('copy', (e) => {
      if (!e.target.closest('.copy-machine-code-modal')) {
        e.preventDefault();
        return false;
      }
    });
    
    document.addEventListener('selectstart', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return true;
      }
      e.preventDefault();
      return false;
    });
    
    console.log('✓ 内容保护已启用');
  }

  // 启动防盗录保护系统
  startAntiRecordingProtection() {
    console.log('🛡️ macOS 防盗录保护已启动');
    this.authSystem.startBlurDetection();
    this.authSystem.detectScreenCapture();
  }
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
  new SoundCardDebugger();
});
