export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  moduleIds: string[];
  private?: boolean;
}
