// Shared types. Frozen with CONTRACT.md — changes need integrator approval.

export type TaskSource = "classroom" | "custom";
export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "normal" | "high";

export type Task = {
  id: string;
  source: TaskSource;
  courseId: string | null;
  courseLabel?: string | null; // free-text label typed by the user; null is the "Unfiled" board
  classroomCourseworkId?: string;
  title: string;
  description?: string;
  dueAt?: string | null;
  status: TaskStatus; // per-user resolved
  priority: TaskPriority;
  completedAt: string | null; // per-user done stamp from task_state, powers done-this-week
  replyCount: number; // posts on the thread, for the row badge
};

export type Course = {
  id: string;
  classroomId: string;
  name: string;
  section?: string;
  room?: string;
};

export type Post = {
  id: string;
  taskId: string;
  authorId: string;
  bodyText?: string;
  imageUrl?: string;
  linkUrl?: string;
  createdAt: string;
};

export type Reply = {
  id: string;
  postId: string;
  authorId: string;
  bodyText: string;
  linkUrl?: string;
  createdAt: string;
};
