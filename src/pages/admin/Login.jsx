import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { setAdminLoggedIn } = useAdmin();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (credentials.username === 'admin' && credentials.password === 'admin') {
      setAdminLoggedIn(true);
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials (use admin/admin)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-none shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <ShieldCheck size={32} className="text-brand-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Admin Portal</CardTitle>
          <p className="text-slate-500 text-sm mt-2">Sign in to manage the examination</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <Input
              label="Username"
              type="text"
              placeholder="Enter admin username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            />
            
            {error && <p className="text-sm text-red-500 font-medium text-center">{error}</p>}
            
            <Button type="submit" className="w-full mt-4 py-6 text-base">
              Secure Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
