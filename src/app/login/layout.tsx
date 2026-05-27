import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// Force the cache key to be unique per request — this evicts any stale 405
// responses that might have been cached at the edge from earlier deployments
// or scanner traffic.
export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Reading headers makes Next.js mark this segment as dynamic on every
  // request, preventing any caching layer from serving stale responses.
  await headers();
  return children;
}
