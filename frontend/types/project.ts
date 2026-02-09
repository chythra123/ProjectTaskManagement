export interface Project {
  projectId?: number;
  projectName: string;
  clientName: string;
  startDate: string; // ISO Date string
  endDate?: string | null;
  isActive: boolean;
  createdOn?: string;
}

