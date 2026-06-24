import { ValidatorFn } from "@/types/validation";
import { validateWorkspace } from "./artemis-mission-control/step1-workspace";
import { validateCollection } from "./artemis-mission-control/step2-collection";
import { validateEnvironmentExists } from "./artemis-mission-control/step3-environment";
import { validateEnvironmentValues } from "./artemis-mission-control/step4-env-values";
import { validateHealthAndRegister } from "./artemis-mission-control/step5-health-register";
import { validateApiKeySaved } from "./artemis-mission-control/step6-apikey-saved";
import { validateMissionResponse } from "./artemis-mission-control/step7-mission-response";
import { validateMissionLogs } from "./artemis-mission-control/step8-mission-logs";
import { validateLogUpdated } from "./artemis-mission-control/step9-log-updated";
import { validateLogDeleted } from "./artemis-mission-control/step10-log-deleted";
import { validateMissionBriefing } from "./artemis-mission-control/step11-mission-briefing";
import { validateSplashdown } from "./artemis-mission-control/step12-splashdown";
import { validateTestCollection } from "./artemis-mission-control/step13-test-collection";
import { validateTestEnvironment } from "./artemis-mission-control/step14-test-environment";
import { validateApiBasicsCreateWorkspace } from "./api-basics/validate-api-basics-create-workspace";
import { validateApiBasicsCreateCollection } from "./api-basics/validate-api-basics-create-collection";
import { validateApiBasicsCreateEnvironment } from "./api-basics/validate-api-basics-create-environment";
import { validateApiBasicsUseBaseUrl } from "./api-basics/validate-api-basics-use-base-url";
import { validateApiBasicsSendAndTest } from "./api-basics/validate-api-basics-send-and-test";
import { validateBankingCreateWorkspace } from "./banking-ai-mcp-bootcamp/validate-banking-create-workspace";
import { validateBankingForkCollection } from "./banking-ai-mcp-bootcamp/validate-banking-fork-collection";
import { validateBankingCreateEnvironment } from "./banking-ai-mcp-bootcamp/validate-banking-create-environment";
import { validateBankingSetBaseUrl } from "./banking-ai-mcp-bootcamp/validate-banking-set-base-url";
import { validateBankingSetApiKey } from "./banking-ai-mcp-bootcamp/validate-banking-set-api-key";
import { validateBankingFromAccount } from "./banking-ai-mcp-bootcamp/validate-banking-from-account";
import { validateBankingToAccount } from "./banking-ai-mcp-bootcamp/validate-banking-to-account";
import { validateBankingTransactionId } from "./banking-ai-mcp-bootcamp/validate-banking-transaction-id";
import { validateBankingGenerateTests } from "./banking-ai-mcp-bootcamp/validate-banking-generate-tests";
import { validateBankingCollectionRunner } from "./banking-ai-mcp-bootcamp/validate-banking-collection-runner";
import { validateBankingGenerateApiKey } from "./banking-ai-mcp-bootcamp/validate-banking-generate-api-key";
import { validateBankingCreateMcpRequest } from "./banking-ai-mcp-bootcamp/validate-banking-create-mcp-request";
import { validateBankingQueryMcp } from "./banking-ai-mcp-bootcamp/validate-banking-query-mcp";
import { validateBankingAddMcpClaude } from "./banking-ai-mcp-bootcamp/validate-banking-add-mcp-claude";
import { validateBankingVerifyConnection } from "./banking-ai-mcp-bootcamp/validate-banking-verify-connection";
import { validateBankingAddTestsMcp } from "./banking-ai-mcp-bootcamp/validate-banking-add-tests-mcp";
import { validateWorldExplorerCreateWorkspace } from "./world-explorer/validate-world-explorer-create-workspace";
import { validateWorldExplorerCreateCollection } from "./world-explorer/validate-world-explorer-create-collection";
import { validateWorldExplorerAddLookup } from "./world-explorer/validate-world-explorer-add-lookup";
import { validateWorldExplorerPickDestination } from "./world-explorer/validate-world-explorer-pick-destination";
import { validateWorldExplorerStoreVariable } from "./world-explorer/validate-world-explorer-store-variable";
import { validateWorldExplorerAgentModeTest } from "./world-explorer/validate-world-explorer-agent-mode-test";
import { validateWorldExplorerStampPassport } from "./world-explorer/validate-world-explorer-stamp-passport";
import { validateWorldExplorerVisualization } from "./world-explorer/validate-world-explorer-visualization";
import { validateWorldExplorerVerifyJourney } from "./world-explorer/validate-world-explorer-verify-journey";
import { validateWorldExplorerSurpriseDestination } from "./world-explorer/validate-world-explorer-surprise-destination";

