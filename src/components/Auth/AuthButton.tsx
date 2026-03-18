import type { User } from '@supabase/supabase-js';

type Props = {
  user: User | null;
  onSignInClick: () => void;
  onSignOut: () => void;
};

export function AuthButton({ user, onSignInClick, onSignOut }: Props) {
  if (user) {
    return (
      <div className="auth-button auth-signed-in">
        <span className="auth-email" title={user.email}>{user.email}</span>
        <button className="auth-sign-out" onClick={onSignOut}>Sign Out</button>
      </div>
    );
  }

  return (
    <button className="auth-button auth-sign-in" onClick={onSignInClick}>
      Sign In
    </button>
  );
}
