import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

// Cloudflare R2 configuration
const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

// Upload file to Cloudflare R2
export const uploadToCloudflareR2 = async (file, folder = 'uploads') => {
  try {
    const fileExtension = file.originalname.split('.').pop().toLowerCase();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await r2.send(command);
    
    const fileUrl = `${PUBLIC_URL}/${fileName}`;
    
    return {
      url: fileUrl,
      key: fileName,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  } catch (error) {
    console.error('Cloudflare R2 upload error:', error);
    throw new Error(`Failed to upload to Cloudflare R2: ${error.message}`);
  }
};

// Delete file from Cloudflare R2
export const deleteFromCloudflareR2 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2.send(command);
    return true;
  } catch (error) {
    console.error('Cloudflare R2 delete error:', error);
    throw new Error(`Failed to delete from Cloudflare R2: ${error.message}`);
  }
};