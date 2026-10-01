import Link from "next/link";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { AuthSplit } from "@/components/auth/AuthSplit";

export default function BlockedPage() {
  return (
    <AuthSplit
      title="That email is not on the list"
      subtitle="Notify is a closed planner for one small group of students."
    >
      <div className="flex flex-col gap-4 text-base text-muted">
        <p>
          Notify has no open signup. Only addresses on the guest list can sign in,
          so nothing you entered was saved.
        </p>
        <p>What to do next:</p>
        <ul className="flex list-disc flex-col gap-2 pl-5">
          <li>Ask whoever invited you to add your address to the list.</li>
          <li>Try the same address again once they confirm.</li>
          <li>
            Signed in with the wrong address?{" "}
            <Link
              href="/login"
              className="font-medium text-ink underline underline-offset-2"
            >
              Back to sign in
            </Link>
            .
          </li>
        </ul>
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-input border border-line bg-surface px-4 py-3">
        <EnvelopeSimple size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden />
        <p className="text-sm text-muted">
          If you think you are already on the list, check the spelling of the
          address. Notify matches the address exactly.
        </p>
      </div>
    </AuthSplit>
  );
}
