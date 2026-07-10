// Reference ranges and Hashimoto's-specific context for each lab marker.
// "optimal" ranges reflect functional medicine targets often recommended for
// Hashimoto's patients, which can differ from standard lab reference ranges.

export const MARKERS = [
  {
    id: 'tsh',
    name: 'TSH',
    fullName: 'Thyroid Stimulating Hormone',
    unit: 'mIU/L',
    category: 'thyroid',
    aliases: [
      // English
      'tsh', 'thyroid stimulating hormone', 'thyrotropin', 'tsh 3rd generation', 'tsh third generation', 'tsh reflex', 'thyroid stim hormone',
      // Spanish
      'hormona estimulante de la tiroides', 'hormona estimulante del tiroides', 'tirotropina', 'hormona tireoestimulante',
      // Portuguese
      'hormônio estimulante da tireoide', 'hormônio tireotrófico', 'tireotropina',
      // French
      'thyréostimuline', 'hormone thyréostimulante', 'thyrotropine',
      // German
      'thyreotropin', 'thyrotropin',
      // Russian
      'тиреотропный гормон', 'ттг',
      // Japanese
      '甲状腺刺激ホルモン',
      // Chinese
      '促甲状腺激素', '促甲状腺素',
      // Korean
      '갑상선자극호르몬',
      // Arabic
      'الهرمون المنبه للغدة الدرقية', 'هرمون تحفيز الغدة الدرقية',
      // Hindi
      'थायरॉइड उत्तेजक हार्मोन', 'थायराइड स्टिम्युलेटिंग हार्मोन',
      // Bengali
      'থাইরয়েড-উত্তেজক হরমোন',
    ],
    standard: { low: 0.4, high: 4.0 },
    optimal: { low: 1.0, high: 2.5 },
    priority: 1,
    description: 'The primary screening marker for thyroid function. High TSH means your thyroid is underactive; low TSH means overactive or over-medicated.',
    highConcern: 'Elevated TSH signals the thyroid is struggling. Common with Hashimoto\'s - often indicates need for medication adjustment.',
    lowConcern: 'Low TSH can mean over-medication or hyperthyroid flare. Can cause bone loss and heart rhythm issues over time.',
    optimalNote: 'Many Hashimoto\'s patients feel best with TSH between 1–2, even if labs are "normal" within the wider 0.4–4.0 range.',
  },
  {
    id: 'ft4',
    name: 'Free T4',
    fullName: 'Free Thyroxine',
    unit: 'ng/dL',
    category: 'thyroid',
    aliases: [
      'free t4', 'ft4', 'free thyroxine', 't4 free', 't4 free direct', 't4,free', 'thyroxine t4 free', 't4 free thyroxine', 't4 thyroxine free',
      // Spanish
      't4 libre', 'tiroxina libre', 't4l',
      // Portuguese
      't4 livre', 'tiroxina livre',
      // French
      't4 libre', 'thyroxine libre', 't4l',
      // German
      'freies t4', 'freies thyroxin',
      // Russian
      'свободный т4', 'тироксин свободный', 'т4 свободный',
      // Japanese
      '遊離サイロキシン', '遊離t4', 'フリーt4',
      // Chinese
      '游离甲状腺素', '游离t4',
      // Korean
      '유리 티록신', '자유 t4',
      // Arabic
      'الثيروكسين الحر', 't4 الحر',
      // Hindi
      'मुक्त थायरोक्सिन',
    ],
    standard: { low: 0.8, high: 1.8 },
    optimal: { low: 1.1, high: 1.7 },
    priority: 2,
    description: 'The main thyroid hormone produced by your thyroid gland. It converts to active T3 in your body.',
    highConcern: 'High Free T4 may indicate hyperthyroid state or over-medication with T4-only drugs like levothyroxine.',
    lowConcern: 'Low Free T4 suggests the thyroid is not producing enough hormone. Common with Hashimoto\'s as the gland is destroyed over time.',
    optimalNote: 'Optimal Free T4 for Hashimoto\'s is often in the upper half of the reference range.',
  },
  {
    id: 'ft3',
    name: 'Free T3',
    fullName: 'Free Triiodothyronine',
    unit: 'pg/mL',
    category: 'thyroid',
    aliases: [
      'triiodothyronine t3 free', 'triiodothyronine free', 'free t3', 'ft3', 'free triiodothyronine', 't3 free', 't3, free', 't3 free serum', 'triiodothyronine serum free',
      // Spanish
      't3 libre', 'triyodotironina libre', 't3l',
      // Portuguese
      't3 livre', 'triiodotironina livre',
      // French
      't3 libre', 'triiodothyronine libre',
      // German
      'freies t3', 'freies triiodthyronin',
      // Russian
      'свободный т3', 'трийодтиронин свободный', 'т3 свободный',
      // Japanese
      '遊離トリヨードサイロニン', '遊離t3', 'フリーt3',
      // Chinese
      '游离三碘甲腺原氨酸', '游离t3',
      // Korean
      '유리 트리요오드티로닌',
      // Arabic
      'الثيرونين ثلاثي اليود الحر',
      // Hindi
      'मुक्त ट्राईआयोडोथायरोनिन',
    ],
    standard: { low: 2.3, high: 4.2 },
    optimal: { low: 3.2, high: 4.2 },
    priority: 2,
    description: 'The active thyroid hormone that your cells use directly. Many Hashimoto\'s patients have adequate T4 but struggle to convert it to T3.',
    highConcern: 'High Free T3 can cause heart palpitations, anxiety, and weight loss. May indicate hyperthyroid flare.',
    lowConcern: 'Low Free T3 is a common cause of persistent symptoms (fatigue, brain fog, weight gain) even when TSH appears normal.',
    optimalNote: 'Optimal Free T3 is in the upper third of the reference range. If yours is low with normal TSH, ask about T3/T4 combination therapy.',
  },
  {
    id: 'rt3',
    name: 'Reverse T3',
    fullName: 'Reverse Triiodothyronine',
    unit: 'ng/dL',
    category: 'thyroid',
    aliases: [
      'reverse t3 serum', 'reverse t3', 'rt3', 'reverse triiodothyronine',
      'rt3 serum', 'reverse triiodothyronine serum',
      // Spanish
      't3 reverso', 't3 inversa', 'triyodotironina inversa',
      // Portuguese
      't3 reverso', 'triiodotironina reversa',
      // French
      't3 inverse', 'triiodothyronine inverse',
      // German
      'reverses t3', 'reverses triiodthyronin',
      // Russian
      'реверсивный т3', 'обратный т3',
      // Japanese
      'リバースt3', '逆t3',
      // Chinese
      '反式三碘甲腺原氨酸', '逆t3',
    ],
    standard: { low: 0, high: 24.1 },
    optimal: { low: 0, high: 15.0 },
    priority: 3,
    description: 'An inactive form of T3 that blocks active T3 from working. High levels indicate your body is converting T4 to the wrong form.',
    highConcern: 'Elevated Reverse T3 can block active T3 and cause hypothyroid symptoms even when other labs look normal. Triggered by stress, inflammation, low iron, or low-calorie diets.',
    lowConcern: null,
    optimalNote: 'Some practitioners use the Free T3:Reverse T3 ratio - ideal is above 0.2 (or 20 when using different units).',
  },
  {
    id: 'tpo_ab',
    name: 'TPO Antibodies',
    fullName: 'Anti-Thyroid Peroxidase Antibodies',
    unit: 'IU/mL',
    category: 'antibodies',
    aliases: [
      'tpo', 'anti-tpo', 'thyroid peroxidase', 'tpo antibodies', 'antithyroid peroxidase', 'anti tpo ab', 'tpo ab', 'thyroid peroxidase ab', 'thyroid peroxidase antibody', 'thyroid peroxidase antibodies', 'peroxidase antithyroid',
      // Spanish
      'anticuerpos antiperoxidasa tiroidea', 'anticuerpos tpo', 'anti tpo', 'peroxidasa tiroidea',
      // Portuguese
      'anticorpos antiperoxidase tireoidiana', 'anti-tpo',
      // French
      'anticorps anti-thyroperoxydase', 'anti-tpo', 'anticorps tpo',
      // German
      'schilddrüsenperoxidase antikörper', 'tpo antikörper',
      // Russian
      'антитела к тиреопероксидазе', 'ат-тпо', 'антитела тпо',
      // Japanese
      '抗甲状腺ペルオキシダーゼ抗体', '抗tpo抗体',
      // Chinese
      '抗甲状腺过氧化物酶抗体', '甲状腺过氧化物酶抗体',
      // Korean
      '갑상선 과산화효소 항체', '항tpo 항체',
      // Arabic
      'أجسام مضادة لبيروكسيداز الغدة الدرقية',
      // Hindi
      'थायरॉइड पेरोक्सीडेज एंटीबॉडी',
    ],
    standard: { low: 0, high: 34 },
    optimal: { low: 0, high: 9 },
    priority: 1,
    description: 'The hallmark antibody for Hashimoto\'s. Measures immune system attack on your thyroid\'s enzyme (TPO). Higher levels = more active autoimmune attack.',
    highConcern: 'Elevated TPO antibodies confirm active Hashimoto\'s autoimmune activity. The higher the number, the more aggressive the attack on thyroid tissue.',
    lowConcern: null,
    optimalNote: 'While standard labs consider <34 IU/mL normal, functional practitioners aim for <9. Dietary changes (gluten-free, AIP) and selenium supplementation can reduce antibody levels.',
  },
  {
    id: 'tg_ab',
    name: 'TG Antibodies',
    fullName: 'Anti-Thyroglobulin Antibodies',
    unit: 'IU/mL',
    category: 'antibodies',
    aliases: [
      'thyroglobulin antibody', 'tg ab', 'anti-tg', 'thyroglobulin antibodies', 'tgab', 'tg antibodies', 'antithyroglobulin', 'thyroglobulin ab', 'thyroglobulin autoantibody', 'thyroglobulin autoantibodies',
      // Spanish
      'anticuerpos antitiroglobulina', 'anti-tiroglobulina', 'anticuerpos tg',
      // Portuguese
      'anticorpos antitireoglobulina', 'anti-tireoglobulina',
      // French
      'anticorps anti-thyroglobuline', 'anti-thyroglobuline',
      // German
      'thyreoglobulin antikörper', 'anti-thyreoglobulin',
      // Russian
      'антитела к тиреоглобулину', 'ат-тг',
      // Japanese
      '抗サイログロブリン抗体', '抗tg抗体',
      // Chinese
      '抗甲状腺球蛋白抗体', '甲状腺球蛋白抗体',
      // Korean
      '갑상선글로불린 항체', '항tg 항체',
      // Arabic
      'أجسام مضادة للثيروغلوبولين',
      // Hindi
      'थायरोग्लोबुलिन एंटीबॉडी',
    ],
    standard: { low: 0, high: 0.9 },
    optimal: { low: 0, high: 0.9 },
    priority: 1,
    description: 'A second Hashimoto\'s antibody that attacks thyroglobulin, the protein used to make thyroid hormone.',
    highConcern: 'Elevated TG antibodies indicate active autoimmune attack on the thyroid. Some patients have high TG antibodies without elevated TPO - testing both gives a more complete picture.',
    lowConcern: null,
    optimalNote: 'Some labs use different reference ranges (e.g., <20 IU/mL). Check your lab\'s reference range.',
  },
  {
    id: 'vitd',
    name: 'Vitamin D',
    fullName: '25-OH Vitamin D',
    unit: 'ng/mL',
    category: 'nutrients',
    aliases: [
      'vitamin d 25 hydroxy', '25 hydroxy vitamin d', 'vitamin d 25-hydroxy', 'vitamin d', '25-oh vitamin d', 'vit d', 'vitamin d3', '25 oh vitamin d', '25(oh)d', '25-hydroxyvitamin d', '25 hydroxyvitamin d', 'vitamin d 25 hydroxyvitamin d', 'cholecalciferol', 'vitamin d total',
      // Spanish
      'vitamina d', '25-hidroxivitamina d', 'vitamina d3',
      // Portuguese
      'vitamina d', '25-hidroxivitamina d', 'vitamina d3',
      // French
      'vitamine d', '25-hydroxyvitamine d', 'vitamine d3',
      // German
      'vitamin d', '25-hydroxy-vitamin d', 'calcidiol',
      // Russian
      'витамин d', '25-гидроксивитамин d', 'кальцидиол',
      // Japanese
      'ビタミンd', '25-ヒドロキシビタミンd',
      // Chinese
      '维生素d', '25羟基维生素d',
      // Korean
      '비타민 d', '25-하이드록시비타민 d',
      // Arabic
      'فيتامين د', '25 هيدروكسي فيتامين د',
      // Hindi
      'विटामिन डी', '25-हाइड्रॉक्सीविटामिन डी',
      // Bengali
      'ভিটামিন ডি',
    ],
    standard: { low: 30, high: 100 },
    optimal: { low: 50, high: 80 },
    priority: 2,
    description: 'A critical immune regulator. Low Vitamin D is strongly linked to autoimmune diseases including Hashimoto\'s.',
    highConcern: 'Very high Vitamin D (>100 ng/mL) can cause toxicity. Monitor when supplementing.',
    lowConcern: 'Low Vitamin D impairs immune regulation and is associated with higher antibody levels and more severe Hashimoto\'s symptoms.',
    optimalNote: 'Most Hashimoto\'s practitioners target 50–80 ng/mL. Supplement with D3+K2 and retest in 3 months.',
  },
  {
    id: 'ferritin',
    name: 'Ferritin',
    fullName: 'Serum Ferritin',
    unit: 'ng/mL',
    category: 'nutrients',
    aliases: [
      'ferritin', 'serum ferritin', 'ferritin serum', 'ferritin blood',
      // Spanish / Portuguese
      'ferritina', 'ferritina sérica',
      // French
      'ferritine', 'ferritine sérique',
      // German
      'ferritin', 'serum ferritin',
      // Russian
      'ферритин', 'сывороточный ферритин',
      // Japanese
      'フェリチン',
      // Chinese
      '铁蛋白', '血清铁蛋白',
      // Korean
      '페리틴', '혈청 페리틴',
      // Arabic
      'فيريتين', 'الفيريتين',
      // Hindi
      'फेरिटिन',
    ],
    standard: { low: 12, high: 150 },
    optimal: { low: 70, high: 150 },
    priority: 2,
    description: 'Iron storage protein. Low ferritin is extremely common with Hashimoto\'s and causes fatigue, hair loss, and impairs T4→T3 conversion.',
    highConcern: 'Very high ferritin can indicate inflammation, infection, or iron overload (hemochromatosis). Worth investigating if above 200+.',
    lowConcern: 'Low ferritin is one of the most common and overlooked causes of persistent Hashimoto\'s symptoms. Impairs thyroid hormone conversion.',
    optimalNote: 'Many Hashimoto\'s patients need ferritin above 70–90 ng/mL to feel well, even though labs flag normal at 12+.',
  },
  {
    id: 'b12',
    name: 'Vitamin B12',
    fullName: 'Vitamin B12',
    unit: 'pg/mL',
    category: 'nutrients',
    aliases: [
      'b12', 'vitamin b12', 'cobalamin', 'vit b12', 'vitamin b 12', 'cyanocobalamin', 'b12 vitamin', 'cobalamin serum',
      // Spanish / Portuguese
      'vitamina b12', 'cobalamina', 'vitamina b 12',
      // French
      'vitamine b12', 'cobalamine',
      // German
      'vitamin b12', 'cobalamin',
      // Russian
      'витамин b12', 'кобаламин', 'цианокобаламин',
      // Japanese
      'ビタミンb12', 'コバラミン',
      // Chinese
      '维生素b12', '钴胺素',
      // Korean
      '비타민 b12', '코발라민',
      // Arabic
      'فيتامين ب12', 'كوبالامين',
      // Hindi
      'विटामिन बी12', 'कोबालामिन',
    ],
    standard: { low: 200, high: 900 },
    optimal: { low: 500, high: 900 },
    priority: 3,
    description: 'Essential for nerve function and energy. Hashimoto\'s patients have higher risk of B12 deficiency, especially if they have low stomach acid.',
    highConcern: null,
    lowConcern: 'Low B12 causes fatigue, brain fog, numbness/tingling, and mood issues - symptoms that overlap heavily with Hashimoto\'s.',
    optimalNote: 'Optimal B12 for neurological protection is >500 pg/mL. Consider methylcobalamin form if supplementing.',
  },
  {
    id: 'crp',
    name: 'hs-CRP',
    fullName: 'High-Sensitivity C-Reactive Protein',
    unit: 'mg/L',
    category: 'inflammation',
    aliases: [
      'crp', 'c-reactive protein', 'hs-crp', 'hsCRP', 'high sensitivity crp', 'hs crp', 'c reactive protein cardiac', 'c reactive protein high sensitivity', 'crp cardiac', 'crp high sensitivity',
      // Spanish
      'proteína c reactiva', 'pcr', 'proteína c-reactiva de alta sensibilidad',
      // Portuguese
      'proteína c reativa', 'pcr', 'proteína c-reativa ultrassensível',
      // French
      'protéine c réactive', 'crp ultrasénsible',
      // German
      'c-reaktives protein', 'crp',
      // Russian
      'с-реактивный белок', 'срб', 'высокочувствительный срб',
      // Japanese
      'c反応性タンパク', 'crp',
      // Chinese
      'c反应蛋白', '超敏c反应蛋白',
      // Korean
      'c반응성 단백', '고감도 crp',
      // Arabic
      'بروتين سي التفاعلي', 'crp',
      // Hindi
      'सी-रिएक्टिव प्रोटीन',
    ],
    standard: { low: 0, high: 3.0 },
    optimal: { low: 0, high: 1.0 },
    priority: 2,
    description: 'A marker of systemic inflammation. Hashimoto\'s involves chronic inflammation and elevated CRP can worsen symptoms and antibody levels.',
    highConcern: 'Elevated CRP indicates active inflammation that can worsen autoimmune activity. Common drivers: gut issues, food sensitivities (gluten, dairy), stress, poor sleep.',
    lowConcern: null,
    optimalNote: 'Aim for CRP below 1.0 mg/L. Anti-inflammatory interventions: gluten-free diet, omega-3s, curcumin, sleep optimization, stress management.',
  },
  {
    id: 'tsh_receptor_ab',
    name: 'TSH Receptor Ab',
    fullName: 'TSH Receptor Antibodies (TRAb)',
    unit: 'IU/L',
    category: 'antibodies',
    aliases: ['trab', 'tsh receptor antibodies', 'thyroid stimulating immunoglobulin', 'tsi', 'tsh receptor ab'],
    standard: { low: 0, high: 1.75 },
    optimal: { low: 0, high: 1.75 },
    priority: 2,
    description: 'Antibodies that attack TSH receptors. More associated with Graves\' disease but can appear in some Hashimoto\'s patients.',
    highConcern: 'Elevated TRAb confirms autoimmune thyroid disease and may indicate overlap between Hashimoto\'s and Graves\' disease.',
    lowConcern: null,
    optimalNote: null,
  },
  {
    id: 'selenium',
    name: 'Selenium',
    fullName: 'Serum Selenium',
    unit: 'mcg/L',
    category: 'nutrients',
    aliases: ['selenium', 'serum selenium'],
    standard: { low: 70, high: 150 },
    optimal: { low: 110, high: 150 },
    priority: 3,
    description: 'Selenium is essential for thyroid hormone conversion and reduces TPO antibodies. The thyroid has the highest selenium concentration of any organ.',
    highConcern: 'High selenium can be toxic. Do not supplement without testing first.',
    lowConcern: 'Low selenium impairs T4→T3 conversion and is associated with higher TPO antibodies.',
    optimalNote: '200 mcg/day of selenomethionine has been shown in studies to reduce TPO antibodies by ~50% in 3 months.',
  },
  {
    id: 'zinc',
    name: 'Zinc',
    fullName: 'Serum Zinc',
    unit: 'mcg/dL',
    category: 'nutrients',
    aliases: ['zinc', 'serum zinc'],
    standard: { low: 60, high: 120 },
    optimal: { low: 90, high: 120 },
    priority: 3,
    description: 'Zinc supports thyroid hormone production and immune balance. Deficiency is common with gut issues (common in Hashimoto\'s).',
    highConcern: 'High zinc can interfere with copper absorption.',
    lowConcern: 'Low zinc impairs thyroid hormone production and immune regulation.',
    optimalNote: null,
  },
  {
    id: 'magnesium_rbc',
    name: 'Magnesium (RBC)',
    fullName: 'Red Blood Cell Magnesium',
    unit: 'mg/dL',
    category: 'nutrients',
    aliases: [
      'magnesium rbc', 'magnesium, rbc', 'rbc magnesium', 'red blood cell magnesium',
      'magnesium red blood cell', 'intracellular magnesium',
      // Spanish / Portuguese
      'magnesio eritrocitario', 'magnesio rbc',
      // French
      'magnésium érythrocytaire',
      // German
      'magnesium erythrozyten',
      // Russian
      'магний эритроциты',
    ],
    standard: { low: 4.2, high: 6.8 },
    optimal: { low: 5.5, high: 6.8 },
    priority: 3,
    description: 'RBC magnesium measures magnesium inside your cells - a far more accurate picture than serum magnesium, which stays normal even when cells are depleted. Magnesium is a cofactor in over 300 enzymes including those that activate thyroid hormone.',
    highConcern: null,
    lowConcern: 'Low intracellular magnesium causes muscle cramps, poor sleep, anxiety, constipation, and fatigue - symptoms that overlap heavily with Hashimoto\'s. Magnesium is rapidly depleted by stress, and most people with autoimmune conditions run low.',
    optimalNote: 'Supplement with magnesium glycinate (best tolerated, promotes sleep) or malate (good for fatigue). Avoid magnesium oxide - it has poor absorption. Retest RBC magnesium after 3 months of supplementation.',
  },
  {
    id: 'iron_serum',
    name: 'Iron (Serum)',
    fullName: 'Serum Iron',
    unit: 'mcg/dL',
    category: 'nutrients',
    aliases: [
      'iron serum', 'serum iron', 'iron total', 'iron level', 'iron blood',
      'iron total serum', 'fe serum',
      // Spanish / Portuguese
      'hierro sérico', 'hierro total', 'ferro sérico',
      // French
      'fer sérique', 'fer total',
      // German
      'serumeisen', 'eisen serum',
      // Russian
      'железо сыворотки', 'сывороточное железо',
      // Japanese
      '血清鉄',
      // Chinese
      '血清铁',
      // Korean
      '혈청철',
    ],
    standard: { low: 40, high: 170 },
    optimal: { low: 85, high: 130 },
    priority: 3,
    description: 'The amount of iron circulating in your blood. Iron is essential for producing thyroid hormone and converting T4 to the active T3 - deficiency is one of the most common reasons Hashimoto\'s patients feel exhausted even on thyroid medication.',
    highConcern: 'High serum iron alongside high ferritin may indicate iron overload (hemochromatosis) - worth discussing with your doctor.',
    lowConcern: 'Low iron impairs T4-to-T3 conversion and slows the enzyme that makes thyroid hormone. This means your thyroid medication may not work as well as it should.',
    optimalNote: 'Always interpret serum iron together with ferritin and iron saturation for the full picture. Iron is best absorbed away from thyroid medication - take supplements at least 4 hours apart.',
  },
  {
    id: 'iron_saturation',
    name: 'Iron Saturation',
    fullName: 'Transferrin Saturation',
    unit: '%',
    category: 'nutrients',
    aliases: [
      'iron saturation', 'iron % saturation', 'transferrin saturation', 'percent saturation',
      'iron binding saturation', 'tibc saturation', 'iron sat',
      // Spanish
      'saturación de transferrina', 'saturación de hierro',
      // French
      'saturation de la transferrine',
      // German
      'transferrinsättigung',
      // Russian
      'насыщение трансферрина',
    ],
    standard: { low: 15, high: 50 },
    optimal: { low: 25, high: 35 },
    priority: 3,
    description: 'The percentage of iron-carrying proteins (transferrin) that are actually loaded with iron. It tells you how efficiently your body is supplying iron to your tissues - low saturation means your cells are iron-starved even if total iron looks okay.',
    highConcern: 'Iron saturation above 45-50% can indicate iron overload. Worth checking ferritin and considering genetic testing for hemochromatosis.',
    lowConcern: 'Low iron saturation means your iron transport system is running empty - your tissues aren\'t getting enough iron even to support the T4-to-T3 conversion that thyroid medication depends on.',
    optimalNote: 'Aim for iron saturation between 25-35%. If low, look at your ferritin too - if both are low, you likely need iron supplementation.',
  },
  {
    id: 'omega3',
    name: 'Omega-3 Total',
    fullName: 'Total Omega-3 Fatty Acids',
    unit: '% by wt',
    category: 'nutrients',
    aliases: [
      'omega-3 total', 'omega 3 total', 'omegacheck', 'omega-3 total omegacheck',
      'omega 3 total omegacheck', 'total omega 3', 'total omega-3',
      'omega-3 index', 'omega 3 index',
    ],
    standard: { low: 4.0, high: 100 },
    optimal: { low: 8.0, high: 100 },
    priority: 3,
    description: 'The percentage of your red blood cell membranes made up of omega-3 fatty acids. Low omega-3 drives inflammation, worsens autoimmune activity, and impairs thyroid hormone signaling.',
    highConcern: null,
    lowConcern: 'Low omega-3 levels mean your cells are more inflamed and your immune system is more reactive - directly worsening Hashimoto\'s autoimmune activity and antibody levels.',
    optimalNote: 'Target omega-3 above 8% by wt. The fastest way to raise it: 2-3g EPA+DHA daily from high-quality fish oil or algae oil. Retest in 4-6 months.',
  },

  {
    id: 'homocysteine',
    name: 'Homocysteine',
    fullName: 'Homocysteine',
    unit: 'umol/L',
    category: 'inflammation',
    aliases: [
      'homocysteine', 'homocysteine serum', 'serum homocysteine', 'homocysteine plasma',
      // Spanish / Portuguese
      'homocisteína', 'homocisteina',
      // French
      'homocystéine',
      // German
      'homocystein',
      // Russian
      'гомоцистеин',
      // Japanese
      'ホモシステイン',
      // Chinese
      '同型半胱氨酸',
      // Korean
      '호모시스테인',
    ],
    standard: { low: 0, high: 15 },
    optimal: { low: 0, high: 9 },
    priority: 2,
    description: 'An amino acid that rises when your methylation pathway is impaired. Elevated homocysteine drives vascular inflammation, impairs brain function, and is linked to higher risk of cardiovascular disease - all concerns for Hashimoto\'s patients.',
    highConcern: 'Elevated homocysteine signals a methylation problem - your body isn\'t properly processing B vitamins (B12, B6, folate). This drives chronic inflammation, damages blood vessel walls, and worsens autoimmune activity. Many Hashimoto\'s patients have MTHFR gene variants that raise homocysteine.',
    lowConcern: null,
    optimalNote: 'Target homocysteine below 9 umol/L. Most effective interventions: methylfolate (5-MTHF), methylcobalamin (B12), and B6 - the methylated forms are critical if you have an MTHFR variant.',
  },

  // ── General blood / CBC markers ──────────────────────────────────────────────
  {
    id: 'hemoglobin',
    name: 'Hemoglobin',
    fullName: 'Hemoglobin',
    unit: 'g/dL',
    category: 'nutrients',
    aliases: [
      'hemoglobin', 'haemoglobin', 'hgb', 'hb', 'hemoglobin labcorp', 'hgb labcorp',
      // Spanish / Portuguese
      'hemoglobina',
      // French
      'hémoglobine',
      // German
      'hämoglobin',
      // Russian
      'гемоглобин',
      // Japanese
      'ヘモグロビン',
      // Chinese
      '血红蛋白', '血色素',
      // Korean
      '혈색소', '헤모글로빈',
      // Arabic
      'الهيموغلوبين', 'خضاب الدم',
      // Hindi
      'हीमोग्लोबिन',
      // Bengali
      'হিমোগ্লোবিন',
    ],
    standard: { low: 11.1, high: 16.0 },
    optimal: { low: 13.0, high: 16.0 },
    priority: 3,
    description: 'The protein in red blood cells that carries oxygen. Low hemoglobin means anemia - very common in Hashimoto\'s and causes fatigue, hair loss, and brain fog that look exactly like thyroid symptoms.',
    highConcern: null,
    lowConcern: 'Low hemoglobin means your blood isn\'t carrying enough oxygen. This causes exhaustion, hair shedding, and brain fog that are often mistakenly blamed on the thyroid - when fixing the anemia itself can dramatically improve how you feel.',
    optimalNote: 'For Hashimoto\'s, aim for hemoglobin above 13.0 g/dL. If low, ask your doctor to also check ferritin (iron stores) and B12 - these are the most common causes.',
  },

  // ── Cardiometabolic markers ──────────────────────────────────────────────────
  {
    id: 'cholesterol_total',
    name: 'Total Cholesterol',
    fullName: 'Total Cholesterol',
    unit: 'mg/dL',
    category: 'cardiometabolic',
    aliases: [
      'cholesterol total', 'total cholesterol', 'cholesterol serum', 'cholesterol blood',
      // Spanish / Portuguese
      'colesterol total', 'total de colesterol',
      // French
      'cholestérol total',
      // German
      'gesamtcholesterin',
      // Russian
      'общий холестерин',
      // Japanese
      '総コレステロール',
      // Chinese
      '总胆固醇',
      // Korean
      '총 콜레스테롤',
      // Arabic
      'الكوليسترول الكلي',
      // Hindi
      'कुल कोलेस्ट्रॉल',
    ],
    standard: { low: 0, high: 200 },
    optimal: { low: 0, high: 180 },
    priority: 3,
    description: 'Elevated cholesterol is one of the most common - and overlooked - signs of undertreated hypothyroidism. The thyroid hormone directly controls how your body processes cholesterol.',
    highConcern: 'High cholesterol is often a sign that your thyroid isn\'t optimized. Thyroid hormone controls the receptors that clear LDL from your blood - when thyroid levels drop, cholesterol rises. Optimizing your thyroid medication often brings cholesterol down without statins.',
    lowConcern: null,
    optimalNote: 'If your cholesterol is high alongside a TSH that\'s above 2.5, ask your doctor whether optimizing your thyroid dose might bring it down before adding cholesterol medication.',
  },
  {
    id: 'triglycerides',
    name: 'Triglycerides',
    fullName: 'Triglycerides',
    unit: 'mg/dL',
    category: 'cardiometabolic',
    aliases: [
      'triglycerides', 'triglyceride', 'trig', 'trigs',
      // Spanish / Portuguese
      'triglicéridos', 'triglicerídeos', 'triglicéridos',
      // French
      'triglycérides',
      // German
      'triglyzeride',
      // Russian
      'триглицериды',
      // Japanese
      '中性脂肪', 'トリグリセリド',
      // Chinese
      '甘油三酯', '三酸甘油脂',
      // Korean
      '중성지방', '트리글리세라이드',
      // Arabic
      'الدهون الثلاثية',
      // Hindi
      'ट्राइग्लिसराइड',
    ],
    standard: { low: 0, high: 149 },
    optimal: { low: 0, high: 100 },
    priority: 3,
    description: 'Blood fats that rise with both hypothyroidism and insulin resistance. Elevated triglycerides alongside Hashimoto\'s often signal both need attention.',
    highConcern: 'High triglycerides in Hashimoto\'s often have two causes: undertreated hypothyroidism and insulin resistance. The thyroid controls how your liver processes fat - when it\'s underactive, triglycerides build up. If you also have PCOS or blood sugar issues, insulin resistance adds to it.',
    lowConcern: null,
    optimalNote: 'Aim for triglycerides below 100 mg/dL. The most effective changes: cut refined carbs and sugar, optimize your thyroid medication, and add omega-3 fish oil.',
  },
  {
    id: 'fasting_glucose',
    name: 'Fasting Glucose',
    fullName: 'Fasting Blood Glucose',
    unit: 'mg/dL',
    category: 'cardiometabolic',
    aliases: [
      'glucose', 'glucose fasting', 'fasting glucose', 'blood glucose', 'glucose serum', 'glucose plasma', 'glucose blood',
      // Spanish
      'glucosa', 'glucosa en ayunas', 'glucemia',
      // Portuguese
      'glicose', 'glicose em jejum', 'glicemia',
      // French
      'glucose', 'glycémie', 'glucose à jeun',
      // German
      'glukose', 'blutzucker', 'nüchternglukose',
      // Russian
      'глюкоза', 'глюкоза крови', 'сахар крови',
      // Japanese
      '血糖', '空腹時血糖', 'グルコース',
      // Chinese
      '血糖', '空腹血糖', '葡萄糖',
      // Korean
      '혈당', '공복혈당', '포도당',
      // Arabic
      'الغلوكوز', 'سكر الدم', 'الجلوكوز الصيامي',
      // Hindi
      'ग्लूकोज', 'रक्त शर्करा', 'उपवास ग्लूकोज',
    ],
    standard: { low: 70, high: 99 },
    optimal: { low: 70, high: 85 },
    priority: 3,
    description: 'Blood sugar measured after fasting. Even slightly elevated fasting glucose signals early insulin resistance, which drives inflammation and worsens both Hashimoto\'s and PCOS.',
    highConcern: 'Fasting glucose above 85 can indicate early insulin resistance even before it shows on an HbA1c test. Insulin resistance drives inflammation that worsens Hashimoto\'s and raises antibody levels. It also puts extra strain on your adrenal glands.',
    lowConcern: 'Very low fasting glucose can signal adrenal issues or reactive hypoglycemia - worth discussing with your doctor if you\'re also experiencing energy crashes, shakiness, or anxiety between meals.',
    optimalNote: 'Functional medicine practitioners target fasting glucose below 85 mg/dL for optimal metabolic health. Cutting refined carbs, adding protein to every meal, and a short walk after eating are the most effective changes.',
  },
  {
    id: 'alt',
    name: 'ALT (Liver)',
    fullName: 'Alanine Aminotransferase',
    unit: 'IU/L',
    category: 'inflammation',
    aliases: [
      'alt', 'alanine aminotransferase', 'alanine transaminase', 'sgpt', 'alt serum', 'alt labcorp',
      // Spanish / Portuguese
      'alanina aminotransferasa', 'alat', 'transaminasa glutámico-pirúvica', 'tgp',
      // French
      'alanine aminotransférase', 'alat',
      // German
      'alanin-aminotransferase', 'alat',
      // Russian
      'аланинаминотрансфераза', 'алт',
      // Japanese
      'アラニンアミノトランスフェラーゼ', 'alt', 'gpt',
      // Chinese
      '丙氨酸氨基转移酶', '谷丙转氨酶', 'alt',
      // Korean
      '알라닌 아미노전이효소', 'alt',
      // Arabic
      'ألانين أمينوترانسفيراز', 'alt',
      // Hindi
      'एलेनिन एमिनोट्रांसफेरेज',
    ],
    standard: { low: 0, high: 40 },
    optimal: { low: 0, high: 25 },
    priority: 3,
    description: 'A liver enzyme that rises when liver cells are stressed. Thyroid disease directly affects liver function - high or low thyroid hormone both strain the liver.',
    highConcern: 'Elevated ALT suggests liver stress. Both hypothyroidism and hyperthyroidism affect the liver - hypothyroidism slows fat metabolism in the liver, and high antibody levels drive systemic inflammation that strains it. Also worth ruling out fatty liver or medication side effects.',
    lowConcern: null,
    optimalNote: 'Optimal ALT is under 25 IU/L. If elevated, discuss with your doctor - it\'s worth checking whether optimizing your thyroid medication brings it down.',
  },

  {
    id: 'hdl',
    name: 'HDL Cholesterol',
    fullName: 'HDL Cholesterol',
    unit: 'mg/dL',
    category: 'cardiometabolic',
    aliases: [
      'hdl', 'hdl cholesterol', 'hdl-cholesterol', 'high density lipoprotein',
      'hdl-c', 'hdl c', 'good cholesterol',
      // Spanish / Portuguese
      'colesterol hdl', 'hdl colesterol', 'lipoproteína de alta densidad',
      // French
      'cholestérol hdl', 'lipoprotéine haute densité',
      // German
      'hdl cholesterin', 'hdl-cholesterin',
      // Russian
      'хдл холестерин', 'холестерин hdl',
      // Japanese
      'hdlコレステロール', '善玉コレステロール',
      // Chinese
      '高密度脂蛋白胆固醇', 'hdl胆固醇',
      // Korean
      'hdl 콜레스테롤',
    ],
    standard: { low: 50, high: 999 },
    optimal: { low: 65, high: 999 },
    priority: 3,
    description: 'The "good" cholesterol that carries fats away from arteries. Low HDL is a direct marker of insulin resistance and inflammation - both common in Hashimoto\'s. Thyroid hormone raises HDL, so undertreated hypothyroidism often lowers it.',
    highConcern: null,
    lowConcern: 'Low HDL is a sign your metabolism is under stress - often from insulin resistance, inflammation, or undertreated hypothyroidism. All three are common in Hashimoto\'s and can be addressed together.',
    optimalNote: 'Raise HDL with omega-3 fish oil, regular aerobic exercise, cutting refined carbs, and optimizing thyroid levels. HDL responds slowly - give interventions 3-6 months.',
  },
  {
    id: 'ldl',
    name: 'LDL Cholesterol',
    fullName: 'LDL Cholesterol',
    unit: 'mg/dL',
    category: 'cardiometabolic',
    aliases: [
      'ldl', 'ldl cholesterol', 'ldl-cholesterol', 'low density lipoprotein',
      'ldl-c', 'ldl c', 'ldl cholesterol calc', 'ldl cholesterol calculated',
      // Spanish / Portuguese
      'colesterol ldl', 'ldl colesterol', 'lipoproteína de baja densidad',
      // French
      'cholestérol ldl', 'lipoprotéine basse densité',
      // German
      'ldl cholesterin', 'ldl-cholesterin',
      // Russian
      'лдл холестерин', 'холестерин ldl',
      // Japanese
      'ldlコレステロール', '悪玉コレステロール',
      // Chinese
      '低密度脂蛋白胆固醇', 'ldl胆固醇',
      // Korean
      'ldl 콜레스테롤',
    ],
    standard: { low: 0, high: 130 },
    optimal: { low: 0, high: 100 },
    priority: 3,
    description: 'The main carrier of cholesterol in the blood. Thyroid hormone directly controls LDL clearance from your bloodstream - when thyroid levels drop, LDL rises. Elevated LDL alongside a high TSH often normalizes once thyroid medication is optimized.',
    highConcern: 'Elevated LDL is often a thyroid problem before it\'s a cholesterol problem. Thyroid hormone controls the liver receptors that clear LDL - when the thyroid is underactive, LDL builds up. If your TSH is also above 2.5, ask your doctor about optimizing your dose before starting a statin.',
    lowConcern: null,
    optimalNote: 'For Hashimoto\'s patients, tracking LDL particle number (LDL-P) and ApoB gives a more accurate cardiovascular risk picture than total LDL alone.',
  },
  {
    id: 'apob',
    name: 'ApoB',
    fullName: 'Apolipoprotein B',
    unit: 'mg/dL',
    category: 'cardiometabolic',
    aliases: [
      'apob', 'apolipoprotein b', 'apolipoprotein b 100', 'apo b', 'apo-b',
      // Spanish / Portuguese
      'apolipoproteína b',
      // French
      'apolipoprotéine b',
      // German
      'apolipoprotein b',
      // Russian
      'аполипопротеин б',
    ],
    standard: { low: 0, high: 130 },
    optimal: { low: 0, high: 80 },
    priority: 3,
    description: 'Each LDL particle has exactly one ApoB molecule, so ApoB directly counts the number of cholesterol-carrying particles. It\'s a more accurate cardiovascular risk marker than total LDL - you can have normal LDL but high ApoB if your particles are small and numerous.',
    highConcern: 'Elevated ApoB means you have more LDL particles in circulation - each one is a potential artery-clogger. Hypothyroidism raises ApoB directly, so optimizing thyroid levels is often the first step.',
    lowConcern: null,
    optimalNote: 'Target ApoB below 80 mg/dL for low cardiovascular risk. This is a more actionable target than total LDL for most people with metabolic concerns.',
  },
  {
    id: 'uric_acid',
    name: 'Uric Acid',
    fullName: 'Uric Acid',
    unit: 'mg/dL',
    category: 'cardiometabolic',
    aliases: [
      'uric acid', 'uric acid serum', 'serum uric acid', 'urate', 'uricacid',
      // Spanish / Portuguese
      'ácido úrico', 'acido urico',
      // French
      'acide urique',
      // German
      'harnsäure',
      // Russian
      'мочевая кислота',
      // Japanese
      '尿酸',
      // Chinese
      '尿酸',
      // Korean
      '요산',
    ],
    standard: { low: 2.4, high: 6.0 },
    optimal: { low: 2.5, high: 5.0 },
    priority: 3,
    description: 'A waste product from purine metabolism. High uric acid signals metabolic stress and is often elevated alongside insulin resistance and poor kidney clearance - both common in Hashimoto\'s. Very high levels cause gout.',
    highConcern: 'High uric acid is a sign of metabolic strain - often from fructose excess, insulin resistance, or dehydration. It also drives inflammation independently. In Hashimoto\'s, insulin resistance is a common co-driver.',
    lowConcern: null,
    optimalNote: 'The best ways to lower uric acid: cut fructose and alcohol, stay well hydrated, and address insulin resistance. Tart cherry extract and vitamin C have modest evidence for reduction.',
  },

  // ── PCOS-specific markers ────────────────────────────────────────────────────
  {
    id: 'prolactin',
    name: 'Prolactin',
    fullName: 'Prolactin',
    unit: 'ng/mL',
    category: 'hormones',
    aliases: [
      'prolactin', 'prolactin serum', 'serum prolactin', 'prl',
      // Spanish / Portuguese
      'prolactina',
      // French
      'prolactine',
      // German
      'prolaktin',
      // Russian
      'пролактин',
      // Japanese
      'プロラクチン',
      // Chinese
      '泌乳素', '催乳素',
      // Korean
      '프로락틴',
    ],
    standard: { low: 3, high: 30 },
    optimal: { low: 3, high: 15 },
    priority: 3,
    description: 'A hormone made by your pituitary gland. Hypothyroidism directly raises prolactin - your pituitary overproduces TRH (the signal to make more thyroid hormone), which also stimulates prolactin. High prolactin can suppress ovulation and libido even when TSH looks managed.',
    highConcern: 'Elevated prolactin is often a sign of undertreated hypothyroidism - the same pituitary signal that raises TSH also raises prolactin. It can cause irregular periods, low libido, and breast discharge. If prolactin stays high after optimizing thyroid medication, your doctor should rule out a pituitary adenoma.',
    lowConcern: null,
    optimalNote: 'Prolactin often normalizes on its own once thyroid levels are optimized. Retest after 3-6 months of consistent thyroid medication.',
  },
  {
    id: 'leptin',
    name: 'Leptin',
    fullName: 'Leptin',
    unit: 'ng/mL',
    category: 'hormones',
    aliases: [
      'leptin', 'leptin serum', 'serum leptin',
      // Spanish / Portuguese
      'leptina',
      // French
      'leptine',
      // German
      'leptin',
      // Russian
      'лептин',
      // Japanese
      'レプチン',
      // Chinese
      '瘦素',
      // Korean
      '렙틴',
    ],
    standard: { low: 3, high: 25 },
    optimal: { low: 4, high: 15 },
    priority: 3,
    description: 'The "fullness hormone" made by fat cells. When leptin resistance develops (similar to insulin resistance), your brain can\'t hear the signal to stop eating or speed up metabolism. Leptin resistance is extremely common in Hashimoto\'s and drives weight gain that doesn\'t respond to diet alone.',
    highConcern: 'High leptin suggests leptin resistance - your brain is ignoring the fullness signal despite high levels. This makes weight loss very difficult and worsens Hashimoto\'s inflammation. Thyroid hormone is needed for leptin signaling to work properly, creating a vicious cycle when TSH is high.',
    lowConcern: 'Very low leptin (often from very low calorie dieting) suppresses thyroid hormone production - your body slows metabolism to conserve energy. This is why crash diets worsen Hashimoto\'s symptoms.',
    optimalNote: 'Leptin levels are closely tied to body fat percentage and can\'t be directly supplemented. The most effective strategies: optimize thyroid medication, sleep 7-9 hours (sleep deprivation raises leptin resistance), avoid fasting extremes, and reduce inflammation.',
  },
  {
    id: 'testosterone_total',
    name: 'Testosterone (Total)',
    fullName: 'Total Testosterone',
    unit: 'ng/dL',
    category: 'hormones',
    aliases: [
      'testosterone total', 'testosterone, total', 'total testosterone',
      'testosterone', 'testosterone serum',
      // Spanish / Portuguese
      'testosterona total', 'testosterona',
      // French
      'testostérone totale', 'testostérone',
      // German
      'gesamt-testosteron', 'testosteron',
      // Russian
      'тестостерон общий', 'общий тестостерон',
      // Japanese
      'テストステロン', '総テストステロン',
      // Chinese
      '总睾酮', '睾酮',
      // Korean
      '총 테스토스테론', '테스토스테론',
    ],
    standard: { low: 8, high: 60 },
    optimal: { low: 15, high: 50 },
    priority: 3,
    description: 'Total circulating testosterone. In women with Hashimoto\'s, testosterone can be elevated (from PCOS or adrenal stress) or depleted (from chronic illness and low DHEA-S). Both extremes affect energy, mood, and muscle mass.',
    highConcern: 'High total testosterone in women suggests either PCOS (ovarian source) or adrenal overactivity (DHEA-S elevation). It can cause acne, excess hair, irregular periods, and worsened insulin resistance.',
    lowConcern: 'Low testosterone in women causes fatigue, low libido, poor muscle tone, and low motivation - symptoms that overlap heavily with hypothyroidism. Chronic illness, low DHEA-S, and high sex hormone binding globulin (SHBG) all lower testosterone.',
    optimalNote: 'Total testosterone should always be read alongside SHBG and free testosterone - low SHBG can mean more active testosterone even when total looks normal.',
  },
  {
    id: 'fasting_insulin',
    name: 'Fasting Insulin',
    fullName: 'Fasting Serum Insulin',
    unit: 'uIU/mL',
    category: 'hormones',
    aliases: ['insulin fasting', 'fasting insulin', 'insulin serum', 'insulin'],
    standard: { low: 2, high: 25 },
    optimal: { low: 2, high: 8 },
    priority: 2,
    description: 'Measures how much insulin your pancreas is making to manage blood sugar. High fasting insulin is the core driver of PCOS - it directly tells your ovaries to make more testosterone.',
    highConcern: 'High fasting insulin means your cells have become resistant - your pancreas has to work overtime to keep blood sugar normal. This pushes androgens up, disrupts ovulation, worsens inflammation, and makes Hashimoto\'s harder to control.',
    lowConcern: null,
    optimalNote: 'Ideal fasting insulin is under 8 uIU/mL for people with PCOS. Even "normal" levels above 10 can indicate early insulin resistance worth addressing.',
  },
  {
    id: 'free_testosterone',
    name: 'Free Testosterone',
    fullName: 'Free Testosterone',
    unit: 'pg/mL',
    category: 'hormones',
    aliases: ['free testosterone', 'testosterone free', 'testosterone, free', 'testosterone free and weakly bound'],
    standard: { low: 0.1, high: 6.4 },
    optimal: { low: 0.1, high: 2.2 },
    priority: 2,
    description: 'The active form of testosterone that circulates freely in your blood. Elevated levels are a hallmark of PCOS and drive many of its most visible symptoms.',
    highConcern: 'Elevated free testosterone causes acne, excess facial or body hair, hair thinning on the scalp, and irregular periods. In PCOS, high insulin drives the ovaries to produce excess testosterone.',
    lowConcern: null,
    optimalNote: 'Free testosterone above 2.2 pg/mL is often symptomatic. Lowering insulin levels is the most effective way to bring free testosterone down naturally.',
  },
  {
    id: 'dheas',
    name: 'DHEA-S',
    fullName: 'Dehydroepiandrosterone Sulfate',
    unit: 'ug/dL',
    category: 'hormones',
    aliases: ['dhea-s', 'dheas', 'dhea sulfate', 'dehydroepiandrosterone sulfate', 'dhea s', 'dhea-sulfate', 'dhea sulfate mcg'],
    standard: { low: 35, high: 430 },
    optimal: { low: 65, high: 275 },
    priority: 3,
    description: 'An androgen hormone made mostly by your adrenal glands. High DHEA-S can indicate "adrenal PCOS" - where the hormone excess is coming from your stress glands rather than your ovaries.',
    highConcern: 'Elevated DHEA-S suggests your adrenal glands are overproducing androgens, often triggered by chronic stress. This type of PCOS responds differently - stress management and adrenal support become more important than insulin reduction.',
    lowConcern: 'Low DHEA-S can contribute to fatigue and weakened immune function.',
    optimalNote: 'If DHEA-S is high but testosterone is normal, your doctor may want to rule out adrenal conditions. Chronic stress and poor sleep are the most common drivers.',
  },
  {
    id: 'shbg',
    name: 'SHBG',
    fullName: 'Sex Hormone Binding Globulin',
    unit: 'nmol/L',
    category: 'hormones',
    aliases: ['shbg', 'sex hormone binding globulin', 'sex hormone-binding globulin', 'sex horm binding glob'],
    standard: { low: 18, high: 114 },
    optimal: { low: 60, high: 114 },
    priority: 3,
    description: 'A protein that carries sex hormones in your blood, keeping them inactive. Low SHBG means more free, active hormones are circulating - even if your total levels look normal.',
    highConcern: null,
    lowConcern: 'Low SHBG is a direct marker of insulin resistance and means more free testosterone is active. You can have "normal" total testosterone but still have all the PCOS symptoms if SHBG is low.',
    optimalNote: 'SHBG rises naturally as insulin drops. Improving insulin sensitivity - through diet, inositol supplementation, or exercise - is the best way to raise SHBG.',
  },
  {
    id: 'hba1c',
    name: 'HbA1c',
    fullName: 'Hemoglobin A1c (3-Month Blood Sugar Average)',
    unit: '%',
    category: 'hormones',
    aliases: ['hemoglobin a1c', 'hba1c', 'hb a1c', 'a1c', 'glycated hemoglobin', 'glycohemoglobin'],
    standard: { low: 4.0, high: 5.7 },
    optimal: { low: 4.0, high: 5.2 },
    priority: 2,
    description: 'A 3-month average of your blood sugar levels. Unlike a single fasting glucose test, HbA1c shows your overall blood sugar control over time.',
    highConcern: 'An HbA1c above 5.7% means your blood sugar has been running high - this is the pre-diabetes range. High blood sugar drives insulin resistance, raises androgens, and creates inflammation that worsens Hashimoto\'s.',
    lowConcern: null,
    optimalNote: 'For PCOS, aim for HbA1c below 5.2% to minimize the androgen-driving insulin spikes. Cutting refined carbs and adding myo-inositol can make a significant difference.',
  },
  // ── Perimenopause / Postmenopause markers ────────────────────────────────────
  {
    id: 'fsh',
    name: 'FSH',
    fullName: 'Follicle Stimulating Hormone',
    unit: 'mIU/mL',
    category: 'hormones',
    perspectiveOnly: ['menopause', 'postmenopause'],
    aliases: [
      'fsh', 'follicle stimulating hormone', 'follicle-stimulating hormone', 'fsh serum',
      'fsh level', 'follitropin',
      // Spanish
      'hormona foliculoestimulante', 'hormona estimulante del foliculo', 'fsh foliculoestimulante',
      // French
      'hormone folliculo-stimulante', 'follitropine',
      // German
      'follikelstimulierendes hormon', 'follikel stimulierendes hormon',
      // Portuguese
      'hormônio folículo estimulante',
    ],
    standard: { low: 0, high: 30 },
    optimal: { low: 3, high: 10 },
    priority: 3,
    description: 'The hormone that triggers egg follicle development. Rising FSH is one of the earliest signs of perimenopause. Persistently high FSH (>30) confirms full menopause.',
    highConcern: 'Rising FSH signals your ovaries are working harder to respond - a sign that the perimenopause transition is underway. FSH above 30 on two tests taken 60+ days apart confirms you have reached menopause. This is expected and normal, but it helps explain why you may be experiencing symptoms.',
    lowConcern: null,
    optimalNote: 'FSH fluctuates day-to-day in perimenopause, so a single reading is just a snapshot. Testing on day 2–3 of your cycle gives the most useful baseline. In postmenopause, FSH is naturally high (often 40–150) - that is expected and healthy.',
  },
  {
    id: 'estradiol',
    name: 'Estradiol (E2)',
    fullName: 'Estradiol',
    unit: 'pg/mL',
    category: 'hormones',
    perspectiveOnly: ['menopause', 'postmenopause'],
    aliases: [
      'estradiol', 'estradiol e2', 'e2', 'estradiol serum', 'estradiol, serum',
      'oestradiol', 'estradiol level',
      // Spanish
      'estradiol', 'estrogeno', 'estrógeno', 'estradiol e2',
      // French
      'oestradiol', 'estradiol',
      // German
      'östradiol', 'estradiol',
      // Portuguese
      'estradiol',
    ],
    standard: { low: 5, high: 400 },
    optimal: { low: 50, high: 200 },
    priority: 2,
    description: 'The main estrogen your ovaries produce. In perimenopause, estradiol fluctuates unpredictably. In postmenopause, it drops to a consistently low level. Low estrogen overlaps heavily with hypothyroid symptoms - distinguishing the two is key.',
    highConcern: 'Estradiol above 400 without explanation may warrant a check with your doctor, especially if you are on estrogen therapy.',
    lowConcern: 'Low estradiol causes hot flashes, night sweats, poor sleep, vaginal dryness, brain fog, and joint pain - symptoms that overlap heavily with hypothyroidism. If your thyroid labs look managed but you still feel off, low estrogen may be the missing piece.',
    optimalNote: 'Estradiol varies a lot across the menstrual cycle and day-to-day - a single result is context-dependent. In postmenopause, levels of 10–30 pg/mL are expected without hormone therapy.',
  },
  {
    id: 'progesterone',
    name: 'Progesterone',
    fullName: 'Serum Progesterone',
    unit: 'ng/mL',
    category: 'hormones',
    perspectiveOnly: ['menopause'],
    aliases: [
      'progesterone', 'progesterone serum', 'progesterone, serum', 'serum progesterone',
      'progesterone level',
      // Spanish
      'progesterona',
      // French
      'progestérone',
      // German
      'progesteron',
      // Portuguese
      'progesterona',
    ],
    standard: { low: 0.1, high: 25 },
    optimal: { low: 5, high: 25 },
    priority: 3,
    description: 'The calming hormone of the second half of your cycle. In perimenopause, progesterone often drops before estrogen does - low progesterone causes anxiety, poor sleep, heavy periods, and mood swings.',
    highConcern: null,
    lowConcern: 'Low progesterone is one of the first hormonal shifts in perimenopause. It causes anxiety, insomnia, night sweats, irritability, and heavy periods - all symptoms that are often misattributed to thyroid issues. Low progesterone also reduces thyroid hormone activity at the cellular level.',
    optimalNote: 'Progesterone is only meaningful when tested in the second half of your cycle (day 18–22). A result below 5 ng/mL mid-luteal phase suggests you did not ovulate that month - very common in perimenopause.',
  },
  {
    id: 'cortisol_am',
    name: 'Cortisol (AM)',
    fullName: 'Morning Serum Cortisol',
    unit: 'mcg/dL',
    category: 'hormones',
    aliases: [
      'cortisol', 'cortisol am', 'morning cortisol', 'cortisol serum', 'cortisol, serum',
      'cortisol total', 'cortisol blood',
      // Spanish
      'cortisol', 'cortisol matutino', 'cortisol en suero',
      // French
      'cortisol', 'cortisol du matin',
      // German
      'kortisol', 'cortisol morgens',
      // Portuguese
      'cortisol', 'cortisol matinal',
    ],
    standard: { low: 6, high: 23 },
    optimal: { low: 10, high: 18 },
    priority: 3,
    description: 'Your morning cortisol reflects how well your adrenal glands are managing daily stress. In perimenopause and postmenopause, estrogen loss makes the stress response more reactive - high cortisol worsens thyroid symptoms and raises Reverse T3.',
    highConcern: 'High morning cortisol means your body is in a chronic stress state. This directly suppresses thyroid function, raises Reverse T3, disrupts sleep, breaks down muscle, and stores fat around the abdomen. In perimenopause, cortisol spikes are more pronounced because estrogen normally buffers the stress response.',
    lowConcern: 'Low morning cortisol can cause fatigue, dizziness, and poor stress tolerance. If consistently low, your doctor may want to rule out adrenal insufficiency.',
    optimalNote: 'This test must be done before 9 AM for the result to be meaningful. A 4-point saliva cortisol test (morning, noon, evening, bedtime) gives a fuller picture of how your cortisol pattern shifts throughout the day.',
  },

  // ── Fertility-specific markers ───────────────────────────────────────────────
  {
    id: 'folate',
    name: 'Folate',
    fullName: 'Serum Folate',
    unit: 'ng/mL',
    category: 'nutrients',
    perspectiveOnly: ['fertility'],
    aliases: ['folate', 'folic acid', 'serum folate', 'folate serum', 'folate rbc', 'red blood cell folate'],
    standard: { low: 3.4, high: 40.0 },
    optimal: { low: 10, high: 40.0 },
    priority: 2,
    description: 'Folate is critical in the weeks before and after conception for healthy fetal development. Low levels raise the risk of neural tube defects and early pregnancy loss.',
    highConcern: null,
    lowConcern: 'Low folate raises the risk of neural tube defects (problems with the baby\'s brain or spinal cord), early miscarriage, and birth complications. The baby\'s neural tube forms in the first 28 days - often before you know you\'re pregnant.',
    optimalNote: 'Look for a prenatal vitamin with "methylfolate" (also listed as 5-MTHF) rather than regular folic acid. Methylfolate is already in the form your body can use directly.',
  },
];

export const CATEGORIES = {
  thyroid: { label: 'Thyroid Function', color: 'blue' },
  antibodies: { label: 'Thyroid Antibodies', color: 'purple' },
  nutrients: { label: 'Key Nutrients', color: 'green' },
  inflammation: { label: 'Inflammation', color: 'orange' },
  hormones: { label: 'Hormones & Metabolism', color: 'pink' },
  cardiometabolic: { label: 'Heart & Metabolism', color: 'red' },
};
