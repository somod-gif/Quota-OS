import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/dashboard");
  }

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? "";
  const email = user.email ?? "";
  const initials = fullName
    ? fullName.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()
    : email.slice(0, 2).toUpperCase();
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Your account details</p>
      </div>
      <ProfileClient
        fullName={fullName}
        email={email}
        initials={initials}
        memberSince={memberSince}
        userId={user.id}
      />
    </div>
  );
}
