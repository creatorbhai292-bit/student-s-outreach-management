/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Upload,
  HardDrive,
  FileCode,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  getSupabaseSQLSetupScript,
  uploadOptimizedImage,
  SUPABASE_STORAGE_BUCKET,
  saveManyDocumentsToSupabase,
} from '../lib/supabase';
import { STORES } from '../lib/db';

export const AdminSupabaseTab: React.FC = () => {
  const {
    students,
    submissions,
    pointRules,
    rankRules,
    pointHistory,
    featuredTitles,
    badges,
    certificates,
    notifications,
    auditLogs,
    settings,
    announcements,
    showToast,
  } = useApp();

  const [config, setConfig] = useState(getSupabaseConfig());
  const [inputUrl, setInputUrl] = useState(config.url);
  const [inputKey, setInputKey] = useState(config.anonKey);
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<string>('');

  // Image tester state
  const [testImageFile, setTestImageFile] = useState<File | null>(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<{
    url: string;
    sizeKB: number;
    originalSizeKB: number;
    isCloud: boolean;
  } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    const cur = getSupabaseConfig();
    setConfig(cur);
    setInputUrl(cur.url);
    setInputKey(cur.anonKey);
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim() || !inputKey.trim()) {
      showToast('Please provide both Supabase URL and Anon Key.', 'error');
      return;
    }

    saveSupabaseConfig(inputUrl.trim(), inputKey.trim());
    const updated = getSupabaseConfig();
    setConfig(updated);
    showToast('Supabase credentials saved successfully!', 'success');

    // Run automatic connection test
    handleTestConnection();
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    const updated = getSupabaseConfig();
    setConfig(updated);
    setInputUrl('');
    setInputKey('');
    setTestResult(null);
    showToast('Supabase connection cleared. Reverted to local storage.', 'info');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed',
      });
      showToast('Connection test failed', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const handleCopySql = () => {
    const sql = getSupabaseSQLSetupScript();
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    showToast('Supabase SQL setup script copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleSyncAllData = async () => {
    if (!config.isConfigured) {
      showToast('Configure and connect Supabase first before syncing data.', 'error');
      return;
    }

    setIsSyncing(true);
    setSyncProgress('Preparing institutional records...');

    try {
      setSyncProgress('Syncing student accounts...');
      if (students.length > 0) {
        await saveManyDocumentsToSupabase(STORES.STUDENTS, students);
      }

      setSyncProgress('Syncing activity submissions...');
      if (submissions.length > 0) {
        await saveManyDocumentsToSupabase(STORES.SUBMISSIONS, submissions);
      }

      setSyncProgress('Syncing point rules & rank criteria...');
      if (pointRules.length > 0) {
        await saveManyDocumentsToSupabase(STORES.POINT_RULES, pointRules);
      }
      if (rankRules.length > 0) {
        await saveManyDocumentsToSupabase(STORES.RANK_RULES, rankRules);
      }

      setSyncProgress('Syncing point history ledgers...');
      if (pointHistory.length > 0) {
        await saveManyDocumentsToSupabase(STORES.POINT_HISTORY, pointHistory);
      }

      setSyncProgress('Syncing featured titles & honors...');
      if (featuredTitles.length > 0) {
        await saveManyDocumentsToSupabase(STORES.FEATURED_TITLES, featuredTitles);
      }

      setSyncProgress('Syncing badges & certificates...');
      if (badges.length > 0) {
        await saveManyDocumentsToSupabase(STORES.BADGES, badges);
      }
      if (certificates.length > 0) {
        await saveManyDocumentsToSupabase(STORES.CERTIFICATES, certificates);
      }

      setSyncProgress('Syncing notifications & announcements...');
      if (notifications.length > 0) {
        await saveManyDocumentsToSupabase(STORES.NOTIFICATIONS, notifications);
      }
      if (announcements.length > 0) {
        await saveManyDocumentsToSupabase(STORES.ANNOUNCEMENTS, announcements);
      }

      setSyncProgress('Syncing institutional settings...');
      await saveManyDocumentsToSupabase(STORES.SETTINGS, [{ ...settings, id: 'main_settings' }]);

      showToast('All local data successfully synchronized to Supabase Cloud Database!', 'success');
      setSyncProgress('Complete! All records mirrored to Supabase.');
    } catch (err: any) {
      console.error('Sync error:', err);
      showToast(`Sync error: ${err.message || 'Check Supabase table structure'}`, 'error');
      setSyncProgress('Sync interrupted. Make sure tables are created using the SQL script.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTestImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setTestImageFile(file);
      setOptimizing(true);
      try {
        const res = await uploadOptimizedImage(file, 'test-sandbox');
        setOptimizedResult(res);
        showToast(
          `Image compressed to ${res.sizeKB} KB ${res.isCloud ? '& uploaded to Supabase Storage!' : '(Saved as 50-80KB URL)'}`,
          'success'
        );
      } catch (err: any) {
        showToast(`Image optimization error: ${err.message}`, 'error');
      } finally {
        setOptimizing(false);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Supabase Cloud Database & Storage</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  PostgreSQL + S3 Storage
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Persistent database backend, public media storage, and automatic 50 KB – 80 KB image compression engine.
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                config.isConfigured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  config.isConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              ></span>
              <span>{config.isConfigured ? 'Connected to Supabase' : 'Not Connected (Local Fallback)'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Credentials & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Credentials Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Supabase API Configuration</h2>
              <p className="text-xs text-slate-500">Provide your Supabase Project URL and Public Anon Key.</p>
            </div>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Supabase Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center justify-between">
                <span>Project URL (API Gateway)</span>
                <span className="text-[11px] text-slate-400 font-normal">e.g. https://your-ref.supabase.co</span>
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 flex items-center justify-between">
                <span>Public Anon Key (Client Access)</span>
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showKey ? 'Hide' : 'Reveal'}</span>
                </button>
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Save & Connect</span>
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || !config.isConfigured}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
              </button>

              {config.isConfigured && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 font-semibold cursor-pointer ml-auto"
                >
                  Clear / Disconnect
                </button>
              )}
            </div>
          </form>

          {/* Test connection result banner */}
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">{testResult.message}</p>
                {testResult.success && (
                  <p className="text-[11px] text-emerald-700">
                    Your application is securely communicating with Supabase PostgreSQL and Storage.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Storage & Specs Info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <HardDrive className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Storage & Compression Spec</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Storage Rule</span>
              <p className="font-bold text-slate-900">Strict 50 KB – 80 KB Compression</p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Every image uploaded (student avatar, certificates, activity photos) is automatically compressed to 50–80 KB in browser before upload.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">Storage Bucket</span>
              <p className="font-bold font-mono text-slate-900">{SUPABASE_STORAGE_BUCKET}</p>
              <p className="text-[11px] text-slate-500">
                Public access bucket for student proofs, certificates, and logos.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">URL Storage</span>
              <p className="font-bold text-slate-900">Direct Public HTTPS URLs</p>
              <p className="text-[11px] text-slate-500">
                Database records save clean public URLs, keeping table rows light and blazing fast.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 50-80 KB Image Compressor Live Sandbox */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Live 50 KB – 80 KB Image Compressor Sandbox</h2>
              <p className="text-xs text-slate-500">
                Test the compressor with any large image (e.g. 2MB - 10MB) to verify instant 50–80 KB optimization.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-bold">
            Target: 50 KB – 80 KB
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-purple-50/30">
              <Upload className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-xs font-bold text-slate-800">Choose Any Image File</span>
              <span className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, WebP up to 15MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleTestImageUpload}
                className="hidden"
              />
            </label>
            {optimizing && (
              <div className="mt-3 flex items-center gap-2 text-xs text-purple-700 font-semibold">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Compressing strictly to 50–80 KB and uploading...</span>
              </div>
            )}
          </div>

          {optimizedResult && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Optimization Result</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  {optimizedResult.sizeKB >= 50 && optimizedResult.sizeKB <= 80
                    ? 'Target 50-80 KB Met!'
                    : `${optimizedResult.sizeKB} KB`}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <p className="text-[10px] text-slate-400">Original</p>
                  <p className="font-bold text-slate-800">{optimizedResult.originalSizeKB} KB</p>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <p className="text-[10px] text-emerald-700 font-bold">Compressed</p>
                  <p className="font-bold text-emerald-800">{optimizedResult.sizeKB} KB</p>
                </div>
                <div className="p-2 rounded-xl bg-white border border-slate-200">
                  <p className="text-[10px] text-slate-400">Storage Saved</p>
                  <p className="font-bold text-blue-600">
                    {Math.max(0, Math.round(((optimizedResult.originalSizeKB - optimizedResult.sizeKB) / (optimizedResult.originalSizeKB || 1)) * 100))}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <img
                  src={optimizedResult.url}
                  alt="Optimized preview"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 shadow-2xs"
                />
                <div className="overflow-hidden space-y-1">
                  <p className="text-[11px] font-semibold text-slate-700 truncate">
                    {optimizedResult.isCloud ? 'Supabase Public Storage URL' : 'Optimized Data URL'}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{optimizedResult.url}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sync All Local Data to Supabase Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Synchronize Institutional Data to Supabase</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Push all existing students ({students.length}), submissions ({submissions.length}), point rules, certificates, and announcements into Supabase.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSyncAllData}
            disabled={isSyncing || !config.isConfigured}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing to Supabase...' : 'Sync All Data to Supabase'}</span>
          </button>
        </div>

        {syncProgress && (
          <p className="text-xs font-semibold text-blue-700 bg-blue-50 p-3 rounded-xl border border-blue-200">
            {syncProgress}
          </p>
        )}
      </div>

      {/* SQL Setup Script (1-Click Run in Supabase SQL Editor) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">1-Click Supabase SQL Setup Script</h2>
              <p className="text-xs text-slate-500">
                Run this in your Supabase SQL Editor to instantly create all tables and the '{SUPABASE_STORAGE_BUCKET}' storage bucket.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopySql}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer flex items-center gap-2 shadow-xs transition-colors"
          >
            {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSql ? 'Copied Script!' : 'Copy SQL Script'}</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-slate-300 font-mono text-[11px] max-h-56 overflow-y-auto border border-slate-800">
          <pre>{getSupabaseSQLSetupScript()}</pre>
        </div>
      </div>
    </div>
  );
};
