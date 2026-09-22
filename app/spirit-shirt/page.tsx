import { Arvo, Roboto } from "next/font/google";
import type { Metadata } from "next";
import SpiritShirtOrder from "./spirit-shirt-order";
import "./spirit-shirt.css";

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

export const metadata: Metadata = {
  title: "PAWS Spirit T-Shirt — St. Columba Catholic School",
  description:
    "Order the 2026–27 St. Columba PAWS spirit t-shirt, designed by a 7th grade student design contest winner.",
};

export default function Page() {
  return (
    <div className={`${arvo.variable} ${roboto.variable}`}>
      <SpiritShirtOrder />
    </div>
  );
}
