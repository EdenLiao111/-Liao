export type MediaType = 'image' | 'video';

export interface PortfolioItem {
  id: string;
  type: MediaType;
  url: string;
  title: string;
  description?: string;
  timestamp: number;
}
