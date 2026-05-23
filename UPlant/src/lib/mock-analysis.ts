export type PlantAnalysis = {
  plant: {
    commonName: string;
    scientificName: string;
    confidence: number;
  };
  health: {
    status: 'healthy' | 'mild issue' | 'unhealthy';
    condition: string;
    confidence: number;
  };
  care: {
    diagnosis: string;
    fixes: string[];
    track: string[];
  };
};

const DEMO_ANALYSES: PlantAnalysis[] = [
  {
    plant: {
      commonName: 'Golden pothos',
      scientificName: 'Epipremnum aureum',
      confidence: 0.92,
    },
    health: {
      status: 'mild issue',
      condition: 'yellowing leaves',
      confidence: 0.84,
    },
    care: {
      diagnosis: 'Yellowing often points to overwatering, low light, or poor drainage.',
      fixes: [
        'Let the top 1-2 inches of soil dry before watering.',
        'Check that the pot drains fully after watering.',
        'Move the plant to bright indirect light.',
      ],
      track: ['watering dates', 'soil moisture', 'new yellow leaves', 'new growth'],
    },
  },
  {
    plant: {
      commonName: 'Monstera',
      scientificName: 'Monstera deliciosa',
      confidence: 0.89,
    },
    health: {
      status: 'mild issue',
      condition: 'brown leaf edges',
      confidence: 0.81,
    },
    care: {
      diagnosis: 'Brown edges can come from low humidity, inconsistent watering, or harsh sun.',
      fixes: [
        'Keep the plant in bright indirect light.',
        'Water deeply when the top soil is dry.',
        'Increase humidity if new leaves keep crisping.',
      ],
      track: ['humidity', 'soil dryness', 'new brown edges', 'leaf uncurling'],
    },
  },
];

export function getMockPlantAnalysis() {
  return DEMO_ANALYSES[Math.floor(Math.random() * DEMO_ANALYSES.length)];
}
