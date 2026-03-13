import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Save } from 'lucide-react';
import api from '../../utils/api';

const Settings = () => {
  const { examSettings, setExamSettings } = useAdmin();
  const [localSettings, setLocalSettings] = useState(examSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await api.updateSettings({
        exam_duration: localSettings.duration,
        allowed_device: localSettings.allowedDevice
      });
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
    setExamSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Exam Settings</h1>
        <p className="text-slate-500 mt-1">Configure global preferences for the coding environment.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security & Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 flex flex-col">
          <div className="grid grid-cols-2 gap-8 items-end">
            <Input 
              type="number" 
              label="Exam Duration (in minutes)" 
              value={localSettings.duration} 
              onChange={e => setLocalSettings({...localSettings, duration: Number(e.target.value)})}
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Allowed Devices</label>
              <select 
                className="flex h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary"
                value={localSettings.allowedDevice}
                onChange={e => setLocalSettings({...localSettings, allowedDevice: e.target.value})}
              >
                <option value="desktop">Desktop Only (Recommended)</option>
                <option value="mobile">Mobile Only</option>
                <option value="both">Both (Desktop & Mobile)</option>
              </select>
            </div>
          </div>
          
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            {saved ? <span className="text-emerald-600 font-medium text-sm">Settings saved successfully!</span> : <span />}
            <Button onClick={handleSave} className="gap-2">
              <Save size={18} /> Save Configurations
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
