const fetch = require("node-fetch");
const { createHash } = require("crypto");
require("dotenv").config();

const APP_KEY_ID = process.env.B2_APP_KEY_ID;
const APP_KEY = process.env.B2_APP_KEY;
const BUCKET_ID = process.env.B2_BUCKET_ID;

/**
 * Authorize B2 bucket for upload.
 * docs: https://www.backblaze.com/b2/docs/b2_authorize_account.html
 * @function
 *
 * @returns {object} auth data
 */
const authB2 = async () => {
  const token = Buffer.from(`${APP_KEY_ID}:${APP_KEY}`).toString("base64");

  try {
    const response = await fetch(
      "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
      {
        headers: {
          Authorization: `Basic ${token}`,
        },
      }
    );
    const results = await response.json();

    if (response.status !== 200) {
      throw new Error(`${results.status}: ${results.code}`);
    }

    const data = {
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
 * Upload file to B2 bucket.
 * docs: https://www.backblaze.com/b2/docs/b2_upload_file.html
 * @function
 *
 * @param {Buffer} data file buffer
 * @param {string} name file name with extension
 * @param {string} [type] file type
 * @returns {void}
 */
const uploadToB2 = async (data, name, type) => {
  try {
    const authData = await authB2();
    const response = await fetch(
      `${authData.apiUrl}/b2api/v1/b2_get_upload_url`,
      {
        method: "POST",
        headers: {
          Authorization: authData.authorizationToken,
        },
        body: JSON.stringify({
          bucketId: BUCKET_ID,
        }),
      }
    );
    const results = await response.json();

    if (response.status !== 200) {
      throw new Error(`${results.status}: ${results.code}`);
    }

    const endpoint = results.uploadUrl;
    const authToken = results.authorizationToken;
    const hash = createHash("sha1").update(data).digest("hex");

    const uploadResp = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: authToken,
        "X-Bz-File-Name": name,
        "Content-Type": type || "b2/x-auto",
        "Content-Length": data.length,
        "X-Bz-Content-Sha1": hash,
        "X-Bz-Info-Author": "cf-worker",
      },
      body: data,
    });
    const uploadStatus = await uploadResp.json();

    if (uploadResp.status !== 200) {
      throw new Error(`${uploadStatus.status}: ${uploadStatus.code}`);
    }

    return uploadStatus;
  } catch (error) {
    console.error(error);
  }
};

exports.authB2 = authB2;
exports.uploadToB2 = uploadToB2;
