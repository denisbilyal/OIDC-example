import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ProfilePage.css';

interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

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
  }, [navigate, justLoggedIn]);

  if (loading) return <p className="profile-loading">Зареждане...</p>;
  if (!user) return <p className="profile-error">Потребител не е намерен.</p>;

  return (
    <div className="profile-card">
      <h2 className="profile-title">Добре дошъл, {user.firstName} {user.lastName}</h2>
      <div className="profile-info">
        <p><strong>Имейл:</strong> {user.email}</p>
        <p><strong>Име:</strong> {user.firstName}</p>
        <p><strong>Фамилия:</strong> {user.lastName}</p>
      </div>
      <button
        className="profile-logout-button"
        onClick={() => {
          localStorage.removeItem('token');
          navigate('/');
        }}
      >
        Изход
      </button>
    </div>
  );
};

export default ProfilePage;
