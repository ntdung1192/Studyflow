import { useState } from 'react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Register:', { name, email, password });
  };

  return (
    <main>
      <h1>StudyFlow Pro</h1>
      <h2>Đăng ký tài khoản</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Họ và tên</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nhập họ và tên"
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Nhập email"
            required
          />
        </div>

        <div>
          <label htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tạo mật khẩu"
            minLength={8}
            required
          />
        </div>

        <button type="submit">Đăng ký</button>
      </form>
    </main>
  );
}
