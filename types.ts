
export enum Race {
  SLIME = '利姆鲁·史莱姆',
  KIJIN = '鬼人族·侍大将',
  DAEMON = '原初之黑·恶魔',
  DRAGONNEWT = '龙人族·龙战士',
  ANGEL = '天翼族·歼灭天使'
}

export interface User {
  id: string;
  realName: string;
  idCard: string;
  name: string;
  race: Race;
  level: number;
  magicules: number; // XP
  bio: string;
  verified: boolean;
  avatarUrl?: string; 
  trustScore: number;
  goldCoins: number;
  guildContribution: number;
  isProMember?: boolean;
}

export enum QuestDifficulty {
  D = 'F级·日常互助', 
  C = 'B级·社区协作', 
  B = 'A级·紧急支援', 
  A = 'S级·灾难救助', 
  S = 'SS级·世界守护' 
}

export interface Quest {
  id: string;
  title: string;
  description: string; 
  realTask: string; 
  location: [number, number]; 
  locationName: string;
  difficulty: QuestDifficulty;
  minLevel: number;
  trustPoints: number; 
  rewardDesc?: string; 
  rewardGold: number; 
  type: '物资运输' | '魔物讨伐' | '迷宫建设' | '异界交涉' | '紧急救援';
  estimatedTime: number; 
  isUrgent?: boolean;
  communityComments?: number;
  imageUrl?: string; 
}

export interface ToastMessage {
  id: string;
  title: string; 
  message: string;
  type: 'sage' | 'success' | 'warning' | 'danger';
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  mediaType?: 'image' | 'video';
  mediaUrl?: string;
  likes: number;
  isLiked?: boolean; 
  timestamp: string;
  isUrgent: boolean;
  comments: Comment[]; 
}

export interface BrandOpportunity {
  id: string;
  brandName: string;
  title: string;
  description: string;
  type: 'EQUIPMENT' | 'WORKSHOP' | 'RECOGNITION';
  iconUrl?: string;
  isProOnly: boolean;
  spots?: number;
}

export interface PlayerGuild {
  id: string;
  name: string;
  description: string;
  leader: string;
  memberCount: number;
  level: number;
  isJoined?: boolean;
  tags: string[];
  bannerUrl?: string;
}
