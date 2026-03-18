import { useState } from 'react';

type Props = {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
  onClose: () => void;
};

export function AuthModal({ onSignIn, onSignUp, onClose }: Props) {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'signin') {
        await onSignIn(email, password);
        onClose();
      } else {
        await onSignUp(email, password);
        setSignUpSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-backdrop" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>
        <h2 className="auth-modal-title">
          {tab === 'signin' ? 'Sign In' : 'Sign Up'}
        </h2>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'signin' ? 'active' : ''}`}
            onClick={() => { setTab('signin'); setError(''); setSignUpSuccess(false); }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => { setTab('signup'); setError(''); setSignUpSuccess(false); }}
          >
            Sign Up
          </button>
        </div>

        {signUpSuccess ? (
          <div className="auth-success">
            Check your email to confirm your account, then sign in.
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {error && <div className="auth-error">{error}</div>}
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Loading...' : tab === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
