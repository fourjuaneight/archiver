import { exec } from 'child_process';
import { promisify } from 'util';

const asyncExec = promisify(exec);

/**
 * Download YT video from url.
 * @function
 * @async
 *
 * @param {string} url video url
 * @param {string} name file name
 * @returns {void}
 */
export const ytdl = async (url: string, name: string): Promise<void> => {
  try {
    const { stderr } = await asyncExec(
      `/usr/local/bin/yt-dlp -f 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio:' --merge-output-format mp4 -o "${name}" ${url}`
    );

    if (stderr) {
      throw new Error(`Saving buffer as file: \n ${stderr}`);
    }
  } catch (error) {
    throw new Error(`Saving buffer as file: \n ${error}`);
  }
};
