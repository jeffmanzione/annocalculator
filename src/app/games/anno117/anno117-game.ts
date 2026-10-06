import { GameDefinition, GoodId } from '../game';
import { Language } from '../../shared/l10n/l10n';
import { anno117Data, productsById } from './game/data';
import { Anno117Name } from './game/data-types';

const ICON_FOLDER = '/icons/anno117/';

/** The game's name for something in the language shown. The game has no Dutch, so that falls back to English. */
export function nameIn(
  name: Anno117Name | undefined,
  language: Language,
): string {
  if (!name) return '';
  if (language === Language.De) return name.de ?? name.en;
  if (language === Language.Zh) return name.zh ?? name.en;
  return name.en;
}

export const iconUrl = (icon: string | undefined): string =>
  icon ? ICON_FOLDER + icon : '';

/** Every product something in the game makes, uses or burns, which is what the summary lists. */
const goods: GoodId[] = (() => {
  const used = new Set<number>();
  for (const factory of anno117Data.factories) {
    [...factory.inputs, ...factory.outputs].forEach((x) => used.add(x.product));
  }
  for (const module of anno117Data.modules)
    module.inputs.forEach((x) => used.add(x.product));
  used.add(anno117Data.constants.fuelProduct);
  return [...used].filter((id) => productsById.has(id)).map(String);
})();

export const anno117Game: GameDefinition = {
  id: 'anno117',
  goods,
  goodIconUrl: (good) => iconUrl(productsById.get(Number(good))?.icon),
  goodName: (good, language) =>
    nameIn(productsById.get(Number(good))?.name, language),
  extraConsumption: (line) =>
    (
      line as unknown as {
        extraConsumption: readonly { good: GoodId; perMinute: number }[];
      }
    ).extraConsumption,
};
