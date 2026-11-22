"use client";

import { useCallback, useEffect, useState } from "react";
import Snowfall, { TwinklingDots } from "./snowfall";
import {
	BLOCKS,
	CONTACT_EMAIL,
	EVENT_ADDRESS,
	EVENT_DATE_LABEL,
	EVENT_LABEL,
	PRICE_CENTS,
	SLOT_GROUPS,
	SLOT_IDS,
	SLOT_LENGTH_MINUTES,
	formatBlock,
	formatSlot,
} from "./config";

type Confirmation = { slot: string; name: string };

// "$25" for whole dollars, "$25.50" otherwise
const PRICE_LABEL = `$${(PRICE_CENTS / 100).toFixed(PRICE_CENTS % 100 === 0 ? 0 : 2)}`;
const HOURS_LABEL = `${formatSlot(BLOCKS[0].start)} – ${formatSlot(BLOCKS[BLOCKS.length - 1].breakEnd)}`;
// "Sunday, December 6" -> "Sunday • December 6" (uppercased in CSS)
const DATE_BANNER = EVENT_DATE_LABEL.replace(", ", " • ");

/* ---------- Flyer artwork (inline SVG so nothing extra to load) ---------- */

const PINE = "#1f6b50";

function PineBranch({ style, flip }: { style?: React.CSSProperties; flip?: boolean }) {
	const [p0, p1, p2] = [
		[4, 6],
		[60, 22],
		[118, 72],
	];
	const needles: string[] = [];
	const count = 12;
	for (let i = 1; i <= count; i++) {
		const t = i / (count + 1);
		const x = (1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0];
		const y = (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1];
		const dx = 2 * (1 - t) * (p1[0] - p0[0]) + 2 * t * (p2[0] - p1[0]);
		const dy = 2 * (1 - t) * (p1[1] - p0[1]) + 2 * t * (p2[1] - p1[1]);
		const angle = Math.atan2(dy, dx);
		const length = 30 * (1 - t * 0.45);
		for (const side of [-1, 1]) {
			const a = angle + side * 0.95;
			needles.push(
				`M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(a) * length).toFixed(1)} ${(Math.sin(a) * length).toFixed(1)}`,
			);
		}
	}
	return (
		<svg
			className="santa-deco"
			viewBox="0 0 150 130"
			fill="none"
			aria-hidden="true"
			style={{ ...style, transform: `${style?.transform ?? ""} ${flip ? "scaleX(-1)" : ""}` }}
		>
			<path d="M4 6Q60 22 118 72" stroke={PINE} strokeWidth="3.5" strokeLinecap="round" />
			<path d={needles.join("")} stroke={PINE} strokeWidth="2.8" strokeLinecap="round" />
		</svg>
	);
}

function Ornament({ style, teardrop }: { style?: React.CSSProperties; teardrop?: boolean }) {
	return (
		<svg className="santa-deco" viewBox="0 0 64 88" aria-hidden="true" style={style}>
			<rect x="25" y="0" width="14" height="11" rx="2.5" fill="#f3e2a5" />
			<path d="M32 11v6" stroke="#f3e2a5" strokeWidth="3" />
			{teardrop ? (
				<path d="M32 18C50 38 60 62 32 86C4 62 14 38 32 18Z" fill="#e8262a" />
			) : (
				<circle cx="32" cy="54" r="30" fill="#e8262a" />
			)}
			<g stroke="#fff" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9">
				<path d="M15 48q4-6 8 0t8 0t8 0t8 0" />
				<path d="M13 57q4-6 8 0t8 0t8 0t8 0t5 0" />
				<path d="M17 66q4-6 8 0t8 0t8 0t6 0" />
			</g>
		</svg>
	);
}

function Sparkle({ style, delay = 0 }: { style?: React.CSSProperties; delay?: number }) {
	return (
		<svg
			className="santa-deco santa-twinkle"
			viewBox="0 0 24 24"
			aria-hidden="true"
			style={{ ...style, animationDelay: `${delay}s` }}
		>
			<path d="M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z" fill="#fff" />
		</svg>
	);
}

function Snowflake({ style }: { style?: React.CSSProperties }) {
	return (
		<svg className="santa-deco" viewBox="0 0 40 40" aria-hidden="true" style={style} fill="none">
			<g stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				{[0, 60, 120].map((deg) => (
					<g key={deg} transform={`rotate(${deg} 20 20)`}>
						<path d="M20 3V37M14 9l6 5 6-5M14 31l6-5 6 5" />
					</g>
				))}
			</g>
		</svg>
	);
}

