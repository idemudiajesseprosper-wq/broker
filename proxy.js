import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const authRoutes = new Set([
  "/admin/login",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]);

function getToken(request) {
  const authorization = request.headers.get("authorization");

  if (authorization?.startsWith("Bearer ")) {
    return authorization.split(" ")[1];
  }

  return request.cookies.get("bsx_token")?.value;
}

function redirectToLogin(request, pathname = "/login", params = {}) {
  const loginUrl = new URL(pathname, request.url);

  for (const [key, value] of Object.entries(params)) {
    loginUrl.searchParams.set(key, value);
  }

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete("bsx_token");
  return response;
}

async function verifyToken(token) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);

  return payload;
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const isDashboardRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute =
    !isAdminLogin && (pathname === "/admin" || pathname.startsWith("/admin/"));
  const isAuthRoute = authRoutes.has(pathname);
  const token = getToken(request);

  if (!token) {
    if (isAdminRoute) {
      return redirectToLogin(request, "/admin/login", {
        redirect: `${request.nextUrl.pathname}${request.nextUrl.search}`,
      });
    }

    if (isDashboardRoute) {
      return redirectToLogin(request, "/login", {
        redirect: `${request.nextUrl.pathname}${request.nextUrl.search}`,
      });
    }

    return NextResponse.next();
  }

  try {
    const payload = await verifyToken(token);
    const role = payload.role;

    if (isAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (isAdminLogin) {
      return NextResponse.redirect(
        new URL(role === "admin" ? "/admin" : "/dashboard", request.url),
      );
    }

    if (isAuthRoute) {
      return NextResponse.redirect(
        new URL(role === "admin" ? "/admin" : "/dashboard", request.url),
      );
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", String(payload.userId));
    requestHeaders.set("x-user-role", String(role));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    return redirectToLogin(request, isAdminRoute ? "/admin/login" : "/login", {
      reason: "session_expired",
    });
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
  ],
};
