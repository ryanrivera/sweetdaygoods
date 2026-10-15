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
  matcher: "/",
};
