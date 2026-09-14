import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

// Floating emojis — mix of stationary (bob) + drifting + rockets flying across
const FLOATING_EMOJIS = [
  // Rockets flying across (left → right, right → left)
  { emoji: '🚀', top: '12%', left: '0%', delay: '0s', size: '2.6rem', anim: 'anim-rocket-right', duration: '14s' },
  { emoji: '🚀', top: '68%', left: '0%', delay: '5s', size: '2.2rem', anim: 'anim-rocket-right', duration: '17s' },
  { emoji: '🚀', top: '35%', left: '0%', delay: '2s', size: '2.3rem', anim: 'anim-rocket-left', duration: '16s' },
  { emoji: '🚀', top: '80%', left: '0%', delay: '9s', size: '1.9rem', anim: 'anim-rocket-left', duration: '19s' },

  // Drifting across full screen
  { emoji: '🎉', top: '20%', left: '0%', delay: '1s', size: '2rem', anim: 'anim-drift', duration: '22s' },
  { emoji: '🌟', top: '55%', left: '0%', delay: '6s', size: '1.7rem', anim: 'anim-drift', duration: '24s' },
  { emoji: '🔥', top: '45%', left: '0%', delay: '3s', size: '1.8rem', anim: 'anim-drift-reverse', duration: '23s' },
  { emoji: '💫', top: '85%', left: '0%', delay: '11s', size: '1.9rem', anim: 'anim-drift-reverse', duration: '25s' },

  // Bobbing in place
  { emoji: '✨', top: '6%', left: '18%', delay: '0s', size: '1.8rem', anim: 'anim-float' },
  { emoji: '💬', top: '38%', left: '6%', delay: '0.3s', size: '1.9rem', anim: 'anim-float' },
  { emoji: '❤️', top: '68%', left: '12%', delay: '1.8s', size: '2rem', anim: 'anim-float' },
  { emoji: '💡', top: '88%', left: '60%', delay: '1.4s', size: '1.8rem', anim: 'anim-float' },
];

// Floating social icons
const FLOATING_SOCIAL = [
  // Drifting across (full screen)
  { icon: 'bi-instagram', top: '6%', left: '0%', delay: '0s', color: '#E1306C', size: '2.4rem', anim: 'anim-drift', duration: '20s' },
  { icon: 'bi-youtube', top: '75%', left: '0%', delay: '7s', color: '#FF0000', size: '2.3rem', anim: 'anim-drift', duration: '26s' },
  { icon: 'bi-pinterest', top: '30%', left: '0%', delay: '4s', color: '#E60023', size: '2rem', anim: 'anim-drift-reverse', duration: '22s' },
  { icon: 'bi-whatsapp', top: '88%', left: '0%', delay: '10s', color: '#25D366', size: '2.2rem', anim: 'anim-drift-reverse', duration: '24s' },

  // Bobbing in place
  { icon: 'bi-facebook', top: '22%', left: '88%', delay: '0.9s', color: '#1877F2', size: '2.4rem', anim: 'anim-float' },
  { icon: 'bi-twitter-x', top: '32%', left: '10%', delay: '1.6s', color: '#ffffff', size: '2rem', anim: 'anim-float' },
  { icon: 'bi-linkedin', top: '58%', left: '82%', delay: '0.6s', color: '#0A66C2', size: '2.3rem', anim: 'anim-float' },
  { icon: 'bi-tiktok', top: '20%', left: '24%', delay: '1.3s', color: '#ffffff', size: '2rem', anim: 'anim-float' },
  { icon: 'bi-threads', top: '82%', left: '50%', delay: '1.9s', color: '#ffffff', size: '2rem', anim: 'anim-float' },
  { icon: 'bi-snapchat', top: '12%', left: '58%', delay: '1.1s', color: '#FFFC00', size: '2rem', anim: 'anim-float' },
];

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const onSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      // err.message comes from authService (already human-readable)
      setError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background blobs */}
      <div className="auth-blob blob-1"></div>
      <div className="auth-blob blob-2"></div>
      <div className="auth-blob blob-3"></div>

      {/* Floating emojis + rockets */}
      {FLOATING_EMOJIS.map((item, i) => (
        <span
          key={`e-${i}`}
          className={`floating-emoji ${item.anim}`}
          style={{
            top: item.top,
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
            fontSize: item.size,
          }}
        >
          {item.emoji}
        </span>
      ))}

      {/* Floating social icons */}
      {FLOATING_SOCIAL.map((item, i) => (
        <i
          key={`s-${i}`}
          className={`bi ${item.icon} floating-social ${item.anim}`}
          style={{
            top: item.top,
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
            color: item.color,
            fontSize: item.size,
          }}
        ></i>
      ))}

      {/* Glass card */}
      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="auth-logo auth-logo-light justify-content-center">
            <i className="bi bi-broadcast me-2"></i>
            <span>SocialSync</span>
          </div>
        </div>

        <h2 className="auth-card-title text-center">Welcome back 👋</h2>
        <p className="auth-card-subtitle text-center">
          Log in to continue to your dashboard.
        </p>

        {error && (
          <div className="alert alert-danger d-flex align-items-center py-2 small">
            <i className="bi bi-exclamation-circle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label className="auth-label">Email</label>
            <div className="auth-input-wrap">
              <i className="bi bi-envelope auth-input-icon"></i>
              <input
                type="email"
                className={`form-control auth-input ${errors.email ? 'is-invalid' : ''}`}
                placeholder="you@example.com"
                {...register('email', { required: 'Email is required' })}
              />
            </div>
            {errors.email && (
              <div className="text-warning small mt-1">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.email.message}
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <i className="bi bi-lock auth-input-icon"></i>
              <input
                type="password"
                className={`form-control auth-input ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter your password"
                {...register('password', { required: 'Password is required' })}
              />
            </div>
            {errors.password && (
              <div className="text-warning small mt-1">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.password.message}
              </div>
            )}
          </div>

          <button type="submit" className="btn auth-submit-btn w-100" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Logging in...
              </>
            ) : (
              <>
                Log in
                <i className="bi bi-arrow-right ms-2"></i>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 auth-card-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;