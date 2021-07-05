import { Record } from '../models/archive';

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
