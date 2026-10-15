import { Arvo, Roboto } from "next/font/google";
import type { Metadata, Viewport } from "next";
import SantaBooking from "./santa-booking";
import "./santa.css";

const arvo = Arvo({
	subsets: ["latin"],
	weight: ["400", "700"],
	variable: "--font-arvo",
});

const roboto = Roboto({
	subsets: ["latin"],
	weight: ["300", "400", "500"],
	variable: "--font-roboto",
});

export const metadata: Metadata = {
	title: "Portraits with Santa — St. Columba Winter Market",
	description:
		"Reserve a 10-minute time slot for a portrait with Santa at the St. Columba Winter Market. Proceeds benefit St. Columba Catholic School.",
};

export const viewport: Viewport = {
	themeColor: "#0f3d27",
};

export default function Page() {
	return (
		<div className={`${arvo.variable} ${roboto.variable} flex-1`}>
			<SantaBooking />
		</div>
	);
}
