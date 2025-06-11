import { IslandView } from "./views";

export enum ProductionBuilding {
  Unknown = 'Unknown',
  AlpacaFarm = 'Alpaca Farm',
  ArcticGasMine = 'Arctic Gas Mine',
  AssemblyLineBiscuits = 'Assembly Line: Biscuits',
  AssemblyLineElevators = 'Assembly Line: Elevators',
  AssemblyLineTypewriters = 'Assembly Line: Typewriters',
  Bakery = 'Bakery',
  BearHuntingCabin = 'Bear Hunting Cabin',
  BicycleFactory = 'Bicycle Factory',
  BombinWeaver = 'Bombin Weaver',
  BrassSmeltery = 'Brass Smetlery',
  Brewery = 'Brewery',
  BrickFactory = 'Brick Factory',
  CabAssemblyLine = 'Cab Assembly Line',
  Cannery = 'Cannery',
  CaoutchoucPlantation = 'Caoutchouc Plantation',
  CaribouHuntingCabin = 'Caribou Hunting Cabin',
  CattleFarm = 'Cattle Farm',
  ChampagneCellar = 'Champagne Cellar',
  CharcoalKiln = 'Charcoal Kiln',
  ChemicalPlantShampoo = 'Chemical Plant: Shampoo',
  ChemicalPlantLemonade = 'Chemical Plant: Lemonade',
  ChemicalPlantSouvenirs = 'Chemical Plant: Souvenirs',
  ChemicalPlantLacquer = 'Chemical Plant: Lacquer',
  ChocolateFactory = 'Chocolate Factory',
  CigarFactory = 'Cigar Factory',
  ClayPit = 'Clay Pit',
  Clockmakers = 'Clockmakers',
  CoalMine = 'Coal Mine',
  CocoaPlantation = 'Cocoa Plantation',
  CoffeePlantation = 'Coffee Plantation',
  CoffeeRoaster = 'Coffee Roaster',
  ConcreteFactory = 'Concrete Factory',
  CopperMine = 'Copper Mine',
  CornFarm = 'Corn Farm',
  CottonPlantation = 'Cotton Plantation',
  FrameworkKnitters = 'Framework Knitters',
  FriedPlantainKitchen = 'Fried Plantain Kitchen',
  FurDealer = 'Fur Dealer',
  Furnace = 'Furnace',
  GoldOreMine = 'Gold Ore Mine',
  GooseFarm = 'Goose Farm',
  GrainFarm = 'Grain Farm',
  GramophoneFactory = 'Gramophone Factory',
  HeavyWeaponsFactory = 'Heavy Weapons Factory',
  HopFarm = 'Hop Farm',
  HuntingCabin = 'Hunting Cabin',
  HuskyFarm = 'Husky Farm',
  HuskySledFactory = 'Husky Sled Factory',
  IronMine = 'Iron Mine',
  Jewellers = 'Jewellers',
  LightBulbFactory = 'Light Bulb Factory',
  LimestoneQuarry = 'Limestone Mine',
  LumberjacksHut = 'Lumberjack\'s Hut',
  MotorAssemblyLine = 'Motor Assembly Line',
  OilLampFactory = 'Oil Lamp Factory',
  OilRefinery = 'Oil Refinery',
  ParkaFactory = 'Parka Factory',
  PemmicanCookhouse = 'Pemmican Cookhouse',
  PigFarm = 'Pig Farm',
  PlantainPlantation = 'Plantain Plantation',
  PonchoDarner = 'Poncho Darner',
  PotatoFarm = 'Potato Farm',
  PrimeHuntingCabin = 'Prime Hunting Cabin',
  RedPepperFarm = 'Red Pepper Farm',
  RumDistillery = 'Rum Distillery',
  Sailmakers = 'Sailmakers',
  SaltpeterWorks = 'Saltpeter Works',
  SandMine = 'Sand Mine',
  Sawmill = 'Sawmill',
  SchnappsDistillery = 'Schnapps Distillery',
  SealHuntingDocks = 'Seal Hunting Docks',
  SewingMachineFactory = 'Sewing Machine Factory',
  SheepFarm = 'Sheep Farm',
  Slaughterhouse = 'Slaughterhouse',
  SleepingBagFactory = 'Sleeping Bag Factory',
  SoapFactory = 'Soap Factory',
  SpectacleFactory = 'Spectacle Factory',
  Steelworks = 'Steelworks',
  SugarCanePlantation = 'Sugar Cane Plantation',
  TobaccoPlantation = 'Tobacco Plantation',
  TortillaMaker = 'Tortilla Maker',
  Vineyard = 'Vineyard',
  WeaponFactory = 'Weapon Factory',
  WindowFactory = 'Window Factory',
  ZincMine = 'Zinc Mine',
};

