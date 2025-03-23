// types.d.ts
import "@clerk/nextjs";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: "admin" | "user";
    };
  }
}