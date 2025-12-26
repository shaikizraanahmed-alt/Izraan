
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface WeatherInfo {
  temp: number;
  condition: string;
  location: string;
}

export interface Task {
  id: string;
  title: string;
  time: string;
  status: 'pending' | 'completed';
}

export enum SessionState {
  IDLE = 'IDLE',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR'
}
