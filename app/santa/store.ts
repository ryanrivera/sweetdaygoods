import { Redis } from "@upstash/redis";
import { SLOT_IDS } from "./config";

// A slot is either held (someone is in Stripe Checkout; expires on its own)
// or booked (payment confirmed; permanent). Both live under the same key so
// a single atomic SET NX is enough to claim a slot.
export type SlotRecord = {
	status: "held" | "booked";
	name: string;
	phone: string;
	sessionId?: string;
};

// Stripe Checkout Sessions last at least 30 minutes; the hold outlives that
// slightly so a payment that completes at the last moment still finds its hold.
export const HOLD_SECONDS = 35 * 60;

let redis: Redis | null = null;
function db() {
	if (!redis) {
		redis = new Redis({
			url: process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL!,
			token: process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN!,
		});
	}
	return redis;
}

const key = (slot: string) => `santa:slot:${slot}`;

export async function takenSlots(): Promise<string[]> {
	const records = await db().mget<(SlotRecord | null)[]>(...SLOT_IDS.map(key));
	return SLOT_IDS.filter((_, i) => records[i]);
}

export async function getSlot(slot: string) {
	return db().get<SlotRecord>(key(slot));
}

/** Atomically claims a slot. Returns false if someone else already has it. */
export async function holdSlot(slot: string, record: SlotRecord) {
	const res = await db().set(key(slot), record, { nx: true, ex: HOLD_SECONDS });
	return res === "OK";
}

export async function attachSession(slot: string, record: SlotRecord) {
	await db().set(key(slot), record, { xx: true, keepTtl: true });
}

export async function releaseSlot(slot: string) {
	await db().del(key(slot));
}

export async function confirmSlot(slot: string, record: SlotRecord) {
	await db().set(key(slot), { ...record, status: "booked" } satisfies SlotRecord);
}
