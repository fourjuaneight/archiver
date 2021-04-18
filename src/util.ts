import { Readable } from 'stream';

import { Record } from './types';

/**
 * Create buffer from readable stream.
 * @function
 *
 * @param {Readable} stream
 * @returns {Promise<Buffer>} video buffer
 */
export const createBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks = [];

  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

/**
 * Chunk list of records into array of arrays.
 * @function
 *
 * @param array list of records
 * @param size amount to chunk by
 * @returns {Record[][]} chunked list of records
 */
export const chunkRecords = (array: Record[], size: number): Record[][] => {
  if (array.length <= size) {
    return [array];
  }

  return [array.slice(0, size), ...chunkRecords(array.slice(size), size)];
};

/**
 * Convert record name into a filename ready for upload.
 * @function
 *
 * @param {string} name record name
 * @returns {string} record filename
 */
export const fileNameFmt = (name: string): string => {
  const cleanName: string = name
    .replace(/\.\s/g, '-')
    .replace(/,\s/g, '-')
    .replace(/\s::\s/g, '-')
    .replace(/\s:\s/g, '-')
    .replace(/:\s/g, '-')
    .replace(/\s-\s/g, '-')
    .replace(/\s–\s/g, '-')
    .replace(/\s—\s/g, '-')
    .replace(/[-|\\]+/g, '-')
    .replace(/\s&\s/g, 'and')
    .replace(/&/g, 'n')
    .replace(/[!@#$%^*()+=[\]{};'’:"”,.<>/?]+/g, '')
    .replace(/\s/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return cleanName;
};
