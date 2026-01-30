import { ExtraGood } from '../mvc/models';
import {
  ProductionBuilding,
  ProductionType,
  Good,
  Rarity,
  Region,
  Boost,
  AdministrativeBuilding,
  Item,
} from './enums';
import * as itemsJson from '../data/items.json';

export interface ElectrictyExtraGood {
  good: Good;
  processingTimeSeconds: number;
}

export interface ProductionInfo {
  building: ProductionBuilding;
  processingTimeSeconds: number;
  productionType: ProductionType;
  good: Good;
  inputGoods?: Good[];
  allowedRegions: Region[];
  requiresElectricity?: boolean;
  electricityExtraGoods?: ElectrictyExtraGood[];
}

export interface ItemInfo {
  item: Item;
  iconUrl: string;
  rarity: Rarity;
  administrativeBuilding: AdministrativeBuilding;
  targets: ProductionBuilding[];
  extraGoods?: ExtraGood[];
  replacementGoods?: { from: Good; to: Good }[];
  providesElectricity?: boolean;
  productivityEffect?: number;
}

export const items: ItemInfo[] = (itemsJson as any).default as ItemInfo[];

export interface BoostInfo {
  productivityEffect?: number;
  extraGood?: ExtraGood;
}

const boostInfoMap = new Map<Boost, BoostInfo>([
  [Boost.Electricity, { productivityEffect: 1 }],
  [
    Boost.Fertiliser,
    {
      productivityEffect: 1,
      extraGood: { rateNumerator: 1, rateDenominator: 3 },
    },
  ],
  [
    Boost.Silo,
    {
      productivityEffect: 1,
      extraGood: { rateNumerator: 1, rateDenominator: 3 },
    },
  ],
  [
    Boost.TractorBarn,
    {
      productivityEffect: 2,
      extraGood: { rateNumerator: 1, rateDenominator: 3 },
    },
  ],
]);

export const improvedByLandReformAct = new Set<ProductionBuilding>([
  ProductionBuilding.GrainFarm,
  ProductionBuilding.HopFarm,
  ProductionBuilding.PotatoFarm,
  ProductionBuilding.RedPepperFarm,
  ProductionBuilding.Vineyard,
  ProductionBuilding.SheepFarm,
  ProductionBuilding.PigFarm,
  ProductionBuilding.CattleFarmOldWorld,
]);

export const improvedBySkilledLaborAct = new Set<ProductionBuilding>([
  ProductionBuilding.Steelworks,
  ProductionBuilding.Furnace,
  ProductionBuilding.CharcoalKiln,
  ProductionBuilding.WeaponFactory,
  ProductionBuilding.HeavyWeaponsFactory,
  ProductionBuilding.Steelworks,
  ProductionBuilding.CabAssemblyLine,
  ProductionBuilding.BrassSmeltery,
  ProductionBuilding.OilRefinery,
  ProductionBuilding.AssemblyLineElevators,
  ProductionBuilding.AssemblyLineBiscuits,
  ProductionBuilding.AssemblyLineTypewriters,
  ProductionBuilding.ChemicalPlantShampoo,
  ProductionBuilding.ChemicalPlantLemonade,
  ProductionBuilding.ChemicalPlantSouvenirs,
  ProductionBuilding.ChemicalPlantLacquer,
]);

export const dungProducingBuildings = new Set<ProductionBuilding>([
  ProductionBuilding.AlpacaFarm,
  ProductionBuilding.CattleFarmNewWorld,
  ProductionBuilding.NanduFarm,
]);

export function producesDung(building: ProductionBuilding | null): boolean {
  return dungProducingBuildings.has(building ?? ProductionBuilding.Unknown);
}

export function lookupBoostInfo(boost: Boost): BoostInfo | undefined {
  return boostInfoMap.get(boost);
}

export function lookupProductionInfo(
  building: ProductionBuilding,
): ProductionInfo | undefined {
  return builingsToInfo.get(building);
}

export function lookupItemInfo(item: Item): ItemInfo | undefined {
  return itemToInfo.get(item);
}

export function requiresElectricity(building: ProductionBuilding): boolean {
  return builingsToInfo.get(building)?.requiresElectricity ?? false;
}

export function regionSupportsElectricty(region: Region): boolean {
  return (
    region == Region.CapeTrelawney ||
    region == Region.OldWorld ||
    region == Region.NewWorld
  );
}

