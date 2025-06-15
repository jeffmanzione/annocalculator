import { IslandView } from "./views";

export enum ProductionBuilding {
  Unknown = 'Unknown',
  AdvancedCoffeeRoaster = 'Advanced Coffee Roaster',
  AdvancedCottonMill = 'Advanced Cotton Mill',
  AdvancedRumDistillery = 'Advanced Rum Distillery',
  AlpacaFarm = 'Alpaca Farm',
  Apiary = 'Apiary',
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
  BrickDryHouse = 'Brick Dry-House',
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
  CottonMill = 'Cotton Mill',
  CottonPlantation = 'Cotton Plantation',
  DynamiteFactory = 'Dynamite Factory',
  Fishery = 'Fishery',
  FlourMill = 'Flour Mill',
  FrameworkKnitters = 'Framework Knitters',
  FriedPlantainKitchen = 'Fried Plantain Kitchen',
  FurDealer = 'Fur Dealer',
  Furnace = 'Furnace',
  Glassmakers = 'Glassmakers',
  GoatFarm = 'Goat Farm',
  GoldOreMine = 'Gold Ore Mine',
  GooseFarm = 'Goose Farm',
  GrainFarm = 'Grain Farm',
  GramophoneFactory = 'Gramophone Factory',
  HeavyWeaponsFactory = 'Heavy Weapons Factory',
  HibiscusFarm = 'Hibiscus Farm',
  HopFarm = 'Hop Farm',
  HuntingCabin = 'Hunting Cabin',
  HuskyFarm = 'Husky Farm',
  HuskySledFactory = 'Husky Sled Factory',
  IndigoFarm = 'Indigo Farm',
  IronMine = 'Iron Mine',
  Jewellers = 'Jewellers',
  LightBulbFactory = 'Light Bulb Factory',
  LimestoneQuarry = 'Limestone Mine',
  LinenMill = 'Linen Mill',
  LinseedFarm = 'Linseed Farm',
  LobsterFishery = 'Lobster Fishery',
  LumberjacksHut = 'Lumberjack\'s Hut',
  MarquetryWorkshop = 'Marquetry Workshop',
  MotorAssemblyLine = 'Motor Assembly Line',
  OilLampFactory = 'Oil Lamp Factory',
  OilRefinery = 'Oil Refinery',
  PaperMill = 'Paper Mill',
  ParkaFactory = 'Parka Factory',
  PearlFarm = 'Pearl Farm',
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
  SaltWorks = 'SaltWorks',
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
  SpiceFarm = 'Spice Farm',
  Steelworks = 'Steelworks',
  SugarCanePlantation = 'Sugar Cane Plantation',
  TailorsShop = 'Tailor\'s Shop',
  TapestryLooms = 'Tapestry Looms',
  TeaSpicer = 'Tea Spicer',
  TelephoneManufacturer = 'Telephone Manufacturer',
  TobaccoPlantation = 'Tobacco Plantation',
  TortillaMaker = 'Tortilla Maker',
  Vineyard = 'Vineyard',
  WeaponFactory = 'Weapon Factory',
  WhalingStation = 'Whaling Station',
  WindowMakers = 'Window Makers',
  ZincMine = 'Zinc Mine',
};

