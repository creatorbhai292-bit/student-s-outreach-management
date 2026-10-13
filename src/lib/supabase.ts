/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { optimizeImageTo50to80KB, OptimizedImageResult } from './imageOptimizer';

export const SUPABASE_STORAGE_BUCKET = 'soms-media';

// Table names mapping in Supabase Postgres
export const TABLE_MAP = {
  students: 'students',
  submissions: 'submissions',
  pointRules: 'point_rules',
  rankRules: 'rank_rules',
  pointHistory: 'point_history',
  featuredTitles: 'featured_titles',
  badges: 'badges',
  certificates: 'certificates',
  notifications: 'notifications',
  auditLogs: 'audit_logs',
  settings: 'app_settings',
  announcements: 'announcements',
} as const;

export type MappedTableName = keyof typeof TABLE_MAP;

let supabaseInstance: SupabaseClient | null = null;

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConfigured: boolean;
}

/**
 * Retrieves Supabase credentials from environment or localStorage override
 */
export function getSupabaseConfig(): SupabaseConfig {
  let url = '';
  let anonKey = '';

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      url = localStorage.getItem('soms_supabase_url') || '';
      anonKey = localStorage.getItem('soms_supabase_key') || '';
    }
  } catch {
    // ignore
  }

  // Fallback to Vite environment variables if not set in localStorage
  const metaEnv = (import.meta as any).env || {};
  if (!url) {
    url = (metaEnv.VITE_SUPABASE_URL as string) || '';
  }
  if (!anonKey) {
    anonKey = (metaEnv.VITE_SUPABASE_ANON_KEY as string) || '';
  }

  // Normalize
  url = url.trim();
  anonKey = anonKey.trim();

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.startsWith('http') &&
    anonKey.length > 10 &&
    !url.includes('your-project')
  );

  return {
    url,
    anonKey,
    isConfigured,
  };
}

/**
 * Saves Supabase credentials into localStorage and resets client
 */
export function saveSupabaseConfig(url: string, anonKey: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('soms_supabase_url', url.trim());
      localStorage.setItem('soms_supabase_key', anonKey.trim());
    }
  } catch {
    // ignore
  }
  supabaseInstance = null;
}

/**
 * Clears saved Supabase credentials
 */
export function clearSupabaseConfig(): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('soms_supabase_url');
      localStorage.removeItem('soms_supabase_key');
    }
  } catch {
    // ignore
  }
  supabaseInstance = null;
}

/**
 * Returns the active Supabase client singleton
 */
export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.isConfigured) return null;

  if (supabaseInstance) return supabaseInstance;

  try {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return supabaseInstance;
  } catch (err) {
    console.error('[Supabase] Failed to initialize client:', err);
    return null;
  }
}

export function isSupabaseConnected(): boolean {
  return !!getSupabaseClient();
}

/**
 * Test connectivity with Supabase
 */
