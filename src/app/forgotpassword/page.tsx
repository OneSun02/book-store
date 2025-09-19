import ForgotResetPasswordForm from "@/components/ForgotResetPasswordForm";

export const dynamic = "force-dynamic"; // quan trọng để Next.js không prerender

export default function ForgotPasswordPage() {
  return <ForgotResetPasswordForm />;
}
