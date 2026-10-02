import { redirect } from "next/navigation";
import { getAuthSession } from "@/auth";
import ProfileSettingsForm from "@/components/account/ProfileSettingsForm";

export default async function ProfilePage() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }

  return (
    <main className="px-4 py-4 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <ProfileSettingsForm user={session.user} />
      </div>
    </main>
  );
}
