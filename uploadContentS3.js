const AWS = require("aws-sdk");

const ID = process.env.AWS_ID;
const SECRET = process.env.AWS_SECRET;
const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

const s3 = new AWS.S3({
  accessKeyId: ID,
  secretAccessKey: SECRET,
});

/**
 * Upload asset to S3 bucket.
 * @function
 *
 * @param {Buffer} data raw buffer data
 * @param {string} type file type
 * @param {string} name file name
 * @returns {object} upload response code and message
 */
const uploadContent = async (data, type, name, base) => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: name,
    Body: data,
    ContentType: type,
  };
  const body = await s3.putObject(params).promise();
  const response = body.$response.httpResponse;
  const permalink = `https:/${BUCKET_NAME}.s3.amazonaws.com/Bookmarks/${base}/${name}`;
  const success = `File uploaded successfully at ${permalink}`;
  const result = {
    code: response.statusCode,
    message: response.statusCode === 200 ? success : response.statusMessage,
    permalink,
  };

  return result;
};

module.exports = uploadContent;
