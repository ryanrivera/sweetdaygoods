import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isValidSlot } from "@/app/santa/config";
import { confirmSlot, getSlot, releaseSlot } from "@/app/santa/store";

export async function POST(request: NextRequest) {
	const secret = process.env.SANTA_STRIPE_WEBHOOK_SECRET;
	if (!process.env.STRIPE_SECRET_KEY || !secret) {
		return NextResponse.json({ error: "Not configured." }, { status: 500 });
	}

	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
	const signature = request.headers.get("stripe-signature") ?? "";
	let event: Stripe.Event;
	try {
		event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
	} catch {
		return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
	}

	if (
		event.type !== "checkout.session.completed" &&
		event.type !== "checkout.session.async_payment_succeeded" &&
		event.type !== "checkout.session.expired" &&
		event.type !== "checkout.session.async_payment_failed"
	) {
		return NextResponse.json({ received: true });
	}

	const session = event.data.object as Stripe.Checkout.Session;
	const { type, slot, name, phone } = session.metadata ?? {};
	// This endpoint shares the Stripe account with the shirt shop's checkout.
	if (type !== "santa" || !isValidSlot(slot)) {
		return NextResponse.json({ received: true });
	}

	const current = await getSlot(slot);

	if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
		// Only free the slot if this session is the one holding it.
		if (current?.status === "held" && current.sessionId === session.id) {
			await releaseSlot(slot);
		}
		return NextResponse.json({ received: true });
	}

	if (session.payment_status !== "paid") {
		return NextResponse.json({ received: true });
	}

	const ownedByOther = current && current.sessionId !== session.id;
	if (ownedByOther) {
		// Paid after the hold lapsed and someone else got the slot: refund.
		console.error(`Santa slot ${slot} double-booked; refunding session ${session.id}`);
		if (typeof session.payment_intent === "string") {
			await stripe.refunds.create({ payment_intent: session.payment_intent });
		}
		return NextResponse.json({ received: true });
	}

	await confirmSlot(slot, {
		status: "booked",
		name: name ?? "",
		phone: phone ?? "",
		sessionId: session.id,
	});
	return NextResponse.json({ received: true });
}
