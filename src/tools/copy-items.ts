import * as itemsJson from '../app/shared/data/items.json' with { type: 'json' };
import { ItemInfo } from '../app/shared/game/facts';
import { createWriteStream, writeFile } from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';

const copyItems = async () => {
  const items: ItemInfo[] = (itemsJson as any).default as ItemInfo[];

  const newItems: ItemInfo[] = [];

  for (const item of items) {
    const normalizedItemName = item.item
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      .replaceAll(/\s+/g, '_')
      .replaceAll(/[-\\,'":.?!#]+/g, '');

    const urlPath = `/icons/items/${normalizedItemName}.png`;

    const outFilePath = `./public${urlPath}`;

    const response = await fetch(item.iconUrl);

    if (!response.ok) {
      console.warn(`Failed to download ${item.iconUrl}.`);
      continue;
    }

    const fileStream = createWriteStream(outFilePath);
    const bodyStream = Readable.fromWeb(response.body as any);

    await finished(bodyStream.pipe(fileStream));

    newItems.push({ ...item, iconUrl: urlPath });
  }

  writeFile(
    './src/app/shared/data/items.json',
    JSON.stringify(newItems, null, 2),
    (err: any) => {
      if (err) {
        return console.error(err);
      }
      console.log('File created!');
    },
  );
};

copyItems();