export function buildingSupportsElectricity(
  building: ProductionBuilding,
): boolean {
  const info = lookupProductionInfo(building)!;
  if (!info) {
    return false;
  }
  if (
    info.productionType == ProductionType.Factory ||
    info.productionType == ProductionType.Mine
  ) {
    return true;
  }
  return false;
}

export function lookupAllowedBoosts(building: ProductionBuilding): Boost[] {
  const info = lookupProductionInfo(building);
  if (
    !info ||
    info.allowedRegions.includes(Region.Enbesa) ||
    info.allowedRegions.includes(Region.Arctic)
  ) {
    return [];
  }
  if (info.productionType == ProductionType.AnimalFarm) {
    if (info.electricityExtraGoods !== undefined) {
      return [Boost.Silo, Boost.Electricity];
    }
    return [Boost.Silo];
  } else if (info.productionType == ProductionType.Factory) {
    return [Boost.Electricity];
  } else if (info.productionType == ProductionType.Mine) {
    return [Boost.Electricity];
  } else if (info.productionType == ProductionType.PlantFarm) {
    return [Boost.TractorBarn, Boost.Fertiliser];
  }
  return [];
}

export function lookupAllowedItems(building: ProductionBuilding): Item[] {
  return items
    .filter((itemInfo) => itemInfo.targets.includes(building))
    .map((itemInfo) => itemInfo.item);
}

