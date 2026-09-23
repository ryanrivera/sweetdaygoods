import type { Metadata } from "next";
import { asText, isFilled } from "@prismicio/client";
import { createClient } from "@/prismicio";
import ProductPageOrder from "./product-page-order";

export async function generateMetadata({
	params,
}: PageProps<"/products/[uid]">): Promise<Metadata> {
	const { uid } = await params;
	const client = createClient();
	const page = await client.getByUID("product_page", uid);

	const title = page.data.meta_title || page.data.name || undefined;
	const description =
		page.data.meta_description || asText(page.data.description) || undefined;

	return {
		title,
		description,
		openGraph: {
			title: title ?? undefined,
			description: description ?? undefined,
			images: isFilled.image(page.data.meta_image)
				? [{ url: page.data.meta_image.url }]
				: undefined,
		},
	};
}

export default async function Page({
	params,
}: PageProps<"/products/[uid]">) {
	const { uid } = await params;
	const client = createClient();
	const page = await client.getByUID("product_page", uid);

	return <ProductPageOrder page={page} />;
}
