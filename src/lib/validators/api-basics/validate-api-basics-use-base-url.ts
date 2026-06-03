import { ValidatorFn } from "@/types/validation";
import { getEnvironment } from "@/lib/postman-api";
import { resolveEnvVar } from "@/lib/validators/env-helpers";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";
import {
	findCoffeeHotGetRequest,
	getApiBasicsCollectionItems,
	getRequestUrl,
} from "./collection-helpers";

export const validateApiBasicsUseBaseUrl: ValidatorFn = async (
	apiKey,
	context
) => {
	const ws = await resolveWorkspace(
		apiKey,
		context,
		context.apiBasicsWorkspaceId,
		/^API\s+Basics\s*-\s*.+$/i,
		"API Basics - [your name]"
	);
	if ("error" in ws) return ws.error;

	const workspace = ws.detail as Record<string, unknown>;
	const collections =
		(workspace.collections as { name: string; uid: string }[]) || [];

	const collectionResult = await getApiBasicsCollectionItems(
		apiKey,
		collections,
		context.apiBasicsCollectionUid
	);
	if ("error" in collectionResult) return collectionResult.error;

	const coffeeRequest = findCoffeeHotGetRequest(collectionResult.items);
	if (!coffeeRequest?.request) {
		return {
			success: false,
			message:
				'No GET request to `/coffee/hot` found in "My First Collection". Complete Step 2 first.',
			pointsAwarded: 0,
		};
	}

	const url = getRequestUrl(coffeeRequest.request);
	if (!url.includes("{{baseURL}}")) {
		return {
			success: false,
			message:
				'Your coffee request URL does not use `{{baseURL}}`. Set the URL to `{{baseURL}}/coffee/hot` and save the request.',
			pointsAwarded: 0,
		};
	}

	const wsEnvironments: { id: string; name: string; uid: string }[] =
		(workspace.environments as { id: string; name: string; uid: string }[]) ||
		[];

	const localEnv = wsEnvironments.find(
		(env) => env.name.trim().toLowerCase() === "local"
	);

	if (!localEnv) {
		return {
			success: false,
			message:
				'Environment "Local" not found. Complete Step 3 first, then select **Local** in the environment dropdown.',
			pointsAwarded: 0,
		};
	}

	const envDetail = await getEnvironment(apiKey, localEnv.uid);
	const baseUrlValue = resolveEnvVar(
		envDetail.values || [],
		"baseURL",
		'Environment "Local" found but missing the "baseURL" variable. Add it with the value "https://api.sampleapis.com".'
	);
	if (typeof baseUrlValue !== "string") return baseUrlValue;

	if (baseUrlValue !== "https://api.sampleapis.com") {
		return {
			success: false,
			message: `Variable "baseURL" found but its value is "${baseUrlValue}". Set it to "https://api.sampleapis.com".`,
			pointsAwarded: 0,
		};
	}

	return {
		success: true,
		message:
			'Request URL uses `{{baseURL}}/coffee/hot` and environment "Local" is configured correctly!',
		pointsAwarded: 10,
		context: {
			...context,
			apiBasicsCollectionUid: collectionResult.uid,
			apiBasicsEnvironmentId: localEnv.uid,
			environmentId: localEnv.uid,
		},
	};
};
