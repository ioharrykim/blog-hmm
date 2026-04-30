"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminCookieName, adminSessionToken, isValidAdminLogin } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  if (!isValidAdminLogin(username, password)) {
    redirect("/admin/login?error=1");
  }

  (await cookies()).set(adminCookieName, adminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 24 * 14
  });

  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete(adminCookieName);
  redirect("/");
}
