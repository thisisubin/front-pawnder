import React from 'react';
import LoginForm from '../components/Login/LoginForm';

function LoginPage({ user, onLoginSuccess }) {
    return <LoginForm user={user} onLoginSuccess={onLoginSuccess} />;
}

export default LoginPage;
