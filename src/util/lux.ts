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
    const { stderr } = await asyncExec(`lux -O "${name}" ${url}`);

    if (stderr) {
      throw new Error(stderr);
    }
  } catch (error) {
    throw new Error(`[lux]: ${error}`);
  }
};
