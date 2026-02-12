export interface App {
  app_id: string;
  app_name: string;
  description: string;
  color: string;
  status: 'active' | 'coming-soon';
  database: string;
  stats?: {
    total_users: number;
    active_today: number;
    total_batches: number;
  };
}

export interface SystemHealth {
  app_id: string;
  current: DailyMetrics;
  trend: DailyMetrics[];
}

export interface DailyMetrics {
  date: string;
  total_batches: number;
  total_policies: number;
  total_pdfs?: number;
  total_claims: number;
  matched_claims: number;
  unmatched_claims: number;
  match_rate: number;
  avg_processing_time: number;
  min_processing_time?: number;
  max_processing_time?: number;
  success_rate: number;
  avg_policies_per_batch?: number;
}

export interface User {
  username: string;
  organization: string;
  total_batches: number;
  total_policies: number;
  total_claims_raw?: number;
  matched_claims: number;
  match_rate: number;
  avg_processing_time: number;
  first_request?: string;
  last_request?: string;
}

export interface Batch {
  batch_id: string;
  username: string;
  organization: string;
  timestamp: string;
  date: string;
  policy_count: number;
  pdf_count: number;
  total_claims: number;
  matched_claims: number;
  unmatched_claims: number;
  match_rate: number;
  avg_processing_time: number;
  status: string;
  products: string[];
}

export interface BatchDetail extends Batch {
  summary: {
    policy_count: number;
    pdf_count: number;
    total_claims: number;
    matched_claims: number;
    unmatched_claims: number;
    match_rate: number;
    avg_processing_time: number;
  };
  policies: Policy[];
}

export interface Policy {
  appnum: string;
  status: string;
  stats: {
    raw_claims: number;
    matched: number;
    unmatched: number;
    inferenced_count?: number;
  };
  products: string[];
  processing_time: number;
}

export interface FailureSummary {
  summary: {
    total_unmatched: number;
    total_unmapped_value: number;
    unique_lob_codes: number;
  };
  by_lob: FailureByLOB[];
}

export interface FailureByLOB {
  lob_code: string;
  failure_count: number;
  total_incurred: number;
  affected_carriers: string[];
  common_reason: string;
}

export interface Failure {
  loss_number: string;
  batch_id: string;
  appnum: string;
  date: string;
  raw_lob: string;
  description: string;
  incurred: number;
  carrier: string;
  unmatched_reason: string;
  date_of_loss: string;
}

export interface Product {
  product: string;
  policies_count: number;
  batches_count: number;
}