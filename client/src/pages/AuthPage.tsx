import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';
import GoogleLoginButton from '../components/GoogleLoginButton';
import './AuthPage.css'; // <-- добавяме стиловете

const AuthPage = () => {
  return (
    <div className="auth-container">
      <LoginForm />
      <RegisterForm />
      <GoogleLoginButton />
    </div>
  );
};

export default AuthPage;
