/**
 * The middleware redirects unauthenticated /admin requests
 * straight to /auth/login, so this page is unreachable in
 * normal use. This redirect is a safety net.
 */
import { redirect } from "next/navigation";

export default function AdminLoginPage() {
  redirect("/auth/login");
}