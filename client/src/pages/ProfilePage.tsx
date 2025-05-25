import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  address?: string;
  workAddress?: string;
  provider: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/');

      try {
        const res = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        alert('Invalid or expired token');
        localStorage.removeItem('token');
        navigate('/');
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h2>Welcome, {user.firstName || user.email}!</h2>
      <ul>
        <li>Email: {user.email}</li>
        <li>First Name: {user.firstName}</li>
        <li>Last Name: {user.lastName}</li>
        <li>Birth Date: {user.birthDate?.slice(0, 10)}</li>
        <li>Address: {user.address}</li>
        <li>Work Address: {user.workAddress}</li>
        <li>Provider: {user.provider}</li>
      </ul>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default ProfilePage;