export enum ProductionType {
  Mine = 'Mine',
  Factory = 'Factory',
  PlantFarm = 'Plant Farm',
  AnimalFarm = 'Animal Farm',
  HuntingCabin = 'Hunting Cabin',
  Orchard = 'Orchard',
  Oil = 'Oil',
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
  CaribouMeat = 'Caribou Meat',
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
  Dynamite = 'Dynamite',
  Elevators = 'Elevators',
  Fish = 'Fish',
  Flour = 'Flour',
  FriedPlantains = 'Fried Plantains',
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
  HibiscusPetals = 'Hibiscus Petals',
  HibiscusTea = 'Hibiscus Tea',
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
  Linen = 'Linen',
  Linseed = 'Linseed',
  Lobster = 'Lobster',
  Milk = 'Milk',
  Minerals = 'Minerals',
  MudBricks = 'Mud Bricks',
  NanduFeathers = 'Nandu Feathers',
  NanduLeather = 'Nandu Leather',
  Oil = 'Oil',
  OilLamps = 'Oil Lamps',
  Pamphlets = 'Pamphlets',
  Paper = 'Paper',
  Parkas = 'Parkas',
  Pearls = 'Pearls',
  Pemmican = 'Pemmican',
  PennyFarthings = 'Penny Farthings',
  Perfumes = 'Perfumes',
  Pigs = 'Pigs',
  Plantains = 'Plantains',
  PocketWatches = 'Pocket Watches',
  Ponchos = 'Ponchos',
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
  SealSkin = 'Seal Skin',
  SewingMachines = 'Sewing Machines',
  Shampoo = 'Shampoo',
  SleepingBags = 'Sleeping Bags',
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
  Telephones = 'Telephones',
  Timber = 'Timber',
  Tobacco = 'Tobacco',
  Tortillas = 'Tortillas',
  Toys = 'Toys',
  Typewriter = 'Typewriter',
  Violins = 'Violins',
  WaterDrop = 'Water Drop',
  Weapons = 'Weapons',
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
  TracktorBarn = 'Tracktor Barn',
  Fertilizer = 'Fertilizer',
  TractorsAndFertilizer = 'Tractors & Fertilizer',
  Silo = 'Silo',
};

export enum DepartmentOfLaborPolicy {
  None = 'None',
  LandReformAct = 'Land Reform Act',
  SkilledLaborAct = 'Skilled Labor Act',
  GalvanicGrantsAct = 'Galvanic Grants Act',
  FactoryInspectionsAct = 'Factory Inspections Act',
  UnionSubsidiesAct = 'Union Subsidies Act',
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
  inRangeOfLocalDepartment?: boolean;
};

export interface IslandModel extends Model {
  name: string;
  productionLines: ProductionLineModel[];
  dolPolicy?: DepartmentOfLaborPolicy;
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
  inRangeOfLocalDepartment: false,
};

export const BASE_ISLAND_MODEL: IslandModel = {
  name: 'UNNAMED_ISLAND',
  productionLines: [],
};

export const DEFAULT_ISLAND_MODEL: IslandModel = {
  name: '',
  productionLines: [],
  dolPolicy: DepartmentOfLaborPolicy.None,
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
  requiresElectricity?: boolean;
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
  } else if (improvedByLandReformAct.has(productionBuilding) && island.dolPolicy == DepartmentOfLaborPolicy.LandReformAct) {
    return 1.5;
  } else if (improvedBySkilledLaborAct.has(productionBuilding) && island.dolPolicy == DepartmentOfLaborPolicy.SkilledLaborAct) {
    return 1. + 1. / 3.;
  } else {
    return 1.0;
  }
}

