export interface AppConfig {
  id: string;
  name: string;
  description: string;
  color: string;
  status: 'active' | 'coming-soon';
  database: string;
}

export const apps: AppConfig[] = [
  {
    id: 'loss-run-intelligence',
    name: 'Loss Run Intelligence',
    description: 'Insurance loss run processing & analytics',
    color: '#4285F4',
    status: 'active',
    database: 'TM-LOSSRUN'
  }
];
