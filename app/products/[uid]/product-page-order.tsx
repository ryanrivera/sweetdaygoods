"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { isFilled } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import type { RichTextComponents } from "@prismicio/react";
import type {
	ProductPageDocument,
	ProductPageDocumentDataImagesItem,
	SizesSlice,
} from "@/prismicio-types";
import type { FilledImageFieldImage } from "@prismicio/client";
import { useCart } from "../cart-context";
import CartButton from "../cart-button";
import { GRADE_OPTIONS } from "../grades";

type OrderState = "idle" | "added";

type FilledImageItem = Omit<ProductPageDocumentDataImagesItem, "image"> & {
	image: FilledImageFieldImage;
};

export default function ProductPageOrder({
	page,
}: {
	page: ProductPageDocument;
}) {
	const { data } = page;
	const images = [...data.images].filter(
		(item): item is FilledImageItem => isFilled.image(item.image),
	);
	const price = data.price ?? 0;
	const sizeGroups = [...data.slices].filter(
		(slice): slice is SizesSlice => slice.slice_type === "sizes",
	);

	const cart = useCart();
	const [activePhoto, setActivePhoto] = useState(0);
	const [selectedSize, setSelectedSize] = useState<string | null>(null);
	const [studentName, setStudentName] = useState("");
	const [grade, setGrade] = useState("");
	const [quantity, setQuantity] = useState(1);
	const [orderState, setOrderState] = useState<OrderState>("idle");
	const [sizeError, setSizeError] = useState(false);
	const [studentInfoError, setStudentInfoError] = useState(false);
	const [termsOpen, setTermsOpen] = useState(false);
	const [sponsorChecked, setSponsorChecked] = useState(false);

	useEffect(() => {
		if (!termsOpen) return;
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") setTermsOpen(false);
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [termsOpen]);

	const footerComponents: RichTextComponents = {
		hyperlink: ({ node, children, key }) => {
			if (node.data.link_type === "Web" && node.data.url === "#terms-and-conditions") {
				return (
					<button
						key={key}
						type="button"
						onClick={() => setTermsOpen(true)}
						className="underline"
						style={{
							font: "inherit",
							color: "inherit",
							background: "none",
							border: "none",
							padding: 0,
							cursor: "pointer",
						}}
					>
						{children}
					</button>
				);
			}
			const url = node.data.link_type === "Web" ? node.data.url : undefined;
			const target = node.data.link_type === "Web" ? node.data.target : undefined;
			return (
				<a key={key} href={url} target={target} rel={target === "_blank" ? "noopener noreferrer" : undefined}>
					{children}
				</a>
			);
		},
	};

	const photo = images[activePhoto];
	const orderTotal = price * quantity + (sponsorChecked ? price : 0);

	function handleAddToCart() {
		if (sizeGroups.length > 0 && !selectedSize) {
			setSizeError(true);
			return;
		}
		setSizeError(false);

		if (!studentName.trim() || !grade.trim()) {
			setStudentInfoError(true);
			return;
		}
		setStudentInfoError(false);

		cart.addItem({
			uid: page.uid,
			name: data.name ?? "",
			size: selectedSize,
			studentName: studentName.trim(),
			grade: grade.trim(),
			unitPrice: price,
			quantity,
			sponsor: sponsorChecked,
			image: photo ? { url: photo.image.url, alt: photo.image.alt || data.name || "" } : null,
		});
		setOrderState("added");
		setTimeout(() => setOrderState("idle"), 1500);
	}

	function handleSizeSelect(size: string) {
		setSelectedSize(size);
		setSizeError(false);
	}

	const titleBlock = (
		<>
			{data.eyebrow && (
				<div className="flex items-center gap-2 mb-2">
					<span
						className="text-xs font-medium px-2.5 py-1 rounded-full uppercase tracking-wide"
						style={{
							backgroundColor: "var(--color-yellow)",
							color: "var(--color-forest)",
							fontFamily: "var(--font-body)",
						}}
					>
						{data.eyebrow}
					</span>
				</div>
			)}
			<h1
				style={{
					fontFamily: "var(--font-heading)",
					color: "var(--color-forest)",
					lineHeight: 1.2,
				}}
				className="text-3xl font-bold"
			>
				{data.name}
			</h1>
		</>
	);

	return (
		<div
			className="product-page-shell min-h-screen"
			style={{ backgroundColor: "var(--color-cream)" }}
		>
			{/* Breadcrumb */}
			<div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
				<p
					style={{ color: "var(--color-muted-text)", fontFamily: "var(--font-body)" }}
					className="text-sm"
				>
					St. Columba Catholic School <span className="mx-1.5">›</span>
					<span style={{ color: "var(--color-forest)" }}>{data.name}</span>
				</p>
				<CartButton />
			</div>

			{/* Main content */}
			<main className="max-w-5xl mx-auto px-6 pb-20">
				{/* Eyebrow & title — shown above the gallery on mobile only;
				    a second copy sits atop the details column on md+ */}
				<div className="mb-6 md:hidden">{titleBlock}</div>

				<div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:gap-12">
					{/* Photo gallery */}
					<div className="flex flex-col gap-4">
						{photo && (
							<div
								className="relative overflow-hidden rounded-xl"
								style={{ backgroundColor: "#d4e8da", aspectRatio: "1/1" }}
							>
								<Image
									src={photo.image.url}
									alt={photo.image.alt || `${data.name} — photo ${activePhoto + 1}`}
									fill
									priority
									sizes="(max-width: 768px) 100vw, 600px"
									style={{ objectFit: "cover" }}
								/>
							</div>
						)}

						{images.length > 1 && (
							<div className="grid grid-cols-3 gap-3">
								{images.map((item, i) => (
									<button
										key={i}
										onClick={() => setActivePhoto(i)}
										className="relative overflow-hidden rounded-lg transition-all duration-200"
										style={{
											aspectRatio: "1/1",
											backgroundColor: "#d4e8da",
											outline:
												activePhoto === i
													? "2.5px solid var(--color-forest)"
													: "2px solid transparent",
											outlineOffset: "2px",
											opacity: activePhoto === i ? 1 : 0.6,
										}}
									>
										<Image
											src={item.image.url}
											alt={item.image.alt || `${data.name} — photo ${i + 1}`}
											fill
											sizes="200px"
											style={{ objectFit: "cover" }}
										/>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Product details */}
					<div className="flex flex-col gap-6 pt-1">
						{/* Eyebrow & title (md+ only; duplicated above the gallery on mobile) */}
						<div className="hidden md:block">{titleBlock}</div>

						{/* Description */}
						<div>
							<div
								style={{
									color: "var(--color-muted-text)",
									fontFamily: "var(--font-body)",
									lineHeight: 1.7,
								}}
								className="text-sm"
							>
								<PrismicRichText field={data.description} />
							</div>
						</div>

						{/* Price */}
						<div
							style={{
								borderTop: "1px solid var(--color-border)",
								borderBottom: "1px solid var(--color-border)",
								padding: "16px 0",
							}}
						>
							<span
								style={{ fontFamily: "var(--font-heading)", color: "var(--color-forest)" }}
								className="text-3xl font-bold"
							>
								${price.toFixed(2)}
							</span>
							<span
								style={{ color: "var(--color-muted-text)", fontFamily: "var(--font-body)" }}
								className="ml-2 text-sm"
							>
								per item
							</span>
						</div>

						{/* Size selector */}
						{sizeGroups.length > 0 && (
							<div>
								<div className="flex items-center justify-between mb-3">
									<p
										style={{ fontFamily: "var(--font-heading)", color: "var(--color-forest)" }}
										className="text-sm font-bold uppercase tracking-wide"
									>
										Size
										{selectedSize && (
											<span
												style={{
													fontFamily: "var(--font-body)",
													color: "#5a7a63",
													fontWeight: 400,
												}}
												className="ml-2 normal-case tracking-normal"
											>
												— {selectedSize}
											</span>
										)}
									</p>
								</div>

								{sizeGroups.map((slice, i) => {
									const sizes = slice.primary.sizes.filter((item) =>
										isFilled.keyText(item.size),
									);
									if (sizes.length === 0) return null;

									return (
										<div key={i} className="mb-3">
											{slice.primary.name && (
												<p
													style={{
														fontFamily: "var(--font-body)",
														color: "var(--color-muted-text)",
													}}
													className="text-xs uppercase tracking-widest mb-2"
												>
													{slice.primary.name}
												</p>
											)}
											<div className="flex flex-wrap gap-2">
												{sizes.map((item) => (
													<SizeButton
														key={item.size}
														size={item.size as string}
														selected={selectedSize === item.size}
														onClick={() => handleSizeSelect(item.size as string)}
													/>
												))}
											</div>
										</div>
									);
								})}

								{sizeError && (
									<p style={{ color: "#b91c1c", fontFamily: "var(--font-body)" }} className="text-sm mt-3">
										Please select a size before ordering.
									</p>
								)}
							</div>
						)}

						{/* Student info */}
						<div>
							<p
								style={{ fontFamily: "var(--font-heading)", color: "var(--color-forest)" }}
								className="text-sm font-bold uppercase tracking-wide mb-3"
							>
								Student Info
							</p>
							<div className="flex flex-col gap-3">
								<input
									type="text"
									value={studentName}
									onChange={(e) => {
										setStudentName(e.target.value);
										setStudentInfoError(false);
									}}
									placeholder="Student Name"
									className="w-full px-3 py-2 rounded-lg outline-none"
									style={{
										fontFamily: "var(--font-body)",
										color: "var(--color-forest)",
										border: "1px solid var(--color-border)",
										fontSize: 16,
									}}
								/>
								<select
									value={grade}
									onChange={(e) => {
										setGrade(e.target.value);
										setStudentInfoError(false);
									}}
									className="w-full px-3 py-2 rounded-lg outline-none"
									style={{
										fontFamily: "var(--font-body)",
										color: grade ? "var(--color-forest)" : "var(--color-muted-text)",
										border: "1px solid var(--color-border)",
										fontSize: 16,
									}}
								>
									<option value="" disabled>
										Grade
									</option>
									{GRADE_OPTIONS.map((option) => (
										<option key={option} value={option}>
											{option}
										</option>
									))}
								</select>
							</div>

							{studentInfoError && (
								<p style={{ color: "#b91c1c", fontFamily: "var(--font-body)" }} className="text-sm mt-3">
									Please enter the student&apos;s name and grade before ordering.
								</p>
							)}
						</div>

						{/* Quantity */}
						<div>
							<p
								style={{ fontFamily: "var(--font-heading)", color: "var(--color-forest)" }}
								className="text-sm font-bold uppercase tracking-wide mb-3"
							>
								Quantity
							</p>
							<div
								className="flex items-center"
								style={{ border: "1px solid var(--color-border)", borderRadius: 6, width: "fit-content" }}
							>
								<button
									onClick={() => setQuantity((q) => Math.max(1, q - 1))}
									className="w-10 h-10 flex items-center justify-center text-lg transition-colors hover:bg-gray-100"
									style={{
										fontFamily: "var(--font-body)",
										color: "var(--color-forest)",
										borderRadius: "6px 0 0 6px",
									}}
									aria-label="Decrease quantity"
								>
									−
								</button>
								<span
									className="w-12 text-center text-sm font-medium"
									style={{
										fontFamily: "var(--font-body)",
										color: "var(--color-forest)",
										borderLeft: "1px solid var(--color-border)",
										borderRight: "1px solid var(--color-border)",
										lineHeight: "40px",
									}}
								>
									{quantity}
								</span>
								<button
									onClick={() => setQuantity((q) => q + 1)}
									className="w-10 h-10 flex items-center justify-center text-lg transition-colors hover:bg-gray-100"
									style={{
										fontFamily: "var(--font-body)",
										color: "var(--color-forest)",
										borderRadius: "0 6px 6px 0",
									}}
									aria-label="Increase quantity"
								>
									+
								</button>
							</div>
						</div>

						{/* Sponsor */}
						{isFilled.keyText(data.sponsor) && (
							<label
								className="flex items-center gap-2 text-sm cursor-pointer"
								style={{ fontFamily: "var(--font-body)", color: "var(--color-forest)" }}
							>
								<input
									type="checkbox"
									checked={sponsorChecked}
									onChange={(e) => setSponsorChecked(e.target.checked)}
									className="w-4 h-4"
								/>
								{data.sponsor}
							</label>
						)}

						{/* Order total */}
						<div
							className="flex items-center justify-between px-4 py-3 rounded-lg"
							style={{ backgroundColor: "rgba(15,61,39,0.07)" }}
						>
							<span style={{ fontFamily: "var(--font-body)", color: "var(--color-muted-text)" }} className="text-sm">
								Order total
							</span>
							<span style={{ fontFamily: "var(--font-heading)", color: "var(--color-forest)" }} className="font-bold text-lg">
								${orderTotal.toFixed(2)}
							</span>
						</div>

						{/* CTA */}
						<button
							onClick={handleAddToCart}
							className="w-full py-3.5 rounded-lg text-sm font-medium tracking-widest transition-all duration-150 active:scale-[0.98]"
							style={{
								backgroundColor: orderState === "added" ? "var(--color-yellow)" : "var(--color-forest)",
								color: orderState === "added" ? "var(--color-forest)" : "white",
								fontFamily: "var(--font-body)",
							}}
						>
							{orderState === "added" ? "✓ ADDED TO CART" : `ADD TO CART — $${orderTotal.toFixed(2)}`}
						</button>

						{/* Disclaimer */}
						{isFilled.richText(data.disclaimer) && (
							<div
								style={{ color: "var(--color-muted-text)", fontFamily: "var(--font-body)" }}
								className="text-xs text-center"
							>
								<PrismicRichText field={data.disclaimer} />
							</div>
						)}
					</div>
				</div>
			</main>

			{/* Footer */}
			{isFilled.richText(data.footer) && (
				<footer
					className="max-w-5xl mx-auto px-6 py-8 text-center text-xs"
					style={{
						borderTop: "1px solid var(--color-border)",
						color: "var(--color-muted-text)",
						fontFamily: "var(--font-body)",
					}}
				>
					<PrismicRichText field={data.footer} components={footerComponents} />
				</footer>
			)}

			{/* Terms & Conditions modal */}
			{termsOpen && (
				<div
					className="fixed inset-0 z-[70] flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-label="Terms and Conditions"
				>
					<div
						onClick={() => setTermsOpen(false)}
						className="absolute inset-0"
						style={{ backgroundColor: "rgba(15,61,39,0.45)" }}
						aria-hidden="true"
					/>
					<div
						className="relative w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-xl p-6"
						style={{ backgroundColor: "var(--color-cream)" }}
					>
						<div className="flex items-center justify-between mb-4">
							<h2
								style={{ fontFamily: "var(--font-heading)", color: "var(--color-forest)" }}
								className="text-lg font-bold"
							>
								Terms and Conditions
							</h2>
							<button
								onClick={() => setTermsOpen(false)}
								aria-label="Close"
								style={{ color: "var(--color-forest)", fontFamily: "var(--font-body)" }}
								className="text-2xl leading-none"
							>
								×
							</button>
						</div>
						<div
							style={{ color: "var(--color-muted-text)", fontFamily: "var(--font-body)", lineHeight: 1.7 }}
							className="text-sm"
						>
							<PrismicRichText field={data.terms} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function SizeButton({
	size,
	selected,
	onClick,
}: {
	size: string;
	selected: boolean;
	onClick: () => void;
}) {
	return (
		<button
			onClick={onClick}
			className="min-w-[44px] px-3 py-1.5 rounded text-sm font-medium transition-all duration-150"
			style={{
				fontFamily: "var(--font-body)",
				backgroundColor: selected ? "var(--color-forest)" : "white",
				color: selected ? "white" : "var(--color-forest)",
				border: selected ? "1.5px solid var(--color-forest)" : "1.5px solid var(--color-border)",
			}}
		>
			{size}
		</button>
	);
}
