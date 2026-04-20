'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ParticleCanvas from '@/components/ParticleCanvas';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { status } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') router.push('/dashboard');
  }, [status, router]);

  const handleRegister = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push('/login?registered=true');
      } else {
        const data = await res.json();
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #050b12;
          font-family: 'DM Sans', sans-serif;
        }

        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          padding: 24px;
        }

        .login-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,255,180,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(0,100,255,0.07) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: rgba(8, 18, 28, 0.85);
          border: 1px solid rgba(0, 255, 180, 0.18);
          border-radius: 20px;
          padding: 44px 40px 40px;
          backdrop-filter: blur(20px);
          box-shadow:
            0 0 0 1px rgba(0,255,180,0.05),
            0 0 60px rgba(0,255,180,0.06),
            0 24px 80px rgba(0,0,0,0.7);
          opacity: 0;
          transform: translateY(28px);
          animation: cardIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s forwards;
        }

        @keyframes cardIn {
          to { opacity: 1; transform: translateY(0); }
        }

        .card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 21px;
          background: linear-gradient(135deg, rgba(0,255,180,0.25), transparent 40%, rgba(0,100,255,0.15) 80%, transparent);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          padding: 1px;
          pointer-events: none;
          animation: borderGlow 4s ease-in-out infinite alternate;
        }

        @keyframes borderGlow {
          0%   { opacity: 0.5; }
          100% { opacity: 1; }
        }

        .logo-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          opacity: 0;
          animation: fadeUp 0.5s ease 0.35s forwards;
        }

        .logo-hex {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #00ffb4, #00b4ff);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex; align-items: center; justify-content: center;
          animation: hexSpin 8s linear infinite;
          flex-shrink: 0;
        }

        @keyframes hexSpin {
          0%   { filter: hue-rotate(0deg) drop-shadow(0 0 8px #00ffb4); }
          50%  { filter: hue-rotate(40deg) drop-shadow(0 0 14px #00b4ff); }
          100% { filter: hue-rotate(0deg) drop-shadow(0 0 8px #00ffb4); }
        }

        .logo-hex svg { width: 18px; height: 18px; }

        .brand {
          font-family: 'Orbitron', monospace;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: #e0fff8;
          line-height: 1.2;
        }

        .brand span {
          display: block;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: #00ffb4;
          text-transform: uppercase;
        }

        .tagline {
          font-size: 12.5px;
          color: rgba(180, 220, 210, 0.45);
          margin-bottom: 24px;
          letter-spacing: 0.02em;
          opacity: 0;
          animation: fadeUp 0.5s ease 0.45s forwards;
        }

        .form-group {
          margin-bottom: 18px;
          opacity: 0;
          animation: fadeUp 0.5s ease var(--delay, 0.5s) forwards;
        }

        label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(0,255,180,0.6);
          margin-bottom: 8px;
        }

        .input-wrap {
          position: relative;
        }

        .input-wrap input {
          width: 100%;
          background: rgba(0, 255, 180, 0.03);
          border: 1px solid rgba(0, 255, 180, 0.14);
          border-radius: 10px;
          padding: 13px 44px 13px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #d6f5ee;
          outline: none;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
          caret-color: #00ffb4;
        }

        .input-wrap input::placeholder { color: rgba(180,220,210,0.25); }

        .input-wrap input:focus {
          border-color: rgba(0,255,180,0.55);
          background: rgba(0,255,180,0.06);
          box-shadow: 0 0 0 3px rgba(0,255,180,0.08), 0 0 18px rgba(0,255,180,0.06);
        }

        .input-wrap::after {
          content: '';
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          bottom: 0;
          border-radius: 0 0 10px 10px;
          background: linear-gradient(90deg, transparent, #00ffb4, transparent);
          opacity: 0;
          transform: scaleX(0);
          transition: opacity 0.25s, transform 0.35s cubic-bezier(0.22,1,0.36,1);
        }

        .input-wrap.focused::after {
          opacity: 1;
          transform: scaleX(1);
        }

        .eye-btn {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(0,255,180,0.4);
          display: flex; align-items: center;
          transition: color 0.2s;
          padding: 4px;
        }
        .eye-btn:hover { color: #00ffb4; }

        .btn-primary {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #00d496, #00a8e8);
          border: none;
          border-radius: 10px;
          font-family: 'Orbitron', monospace;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: #030d14;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 24px rgba(0,212,150,0.3);
          opacity: 0;
          animation: fadeUp 0.5s ease 0.65s forwards;
          margin-top: 10px;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent 60%);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,212,150,0.45);
        }
        .btn-primary:hover::before { opacity: 1; }
        .btn-primary:active:not(:disabled) { transform: translateY(0); }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .btn-primary::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 2.5s infinite;
        }

        @keyframes shimmer {
          0%   { left: -60%; }
          100% { left: 160%; }
        }

        .footer-note {
          margin-top: 28px;
          text-align: center;
          font-size: 12px;
          color: rgba(180,220,210,0.45);
          letter-spacing: 0.04em;
          opacity: 0;
          animation: fadeUp 0.5s ease 0.9s forwards;
        }

        .footer-note a {
          color: #00ffb4;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-note a:hover { color: #fff; text-shadow: 0 0 8px #00ffb4; }

        .spinner {
          display: inline-block;
          width: 14px; height: 14px;
          border: 2px solid rgba(3,13,20,0.4);
          border-top-color: #030d14;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .corner {
          position: absolute;
          width: 16px; height: 16px;
          border-color: rgba(0,255,180,0.4);
          border-style: solid;
        }
        .corner-tl { top: 10px; left: 10px; border-width: 2px 0 0 2px; border-radius: 3px 0 0 0; }
        .corner-tr { top: 10px; right: 10px; border-width: 2px 2px 0 0; border-radius: 0 3px 0 0; }
        .corner-bl { bottom: 10px; left: 10px; border-width: 0 0 2px 2px; border-radius: 0 0 0 3px; }
        .corner-br { bottom: 10px; right: 10px; border-width: 0 2px 2px 0; border-radius: 0 0 3px 0; }

        .error-msg {
          color: #ff4757;
          font-size: 12px;
          text-align: center;
          margin-bottom: 12px;
          background: rgba(255, 71, 87, 0.1);
          border: 1px solid rgba(255, 71, 87, 0.3);
          border-radius: 8px;
          padding: 8px;
        }
      `}</style>

      <ParticleCanvas />

      <div className="login-root">
        <div className="card">
          <div className="corner corner-tl" />
          <div className="corner corner-tr" />
          <div className="corner corner-bl" />
          <div className="corner corner-br" />

          <div className="logo-wrap">
            <div className="logo-hex">
              <svg viewBox="0 0 24 24" fill="none" stroke="#030d14" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div className="brand">
              Web3 Fraud Detection
              <span>Register Account</span>
            </div>
          </div>

          <p className="tagline">Create an account to access the dashboard</p>

          {error && <div className="error-msg">{error}</div>}

          <div className="form-group" style={{ '--delay': '0.5s' } as React.CSSProperties}>
            <label htmlFor="name">Full Name</label>
            <div className={`input-wrap ${focusedField === 'name' ? 'focused' : ''}`}>
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          <div className="form-group" style={{ '--delay': '0.55s' } as React.CSSProperties}>
            <label htmlFor="email">Email Address</label>
            <div className={`input-wrap ${focusedField === 'email' ? 'focused' : ''}`}>
              <input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </div>
          </div>

          <div className="form-group" style={{ '--delay': '0.6s' } as React.CSSProperties}>
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
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPass((p) => !p)}
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

          <button
            className="btn-primary"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : 'Register'}
          </button>

          <p className="footer-note">
            Already have an account? <Link href="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </>
  );
}
