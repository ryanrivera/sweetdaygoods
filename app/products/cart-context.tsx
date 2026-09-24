"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";

const STORAGE_KEY = "sweetdaygoods:cart";

export type CartItem = {
	key: string;
	uid: string;
	name: string;
	size: string | null;
	studentName: string;
	grade: string;
	unitPrice: number;
	quantity: number;
	sponsor: boolean;
	image: { url: string; alt: string } | null;
};

type AddItemInput = Omit<CartItem, "key">;

type CartContextValue = {
	items: CartItem[];
	itemCount: number;
	subtotal: number;
	isOpen: boolean;
	open: () => void;
	close: () => void;
	addItem: (item: AddItemInput) => void;
	removeItem: (key: string) => void;
	setQuantity: (key: string, quantity: number) => void;
	clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function itemKey(
	uid: string,
	size: string | null,
	studentName: string,
	grade: string,
	sponsor: boolean,
) {
	return `${uid}::${size ?? ""}::${studentName}::${grade}::${sponsor}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [hydrated, setHydrated] = useState(false);

	useEffect(() => {
		// SSR-safe localStorage hydration has to happen post-mount (the server
		// has no localStorage), so the first client render matches the server's
		// and this effect updates state once right after.
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			// eslint-disable-next-line react-hooks/set-state-in-effect
			if (raw) setItems(JSON.parse(raw));
		} catch {
			// ignore malformed/inaccessible storage
		}
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (!hydrated) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		} catch {
			// ignore storage write failures (e.g. private browsing)
		}
	}, [items, hydrated]);

	const addItem = useCallback((input: AddItemInput) => {
		const key = itemKey(input.uid, input.size, input.studentName, input.grade, input.sponsor);
		setItems((prev) => {
			const existing = prev.find((item) => item.key === key);
			if (existing) {
				return prev.map((item) =>
					item.key === key
						? { ...item, quantity: item.quantity + input.quantity }
						: item,
				);
			}
			return [...prev, { ...input, key }];
		});
		setIsOpen(true);
	}, []);

	const removeItem = useCallback((key: string) => {
		setItems((prev) => prev.filter((item) => item.key !== key));
	}, []);

	const setQuantity = useCallback((key: string, quantity: number) => {
		setItems((prev) =>
			prev.map((item) =>
				item.key === key
					? { ...item, quantity: Math.max(1, quantity) }
					: item,
			),
		);
	}, []);

	const clear = useCallback(() => setItems([]), []);
	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);

	const { itemCount, subtotal } = useMemo(
		() => ({
			itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
			subtotal: items.reduce(
				(sum, item) =>
					sum + item.unitPrice * item.quantity + (item.sponsor ? item.unitPrice : 0),
				0,
			),
		}),
		[items],
	);

	const value = useMemo<CartContextValue>(
		() => ({
			items,
			itemCount,
			subtotal,
			isOpen,
			open,
			close,
			addItem,
			removeItem,
			setQuantity,
			clear,
		}),
		[items, itemCount, subtotal, isOpen, open, close, addItem, removeItem, setQuantity, clear],
	);

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
	const ctx = useContext(CartContext);
	if (!ctx) throw new Error("useCart must be used within a CartProvider");
	return ctx;
}
