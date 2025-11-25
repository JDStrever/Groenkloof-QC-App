import React, { useState } from 'react';
import Card from './ui/Card';
import Input from './ui/Input';
import Label from './ui/Label';
import Button from './ui/Button';

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim() && password.trim()) {
      onLogin(username, password);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Login</h2>
          <p className="text-slate-500 mt-2">Please sign in to access the Frutia QC App.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <div className="pt-4">
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;