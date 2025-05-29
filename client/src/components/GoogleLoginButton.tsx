import './GoogleLoginButton.css'; // използва споделен стил

const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <div className="login-form google-form">
      <h2 className="login-title">Вход с Google</h2>
      <button className="google-button" onClick={handleGoogleLogin}>
        Вход чрез Google
      </button>
    </div>
  );
};

export default GoogleLoginButton;
