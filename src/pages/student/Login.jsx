import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useExam } from '../../context/ExamContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Navbar } from '../../components/Navbar';
import { detectDevice, isDeviceAllowed } from '../../utils/deviceDetection';
import api from '../../utils/api';
import { MonitorX, User, Hash, Monitor, Code2 } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const adminId = searchParams.get('admin');
  const { loginStudent } = useExam();
  const [deviceAllowed, setDeviceAllowed] = useState(true);
  const [allowedDevice, setAllowedDevice] = useState('desktop');

  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
    systemNo: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch exam settings directly — don't rely on AdminContext (admin may not be logged in)
    api.getExamStatus(adminId).then(data => {
      if (data && !data.error && data.allowed_device) {
        setAllowedDevice(data.allowed_device);
        const currentDevice = detectDevice();
        if (!isDeviceAllowed(currentDevice, data.allowed_device)) {
          setDeviceAllowed(false);
        } else {
          setDeviceAllowed(true);
        }
      }
    }).catch(() => {});
  }, [adminId]);

  if (!deviceAllowed) {
    return (
      <div className="min-h-screen bg-brand-bg dot-pattern flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center p-8 animate-scale-in">
          <MonitorX size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Device Not Allowed</h2>
          <p className="text-slate-500">Please use a <span className="font-semibold text-slate-700">{allowedDevice}</span> device to access this exam.</p>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.regNo || !formData.systemNo) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setLoading(true);
    const result = await loginStudent({ ...formData, device: detectDevice() });
    
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    navigate('/student/waiting');
  };

  return (
    <div className="min-h-screen bg-brand-bg dot-pattern flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] animate-slide-up">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-brand-primary/20 overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Secure Exam Portal</h1>
            <p className="text-slate-500 text-sm mt-1">Student Verification</p>
          </div>

          <Card className="shadow-elevated">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  icon={User}
                  label="Full Name"
                  placeholder="e.g., Jane Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  icon={Hash}
                  label="Registration Number"
                  placeholder="e.g., REG12345"
                  value={formData.regNo}
                  onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
                />
                <Input
                  icon={Monitor}
                  label="System Number"
                  placeholder="e.g., LAB-01-PC14"
                  value={formData.systemNo}
                  onChange={(e) => setFormData({ ...formData, systemNo: e.target.value })}
                />
                
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm font-medium text-center p-2.5 rounded-lg border border-red-200">
                    {error}
                  </div>
                )}
                
                <Button type="submit" disabled={loading} className="w-full h-11 text-sm mt-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Verifying...
                    </span>
                  ) : 'Enter Exam →'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-slate-400 mt-4">
            Secure platform • Anti-cheat enabled • Proctored session
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
