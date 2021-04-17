import chalk from 'chalk';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { createHash } from 'crypto';

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
      const msg = results.message || results.code;

      throw new Error(
        `Error getting B2 authentication keys: \n ${results.status}: ${msg}`
      );
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
    throw new Error(`Error getting B2 authentication keys: \n ${error}`);
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
      const msg = results.message || results.code;

      throw new Error(
        `Error getting B2 upload URL: \n ${response.status}: ${msg}`
      );
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
    throw new Error(`Error getting B2 upload URL: \n ${error}`);
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

    console.info(chalk.yellow('[INFO]'), `Uploading '${name}'.`);

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
      const msg = results.message || results.code;

      throw new Error(
        `Error uploading file to B2 - ${name}: \n ${results.status}: ${msg}`
      );
      return;
    }

    const results: B2UploadResp = await response.json();

    console.info(
      chalk.green('[SUCCESS]'),
      `Uploaded '${results.fileName}' to B2.`
    );

    return `${authData?.downloadUrl}/file/${BUCKET_NAME}/${results.fileName}`;
  } catch (error) {
    throw new Error(`Error uploading file to B2 - ${name}: \n ${error}`);
  }
};

export default uploadToB2;
