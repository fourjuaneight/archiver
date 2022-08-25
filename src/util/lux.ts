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
export const lux = async (url: string, name: string): Promise<void> => {
  try {
    const { stderr, stdout } = await asyncExec(
      `/usr/local/bin/lux -O "${name}" "${url}"`
    );

    if (stderr) {
      throw new Error(stderr);
    } else {
      console.info('[lux]:', stdout);
    }
  } catch (error) {
    throw new Error(`[lux]: ${error}`);
  }
};
