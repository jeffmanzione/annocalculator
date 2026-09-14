import {
  boostTypeToImageUrl,
  goodsToIconUrl,
  policyToImageUrl,
  regionToImageUrl,
} from '../app/shared/game/icons';
import { createWriteStream, writeFile } from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';

const copyIcons = async (dirName: string, elToIcon: Map<string, string>) => {
  const iconUrls: [string, string][] = [];

  for (const [el, iconUrl] of elToIcon) {
    if (iconUrl.length == 0) {
      continue;
    }

    const normalizedItemName = el
      .normalize('NFD')
      .replaceAll(/[\u0300-\u036f]/g, '')
      .replaceAll(/\s+/g, '_')
      .replaceAll(/[-\\,'":.?!#]+/g, '');

    const urlPath = `/icons/${dirName}/${normalizedItemName}.png`;

    const outFilePath = `./public${urlPath}`;

    const response = await fetch(iconUrl);

    if (!response.ok) {
      console.warn(`Failed to download ${iconUrl}.`);
      continue;
    }

    const fileStream = createWriteStream(outFilePath);
    const bodyStream = Readable.fromWeb(response.body as any);

    await finished(bodyStream.pipe(fileStream));

    iconUrls.push([el, urlPath]);
  }

  writeFile(
    `./src/app/shared/data/${dirName}.json`,
    JSON.stringify(iconUrls, null, 2),
    (err: any) => {
      if (err) {
        return console.error(err);
      }
      console.log('File created!');
    },
  );
};

const copyAllIcons = async () => {
  await Promise.all([
    copyIcons('goods', goodsToIconUrl),
    copyIcons('boosts', boostTypeToImageUrl),
    copyIcons('regions', regionToImageUrl),
    copyIcons('policies', policyToImageUrl),
  ]);
};

copyAllIcons();
