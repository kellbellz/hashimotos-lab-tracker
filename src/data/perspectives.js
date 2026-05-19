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
