"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
	CONTACT_EMAIL,
	EVENT_DATE_LABEL,
	EVENT_LABEL,
	PRICE_CENTS,
	SLOT_IDS,
	formatSlot,
} from "./config";

type Confirmation = { slot: string; name: string };

const PRICE_LABEL = `$${(PRICE_CENTS / 100).toFixed(2)}`;

function hourLabel(hour: number) {
	return `${hour % 12 === 0 ? 12 : hour % 12} ${hour >= 12 ? "PM" : "AM"}`;
}

function CrossMark({ size = 36 }: { size?: number }) {
	return (
		<div
			style={{ width: size, height: size, backgroundColor: "var(--color-yellow)" }}
			className="flex flex-shrink-0 items-center justify-center rounded-md"
			aria-hidden="true"
		>
			<svg width={size / 2} height={size * 0.6} viewBox="0 0 18 22" fill="none">
				<rect x="6" y="0" width="6" height="22" rx="2" fill="#0f3d27" />
				<rect x="0" y="6" width="18" height="6" rx="2" fill="#0f3d27" />
			</svg>
		</div>
	);
}

function Header() {
	return (
		<header
			style={{ backgroundColor: "var(--color-forest)", borderBottom: "3px solid var(--color-yellow)" }}
			className="px-4 py-3"
		>
			<div className="mx-auto flex max-w-xl items-center gap-3">
				<CrossMark />
				<div>
					<div
						style={{ fontFamily: "var(--font-heading)", lineHeight: 1.1 }}
						className="text-[15px] font-bold text-white"
					>
						St. Columba Catholic School
					</div>
					<div
						style={{ color: "var(--color-yellow)", fontSize: 11, letterSpacing: "0.08em" }}
						className="uppercase"
					>
						Winter Market
					</div>
				</div>
			</div>
		</header>
	);
}

