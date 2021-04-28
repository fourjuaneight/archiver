import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { homedir } from 'os';
import { promises, readFileSync } from 'fs';
import { resolve } from 'path';

const { writeFile } = promises;

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
  const corePath = resolve(
    homedir(),
    'archiver',
    'node_modules/@ffmpeg/core/dist/ffmpeg-core.js'
  );
  const ffmpeg = createFFmpeg({
    corePath,
    log: false,
  });

  try {
    await ffmpeg.load();

    const audioFile = await fetchFile(audio);
    const videoFile = await fetchFile(video);

    ffmpeg.FS('writeFile', audio, audioFile);
    ffmpeg.FS('writeFile', video, videoFile);

    await ffmpeg.run('-i', video, '-i', audio, '-c', 'copy', output);
    await writeFile(output, ffmpeg.FS('readFile', output));

    const buffer = readFileSync(output);

    return buffer;
  } catch (error) {
    throw new Error(`Combining files (error): \n ${error}`);
  }
};

export default muxAVfiles;
