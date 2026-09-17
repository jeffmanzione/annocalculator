export type L10nKey =
  | 'Calculator'
  | 'About'
  | 'Default Actions'
  | 'Global Parameters'
  | 'Summary'
  | 'Trade Routes'
  | 'Add Production Line'
  | 'Add Island'
  | 'Add Trade Route'
  | 'Palace Trade Union Bonus (%)'
  | 'Island Name'
  | 'Session'
  | 'Department Policy'
  | 'Good'
  | 'Production (Total)'
  | 'Production (Net)'
  | 'Origin'
  | 'Destination'
  | 'Remove'
  | 'Island'
  | 'Local Production'
  | 'Local Consumption'
  | 'Imported'
  | 'Exported'
  | 'Building'
  | 'Count'
  | 'Extras'
  | 'Inputs'
  | 'Output'
  | 'Boosts'
  | 'Trade Union'
  | 'Items'
  | 'Cultural Sets'
  | 'Local Dept'
  | 'Efficiency'
  | 'Building Process Time'
  | 'Goods per Minute'
  | 'Extra Good'
  | 'Extra Goods'
  | 'Source'
  | 'Numerator'
  | 'Denominator'
  | 'Cancel'
  | 'Apply Changes'
  | 'Manual JSON Input'
  | 'Provides Electricity'
  | 'Yes'
  | 'No'
  | 'Productivity'
  | 'Base Productivity'
  | '/s'
  | '/m'
  | 's';

export enum Language {
  En = 'En',
  De = 'De',
  Nl = 'Nl',
  Zh = 'Zh',
}

export const languages = Object.values(Language);

export type Localization = {
  [key in Language]: string;
};

export type Localizations = {
  [key in L10nKey]: Localization;
};

