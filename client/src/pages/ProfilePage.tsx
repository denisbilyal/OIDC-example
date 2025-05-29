import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  homeAddress?: string;
  workAddress?: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const [justLoggedIn, setJustLoggedIn] = useState(false);

useEffect(() => {
  const params = new URLSearchParams(location.search);
  const tokenFromUrl = params.get('token');

  if (tokenFromUrl) {
    localStorage.setItem('token', tokenFromUrl);
    setJustLoggedIn(true);
    navigate('/profile', { replace: true });
  }
}, [location, navigate]);

useEffect(() => {
  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    try {
      const res = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      localStorage.removeItem('token');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [navigate, justLoggedIn]); // добави justLoggedIn тук

  if (loading) return <p>Loading...</p>;

  if (!user) return <p>Потребител не е намерен.</p>;

  return (
    <div>
      <h2>Добре дошъл, {user.firstName} {user.lastName}</h2>
      <p><strong>Имейл:</strong> {user.email}</p>
      <p><strong>Име:</strong> {user.firstName}</p>
      <p><strong>Фамилия:</strong> {user.lastName}</p>
      <p><strong>Рождена дата:</strong> {user.birthDate || 'няма въведена'}</p>
      <p><strong>Домашен адрес:</strong> {user.homeAddress || 'няма въведен'}</p>
      <p><strong>Работен адрес:</strong> {user.workAddress || 'няма въведен'}</p>
      <button
        onClick={() => {
          localStorage.removeItem('token');
          navigate('/');
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default ProfilePage;
