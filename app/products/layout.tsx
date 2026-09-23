import { Suspense } from "react";
import { Arvo, Roboto } from "next/font/google";
import { CartProvider } from "./cart-context";
import CartDrawer from "./cart-drawer";
import "./[uid]/product-page.css";

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

export default function ProductPageLayout({
	children,
}: LayoutProps<"/products">) {
	return (
		<div className={`${arvo.variable} ${roboto.variable}`}>
			<CartProvider>
				{children}
				<Suspense fallback={null}>
					<CartDrawer />
				</Suspense>
			</CartProvider>
		</div>
	);
}
