import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth';

export default function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const normalizedEmail = email.trim();
      await register({ name: name.trim(), email: normalizedEmail, password });
      try {
        await login({ email: normalizedEmail, password });
        navigate('/dashboard', { replace: true });
      } catch {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      const firstDetail = err.details?.[0]?.message;
      setError(firstDetail || err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-page">
      <h1 className="auth-brand">StudyFlow Pro</h1>
      <h2 className="auth-title">Đăng ký tài khoản</h2>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error ? (
          <p className="auth-error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="auth-field">
          <label htmlFor="name">Họ và tên</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nhập họ và tên"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Nhập email"
            disabled={isSubmitting}
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tối thiểu 8 ký tự"
            minLength={8}
            disabled={isSubmitting}
            required
          />
        </div>

        <button className="btn-primary auth-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>

        <p className="auth-switch">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </main>
  );
}
