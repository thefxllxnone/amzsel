import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function ensureUploadDirExists() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const urlInput = formData.get('url') as string | null;

    // If direct URL provided
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

    // Sanitize file extension
    const ext = path.extname(file.name) || '.jpg';
    const filename = `img-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    
    ensureUploadDirExists();
    const filePath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename
    });
  } catch (error: any) {
    console.error('API Error POST /api/upload:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
