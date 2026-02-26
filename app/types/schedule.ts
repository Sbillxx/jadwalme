export interface ScheduleItem {
  id: string;
  course: string;
  lecturer: string;
  day: string;
  startTime: string;
  endTime: string;
  room: string;
  className?: string;
}

export type WeeklySchedule = Record<string, ScheduleItem[]>;