function Ribbon({
	tilt,
	children,
	className = "",
}: {
	tilt: number;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`santa-ribbon ${className}`}
			style={{ "--tilt": `${tilt}deg` } as React.CSSProperties}
		>
			<div className="santa-ribbon-body">{children}</div>
		</div>
	);
}

function TopDecor() {
	return (
		<>
			<PineBranch style={{ left: -16, top: -8, width: 150 }} />
			<PineBranch flip style={{ right: -16, top: -8, width: 150 }} />
			<Ornament style={{ right: 16, top: 74, width: 44, transform: "rotate(8deg)" }} />
			<Sparkle delay={0.4} style={{ left: 24, top: 150, width: 22 }} />
			<Sparkle delay={1.6} style={{ right: 30, top: 250, width: 28 }} />
			<Sparkle delay={0.9} style={{ left: 12, top: 330, width: 16 }} />
		</>
	);
}

/* ---------- Page ---------- */

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
				<TwinklingDots />
				<section className="relative px-6 pt-12 pb-40">
					<TopDecor />
					<div className="relative z-[1] mx-auto max-w-[420px]">
						{confirmation ? (
							<div className="santa-pop">
								<Ribbon tilt={-2}>
									<h1 className="santa-title text-[38px]">YOU&apos;RE BOOKED!</h1>
								</Ribbon>
								<p className="mt-9 text-center text-[19px] font-semibold" style={{ color: "var(--ink-dark)" }}>
									See you at the Christmas Market, {confirmation.name.split(" ")[0]}!
								</p>
								<div className="santa-ticket mt-6">
									<div className="px-6 pt-7 pb-8 text-center">
										<div className="text-sm font-semibold tracking-[0.12em] uppercase" style={{ color: "var(--ink-soft)" }}>
											Your Santa time
										</div>
										<div className="santa-title mt-3 text-[46px] whitespace-nowrap">{formatSlot(confirmation.slot)}</div>
										<div className="mt-3 text-[17px] font-semibold">{EVENT_DATE_LABEL}</div>
									</div>
									<div className="santa-ticket-divider" />
									<div className="space-y-1 px-6 py-5 text-center">
										<div className="text-[17px] font-semibold">{confirmation.name}</div>
										<div className="text-sm" style={{ color: "var(--ink-soft)" }}>
											{EVENT_LABEL} · {EVENT_ADDRESS}
										</div>
									</div>
								</div>
								<p className="mt-6 text-center text-sm font-medium" style={{ color: "var(--ink-dark)" }}>
									Tip: take a screenshot of this page. Need to change or cancel? Email{" "}
									<a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
										{CONTACT_EMAIL}
									</a>
									.
								</p>
							</div>
						) : (
							<p className="py-24 text-center text-lg font-semibold" role="status" style={{ color: "var(--ink-dark)" }}>
								Confirming your booking…
							</p>
						)}
					</div>
				</section>
				<Snowfall />
				<div className="santa-frame" aria-hidden="true" />
			</div>
		);
	}

	return (
		<div className="santa-page">
			<TwinklingDots />
			<section className="relative px-6 pt-11 pb-5">
				<TopDecor />

				<div className="relative z-[1] mx-auto max-w-[420px] text-center">
					<h1 className="sr-only">Photos with Santa at the {EVENT_LABEL}</h1>
					<p
						aria-hidden="true"
						className="text-[17px] leading-tight font-bold tracking-[0.1em] uppercase"
						style={{ color: "var(--cream)", textShadow: "0 2px 0 rgba(15,90,70,0.45)" }}
					>
						Smile for Santa!
					</p>

					<div className="mt-6" aria-hidden="true">
						<Ribbon tilt={-3}>
							<p className="text-[17px] leading-tight font-semibold" style={{ color: "var(--ink)" }}>
								St. Columba Catholic Community
								<br />
								Family &amp; Friends
							</p>
						</Ribbon>
					</div>
					<div className="mt-6" aria-hidden="true">
						<Ribbon tilt={2}>
							<p className="santa-title text-[46px]">SANTA</p>
						</Ribbon>
					</div>
					<div className="mt-6" aria-hidden="true">
						<Ribbon tilt={-2}>
							<p className="santa-title text-[46px]">PHOTOS</p>
						</Ribbon>
					</div>

					<div className="relative mt-8">
						<Ornament style={{ left: -18, top: -4, width: 34, transform: "rotate(-10deg)" }} />
						<Snowflake style={{ right: -10, top: 6, width: 28 }} />
						<p className="mx-auto max-w-[270px] text-[18px] leading-snug font-semibold" style={{ color: "var(--ink-dark)" }}>
							Reserve your time with Santa and take home a photo on the spot!
						</p>
					</div>

					<div className="santa-price mt-5">
						<div className="santa-price-seal" aria-hidden="true">
							{PRICE_LABEL}
						</div>
						<p className="text-left text-[17px] leading-tight font-bold" style={{ color: "var(--ink-dark)" }}>
							<span className="sr-only">Price: {PRICE_LABEL}. </span>
							per {SLOT_LENGTH_MINUTES}-minute visit
							<span className="mt-0.5 block text-[14px] font-semibold" style={{ color: "var(--ink)" }}>
								Instant 4×6 print included
							</span>
						</p>
					</div>

					<div className="santa-banner mt-5 text-[21px]">{DATE_BANNER}</div>

					<p className="santa-outline mt-4 text-[19px] leading-tight">
						{EVENT_ADDRESS}
						<br />
						Santa {HOURS_LABEL}
					</p>

				</div>
			</section>

			<form id="santa-form" onSubmit={handleSubmit} className="relative mx-auto max-w-[460px] space-y-5 px-5">
				<section className="santa-card p-5">
					<div className="flex items-center gap-3">
						<span className="santa-step">1</span>
						<h2 className="text-[22px] font-bold">Pick a time</h2>
					</div>
					<p className="mt-2 text-[15px] font-medium" style={{ color: "var(--ink-soft)" }} aria-live="polite">
						<strong className="font-bold" style={{ color: "var(--red)" }}>
							{PRICE_LABEL} per visit
						</strong>
						{" · "}
						{loadError
							? "Couldn't load times — please refresh."
							: left === null
								? "Loading times…"
								: left === 0
									? "All times are booked. Thank you for the support!"
									: `${left} of ${SLOT_IDS.length} times left`}
					</p>

					<div role="radiogroup" aria-label="Available times">
						{SLOT_GROUPS.map((group, i) => (
							<div key={group.start} className={i === 0 ? "mt-4" : "mt-6"}>
								<h3 className="santa-block-title">
									<span>{group.title}</span>
									<span className="santa-block-time">{formatBlock(group)}</span>
								</h3>
								<div className="grid grid-cols-3 gap-2.5">
									{group.slots.map((slot) =>
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

				<p
					className="rounded-2xl border-2 border-dashed px-4 py-3 text-center text-[15px] leading-snug font-medium"
					style={{ borderColor: "var(--cream)", color: "var(--ink-dark)" }}
				>
					<strong className="font-bold">Walk-ins are welcome</strong>, but reserved times are
					served first. Book a spot to skip the wait!
				</p>

				<section className="santa-card p-5">
					<div className="flex items-center gap-3">
						<span className="santa-step">2</span>
						<h2 className="text-[22px] font-bold">Your details</h2>
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
						<p className="mt-2 text-[13px]" style={{ color: "var(--ink-soft)" }}>
							We&apos;ll only use this if we need to reach you about your time.
						</p>
					</div>
				</section>
			</form>

			<footer className="relative px-6 pt-8 pb-44 text-center">
				<PineBranch style={{ left: -18, bottom: 64, width: 130, transform: "scaleY(-1) rotate(8deg)" }} />
				<PineBranch flip style={{ right: -18, bottom: 64, width: 130, transform: "scaleY(-1) rotate(8deg)" }} />
				<Sparkle delay={0.9} style={{ right: 52, top: 10, width: 22 }} />
				<div className="relative z-[1] mx-auto max-w-[360px]" style={{ color: "var(--ink-dark)" }}>
					<p className="text-[18px] leading-snug font-semibold">
						Come share the joy of Christmas with us!
					</p>
					<p className="mt-3 text-[13px] leading-relaxed font-medium">
						Your time is held for 30 minutes while you check out. To change or cancel after
						booking, email{" "}
						<a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
							{CONTACT_EMAIL}
						</a>
						.
					</p>
				</div>
			</footer>

			<div className="santa-bar">
				<div className="mx-auto max-w-[460px]">
					{error && (
						<p role="alert" className="santa-cta-error">
							{error}
						</p>
					)}
					<button type="submit" form="santa-form" disabled={submitting} className="santa-cta">
						{submitting
							? "Holding your time…"
							: selected
								? `Pay ${PRICE_LABEL} · ${formatSlot(selected)}`
								: "Choose a time to continue"}
					</button>
				</div>
			</div>

			<Snowfall />
			<div className="santa-frame" aria-hidden="true" />
		</div>
	);
}
