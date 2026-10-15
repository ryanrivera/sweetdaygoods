import type { Metadata } from "next";
import SantaBooking from "./santa-booking";

export const metadata: Metadata = {
	title: "Portraits with Santa — St. Columba Winter Market",
	description:
		"Reserve a 10-minute time slot for a portrait with Santa at the St. Columba Winter Market. Proceeds benefit St. Columba Catholic School.",
};

export default function Page() {
	// Always light: the site's global dark-mode colors make the green headings hard to read.
	return (
		<div className="flex-1 bg-white text-neutral-900">
			<SantaBooking />
		</div>
	);
}
