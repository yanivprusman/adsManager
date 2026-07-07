export interface Metrics {
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number; // percent
  cpc: number;
  cpm?: number;
  reach: number;
  frequency?: number;
}

export interface DailyPoint {
  date: string; // YYYY-MM-DD
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm?: number;
  reach: number;
  frequency?: number;
}

export interface Account {
  id: string;
  name: string;
  currency: string;
  pageId: string;
  pageName: string;
  linkDomain: string;
  daily: DailyPoint[];
}

export interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  createdTime: string;
  startTime: string;
  dailyBudget: number | null;
  lifetimeBudget: number | null;
  metrics: Metrics;
}

export interface AdSet {
  id: string;
  campaignId: string;
  name: string;
  status: string;
  createdTime: string;
  metrics: Metrics;
}

export interface Ad {
  id: string;
  adsetId: string;
  campaignId: string;
  creativeId: string;
  name: string;
  status: string;
  createdTime: string;
  metrics: Metrics;
  daily: DailyPoint[];
}

export interface Creative {
  id: string;
  name: string;
  status: string;
  body: string;
  title: string;
  callToAction: string;
  imageHash: string;
  image: string; // local /creatives/<id>.png
  imageWidth: number;
  imageHeight: number;
  postId: string;
}

export interface Snapshot {
  fetchedAt: string;
  source: string;
  account: Account;
  campaigns: Campaign[];
  adsets: AdSet[];
  ads: Ad[];
  creatives: Creative[];
}

export interface AdUserData {
  starred?: boolean;
  tags?: string[];
  notes?: string;
}

export interface UserData {
  ads: Record<string, AdUserData>;
}

export type AdActionType = "pause" | "resume";

export interface QueuedAction {
  id: string;
  adId: string;
  adName: string;
  type: AdActionType;
  requestedAt: string;
  status: "pending" | "applied" | "cancelled";
}

export interface ActionsFile {
  actions: QueuedAction[];
}

export interface Insight {
  kind: "win" | "warn" | "info";
  title: string;
  detail: string;
  adId?: string;
}

/** An ad joined with everything needed to render it. */
export interface AdFull extends Ad {
  adset: AdSet;
  campaign: Campaign;
  creative: Creative;
  /** stable palette slot (0-based, by creation order then id) */
  slot: number;
  user: AdUserData;
  pendingAction?: QueuedAction;
}
