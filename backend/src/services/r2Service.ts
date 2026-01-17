import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import dotenv from 'dotenv';

dotenv.config();

// Cloudflare R2 uses S3-compatible API
const getR2Client = (): S3Client => {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
        throw new Error('R2 credentials are missing. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY.');
    }

    return new S3Client({
        region: 'auto',
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId,
            secretAccessKey,
        },
    });
};

const getBucketName = (): string => {
    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) {
        throw new Error('R2_BUCKET_NAME is not set.');
    }
    return bucket;
};

/**
 * Convert base64 data URL to Buffer
 * Handles both "data:image/png;base64,..." format and raw base64
 */
export const base64ToBuffer = (base64Data: string): { buffer: Buffer; mimeType: string } => {
    let data = base64Data;
    let mimeType = 'image/png';

    // Handle data URL format
    const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
        mimeType = match[1];
        data = match[2];
    }

    return {
        buffer: Buffer.from(data, 'base64'),
        mimeType,
    };
};

/**
 * Get file extension from MIME type
 */
const getExtensionFromMime = (mimeType: string): string => {
    const mimeToExt: Record<string, string> = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/gif': 'gif',
        'image/webp': 'webp',
    };
    return mimeToExt[mimeType] || 'png';
};

/**
 * Generate a storage key for an image
 * Structure: users/{userId}/{generationId}/{type}_{timestamp}_{index}.{ext}
 */
export const generateStorageKey = (
    userId: string,
    generationId: string,
    type: 'input' | 'output',
    index: number,
    extension: string
): string => {
    const timestamp = Date.now();
    return `users/${userId}/${generationId}/${type}_${timestamp}_${index}.${extension}`;
};

/**
 * Upload an image to R2
 * @param key - The storage key/path
 * @param buffer - Image buffer
 * @param mimeType - MIME type of the image
 * @returns The storage key
 */
export const uploadImage = async (
    key: string,
    buffer: Buffer,
    mimeType: string
): Promise<string> => {
    const client = getR2Client();
    const bucket = getBucketName();

    await client.send(
        new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
        })
    );

    return key;
};

/**
 * Upload a base64 image to R2
 * @param userId - User ID for organizing storage
 * @param generationId - Generation ID for grouping related images
 * @param base64Data - Base64 encoded image data (with or without data URL prefix)
 * @param type - 'input' or 'output'
 * @param index - Index of the image in the array
 * @returns The storage key
 */
export const uploadBase64Image = async (
    userId: string,
    generationId: string,
    base64Data: string,
    type: 'input' | 'output',
    index: number
): Promise<string> => {
    const { buffer, mimeType } = base64ToBuffer(base64Data);
    const extension = getExtensionFromMime(mimeType);
    const key = generateStorageKey(userId, generationId, type, index, extension);

    await uploadImage(key, buffer, mimeType);
    return key;
};

/**
 * Get a signed URL for private access to an image
 * @param key - The storage key
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export const getImageSignedUrl = async (
    key: string,
    expiresIn: number = 3600
): Promise<string> => {
    const client = getR2Client();
    const bucket = getBucketName();

    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
    });

    return await getSignedUrl(client, command, { expiresIn });
};

/**
 * Get public URL for an image (if bucket is configured for public access)
 * @param key - The storage key
 * @returns Public URL or null if not configured
 */
export const getPublicUrl = (key: string): string | null => {
    const publicUrl = process.env.R2_PUBLIC_URL;
    if (!publicUrl) {
        return null;
    }
    return `${publicUrl}/${key}`;
};

/**
 * Get URL for an image - prefers public URL, falls back to signed URL
 * @param key - The storage key
 * @returns URL to access the image
 */
export const getImageUrl = async (key: string): Promise<string> => {
    const publicUrl = getPublicUrl(key);
    if (publicUrl) {
        return publicUrl;
    }
    return await getImageSignedUrl(key);
};

/**
 * Delete an image from R2
 * @param key - The storage key
 */
export const deleteImage = async (key: string): Promise<void> => {
    const client = getR2Client();
    const bucket = getBucketName();

    await client.send(
        new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        })
    );
};

/**
 * Delete multiple images from R2
 * @param keys - Array of storage keys
 */
export const deleteImages = async (keys: string[]): Promise<void> => {
    await Promise.all(keys.map(key => deleteImage(key)));
};

/**
 * Check if R2 is configured
 * @returns true if all required R2 environment variables are set
 */
export const isR2Configured = (): boolean => {
    return !!(
        process.env.R2_ACCOUNT_ID &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET_NAME
    );
};

/**
 * Check if a value is an R2 storage key (not a base64 data URL)
 */
export const isR2Key = (value: string): boolean => {
    return value.startsWith('users/') && !value.startsWith('data:');
};