export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase URL or Anon Key is missing or invalid. Please configure credentials.',
    };
  }

  try {
    // Try pinging the database with a lightweight query
    const { data, error } = await supabase
      .from('students')
      .select('id')
      .limit(1);

    if (error) {
      // Check if table missing error (PGRST204 or 42P01)
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Connected to Supabase project! (Note: Tables not created yet. Use the SQL setup script).',
          details: error,
        };
      }
      return {
        success: false,
        message: `Supabase query failed: ${error.message} (Code: ${error.code})`,
        details: error,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase Database & Project!',
      details: data,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection error: ${err.message || err}`,
      details: err,
    };
  }
}

/**
 * Uploads an image to Supabase Storage with STRICT 50 KB - 80 KB compression.
 * If storage upload succeeds, returns the permanent public HTTPS URL.
 * If Supabase is not connected or bucket fails, returns the optimized 50-80KB data URL.
 */
export async function uploadOptimizedImage(
  fileOrData: File | Blob | string,
  folder = 'uploads'
): Promise<{
  url: string;
  sizeKB: number;
  originalSizeKB: number;
  isCloud: boolean;
}> {
  // 1. Strict 50KB - 80KB compression
  const optimized: OptimizedImageResult = await optimizeImageTo50to80KB(
    fileOrData,
    50, // min 50 KB
    80  // max 80 KB
  );

  const supabase = getSupabaseClient();
  if (!supabase) {
    // Return compressed dataUrl (takes minimal ~50-80KB)
    return {
      url: optimized.dataUrl,
      sizeKB: optimized.sizeKB,
      originalSizeKB: optimized.originalSizeKB,
      isCloud: false,
    };
  }

  try {
    // 2. Upload compressed blob to Supabase Storage
    const timestamp = Date.now();
    const rand = Math.random().toString(36).substring(2, 9);
    const fileName = `${folder}/${timestamp}_${rand}.jpg`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .upload(fileName, optimized.blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      console.warn('[Supabase Storage] Upload error, falling back to optimized data URL:', uploadError.message);
      return {
        url: optimized.dataUrl,
        sizeKB: optimized.sizeKB,
        originalSizeKB: optimized.originalSizeKB,
        isCloud: false,
      };
    }

    // 3. Retrieve Supabase Public HTTPS URL
    const { data: publicUrlData } = supabase.storage
      .from(SUPABASE_STORAGE_BUCKET)
      .getPublicUrl(uploadData.path || fileName);

    return {
      url: publicUrlData.publicUrl,
      sizeKB: optimized.sizeKB,
      originalSizeKB: optimized.originalSizeKB,
      isCloud: true,
    };
  } catch (err) {
    console.warn('[Supabase Storage] Unexpected error:', err);
    return {
      url: optimized.dataUrl,
      sizeKB: optimized.sizeKB,
      originalSizeKB: optimized.originalSizeKB,
      isCloud: false,
    };
  }
}

/**
 * Fetch all records for a collection from Supabase
 */
export async function fetchCollectionFromSupabase<T extends { id: string }>(
  storeName: string
): Promise<T[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const tableName = TABLE_MAP[storeName as MappedTableName] || storeName;

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.warn(`[Supabase] Fetch error for table "${tableName}":`, error.message);
      return null;
    }

    if (!data) return [];

    // Map rows: if row has a 'data' json column or direct columns
    return data.map((row: any) => {
      // If schema stored full object inside data column or direct columns
      if (row.payload && typeof row.payload === 'object') {
        return { ...row.payload, id: row.id };
      }
      return row as T;
    });
  } catch (err) {
    console.warn(`[Supabase] Exception fetching table "${tableName}":`, err);
    return null;
  }
}

/**
 * Upsert a single document into Supabase
 */
export async function saveDocumentToSupabase<T extends { id: string }>(
  storeName: string,
  item: T
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const tableName = TABLE_MAP[storeName as MappedTableName] || storeName;

  try {
    // We store using dual approach: both direct columns and payload JSON fallback
    // so any table structure created in Supabase will work seamlessly!
    const rowData: Record<string, any> = {
      ...item,
      id: item.id,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from(tableName)
      .upsert(rowData, { onConflict: 'id' });

    if (error) {
      // Try fallback with id + payload structure if schema is generic
      if (error.code === '42703' || error.message.includes('column')) {
        const { error: genericErr } = await supabase
          .from(tableName)
          .upsert({
            id: item.id,
            payload: item,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'id' });

        if (!genericErr) return true;
      }
      console.warn(`[Supabase] Upsert error for "${tableName}/${item.id}":`, error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn(`[Supabase] Exception saving document to "${tableName}":`, err);
    return false;
  }
}

/**
 * Upsert multiple documents into Supabase
 */
export async function saveManyDocumentsToSupabase<T extends { id: string }>(
  storeName: string,
  items: T[]
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || items.length === 0) return false;

  const tableName = TABLE_MAP[storeName as MappedTableName] || storeName;

  try {
    const rows = items.map((item) => ({
      ...item,
      id: item.id,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from(tableName)
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      // Try generic payload structure
      if (error.code === '42703' || error.message.includes('column')) {
        const genericRows = items.map((item) => ({
          id: item.id,
          payload: item,
          updated_at: new Date().toISOString(),
        }));
        const { error: gErr } = await supabase
          .from(tableName)
          .upsert(genericRows, { onConflict: 'id' });
        if (!gErr) return true;
      }
      console.warn(`[Supabase] Batch upsert error for "${tableName}":`, error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn(`[Supabase] Exception batch saving to "${tableName}":`, err);
    return false;
  }
}

/**
 * Delete a document from Supabase
 */
export async function deleteDocumentFromSupabase(
  storeName: string,
  id: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const tableName = TABLE_MAP[storeName as MappedTableName] || storeName;

  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.warn(`[Supabase] Delete error on "${tableName}/${id}":`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[Supabase] Exception deleting from "${tableName}":`, err);
    return false;
  }
}