export enum ProductionType {
  Mine = 'Mine',
  Factory = 'Factory',
  PlantFarm = 'Plant Farm',
  AnimalFarm = 'Animal Farm',
  HuntingCabin = 'Hunting Cabin',
  Orchard = 'Orchard',
};

export enum Good {
  Unknown = 'Unknown',
  AdvancedWeapons = 'Advanced Weapons',
  AlpacaWool = 'Alpaca Wool',
  AluminiumProfiles = 'Aluminium Profiles',
  ArcticGas = 'Arctic Gas',
  Bauxite = 'Bauxite',
  BearFur = 'Bear Fur',
  Beef = 'Beef',
  Beer = 'Beer',
  Beeswax = 'Beeswax',
  Biscuits = 'Biscuits',
  Bobins = 'Bobins',
  Bombs = 'Bombs',
  Brass = 'Brass',
  Bread = 'Bread',
  Bricks = 'Bricks',
  CannedFood = 'Canned Food',
  Caoutchouc = 'Caoutchouc',
  Caribou = 'Caribou',
  Cement = 'Cement',
  Champagne = 'Champagne',
  Chocolate = 'Chocolate',
  Cigars = 'Cigars',
  Cinnamon = 'Cinnamon',
  Citrus = 'Citrus',
  Clay = 'Clay',
  Coal = 'Coal',
  Cocoa = 'Cocoa',
  CoconutOil = 'Coconut Oil',
  Coconuts = 'Coconuts',
  Coffee = 'Coffee',
  CoffeeBeans = 'Coffee Beans',
  Copper = 'Copper',
  Corn = 'Corn',
  Cotton = 'Cotton',
  CottonFabric = 'Cotton Fabric',
  Elevators = 'Elevators',
  Fish = 'Fish',
  Flour = 'Flour',
  FurCoats = 'Fur Coats',
  Furs = 'Furs',
  Glass = 'Glass',
  Glasses = 'Glasses',
  GoatMilk = 'Goat Milk',
  GoldOre = 'Gold Ore',
  GooseFeathers = 'Goose Feathers',
  Grain = 'Grain',
  Grapes = 'Grapes',
  Gramophones = 'Gramophones',
  Helium = 'Helium',
  Herbs = 'Herbs',
  Hops = 'Hops',
  Huskies = 'Huskies',
  HuskySleds = 'Husky Sleds',
  IceCream = 'Ice Cream',
  IndigoDye = 'Indigo Dye',
  Iron = 'Iron',
  Jam = 'Jam',
  Jewellery = 'Jewellery',
  Lacquer = 'Lacquer',
  Leather = 'Leather',
  Lemonade = 'Lemonade',
  LightBulbs = 'Light Bulbs',
  Linens = 'Linens',
  Linseed = 'Linseed',
  Milk = 'Milk',
  Minerals = 'Minerals',
  MudBricks = 'Mud Bricks',
  NanduFeathers = 'Nandu Feathers',
  NanduLeather = 'Nandu Leather',
  Oil = 'Oil',
  Pamphlets = 'Pamphlets',
  Paper = 'Paper',
  Pearls = 'Pearls',
  PennyFarthings = 'Penny Farthings',
  Perfumes = 'Perfumes',
  Pigs = 'Pigs',
  Plantains = 'Plantains',
  PocketWatches = 'Pocket Watches',
  Potatoes = 'Potatoes',
  QuartzSand = 'Quartz Sand',
  RedPeppers = 'Red Peppers',
  ReinforcedConcrete = 'Reinforced Concrete',
  Resin = 'Resin',
  Rum = 'Rum',
  Sails = 'Sails',
  Salt = 'Salt',
  Saltpetre = 'Saltpetre',
  Sausages = 'Sausages',
  Schnapps = 'Schnapps',
  Seals = 'Seals',
  SealSkin = 'Seal Skin',
  SeaMines = 'Sea Mines',
  SewingMachines = 'Sewing Machines',
  Shampoo = 'Shampoo',
  Soap = 'Soap',
  Souvenirs = 'Souvenirs',
  Spices = 'Spices',
  SteamCarriages = 'Steam Carriages',
  SteamMotors = 'Steam Motors',
  Steel = 'Steel',
  SteelBeams = 'Steel Beams',
  SugarCane = 'Sugar Cane',
  TailoredSuits = 'Tailored Suits',
  Tapestries = 'Tapestries',
  Tea = 'Tea',
  Telephones = 'Telephones',
  Tobacco = 'Tobacco',
  Toys = 'Toys',
  Typewriter = 'Typewriter',
  Violins = 'Violins',
  WaterDrop = 'Water Drop',
  WhaleOil = 'Whale Oil',
  Windows = 'Windows',
  Wood = 'Wood',
  WoodVeneers = 'Wood Veneers',
  Wool = 'Wool',
  WorkClothes = 'Work Clothes',
  Zinc = 'Zinc',
};

