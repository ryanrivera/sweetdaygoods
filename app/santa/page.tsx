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

// Santa-themed icons (emoji art: Twemoji by Twitter/jdecked, CC-BY 4.0,
// https://github.com/jdecked/twemoji). Set explicitly so they replace the
// site-wide PAWS favicon on this page only.
export const metadata: Metadata = {
	icons: {
		icon: [
			{ url: "/santa/favicon.ico", sizes: "any" },
			{ url: "/santa/icon.svg", type: "image/svg+xml" },
			{ url: "/santa/icon.png", type: "image/png", sizes: "96x96" },
		],
		apple: [{ url: "/santa/apple-icon.png", sizes: "180x180" }],
	},
	title: "Portraits with Santa — St. Columba Winter Market",
	description:
		"Reserve a 10-minute time slot for a portrait with Santa at the St. Columba Winter Market and take home an instant 4x6 print. Proceeds benefit St. Columba Catholic School.",
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
