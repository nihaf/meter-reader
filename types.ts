// Types for Meter Reader Application

export interface MeterReading {
  meter_id: string;
  meter_type: "electricity" | "water" | "gas" | "unknown";
  reading_value: number;
  unit: string;
  confidence: "high" | "medium" | "low";
  raw_response: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp?: string;
}

export interface ProcessingMetrics {
  processing_time_ms: number;
  image_size_bytes: number;
  confidence_score: number;
}