import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegisterForm.css'; // използваме един и същ CSS или отделен, ако искаш

const RegisterForm = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);
      localStorage.setItem('token', res.data.token);
      navigate('/profile');
    } catch (err) {
      alert('Регистрацията не бе успешна.');
    }
  };

  return (
    <form className="login-form" onSubmit={handleRegister}>
      <h2 className="login-title">Регистрация</h2>

      <input
        className="login-input"
        name="email"
        placeholder="Email"
        type="email"
        onChange={handleChange}
        required
      />

      <input
        className="login-input"
        name="password"
        placeholder="Парола"
        type="password"
        onChange={handleChange}
        required
      />

      <input
        className="login-input"
        name="firstName"
        placeholder="Име"
        onChange={handleChange}
        required
      />

      <input
        className="login-input"
        name="lastName"
        placeholder="Фамилия"
        onChange={handleChange}
        required
      />

      <button className="login-button" type="submit">
        Регистрация
      </button>
    </form>
  );
};

export default RegisterForm;
