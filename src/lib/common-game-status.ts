export interface CommonGameStatus {
  userKey: string;
  status: string;
  away: boolean;
  offline: boolean;
}

export interface CommonMatchHistory {
  userKey: string;
  status: string;
  date: number; // unix ts
}
