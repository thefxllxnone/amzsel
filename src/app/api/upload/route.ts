import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function ensureUploadDirExists() {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('Could not create local upload dir (read-only filesystem environment):', e);
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const urlInput = formData.get('url') as string | null;

    if (urlInput && urlInput.trim()) {
      return NextResponse.json({
        success: true,
        url: urlInput.trim()
      });
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file or image URL provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.jpg';
    const filename = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    
    // In Netlify / Serverless, write to /tmp or return base64 data URI if disk is read-only
    try {
      ensureUploadDirExists();
      const filePath = path.join(UPLOAD_DIR, filename);
      fs.writeFileSync(filePath, buffer);
      return NextResponse.json({
        success: true,
        url: `/uploads/${filename}`,
        filename
      });
    } catch (fsErr) {
      // Fallback to data URI if read-only filesystem (Netlify lambda environment)
      const base64 = buffer.toString('base64');
      const mime = file.type || 'image/jpeg';
      const dataUri = `data:${mime};base64,${base64}`;
      return NextResponse.json({
        success: true,
        url: dataUri,
        filename
      });
    }
  } catch (error: any) {
    console.error('API Error POST /api/upload:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
