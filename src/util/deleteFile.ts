import { promises } from 'fs';

const { unlink } = promises;

/**
 * Delete list of files.
 * @function
 * @async
 *
 * @param files array of file paths to delete
 * @returns {void}
 */
export const deleteFiles = async (files: string[]): Promise<void> => {
  try {
    const delCmds = files.map(fl => unlink(fl));

    await Promise.all(delCmds);

    return;
  } catch (error) {
    throw new Error(`[deleteFiles]: ${error}`);
  }
};
