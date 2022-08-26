export interface CommonGameStatus {
  userKey: string;
  avatarUrl?: string;
  status: string;
  away: boolean;
  offline: boolean;
}

export interface CommonMatchHistory {
  userKey: string;
  game: string;
  status: string;
  date: number; // unix ts
  length: number; // in ms
}
