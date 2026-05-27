// Force dynamic rendering and no caching for the login route. Server actions
// on this page (requestMagicLink) must never be cached or pre-rendered, and
// some edge configurations cache page POST responses by default — explicitly
// opt out here.

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
