import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Lets the success page show what was booked from the Checkout Session id.
export async function GET(request: NextRequest) {
	const id = request.nextUrl.searchParams.get("session_id");
	if (!id || !process.env.STRIPE_SECRET_KEY) {
		return NextResponse.json({ error: "Not found." }, { status: 404 });
	}
	try {
		const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
		const session = await stripe.checkout.sessions.retrieve(id);
		if (session.metadata?.type !== "santa" || session.payment_status !== "paid") {
			return NextResponse.json({ error: "Not found." }, { status: 404 });
		}
		return NextResponse.json({
			slot: session.metadata.slot,
			name: session.metadata.name,
		});
	} catch {
		return NextResponse.json({ error: "Not found." }, { status: 404 });
	}
}