export enum BoostType {
  None = 'None',
  Electricity = 'Electricity',
  Tracktors = 'Tracktors',
  Fertilizer = 'Fertilizer',
  TractorsAndFertilizer = 'Tractors & Fertilizer',
  AnimalFeed = 'Animal Feed',
};

export enum IslandPolicy {
  None = 'None',
  LandReformAct = 'Land Reform Act',
  SkilledLaborAct = 'Skilled Labor Act',
  UnionSubsidiesAct = 'Union Subsidies Act',
  GalvanicGrantsAct = 'Galvanic Grants Act',
};

export interface Model { };

export interface ProductionLineModel extends Model {
  building: ProductionBuilding;
  good: Good;
  numBuildings: number;
  goodsRateNumerator?: number;
  goodsRateDenominator?: number;
  boostType?: BoostType;
  hasTradeUnion?: boolean;
  tradeUnionItemsBonus?: number;
};

export interface IslandModel extends Model {
  name: string;
  islandPolicy?: IslandPolicy;
  productionLines: ProductionLineModel[];
};

export interface WorldModel extends Model {
  tradeUnionBonus?: number;
  islands: IslandModel[];
};

export const BASE_PRODUCTION_LINE_MODEL: ProductionLineModel = {
  building: ProductionBuilding.Unknown,
  good: Good.Unknown,
  numBuildings: 1,
};

export const DEFAULT_PRODUCTION_LINE_MODEL: ProductionLineModel = {
  building: ProductionBuilding.Unknown,
  good: Good.Unknown,
  numBuildings: 0,
  goodsRateNumerator: 1,
  goodsRateDenominator: 1,
  boostType: BoostType.None,
  hasTradeUnion: false,
  tradeUnionItemsBonus: 0.0,
};

export const BASE_ISLAND_MODEL: IslandModel = {
  name: "",
  productionLines: [],
};

export const DEFAULT_ISLAND_MODEL: IslandModel = {
  name: 'Unknown',
  islandPolicy: IslandPolicy.None,
  productionLines: [],
};

export const BASE_WORLD_MODEL: WorldModel = {
  islands: []
};

export const DEFAULT_WORLD_MODEL: WorldModel = {
  tradeUnionBonus: 0.0,
  islands: [],
};

export interface ProductionInfo {
  building: ProductionBuilding;
  processingTimeSeconds: number;
  productionType: ProductionType;
  good: Good;
};

