'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import ParticleCanvas from '@/components/ParticleCanvas';
import Link from 'next/link';
import { Suspense } from 'react';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ display: 'block' }}>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.8 2.5 30.2 0 24 0 14.7 0 6.7 5.4 2.7 13.3l7.8 6.1C12.5 13 17.8 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/>
      <path fill="#FBBC05" d="M10.5 28.6A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.5 13.3A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8-6z"/>
      <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.2 0-11.5-4.2-13.4-9.9l-7.9 6.1C6.6 42.5 14.7 48 24 48z"/>
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'CredentialsSignin') {
      setErrorMsg('Invalid email or password.');
    } else if (error) {
      setErrorMsg(error);
    }
  }, [searchParams]);

  const handleCredentials = async () => {
    setLoading(true);
    setErrorMsg('');
    const res = await signIn('credentials', { 
      username: email, 
      password,
      redirect: false
    });

    if (res?.error) {
      setErrorMsg(res.error);
      setLoading(false);
    } else {
      router.push('/');
    }
  };

  const handleGoogle = async () => {
    setGLoading(true);
    await signIn('google');
    setGLoading(false);
  };

  return (
    <>
      <ParticleCanvas />

      <div className="login-root">
        <div className="card login-card">
          {/* Corner accents */}
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          {/* Logo */}
          <div className="logo-wrap" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', opacity: 0, animation: 'fadeUp 0.5s ease 0.35s forwards' }}>
            <div className="logo-hex" style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, #00ffb4, #00b4ff)', clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'hexSpin 8s linear infinite', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#030d14" strokeWidth="2.5" style={{ width: '18px', height: '18px' }}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="brand" style={{ fontFamily: "'Orbitron', monospace", fontSize: '15px', fontWeight: 800, letterSpacing: '0.04em', color: '#e0fff8', lineHeight: 1.2 }}>
              Web3 Fraud Detection
              <span style={{ display: 'block', fontSize: '10px', fontWeight: 400, letterSpacing: '0.15em', color: '#00ffb4', textTransform: 'uppercase' }}>Blockchain Security</span>
            </div>
          </div>

          <p className="tagline" style={{ fontSize: '12.5px', color: 'rgba(180, 220, 210, 0.45)', marginBottom: '24px', letterSpacing: '0.02em', opacity: 0, animation: 'fadeUp 0.5s ease 0.45s forwards' }}>Sign in to access your secure dashboard</p>

          {errorMsg && (
            <div style={{ color: '#ff4757', fontSize: '12px', textAlign: 'center', marginBottom: '12px', background: 'rgba(255, 71, 87, 0.1)', border: '1px solid rgba(255, 71, 87, 0.3)', borderRadius: '8px', padding: '8px', opacity: 0, animation: 'fadeUp 0.3s ease forwards' }}>
              {errorMsg}
            </div>
          )}

          {searchParams.get('registered') && (
            <div style={{ color: '#00ffb4', fontSize: '12px', textAlign: 'center', marginBottom: '12px', background: 'rgba(0, 255, 180, 0.1)', border: '1px solid rgba(0, 255, 180, 0.3)', borderRadius: '8px', padding: '8px', opacity: 0, animation: 'fadeUp 0.3s ease forwards' }}>
              Registration successful! Please sign in.
            </div>
          )}

          {/* Email */}
          <div className="form-group" style={{ '--delay': '0.5s' } as React.CSSProperties}>
            <label htmlFor="email">Email Address</label>
            <div className={`input-wrap ${focusedField === 'email' ? 'focused' : ''}`}>
              <input
                id="email"
                type="text"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group" style={{ '--delay': '0.58s' } as React.CSSProperties}>
            <label htmlFor="password">Password</label>
            <div className={`input-wrap ${focusedField === 'password' ? 'focused' : ''}`}>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                autoComplete="current-password"
              />
              <button
                type="button"
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,255,180,0.4)', display: 'flex', alignItems: 'center', padding: '4px' }}
                onClick={() => setShowPass((p) => !p)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Sign In */}
          <button
            className="btn-primary animated"
            onClick={handleCredentials}
            disabled={loading || gLoading}
          >
            {loading ? <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(3,13,20,0.4)', borderTopColor: '#030d14', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : 'Sign In'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0', opacity: 0, animation: 'fadeUp 0.5s ease 0.72s forwards' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,255,180,0.15), transparent)' }}></div>
            <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(180,220,210,0.3)' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,255,180,0.15), transparent)' }}></div>
          </div>

          {/* Google */}
          <button
            style={{ width: '100%', padding: '13px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 500, color: 'rgba(220,240,235,0.85)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'background 0.25s, border-color 0.25s, transform 0.2s, box-shadow 0.25s', opacity: 0, animation: 'fadeUp 0.5s ease 0.8s forwards' }}
            onClick={handleGoogle}
            disabled={loading || gLoading}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
          >
            {gLoading ? <span style={{ display: 'inline-block', width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> : <GoogleIcon />}
            Continue with Google
          </button>

          {/* Footer */}
          <p style={{ marginTop: '28px', textAlign: 'center', fontSize: '12px', color: 'rgba(180,220,210,0.45)', letterSpacing: '0.04em', opacity: 0, animation: 'fadeUp 0.5s ease 0.9s forwards' }}>
            Don't have an account? <Link href="/register" style={{ color: '#00ffb4', fontWeight: 500, textDecoration: 'none' }}>Register</Link>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', marginTop: '14px', opacity: 0, animation: 'fadeUp 0.5s ease 1s forwards' }}>
            <div style={{ fontSize: '9.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(0,255,180,0.35)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              256-bit SSL
            </div>
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(0,255,180,0.25)' }} />
            <div style={{ fontSize: '9.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(0,255,180,0.35)', display: 'flex', alignItems: 'center' }}>Zero-knowledge</div>
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(0,255,180,0.25)' }} />
            <div style={{ fontSize: '9.5px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(0,255,180,0.35)', display: 'flex', alignItems: 'center' }}>On-chain verified</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}