export interface Task {
  taskId?: number;
  projectId: number;
  title: string;
  description?: string | null;
  assignedTo?: string | null;
  status: string;
  dueDate?: string | null;
  createdOn?: string;
}

