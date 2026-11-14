"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm({ next, askName }: { next: string; askName: boolean }) {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      {askName && (
        <div>
          <label htmlFor="name" className="label">Your name</label>
          <input id="name" name="name" className="input" autoComplete="username" required />
        </div>
      )}
      <div>
        <label htmlFor="password" className="label">Password</label>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" required autoFocus={!askName} />
      </div>
      {state.error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">{state.error}</p>}
      <button className="btn-navy w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
