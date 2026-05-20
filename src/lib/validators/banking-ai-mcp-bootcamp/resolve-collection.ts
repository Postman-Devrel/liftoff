import { getCollection } from "@/lib/postman-api";

type CollectionItem = {
  name?: string;
  request?: unknown;
  item?: CollectionItem[];
};

const EXPECTED_REQUESTS = [
  /generate\s+api\s+key/i,
  /fromAccount/i,
  /toAccount/i,
  /new\s+transaction|create.*transaction/i,
];

function collectRequestNames(items: CollectionItem[]): string[] {
  const names: string[] = [];
  for (const item of items) {
    if (item.request && item.name) names.push(item.name);
    if (item.item) names.push(...collectRequestNames(item.item));
  }
  return names;
}

export async function resolveBankingCollection(
  apiKey: string,
  collections: { name: string; uid: string }[]
): Promise<{ uid: string; name: string } | null> {
  const candidates = collections.filter(
    (c) => /intergalactic\s+bank\s+api/i.test(c.name)
  );

  for (const candidate of candidates) {
    const detail = await getCollection(apiKey, candidate.uid);
    const items: CollectionItem[] = detail.item || [];
    const requestNames = collectRequestNames(items);

    const hasAll = EXPECTED_REQUESTS.every(
      (pattern) => requestNames.some((name) => pattern.test(name))
    );

    if (hasAll) return candidate;
  }

  return null;
}
