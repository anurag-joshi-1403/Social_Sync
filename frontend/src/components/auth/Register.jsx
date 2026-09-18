import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';

const FLOATING_EMOJIS = [
  // Rockets flying across
  { emoji: '🚀', top: '18%', left: '0%', delay: '0s', size: '2.5rem', anim: 'anim-rocket-right', duration: '15s' },
  { emoji: '🚀', top: '72%', left: '0%', delay: '6s', size: '2.2rem', anim: 'anim-rocket-right', duration: '18s' },
  { emoji: '🚀', top: '42%', left: '0%', delay: '3s', size: '2.3rem', anim: 'anim-rocket-left', duration: '16s' },

  // Drifting across
  { emoji: '🎯', top: '22%', left: '0%', delay: '1.5s', size: '1.9rem', anim: 'anim-drift', duration: '23s' },
  { emoji: '🌈', top: '60%', left: '0%', delay: '8s', size: '2rem', anim: 'anim-drift', duration: '26s' },
  { emoji: '💎', top: '50%', left: '0%', delay: '4s', size: '1.8rem', anim: 'anim-drift-reverse', duration: '24s' },
  { emoji: '🏆', top: '85%', left: '0%', delay: '12s', size: '2rem', anim: 'anim-drift-reverse', duration: '22s' },

  // Bobbing in place
  { emoji: '✨', top: '8%', left: '22%', delay: '0s', size: '1.9rem', anim: 'anim-float' },
  { emoji: '💡', top: '46%', left: '8%', delay: '1.5s', size: '1.8rem', anim: 'anim-float' },
  { emoji: '📈', top: '88%', left: '60%', delay: '2.1s', size: '1.8rem', anim: 'anim-float' },
];

const FLOATING_SOCIAL = [
  // Drifting across
  { icon: 'bi-instagram', top: '6%', left: '0%', delay: '0s', color: '#E1306C', size: '2.4rem', anim: 'anim-drift', duration: '21s' },
  { icon: 'bi-youtube', top: '78%', left: '0%', delay: '8s', color: '#FF0000', size: '2.3rem', anim: 'anim-drift', duration: '25s' },
  { icon: 'bi-pinterest', top: '38%', left: '0%', delay: '5s', color: '#E60023', size: '2rem', anim: 'anim-drift-reverse', duration: '22s' },
  { icon: 'bi-whatsapp', top: '88%', left: '0%', delay: '11s', color: '#25D366', size: '2.2rem', anim: 'anim-drift-reverse', duration: '23s' },

  // Bobbing in place
  { icon: 'bi-facebook', top: '26%', left: '88%', delay: '0.9s', color: '#1877F2', size: '2.2rem', anim: 'anim-float' },
  { icon: 'bi-twitter-x', top: '34%', left: '10%', delay: '1.6s', color: '#ffffff', size: '2rem', anim: 'anim-float' },
  { icon: 'bi-linkedin', top: '60%', left: '82%', delay: '0.6s', color: '#0A66C2', size: '2.2rem', anim: 'anim-float' },
  { icon: 'bi-tiktok', top: '18%', left: '20%', delay: '1.3s', color: '#ffffff', size: '2rem', anim: 'anim-float' },
  { icon: 'bi-threads', top: '84%', left: '48%', delay: '1.9s', color: '#ffffff', size: '2rem', anim: 'anim-float' },
  { icon: 'bi-snapchat', top: '10%', left: '55%', delay: '1.1s', color: '#FFFC00', size: '2rem', anim: 'anim-float' },
];

const Register = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    try {
      await registerUser(data.name, data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-page-register">
      <div className="auth-blob blob-1"></div>
      <div className="auth-blob blob-2"></div>
      <div className="auth-blob blob-3"></div>

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

      <div className="auth-card">
        <div className="text-center mb-4">
          <div className="auth-logo auth-logo-light justify-content-center">
            <i className="bi bi-broadcast me-2"></i>
            <span>SocialSync</span>
          </div>
        </div>

        <h2 className="auth-card-title text-center">Create your account ✨</h2>
        <p className="auth-card-subtitle text-center">
          Start posting smarter in under a minute.
        </p>

        {error && (
          <div className="alert alert-danger d-flex align-items-center py-2 small">
            <i className="bi bi-exclamation-circle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label className="auth-label">Full Name</label>
            <div className="auth-input-wrap">
              <i className="bi bi-person auth-input-icon"></i>
              <input
                type="text"
                className={`form-control auth-input ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Anurag Joshi"
                {...register('name', { required: 'Name is required' })}
              />
            </div>
            {errors.name && (
              <div className="text-warning small mt-1">
                <i className="bi bi-exclamation-circle me-1"></i>
                {errors.name.message}
              </div>
            )}
          </div>

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
                placeholder="At least 6 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters' },
                })}
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
                Creating account...
              </>
            ) : (
              <>
                Create account
                <i className="bi bi-arrow-right ms-2"></i>
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-4 auth-card-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;