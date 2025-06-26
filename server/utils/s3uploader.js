

import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({
  region: 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const s3 = new AWS.S3();

export const uploadToS3 = async (localFilePath, s3Key) => {
  try {
    // ✅ Confirm file still exists
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File does not exist at path: ${localFilePath}`);
    }

    const fileContent = fs.readFileSync(localFilePath);
    const contentType = mime.lookup(localFilePath) || 'application/octet-stream';

    const params = {
      Bucket: 'devangi-doa',
      Key: s3Key,
      Body: fileContent,
      ContentType: contentType,
    
    };

    const data = await s3.upload(params).promise();

    // ✅ Only delete after successful upload
    // try {
    //   fs.unlinkSync(localFilePath);
    // } catch (unlinkError) {
    //   console.warn(`Could not delete file ${localFilePath}`, unlinkError.message);
    // }

    return data.Location;
  } catch (error) {
    console.error("S3 Upload Error:", error.message);
    throw error;
  }
};
