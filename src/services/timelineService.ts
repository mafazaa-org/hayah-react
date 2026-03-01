import type { Task } from '../types/task';

// Timeline-specific task type with guaranteed start/end dates
export interface TimelineTask extends Task {
  startDate: string;
  endDate: string;
}

export interface Dependency {
  id: string;
  source: string; // Task ID (predecessor)
  target: string; // Task ID (successor)
  type: 'finish_to_start' | 'start_to_start' | 'finish_to_finish' | 'start_to_finish';
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STATUSES = ['todo', 'in-progress', 'done'] as const;
const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
const TASK_NAMES = [
  'تصميم واجهة المستخدم',
  'تطوير الواجهة الخلفية',
  'اختبار الوحدات',
  'مراجعة الكود',
  'إعداد قاعدة البيانات',
  'تكامل API',
  'توثيق المشروع',
  'إصلاح الأخطاء',
  'تحسين الأداء',
  'إعداد CI/CD',
  'تصميم النماذج الأولية',
  'اختبار التكامل',
  'إعداد البيئة',
  'مراجعة المتطلبات',
  'نشر التطبيق',
];

export const timelineService = {
  /**
   * Fetch tasks with timeline-specific data (start/end dates)
   */
  getTimelineTasks: async (
    listId: string,
    startRange: Date,
    endRange: Date
  ): Promise<TimelineTask[]> => {
    await delay(600);

    const tasks: TimelineTask[] = [];
    const count = 15;
    const viewStart = startRange.getTime();
    const viewEnd = endRange.getTime();
    const range = viewEnd - viewStart;

    for (let i = 0; i < count; i++) {
      const taskStart = new Date(viewStart + Math.random() * (range * 0.8));
      const durationDays = 1 + Math.floor(Math.random() * 7);
      const taskEnd = new Date(taskStart);
      taskEnd.setDate(taskStart.getDate() + durationDays);

      // Build dependency list: ~30 % chance of depending on a previous task
      const deps: string[] = [];
      if (i > 0 && Math.random() > 0.7) {
        deps.push(`task-${listId}-${i - 1}`);
      }

      tasks.push({
        id: `task-${listId}-${i}`,
        title: TASK_NAMES[i % TASK_NAMES.length],
        status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
        priority: PRIORITIES[Math.floor(Math.random() * PRIORITIES.length)],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startDate: taskStart.toISOString(),
        dueDate: taskEnd.toISOString(),
        endDate: taskEnd.toISOString(),
        order: i,
        dependencies: deps,
        assignees: [],
      });
    }

    return tasks.sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  },

  /**
   * Fetch dependencies between tasks.
   * Derives Dependency objects from the `dependencies` array on each task.
   */
  getDependencies: async (listId: string): Promise<Dependency[]> => {
    await delay(400);

    // Generate dependencies that are consistent with getTimelineTasks output
    const deps: Dependency[] = [];
    const count = 15;

    for (let i = 1; i < count; i++) {
      if (Math.random() > 0.7) {
        deps.push({
          id: `dep-${listId}-${i}`,
          source: `task-${listId}-${i - 1}`,
          target: `task-${listId}-${i}`,
          type: 'finish_to_start',
        });
      }
    }

    return deps;
  },

  /**
   * Update a task's start and end dates (mock — for future drag-to-resize).
   */
  updateTaskDates: async (
    taskId: string,
    startDate: string,
    endDate: string
  ): Promise<{ taskId: string; startDate: string; endDate: string }> => {
    await delay(300);
    return { taskId, startDate, endDate };
  },
};
