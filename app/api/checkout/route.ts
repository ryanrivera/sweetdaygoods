import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isFilled } from "@prismicio/client";
import { createClient } from "@/prismicio";
import { GRADE_OPTIONS } from "@/app/products/grades";

type CheckoutItemInput = {
	uid: unknown;
	size: unknown;
	studentName: unknown;
	grade: unknown;
	quantity: unknown;
};

const MAX_QUANTITY_PER_LINE = 20;
// Student name gets folded into the Stripe line item's product name
// (capped at 250 chars by Stripe), so it's kept well under that.
const MAX_TEXT_FIELD_LENGTH = 60;
// Final safety net in case a long product name pushes the combined string
// past Stripe's 250-char product name limit.
const MAX_PRODUCT_NAME_LENGTH = 250;
// Session-level metadata gets two keys per line item; Stripe caps a session
// at 50 metadata keys, so this keeps every order comfortably under that.
const MAX_ITEMS_PER_ORDER = 20;

export async function POST(request: NextRequest) {
	if (!process.env.STRIPE_SECRET_KEY) {
		return NextResponse.json(
			{ error: "Checkout is not configured yet." },
			{ status: 500 },
		);
	}

	const body = await request.json().catch(() => null);
	const rawItems = body?.items;

	if (!Array.isArray(rawItems) || rawItems.length === 0) {
		return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
	}
	if (rawItems.length > MAX_ITEMS_PER_ORDER) {
		return NextResponse.json({ error: "Too many items in cart." }, { status: 400 });
	}

	const items: {
		uid: string;
		size: string | null;
		studentName: string;
		grade: string;
		quantity: number;
	}[] = [];
	for (const raw of rawItems as CheckoutItemInput[]) {
		const uid = raw?.uid;
		const size = raw?.size;
		const studentName = raw?.studentName;
		const grade = raw?.grade;
		const quantity = raw?.quantity;

		if (typeof uid !== "string" || !uid) {
			return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
		}
		if (size !== null && typeof size !== "string") {
			return NextResponse.json({ error: "Invalid cart item." }, { status: 400 });
		}
		if (
			typeof studentName !== "string" ||
			!studentName.trim() ||
			studentName.length > MAX_TEXT_FIELD_LENGTH
		) {
			return NextResponse.json({ error: "Invalid student name." }, { status: 400 });
		}
		if (
			typeof grade !== "string" ||
			!(GRADE_OPTIONS as readonly string[]).includes(grade)
		) {
			return NextResponse.json({ error: "Invalid grade." }, { status: 400 });
		}
		if (
			typeof quantity !== "number" ||
			!Number.isInteger(quantity) ||
			quantity < 1 ||
			quantity > MAX_QUANTITY_PER_LINE
		) {
			return NextResponse.json({ error: "Invalid item quantity." }, { status: 400 });
		}

		items.push({
			uid,
			size,
			studentName: studentName.trim(),
			grade: grade.trim(),
			quantity,
		});
	}

	const client = createClient();
	const uniqueUids = [...new Set(items.map((item) => item.uid))];
	const pages = await Promise.all(
		uniqueUids.map((uid) => client.getByUID("product_page", uid)),
	).catch(() => null);

	if (!pages) {
		return NextResponse.json(
			{ error: "One or more items could not be found." },
			{ status: 400 },
		);
	}

	const pagesByUid = new Map(pages.map((page) => [page.uid, page]));

	const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
		(item) => {
			const page = pagesByUid.get(item.uid);
			if (!page) throw new Error(`Unknown product: ${item.uid}`);

			const baseName = page.data.name
				? `${page.data.name}${item.size ? ` (${item.size})` : ""}`
				: item.uid;
			const name = `${baseName} — ${item.studentName}, ${item.grade}`.slice(
				0,
				MAX_PRODUCT_NAME_LENGTH,
			);
			const image = page.data.images.find((img) => isFilled.image(img.image))
				?.image;

			return {
				quantity: item.quantity,
				price_data: {
					currency: "usd",
					unit_amount: Math.round((page.data.price ?? 0) * 100),
					product_data: {
						name,
						images: image && isFilled.image(image) ? [image.url] : undefined,
						metadata: {
							studentName: item.studentName,
							grade: item.grade,
						},
					},
				},
			};
		},
	);

	// Also surface student/grade as session-level metadata so it's visible
	// directly on the Payment page in the Stripe Dashboard, instead of only
	// on the ad-hoc Product object created for each line item.
	const metadata: Record<string, string> =
		items.length === 1
			? { studentName: items[0].studentName, grade: items[0].grade }
			: items.reduce<Record<string, string>>((acc, item, i) => {
					acc[`studentName_${i + 1}`] = item.studentName;
					acc[`grade_${i + 1}`] = item.grade;
					return acc;
				}, {});

	const referer = request.headers.get("referer");
	const returnPath = referer
		? new URL(referer).pathname
		: "/";

	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

	try {
		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			line_items,
			metadata,
			payment_intent_data: { metadata },
			success_url: `${request.nextUrl.origin}${returnPath}?checkout=success`,
			cancel_url: `${request.nextUrl.origin}${returnPath}?checkout=cancelled`,
		});

		return NextResponse.json({ url: session.url });
	} catch (err) {
		console.error("Stripe checkout session creation failed", err);
		return NextResponse.json(
			{ error: "Could not start checkout. Please try again." },
			{ status: 500 },
		);
	}
}
