
import { Quest, QuestDifficulty, Race, CommunityPost, BrandOpportunity, PlayerGuild } from './types';

// REPLACED: Stable Unsplash Image for Landing Hero
export const LANDING_HERO_IMAGE = "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2000&auto=format&fit=crop"; 

// 次元廣播隨機模板
export const BROADCAST_TEMPLATES = [
  "【{loc}】ID:{id} 成功封印了这里的异常点，获得星徽 +{xp}。",
  "【{loc}】深夜传送协议触发。ID:{id} 仅耗时 {time} 分钟抵达目标区域。",
  "【{loc}】高危目标出现。ID:{id} 带领小队执行了围剿行动，赏金已结算。",
  "【{loc}】ID:{id} 成功回收关键物资（代购成功），补给线已恢复。",
  "【{loc}】警报解除。ID:{id} 完成了 S 级指令，区域秩序稳定度提升。",
  "【{loc}】ID:{id} 上传了新的战术日志，建议查阅。",
  "【{loc}】公会战况：ID:{id} 贡献了大量战术积分，领先优势扩大。",
  "【{loc}】ID:{id} 激活了短距传送阵，信号从雷达上消失。",
  "【{loc}】物资运输完成。ID:{id} 确保了该区域的补给安全。",
  "【{loc}】ID:{id} 达成百次封印成就，获得专属识别代码。"
];

