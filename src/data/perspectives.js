export const PERSPECTIVES = [
  {
    id: 'hashimotos',
    name: "Hashimoto's",
    emoji: '🦋',
    description: 'Thyroid autoimmune focus',
    additionalMarkerIds: [],
    optimalOverrides: {},
  },
  {
    id: 'pcos',
    name: "Hashimoto's + PCOS",
    emoji: '⚖️',
    description: 'Thyroid + hormone & blood sugar balance',
    additionalMarkerIds: ['fasting_insulin', 'free_testosterone', 'dheas', 'shbg', 'hba1c'],
    optimalOverrides: {
      tsh: { low: 1.0, high: 2.0 },
    },
  },
  {
    id: 'menopause',
    name: "Hashimoto's + Perimenopause",
    emoji: '🌊',
    description: 'Thyroid + hormone transition support',
    additionalMarkerIds: ['fsh', 'estradiol', 'progesterone', 'cortisol_am', 'dheas', 'shbg'],
    optimalOverrides: {
      tsh:     { low: 1.0, high: 2.0 },
      vitd:    { low: 60, high: 80 },
      ferritin: { low: 70, high: 150 },
    },
  },
  {
    id: 'postmenopause',
    name: "Hashimoto's + Postmenopause",
    emoji: '🌸',
    description: 'Thyroid + bone, heart & vitality support',
    additionalMarkerIds: ['fsh', 'estradiol', 'cortisol_am', 'dheas', 'shbg', 'hba1c'],
    optimalOverrides: {
      tsh:      { low: 1.0, high: 2.0 },
      vitd:     { low: 60, high: 80 },
      fsh:      { low: 25, high: 150 },   // expected high in postmenopause = normal
      estradiol: { low: 5, high: 30 },    // expected low range = normal
    },
  },
  {
    id: 'undiagnosed',
    name: "Could I Have Hashimoto's?",
    emoji: '🔍',
    description: "Explore if your results could be Hashimoto's",
    additionalMarkerIds: [],
    optimalOverrides: {},
  },
  {
    id: 'fertility',
    name: 'Trying to Conceive',
    emoji: '🌱',
    description: 'Optimize levels before pregnancy',
    additionalMarkerIds: ['folate'],
    optimalOverrides: {
      tsh: { low: 0.5, high: 2.5 },
      ferritin: { low: 90, high: 150 },
      vitd: { low: 60, high: 80 },
    },
  },
];

export const DEFAULT_PERSPECTIVE = PERSPECTIVES[0];
