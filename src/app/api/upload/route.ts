import { v2 as cloudinary } from 'cloudinary';
import { NextRequest } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine resource type: image for images, video for audio/video, raw for everything else
    const imageTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
    const audioVideoTypes = file.type.startsWith('audio/') || file.type.startsWith('video/');
    const resourceType = imageTypes.includes(file.type) ? 'image' as const : audioVideoTypes ? 'video' as const : 'raw' as const;

    // Clean filename for Cloudinary public_id
    const cleanName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');

    const result = await new Promise<{ secure_url: string; public_id: string; original_filename: string; format: string; bytes: number }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'gsc-workshop',
          resource_type: resourceType,
          public_id: cleanName + '_' + Date.now(),
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string; public_id: string; original_filename: string; format: string; bytes: number });
        }
      ).end(buffer);
    });

    return Response.json({
      url: result.secure_url,
      publicId: result.public_id,
      originalName: file.name,
      format: result.format,
      size: result.bytes,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
