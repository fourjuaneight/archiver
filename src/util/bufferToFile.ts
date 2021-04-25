import { promises } from 'fs';

const { writeFile } = promises;

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

export default bufferToFile;
