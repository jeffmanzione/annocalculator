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
  | 'Cancel'
  | 'Apply Changes'
  | 'Remove'
  | 'Palace Prestige Level'
  | 'Island Name'
  | 'Session'
  | 'Department Policy'
  | 'Good'
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
  | 'Fert Works'
  | 'Efficiency'
  | 'Building Process Time'
  | 'Goods per Minute'
  | 'Extra Good'
  | 'Extra Goods'
  | 'Source'
  | 'Numerator'
  | 'Denominator'
  | 'None'
  | 'Production (Total)'
  | 'Production (Net)'
  | 'Origin'
  | 'Destination'
  | 'Island'
  | 'Local Production'
  | 'Local Consumption'
  | 'Imported'
  | 'Exported'
  | 'Base Production'
  | 'Replaces'
  | 'Specialist'
  | 'Uncovered Deficit Explanation'
  | 'Provides Electricity'
  | 'Yes'
  | 'No'
  | 'Productivity'
  | 'Base Productivity'
  | 'Common'
  | 'Uncommon'
  | 'Rare'
  | 'Epic'
  | 'Legendary'
  | '/s'
  | '/m'
  | 's'
  | 'Copy the JSON representation of your inputs to your clipboard.'
  | 'Manually edit the JSON inputs.'
  | 'Reset the inputs to a default example.'
  | 'Completely clear the inputs.'
  | 'Add trade route.'
  | 'Manual JSON Input'
  | 'Save Dialog Instructions'
  | 'About Disclaimer Label'
  | 'About Disclaimer Text'
  | 'About Tool Heading'
  | 'About Tool Intro'
  | 'About Tool Details'
  | 'About Features Heading'
  | 'About Feature Chains'
  | 'About Feature Summary'
  | 'About Feature Regions'
  | 'About Feature Effects'
  | 'About Feature Specialists'
  | 'About Feature Save'
  | 'About Feature JSON'
  | 'About Tool Audience'
  | 'About Why Heading'
  | 'About Why Text'
  | 'About Save Heading'
  | 'About Save Text'
  | 'About Feedback Heading'
  | 'About Feedback Intro'
  | 'About Feedback Link'
  | 'About Feedback Outro';

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
    De: 'Rechner',
    Nl: 'Rekenmachine',
    Zh: '计算器',
  },
  About: {
    En: 'About',
    De: 'Info',
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
    Zh: '汇总',
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
  Remove: {
    En: 'Remove',
    De: 'Entfernen',
    Nl: 'Wissen',
    Zh: '移除',
  },
  'Palace Prestige Level': {
    En: 'Palace Prestige Level',
    De: 'Prestigestufe des Palasts',
    Nl: 'Prestigeniveau van het paleis',
    Zh: '宫殿声望等级',
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
    Zh: '区域',
  },
  'Department Policy': {
    En: 'Department Policy',
    De: 'Gesetz der Arbeitsbehörde',
    Nl: 'Beleid van het arbeidsbureau',
    Zh: '劳工部政策',
  },
  Good: {
    En: 'Good',
    De: 'Ware',
    Nl: 'Goed',
    Zh: '商品',
  },
  Building: {
    En: 'Building',
    De: 'Gebäude',
    Nl: 'Gebouw',
    Zh: '建筑',
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
    Nl: 'Extra',
    Zh: '额外',
  },
  Inputs: {
    En: 'Inputs',
    De: 'Eingangswaren',
    Nl: 'Benodigde goederen',
    Zh: '原料',
  },
  Output: {
    En: 'Output',
    De: 'Produkt',
    Nl: 'Product',
    Zh: '产出',
  },
  Boosts: {
    En: 'Boosts',
    De: 'Boosts',
    Nl: 'Boosts',
    Zh: '增益',
  },
  'Trade Union': {
    En: 'Trade Union',
    De: 'Gewerk­schaft',
    Nl: 'Vakbond',
    Zh: '工会',
  },
  Items: {
    En: 'Items',
    De: 'Gegenstände',
    Nl: 'Voorwerpen',
    Zh: '物品',
  },
  'Cultural Sets': {
    En: 'Cultural Sets',
    De: 'Kultursets',
    Nl: 'Culturele sets',
    Zh: '文化套装',
  },
  'Local Dept': {
    En: 'Local Dept',
    De: 'Lokales Amt',
    Nl: 'Lokaal bureau',
    Zh: '本地劳工部',
  },
  'Fert Works': {
    En: 'Fert Works',
    De: 'Düngerwerk',
    Nl: 'Mestfabriek',
    Zh: '肥料厂',
  },
  Efficiency: {
    En: 'Efficiency',
    De: 'Effizienz',
    Nl: 'Efficiëntie',
    Zh: '效率',
  },
  'Building Process Time': {
    En: 'Process Time',
    De: 'Dauer',
    Nl: 'Duur',
    Zh: '生产时间',
  },
  'Goods per Minute': {
    En: 'Goods per Minute',
    De: 'Waren pro Minute',
    Nl: 'Goederen per minuut',
    Zh: '每分钟产量',
  },
  'Extra Good': {
    En: 'Extra Good',
    De: 'Zusatzware',
    Nl: 'Extra goed',
    Zh: '额外商品',
  },
  'Extra Goods': {
    En: 'Extra Goods',
    De: 'Zusatzwaren',
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
  None: {
    En: 'None',
    De: 'Keine',
    Nl: 'Geen',
    Zh: '无',
  },
  'Production (Total)': {
    En: 'Production (Total)',
    De: 'Produktion (gesamt)',
    Nl: 'Productie (totaal)',
    Zh: '总产量',
  },
  'Production (Net)': {
    En: 'Production (Net)',
    De: 'Produktion (netto)',
    Nl: 'Productie (netto)',
    Zh: '净产量',
  },
  Origin: {
    En: 'Origin',
    De: 'Start',
    Nl: 'Herkomst',
    Zh: '起点',
  },
  Destination: {
    En: 'Destination',
    De: 'Ziel',
    Nl: 'Bestemming',
    Zh: '终点',
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
    Zh: '本地产量',
  },
  'Local Consumption': {
    En: 'Local Consumption',
    De: 'Lokaler Verbrauch',
    Nl: 'Lokaal verbruik',
    Zh: '本地消耗',
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
  Replaces: {
    En: 'Replaces',
    De: 'Ersetzt',
    Nl: 'Vervangt',
    Zh: '替代',
  },
  Specialist: {
    En: 'Specialist',
    De: 'Spezialist',
    Nl: 'Specialist',
    Zh: '专家',
  },
  'Base Production': {
    En: 'Base Production',
    De: 'Basisproduktion',
    Nl: 'Basisproductie',
    Zh: '基础产量',
  },
  'Uncovered Deficit Explanation': {
    En: 'Enough of this good is produced overall, but some islands run a deficit that no trade route covers. Add a trade route from an island with a surplus.',
    De: 'Insgesamt wird genug von dieser Ware produziert, aber einige Inseln haben ein Defizit, das durch keine Handelsroute gedeckt wird. Füge eine Handelsroute von einer Insel mit Überschuss hinzu.',
    Nl: 'In totaal wordt er genoeg van dit goed geproduceerd, maar sommige eilanden hebben een tekort dat door geen enkele handelsroute wordt gedekt. Voeg een handelsroute toe vanaf een eiland met een overschot.',
    Zh: '该商品的总产量足够，但部分岛屿存在缺口，且没有任何贸易路线可以补足。请添加一条从有盈余的岛屿出发的贸易路线。',
  },
  'Provides Electricity': {
    En: 'Provides Electricity',
    De: 'Liefert Strom',
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
  Common: {
    En: 'Common',
    De: 'Gewöhnlich',
    Nl: 'Gewoon',
    Zh: '普通',
  },
  Uncommon: {
    En: 'Uncommon',
    De: 'Ungewöhnlich',
    Nl: 'Ongewoon',
    Zh: '少见',
  },
  Rare: {
    En: 'Rare',
    De: 'Selten',
    Nl: 'Zeldzaam',
    Zh: '稀有',
  },
  Epic: {
    En: 'Epic',
    De: 'Episch',
    Nl: 'Episch',
    Zh: '史诗',
  },
  Legendary: {
    En: 'Legendary',
    De: 'Legendär',
    Nl: 'Legendarisch',
    Zh: '传奇',
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
    Zh: '/分',
  },
  s: {
    En: 's',
    De: 's',
    Nl: 's',
    Zh: '秒',
  },
  'Copy the JSON representation of your inputs to your clipboard.': {
    En: 'Copy the JSON representation of your inputs to your clipboard.',
    De: 'Kopiert die JSON-Darstellung deiner Eingaben in die Zwischenablage.',
    Nl: 'Kopieert de JSON-weergave van je invoer naar het klembord.',
    Zh: '将输入内容的 JSON 复制到剪贴板。',
  },
  'Manually edit the JSON inputs.': {
    En: 'Manually edit the JSON inputs.',
    De: 'JSON-Eingaben manuell bearbeiten.',
    Nl: 'Bewerk de JSON-invoer handmatig.',
    Zh: '手动编辑 JSON 输入。',
  },
  'Reset the inputs to a default example.': {
    En: 'Reset the inputs to a default example.',
    De: 'Setzt die Eingaben auf ein Standardbeispiel zurück.',
    Nl: 'Zet de invoer terug naar een standaardvoorbeeld.',
    Zh: '将输入重置为默认示例。',
  },
  'Completely clear the inputs.': {
    En: 'Completely clear the inputs.',
    De: 'Löscht alle Eingaben vollständig.',
    Nl: 'Wis alle invoer volledig.',
    Zh: '完全清除所有输入。',
  },
  'Add trade route.': {
    En: 'Add trade route.',
    De: 'Handelsroute hinzufügen.',
    Nl: 'Handelsroute toevoegen.',
    Zh: '添加贸易路线。',
  },
  'Manual JSON Input': {
    En: 'Manual JSON Input',
    De: 'Manuelle JSON-Eingabe',
    Nl: 'Handmatige JSON-invoer',
    Zh: '手动输入 JSON',
  },
  'Save Dialog Instructions': {
    En: 'Paste or edit the calculator input JSON here. Make sure your JSON is valid—invalid changes will be ignored. Use this feature to share, backup, or restore your calculator state.',
    De: 'Füge hier das Eingabe-JSON des Rechners ein oder bearbeite es. Achte darauf, dass dein JSON gültig ist – ungültige Änderungen werden ignoriert. Mit dieser Funktion kannst du deinen Rechnerstand teilen, sichern oder wiederherstellen.',
    Nl: 'Plak of bewerk hier de invoer-JSON van de calculator. Zorg dat je JSON geldig is – ongeldige wijzigingen worden genegeerd. Gebruik deze functie om je calculatorstatus te delen, een back-up te maken of te herstellen.',
    Zh: '在此粘贴或编辑计算器的输入 JSON。请确保 JSON 有效——无效的更改将被忽略。可用此功能分享、备份或恢复计算器状态。',
  },
  'About Disclaimer Label': {
    En: 'Disclaimer:',
    De: 'Haftungsausschluss:',
    Nl: 'Disclaimer:',
    Zh: '免责声明：',
  },
  'About Disclaimer Text': {
    En: 'This is a fan-made tool and is not affiliated with, endorsed by, or in any way officially connected with Ubisoft or the Anno series. All trademarks and copyrights related to Anno 1800 are the property of Ubisoft.',
    De: 'Dies ist ein von Fans erstelltes Tool und steht in keiner Verbindung zu Ubisoft oder der Anno-Reihe, wird nicht von ihnen unterstützt und ist in keiner Weise offiziell mit ihnen verbunden. Alle Marken und Urheberrechte im Zusammenhang mit Anno 1800 sind Eigentum von Ubisoft.',
    Nl: 'Dit is een door fans gemaakte tool en is op geen enkele manier verbonden met, goedgekeurd door of officieel gelieerd aan Ubisoft of de Anno-serie. Alle handelsmerken en auteursrechten met betrekking tot Anno 1800 zijn eigendom van Ubisoft.',
    Zh: '这是一个由粉丝制作的工具，与育碧或《纪元》系列没有任何隶属、认可或官方关联。与《纪元 1800》相关的所有商标和版权均归育碧所有。',
  },
  'About Tool Heading': {
    En: 'About This Tool',
    De: 'Über dieses Tool',
    Nl: 'Over deze tool',
    Zh: '关于本工具',
  },
  'About Tool Intro': {
    En: "Welcome to the Anno 1800 Production Calculator - your companion for efficient city planning and production optimization in Ubisoft's Anno 1800.",
    De: 'Willkommen beim Anno-1800-Produktionsrechner – dein Begleiter für effiziente Stadtplanung und Produktionsoptimierung in Ubisofts Anno 1800.',
    Nl: 'Welkom bij de Anno 1800 Productiecalculator – je metgezel voor efficiënte stadsplanning en productieoptimalisatie in Ubisofts Anno 1800.',
    Zh: '欢迎使用《纪元 1800》生产计算器——高效规划城市、优化生产的得力助手。',
  },
  'About Tool Details': {
    En: "Whether you're managing your Crown Falls metropolis or just starting your first island in the Old World, this tool helps you determine exactly how many production buildings you need to satisfy your population's demands, streamline trade between islands, and keep your economy running smoothly.",
    De: 'Ob du deine Metropole in Crown Falls verwaltest oder gerade erst deine erste Insel in der Alten Welt beginnst: Dieses Tool hilft dir, genau zu bestimmen, wie viele Produktionsgebäude du brauchst, um den Bedarf deiner Bevölkerung zu decken, den Handel zwischen den Inseln zu optimieren und deine Wirtschaft reibungslos am Laufen zu halten.',
    Nl: 'Of je nu je metropool in Crown Falls beheert of net je eerste eiland in de Oude Wereld begint: deze tool helpt je precies te bepalen hoeveel productiegebouwen je nodig hebt om aan de vraag van je bevolking te voldoen, de handel tussen eilanden te stroomlijnen en je economie soepel draaiende te houden.',
    Zh: '无论你是在管理 Crown Falls 的大都市，还是刚在旧世界建立第一座岛屿，这个工具都能帮你精确计算需要多少生产建筑来满足人口需求、理顺岛屿之间的贸易，并让经济平稳运转。',
  },
  'About Features Heading': {
    En: 'What This Tool Does',
    De: 'Was dieses Tool kann',
    Nl: 'Wat deze tool doet',
    Zh: '功能简介',
  },
  'About Feature Chains': {
    En: 'Design production chains for maximal efficiency',
    De: 'Produktionsketten für maximale Effizienz entwerfen',
    Nl: 'Ontwerp productieketens voor maximale efficiëntie',
    Zh: '设计效率最大化的生产链',
  },
  'About Feature Summary': {
    En: 'Summarize global good production to easily view missing production for specific goods',
    De: 'Fasst die weltweite Warenproduktion zusammen, um fehlende Produktion bestimmter Waren leicht zu erkennen',
    Nl: 'Vat de wereldwijde goederenproductie samen om ontbrekende productie van specifieke goederen eenvoudig te zien',
    Zh: '汇总全局商品产量，轻松发现特定商品的产量缺口',
  },
  'About Feature Regions': {
    En: 'Support all regions: Old World, New World, Cape Trelawney, Arctic, and Enbesa',
    De: 'Unterstützt alle Regionen: Alte Welt, Neue Welt, Kap Trelawney, Arktis und Enbesa',
    Nl: "Ondersteunt alle regio's: Oude Wereld, Nieuwe Wereld, Kaap Trelawney, Arctica en Enbesa",
    Zh: '支持所有区域：旧世界、新世界、特里劳尼角、北极和恩贝萨',
  },
  'About Feature Effects': {
    En: 'Allows you to customize your production chains accounting for palace, trade union, harbor, and item effects as well as tractor barn boosts',
    De: 'Ermöglicht die Anpassung deiner Produktionsketten unter Berücksichtigung von Palast-, Gewerkschafts-, Hafen- und Gegenstandseffekten sowie Traktorscheunen-Boosts',
    Nl: 'Hiermee kun je je productieketens aanpassen met de effecten van paleis, vakbond, haven en voorwerpen, plus tractorschuur-boosts',
    Zh: '可自定义生产链，计入宫殿、工会、港口和物品的效果，以及拖拉机棚的增益',
  },
  'About Feature Specialists': {
    En: 'Includes the entire catalog of specialists and their effects including exchanging inputs and extra goods',
    De: 'Enthält den gesamten Katalog an Spezialisten und ihrer Effekte, einschließlich des Austauschs von Eingangswaren und Zusatzwaren',
    Nl: 'Bevat de volledige catalogus van specialisten en hun effecten, inclusief het omwisselen van invoergoederen en extra goederen',
    Zh: '收录全部专家及其效果，包括原料替换与额外商品',
  },
  'About Feature Save': {
    En: 'Save and load your plans: export your setup as JSON for safekeeping or sharing',
    De: 'Pläne speichern und laden: Exportiere dein Setup als JSON zur Sicherung oder zum Teilen',
    Nl: 'Sla je plannen op en laad ze: exporteer je opzet als JSON om te bewaren of te delen',
    Zh: '保存与载入方案：将设置导出为 JSON，便于备份或分享',
  },
  'About Feature JSON': {
    En: 'Fine-tune production manually via the advanced JSON editor',
    De: 'Produktion über den erweiterten JSON-Editor manuell feinjustieren',
    Nl: 'Stem de productie handmatig af via de geavanceerde JSON-editor',
    Zh: '通过高级 JSON 编辑器手动微调生产',
  },
  'About Tool Audience': {
    En: "This calculator is designed to be both beginner-friendly and powerful for advanced players who want full control over their empire's supply lines.",
    De: 'Dieser Rechner ist sowohl einsteigerfreundlich als auch leistungsstark für fortgeschrittene Spieler, die die volle Kontrolle über die Versorgungslinien ihres Imperiums wollen.',
    Nl: 'Deze calculator is zowel beginnersvriendelijk als krachtig voor gevorderde spelers die volledige controle willen over de bevoorradingslijnen van hun rijk.',
    Zh: '这款计算器既适合新手上手，也足够强大，让进阶玩家完全掌控帝国的补给线。',
  },
  'About Why Heading': {
    En: 'Why It Exists',
    De: 'Warum es das gibt',
    Nl: 'Waarom het bestaat',
    Zh: '创作初衷',
  },
  'About Why Text': {
    En: "Anno 1800's complexity is part of its beauty, but it can also be overwhelming. Originally, I was satisfied with the statistics tab in the game, but it lacked the ability to plan ahead since you have to actually build the buildings to see the goods produced. So then I used spreadsheets to plan out my islands and production chains with formulas, but as my population grew past 100k residents, min-maxing became necessary to fulfill their needs efficiently with the island space available. The spreadsheet formulas I used became increasingly complex, unmanageable, and frustrating. This site was born out of that frustration. Hopefully it will make your production planning faster, more intuitive, and actually enjoyable. You won't need to guess whether you produce enough at each step in your production chain.",
    De: 'Die Komplexität von Anno 1800 gehört zu seinem Reiz, kann aber auch überwältigend sein. Ursprünglich war ich mit dem Statistik-Tab im Spiel zufrieden, aber er erlaubt keine vorausschauende Planung, weil man die Gebäude erst bauen muss, um die produzierten Waren zu sehen. Also habe ich meine Inseln und Produktionsketten mit Formeln in Tabellenkalkulationen geplant. Doch als meine Bevölkerung über 100.000 Einwohner wuchs, wurde Min-Maxing notwendig, um ihren Bedarf mit dem verfügbaren Platz auf den Inseln effizient zu decken. Die Formeln in meinen Tabellen wurden immer komplexer, unübersichtlicher und frustrierender. Aus diesem Frust ist diese Seite entstanden. Hoffentlich macht sie deine Produktionsplanung schneller, intuitiver und tatsächlich unterhaltsam. Du musst nicht mehr raten, ob du in jedem Schritt deiner Produktionskette genug produzierst.',
    Nl: 'De complexiteit van Anno 1800 is een deel van de charme, maar kan ook overweldigend zijn. Oorspronkelijk was ik tevreden met het statistiekenscherm in het spel, maar daarmee kun je niet vooruit plannen, omdat je de gebouwen eerst moet bouwen om de geproduceerde goederen te zien. Daarom plande ik mijn eilanden en productieketens met formules in spreadsheets. Maar toen mijn bevolking groeide tot boven de 100.000 inwoners, werd min-maxen nodig om hun behoeften efficiënt te vervullen met de beschikbare ruimte op het eiland. De formules in mijn spreadsheets werden steeds complexer, onbeheersbaarder en frustrerender. Deze site is uit die frustratie geboren. Hopelijk maakt hij je productieplanning sneller, intuïtiever en vooral leuker. Je hoeft niet meer te gokken of je in elke stap van je productieketen genoeg produceert.',
    Zh: '《纪元 1800》的复杂性是它魅力的一部分，但也可能让人应接不暇。起初我对游戏内的统计页面还算满意，但它无法提前规划——必须先把建筑真正建出来，才能看到产出的商品。于是我改用电子表格和公式来规划岛屿和生产链。可当人口增长到十万以上，为了在有限的岛屿空间内高效满足居民需求，就必须精打细算，而我的表格公式也变得越来越复杂、难以维护，令人沮丧。这个网站正是诞生于这种挫败感。希望它能让你的生产规划更快、更直观，也真正更有乐趣。你再也不用猜测生产链的每一步产量是否足够了。',
  },
  'About Save Heading': {
    En: 'Save Your Work',
    De: 'Deinen Fortschritt speichern',
    Nl: 'Je werk opslaan',
    Zh: '保存你的成果',
  },
  'About Save Text': {
    En: "The site uses local browser storage so your world will persist between visits to the site and page reloads. Note that your world will be lost if you clear site data. To keep your world, you can export your production data as JSON and re-import it later to continue exactly where you left off. There's also a manual edit feature for users who want to tweak or share their data directly... for whatever reason.",
    De: 'Die Seite nutzt den lokalen Browserspeicher, damit deine Welt zwischen Besuchen und beim Neuladen der Seite erhalten bleibt. Beachte, dass deine Welt verloren geht, wenn du die Websitedaten löschst. Um sie zu behalten, kannst du deine Produktionsdaten als JSON exportieren und später wieder importieren, um genau dort weiterzumachen, wo du aufgehört hast. Außerdem gibt es eine manuelle Bearbeitungsfunktion für alle, die ihre Daten direkt anpassen oder teilen möchten ... aus welchem Grund auch immer.',
    Nl: 'De site gebruikt de lokale opslag van je browser, zodat je wereld bewaard blijft tussen bezoeken en na het herladen van de pagina. Let op: je wereld gaat verloren als je de sitegegevens wist. Om je wereld te bewaren kun je je productiegegevens als JSON exporteren en later weer importeren om precies verder te gaan waar je gebleven was. Er is ook een functie voor handmatig bewerken voor wie zijn gegevens rechtstreeks wil aanpassen of delen... om wat voor reden dan ook.',
    Zh: '本站使用浏览器本地存储，因此你的世界会在多次访问和刷新页面之间保留。请注意，清除网站数据会导致你的世界丢失。若想长期保存，可以将生产数据导出为 JSON，之后再导入，从上次中断的地方继续。另外还提供手动编辑功能，供想要直接调整或分享数据的用户使用……不管出于什么原因。',
  },
  'About Feedback Heading': {
    En: 'Feedback',
    De: 'Feedback',
    Nl: 'Feedback',
    Zh: '反馈',
  },
  'About Feedback Intro': {
    En: 'Have suggestions, spot a bug, or want to request a feature?',
    De: 'Hast du Vorschläge, einen Fehler entdeckt oder möchtest eine Funktion anfragen?',
    Nl: 'Heb je suggesties, een bug gevonden of wil je een functie aanvragen?',
    Zh: '有建议、发现了 bug，或想要新功能？',
  },
  'About Feedback Link': {
    En: 'Create an issue',
    De: 'Erstelle ein Issue',
    Nl: 'Maak een issue aan',
    Zh: '提交 Issue',
  },
  'About Feedback Outro': {
    En: "on GitHub. I'll do my best to accommodate your request.",
    De: 'auf GitHub. Ich gebe mein Bestes, deinen Wunsch zu erfüllen.',
    Nl: 'op GitHub. Ik doe mijn best om aan je verzoek tegemoet te komen.',
    Zh: '到 GitHub。我会尽力满足你的请求。',
  },
};