export const improvedByLandReformAct = new Set<ProductionBuilding>([
  ProductionBuilding.GrainFarm,
  ProductionBuilding.HopFarm,
  ProductionBuilding.PotatoFarm,
  ProductionBuilding.RedPepperFarm,
  ProductionBuilding.Vineyard,
  ProductionBuilding.SheepFarm,
  ProductionBuilding.PigFarm,
  ProductionBuilding.CattleFarm,
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

export function getExtraGoodsModifier(productionBuilding: ProductionBuilding, good: Good, island: IslandView): number {
  const productionInfo = lookupProductionInfo(productionBuilding);
  if (productionInfo == null || good != productionInfo.good) {
    return 1.0;
  } else if (improvedByLandReformAct.has(productionBuilding) && island.policy == IslandPolicy.LandReformAct) {
    return 1.5;
  } else if (improvedBySkilledLaborAct.has(productionBuilding) && island.policy == IslandPolicy.SkilledLaborAct) {
    return 1. + 1. / 3.;
  } else {
    return 1.0;
  }
}

export const buildingInfo: ProductionInfo[] = [
  {
    building: ProductionBuilding.AlpacaFarm,
    processingTimeSeconds: 30,
    productionType: ProductionType.AnimalFarm,
    good: Good.AlpacaWool,
  },
  {
    building: ProductionBuilding.ArcticGasMine,
    processingTimeSeconds: 4.5 * 60,
    productionType: ProductionType.Mine,
    good: Good.ArcticGas,
  },
  {
    building: ProductionBuilding.AssemblyLineBiscuits,
    processingTimeSeconds: 15,
    productionType: ProductionType.Factory,
    good: Good.Biscuits,
  },
  {
    building: ProductionBuilding.AssemblyLineElevators,
    processingTimeSeconds: 15,
    productionType: ProductionType.Factory,
    good: Good.Elevators,
  },
  {
    building: ProductionBuilding.AssemblyLineTypewriters,
    processingTimeSeconds: 15,
    productionType: ProductionType.Factory,
    good: Good.Typewriter,
  },
  {
    building: ProductionBuilding.Bakery,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.Bread,
  },
  {
    building: ProductionBuilding.BearHuntingCabin,
    processingTimeSeconds: 90,
    productionType: ProductionType.HuntingCabin,
    good: Good.Bread,
  },
  {
    building: ProductionBuilding.BicycleFactory,
    processingTimeSeconds: 15,
    productionType: ProductionType.Factory,
    good: Good.PennyFarthings,
  },
  {
    building: ProductionBuilding.BombinWeaver,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Bobins,
  },
  {
    building: ProductionBuilding.BrassSmeltery,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.Brass,
  },
  {
    building: ProductionBuilding.Brewery,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.Beer,
  },
  {
    building: ProductionBuilding.BrickFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.Bricks,
  },
  {
    building: ProductionBuilding.CabAssemblyLine,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.SteamCarriages,
  },
  {
    building: ProductionBuilding.Cannery,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    good: Good.CannedFood,
  },
  {
    building: ProductionBuilding.CaoutchoucPlantation,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    good: Good.Caoutchouc,
  },
  {
    building: ProductionBuilding.CattleFarm,
    processingTimeSeconds: 120,
    productionType: ProductionType.AnimalFarm,
    good: Good.Beef,
  },
  {
    building: ProductionBuilding.ChampagneCellar,
    processingTimeSeconds: 30,
    productionType: ProductionType.PlantFarm,
    good: Good.Champagne,
  },
  {
    building: ProductionBuilding.CharcoalKiln,
    processingTimeSeconds: 30,
    productionType: ProductionType.Orchard,
    good: Good.Coal,
  },
  {
    building: ProductionBuilding.ChemicalPlantShampoo,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Shampoo,
  },
  {
    building: ProductionBuilding.ChemicalPlantLemonade,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Lemonade,
  },
  {
    building: ProductionBuilding.ChemicalPlantSouvenirs,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Souvenirs,
  },
  {
    building: ProductionBuilding.ChemicalPlantLacquer,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Lacquer,
  },
  {
    building: ProductionBuilding.ChocolateFactory,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Chocolate,
  },
  {
    building: ProductionBuilding.CigarFactory,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Cigars,
  },
  {
    building: ProductionBuilding.ClayPit,
    processingTimeSeconds: 30,
    productionType: ProductionType.Mine,
    good: Good.Clay,
  },
  {
    building: ProductionBuilding.Clockmakers,
    processingTimeSeconds: 45,
    productionType: ProductionType.Factory,
    good: Good.PocketWatches,
  },
  {
    building: ProductionBuilding.CoalMine,
    processingTimeSeconds: 15,
    productionType: ProductionType.Mine,
    good: Good.Coal,
  },
  {
    building: ProductionBuilding.CocoaPlantation,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    good: Good.Cocoa,
  },
  {
    building: ProductionBuilding.CoffeePlantation,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    good: Good.CoffeeBeans,
  },
  {
    building: ProductionBuilding.CoffeeRoaster,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Coffee,
  },
  {
    building: ProductionBuilding.ConcreteFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.ReinforcedConcrete,
  },
  {
    building: ProductionBuilding.CopperMine,
    processingTimeSeconds: 30,
    productionType: ProductionType.Mine,
    good: Good.Copper,
  },
  {
    building: ProductionBuilding.CornFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    good: Good.Corn,
  },
  {
    building: ProductionBuilding.CottonPlantation,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    good: Good.Cotton,
  },
  {
    building: ProductionBuilding.FrameworkKnitters,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.WorkClothes,
  },
  {
    building: ProductionBuilding.FriedPlantainKitchen,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Plantains,
  },
  {
    building: ProductionBuilding.FurDealer,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.FurCoats,
  },
  {
    building: ProductionBuilding.Furnace,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Steel,
  },
  {
    building: ProductionBuilding.GoldOreMine,
    processingTimeSeconds: 150,
    productionType: ProductionType.Mine,
    good: Good.GoldOre,
  },
  {
    building: ProductionBuilding.GooseFarm,
    processingTimeSeconds: 120,
    productionType: ProductionType.AnimalFarm,
    good: Good.GooseFeathers,
  },
  {
    building: ProductionBuilding.GrainFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    good: Good.Grain,
  },
  {
    building: ProductionBuilding.GramophoneFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.Gramophones,
  },
  {
    building: ProductionBuilding.HeavyWeaponsFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.AdvancedWeapons,
  },
  {
    building: ProductionBuilding.HopFarm,
    processingTimeSeconds: 90,
    productionType: ProductionType.PlantFarm,
    good: Good.Hops,
  },
  {
    building: ProductionBuilding.HuntingCabin,
    processingTimeSeconds: 60,
    productionType: ProductionType.HuntingCabin,
    good: Good.Furs,
  },
  {
    building: ProductionBuilding.HuskyFarm,
    processingTimeSeconds: 120,
    productionType: ProductionType.AnimalFarm,
    good: Good.Huskies,
  },
  {
    building: ProductionBuilding.HuskySledFactory,
    processingTimeSeconds: 120,
    productionType: ProductionType.Factory,
    good: Good.HuskySleds,
  },
  {
    building: ProductionBuilding.IronMine,
    processingTimeSeconds: 15,
    productionType: ProductionType.Mine,
    good: Good.Iron,
  },
  {
    building: ProductionBuilding.Jewellers,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Jewellery,
  },
  {
    building: ProductionBuilding.LightBulbFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.LightBulbs,
  },
  {
    building: ProductionBuilding.LimestoneQuarry,
    processingTimeSeconds: 30,
    productionType: ProductionType.Mine,
    good: Good.Cement,
  },
  // LumberjacksHut = 'Lumberjack\'s Hut',
  // MotorAssemblyLine = 'Motor Assembly Line',
  // OilLampFactory = 'Oil Lamp Factory',
  // OilRefinery = 'Oil Refinery',
  // ParkaFactory = 'Parka Factory',
  // PemmicanCookhouse = 'Pemmican Cookhouse',
  // PigFarm = 'Pig Farm',
  // PlantainPlantation = 'Plantain Plantation',
  // PonchoDarner = 'Poncho Darner',
  // PotatoFarm = 'Potato Farm',
  // PrimeHuntingCabin = 'Prime Hunting Cabin',
  // RedPepperFarm = 'Red Pepper Farm',
  // RumDistillery = 'Rum Distillery',
  // Sailmakers = 'Sailmakers',
  // SaltpeterWorks = 'Saltpeter Works',
  // SandMine = 'Sand Mine',
  // Sawmill = 'Sawmill',
  // SchnappsDistillery = 'Schnapps Distillery',
  // SewingMachineFactory = 'Sewing Machine Factory',
  // SheepFarm = 'Sheep Farm',
  // Slaughterhouse = 'Slaughterhouse',
  // SleepingBagFactory = 'Sleeping Bag Factory',
  // SoapFactory = 'Soap Factory',
  // SpectacleFactory = 'Spectacle Factory',
  // Steelworks = 'Steelworks',
  // SugarCanePlantation = 'Sugar Cane Plantation',
  // TobaccoPlantation = 'Tobacco Plantation',
  // TortillaMaker = 'Tortilla Maker',
  // Vineyard = 'Vineyard',
  // WeaponFactory = 'Weapon Factory',
  // WindowFactory = 'Window Factory',
  // ZincMine = 'Zinc Mine',

  {
    building: ProductionBuilding.PotatoFarm,
    processingTimeSeconds: 30,
    productionType: ProductionType.PlantFarm,
    good: Good.Potatoes,
  },
  {
    building: ProductionBuilding.RedPepperFarm,
    processingTimeSeconds: 120,
    productionType: ProductionType.PlantFarm,
    good: Good.RedPeppers,
  },
  {
    building: ProductionBuilding.Vineyard,
    processingTimeSeconds: 120,
    productionType: ProductionType.PlantFarm,
    good: Good.Grapes,
  },
  {
    building: ProductionBuilding.SheepFarm,
    processingTimeSeconds: 30,
    productionType: ProductionType.AnimalFarm,
    good: Good.Wool,
  },
  {
    building: ProductionBuilding.PigFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.AnimalFarm,
    good: Good.Pigs,
  },
  {
    building: ProductionBuilding.Steelworks,
    processingTimeSeconds: 45,
    productionType: ProductionType.Factory,
    good: Good.SteelBeams,
  },
];

const builingsToInfo = new Map<ProductionBuilding, ProductionInfo>(buildingInfo.map(i => [i.building, i]));

export function lookupProductionInfo(building: ProductionBuilding): ProductionInfo {
  return builingsToInfo.get(building)!;
};