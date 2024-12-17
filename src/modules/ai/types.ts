export interface MeetingSummaryRequest {
  title: string;
  transcript: string;
}

export interface MeetingSummaryResponse {
  summary: string;
  actionItems: string[];
}
