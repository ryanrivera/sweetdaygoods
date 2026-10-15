// TODO: confirm these before launch.
export const EVENT_LABEL = "St. Columba Winter Market";
export const EVENT_DATE_LABEL = "Sunday, December 6"; // shown on the page
export const PRICE_CENTS = 2000; // per portrait session
export const CONTACT_EMAIL = "sweetdaygoods@gmail.com"; // for reschedule/cancel requests

const START_MINUTES = 9 * 60;
const END_MINUTES = 13 * 60;
const SLOT_LENGTH = 10;

// Slot ids are "HH:MM" in 24-hour time, e.g. "09:00" ... "12:50".
export const SLOT_IDS: string[] = [];
for (let m = START_MINUTES; m < END_MINUTES; m += SLOT_LENGTH) {
	SLOT_IDS.push(
		`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`,
	);
}

export function isValidSlot(id: unknown): id is string {
	return typeof id === "string" && SLOT_IDS.includes(id);
}

export function formatSlot(id: string): string {
	const [h, m] = id.split(":").map(Number);
	const suffix = h >= 12 ? "PM" : "AM";
	const hour = h % 12 === 0 ? 12 : h % 12;
	return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}
