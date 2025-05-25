import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import GoogleLoginButton from '../components/GoogleLoginButton';

const AuthPage = () => {
  return (
    <div style={{ display: 'flex', gap: '2rem' }}>
      <LoginForm />
      <RegisterForm />
      <GoogleLoginButton />
    </div>
  );
};

export default AuthPage;
