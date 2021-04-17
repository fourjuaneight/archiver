import AWS from 'aws-sdk';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

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
 * @param {string} base database name
 * @returns {Promise<string>} upload response code and message
 */
const uploadContent = async (
  data: Buffer,
  type: string,
  name: string,
  base: string
): Promise<string> => {
  const params = {
    Bucket: BUCKET_NAME ?? '',
    Key: name,
    Body: data,
    ContentType: type,
  };

  console.info(chalk.yellow('[INFO]'), `Uploading '${name}' to S3.`);

  try {
    const body = await s3.putObject(params).promise();
    const response = body.$response.httpResponse;

    if (response.statusCode !== 200) {
      throw new Error(
        `Uploading file to S3 - ${name}: \n ${response.statusCode}: ${response.statusMessage}`
      );
    }

    return `https:/${BUCKET_NAME}.s3.amazonaws.com/Bookmarks/${base}/${name}`;
  } catch (error) {
    throw new Error(`Uploading file to S3 - ${name}: \n ${error}`);
  }
};

export default uploadContent;
