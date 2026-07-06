export interface ValidationRequest {
  stepId: string;
  apiKey: string;
  context?: ValidationContext;
}

export interface ValidationContext {
  userId?: string;
  workspaceId?: string;
  environmentId?: string;
  artemisWorkspaceId?: string;
  artemisEnvironmentId?: string;
  apiBasicsWorkspaceId?: string;
  apiBasicsEnvironmentId?: string;
  apiBasicsCollectionUid?: string;
  bankingWorkspaceId?: string;
  bankingEnvironmentId?: string;
  bankingCollectionUid?: string;
  aiEngineerWorkspaceId?: string;
  aiEngineerEnvironmentId?: string;
  aiEngineerConsumersCollectionUid?: string;
}

export interface ValidationResult {
  success: boolean;
  message: string;
  details?: string;
  pointsAwarded: number;
  context?: ValidationContext;
}

export type ValidatorFn = (
  apiKey: string,
  context: ValidationContext
) => Promise<ValidationResult>;
