import fetch from 'node-fetch';
import { createHash } from 'crypto';
import dotenv from 'dotenv';

import {
  B2AuthResp,
  B2AuthTokens,
  B2Error,
  B2UploadResp,
  B2UploadTokens,
  B2UpUrlResp,
} from './types';

dotenv.config();

const APP_KEY_ID = process.env.B2_APP_KEY_ID;
const APP_KEY = process.env.B2_APP_KEY;
const BUCKET_ID = process.env.B2_BUCKET_ID;
const BUCKET_NAME = process.env.B2_BUCKET_NAME;

/**
 * Authorize B2 bucket for upload.
 * docs: https://www.backblaze.com/b2/docs/b2_authorize_account.html
 * @function
 *
 * @returns {Promise<B2AuthTokens>} api endpoint, auth token, and download url
 */
const authTokens = async (): Promise<B2AuthTokens | undefined> => {
  const token = Buffer.from(`${APP_KEY_ID}:${APP_KEY}`).toString('base64');

  try {
    const response = await fetch(
      'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
      }
    );

    if (response.status !== 200) {
      const results: B2Error = await response.json();
      throw new Error(`${results.status}: ${results.code}`);
      return;
    }

    const results: B2AuthResp = await response.json();
    const data: B2AuthTokens = {
      apiUrl: results.apiUrl,
      authorizationToken: results.authorizationToken,
      downloadUrl: results.downloadUrl,
      recommendedPartSize: results.recommendedPartSize,
    };

    return data;
  } catch (error) {
    console.error(error);
  }
};

/**
 * Get B2 endpoint for upload.
 * docs: https://www.backblaze.com/b2/docs/b2_get_upload_url.html
 * @function
 *
 * @returns {Promise<B2UploadTokens>} upload endpoint, auth token, and download url
 */
const getUploadUrl = async (): Promise<B2UploadTokens | undefined> => {
  try {
    const authData = await authTokens();
    const response = await fetch(
      `${authData?.apiUrl}/b2api/v1/b2_get_upload_url`,
      {
        method: 'POST',
        headers: {
          Authorization: authData?.authorizationToken ?? '',
        },
        body: JSON.stringify({
          bucketId: BUCKET_ID,
        }),
      }
    );

    if (response.status !== 200) {
      const results: B2Error = await response.json();
      throw new Error(`${response.status}: ${results.code}`);
      return;
    }

    const results: B2UpUrlResp = await response.json();
    const endpoint = results.uploadUrl;
    const authToken = results.authorizationToken;

    return {
      endpoint,
      authToken,
      downloadUrl: authData?.downloadUrl ?? '',
    };
  } catch (error) {
    console.error(error);
  }
};

/**
 * Upload file to B2 bucket.
 * docs: https://www.backblaze.com/b2/docs/b2_upload_file.html
 * @function
 *
 * @param {Buffer} data file buffer
 * @param {string} name file name with extension
 * @param {string} [type] file type
 * @returns {Promise<string>} file public url
 */
const uploadToB2 = async (
  data: Buffer,
  name: string,
  type?: string
): Promise<string | undefined> => {
  try {
    const authData = await getUploadUrl();
    const hash = createHash('sha1').update(data).digest('hex');
    const response = await fetch(authData?.endpoint ?? '', {
      method: 'POST',
      headers: {
        Authorization: authData?.authToken ?? '',
        'X-Bz-File-Name': name,
        'Content-Type': type || 'b2/x-auto',
        'Content-Length': `${data.length}`,
        'X-Bz-Content-Sha1': hash,
        'X-Bz-Info-Author': 'cf-worker',
      },
      body: data,
    });

    if (response.status !== 200) {
      const results: B2Error = await response.json();
      throw new Error(`${results.status}: ${results.code}`);
      return;
    }

    const results: B2UploadResp = await response.json();

    return `${authData?.downloadUrl}/file/${BUCKET_NAME}/${results.fileName}`;
  } catch (error) {
    console.error(error);

    return error;
  }
};

export default uploadToB2;
