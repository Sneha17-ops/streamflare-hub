import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const body = await req.json();
    const { filename = null, data } = body;
    if (!data) return NextResponse.json({ error: 'no data' }, { status: 400 });

    const match = data.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) return NextResponse.json({ error: 'invalid data' }, { status: 400 });
    const mime = match[1];
    const b64 = match[2];
    const ext = mime.split('/')[1] || 'png';

    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const name = filename || `thumb-${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, name);
    fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));

    const url = `/uploads/${name}`;
    return NextResponse.json({ url });
  } catch (err) {
    console.error('/api/ai/thumbnails/upload error', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
