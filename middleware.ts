import { authMiddleware } from "@clerk/nextjs";
 
export default authMiddleware({
  publicRoutes: ["/", "/candidates"],
  afterAuth(auth, req) {
    // Debug logs
    console.log("Auth Debug:", {
      userId: auth.userId,
      isAuthenticated: !!auth.userId,
      privateMetadata: auth.user?.privateMetadata,
      publicMetadata: auth.user?.publicMetadata,
      path: req.nextUrl.pathname
    })

    // Only block if explicitly not admin
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!auth.userId) {
        console.log("No user ID - redirecting")
        return Response.redirect(new URL("/sign-in", req.url))
      }
    }
  }
});
 
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};