import { ValidatorFn } from "@/types/validation";
import { resolveWorkspace } from "@/lib/validators/resolve-workspace";
import {
	CollectionItem,
	findCoffeeHotGetRequest,
	getApiBasicsCollectionItems,
	getRequestUrl,
} from "./collection-helpers";

const COFFEE_API_URL = "https://api.sampleapis.com/coffee/hot";

function hasStatusTest(item: CollectionItem): boolean {
	if (!item.event) return false;
	const testEvent = item.event.find((e) => e.listen === "test");
	if (!testEvent?.script?.exec || testEvent.script.exec.length === 0) {
		return false;
	}
	const scriptContent = testEvent.script.exec.join("\n");
	return (
		/pm\.test/i.test(scriptContent) &&
		(/200/.test(scriptContent) || /to\.have\.status/i.test(scriptContent))
	);
}

export const validateApiBasicsSendAndTest: ValidatorFn = async (
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
				'No GET request to `/coffee/hot` found in "My First Collection". Complete the earlier steps first.',
			pointsAwarded: 0,
		};
	}

	const url = getRequestUrl(coffeeRequest.request);
	if (!url.includes("{{baseURL}}")) {
		return {
			success: false,
			message:
				'Your request URL still uses a hardcoded host. Complete Step 4: set the URL to `{{baseURL}}/coffee/hot`.',
			pointsAwarded: 0,
		};
	}

	if (!hasStatusTest(coffeeRequest)) {
		return {
			success: false,
			message:
				'No post-response test found on your coffee request. Open **Scripts** → **Post-response**, add a `pm.test` that checks status code 200, and save the request.',
			pointsAwarded: 0,
		};
	}

	try {
		const res = await fetch(COFFEE_API_URL);
		if (!res.ok) {
			return {
				success: false,
				message: `The coffee API returned ${res.status}. Try sending your request again — the public endpoint should return 200 OK.`,
				pointsAwarded: 0,
			};
		}

		const data = await res.json();
		if (!Array.isArray(data) || data.length === 0) {
			return {
				success: false,
				message:
					"The coffee API responded but did not return a non-empty array. Check your URL and try again.",
				pointsAwarded: 0,
			};
		}
	} catch {
		return {
			success: false,
			message:
				"Could not reach the coffee API. Check your network and try sending the request in Postman.",
			pointsAwarded: 0,
		};
	}

	return {
		success: true,
		message:
			"Test script saved and the coffee API is reachable — great work on your first automated check!",
		pointsAwarded: 10,
		context: {
			...context,
			apiBasicsCollectionUid: collectionResult.uid,
		},
	};
};
