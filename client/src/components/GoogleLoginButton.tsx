import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: any) => {
    const idToken = credentialResponse.credential;
    if (!idToken) return alert('No Google ID token received.');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/google', {
        idToken,
      });

      localStorage.setItem('token', res.data.token);
      navigate('/profile');
    } catch (error) {
      alert('Google login failed.');
    }
  };

  return (
    <div>
      <h2>Or login with Google</h2>
      <GoogleLogin onSuccess={handleSuccess} onError={() => alert('Google login error')} />
    </div>
  );
};

export default GoogleLoginButton;
