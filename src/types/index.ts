export interface Position {
  x: number;
  y: number;
}

export interface PasteItem {
  id: string;
  type: 'image' | 'link' | 'text';
  content: string;
  position: Position;
  metadata?: {
    title?: string;
    description?: string;
  };
}

export interface TimeSettings {
  startTime: number;
  endTime: number;
} 