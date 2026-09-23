import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isFilled } from "@prismicio/client";
import { createClient } from "@/prismicio";

type CheckoutItemInput = {
	uid: unknown;
	size: unknown;
	studentName: unknown;
	grade: unknown;
	quantity: unknown;
};

const MAX_QUANTITY_PER_LINE = 20;
const MAX_TEXT_FIELD_LENGTH = 200;

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
			!grade.trim() ||
			grade.length > MAX_TEXT_FIELD_LENGTH
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

			const name = page.data.name
				? `${page.data.name}${item.size ? ` (${item.size})` : ""}`
				: item.uid;
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

	const referer = request.headers.get("referer");
	const returnPath = referer
		? new URL(referer).pathname
		: "/";

	const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

	try {
		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			line_items,
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
