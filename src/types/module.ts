export interface Module {
  id: string;
  title: string;
  description: string;
  color: string;
  icon: string;
  lessons: Lesson[];
  private?: boolean;
}

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  partNumber: number;
  steps: Step[];
}

export interface Step {
  id: string;
  stepNumber: number;
  title: string;
  description: string;
  points: number;
  validatorId: string;
  manual?: boolean;
}
