import { getCollection } from "@/lib/postman-api";

export type CollectionItem = {
	name?: string;
	request?: {
		method?: string;
		url?: { raw?: string } | string;
	};
	event?: { listen: string; script?: { exec?: string[] } }[];
	item?: CollectionItem[];
};

export function getRequestUrl(
	request: CollectionItem["request"]
): string {
	if (!request?.url) return "";
	if (typeof request.url === "string") return request.url;
	return request.url.raw || "";
}

export function findCoffeeHotGetRequest(
	items: CollectionItem[]
): CollectionItem | null {
	for (const item of items) {
		if (item.request) {
			const method = (item.request.method || "GET").toUpperCase();
			const url = getRequestUrl(item.request);
			if (method === "GET" && /\/coffee\/hot/i.test(url)) {
				return item;
			}
		}
		if (item.item) {
			const found = findCoffeeHotGetRequest(item.item);
			if (found) return found;
		}
	}
	return null;
}

export async function getApiBasicsCollectionItems(
	apiKey: string,
	collections: { name: string; uid: string }[],
	collectionUid?: string
): Promise<
	| { uid: string; items: CollectionItem[] }
	| { error: { success: false; message: string; pointsAwarded: 0 } }
> {
	let uid = collectionUid;
	if (!uid) {
		const myCollection = collections.find(
			(c) => c.name.toLowerCase() === "my first collection"
		);
		if (!myCollection) {
			return {
				error: {
					success: false,
					message:
						'Collection "My First Collection" not found. Complete Step 2 first.',
					pointsAwarded: 0,
				},
			};
		}
		uid = myCollection.uid;
	}

	const collectionDetail = await getCollection(apiKey, uid);
	return {
		uid,
		items: (collectionDetail.item || []) as CollectionItem[],
	};
}
