import proj4 from "proj4";

export const proj4326 = proj4.defs("EPSG:4326");
export const proj3857 = proj4.defs("EPSG:3857");

// Niveaux de zoom des tuiles
export const ZOOM_RES_L93 = [
  156543.033928041,
  78271.5169640205,
  39135.7584820102,
  19567.8792410051,
  9783.9396205026,
  4891.9698102513,
  2445.9849051256,
  1222.9924525628,
  611.4962262814,
  305.7481131407,
  152.8740565704,
  76.4370282852,
  38.2185141426,
  19.1092570713,
  9.5546285356,
  4.7773142678,
  2.3886571339,
  1.194328567,
  0.5971642835,
  0.2985821417,
  0.1492910709,
  0.0746455354
];

/**
 * L'objet bounds contient une entrée pour chaque niveau de zoom dans ZOOM_RES_L93
 * où la clé est la résolution pour ce niveau de zoom 
 * et la valeur est un tableau bidimensionnel représentant les limites de la tuile correspondante. 
 */
export const bounds = {
  19.1092570713: [[103950.31133371031, 6430303.649541902], [122178.02655277702, 6409178.693479394]],
  9.5546285356: [[103898.96137217121, 6430323.767097442], [122477.25393651777, 6409059.102844761]],
  4.7773142678: [[103793.70980829078, 6430373.859022416], [122862.67733641303, 6408924.439907007]],
  2.3886571339: [[103592.19079469221, 6430451.945007115], [123961.67363710815, 6408383.992509846]],
  1.194328567: [[103016.65217981148, 6430697.093516546], [125918.3925929945, 6407902.676825357]],
  0.5971642835: [[102775.35468312245, 6430792.059502681], [129531.47002117695, 6407565.757554211]],
  0.2985821417: [[102175.95923056673, 6431655.624031359], [134587.86605129016, 6409108.60248021]],
  0.1492910709: [[101517.26171713426, 6433162.820854582], [162041.48828865882, 6394327.021226578]],
  0.0746455354: [[93415.88754039505, 6434887.421111339], [137608.6844003899, 6404981.199786327]],
  38.2185141426: [[77759.67642890716, 6453645.108348264], [162041.48828865882, 6394327.021226578]],
  76.4370282852: [[46867.49731435806, 6463965.788270289], [190229.05087361464, 6381561.102922285]],
  152.8740565704: [[11082.303872492703, 6487588.803902964], [233245.68091940563, 6361609.9461077275]],
  305.7481131407: [[-77622.97172217448, 6537698.262988056], [325214.31087391765, 6316660.855326671]],
  611.4962262814: [[-153484.202064479, 6586056.07380685], [398837.02476826444, 6266207.419099107]],
  1222.9924525628: [[-470958.09319029807, 6714000.726694639], [683064.2506090228, 6125552.848535676]],
  2445.9849051256: [[-1121673.3972982473, 6993515.64040788], [1343242.431165884, 5720716.03511572]],
  4891.9698102513: [[-703625.8405616011, 6762759.056482348], [1268067.7459551014, 5231404.510116733]],
  9783.9396205026: [[-703625.8405616011, 6762759.056482348], [1268067.7459551014, 5231404.510116733]],
  19567.8792410051: [[-703625.8405616011, 6762759.056482348], [1268067.7459551014, 5231404.510116733]],
  39135.7584820102: [[-703625.8405616011, 6762759.056482348], [1268067.7459551014, 5231404.510116733]],
  78271.5169640205: [[-703625.8405616011, 6762759.056482348], [1268067.7459551014, 5231404.510116733]],
  156543.033928041: [[-703625.8405616011, 6762759.056482348], [1268067.7459551014, 5231404.510116733]]
};