// middleware.ts
import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/", "/candidates", "/vote"],
  ignoredRoutes: ["/_next/static(.*)", "/_next/image(.*)", "/favicon.ico"],

  async afterAuth(auth, req) {
    const { userId, sessionClaims } = auth;
  
    // Log full auth object for debugging
    console.log("Auth Object:", auth);
  
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!userId) {
        return NextResponse.redirect(new URL("/", req.url));
      }
  
      // Debugging: Check if role is present
      console.log("User Role:", sessionClaims?.metadata?.role);
  
      if (sessionClaims?.metadata?.role !== "admin") {
        console.error("User is not an admin:", userId);
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    // Results page access control
    if (req.nextUrl.pathname === "/results") {
      const resultsAvailable = process.env.NEXT_PUBLIC_RESULTS_AVAILABLE === "yes";
      
      if (!resultsAvailable) {
        console.log("Results page access denied - not available yet");
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/trpc).*)"],
};