export const buildingInfo: ProductionInfo[] = [
  {
    building: ProductionBuilding.AdvancedCoffeeRoaster,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Coffee,
    inputGoods: [Good.Malt],
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.AdvancedCottonMill,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.CottonFabric,
    inputGoods: [Good.Wool],
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.AdvancedRumDistillery,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Rum,
    inputGoods: [Good.Potatoes],
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.AlpacaFarm,
    processingTimeSeconds: 30,
    productionType: ProductionType.AnimalFarm,
    allowedRegions: [Region.NewWorld],
    good: Good.AlpacaWool,
    electricityExtraGoods: [
      {
        good: Good.Saltpetre,
        processingTimeSeconds: 240 / 4,
      },
    ],
  },
  {
    building: ProductionBuilding.AluminiumSmelter,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Bauxite, Good.Coal],
    good: Good.AluminiumProfiles,
  },
  {
    building: ProductionBuilding.Apiary,
    processingTimeSeconds: 30,
    productionType: ProductionType.AnimalFarm,
    allowedRegions: [Region.Enbesa],
    good: Good.Beeswax,
  },
  {
    building: ProductionBuilding.ArcticGasMine,
    processingTimeSeconds: 4.5 * 60,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.Arctic],
    good: Good.ArcticGas,
  },
  {
    building: ProductionBuilding.ArsenalPoliceEquipment,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Wood, Good.Steel, Good.CottonFabric],
    good: Good.PoliceEquipment,
  },
  {
    building: ProductionBuilding.ArtisanalKitchen,
    processingTimeSeconds: 120,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Beef, Good.RedPeppers],
    good: Good.Goulash,
  },
  {
    building: ProductionBuilding.ArtisansWorkshopBilliardTables,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.CherryWood, Good.Felt, Good.Celluloid],
    good: Good.BilliardTables,
  },
  {
    building: ProductionBuilding.ArtisansWorkshopCognac,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Grapes, Good.CherryWood, Good.Sugar],
    good: Good.Cognac,
  },
  {
    building: ProductionBuilding.ArtisansWorkshopToys,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Felt, Good.Celluloid, Good.Lacquer],
    good: Good.Toys,
  },
  {
    building: ProductionBuilding.ArtisansWorkshopViolins,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Steel, Good.CherryWood, Good.Lacquer],
    good: Good.Violins,
  },
  {
    building: ProductionBuilding.AssemblyLineBiscuits,
    processingTimeSeconds: 15,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Tallow, Good.Flour, Good.Citrus],
    good: Good.Biscuits,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.AssemblyLineElevators,
    processingTimeSeconds: 15,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Steel, Good.WoodVeneers, Good.SteamMotors],
    good: Good.Elevators,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.AssemblyLineTypewriters,
    processingTimeSeconds: 15,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Steel, Good.Brass, Good.Lacquer],
    good: Good.Typewriters,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.Bakery,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Flour],
    good: Good.Bread,
  },
  {
    building: ProductionBuilding.BallManufactory,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.NanduLeather, Good.Caoutchouc],
    good: Good.SoccerBalls,
  },
  {
    building: ProductionBuilding.BauxiteMine,
    processingTimeSeconds: 10,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.NewWorld],
    good: Good.Bauxite,
  },
  {
    building: ProductionBuilding.BearHuntingCabin,
    processingTimeSeconds: 90,
    productionType: ProductionType.HuntingCabin,
    allowedRegions: [Region.Arctic],
    good: Good.BearFur,
  },
  {
    building: ProductionBuilding.BicycleFactory,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Steel, Good.Caoutchouc],
    good: Good.PennyFarthings,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.BombFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney, Region.NewWorld],
    inputGoods: [Good.Saltpetre, Good.Dynamite, Good.Steel],
    good: Good.Bombs,
  },
  {
    building: ProductionBuilding.BombinWeaver,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.CottonFabric, Good.Felt],
    good: Good.BowlerHats,
  },
  {
    building: ProductionBuilding.Bootmakers,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.SangaCow],
    good: Good.LeatherBoots,
  },
  {
    building: ProductionBuilding.BrassSmeltery,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Copper, Good.Zinc, Good.Coal],
    good: Good.Brass,
  },
  {
    building: ProductionBuilding.Brewery,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Malt, Good.Hops],
    good: Good.Beer,
  },
  {
    building: ProductionBuilding.BrickDryHouse,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Enbesa],
    inputGoods: [Good.Clay, Good.Teff],
    good: Good.MudBricks,
  },
  {
    building: ProductionBuilding.BrickFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney, Region.NewWorld],
    inputGoods: [Good.Clay],
    good: Good.Bricks,
  },
  {
    building: ProductionBuilding.CabAssemblyLine,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.SteamMotors, Good.Chassis],
    good: Good.SteamCarriages,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.CableFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Copper, Good.Caoutchouc],
    good: Good.ElectricCables,
  },
  {
    building: ProductionBuilding.CalamariFishery,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    good: Good.Calamari,
  },
  {
    building: ProductionBuilding.Cannery,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Goulash, Good.Iron],
    good: Good.CannedFood,
  },
  {
    building: ProductionBuilding.CaoutchoucPlantation,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.NewWorld],
    good: Good.Caoutchouc,
  },
  {
    building: ProductionBuilding.CaribouHuntingCabin,
    processingTimeSeconds: 60,
    productionType: ProductionType.HuntingCabin,
    allowedRegions: [Region.Arctic],
    good: Good.CaribouMeat,
  },
  {
    building: ProductionBuilding.CattleFarmOldWorld,
    processingTimeSeconds: 120,
    productionType: ProductionType.AnimalFarm,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Beef,
  },
  {
    building: ProductionBuilding.CattleFarmNewWorld,
    processingTimeSeconds: 60,
    productionType: ProductionType.AnimalFarm,
    allowedRegions: [Region.NewWorld],
    good: Good.Beef,
    electricityExtraGoods: [
      {
        good: Good.Milk,
        processingTimeSeconds: 60 / 6,
      },
    ],
  },
  {
    building: ProductionBuilding.CeramicsWorkshop,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Enbesa],
    inputGoods: [Good.Clay, Good.IndigoDye],
    good: Good.Ceramics,
  },
  {
    building: ProductionBuilding.ChampagneCellar,
    processingTimeSeconds: 30,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Grapes, Good.Glass],
    good: Good.Champagne,
  },
  {
    building: ProductionBuilding.CharcoalKiln,
    processingTimeSeconds: 30,
    productionType: ProductionType.Orchard,
    allowedRegions: [
      Region.OldWorld,
      Region.CapeTrelawney,
      Region.NewWorld,
      Region.Arctic,
    ],
    good: Good.Coal,
  },
  {
    building: ProductionBuilding.Chandler,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Enbesa],
    inputGoods: [Good.Cotton, Good.Beeswax],
    good: Good.OrnateCandles,
  },
  {
    building: ProductionBuilding.ChemicalPlantCelluloid,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Cotton, Good.CamphorWax, Good.Ethanol],
    good: Good.Celluloid,
  },
  {
    building: ProductionBuilding.ChemicalPlantEthanol,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Wood, Good.Corn],
    good: Good.Ethanol,
  },
  {
    building: ProductionBuilding.ChemicalPlantFilmReels,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Saltpetre, Good.Celluloid],
    good: Good.FilmReel,
  },
  {
    building: ProductionBuilding.ChemicalPlantShampoo,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.CoconutOil, Good.Cinnamon, Good.Soap],
    good: Good.Shampoo,
  },
  {
    building: ProductionBuilding.ChemicalPlantLemonade,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Sugar, Good.Citrus, Good.Saltpetre],
    good: Good.Lemonade,
  },
  {
    building: ProductionBuilding.ChemicalPlantSouvenirs,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.CamphorWax, Good.Glass, Good.Cotton],
    good: Good.Souvenirs,
  },
  {
    building: ProductionBuilding.ChemicalPlantLacquer,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.QuartzSand, Good.Resin, Good.Ethanol],
    good: Good.Lacquer,
  },
  {
    building: ProductionBuilding.ChocolateFactory,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Cocoa, Good.Sugar],
    good: Good.Chocolate,
  },
  {
    building: ProductionBuilding.CigarFactory,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Tobacco, Good.WoodVeneers],
    good: Good.Cigars,
  },
  {
    building: ProductionBuilding.ClayCollector,
    processingTimeSeconds: 15,
    productionType: ProductionType.River,
    allowedRegions: [Region.Enbesa],
    good: Good.Clay,
  },
  {
    building: ProductionBuilding.ClayPit,
    processingTimeSeconds: 30,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney, Region.NewWorld],
    good: Good.Clay,
  },
  {
    building: ProductionBuilding.Clockmakers,
    processingTimeSeconds: 45,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Gold, Good.Glass],
    good: Good.PocketWatches,
  },
  {
    building: ProductionBuilding.Coachmakers,
    processingTimeSeconds: 120,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Wood, Good.Caoutchouc],
    good: Good.Chassis,
  },
  {
    building: ProductionBuilding.CoalMine,
    processingTimeSeconds: 15,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Coal,
  },
  {
    building: ProductionBuilding.CocoaPlantation,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.NewWorld],
    good: Good.Cocoa,
  },
  {
    building: ProductionBuilding.CoffeePlantation,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.NewWorld],
    good: Good.CoffeeBeans,
  },
  {
    building: ProductionBuilding.CoffeeRoaster,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.CoffeeBeans],
    good: Good.Coffee,
  },
  {
    building: ProductionBuilding.ConcreteFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Steel, Good.Cement],
    good: Good.ReinforcedConcrete,
  },
  {
    building: ProductionBuilding.CopperMine,
    processingTimeSeconds: 30,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Copper,
  },
  {
    building: ProductionBuilding.CornFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.NewWorld],
    good: Good.Corn,
  },
  {
    building: ProductionBuilding.CostumeShop,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Cotton, Good.Pigments, Good.NanduFeathers],
    good: Good.Costumes,
  },
  {
    building: ProductionBuilding.CottonMill,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Cotton],
    good: Good.CottonFabric,
  },
  {
    building: ProductionBuilding.CottonPlantation,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.NewWorld],
    good: Good.Cotton,
  },
  {
    building: ProductionBuilding.DeepGoldMine,
    processingTimeSeconds: 60,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.Arctic],
    good: Good.GoldOre,
  },
  {
    building: ProductionBuilding.DryHouse,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Enbesa],
    inputGoods: [Good.Salt, Good.SangaCow],
    good: Good.DriedMeat,
  },
  {
    building: ProductionBuilding.DynamiteFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Tallow, Good.Saltpetre],
    good: Good.Dynamite,
  },
  {
    building: ProductionBuilding.Embroiderer,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Enbesa],
    inputGoods: [Good.Linen],
    good: Good.Finery,
  },
  {
    building: ProductionBuilding.FanFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Motor, Good.AluminiumProfiles],
    good: Good.Fans,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.FeltProducer,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.AlpacaWool],
    good: Good.Felt,
  },
  {
    building: ProductionBuilding.FilamentFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Coal],
    good: Good.Filaments,
  },
  {
    building: ProductionBuilding.Fishery,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Fish,
  },
  {
    building: ProductionBuilding.FishOilFactory,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    good: Good.FishOil,
  },
  {
    building: ProductionBuilding.FlourMill,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Grain],
    good: Good.Flour,
  },
  {
    building: ProductionBuilding.FrameworkKnitters,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Wool],
    good: Good.WorkClothes,
  },
  {
    building: ProductionBuilding.FriedPlantainKitchen,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Plantains, Good.FishOil],
    good: Good.FriedPlantains,
  },
  {
    building: ProductionBuilding.FurDealer,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.CottonFabric, Good.Furs],
    good: Good.FurCoats,
  },
  {
    building: ProductionBuilding.Furnace,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Iron, Good.Coal],
    good: Good.Steel,
  },
  {
    building: ProductionBuilding.Glassmakers,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.QuartzSand],
    good: Good.Glass,
  },
  {
    building: ProductionBuilding.GoatFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.AnimalFarm,
    allowedRegions: [Region.Enbesa],
    good: Good.GoatMilk,
  },
  {
    building: ProductionBuilding.GoldOreMine,
    processingTimeSeconds: 150,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.NewWorld],
    good: Good.GoldOre,
  },
  {
    building: ProductionBuilding.Goldsmiths,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.GoldOre, Good.Coal],
    good: Good.Gold,
  },
  {
    building: ProductionBuilding.GooseFarm,
    processingTimeSeconds: 120,
    productionType: ProductionType.AnimalFarm,
    allowedRegions: [Region.Arctic],
    good: Good.GooseFeathers,
  },
  {
    building: ProductionBuilding.GrainFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Grain,
  },
  {
    building: ProductionBuilding.GramophoneFactory,
    processingTimeSeconds: 120,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.WoodVeneers, Good.Brass],
    good: Good.Gramophones,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.HaciendaFertilizerWorks,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Dung],
    good: Good.Fertiliser,
  },
  {
    building: ProductionBuilding.HeavyWeaponsFactory,
    processingTimeSeconds: 120,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Dynamite, Good.Steel],
    good: Good.AdvancedWeapons,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.HeliumExtractor,
    processingTimeSeconds: 15,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Clay, Good.IndustrialLubricant],
    good: Good.Helium,
  },
  {
    building: ProductionBuilding.HerbGarden,
    processingTimeSeconds: 30,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.NewWorld],
    good: Good.Herbs,
  },
  {
    building: ProductionBuilding.HibiscusFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.Enbesa],
    good: Good.HibiscusPetals,
  },
  {
    building: ProductionBuilding.HopFarm,
    processingTimeSeconds: 90,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Hops,
  },
  {
    building: ProductionBuilding.HuntingCabin,
    processingTimeSeconds: 60,
    productionType: ProductionType.HuntingCabin,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Furs,
  },
  {
    building: ProductionBuilding.HuskyFarm,
    processingTimeSeconds: 120,
    productionType: ProductionType.AnimalFarm,
    allowedRegions: [Region.Arctic],
    good: Good.Huskies,
  },
  {
    building: ProductionBuilding.HuskySledFactory,
    processingTimeSeconds: 120,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Arctic],
    good: Good.HuskySleds,
    inputGoods: [Good.Huskies, Good.Sleds],
  },
  {
    building: ProductionBuilding.IceCreamFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Milk, Good.Chocolate, Good.Citrus],
    good: Good.IceCream,
  },
  {
    building: ProductionBuilding.IndigoFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.Enbesa],
    good: Good.IndigoDye,
  },
  {
    building: ProductionBuilding.IndustrialOilPress,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.FishOil, Good.Saltpetre],
    good: Good.IndustrialLubricant,
  },
  {
    building: ProductionBuilding.IronMine,
    processingTimeSeconds: 15,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney, Region.NewWorld],
    good: Good.Iron,
  },
  {
    building: ProductionBuilding.JaleaKitchen,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    good: Good.Jalea,
    inputGoods: [Good.Calamari, Good.Herbs, Good.Corn],
  },
  {
    building: ProductionBuilding.Jewellers,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Jewellery,
    inputGoods: [Good.Gold, Good.Pearls],
  },
  {
    building: ProductionBuilding.LaboratoryFireExtinguisher,
    processingTimeSeconds: 45,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Steel, Good.Caoutchouc],
    good: Good.FireExtinguishers,
  },
  {
    building: ProductionBuilding.LaboratoryMedicine,
    processingTimeSeconds: 45,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Orchid, Good.Ethanol, Good.Herbs],
    good: Good.Medicine,
  },
  {
    building: ProductionBuilding.LaboratoryPigments,
    processingTimeSeconds: 45,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Saltpetre, Good.Minerals],
    good: Good.Pigments,
  },
  {
    building: ProductionBuilding.Lanternsmith,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Enbesa],
    inputGoods: [Good.Glass, Good.OrnateCandles],
    good: Good.Lanterns,
  },
  {
    building: ProductionBuilding.LightBulbFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.LightBulbs,
    inputGoods: [Good.Filaments, Good.Glass],
  },
  {
    building: ProductionBuilding.LimestoneQuarry,
    processingTimeSeconds: 30,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Cement,
  },
  {
    building: ProductionBuilding.LinenMill,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Enbesa],
    good: Good.Linen,
    inputGoods: [Good.Linseed],
  },
  {
    building: ProductionBuilding.LinseedFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.Enbesa],
    good: Good.Linseed,
  },
  {
    building: ProductionBuilding.LobsterFishery,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Enbesa],
    good: Good.Lobster,
  },
  {
    building: ProductionBuilding.LumberjacksHut,
    processingTimeSeconds: 15,
    productionType: ProductionType.Orchard,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney, Region.NewWorld],
    good: Good.Wood,
  },
  {
    building: ProductionBuilding.Luminer,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Enbesa],
    inputGoods: [Good.Paper, Good.IndigoDye],
    good: Good.IlluminatedScript,
  },
  {
    building: ProductionBuilding.Malthouse,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Grain],
    good: Good.Malt,
  },
  {
    building: ProductionBuilding.MarquetryWorkshop,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney, Region.NewWorld],
    inputGoods: [Good.Wood],
    good: Good.WoodVeneers,
  },
  {
    building: ProductionBuilding.MezcalBar,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Citrus, Good.Sugar, Good.Herbs],
    good: Good.Mezcal,
  },
  {
    building: ProductionBuilding.MineralMine,
    processingTimeSeconds: 15,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.NewWorld],
    good: Good.Minerals,
  },
  {
    building: ProductionBuilding.MotorAssemblyLine,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Steel, Good.Brass],
    good: Good.SteamMotors,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.MotorAssemblyPlant,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.ElectricCables, Good.Celluloid, Good.Steel],
    good: Good.Motor,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.NanduFarm,
    processingTimeSeconds: 30,
    productionType: ProductionType.AnimalFarm,
    allowedRegions: [Region.NewWorld],
    good: Good.NanduLeather,
    electricityExtraGoods: [
      {
        good: Good.NanduFeathers,
        processingTimeSeconds: 120 / 4,
      },
    ],
  },
  {
    building: ProductionBuilding.OilLampFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Arctic],
    inputGoods: [Good.Brass, Good.WhaleOil],
    good: Good.OilLamps,
  },
  {
    building: ProductionBuilding.OilRefinery,
    processingTimeSeconds: 15,
    productionType: ProductionType.Oil,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney, Region.NewWorld],
    good: Good.Oil,
  },
  {
    building: ProductionBuilding.OrchardCamphorWax,
    processingTimeSeconds: 30,
    productionType: ProductionType.Orchard,
    allowedRegions: [Region.NewWorld],
    good: Good.CamphorWax,
  },
  {
    building: ProductionBuilding.OrchardCherryWood,
    processingTimeSeconds: 30,
    productionType: ProductionType.Orchard,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.CherryWood,
  },
  {
    building: ProductionBuilding.OrchardCinnamon,
    processingTimeSeconds: 30,
    productionType: ProductionType.Orchard,
    allowedRegions: [Region.NewWorld],
    good: Good.Cinnamon,
  },
  {
    building: ProductionBuilding.OrchardCitrus,
    processingTimeSeconds: 30,
    productionType: ProductionType.Orchard,
    allowedRegions: [Region.NewWorld],
    good: Good.Citrus,
  },
  {
    building: ProductionBuilding.OrchardCoconutOil,
    processingTimeSeconds: 30,
    productionType: ProductionType.Orchard,
    allowedRegions: [Region.NewWorld],
    good: Good.CoconutOil,
  },
  {
    building: ProductionBuilding.OrchardJam,
    processingTimeSeconds: 30,
    productionType: ProductionType.Orchard,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Jam,
  },
  {
    building: ProductionBuilding.OrchardResin,
    processingTimeSeconds: 30,
    productionType: ProductionType.Orchard,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Resin,
  },
  {
    building: ProductionBuilding.OrchidFarm,
    processingTimeSeconds: 30,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.NewWorld],
    good: Good.Orchid,
  },
  {
    building: ProductionBuilding.PamphletPrinter,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney, Region.NewWorld],
    inputGoods: [Good.Wood, Good.Cotton],
    good: Good.Pamphlets,
  },
  {
    building: ProductionBuilding.PaperMill,
    processingTimeSeconds: 15,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Enbesa],
    inputGoods: [Good.Wood],
    good: Good.Paper,
  },
  {
    building: ProductionBuilding.ParkaFactory,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Arctic],
    inputGoods: [Good.BearFur, Good.SealSkin],
    good: Good.Parkas,
  },
  {
    building: ProductionBuilding.PerfumeMixer,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Orchid, Good.Ethanol, Good.CoconutOil],
    good: Good.Perfumes,
  },
  {
    building: ProductionBuilding.PearlFarm,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    good: Good.Pearls,
  },
  {
    building: ProductionBuilding.PemmicanCookhouse,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Arctic],
    inputGoods: [Good.WhaleOil, Good.CaribouMeat],
    good: Good.Pemmican,
  },
  {
    building: ProductionBuilding.PigFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.AnimalFarm,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Pigs,
  },
  {
    building: ProductionBuilding.PipeMaker,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Enbesa],
    inputGoods: [Good.Clay, Good.Tobacco],
    good: Good.ClayPipes,
  },
  {
    building: ProductionBuilding.PlantainPlantation,
    processingTimeSeconds: 30,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.NewWorld],
    good: Good.Plantains,
  },
  {
    building: ProductionBuilding.PonchoDarner,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    good: Good.Ponchos,
    inputGoods: [Good.AlpacaWool],
  },
  {
    building: ProductionBuilding.PotatoFarm,
    processingTimeSeconds: 30,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Potatoes,
  },
  {
    building: ProductionBuilding.PrimeHuntingCabin,
    processingTimeSeconds: 15,
    productionType: ProductionType.HuntingCabin,
    allowedRegions: [Region.Arctic],
    good: Good.Furs,
  },
  {
    building: ProductionBuilding.RedPepperFarm,
    processingTimeSeconds: 120,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.RedPeppers,
  },
  {
    building: ProductionBuilding.RenderingWorks,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Tallow,
    inputGoods: [Good.Pigs],
  },
  {
    building: ProductionBuilding.RumDistillery,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    good: Good.Rum,
    inputGoods: [Good.SugarCane, Good.Wood],
  },
  {
    building: ProductionBuilding.Sailmakers,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Sails,
    inputGoods: [Good.Wool],
  },
  {
    building: ProductionBuilding.SaltWorks,
    processingTimeSeconds: 90,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.Enbesa],
    good: Good.Salt,
  },
  {
    building: ProductionBuilding.SaltpetreWorks,
    processingTimeSeconds: 120,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Saltpetre,
  },
  {
    building: ProductionBuilding.SandMine,
    processingTimeSeconds: 30,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.QuartzSand,
  },
  {
    building: ProductionBuilding.SangaFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.AnimalFarm,
    allowedRegions: [Region.Enbesa],
    good: Good.SangaCow,
  },
  {
    building: ProductionBuilding.Sawmill,
    processingTimeSeconds: 15,
    productionType: ProductionType.Factory,
    allowedRegions: [
      Region.OldWorld,
      Region.CapeTrelawney,
      Region.NewWorld,
      Region.Arctic,
    ],
    good: Good.Timber,
    inputGoods: [Good.Wood],
  },
  {
    building: ProductionBuilding.SealHuntingDocks,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Arctic],
    good: Good.SealSkin,
  },
  {
    building: ProductionBuilding.SchnappsDistillery,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    inputGoods: [Good.Potatoes],
    good: Good.Schnapps,
  },
  {
    building: ProductionBuilding.ScooterFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    inputGoods: [Good.Pigments, Good.Motor, Good.Caoutchouc],
    good: Good.Scooter,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.SewingMachineFactory,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.SewingMachines,
    inputGoods: [Good.Steel, Good.Wood],
  },
  {
    building: ProductionBuilding.SheepFarm,
    processingTimeSeconds: 30,
    productionType: ProductionType.AnimalFarm,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Wool,
  },
  {
    building: ProductionBuilding.Slaughterhouse,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Sausages,
    inputGoods: [Good.Pigs],
  },
  {
    building: ProductionBuilding.SledFrameFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Arctic],
    good: Good.Sleds,
    inputGoods: [Good.SealSkin, Good.Wood],
  },
  {
    building: ProductionBuilding.SleepingBagFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Arctic],
    good: Good.SleepingBags,
    inputGoods: [Good.SealSkin, Good.GooseFeathers],
  },
  {
    building: ProductionBuilding.SoapFactory,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Soap,
    inputGoods: [Good.Tallow],
  },
  {
    building: ProductionBuilding.SpectacleFactory,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Glasses,
    inputGoods: [Good.Glass, Good.Brass],
  },
  {
    building: ProductionBuilding.SpiceFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.Enbesa],
    good: Good.Spices,
  },
  {
    building: ProductionBuilding.Steelworks,
    processingTimeSeconds: 45,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.SteelBeams,
    inputGoods: [Good.Steel],
  },
  {
    building: ProductionBuilding.SugarCanePlantation,
    processingTimeSeconds: 30,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.NewWorld],
    good: Good.SugarCane,
  },
  {
    building: ProductionBuilding.SugarRefinery,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    good: Good.Sugar,
    inputGoods: [Good.SugarCane],
  },
  {
    building: ProductionBuilding.TapestryLooms,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Enbesa],
    good: Good.Tapestries,
    inputGoods: [Good.Linen, Good.IndigoDye],
  },
  {
    building: ProductionBuilding.TailorsShop,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.TailoredSuits,
    inputGoods: [Good.CottonFabric, Good.Linen],
  },
  {
    building: ProductionBuilding.TeaSpicer,
    processingTimeSeconds: 90,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.Enbesa],
    good: Good.HibiscusTea,
    inputGoods: [Good.HibiscusPetals],
  },
  {
    building: ProductionBuilding.TeffFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.Enbesa],
    good: Good.Teff,
  },
  {
    building: ProductionBuilding.TeffMill,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Enbesa],
    inputGoods: [Good.Teff],
    good: Good.SpicedFlour,
  },
  {
    building: ProductionBuilding.TelephoneManufacturer,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Telephones,
    inputGoods: [Good.Filaments, Good.WoodVeneers],
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.TobaccoPlantation,
    processingTimeSeconds: 120,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.NewWorld],
    good: Good.Tobacco,
  },
  {
    building: ProductionBuilding.TortillaMaker,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.NewWorld],
    good: Good.Tortillas,
    inputGoods: [Good.Corn, Good.Beef],
  },
  {
    building: ProductionBuilding.Vineyard,
    processingTimeSeconds: 120,
    productionType: ProductionType.PlantFarm,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Grapes,
  },
  {
    building: ProductionBuilding.WanzaWoodcutter,
    processingTimeSeconds: 15,
    productionType: ProductionType.Orchard,
    allowedRegions: [Region.Enbesa],
    good: Good.WanzaTimber,
  },
  {
    building: ProductionBuilding.WaterDropFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney, Region.NewWorld],
    good: Good.WaterDrop,
  },
  {
    building: ProductionBuilding.WatKitchen,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Enbesa],
    inputGoods: [Good.SpicedFlour, Good.Lobster],
    good: Good.SeafoodStew,
  },
  {
    building: ProductionBuilding.WeaponFactory,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Weapons,
    inputGoods: [Good.Steel],
  },
  {
    building: ProductionBuilding.WhalingStation,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.Arctic],
    good: Good.WhaleOil,
  },
  {
    building: ProductionBuilding.WindowMakers,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Windows,
    inputGoods: [Good.Glass, Good.Wood],
  },
  {
    building: ProductionBuilding.ZincMine,
    processingTimeSeconds: 30,
    productionType: ProductionType.Mine,
    allowedRegions: [Region.OldWorld, Region.CapeTrelawney],
    good: Good.Zinc,
  },
];

const builingsToInfo = new Map<ProductionBuilding, ProductionInfo>(
  buildingInfo.map((i) => [i.building, i]),
);

const itemToInfo = new Map<Item, ItemInfo>(items.map((i) => [i.item, i]));
