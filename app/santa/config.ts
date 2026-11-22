// TODO: confirm the price before launch.
export const EVENT_LABEL = "St. Columba Christmas Market";
export const EVENT_DATE_LABEL = "Sunday, December 6"; // shown on the page
export const EVENT_ADDRESS = "3365 Glencolum Drive";
export const PRICE_CENTS = 2000; // per portrait session
export const CONTACT_EMAIL = "sweetdaygoods@gmail.com"; // for reschedule/cancel requests

export const SLOT_LENGTH_MINUTES = 5;

// Santa takes photos in 45-minute blocks, then a 15-minute break.
// Times are 24-hour "HH:MM"; `breakEnd` is when Santa is back.
export const BLOCKS = [
	{ start: "11:00", end: "11:45", breakEnd: "12:00" },
	{ start: "12:00", end: "12:45", breakEnd: "13:00" },
	{ start: "13:00", end: "13:45", breakEnd: "14:00" },
] as const;

const toMinutes = (hhmm: string) => {
	const [h, m] = hhmm.split(":").map(Number);
	return h * 60 + m;
};
const toId = (minutes: number) =>
	`${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

// Slot ids are each slot's start time, e.g. "11:00", "11:05" ... "13:40".
export const SLOT_GROUPS = BLOCKS.map((block) => {
	const slots: string[] = [];
	for (let m = toMinutes(block.start); m < toMinutes(block.end); m += SLOT_LENGTH_MINUTES) {
		slots.push(toId(m));
	}
	return { ...block, slots };
});

export const SLOT_IDS: string[] = SLOT_GROUPS.flatMap((group) => group.slots);

export function isValidSlot(id: unknown): id is string {
	return typeof id === "string" && SLOT_IDS.includes(id);
}

/** "13:05" -> "1:05 PM" */
export function formatSlot(id: string): string {
	const [h, m] = id.split(":").map(Number);
	const suffix = h >= 12 ? "PM" : "AM";
	const hour = h % 12 === 0 ? 12 : h % 12;
	return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "11:45" -> "11:45 AM", but 12:00 -> "noon" for friendlier ranges. */
function formatRangeEdge(id: string) {
	return id === "12:00" ? "noon" : formatSlot(id);
}

/** "11:00–11:45 AM" style label for a block. */
export function formatBlock(block: { start: string; end: string }) {
	const start = formatSlot(block.start);
	const end = formatSlot(block.end);
	const [startTime, startSuffix] = start.split(" ");
	const [, endSuffix] = end.split(" ");
	return startSuffix === endSuffix
		? `${startTime}–${end}`
		: `${start}–${end}`;
}

export function formatBreak(block: { end: string; breakEnd: string }) {
	return `${formatSlot(block.end)} – ${formatRangeEdge(block.breakEnd)}`;
}
