import { NextResponse } from "next/server";
import { SLOT_IDS } from "@/app/santa/config";
import { takenSlots } from "@/app/santa/store";

export async function GET() {
	try {
		return NextResponse.json(
			{ slots: SLOT_IDS, taken: await takenSlots() },
			{ headers: { "Cache-Control": "no-store" } },
		);
	} catch (err) {
		console.error("Could not load Santa slots", err);
		return NextResponse.json({ error: "Could not load times." }, { status: 500 });
	}
}
