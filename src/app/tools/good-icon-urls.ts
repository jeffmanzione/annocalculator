import { Good } from '../shared/game/enums';

const alternativeIconNames = new Map<Good, string>([
  [Good.AluminiumProfiles, 'Aluminium_Profiles'],
  [Good.Beeswax, 'Icon_beeswax_0'],
  [Good.GoatMilk, 'Icon_goat_milk_0'],
  [Good.Gramophones, 'Gramophone'],
  [Good.HibiscusPetals, 'Icon_hibiscus_farm_0'],
  [Good.HibiscusTea, 'Icon_hibiscus_tea_0'],
  [Good.IndigoDye, 'Icon_indigo_0'],
  [Good.Jewellery, 'Jewelry'],
  [Good.LeatherBoots, 'Icon_leather_shoes_0'],
  [Good.LightBulbs, 'Light_bulb'],
  [Good.Linen, 'Icon_linen_fabric_0'],
  [Good.Linseed, 'Icon_linen_farm_0'],
  [Good.Lobster, 'Icon_seafood_0'],
  [Good.MudBricks, 'Icon_mud_bricks_0'],
  [Good.Paper, 'Icon_paper_0'],
  [Good.PennyFarthings, 'High_wheeler'],
  [Good.PocketWatches, 'Pocket_watch'],
  [Good.Ponchos, 'Poncho'],
  [Good.Potatoes, 'Potato'],
  [Good.Saltpetre, 'Saltpeter'],
  [Good.SangaCow, 'Icon_watusi_0'],
  [Good.Spices, 'Icon_spices_0'],
  [Good.TailoredSuits, 'Icon_suits_0'],
  [Good.Tapestries, 'Icon_tapestries_0'],
  [Good.Teff, 'Icon_teff_grass_0'],
  [Good.Telephones, 'Icon_telephones_0'],
  [Good.Tortillas, 'Tortilla'],
]);

function convertGoodToIconFileNames(good: Good): string[] {
  if (alternativeIconNames.has(good)) {
    return [alternativeIconNames.get(good)!];
  }
  const underscored = good.replaceAll(' ', '_');
  return [
    underscored,
    underscored[0].toUpperCase() + underscored.substring(1).toLowerCase(),
  ];
}

async function fetchWikiPageContent(good: Good): Promise<string> {
  for (const fileName of convertGoodToIconFileNames(good)) {
    try {
      const url = new URL(
        `https://anno1800.fandom.com/wiki/File:${fileName}.png`,
      );
      const response = await fetch(url);
      if (response.status != 200) {
        continue;
      }
      if (response.ok) {
        const content = await response.text();
        const regex = new RegExp(
          String.raw`https://static\.wikia\.nocookie\.net/anno1800/images/[A-Za-z0-9_/]+/${fileName}\.png`,
        );
        const matches = regex.exec(content);
        if (!matches) {
          continue;
        }
        return matches[0];
      }
    } catch (e) {
      console.error(e);
    }
  }
  return '';
}

async function fetchAllGoodImageUrls(): Promise<Map<Good, string>> {
  const goodImages: [Good, string][] = await Promise.all(
    Object.values(Good).map(async (g) => [g, await fetchWikiPageContent(g)]),
  );
  return new Map<Good, string>(goodImages);
}
try {
  for (const [good, url] of await fetchAllGoodImageUrls()) {
    const goodEnumKey = good.toString().replaceAll(' ', '').replaceAll("'", '');
    console.log(`[Good.${goodEnumKey}, '${url}'],`);
  }
} catch (e) {
  console.error(e);
}
