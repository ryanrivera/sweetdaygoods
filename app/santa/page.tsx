import { Alfa_Slab_One, Fredoka } from "next/font/google";
import type { Metadata, Viewport } from "next";
import SantaBooking from "./santa-booking";
import "./santa.css";

const alfa = Alfa_Slab_One({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-alfa",
});

const fredoka = Fredoka({
	subsets: ["latin"],
	variable: "--font-fredoka",
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
	title: "Photos with Santa — St. Columba Christmas Market",
	description:
		"Reserve a 5-minute time slot for a photo with Santa at the St. Columba Christmas Market and take home an instant 4x6 print. Proceeds benefit St. Columba Catholic School.",
};

export const viewport: Viewport = {
	themeColor: "#42d6b6",
};

export default function Page() {
	return (
		<div className={`${alfa.variable} ${fredoka.variable} flex-1`}>
			<SantaBooking />
		</div>
	);
}
