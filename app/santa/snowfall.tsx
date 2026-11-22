// Falling snow. Positions, sizes, speeds and spins are pseudo-random but
// seeded, so the server and client render identical markup (no hydration
// mismatch) while every flake still looks different. All motion is CSS.

function mulberry32(seed: number) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

type Flake = {
	x: number; // % from left
	size: number; // px
	fall: number; // seconds to cross the screen
	delay: number; // negative, so the screen is already snowing on load
	sway: number; // px of side-to-side drift
	swayDuration: number;
	swayDelay: number;
	spin: number; // total degrees per turn (sign sets direction)
	spinDuration: number;
	opacity: number;
	dot: boolean; // plain round flake vs. six-armed crystal
};

function makeFlakes(count: number): Flake[] {
	const rand = mulberry32(1206);
	const between = (min: number, max: number) => min + rand() * (max - min);
	return Array.from({ length: count }, () => {
		const size = Math.round(between(8, 28));
		// Bigger flakes are "closer", so they fall a bit faster.
		const fall = 16 - ((size - 8) / 20) * 7 + between(-2, 3);
		return {
			x: between(-2, 100),
			size,
			fall,
			delay: -between(0, fall),
			sway: between(12, 46),
			swayDuration: between(3, 7),
			swayDelay: -between(0, 6),
			spin: (rand() < 0.5 ? -1 : 1) * between(180, 540),
			spinDuration: between(5, 14),
			opacity: between(0.45, 0.9),
			dot: size < 14, // small flakes are round; bigger ones show the crystal
		};
	});
}

const FLAKES = makeFlakes(30);

export default function Snowfall() {
	return (
		<div className="santa-snowfall" aria-hidden="true">
			{FLAKES.map((f, i) => (
				<span
					key={i}
					className="santa-flake"
					style={
						{
							"--x": `${f.x.toFixed(1)}%`,
							"--size": `${f.size}px`,
							"--fall": `${f.fall.toFixed(1)}s`,
							"--delay": `${f.delay.toFixed(1)}s`,
							"--amp": `${f.sway.toFixed(0)}px`,
							"--sway-dur": `${f.swayDuration.toFixed(1)}s`,
							"--sway-delay": `${f.swayDelay.toFixed(1)}s`,
							"--spin": `${f.spin.toFixed(0)}deg`,
							"--spin-dur": `${f.spinDuration.toFixed(1)}s`,
							opacity: f.opacity.toFixed(2),
						} as React.CSSProperties
					}
				>
					<span>
						{f.dot ? (
							<i />
						) : (
							<svg viewBox="0 0 40 40" fill="none">
								<g stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
									{[0, 60, 120].map((deg) => (
										<g key={deg} transform={`rotate(${deg} 20 20)`}>
											<path d="M20 3V37M14 9l6 5 6-5M14 31l6-5 6 5" />
										</g>
									))}
								</g>
							</svg>
						)}
					</span>
				</span>
			))}
		</div>
	);
}

// Tiny background dots, in several layers that pulse out of step.
export function TwinklingDots() {
	return (
		<div className="santa-dots" aria-hidden="true">
			{[1, 2, 3, 4, 5].map((n) => (
				<span key={n} className={`santa-dots-layer santa-dots-${n}`} />
			))}
		</div>
	);
}
