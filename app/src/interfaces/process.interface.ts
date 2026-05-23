import { Client } from './client.interface';
import { Establishment } from './establishment.interface';

export type ProcessStatus = 
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'AWAITING_DOCUMENTATION'
  | 'IN_ANALYSIS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Process {
  id?: string;
  company_id?: string;
  user_id: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  establishment_id: string;
  establishment?: Establishment;
  protocol?: string | null;
  observation?: string | null;
  status?: ProcessStatus;
  clients?: Client[];
  client_ids?: string[]; // Payload for create/update
  created_at?: string;
  updated_at?: string;
}

export interface ProcessListParams {
  status?: string;
  protocol?: string;
  client_id?: string;
  user_id?: string;
  page?: number;
  limit?: number;
}
