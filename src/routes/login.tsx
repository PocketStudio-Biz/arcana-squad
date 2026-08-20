import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main
      className="relative grid min-h-dvh place-items-center overflow-y-auto bg-void px-5 text-parchment"
      style={{
        paddingTop: "max(1.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <img
        src="/art/key.jpg"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/80 to-void" />
      <div className="relative w-full max-w-sm rounded-xl border border-line bg-panel/90 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <p className="font-display text-[11px] tracking-[0.42em] text-gold-dim">THE CIRCLE OPENS</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-wide text-gold">Sign in</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Save your name on the high-score board. Guests can still play.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                className="h-14 rounded-md border border-line bg-raised text-sm font-medium tracking-wide text-parchment active:border-gold-dim active:text-gold"
              >
                Continue with {p.label}
              </button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
        <Link
          to="/"
          className="mt-5 flex min-h-11 items-center justify-center text-sm text-muted underline-offset-4 hover:text-gold hover:underline"
        >
          Return to the temple
        </Link>
      </div>
    </main>
  );
}
