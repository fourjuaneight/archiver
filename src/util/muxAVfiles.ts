import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';
import { promises, readFileSync } from 'fs';

const { writeFile } = promises;

/**
 * Combine audio and video files via ffmpeg. Create buffer from output.
 * @function
 * @async
 *
 * @param {string} audio filename path
 * @param {string} video filename path
 * @param {string} output filename path
 * @returns {Buffer} output file buffer
 */
export const muxAVfiles = async (
  audio: string,
  video: string,
  output: string
): Promise<Buffer> => {
  const ffmpeg = createFFmpeg({
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