export const TRANSLATIONS = {
  zh: {
    identity_verified: '灵压连接建立。欢迎归队，执行者。',
    welcome: '欢迎接入艾塞尔加德战术网络。',
    insufficient_level: '权限不足。该协议要求更高的安全等级。',
    contract_active: '当前已有执行中的指令。请专注于眼前的目标。',
    mission_start: '指令确认。任务开始。保持通讯频道畅通。',
    auto_nav_start: '战术导航已启动。前往标记坐标。',
    auto_nav_stop: '抵达目标区域。导航结束。',
    level_up: '能力评估更新。权限等级提升。',
    level_down: '警告：绩效指标下降。等级回调。',
    mission_complete: '任务目标达成。奖励已结算。',
    mission_abort: '任务中止。战术撤回。',
    guild_title: '战术大厅',
    guild_chat_title: '加密频道',
    urgent_tag: '高危指令',
    tab_guild: '大厅',
    tab_world: '世界',
    tab_alliances: '合作',
    tab_squads: '公会', 
    post_placeholder: '上传战术日志...',
    req_level: '权限等级',
    filter_all: '全部',
    gps_link: '卫星视图',
    submit: '上传凭证',
    auto: '自动寻路',
    disclaimer_title: '执行者公约',
    disclaimer_body: '这是一个志愿协作网络。我们基于荣誉与信任行动。',
    understand: '确认协议',
    pro_title: '精英执照',
    pro_subtitle: '成为传奇',
    pro_def_is: '身份与权限已通过高阶认证。',
    pro_def_not: '非雇佣合同，这是荣誉的象征。',
    pro_benefit_1: '专属识别徽章',
    pro_benefit_desc_1: '在社区中获得更高的信任权重。',
    pro_benefit_2: '优先接入权',
    pro_benefit_desc_2: '优先获取高危紧急指令。',
    pro_benefit_3: '装备配给',
    pro_benefit_desc_3: '申请赞助商提供的战术装备。',
    pro_crit_title: '资格审查',
    pro_crit_1: '完成 3 次以上指令',
    pro_crit_2: '获得 2 次以上推荐',
    pro_crit_3: '选择专精领域',
    pro_crit_4: '身份验证通过',
    pro_disclaimer: '仅作为社区内部身份认证。',
    pro_action_check: '检查资格',
    pro_action_apply: '申请执照',
    pro_price: '免费',
    pro_status_review: '资料审核中...',
    
    guild_search_placeholder: '搜索作战小队...',
    guild_create: '建立小队',
    guild_join: '申请加入',
    guild_leave: '退出小队',
    guild_members: '成员',
    guild_joined: '已加入',
    guild_create_success: '小队建立成功。准备行动。',
    guild_join_success: '申请已发送。等待批准。',
    guild_leave_success: '已脱离小队。休息一下。',

    friends_title: '通讯录',
    friends_tab_mine: '联络人',
    friends_tab_pending: '待处理',
    friends_search_placeholder: '搜索 ID 或代号...',
    friends_no_found: '未检索到该执行者信号。',
    friends_add_success: '链接请求已发送。',
    friends_online: '执行中',
    friends_offline: '休眠',
    friends_sync_contacts: '同步灵压链接',
  },
  en: {
    identity_verified: 'Soul link established. Welcome back, Operative.',
    welcome: 'Welcome to the Aethelgard Network.',
    insufficient_level: 'Access denied. Higher security clearance required.',
    contract_active: 'Active contract in progress. Focus on the objective.',
    mission_start: 'Directive confirmed. Mission start. Stay in contact.',
    auto_nav_start: 'Tactical navigation engaged. Proceed to marker.',
    auto_nav_stop: 'Target coordinates reached. Navigation ending.',
    level_up: 'Performance assessment updated. Level up.',
    level_down: 'Warning: Performance drop. Level decreased.',
    mission_complete: 'Mission complete. Rewards processed.',
    mission_abort: 'Mission aborted. RTB.',
    guild_title: 'Tactical Hall',
    guild_chat_title: 'Encrypted Comms',
    urgent_tag: 'Urgent',
    tab_guild: 'Hall',
    tab_world: 'World',
    tab_alliances: 'Brands',
    tab_squads: 'Squads',
    post_placeholder: 'Log entry...',
    req_level: 'Clearance Lv.',
    filter_all: 'ALL',
    gps_link: 'Sat Link',
    submit: 'Upload Proof',
    auto: 'Auto Nav',
    disclaimer_title: 'Hunter Protocol',
    disclaimer_body: 'This is a voluntary community network. Action based on trust.',
    understand: 'Acknowledge',
    pro_title: 'Pro License',
    pro_subtitle: 'Become a Legend',
    pro_def_is: 'Verified Identity & Clearance',
    pro_def_not: 'Not an Employment Contract',
    pro_benefit_1: 'Verified Badge',
    pro_benefit_desc_1: 'Higher trust weight in the network.',
    pro_benefit_2: 'Priority Access',
    pro_benefit_desc_2: 'Access urgent directives first.',
    pro_benefit_3: 'Equipment Support',
    pro_benefit_desc_3: 'Apply for tactical gear.',
    pro_crit_title: 'Eligibility Check',
    pro_crit_1: '3+ Missions Complete',
    pro_crit_2: '2+ Recommendations',
    pro_crit_3: 'Select Expertise',
    pro_crit_4: 'ID Verified',
    pro_disclaimer: 'Community status only.',
    pro_action_check: 'Check Eligibility',
    pro_action_apply: 'Apply for License',
    pro_price: 'Free',
    pro_status_review: 'Under Review...',
    
    guild_search_placeholder: 'Search for squads...',
    guild_create: 'Create Squad',
    guild_join: 'Join',
    guild_leave: 'Leave',
    guild_members: 'Members',
    guild_joined: 'Joined',
    guild_create_success: 'Squad initialized.',
    guild_join_success: 'Application transmitted.',
    guild_leave_success: 'Disengaged from squad.',

    friends_title: 'Contacts',
    friends_tab_mine: 'Friends',
    friends_tab_pending: 'Requests',
    friends_search_placeholder: 'Search ID or Callsign...',
    friends_no_found: 'Signal not found. Check coordinates.',
    friends_add_success: 'Link request transmitted.',
    friends_online: 'Active',
    friends_offline: 'Dormant',
    friends_sync_contacts: 'Sync Soul Links',
  }
};

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'q1',
    title: 'Time Square Cleanup',
    description: 'Sector A1 is overcrowded with debris. Clearance required immediately.',
    realTask: 'Community Cleanup',
    location: [40.7580, -73.9855],
    locationName: 'Times Square',
    difficulty: QuestDifficulty.C,
    minLevel: 1,
    trustPoints: 50,
    rewardGold: 100,
    type: '迷宫建设',
    estimatedTime: 30,
    isUrgent: true,
    imageUrl: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'q2',
    title: 'Central Park Patrol',
    description: 'Monitor the ancient forest perimeter for anomalies.',
    realTask: 'Park Safety Watch',
    location: [40.785091, -73.968285],
    locationName: 'Central Park',
    difficulty: QuestDifficulty.B,
    minLevel: 5,
    trustPoints: 120,
    rewardGold: 300,
    type: '魔物讨伐',
    estimatedTime: 60,
    imageUrl: 'https://images.unsplash.com/photo-1510265119258-db115b0e8172?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'q3',
    title: 'Brooklyn Bridge Supply Run',
    description: 'Transport essential crystals to the outpost. High efficiency required.',
    realTask: 'Food Bank Delivery',
    location: [40.7061, -73.9969],
    locationName: 'Brooklyn Bridge',
    difficulty: QuestDifficulty.D,
    minLevel: 1,
    trustPoints: 30,
    rewardDesc: 'Free Bagel',
    rewardGold: 50,
    type: '物资运输',
    estimatedTime: 45,
    imageUrl: 'https://images.unsplash.com/photo-1542384557-0e248b75f564?auto=format&fit=crop&w=800&q=80'
  }
];

