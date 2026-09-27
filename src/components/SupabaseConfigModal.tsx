import React, { useState } from 'react';
import { X, Database, CheckCircle2, Copy, ExternalLink, RefreshCw, Key } from 'lucide-react';
import { getSavedSupabaseConfig, saveSupabaseConfig, SUPABASE_SQL_SCHEMA } from '../lib/supabase';
import { triggerHaptic, playSound } from '../utils/feedback';

interface SupabaseConfigModalProps {
  onClose: () => void;
  onConfigSaved: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({
  onClose,
  onConfigSaved,
}) => {
  const current = getSavedSupabaseConfig();
  const [url, setUrl] = useState(current.url);
  const [anonKey, setAnonKey] = useState(current.anonKey);
  const [copied, setCopied] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    playSound('ding');
    saveSupabaseConfig(url.trim(), anonKey.trim());
    setStatusMsg('Settings updated! Connected to data store.');
    setTimeout(() => {
      onConfigSaved();
      onClose();
    }, 500);
  };

  const handleCopySchema = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetToLocal = () => {
    triggerHaptic('light');
    setUrl('');
    setAnonKey('');
    saveSupabaseConfig('', '');
    setStatusMsg('Reset to built-in reactive local database.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 text-xs"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm">Supabase Backend & Database</h3>
              <p className="text-[11px] text-stone-400">Configure cloud persistence or use live local store</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1 rounded-full text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
          {/* Active Status Badge */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">
                {current.isConnected ? 'Connected to Cloud Supabase' : 'Running on Live Reactive Local Storage'}
              </span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                {current.isConnected
                  ? 'All bookings and worker updates sync with your remote Supabase PostgreSQL tables.'
                  : 'Out-of-the-box zero setup mode active. Real-time updates sync across tabs seamlessly with preloaded Melattur workers.'}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1 uppercase tracking-wider text-[10px]">
                Supabase Project URL (Optional)
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://xyzproject.supabase.co"
                className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#FF5722]"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1 uppercase tracking-wider text-[10px]">
                Supabase Anon / Public API Key
              </label>
              <input
                type="text"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full text-xs font-mono px-3 py-2 rounded-xl border border-stone-300 focus:outline-none focus:border-[#FF5722]"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 bg-[#FF5722] hover:bg-[#F4511E] text-white py-2.5 rounded-xl font-bold active:scale-98 transition shadow-xs"
              >
                Save Credentials
              </button>
              <button
                type="button"
                onClick={handleResetToLocal}
                className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold active:scale-98 transition"
              >
                Use Local
              </button>
            </div>
          </form>

          {statusMsg && (
            <p className="text-[11px] font-bold text-emerald-600 text-center animate-fade-in">
              {statusMsg}
            </p>
          )}

          {/* SQL Schema Script helper */}
          <div className="pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-stone-800 uppercase tracking-wider text-[10px]">
                Supabase Database Setup SQL
              </span>
              <button
                onClick={handleCopySchema}
                className="flex items-center gap-1 text-[#FF5722] font-bold hover:underline"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied!' : 'Copy SQL Script'}</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-500 mb-2">
              Paste this in your Supabase SQL Editor to create the `workers`, `bookings`, and `notifications` tables.
            </p>
            <pre className="p-3 bg-stone-900 text-stone-200 rounded-xl text-[10px] font-mono overflow-x-auto max-h-36 no-scrollbar">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
