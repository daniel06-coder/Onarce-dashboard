import { adminAuth } from "@/lib/firebaseAdmin";

export async function verifyAdminRequest(req) {
  const authorization = req.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return { authorized: false, status: 401 };
  }

  if (!process.env.ADMIN_UID) {
    console.error("ADMIN_UID is missing from environment variables");
    return { authorized: false, status: 500 };
  }

  try {
    const token = authorization.slice(7);

    const decodedToken = await adminAuth.verifyIdToken(token, true);

    if (decodedToken.uid !== process.env.ADMIN_UID) {
      return { authorized: false, status: 403 };
    }

    return { authorized: true };
  } catch (error) {
    console.error("Admin authentication failed:", error.message);

    return { authorized: false, status: 401 };
  }
}
