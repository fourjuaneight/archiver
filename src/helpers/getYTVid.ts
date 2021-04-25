import ytdl from 'ytdl-core';
import { promises, readFileSync } from 'fs';
import { resolve } from 'path';
import { spawn } from 'promisify-child-process';
import { Readable } from 'stream';

const { unlink, writeFile } = promises;

/**
 * Create buffer from readable stream.
 * @function
 *
 * @param {Readable} stream
 * @returns {Promise<Buffer>} video buffer
 */
const createBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

/**
 * Save buffer as local file.
 * @function
 *
 * @param {Buffer} data media buffer to save
 * @param {string} name file name
 * @returns {Promise<void>}
 */
const bufferToFile = async (data: Buffer, name: string): Promise<void> => {
  try {
    await writeFile(`${__dirname}/${name}`, data);
  } catch (error) {
    throw new Error(`Saving buffer as file: \n ${error}`);
  }
};

/**
 * Combine audio and video files via ffmpeg.
 * @function
 *
 * @returns {Promise<void>}
 */
const combineFiles = async (): Promise<void> => {
  // get files
  const audioFile = resolve(__dirname, 'audio.mp4');
  const videoFile = resolve(__dirname, 'video.mp4');
  // create command
  const args = [
    '-i',
    videoFile,
    '-i',
    audioFile,
    '-c',
    'copy',
    `${__dirname}/output.mp4`,
  ];

  try {
    await spawn('ffmpeg', args, {
      encoding: 'utf8',
      shell: true,
    });
  } catch (error) {
    throw new Error(`Combining files (error): \n ${error}`);
  }
};

/**
 * Get YouTube file from url.
 * @function
 *
 * @param {string} name video name
 * @param {string} url video url
 * @returns {Promise<Buffer>} file buffer
 */
const getYTVid = async (name: string, url: string): Promise<Buffer> => {
  try {
    // get media
    const audio = ytdl(url, {
      filter: 'audioonly',
      quality: 'highestaudio',
    });
    const video = ytdl(url, {
      quality: 'highestvideo',
    });
    // convert to buffers
    const audioBuffer = await createBuffer(audio);
    const videoBuffer = await createBuffer(video);

    // save as files
    await bufferToFile(audioBuffer, 'audio.mp4');
    await bufferToFile(videoBuffer, 'video.mp4');
    // combine files
    await combineFiles();

    // get buffer from output video
    const buffer = readFileSync(resolve(__dirname, 'output.mp4'));

    // delete files
    await unlink(resolve(__dirname, 'audio.mp4'));
    await unlink(resolve(__dirname, 'video.mp4'));
    await unlink(resolve(__dirname, 'output.mp4'));

    return buffer;
  } catch (error) {
    throw new Error(`Getting video for '${name}': \n ${error}`);
  }
};

export default getYTVid;
