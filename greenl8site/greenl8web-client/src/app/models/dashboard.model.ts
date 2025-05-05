export interface DashboardSummary {
    postCount: number;
    draftCount: number;
    pageCount: number;
    commentCount: number;
    pendingCommentCount: number;
    userCount: number;
    newUserCount: number;
    viewCount: number;
    recentDrafts: any[];
    recentComments: any[];
    trafficData: any[];
  }
  
  export interface RecentActivity {
    id: number;
    type: string;
    user: string;
    message: string;
    timestamp: string;
    entityId: number;
    entityType: string;
  }
  
  export interface SystemStatus {
    serverStatus: string;
    serverLoad: number;
    databaseStatus: string;
    storageUsed: string;
    storageTotal: string;
    storagePercentage: number;
    version: string;
    updateAvailable: boolean;
  }
  
  export interface ChartDataPoint {
    label: string;
    value: number;
  }