export const validatorRegistry: Record<string, ValidatorFn> = {
  "validate-workspace": validateWorkspace,
  "validate-collection": validateCollection,
  "validate-environment-exists": validateEnvironmentExists,
  "validate-environment-values": validateEnvironmentValues,
  "validate-health-and-register": validateHealthAndRegister,
  "validate-apikey-saved": validateApiKeySaved,
  "validate-mission-response": validateMissionResponse,
  "validate-mission-logs": validateMissionLogs,
  "validate-log-updated": validateLogUpdated,
  "validate-log-deleted": validateLogDeleted,
  "validate-mission-briefing": validateMissionBriefing,
  "validate-splashdown": validateSplashdown,
  "validate-test-collection": validateTestCollection,
  "validate-test-environment": validateTestEnvironment,
  "validate-api-basics-create-workspace": validateApiBasicsCreateWorkspace,
  "validate-api-basics-create-collection": validateApiBasicsCreateCollection,
  "validate-api-basics-create-environment": validateApiBasicsCreateEnvironment,
  "validate-api-basics-use-base-url": validateApiBasicsUseBaseUrl,
  "validate-api-basics-send-and-test": validateApiBasicsSendAndTest,
  "validate-banking-create-workspace": validateBankingCreateWorkspace,
  "validate-banking-fork-collection": validateBankingForkCollection,
  "validate-banking-create-environment": validateBankingCreateEnvironment,
  "validate-banking-set-base-url": validateBankingSetBaseUrl,
  "validate-banking-set-api-key": validateBankingSetApiKey,
  "validate-banking-from-account": validateBankingFromAccount,
  "validate-banking-to-account": validateBankingToAccount,
  "validate-banking-transaction-id": validateBankingTransactionId,
  "validate-banking-generate-tests": validateBankingGenerateTests,
  "validate-banking-collection-runner": validateBankingCollectionRunner,
  "validate-banking-generate-api-key": validateBankingGenerateApiKey,
  "validate-banking-create-mcp-request": validateBankingCreateMcpRequest,
  "validate-banking-query-mcp": validateBankingQueryMcp,
  "validate-banking-add-mcp-claude": validateBankingAddMcpClaude,
  "validate-banking-verify-connection": validateBankingVerifyConnection,
  "validate-banking-add-tests-mcp": validateBankingAddTestsMcp,
  "validate-world-explorer-create-workspace": validateWorldExplorerCreateWorkspace,
  "validate-world-explorer-create-collection": validateWorldExplorerCreateCollection,
  "validate-world-explorer-add-lookup": validateWorldExplorerAddLookup,
  "validate-world-explorer-pick-destination": validateWorldExplorerPickDestination,
  "validate-world-explorer-store-variable": validateWorldExplorerStoreVariable,
  "validate-world-explorer-agent-mode-test": validateWorldExplorerAgentModeTest,
  "validate-world-explorer-stamp-passport": validateWorldExplorerStampPassport,
  "validate-world-explorer-visualization": validateWorldExplorerVisualization,
  "validate-world-explorer-verify-journey": validateWorldExplorerVerifyJourney,
  "validate-world-explorer-surprise-destination": validateWorldExplorerSurpriseDestination,
};
