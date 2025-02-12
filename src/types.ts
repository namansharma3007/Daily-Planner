export interface Task {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  completed: boolean;
  color: string;
}

export interface DayPlan {
  date: string;
  tasks: Task[];
}