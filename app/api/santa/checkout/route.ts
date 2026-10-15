import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import {
	EVENT_LABEL,
	PRICE_CENTS,
	formatSlot,
	isValidSlot,
} from "@/app/santa/config";
import { attachSession, holdSlot, releaseSlot } from "@/app/santa/store";

const MAX_NAME_PART_LENGTH = 30;
const MAX_PHONE_LENGTH = 30;

export async function POST(request: NextRequest) {
	if (!process.env.STRIPE_SECRET_KEY) {
		return NextResponse.json({ error: "Checkout is not configured yet." }, { status: 500 });
	}

	const body = await request.json().catch(() => null);
	const slot: unknown = body?.slot;
	const firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
	const lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";
	const phone = typeof body?.phone === "string" ? body.phone.trim() : "";

	if (!isValidSlot(slot)) {
		return NextResponse.json({ error: "Please choose a time." }, { status: 400 });
	}
	if (
		!firstName ||
		!lastName ||
		firstName.length > MAX_NAME_PART_LENGTH ||
		lastName.length > MAX_NAME_PART_LENGTH
	) {
		return NextResponse.json(
			{ error: "Please enter your first and last name." },
			{ status: 400 },
		);
	}
	const name = `${firstName} ${lastName}`;
	if (phone.length > MAX_PHONE_LENGTH || phone.replace(/\D/g, "").length < 10) {
		return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });
	}

	const claimed = await holdSlot(slot, { status: "held", name, phone });
	if (!claimed) {
		return NextResponse.json(
			{ error: "Sorry, that time was just taken. Please pick another." },
			{ status: 409 },
		);
	}

	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
	const metadata = { type: "santa", slot, name, phone };

	try {
		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			line_items: [
				{
					quantity: 1,
					price_data: {
						currency: "usd",
						unit_amount: PRICE_CENTS,
						product_data: {
							name: `Portrait with Santa — ${formatSlot(slot)}`,
							description: `${EVENT_LABEL}. Reserved for ${name}.`,
						},
					},
				},
			],
			metadata,
			payment_intent_data: { metadata },
			// Stripe's minimum; the slot is released if checkout expires unpaid.
			expires_at: Math.floor(Date.now() / 1000) + 30 * 60 + 30,
			success_url: `${request.nextUrl.origin}/santa?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${request.nextUrl.origin}/santa`,
		});

		await attachSession(slot, { status: "held", name, phone, sessionId: session.id });
		return NextResponse.json({ url: session.url });
	} catch (err) {
		console.error("Santa checkout session creation failed", err);
		await releaseSlot(slot);
		return NextResponse.json(
			{ error: "Could not start checkout. Please try again." },
			{ status: 500 },
		);
	}
}