export const localizations: Localizations = {
  Calculator: {
    En: 'Calculator',
    De: 'Kalkulator',
    Nl: 'Calculator',
    Zh: '计算器',
  },
  About: {
    En: 'About',
    De: 'Über uns',
    Nl: 'Over',
    Zh: '关于',
  },
  'Default Actions': {
    En: 'Default Actions',
    De: 'Standardaktionen',
    Nl: 'Standaardacties',
    Zh: '默认操作',
  },
  'Global Parameters': {
    En: 'Global Parameters',
    De: 'Globale Parameter',
    Nl: 'Algemene parameters',
    Zh: '全局参数',
  },
  Summary: {
    En: 'Summary',
    De: 'Zusammenfassung',
    Nl: 'Samenvatting',
    Zh: '摘要',
  },
  'Trade Routes': {
    En: 'Trade Routes',
    De: 'Handelsrouten',
    Nl: 'Handelsroutes',
    Zh: '贸易路线',
  },
  'Add Production Line': {
    En: 'Add Production Line',
    De: 'Produktionslinie hinzufügen',
    Nl: 'Productielijn toevoegen',
    Zh: '添加生产线',
  },
  'Add Island': {
    En: 'Add Island',
    De: 'Insel hinzufügen',
    Nl: 'Eiland toevoegen',
    Zh: '添加岛屿',
  },
  'Add Trade Route': {
    En: 'Add Trade Route',
    De: 'Handelsroute hinzufügen',
    Nl: 'Handelsroute toevoegen',
    Zh: '添加贸易路线',
  },
  'Palace Trade Union Bonus (%)': {
    En: 'Palace Trade Union Bonus (%)',
    De: 'Palast-Gewerkschaftsbonus (%)',
    Nl: 'Bonus van de paleisvakbond (%)',
    Zh: '宫廷工会奖金 (%)',
  },
  'Island Name': {
    En: 'Island Name',
    De: 'Inselname',
    Nl: 'Naam van het eiland',
    Zh: '岛屿名称',
  },
  Session: {
    En: 'Session',
    De: 'Region',
    Nl: 'Regio',
    Zh: '地区',
  },
  'Department Policy': {
    En: 'Department Policy',
    De: 'Richtlinie der Abteilung',
    Nl: 'Beleid van de afdeling',
    Zh: '部门政策',
  },
  Good: {
    En: 'Good',
    De: 'Ware',
    Nl: 'Product',
    Zh: '商品',
  },
  'Production (Total)': {
    En: 'Production (Total)',
    De: 'Produktion (gesamt)',
    Nl: 'Productie (Totaal)',
    Zh: '总产量',
  },
  'Production (Net)': {
    En: 'Production (Net)',
    De: 'Produktion (netto)',
    Nl: 'Productie (Netto)',
    Zh: '净产量',
  },
  Origin: {
    En: 'Origin',
    De: 'Herkunft',
    Nl: 'Oorsprong',
    Zh: '原产地',
  },
  Destination: {
    En: 'Destination',
    De: 'Ziel',
    Nl: 'Bestemming',
    Zh: '目的地',
  },
  Remove: {
    En: 'Remove',
    De: 'Entfernen',
    Nl: 'Verwijderen',
    Zh: '移除',
  },
  Island: {
    En: 'Island',
    De: 'Insel',
    Nl: 'Eiland',
    Zh: '岛屿',
  },
  'Local Production': {
    En: 'Local Production',
    De: 'Lokale Produktion',
    Nl: 'Lokale productie',
    Zh: '本地生产',
  },
  'Local Consumption': {
    En: 'Local Consumption',
    De: 'Lokaler Verbrauch',
    Nl: 'Lokale consumptie',
    Zh: '本地消费',
  },
  Imported: {
    En: 'Imported',
    De: 'Importiert',
    Nl: 'Geïmporteerd',
    Zh: '进口',
  },
  Exported: {
    En: 'Exported',
    De: 'Exportiert',
    Nl: 'Geëxporteerd',
    Zh: '出口',
  },
  Building: {
    En: 'Building',
    De: 'Gebäude',
    Nl: 'Gebouw',
    Zh: '生产厂房',
  },
  Count: {
    En: 'Count',
    De: 'Anzahl',
    Nl: 'Aantal',
    Zh: '数量',
  },
  Extras: {
    En: 'Extras',
    De: 'Extras',
    Nl: 'Extras',
    Zh: '额外商品',
  },
  Inputs: {
    En: 'Inputs',
    De: 'Inputs',
    Nl: 'Inputs',
    Zh: '输入',
  },
  Output: {
    En: 'Output',
    De: 'Output',
    Nl: 'Output',
    Zh: '输出',
  },
  Boosts: {
    En: 'Boosts',
    De: 'Boosts',
    Nl: 'Boosts',
    Zh: '增强',
  },
  'Trade Union': {
    En: 'Trade Union',
    De: 'Gewerkschaft',
    Nl: 'Vakbond',
    Zh: '工会',
  },
  Items: {
    En: 'Items',
    De: 'Gegenstände',
    Nl: 'Items',
    Zh: '物品',
  },
  'Cultural Sets': {
    En: 'Cultural Sets',
    De: 'Kultur-Sets',
    Nl: 'Culturele sets',
    Zh: '文化套装',
  },
  'Local Dept': {
    En: 'Local Dept',
    De: 'Lokale Abteilung',
    Nl: 'Lokale afdeling',
    Zh: '本地部门',
  },
  Efficiency: {
    En: 'Efficiency',
    De: 'Effizienz',
    Nl: 'Efficiëntie',
    Zh: '效率',
  },
  'Building Process Time': {
    En: 'Process Time',
    De: 'Bauzeit',
    Nl: 'Bouwduur',
    Zh: '加工时间',
  },
  'Goods per Minute': {
    En: 'Goods per Minute',
    De: 'Waren pro Minute',
    Nl: 'Goederen per minuut',
    Zh: '每分钟处理的商品数量',
  },
  'Extra Good': {
    En: 'Extra Good',
    De: 'Besonders gut',
    Nl: 'Extra goed',
    Zh: '额外商品',
  },
  'Extra Goods': {
    En: 'Extra Goods',
    De: 'Zusätzliche Waren',
    Nl: 'Extra goederen',
    Zh: '额外商品',
  },
  Source: {
    En: 'Source',
    De: 'Quelle',
    Nl: 'Bron',
    Zh: '来源',
  },
  Numerator: {
    En: 'Num',
    De: 'Zähler',
    Nl: 'Teller',
    Zh: '分子',
  },
  Denominator: {
    En: 'Den',
    De: 'Nenner',
    Nl: 'Noemer',
    Zh: '分母',
  },
  Cancel: {
    En: 'Cancel',
    De: 'Abbrechen',
    Nl: 'Annuleren',
    Zh: '取消',
  },
  'Apply Changes': {
    En: 'Apply Changes',
    De: 'Änderungen übernehmen',
    Nl: 'Wijzigingen toepassen',
    Zh: '应用更改',
  },
  'Manual JSON Input': {
    En: 'Manual JSON Input',
    De: 'Manuelle JSON-Eingabe',
    Nl: 'Handmatige JSON-invoer',
    Zh: '手动输入 JSON',
  },
  'Provides Electricity': {
    En: 'Provides Electricity',
    De: 'Provides Electricity',
    Nl: 'Levert elektriciteit',
    Zh: '提供电力',
  },
  Yes: {
    En: 'Yes',
    De: 'Ja',
    Nl: 'Ja',
    Zh: '是',
  },
  No: {
    En: 'No',
    De: 'Nein',
    Nl: 'Nee',
    Zh: '否',
  },
  Productivity: {
    En: 'Productivity',
    De: 'Produktivität',
    Nl: 'Productiviteit',
    Zh: '生产率',
  },
  'Base Productivity': {
    En: 'Base Productivity',
    De: 'Basisproduktivität',
    Nl: 'Basisproductiviteit',
    Zh: '基础生产率',
  },
  '/s': {
    En: '/s',
    De: '/s',
    Nl: '/s',
    Zh: '/秒',
  },
  '/m': {
    En: '/m',
    De: '/m',
    Nl: '/m',
    Zh: '/分钟',
  },
  s: {
    En: 's',
    De: 's',
    Nl: 's',
    Zh: '秒',
  },
};
