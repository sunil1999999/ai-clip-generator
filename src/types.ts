export interface Word {
  id: string;
  text: string;
  start: number; // in seconds
  end: number; // in seconds
  speakerId: string;
  deleted?: boolean;
  bRoll?: string;
  emoji?: string;
}

export interface Speaker {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

export interface Clip {
  id: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  duration: number;
  viralScore: number;
  captionsStyle?: string;
  hashtags: string[];
  suggestedTitles: string[];
  transcript: Word[];
  facePositionX?: number; // 0 to 100 center of current speaker
  speakerId: string;
  reason: string;
}

export interface BrandTemplate {
  name: string;
  fontFamily: string;
  fontSize: number; // in px
  primaryColor: string; // e.g. #FFFF00
  strokeColor: string; // e.g. #000000
  fontCase: 'uppercase' | 'none' | 'lowercase';
  backgroundColor: string; // e.g. rgba(0,0,0,0.5)
  logoUrl?: string;
  logoPosition?: 'top-left' | 'top-right' | 'bottom-right';
}

export interface BRollAsset {
  id: string;
  keyword: string;
  imageUrl: string;
  duration: number;
}

export interface SocialPublishConfig {
  publishedAt?: string;
  platforms: ('tiktok' | 'youtube_shorts' | 'instagram_reels')[];
  scheduledTime?: string;
  title: string;
  description: string;
  hashtags: string[];
}
