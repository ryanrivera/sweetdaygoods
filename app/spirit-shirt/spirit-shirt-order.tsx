"use client";

import { useState } from "react";
import Image from "next/image";

const PHOTOS = [
  {
    src: "/spirit-shirt/2026-27-Spirit-Shirt.jpg",
    alt: "St. Columba spirit t-shirt — front and back view. Mint green shirt with PAWS paw print on the front pocket and a cross design on the back.",
    label: "Front & Back",
  },
  {
    src: "/spirit-shirt/2026-27_Spirit_Shirt_-_Pocket.svg",
    alt: "PAWS pocket print — St. Columba Catholic School logo with paw print",
    label: "Pocket Print",
    pad: true,
  },
  {
    src: "/spirit-shirt/2026-27_Spirit_Shirt_-_Back.svg",
    alt: "Back design — forest green cross with 2026–2027",
    label: "Back Design",
    pad: true,
  },
];

const YOUTH_SIZES = ["YXS", "YS", "YM", "YL", "YXL"];
const ADULT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

type OrderState = "idle" | "added" | "ordered";

export default function SpiritShirtOrder() {
  const [activePhoto, setActivePhoto] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [orderState, setOrderState] = useState<OrderState>("idle");
  const [sizeError, setSizeError] = useState(false);

  function handleAddToCart() {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    setOrderState("added");
  }

  function handlePlaceOrder() {
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    setOrderState("ordered");
  }

  function handleSizeSelect(size: string) {
    setSelectedSize(size);
    setSizeError(false);
    if (orderState === "ordered") setOrderState("idle");
  }

  const photo = PHOTOS[activePhoto];

  return (
    <div
      className="spirit-shirt-page min-h-screen"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: "var(--color-forest)",
          borderBottom: "3px solid var(--color-yellow)",
        }}
        className="px-6 py-4"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Cross icon */}
            <div
              style={{ backgroundColor: "var(--color-yellow)" }}
              className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0"
            >
              <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
                <rect x="6" y="0" width="6" height="22" rx="2" fill="#0f3d27" />
                <rect x="0" y="6" width="18" height="6" rx="2" fill="#0f3d27" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "white",
                  lineHeight: 1.1,
                }}
                className="text-base font-bold"
              >
                St. Columba Catholic School
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  color: "var(--color-yellow)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                }}
                className="uppercase"
              >
                Spirit Wear Store
              </div>
            </div>
          </div>
          <Image
            src="/spirit-shirt/2026-27_Spirit_Shirt_-_Pocket.svg"
            alt="PAWS logo"
            width={40}
            height={40}
            className="h-10 w-10 opacity-80"
          />
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-6 py-4">
        <p
          style={{ color: "var(--color-muted-text)", fontFamily: "var(--font-body)" }}
          className="text-sm"
        >
          Spirit Wear Store <span className="mx-1.5">›</span>
          <span style={{ color: "var(--color-forest)" }}>2026–27 Spirit T-Shirt</span>
        </p>
      </div>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 pb-20">
        <div
          className="grid gap-12"
          style={{ gridTemplateColumns: "minmax(0,1fr) minmax(0,420px)" }}
        >
          {/* Photo gallery */}
          <div className="flex flex-col gap-4">
            {/* Main photo */}
            <div
              className="relative overflow-hidden rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: photo.pad ? "#e8f0eb" : "#d4e8da",
                aspectRatio: photo.pad ? "4/3" : "3/4",
              }}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="transition-opacity duration-300"
                style={{
                  objectFit: photo.pad ? "contain" : "cover",
                  objectPosition: photo.pad ? "center" : "center 10%",
                  padding: photo.pad ? "32px" : 0,
                }}
              />
              {/* Label chip */}
              <div
                className="absolute bottom-3 left-3 px-2.5 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: "rgba(15,61,39,0.75)",
                  color: "white",
                  fontFamily: "var(--font-body)",
                }}
              >
                {photo.label}
              </div>
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-3">
              {PHOTOS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className="relative overflow-hidden rounded-lg transition-all duration-200 flex items-center justify-center"
                  style={{
                    aspectRatio: "4/3",
                    backgroundColor: p.pad ? "#e8f0eb" : "#d4e8da",
                    outline:
                      activePhoto === i
                        ? "2.5px solid var(--color-forest)"
                        : "2px solid transparent",
                    outlineOffset: "2px",
                    opacity: activePhoto === i ? 1 : 0.6,
                  }}
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="200px"
                    style={{
                      objectFit: p.pad ? "contain" : "cover",
                      padding: p.pad ? "10px" : 0,
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product details */}
          <div className="flex flex-col gap-6 pt-1">
            {/* Title & badge */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-xs font-medium px-2.5 py-1 rounded-full uppercase tracking-wide"
                  style={{
                    backgroundColor: "var(--color-yellow)",
                    color: "var(--color-forest)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  2026–27 Spirit Wear
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  color: "var(--color-forest)",
                  lineHeight: 1.2,
                }}
                className="text-3xl font-bold mb-3"
              >
                PAWS Spirit T-Shirt
              </h1>
              <p
                style={{
                  color: "var(--color-muted-text)",
                  fontFamily: "var(--font-body)",
                  lineHeight: 1.7,
                }}
                className="text-sm"
              >
                Show your St. Columba PAWS pride! This year&apos;s design was chosen from
                our annual student design contest — created by a 7th grade student right
                here at St. Columba. The tee features the winning paw print logo on the
                chest and a bold cross on the back. Soft mint green, 100% cotton — sized
                for the whole family.
              </p>
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
                $25.00
              </span>
              <span
                style={{ color: "var(--color-muted-text)", fontFamily: "var(--font-body)" }}
                className="ml-2 text-sm"
              >
                per shirt
              </span>
            </div>

            {/* Size selector */}
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

              <div className="mb-3">
                <p
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-muted-text)" }}
                  className="text-xs uppercase tracking-widest mb-2"
                >
                  Youth
                </p>
                <div className="flex flex-wrap gap-2">
                  {YOUTH_SIZES.map((size) => (
                    <SizeButton
                      key={size}
                      size={size}
                      selected={selectedSize === size}
                      onClick={() => handleSizeSelect(size)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p
                  style={{ fontFamily: "var(--font-body)", color: "var(--color-muted-text)" }}
                  className="text-xs uppercase tracking-widest mb-2"
                >
                  Adult
                </p>
                <div className="flex flex-wrap gap-2">
                  {ADULT_SIZES.map((size) => (
                    <SizeButton
                      key={size}
                      size={size}
                      selected={selectedSize === size}
                      onClick={() => handleSizeSelect(size)}
                    />
                  ))}
                </div>
              </div>

              {sizeError && (
                <p style={{ color: "#b91c1c", fontFamily: "var(--font-body)" }} className="text-sm mt-3">
                  Please select a size before ordering.
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

            {/* Order total */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-lg"
              style={{ backgroundColor: "rgba(15,61,39,0.07)" }}
            >
              <span style={{ fontFamily: "var(--font-body)", color: "var(--color-muted-text)" }} className="text-sm">
                Order total
              </span>
              <span style={{ fontFamily: "var(--font-heading)", color: "var(--color-forest)" }} className="font-bold text-lg">
                ${(25 * quantity).toFixed(2)}
              </span>
            </div>

            {/* CTA */}
            {orderState === "ordered" ? (
              <div
                className="rounded-xl px-6 py-5 text-center"
                style={{ backgroundColor: "var(--color-forest)", color: "white" }}
              >
                <p style={{ fontFamily: "var(--font-heading)" }} className="font-bold text-lg mb-1">
                  Order Placed — Go PAWS!
                </p>
                <p style={{ fontFamily: "var(--font-body)" }} className="text-sm opacity-90">
                  {quantity} × {selectedSize} shirt{quantity > 1 ? "s" : ""} · Confirmation sent to your email.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 rounded-lg text-sm font-medium tracking-widest transition-all duration-150 active:scale-[0.98]"
                  style={{
                    backgroundColor: "var(--color-forest)",
                    color: "white",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  PLACE ORDER — ${(25 * quantity).toFixed(2)}
                </button>
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 rounded-lg text-sm font-medium tracking-widest transition-all duration-150 active:scale-[0.98]"
                  style={{
                    backgroundColor: orderState === "added" ? "var(--color-yellow)" : "transparent",
                    color: "var(--color-forest)",
                    border: "1.5px solid var(--color-forest)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {orderState === "added" ? "✓ ADDED TO CART" : "ADD TO CART"}
                </button>
              </div>
            )}

            {/* Trust line */}
            <p style={{ color: "var(--color-muted-text)", fontFamily: "var(--font-body)" }} className="text-xs text-center">
              Orders close <strong style={{ color: "var(--color-forest)" }}>Friday, October 18</strong> · Distributed at school
            </p>
          </div>
        </div>

        {/* Details strip */}
        <div
          className="mt-16 grid grid-cols-3 gap-px rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--color-border)", backgroundColor: "var(--color-border)" }}
        >
          {[
            { label: "Color", value: "Mint green with forest green print" },
            { label: "Material", value: "100% soft-spun cotton" },
            { label: "Sizes", value: "Youth XS – XL · Adult XS – 3XL" },
          ].map(({ label, value }) => (
            <div key={label} className="px-6 py-5" style={{ backgroundColor: "var(--color-cream)" }}>
              <p
                style={{ fontFamily: "var(--font-heading)", color: "var(--color-forest)", fontSize: 11, letterSpacing: "0.1em" }}
                className="uppercase mb-1"
              >
                {label}
              </p>
              <p style={{ fontFamily: "var(--font-body)", color: "var(--color-muted-text)" }} className="text-sm">
                {value}
              </p>
            </div>
          ))}
        </div>
      </main>
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
