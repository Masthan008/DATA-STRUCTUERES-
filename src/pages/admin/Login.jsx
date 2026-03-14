import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ShieldCheck, User, Lock, UserPlus, LogIn } from 'lucide-react';
import api from '../../utils/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { setAdmin } = useAdmin();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!credentials.username || !credentials.password) {
      setError('Username and password are required.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        if (credentials.password.length < 4) {
          setError('Password must be at least 4 characters.');
          setLoading(false);
          return;
        }
        await api.adminSignup(credentials.username, credentials.password);
        setSuccess('Account created! You can now sign in.');
        setMode('login');
        setCredentials({ ...credentials, password: '' });
      } else {
        const data = await api.adminLogin(credentials.username, credentials.password);
        setAdmin(data.admin);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-secondary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary via-slate-900 to-brand-secondary" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 w-full max-w-[420px] animate-slide-up">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-primary/30 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-1">
            {mode === 'login' ? 'Sign in to manage the examination' : 'Create a new admin account'}
          </p>
        </div>

        <Card className="shadow-2xl border-slate-700/50 bg-white">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'text-brand-primary border-b-2 border-brand-primary bg-blue-50/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LogIn size={16} /> Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                mode === 'signup'
                  ? 'text-brand-primary border-b-2 border-brand-primary bg-blue-50/50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserPlus size={16} /> Create Account
            </button>
          </div>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                icon={User}
                label="Username"
                type="text"
                placeholder={mode === 'signup' ? 'Choose a username' : 'Enter username'}
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
              <Input
                icon={Lock}
                label="Password"
                type="password"
                placeholder={mode === 'signup' ? 'Create a password (min 4 chars)' : 'Enter password'}
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
              
              {error && (
                <div className="bg-red-50 text-red-600 text-sm font-medium text-center p-2.5 rounded-lg border border-red-200">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-emerald-50 text-emerald-600 text-sm font-medium text-center p-2.5 rounded-lg border border-emerald-200">
                  {success}
                </div>
              )}
              
              <Button type="submit" disabled={loading} className="w-full h-11 text-sm mt-2">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'signup' ? 'Creating Account...' : 'Authenticating...'}
                  </span>
                ) : mode === 'signup' ? 'Create Admin Account →' : 'Secure Login →'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-slate-500 mt-4">
          {mode === 'login'
            ? "Don't have an account? Click \"Create Account\" above."
            : 'Credentials are securely hashed in the database.'
          }
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