/**
 * Batch delete documents from Supabase
 */
export async function deleteManyDocumentsFromSupabase(
  storeName: string,
  ids: string[]
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase || ids.length === 0) return false;

  const tableName = TABLE_MAP[storeName as MappedTableName] || storeName;

  try {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .in('id', ids);

    if (error) {
      console.warn(`[Supabase] Batch delete error on "${tableName}":`, error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`[Supabase] Exception batch deleting from "${tableName}":`, err);
    return false;
  }
}

/**
 * SQL script to set up all tables and storage bucket in Supabase SQL Editor
 */
export function getSupabaseSQLSetupScript(): string {
  return `-- ====================================================================
-- SOMS STUDENTS OUTREACH DASHBOARD - SUPABASE DATABASE & STORAGE SETUP
-- Run this script in your Supabase SQL Editor (1-Click Setup)
-- ====================================================================

-- 1. Create Storage Bucket for Media & Uploads (Compressed 50-80KB Images)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('${SUPABASE_STORAGE_BUCKET}', '${SUPABASE_STORAGE_BUCKET}', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies (Idempotent)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = '${SUPABASE_STORAGE_BUCKET}');

DROP POLICY IF EXISTS "Public Uploads" ON storage.objects;
CREATE POLICY "Public Uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = '${SUPABASE_STORAGE_BUCKET}');

DROP POLICY IF EXISTS "Public Manage" ON storage.objects;
CREATE POLICY "Public Manage" 
ON storage.objects FOR ALL 
USING (bucket_id = '${SUPABASE_STORAGE_BUCKET}');

-- 2. Create Institutional Tables with JSONB Payload Support
-- This flexible schema supports all custom attributes, points, URLs, and metadata!

CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  "admissionNumber" TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  course TEXT,
  department TEXT,
  batch TEXT,
  "avatarUrl" TEXT,
  "isActive" BOOLEAN DEFAULT true,
  "totalPoints" NUMERIC DEFAULT 0,
  "approvedCount" INT DEFAULT 0,
  "pendingCount" INT DEFAULT 0,
  rank INT,
  bio TEXT,
  "isPublicProfileEnabled" BOOLEAN DEFAULT true,
  "publicBio" TEXT,
  "createdAt" TEXT,
  payload JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.submissions (
  id TEXT PRIMARY KEY,
  "studentId" TEXT,
  "studentName" TEXT,
  "studentAdmissionNo" TEXT,
  "studentCourse" TEXT,
  "studentDepartment" TEXT,
  category TEXT,
  title TEXT,
  status TEXT,
  date TEXT,
  description TEXT,
  "subType" TEXT,
  "venueOrOrganizer" TEXT,
  "externalLink" TEXT,
  "participationRank" TEXT,
  "participationType" TEXT,
  "imageUrl" TEXT,
  "certificateUrl" TEXT,
  "supportingDocUrl" TEXT,
  "supportingDocName" TEXT,
  "recommendedPoints" NUMERIC DEFAULT 0,
  "awardedPoints" NUMERIC DEFAULT 0,
  "adminReviewNote" TEXT,
  "isFeatured" BOOLEAN DEFAULT false,
  "featuredOrder" INT,
  "createdAt" TEXT,
  "updatedAt" TEXT,
  payload JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.point_rules (
  id TEXT PRIMARY KEY,
  category TEXT,
  "activityType" TEXT,
  "recommendedPoints" NUMERIC DEFAULT 0,
  "maxPoints" NUMERIC DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "adminNote" TEXT,
  payload JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rank_rules (
  id TEXT PRIMARY KEY,
  "rankName" TEXT,
  points NUMERIC DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  description TEXT,
  payload JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.point_history (
  id TEXT PRIMARY KEY,
  "studentId" TEXT,
  "studentName" TEXT,
  "activityId" TEXT,
  "activityTitle" TEXT,
  category TEXT,
  "previousPoints" NUMERIC DEFAULT 0,
  "pointsAdded" NUMERIC DEFAULT 0,
  "finalPoints" NUMERIC DEFAULT 0,
  "adminName" TEXT,
  date TEXT,
  reason TEXT,
  payload JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.featured_titles (
  id TEXT PRIMARY KEY,
  title TEXT,
  "studentId" TEXT,
  "studentName" TEXT,
  "studentAdmissionNo" TEXT,
  "studentDepartment" TEXT,
  "studentCourse" TEXT,
  "studentAvatarUrl" TEXT,
  "shortDescription" TEXT,
  "sessionYear" TEXT,
  "positionSubtitle" TEXT,
  "displayOrder" INT DEFAULT 0,
  "isFeatured" BOOLEAN DEFAULT true,
  "isActive" BOOLEAN DEFAULT true,
  "showOnHomePage" BOOLEAN DEFAULT true,
  payload JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  name TEXT,
  icon TEXT,
  description TEXT,
  "minPointsOrCriteria" TEXT,
  "assignedStudentIds" TEXT[],
  "isActive" BOOLEAN DEFAULT true,
  color TEXT,
  payload JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.certificates (
  id TEXT PRIMARY KEY,
  "studentId" TEXT,
  "studentName" TEXT,
  "studentAdmissionNo" TEXT,
  "activityId" TEXT,
  "activityTitle" TEXT,
  category TEXT,
  "achievementDetails" TEXT,
  "issueDate" TEXT,
  "organizationName" TEXT,
  "pointsAwarded" NUMERIC DEFAULT 0,
  "verificationHash" TEXT,
  "qrDataUrl" TEXT,
  payload JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id TEXT PRIMARY KEY,
  "recipientRole" TEXT,
  "studentId" TEXT,
  title TEXT,
  message TEXT,
  type TEXT,
  "relatedActivityId" TEXT,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TEXT,
  payload JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT,
  "adminName" TEXT,
  details TEXT,
  timestamp TEXT,
  "recordType" TEXT,
  "recordId" TEXT,
  payload JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.app_settings (
  id TEXT PRIMARY KEY,
  "organizationName" TEXT,
  tagline TEXT,
  "logoUrl" TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  description TEXT,
  theme TEXT,
  "publicLeaderboard" BOOLEAN DEFAULT true,
  "publicAchievements" BOOLEAN DEFAULT true,
  "publicPublications" BOOLEAN DEFAULT true,
  "adminUsername" TEXT,
  "adminPasswordHash" TEXT,
  payload JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT,
  message TEXT,
  link TEXT,
  "displayOrder" INT DEFAULT 0,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TEXT,
  "updatedAt" TEXT,
  payload JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create open public policies (or customize with Supabase Auth)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rank_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read/Write All" ON public.students;
CREATE POLICY "Public Read/Write All" ON public.students FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write All" ON public.submissions;
CREATE POLICY "Public Read/Write All" ON public.submissions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write All" ON public.point_rules;
CREATE POLICY "Public Read/Write All" ON public.point_rules FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write All" ON public.rank_rules;
CREATE POLICY "Public Read/Write All" ON public.rank_rules FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write All" ON public.point_history;
CREATE POLICY "Public Read/Write All" ON public.point_history FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write All" ON public.featured_titles;
CREATE POLICY "Public Read/Write All" ON public.featured_titles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write All" ON public.badges;
CREATE POLICY "Public Read/Write All" ON public.badges FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write All" ON public.certificates;
CREATE POLICY "Public Read/Write All" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write All" ON public.notifications;
CREATE POLICY "Public Read/Write All" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write All" ON public.audit_logs;
CREATE POLICY "Public Read/Write All" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write All" ON public.app_settings;
CREATE POLICY "Public Read/Write All" ON public.app_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read/Write All" ON public.announcements;
CREATE POLICY "Public Read/Write All" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
`;
}
