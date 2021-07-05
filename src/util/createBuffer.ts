import { Readable } from 'stream';

/**
 * Create buffer from readable stream.
 * @function
 * @async
 *
 * @param {Readable} stream
 * @returns {Buffer} video buffer
 */
export const createBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};
