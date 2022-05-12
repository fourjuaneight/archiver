import { getMedia } from '../helpers/getContent';
import { getRecords, saveHasuraData } from './airtable-to-hasura';
import { uploadToB2 } from '../helpers/uploadContentB2';

import { MDShelfFields } from '../models/airtable';

interface Cover {
  id: string;
  name: string;
  fileName: string;
  type: string;
  url: string;
}

interface CoverData {
  name: string;
  fileName: string;
  data: Buffer;
}

export interface ShelfRecord {
  id?: string;
  name: string;
  creator: string;
  rating: number;
  category: string;
  cover: string;
  genre: string;
  completed: boolean;
  comments: string;
}

type ShelfFields = MDShelfFields & { id: string };

const getCover = async (cover: Cover): Promise<CoverData> => {
  try {
    const buffer = await getMedia(cover.name, cover.url);

    return {
      name: cover.name,
      fileName: `Shelf/${cover.fileName}`,
      data: buffer,
    };
  } catch (error) {
    throw new Error(`(getCover): \n ${error}`);
  }
};

(async () => {
  try {
    const airtableData = await getRecords();
    const fields: ShelfFields[] = airtableData.Media.Shelf.map(record => {
      const recordFields = record.fields as MDShelfFields;

      return {
        ...recordFields,
        id: record.id,
      };
    });
    // remove duplicates
    const cleanFields = fields.filter(
      (field, index) => fields.findIndex(c => c.id === field.id) === index
    );
    const covers: Cover[] = cleanFields
      .map(field => {
        const { id, cover, name } = field;
        const filename = cover ? cover[0].filename : '';
        const url = cover ? cover[0].thumbnails.full.url : '';
        const type = cover ? cover[0].type : '';

        return {
          id,
          name,
          fileName: filename,
          type,
          url,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const cover of covers) {
      const coverData = await getCover(cover);
      const publicUrl = await uploadToB2(
        coverData.data,
        coverData.fileName,
        cover.type
      );
      const existingRecord = fields.find(
        field => field.id === cover.id
      ) as ShelfFields;
      const newRecord: ShelfRecord = {
        ...existingRecord,
        cover: publicUrl,
      };

      delete newRecord.id;

      await saveHasuraData('media_shelf', [newRecord]);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
