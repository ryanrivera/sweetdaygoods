"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCart } from "./cart-context";

export default function CartDrawer() {
	const cart = useCart();
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [checkoutError, setCheckoutError] = useState<string | null>(null);
	const [justCompleted, setJustCompleted] = useState(false);

	const searchParams = useSearchParams();
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => {
		if (searchParams.get("checkout") !== "success") return;
		// A completed Stripe Checkout redirected back here — clear the cart
		// that was just paid for and drop the marker from the URL.
		cart.clear();
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setJustCompleted(true);
		router.replace(pathname);
		const timeout = setTimeout(() => setJustCompleted(false), 5000);
		return () => clearTimeout(timeout);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	async function handleCheckout() {
		setCheckoutError(null);
		setIsCheckingOut(true);
		try {
			const res = await fetch("/api/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					items: cart.items.map((item) => ({
						uid: item.uid,
						size: item.size,
						studentName: item.studentName,
						grade: item.grade,
						quantity: item.quantity,
					})),
				}),
			});
			const data = await res.json();
			if (!res.ok || !data.url) {
				throw new Error(data.error || "Checkout failed. Please try again.");
			}
			window.location.href = data.url;
		} catch (err) {
			setCheckoutError(err instanceof Error ? err.message : "Checkout failed.");
			setIsCheckingOut(false);
		}
	}

	return (
		<div className="product-page-shell">
			{justCompleted && (
				<div
					className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-5 py-3 rounded-lg text-sm text-center shadow-lg"
					style={{
						backgroundColor: "var(--color-forest)",
						color: "white",
						fontFamily: "var(--font-body)",
					}}
					role="status"
				>
					Thanks for your order! A confirmation has been sent to your email.
				</div>
			)}

			{/* Backdrop */}
			<div
				onClick={cart.close}
				className={`fixed inset-0 z-40 transition-opacity duration-200 ${
					cart.isOpen ? "opacity-100" : "pointer-events-none opacity-0"
				}`}
				style={{ backgroundColor: "rgba(15,61,39,0.35)" }}
				aria-hidden="true"
			/>

			{/* Drawer */}
			<aside
				className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm flex flex-col transition-transform duration-200 ${
					cart.isOpen ? "translate-x-0" : "translate-x-full"
				}`}
				style={{ backgroundColor: "var(--color-cream)" }}
				aria-hidden={!cart.isOpen}
			>
				<div
					className="flex items-center justify-between px-6 py-4"
					style={{ borderBottom: "1px solid var(--color-border)" }}
				>
					<h2
						style={{ fontFamily: "var(--font-heading)", color: "var(--color-forest)" }}
						className="text-lg font-bold"
					>
						Your Cart
					</h2>
					<button
						onClick={cart.close}
						aria-label="Close cart"
						style={{ color: "var(--color-forest)", fontFamily: "var(--font-body)" }}
						className="text-2xl leading-none"
					>
						×
					</button>
				</div>

				<div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
					{cart.items.length === 0 && (
						<p
							style={{ color: "var(--color-muted-text)", fontFamily: "var(--font-body)" }}
							className="text-sm"
						>
							Your cart is empty.
						</p>
					)}

					{cart.items.map((item) => (
						<div key={item.key} className="flex gap-3">
							<div
								className="relative overflow-hidden rounded-lg flex-shrink-0"
								style={{ width: 64, height: 64, backgroundColor: "#d4e8da" }}
							>
								{item.image && (
									<Image
										src={item.image.url}
										alt={item.image.alt}
										fill
										sizes="64px"
										style={{ objectFit: "cover" }}
									/>
								)}
							</div>

							<div className="flex-1 min-w-0">
								<p
									style={{ fontFamily: "var(--font-body)", color: "var(--color-forest)" }}
									className="text-sm font-medium truncate"
								>
									{item.name}
								</p>
								{item.size && (
									<p
										style={{ fontFamily: "var(--font-body)", color: "var(--color-muted-text)" }}
										className="text-xs"
									>
										Size: {item.size}
									</p>
								)}
								<p
									style={{ fontFamily: "var(--font-body)", color: "var(--color-muted-text)" }}
									className="text-xs"
								>
									{item.studentName} — {item.grade}
								</p>

								<div className="flex items-center justify-between mt-2">
									<div
										className="flex items-center"
										style={{ border: "1px solid var(--color-border)", borderRadius: 6 }}
									>
										<button
											onClick={() => cart.setQuantity(item.key, item.quantity - 1)}
											className="w-7 h-7 flex items-center justify-center text-sm"
											style={{ color: "var(--color-forest)" }}
											aria-label="Decrease quantity"
										>
											−
										</button>
										<span
											className="w-6 text-center text-xs"
											style={{ fontFamily: "var(--font-body)", color: "var(--color-forest)" }}
										>
											{item.quantity}
										</span>
										<button
											onClick={() => cart.setQuantity(item.key, item.quantity + 1)}
											className="w-7 h-7 flex items-center justify-center text-sm"
											style={{ color: "var(--color-forest)" }}
											aria-label="Increase quantity"
										>
											+
										</button>
									</div>

									<span
										style={{ fontFamily: "var(--font-body)", color: "var(--color-forest)" }}
										className="text-sm font-medium"
									>
										${(item.unitPrice * item.quantity).toFixed(2)}
									</span>
								</div>
							</div>

							<button
								onClick={() => cart.removeItem(item.key)}
								aria-label={`Remove ${item.name} from cart`}
								style={{ color: "var(--color-muted-text)" }}
								className="text-lg leading-none self-start"
							>
								×
							</button>
						</div>
					))}
				</div>

				{cart.items.length > 0 && (
					<div
						className="px-6 py-4 flex flex-col gap-3"
						style={{ borderTop: "1px solid var(--color-border)" }}
					>
						<div className="flex items-center justify-between">
							<span
								style={{ fontFamily: "var(--font-body)", color: "var(--color-muted-text)" }}
								className="text-sm"
							>
								Subtotal
							</span>
							<span
								style={{ fontFamily: "var(--font-heading)", color: "var(--color-forest)" }}
								className="font-bold text-lg"
							>
								${cart.subtotal.toFixed(2)}
							</span>
						</div>

						{checkoutError && (
							<p style={{ color: "#b91c1c", fontFamily: "var(--font-body)" }} className="text-sm">
								{checkoutError}
							</p>
						)}

						<button
							onClick={handleCheckout}
							disabled={isCheckingOut}
							className="w-full py-3.5 rounded-lg text-sm font-medium tracking-widest transition-all duration-150 active:scale-[0.98] disabled:opacity-60"
							style={{
								backgroundColor: "var(--color-forest)",
								color: "white",
								fontFamily: "var(--font-body)",
							}}
						>
							{isCheckingOut ? "REDIRECTING…" : "CHECKOUT"}
						</button>
					</div>
				)}
			</aside>
		</div>
	);
}
