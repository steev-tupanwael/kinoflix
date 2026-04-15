import LoginForm from "@/components/login/form";
import { VersionBadge } from "@/components/versionbadge";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <LoginForm />
      <div className="absolute bottom-4 right-4">
        <VersionBadge />
      </div>
    </div>
  );
}