export const buildingInfo: ProductionInfo[] = [
  {
    building: ProductionBuilding.AdvancedCoffeeRoaster,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.Coffee,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.AdvancedCottonMill,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.CottonFabric,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.AdvancedRumDistillery,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.Rum,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.AlpacaFarm,
    processingTimeSeconds: 30,
    productionType: ProductionType.AnimalFarm,
    good: Good.AlpacaWool,
  },
  {
    building: ProductionBuilding.Apiary,
    processingTimeSeconds: 30,
    productionType: ProductionType.AnimalFarm,
    good: Good.Beeswax,
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
    good: Good.BearFur,
  },
  {
    building: ProductionBuilding.BicycleFactory,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.PennyFarthings,
    requiresElectricity: true,
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
    building: ProductionBuilding.BrickDryHouse,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.MudBricks,
  },
  {
    building: ProductionBuilding.BrickFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.Bricks,
  },
  {
    building: ProductionBuilding.CabAssemblyLine,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.SteamCarriages,
    requiresElectricity: true,
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
    building: ProductionBuilding.CaribouHuntingCabin,
    processingTimeSeconds: 60,
    productionType: ProductionType.HuntingCabin,
    good: Good.CaribouMeat,
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
    building: ProductionBuilding.CottonMill,
    processingTimeSeconds: 30,
    productionType: ProductionType.PlantFarm,
    good: Good.CottonFabric,
  },
  {
    building: ProductionBuilding.CottonPlantation,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    good: Good.Cotton,
  },
  {
    building: ProductionBuilding.DynamiteFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.Dynamite,
  },
  {
    building: ProductionBuilding.Fishery,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Fish,
  },
  {
    building: ProductionBuilding.FlourMill,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Flour,
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
    good: Good.FriedPlantains,
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
    building: ProductionBuilding.Glassmakers,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Glass,
  },
  {
    building: ProductionBuilding.GoatFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.AnimalFarm,
    good: Good.GoatMilk,
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
    processingTimeSeconds: 120,
    productionType: ProductionType.Factory,
    good: Good.Gramophones,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.HeavyWeaponsFactory,
    processingTimeSeconds: 120,
    productionType: ProductionType.Factory,
    good: Good.AdvancedWeapons,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.HibiscusFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    good: Good.HibiscusPetals,
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
    building: ProductionBuilding.IndigoFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    good: Good.IndigoDye,
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
  {
    building: ProductionBuilding.LinenMill,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Linen,
  },
  {
    building: ProductionBuilding.LinseedFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    good: Good.Linseed,
  },
  {
    building: ProductionBuilding.LobsterFishery,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.Lobster,
  },
  {
    building: ProductionBuilding.LumberjacksHut,
    processingTimeSeconds: 15,
    productionType: ProductionType.Orchard,
    good: Good.Wood,
  },
  {
    building: ProductionBuilding.MarquetryWorkshop,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.WoodVeneers,
  },
  {
    building: ProductionBuilding.MotorAssemblyLine,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    good: Good.SteamMotors,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.OilLampFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.OilLamps,
  },
  {
    building: ProductionBuilding.OilRefinery,
    processingTimeSeconds: 15,
    productionType: ProductionType.Oil,
    good: Good.Oil,
  },
  {
    building: ProductionBuilding.PaperMill,
    processingTimeSeconds: 15,
    productionType: ProductionType.Factory,
    good: Good.Paper,
  },
  {
    building: ProductionBuilding.ParkaFactory,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    good: Good.Parkas,
  },
  {
    building: ProductionBuilding.PearlFarm,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    good: Good.Pearls,
  },
  {
    building: ProductionBuilding.PemmicanCookhouse,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.Pemmican,
  },
  {
    building: ProductionBuilding.PigFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.AnimalFarm,
    good: Good.Pigs,
  },
  {
    building: ProductionBuilding.PlantainPlantation,
    processingTimeSeconds: 30,
    productionType: ProductionType.PlantFarm,
    good: Good.Plantains,
  },
  {
    building: ProductionBuilding.PonchoDarner,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Ponchos,
  },
  {
    building: ProductionBuilding.PotatoFarm,
    processingTimeSeconds: 30,
    productionType: ProductionType.PlantFarm,
    good: Good.Potatoes,
  },
  {
    building: ProductionBuilding.PrimeHuntingCabin,
    processingTimeSeconds: 15,
    productionType: ProductionType.HuntingCabin,
    good: Good.Furs,
  },
  {
    building: ProductionBuilding.RedPepperFarm,
    processingTimeSeconds: 120,
    productionType: ProductionType.PlantFarm,
    good: Good.RedPeppers,
  },
  {
    building: ProductionBuilding.RumDistillery,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.Rum,
  },
  {
    building: ProductionBuilding.Sailmakers,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Sails,
  },
  {
    building: ProductionBuilding.SaltWorks,
    processingTimeSeconds: 90,
    productionType: ProductionType.Mine,
    good: Good.Salt,
  },
  {
    building: ProductionBuilding.SaltpeterWorks,
    processingTimeSeconds: 120,
    productionType: ProductionType.Mine,
    good: Good.Saltpetre,
  },
  {
    building: ProductionBuilding.SandMine,
    processingTimeSeconds: 30,
    productionType: ProductionType.Mine,
    good: Good.QuartzSand,
  },
  {
    building: ProductionBuilding.Sawmill,
    processingTimeSeconds: 15,
    productionType: ProductionType.Factory,
    good: Good.Timber,
  },
  {
    building: ProductionBuilding.SealHuntingDocks,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.SealSkin,
  },
  {
    building: ProductionBuilding.SchnappsDistillery,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Schnapps,
  },
  {
    building: ProductionBuilding.SewingMachineFactory,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.SewingMachines,
  },
  {
    building: ProductionBuilding.SheepFarm,
    processingTimeSeconds: 30,
    productionType: ProductionType.AnimalFarm,
    good: Good.Wool,
  },
  {
    building: ProductionBuilding.Slaughterhouse,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.Sausages,
  },
  {
    building: ProductionBuilding.SleepingBagFactory,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.SleepingBags,
  },
  {
    building: ProductionBuilding.SoapFactory,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Soap,
  },
  {
    building: ProductionBuilding.SpectacleFactory,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    good: Good.Glasses,
  },
  {
    building: ProductionBuilding.SpiceFarm,
    processingTimeSeconds: 60,
    productionType: ProductionType.PlantFarm,
    good: Good.Spices,
  },
  {
    building: ProductionBuilding.Steelworks,
    processingTimeSeconds: 45,
    productionType: ProductionType.Factory,
    good: Good.SteelBeams,
  },
  {
    building: ProductionBuilding.SugarCanePlantation,
    processingTimeSeconds: 30,
    productionType: ProductionType.PlantFarm,
    good: Good.SugarCane,
  },
  {
    building: ProductionBuilding.TapestryLooms,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Tapestries,
  },
  {
    building: ProductionBuilding.TailorsShop,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.TailoredSuits,
  },
  {
    building: ProductionBuilding.TeaSpicer,
    processingTimeSeconds: 90,
    productionType: ProductionType.PlantFarm,
    good: Good.HibiscusTea,
  },
  {
    building: ProductionBuilding.TelephoneManufacturer,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    good: Good.Telephones,
    requiresElectricity: true,
  },
  {
    building: ProductionBuilding.TobaccoPlantation,
    processingTimeSeconds: 120,
    productionType: ProductionType.PlantFarm,
    good: Good.Tobacco,
  },
  {
    building: ProductionBuilding.TortillaMaker,
    processingTimeSeconds: 30,
    productionType: ProductionType.Factory,
    good: Good.Tortillas,
  },
  {
    building: ProductionBuilding.Vineyard,
    processingTimeSeconds: 120,
    productionType: ProductionType.PlantFarm,
    good: Good.Grapes,
  },
  {
    building: ProductionBuilding.WeaponFactory,
    processingTimeSeconds: 90,
    productionType: ProductionType.Factory,
    good: Good.Weapons,
  },
  {
    building: ProductionBuilding.WhalingStation,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.WhaleOil,
  },
  {
    building: ProductionBuilding.WindowMakers,
    processingTimeSeconds: 60,
    productionType: ProductionType.Factory,
    good: Good.Windows,
  },
  {
    building: ProductionBuilding.ZincMine,
    processingTimeSeconds: 30,
    productionType: ProductionType.Mine,
    good: Good.Zinc,
  },
];

const builingsToInfo = new Map<ProductionBuilding, ProductionInfo>(buildingInfo.map(i => [i.building, i]));

export function lookupProductionInfo(building: ProductionBuilding): ProductionInfo {
  return builingsToInfo.get(building)!;
};

export function requiresElectricity(building: ProductionBuilding): boolean {
  return builingsToInfo.get(building)?.requiresElectricity ?? false;
}

export function allowedBoosts(building: ProductionBuilding): BoostType[] {
  const info = lookupProductionInfo(building);
  if (!info) {
    return [BoostType.None];
  }
  if (info.productionType == ProductionType.AnimalFarm) {
    return [BoostType.None, BoostType.Silo];
  } else if (info.productionType == ProductionType.Factory) {
    return [BoostType.None, BoostType.Electricity];
  } else if (info.productionType == ProductionType.Mine) {
    return [BoostType.None, BoostType.Electricity];
  } else if (info.productionType == ProductionType.PlantFarm) {
    return [BoostType.None, BoostType.TracktorBarn, BoostType.Fertilizer, BoostType.TractorsAndFertilizer];
  }
  return [BoostType.None];
}

// for (const building of Object.values(ProductionBuilding)) {
//   if (!builingsToInfo.has(building)) {
//     console.log(building);
//   }
// }

// const usedGoods = new Set<Good>(buildingInfo.map(info => info.good));
// for (const good of Object.values(Good)) {
//   if (!usedGoods.has(good)) {
//     console.log(good);
//   }
// }