export const MOCK_POSTS: CommunityPost[] = [
  {
    id: 'p1',
    author: 'Rimuru_Tempest',
    content: 'Patrol complete at Central Park Sector. No anomalies detected. 🐿️ #SafetyFirst',
    timestamp: '2m ago',
    likes: 24,
    isUrgent: false,
    comments: [
        { id: 'c1', author: 'Gobta', content: 'Did you spot the alpha?', timestamp: '1m ago' }
    ]
  },
  {
    id: 'p2',
    author: 'Veldora',
    content: 'Identified a high-value resource node (Ramen Shop) near the subway entrance. Coordinates shared. 🍜',
    timestamp: '15m ago',
    likes: 156,
    isUrgent: false,
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    comments: []
  }
];

export const BRAND_MANIFESTO = [
    {
        title: 'OUR PLEDGE',
        content: 'We believe in a world where digital value meets physical action. We do not sell ads. We support heroes.',
        highlight: true
    },
    {
        title: 'FOR BRANDS',
        content: 'Don\'t buy attention. Earn respect. Sponsor equipment, host workshops, and fuel the people who make the city better.'
    }
];

export const MOCK_BRAND_OPPS: BrandOpportunity[] = [
    {
        id: 'b1',
        brandName: 'Sony',
        title: 'Alpha Gear Program',
        description: 'Lending cameras to top-tier scouts for high-res documentation of city events.',
        type: 'EQUIPMENT',
        isProOnly: true
    },
    {
        id: 'b2',
        brandName: 'Patagonia',
        title: 'Urban Ranger Workshop',
        description: 'Free training session on sustainable city living and gear maintenance.',
        type: 'WORKSHOP',
        isProOnly: false
    }
];

// REPLACED: Stable Unsplash Images for Race Avatars (No more AI rate limits)
export const RACE_CONFIG = {
    [Race.SLIME]: {
        desc: 'Possesses infinite potential and adaptability. Friendly to all factions.',
        job: 'Novice Adventurer',
        buff: 'Stamina +10%',
        img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop' // Cute slime-like texture
    },
    [Race.KIJIN]: {
        desc: 'High combat capabilities and honor. specialized in direct action.',
        job: 'Samurai Guard',
        buff: 'Strength +15%',
        img: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=600&auto=format&fit=crop' // Samurai vibe
    },
    [Race.DAEMON]: {
        desc: 'Master of magic and negotiation. Excellent at intelligence gathering.',
        job: 'Shadow Broker',
        buff: 'Intel +20%',
        img: 'https://images.unsplash.com/photo-1620553856858-b11893c5d6d8?q=80&w=600&auto=format&fit=crop' // Dark/Mysterious
    },
    [Race.DRAGONNEWT]: {
        desc: 'Defenders of the sky. Aerial mobility and reconnaissance.',
        job: 'Sky Ranger',
        buff: 'Speed +15%',
        img: 'https://images.unsplash.com/photo-1551893478-d726eaf0442c?q=80&w=600&auto=format&fit=crop' // Dragon/Lizard like
    },
    [Race.ANGEL]: {
        desc: 'Enforcers of order. High charisma and leadership.',
        job: 'City Arbiter',
        buff: 'Charisma +20%',
        img: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=600&auto=format&fit=crop' // Ethereal/Angel
    }
};

export const MOCK_GUILDS: PlayerGuild[] = [
    {
        id: 'g1',
        name: '貓貓巡邏隊',
        description: '专职负责街猫投喂与公园巡逻。休闲公会。',
        leader: 'MeowMaster',
        memberCount: 128,
        level: 5,
        isJoined: false,
        tags: ['动物', '休闲', '公园'],
        bannerUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'g2',
        name: '深夜食堂',
        description: '搜寻深夜物资点，负责夜间运输。',
        leader: 'ChefSan',
        memberCount: 45,
        level: 3,
        isJoined: true,
        tags: ['美食', '夜行', '运输'],
        bannerUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'g3',
        name: '铁壁防线',
        description: '负责大型活动秩序维护与灾害支援。硬核玩家限定。',
        leader: 'IronWall',
        memberCount: 300,
        level: 9,
        isJoined: false,
        tags: ['硬核', '纪律', '守护'],
        bannerUrl: 'https://images.unsplash.com/photo-1595855769995-2dfb750cb39d?auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'g4',
        name: '绿色和平',
        description: '致力于城市绿化与环保回收指令。',
        leader: 'Leafy',
        memberCount: 89,
        level: 4,
        isJoined: false,
        tags: ['环保', '自然', '回收'],
        bannerUrl: 'https://images.unsplash.com/photo-1518531933037-9a8477d09333?auto=format&fit=crop&w=800&q=80'
    }
];
