import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Maps a subdomain of sweetdaygoods.com to the product page it should show.
const SUBDOMAIN_PRODUCTS: Record<string, string> = {
  "paws-spirit-tshirt": "paws-spirit-tshirt",
};

// Subdomains that map to a standalone page rather than a product.
const SUBDOMAIN_PAGES: Record<string, string> = {
  santa: "/santa",
};

export function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const subdomain = host.split(".")[0];

  // The root layout always links /favicon.ico (the PAWS mark); on a subdomain
  // that has its own icon, answer that request with it instead.
  if (subdomain === "santa" && request.nextUrl.pathname === "/favicon.ico") {
    return NextResponse.rewrite(new URL("/santa/favicon.ico", request.url));
  }

  const page = SUBDOMAIN_PAGES[subdomain];
  if (page && request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL(page, request.url));
  }

  const uid = SUBDOMAIN_PRODUCTS[subdomain];
  if (uid && request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL(`/products/${uid}`, request.url));
  }
}

export const config = {
  matcher: ["/", "/favicon.ico"],
};
