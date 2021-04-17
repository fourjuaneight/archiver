import { Readable } from 'stream';

import { getArticle, getMedia, getYTVid } from './getContent';
import { Record } from './types';

/**
 * Determine media type and get buffer data.
 * @function
 *
 * @param {string} title media name
 * @param {string} url media endpoint
 * @param {string} type media type
 * @returns {Promise<Buffer>} media buffer
 */
export const getData = async (
  name: string,
  url: string,
  type: string
): Promise<Buffer> => {
  switch (true) {
    case type === 'articles':
      return getArticle(name, url);
    case type === 'comics':
      return getArticle(name, url);
    case type === 'videos':
      return getYTVid(name, url);
    default:
      return getMedia(name, url);
  }
};

/**
 * Create buffer from readable stream.
 * @function
 *
 * @param {Readable} stream
 * @returns {Promise<Buffer>} video buffer
 */
export const createBuffer = async (stream: Readable): Promise<Buffer> => {
  const chunks = [];

  for await (let chunk of stream) {
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
    .replace(/&/g, '-')
    .replace(/[!@#$%^*()+=\[\]{};'’:"”,\.<>\/?]+/g, '')
    .replace(/\s/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return cleanName;
};
