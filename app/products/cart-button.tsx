"use client";

import { useCart } from "./cart-context";

export default function CartButton() {
	const cart = useCart();

	return (
		<button
			onClick={cart.open}
			aria-label={`Open cart, ${cart.itemCount} item${cart.itemCount === 1 ? "" : "s"}`}
			className="relative flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-black/5"
			style={{ color: "var(--color-forest)" }}
		>
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path
					d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 3H17M9 20a1 1 0 100-2 1 1 0 000 2zM17 20a1 1 0 100-2 1 1 0 000 2z"
					stroke="currentColor"
					strokeWidth="1.8"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
			{cart.itemCount > 0 && (
				<span
					className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-medium"
					style={{
						backgroundColor: "var(--color-yellow)",
						color: "var(--color-forest)",
						fontFamily: "var(--font-body)",
					}}
				>
					{cart.itemCount}
				</span>
			)}
		</button>
	);
}