export default function SantaBooking() {
	const [taken, setTaken] = useState<Set<string> | null>(null);
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
			// The Checkout Session can take a moment to read as paid; retry briefly.
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

	const groups = useMemo(() => {
		const byHour = new Map<number, string[]>();
		for (const id of SLOT_IDS) {
			const hour = Number(id.split(":")[0]);
			byHour.set(hour, [...(byHour.get(hour) ?? []), id]);
		}
		return [...byHour.entries()];
	}, []);

	const left = taken ? SLOT_IDS.length - taken.size : null;

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!selected) {
			setError("Please choose a time first.");
			window.scrollTo({ top: 0, behavior: "smooth" });
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

	if (confirmation || returning) {
		return (
			<div className="santa-page">
				<Header />
				<main className="mx-auto max-w-xl px-4 py-8">
					{confirmation ? (
						<div className="santa-pop">
							<div className="mb-6 text-center">
								<div className="text-5xl" aria-hidden="true">
									🎅
								</div>
								<h1 className="mt-3 text-3xl font-bold">You&apos;re booked!</h1>
								<p style={{ color: "var(--color-muted-text)" }} className="mt-1">
									See you at the Winter Market, {confirmation.name.split(" ")[0]}.
								</p>
							</div>
							<div className="santa-ticket">
								<div className="px-6 pt-6 pb-8 text-center">
									<div
										style={{ color: "var(--color-muted-text)", letterSpacing: "0.12em" }}
										className="text-xs uppercase"
									>
										Your Santa time
									</div>
									<div
										style={{ fontFamily: "var(--font-heading)" }}
										className="mt-1 text-5xl font-bold"
									>
										{formatSlot(confirmation.slot)}
									</div>
									<div className="mt-2 text-[15px]">{EVENT_DATE_LABEL}</div>
								</div>
								<div
									style={{ borderTop: "2px dashed var(--color-border)" }}
									className="space-y-1 px-6 py-5 text-center text-sm"
								>
									<div className="font-medium">{confirmation.name}</div>
									<div style={{ color: "var(--color-muted-text)" }}>{EVENT_LABEL}</div>
								</div>
							</div>
							<p style={{ color: "var(--color-muted-text)" }} className="mt-6 text-center text-sm">
								Tip: take a screenshot of this page. Need to change or cancel? Email{" "}
								<a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
									{CONTACT_EMAIL}
								</a>
								.
							</p>
						</div>
					) : (
						<p className="py-20 text-center" role="status">
							Confirming your booking…
						</p>
					)}
				</main>
			</div>
		);
	}

	return (
		<div className="santa-page">
			<Header />

			<section className="santa-hero px-4 pt-8 pb-12 text-white">
				<div className="santa-snow" aria-hidden="true" />
				<div className="relative mx-auto max-w-xl">
					<h1 className="text-[34px] leading-[1.1] font-bold">
						Portraits
						<br />
						with Santa <span aria-hidden="true">🎅</span>
					</h1>
					<p className="mt-3 text-[15px] leading-relaxed text-white/85">
						Reserve a private 10-minute visit and take home a keepsake portrait.
						Every session supports St. Columba Catholic School.
					</p>
					<div className="mt-5 flex flex-wrap gap-2 text-[13px] font-medium">
						{[EVENT_DATE_LABEL, "9 AM – 1 PM", `${PRICE_LABEL} per session`].map((chip) => (
							<span
								key={chip}
								style={{ backgroundColor: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)" }}
								className="rounded-full px-3 py-1.5"
							>
								{chip}
							</span>
						))}
					</div>
				</div>
			</section>

			<form
				id="santa-form"
				onSubmit={handleSubmit}
				className="relative mx-auto -mt-6 max-w-xl space-y-4 px-4 pb-44"
			>
				<section className="santa-card p-5">
					<div className="flex items-center gap-3">
						<span className="santa-step">1</span>
						<h2 className="text-xl font-bold">Pick a time</h2>
					</div>
					<p style={{ color: "var(--color-muted-text)" }} className="mt-2 text-sm" aria-live="polite">
						{loadError
							? "Couldn't load times — please refresh."
							: left === null
								? "Loading times…"
								: left === 0
									? "All times are booked. Thank you for the support!"
									: `${left} of ${SLOT_IDS.length} times left`}
					</p>

					<div role="radiogroup" aria-label="Available times" className="mt-4 space-y-5">
						{groups.map(([hour, ids]) => (
							<div key={hour}>
								<h3
									style={{ color: "var(--color-muted-text)", letterSpacing: "0.1em" }}
									className="mb-2 text-xs font-bold uppercase"
								>
									{hourLabel(hour)} hour
								</h3>
								<div className="grid grid-cols-3 gap-2">
									{ids.map((slot) =>
										taken === null ? (
											<div key={slot} className="santa-skeleton" />
										) : (
											<button
												key={slot}
												type="button"
												role="radio"
												aria-checked={selected === slot}
												aria-label={`${formatSlot(slot)}${taken.has(slot) ? ", booked" : ""}`}
												disabled={taken.has(slot)}
												onClick={() => {
													setSelected(slot);
													setError(null);
												}}
												className="santa-slot"
											>
												{formatSlot(slot)}
											</button>
										),
									)}
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="santa-card p-5">
					<div className="flex items-center gap-3">
						<span className="santa-step">2</span>
						<h2 className="text-xl font-bold">Your details</h2>
					</div>
					<div className="mt-4 grid grid-cols-2 gap-3">
						<div>
							<label className="santa-label" htmlFor="santa-first-name">
								First name
							</label>
							<input
								id="santa-first-name"
								className="santa-input"
								required
								maxLength={30}
								autoComplete="given-name"
								enterKeyHint="next"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
							/>
						</div>
						<div>
							<label className="santa-label" htmlFor="santa-last-name">
								Last name
							</label>
							<input
								id="santa-last-name"
								className="santa-input"
								required
								maxLength={30}
								autoComplete="family-name"
								enterKeyHint="next"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
							/>
						</div>
					</div>
					<div className="mt-3">
						<label className="santa-label" htmlFor="santa-phone">
							Phone number
						</label>
						<input
							id="santa-phone"
							className="santa-input"
							required
							type="tel"
							inputMode="tel"
							maxLength={30}
							autoComplete="tel"
							enterKeyHint="done"
							placeholder="(555) 123-4567"
							value={phone}
							onChange={(e) => setPhone(e.target.value)}
						/>
						<p style={{ color: "var(--color-muted-text)" }} className="mt-2 text-xs">
							We&apos;ll only use this if we need to reach you about your time.
						</p>
					</div>
				</section>

				<p style={{ color: "var(--color-muted-text)" }} className="px-2 text-center text-xs leading-relaxed">
					Your time is held for 30 minutes while you check out. To change or cancel after
					booking, email{" "}
					<a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
						{CONTACT_EMAIL}
					</a>
					.
				</p>
			</form>

			<div className="santa-bar">
				<div className="mx-auto max-w-xl">
					{error && (
						<p
							role="alert"
							style={{ color: "var(--color-berry)" }}
							className="mb-2 text-center text-sm font-medium"
						>
							{error}
						</p>
					)}
					<button type="submit" form="santa-form" disabled={submitting} className="santa-cta">
						{submitting
							? "Holding your time…"
							: selected
								? `Continue to payment · ${formatSlot(selected)}`
								: "Choose a time to continue"}
					</button>
				</div>
			</div>
		</div>
	);
}
