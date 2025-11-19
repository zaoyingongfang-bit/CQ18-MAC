// 声卡调试程序配置文件
const CONFIG = {
  // 设备信息
  device: {
    name: "CQ-18T",
    image: "images/设备图/CQ-18T.png"
  },

  // 主功能按钮配置
  mainButtons: [
    {
      id: "tutorial",
      label: "基础教程",
      icon: "📚",
      type: "submenu",
      submenu: [
        {
          label: "0.使用前必看！软件介绍与使用方法",
          type: "video",
          path: "images/视频/compressO-770pro 低音.webm"
        },
        {
          label: "第一章.基础操作",
          type: "nested-submenu",  // 二级子菜单类型
          submenu: [
            {
              label: "输入输出详解",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "五大屏幕详解-HOME",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "五大屏幕详解-CONFIG",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "五大屏幕详解-PROCESSING",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "五大屏幕详解-FADER",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "五大屏幕详解-FX",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
          ]
        },
        {
          label: "第二章.认识7大模板",
          type: "nested-submenu",  // 二级子菜单类型
          submenu: [
            {
              label: "All Quick模式详解",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "All Complete模式详解",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "Conference模式详解",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "Rock模式详解",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "Pop模式详解",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: " Country模式详解",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: " Jazz模式详解",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
          ]
        },
        {
          label: "第三章.轨道功能与通道条详解",
          type: "nested-submenu",  // 二级子菜单类型
          submenu: [
            {
              label: "Quick Channels一学就会",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "Complete Channel四件套认识",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "Gain Assistant与48V规范",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "轨道通道条GATE详解",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "轨道通道条PEQ详解",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: " 轨道通道条Compressor详解",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
          ]
        },
        {
          label: "第四章.路由与控制功能详解",
          type: "nested-submenu",  // 二级子菜单类型
          submenu: [
            {
              label: "CQ18路由得基本逻辑",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "返听的路由逻辑",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "发送得路由逻辑",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "推子前与推子后",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "DAC与Groups编组",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "自定义控制的使用方法",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
          ]
        },
        {
          label: "第五章.11款FX得正确打开方式",
          type: "nested-submenu",  // 二级子菜单类型
          submenu: [
            {
              label: "混响家族Easy Verb",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "混响家族Echo Verb",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "混响家族Space Verb",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "延迟家族Echo",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "延迟家族Tap Delay",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "延迟家族Stereo Delay",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "延迟家族Beat Delay",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "调制家族Double Tracker",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "调制家族Chorus",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "调制家族Flanger",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "调制家族Phaser",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
          ]
        },
        {
          label: "第六章.输出总线功能详解",
          type: "nested-submenu",  // 二级子菜单类型
          submenu: [
            {
              label: "Feedback Assistant（FBA）反馈助手使用方法",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "总线GEQ/PEQ使用方法",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "总线压缩/Limter使用方法",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "Output Delay：时间对齐与AV同步",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
          ]
        },
        {
          label: "第七章.其他实用功能详解",
          type: "nested-submenu",  // 二级子菜单类型
          submenu: [
            {
              label: "无线远程控制：CQ‑MixPad",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "无线远程控制：CQ4You",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "Wi‑Fi AP模式设置",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "如何使用USB音频接口功能",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "SD卡多轨录音",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "自动混音AMM设置使用方法",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "固件升级得方法",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "蓝牙功能得详解与应用",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
          ]
        },
      ]
    },
    {
      id: "driver",
      label: "驱动安装",
      icon: "💿",
      type: "submenu",
      submenu: [
        {
          label: "驱动安装",
          type: "exe",
          localPath: "images/EXE程序/AllenHeath_CQ_v5.50.0_setup.exe",
          downloadUrl: "https://example.com/driver_installer.exe"
        },
        {
          label: "打开官网自行下载驱动",
          type: "exe",
          localPath: "images/EXE程序/打开官网.bat",
          downloadUrl: "https://example.com/wdm2vst.exe"
        }
      ]
    },
    {
      id: "jumper",
      label: "实战教学",
      icon: "🔌",
      type: "submenu",
      submenu: [
        {
          label: "跳线插件安装",
          type: "exe",
          localPath: "images/EXE程序/wdm2vst.exe"
        },
        {
          label: "更多进阶/实战教程",
          type: "nested-submenu",  // 二级子菜单类型
          submenu: [
            {
              label: "CQ18自带混音电脑直播方案",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "CQ18搭载DAW电脑直播方案",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "CQ18自带混音手机直播方案",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "CQ18搭载DAW手机直播方案",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "如何兼顾现场与直播",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "乐队如何针对不同需求设计返听",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "个人/多人唱歌直播CQ18自带效果调音模板",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
            {
              label: "个人/多人唱歌直播CQ18搭载DAW效果调音模板",
              type: "video",
              path: "images/视频/lesson3.mp4"
            },
          ]
        },
        {
          label: "打开声音控制面板",
          type: "exe",
          localPath: "images/EXE程序/声音控制面板.exe",
        }
      ]
    },
    {
      id: "oneclick",
      label: "一键调试",
      icon: "🚀",
      type: "action",
      localPath: "images/EXE程序/oneclick_debug.exe",
      downloadUrl: "https://example.com/oneclick_debug.exe"
    }
  ],

  // 底部信息配置
  footer: {
    copyright: "造音工坊出品",
    year: new Date().getFullYear(),
    wechat: {
      enabled: true,
      qrImage: "images/wechat-qr.jpg",
      label: "添加微信"
    },
    social: [
      {
        platform: "bilibili",
        label: "关注B站",
        icon: "📺",
        qrImage: "images/Blibili.jpg",  // B站二维码图片（请替换为实际的B站二维码）
        url: "https://space.bilibili.com/your_id"
      },
      {
        platform: "douyin",
        label: "关注抖音",
        icon: "🎵",
        qrImage: "images/douyin.jpg",  // 抖音二维码图片（请替换为实际的抖音二维码）
        url: "https://www.douyin.com/user/your_id"
      },
      {
        platform: "xiaohongshu",
        label: "关注小红书",
        icon: "📖",
        qrImage: "images/xiaohongshu.jpg",  // 小红书二维码图片（请替换为实际的小红书二维码）
        url: "https://www.xiaohongshu.com/user/profile/your_id"
      },
      {
        platform: "wechat_public",
        label: "关注视频号",
        icon: "📱",
        qrImage: "images/shipinhao.jpg",  // 公众号二维码图片
        url: ""  // 公众号可以不需要链接
      }
    ]
  },

  // 讲师信息配置
  instructor: {
    name: "王观勋",
    title: "专业音频工程师",
    avatar: "images/instructor-avatar.jpg",  // 讲师头像图片
    experience: "15年专业音频工程师经验",
    description: "曾任多家知名录音棚技术总监，著名调音师、混音师、编曲人、音乐制作人",
    certifications: [
      "中央音乐学院认证教师",
      "摩登天空录音大师研讨会认证",
      "行业一线混音师周天澈大师班认证"
    ],
    teaching: {
      years: "15年音频技术培训经验",
      satisfaction: "学员满意度98%",
      highlight: "线上线下课学员无数。全网唯一专业、系统的音频类课程鼻祖！音频行业自媒体鼻祖频道"
    },
    practice: {
      musicians: "服务过10000+音乐人",
      anchors: "调试过5000+主播",
      studios: "开10+专业级录音棚经验",
      concerts: "大舞台演唱会调音经验"
    },
    reviews: {
      satisfaction: "98%学员满意度",
      features: "课程实用性强，讲解清晰易懂"
    }
  }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}

