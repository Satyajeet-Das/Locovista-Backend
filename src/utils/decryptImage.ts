import AWS from 'aws-sdk'

// Configure AWS S3
const s3 = new AWS.S3({
  region: process.env.AWS_REGION as string, // Ensure region is configured
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string , // Ensure credentials are configured
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
});

/**
 * Extract the object key from an S3 URL.
 * @param {string} url - The complete S3 URL.
 * @returns {string} - The object key.
 */
const getObjectKeyFromURL = (url: string) => {
    try {
      // Create a new URL object
      const parsedUrl = new URL(url);
  
      // Extract the pathname and remove the leading slash
      const objectKey = decodeURIComponent(parsedUrl.pathname.substring(1));
  
      return objectKey;
    } catch (error: any) {
      console.error('Invalid URL:', error.message);
      throw new Error('Failed to extract object key from URL');
    }
  };
  

export const getDecryptedImageURL = async (bucketName: string, objectKey: string, expiresIn = 3600) => {
  try {
    // Parameters for pre-signed URL
    const params = {
      Bucket: bucketName,
      Key: getObjectKeyFromURL(objectKey),
      Expires: expiresIn,
      ResponseContentDisposition: 'inline', // Display in the browser
      ResponseContentType: 'image/jpeg', // Content type of the image
    }

    // Generate a pre-signed URL (AWS will handle decryption)
    const url = await s3.getSignedUrlPromise('getObject', params)

    return url
  } catch (error) {
    console.error('Error generating pre-signed URL:', error)
    throw new Error('Failed to generate image URL')
  }
}
