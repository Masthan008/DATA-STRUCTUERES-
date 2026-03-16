import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Card, CardContent } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Save, Clock, Monitor, CheckCircle, Link, Copy, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const Settings = () => {
  const { admin } = useAdmin();
  const [localSettings, setLocalSettings] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Fetch settings directly — independent of AdminContext polling
  useEffect(() => {
    if (!admin?.id) return;
    api.getExamStatus(admin.id).then(data => {
      if (data && !data.error) {
        setLocalSettings({
          duration: Number(data.exam_duration) || 60,
          allowedDevice: data.allowed_device || 'desktop',
          evaluation_mode: data.evaluation_mode || 'auto',
        });
      }
    }).catch(console.error);
  }, [admin?.id]);

  const updateLocal = (patch) => setLocalSettings(prev => ({ ...prev, ...patch }));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const result = await api.updateSettings({
        admin_id: admin.id,
        exam_duration: localSettings.duration,
        allowed_device: localSettings.allowedDevice,
        evaluation_mode: localSettings.evaluation_mode || 'auto'
      });
      if (result.error) throw new Error(result.error);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const studentLink = admin ? `${window.location.origin}/student/login?admin=${admin.id}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(studentLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!localSettings) {
    return (
      <div className="p-8 flex items-center gap-2 text-slate-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Configure exam parameters and access rules</p>
      </div>

      {/* Shareable Student Link */}
      <Card>
        <CardContent className="p-6 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Link size={15} className="text-brand-primary" /> Student Login Link
          </h3>
          <p className="text-xs text-slate-500">Share this link with your students.</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-700 truncate">
              {studentLink}
            </div>
            <Button onClick={handleCopy} variant="outline" className="gap-1.5 shrink-0 h-10 text-xs">
              {copied ? <><CheckCircle size={13} className="text-emerald-500" /> Copied</> : <><Copy size={13} /> Copy</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-6">
          <h3 className="text-sm font-semibold text-slate-900">Exam Configuration</h3>

          <div className="grid grid-cols-2 gap-6">
            <Input
              icon={Clock}
              type="number"
              label="Duration (minutes)"
              value={localSettings.duration}
              onChange={e => updateLocal({ duration: Number(e.target.value) })}
            />

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Allowed Devices</label>
              <div className="relative">
                <Monitor size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all duration-200 shadow-sm hover:border-slate-300 appearance-none cursor-pointer"
                  value={localSettings.allowedDevice}
                  onChange={e => updateLocal({ allowedDevice: e.target.value })}
                >
                  <option value="desktop">Desktop Only</option>
                  <option value="mobile">Mobile Only</option>
                  <option value="both">Both (Desktop & Mobile)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Evaluation Mode</label>
              <div className="relative">
                <CheckCircle size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-all duration-200 shadow-sm hover:border-slate-300 appearance-none cursor-pointer"
                  value={localSettings.evaluation_mode}
                  onChange={e => updateLocal({ evaluation_mode: e.target.value })}
                >
                  <option value="auto">Automatic (GCC + Test Cases)</option>
                  <option value="manual">Manual (Admin reviews code)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              {saved && (
                <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
                  <CheckCircle size={16} /> Saved successfully
                </span>
              )}
              {error && (
                <span className="flex items-center gap-1.5 text-red-500 font-semibold text-sm">
                  <AlertCircle size={16} /> {error}
                </span>
              )}
            </div>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
