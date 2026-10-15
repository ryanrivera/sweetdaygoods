"use client";

import { useCallback, useEffect, useState } from "react";
import {
	CONTACT_EMAIL,
	EVENT_DATE_LABEL,
	EVENT_LABEL,
	PRICE_CENTS,
	formatSlot,
} from "./config";

type Confirmation = { slot: string; name: string };

export default function SantaBooking() {
	const [slots, setSlots] = useState<string[]>([]);
	const [taken, setTaken] = useState<Set<string>>(new Set());
	const [loadError, setLoadError] = useState(false);
	const [selected, setSelected] = useState<string | null>(null);
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [phone, setPhone] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
	const [returning, setReturning] = useState(false);

	const loadSlots = useCallback(async () => {
		try {
			const res = await fetch("/api/santa/slots", { cache: "no-store" });
			if (!res.ok) throw new Error();
			const data = await res.json();
			setSlots(data.slots);
			setTaken(new Set(data.taken));
			setLoadError(false);
			// Drop a selection that someone else grabbed in the meantime.
			setSelected((s) => (s && data.taken.includes(s) ? null : s));
		} catch {
			setLoadError(true);
		}
	}, []);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
		loadSlots();
		const id = setInterval(loadSlots, 20_000);
		return () => clearInterval(id);
	}, [loadSlots]);

	// Returning from Stripe with ?session_id=...
	useEffect(() => {
		const sessionId = new URLSearchParams(window.location.search).get("session_id");
		if (!sessionId) return;
		(async () => {
			setReturning(true);
			// The webhook/session can take a moment; retry briefly.
			for (let i = 0; i < 5; i++) {
				const res = await fetch(`/api/santa/booking?session_id=${encodeURIComponent(sessionId)}`);
				if (res.ok) {
					setConfirmation(await res.json());
					break;
				}
				await new Promise((r) => setTimeout(r, 1500));
			}
			setReturning(false);
		})();
	}, []);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!selected) {
			setError("Please choose a time.");
			return;
		}
		setSubmitting(true);
		setError(null);
		try {
			const res = await fetch("/api/santa/checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ slot: selected, firstName, lastName, phone }),
			});
			const data = await res.json();
			if (!res.ok || !data.url) {
				setError(data.error ?? "Something went wrong. Please try again.");
				if (res.status === 409) {
					setSelected(null);
					loadSlots();
				}
				setSubmitting(false);
				return;
			}
			window.location.href = data.url;
		} catch {
			setError("Something went wrong. Please try again.");
			setSubmitting(false);
		}
	}

	if (confirmation) {
		return (
			<main className="mx-auto max-w-xl px-4 py-12 text-center">
				<h1 className="text-3xl font-bold text-green-900">You&apos;re booked! 🎅</h1>
				<p className="mt-4 text-lg">
					{confirmation.name}, your portrait with Santa is reserved for{" "}
					<strong>{formatSlot(confirmation.slot)}</strong> on {EVENT_DATE_LABEL} at the{" "}
					{EVENT_LABEL}.
				</p>
				<p className="mt-4 text-sm text-neutral-600">
					Need to change or cancel? Email{" "}
					<a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
						{CONTACT_EMAIL}
					</a>
					.
				</p>
			</main>
		);
	}

	return (
		<main className="mx-auto max-w-2xl px-4 py-10">
			<h1 className="text-3xl font-bold text-green-900">Portraits with Santa</h1>
			<p className="mt-2 text-neutral-700">
				{EVENT_LABEL} · {EVENT_DATE_LABEL} · 9:00 AM – 1:00 PM
			</p>
			<p className="mt-1 text-neutral-700">
				10-minute sessions · ${(PRICE_CENTS / 100).toFixed(2)} · Proceeds benefit St.
				Columba Catholic School.
			</p>
			{returning && <p className="mt-4">Confirming your booking…</p>}

			<form onSubmit={handleSubmit} className="mt-8">
				<h2 className="text-lg font-semibold">1. Choose a time</h2>
				{loadError && (
					<p className="mt-2 text-red-700">Couldn&apos;t load times. Please refresh.</p>
				)}
				<div
					role="radiogroup"
					aria-label="Available times"
					className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4"
				>
					{slots.map((slot) => {
						const isTaken = taken.has(slot);
						const isSelected = selected === slot;
						return (
							<button
								key={slot}
								type="button"
								role="radio"
								aria-checked={isSelected}
								disabled={isTaken}
								onClick={() => setSelected(slot)}
								className={`cursor-pointer rounded-md border px-2 py-2 text-sm transition ${
									isSelected
										? "border-green-900 bg-green-900 text-white"
										: "border-neutral-300 bg-white text-neutral-900 hover:border-green-900"
								} disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:text-neutral-400 disabled:line-through disabled:hover:border-neutral-300`}
							>
								{formatSlot(slot)}
							</button>
						);
					})}
				</div>

				<h2 className="mt-8 text-lg font-semibold">2. Your details</h2>
				<div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
					<div>
						<label className="block text-sm font-medium" htmlFor="santa-first-name">
							First name
						</label>
						<input
							id="santa-first-name"
							required
							maxLength={30}
							autoComplete="given-name"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium" htmlFor="santa-last-name">
							Last name
						</label>
						<input
							id="santa-last-name"
							required
							maxLength={30}
							autoComplete="family-name"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
						/>
					</div>
				</div>
				<label className="mt-4 block text-sm font-medium" htmlFor="santa-phone">
					Phone number
				</label>
				<input
					id="santa-phone"
					required
					type="tel"
					maxLength={30}
					autoComplete="tel"
					value={phone}
					onChange={(e) => setPhone(e.target.value)}
					className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2"
				/>

				{error && (
					<p role="alert" className="mt-4 text-red-700">
						{error}
					</p>
				)}

				<button
					type="submit"
					disabled={submitting}
					className="mt-6 w-full cursor-pointer rounded-md bg-green-900 px-4 py-3 font-semibold text-white transition hover:bg-green-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
				>
					{submitting
						? "Holding your time…"
						: selected
							? `Continue to payment — ${formatSlot(selected)}`
							: "Continue to payment"}
				</button>
				<p className="mt-3 text-center text-xs text-neutral-600">
					Your time is held for 30 minutes while you check out.
				</p>
			</form>
		</main>
	);
}
