import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../../context/ExamContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Navbar } from '../../components/Navbar';
import { detectDevice, isDeviceAllowed } from '../../utils/deviceDetection';
import { useAdmin } from '../../context/AdminContext';
import { MonitorX } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { loginStudent } = useExam();
  const { examSettings } = useAdmin();
  const [deviceAllowed, setDeviceAllowed] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    regNo: '',
    systemNo: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const currentDevice = detectDevice();
    if (!isDeviceAllowed(currentDevice, examSettings.allowedDevice)) {
      setDeviceAllowed(false);
    }
  }, [examSettings.allowedDevice]);

  if (!deviceAllowed) {
    return (
        <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4">
            <Card className="w-full max-w-md text-center p-8">
                <MonitorX size={48} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Device Not Allowed</h2>
                <p className="text-slate-600">Please use a {examSettings.allowedDevice} computer to access this exam.</p>
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
    
    const result = await loginStudent({ ...formData, device: detectDevice() });
    
    if (result?.error) {
      setError(result.error);
      return;
    }
    
    navigate('/student/waiting');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Student Verification</CardTitle>
            <p className="text-slate-500 text-sm mt-2">Enter your details to proceed to the exam</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <Input
                label="Full Name"
                placeholder="e.g., Jane Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Registration Number"
                placeholder="e.g., REG12345"
                value={formData.regNo}
                onChange={(e) => setFormData({ ...formData, regNo: e.target.value })}
              />
              <Input
                label="System Number"
                placeholder="e.g., LAB-01-PC14"
                value={formData.systemNo}
                onChange={(e) => setFormData({ ...formData, systemNo: e.target.value })}
              />
              
              {error && <p className="text-sm text-red-500 text-center font-medium">{error}</p>}
              
              <Button type="submit" className="w-full mt-4 text-base py-6">
                Enter Exam
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Login;
