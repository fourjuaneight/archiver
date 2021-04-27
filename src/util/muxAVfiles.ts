import { readFileSync } from 'fs';
import { resolve } from 'path';
import { spawn } from 'promisify-child-process';

/**
 * Combine audio and video files via ffmpeg. Create buffer from output.
 * @function
 *
 * @param {string} audio filename path
 * @param {string} video filename path
 * @param {string} output filename path
 * @returns {Promise<Buffer>} output file buffer
 */
const muxAVfiles = async (
  audio: string,
  video: string,
  output: string
): Promise<Buffer> => {
  const args = [
    '-i',
    video,
    '-i',
    audio,
    '-c',
    'copy',
    resolve(__dirname, output),
  ];

  try {
    await spawn('/opt/homebrew/bin/ffmpeg', args, {
      encoding: 'utf8',
      maxBuffer: 200 * 1024,
      shell: true,
    });
    const buffer = readFileSync(resolve(__dirname, output));

    return buffer;
  } catch (error) {
    throw new Error(`Combining files (error): \n ${error}`);
  }
};

export default muxAVfiles;
