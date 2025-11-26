/**
 * Tokyo locations, prompts, and sound categories
 */

export interface TokyoLocation {
  name: string;
  lat: number;
  lng: number;
  category: 'district' | 'station' | 'park' | 'entertainment' | 'temple' | 'commercial';
  prompts: string[];
  timeVariants?: {
    morning?: string;
    afternoon?: string;
    evening?: string;
    night?: string;
  };
}

export const TOKYO_LOCATIONS: Record<string, TokyoLocation> = {
  shibuya: {
    name: 'Shibuya Crossing',
    lat: 35.6595,
    lng: 139.7004,
    category: 'district',
    prompts: [
      'Shibuya crossing ambient noise with crowd',
      'Urban pedestrian crossing sounds',
      'Busy Tokyo intersection atmosphere'
    ],
    timeVariants: {
      morning: 'Morning rush hour Shibuya crossing',
      afternoon: 'Daytime Shibuya shopping district',
      evening: 'Evening Shibuya with street performers',
      night: 'Late night Shibuya nightlife'
    }
  },
  shinjuku: {
    name: 'Shinjuku Station',
    lat: 35.6896,
    lng: 139.7006,
    category: 'station',
    prompts: [
      'Shinjuku station announcements and departure melodies',
      'Busy train station platform sounds',
      'Tokyo metro station atmosphere'
    ],
    timeVariants: {
      morning: 'Morning rush hour Shinjuku station',
      afternoon: 'Midday Shinjuku station transit',
      evening: 'Evening commute Shinjuku',
      night: 'Late night Shinjuku station quiet'
    }
  },
  harajuku: {
    name: 'Harajuku',
    lat: 35.6702,
    lng: 139.7027,
    category: 'district',
    prompts: [
      'Harajuku street music and youth culture',
      'Takeshita street crowd ambience',
      'Trendy Tokyo shopping district sounds'
    ]
  },
  akihabara: {
    name: 'Akihabara',
    lat: 35.7022,
    lng: 139.7745,
    category: 'entertainment',
    prompts: [
      'Akihabara electronics district with arcade sounds',
      'Anime and gaming shop atmosphere',
      'Electric town ambience'
    ]
  },
  asakusa: {
    name: 'Senso-ji Temple',
    lat: 35.7148,
    lng: 139.7967,
    category: 'temple',
    prompts: [
      'Asakusa temple atmosphere with bells',
      'Traditional Japanese temple ambience',
      'Peaceful temple grounds with visitors'
    ]
  },
  ginza: {
    name: 'Ginza',
    lat: 35.6717,
    lng: 139.7647,
    category: 'commercial',
    prompts: [
      'Ginza upscale shopping district',
      'Luxury boutique atmosphere',
      'Sophisticated Tokyo shopping ambience'
    ]
  },
  roppongi: {
    name: 'Roppongi',
    lat: 35.6627,
    lng: 139.7307,
    category: 'entertainment',
    prompts: [
      'Roppongi nightlife district',
      'International entertainment district sounds',
      'Vibrant night scene atmosphere'
    ]
  },
  uenoPark: {
    name: 'Ueno Park',
    lat: 35.7153,
    lng: 139.7742,
    category: 'park',
    prompts: [
      'Ueno park peaceful nature sounds',
      'Tokyo city park ambience',
      'Birds and nature in urban park'
    ],
    timeVariants: {
      morning: 'Morning Ueno park with birds chirping',
      afternoon: 'Afternoon Ueno park with families',
      evening: 'Evening Ueno park sunset atmosphere',
      night: 'Quiet night Ueno park'
    }
  },
  yoyogi: {
    name: 'Yoyogi Park',
    lat: 35.6719,
    lng: 139.6963,
    category: 'park',
    prompts: [
      'Yoyogi park weekend drum circles',
      'Street performers in Tokyo park',
      'Active urban park atmosphere'
    ]
  },
  tokyoStation: {
    name: 'Tokyo Station',
    lat: 35.6812,
    lng: 139.7671,
    category: 'station',
    prompts: [
      'Tokyo station grand terminal atmosphere',
      'Shinkansen platform departure sounds',
      'Major railway hub ambience'
    ]
  }
};

// Sound categories for AI generation
export const SOUND_CATEGORIES = {
  transportation: [
    'Tokyo metro train sounds',
    'JR Yamanote line departure melody',
    'Shinkansen platform announcement',
    'Taxi door automatic closing',
    'Train crossing warning bells',
    'Station platform ambience'
  ],
  urban: [
    'Convenience store door chime',
    'Vending machine area sounds',
    'Pedestrian crossing signal music',
    'Street construction ambience',
    'Urban traffic flow',
    'Bicycle bell sounds'
  ],
  entertainment: [
    'Arcade game center sounds',
    'Pachinko parlor atmosphere',
    'Karaoke room ambience',
    'Shopping mall background music',
    'Street performer sounds'
  ],
  food: [
    'Izakaya evening atmosphere',
    'Ramen shop kitchen sounds',
    'Sushi restaurant ambience',
    'Convenience store background',
    'Food market chatter'
  ],
  nature: [
    'Summer cicadas in Tokyo',
    'Cherry blossom viewing atmosphere',
    'Park fountain sounds',
    'Urban garden ambience',
    'Rainy Tokyo street sounds',
    'Winter Tokyo quiet atmosphere'
  ],
  cultural: [
    'Temple bell ringing',
    'Shrine festival sounds',
    'Traditional market atmosphere',
    'Museum quiet ambience',
    'Tea house peaceful sounds'
  ]
};

// Time-based prompt modifiers
export function getTimeBasedPrompts(): string[] {
  const hour = new Date().getHours();

  if (hour >= 6 && hour < 9) {
    return [
      'Tokyo morning rush hour atmosphere',
      'Early morning station announcements',
      'Morning commute sounds'
    ];
  } else if (hour >= 9 && hour < 12) {
    return [
      'Mid-morning Tokyo business district',
      'Office area ambience',
      'Morning cafe atmosphere'
    ];
  } else if (hour >= 12 && hour < 14) {
    return [
      'Lunch time office district',
      'Restaurant lunch rush',
      'Midday shopping district'
    ];
  } else if (hour >= 14 && hour < 18) {
    return [
      'Afternoon Tokyo shopping areas',
      'Casual afternoon ambience',
      'Late afternoon park sounds'
    ];
  } else if (hour >= 18 && hour < 22) {
    return [
      'Evening Shibuya atmosphere',
      'Izakaya dinner time',
      'Evening commute homeward'
    ];
  } else if (hour >= 22 || hour < 2) {
    return [
      'Late night convenience store',
      'Quiet Tokyo streets',
      'Night owl district sounds'
    ];
  } else {
    return [
      'Deep night Tokyo silence',
      'Very late night ambience',
      'Pre-dawn Tokyo quiet'
    ];
  }
}

// Weather-based prompt modifiers
export interface WeatherPrompts {
  clear: string[];
  rain: string[];
  cloudy: string[];
  snow: string[];
}

export const WEATHER_PROMPTS: WeatherPrompts = {
  clear: [
    'Clear sunny Tokyo day sounds',
    'Bright weather ambience',
    'Pleasant outdoor atmosphere'
  ],
  rain: [
    'Rainy Tokyo street with umbrellas',
    'Rain on Tokyo buildings',
    'Indoor cafe during rain',
    'Wet pavement sounds'
  ],
  cloudy: [
    'Overcast Tokyo atmosphere',
    'Gentle cloudy day ambience',
    'Soft weather sounds'
  ],
  snow: [
    'Snowy Tokyo quiet streets',
    'Winter Tokyo peaceful atmosphere',
    'Snow falling ambience'
  ]
};

// Get all prompts from a location
export function getLocationPrompts(locationId: string): string[] {
  const location = TOKYO_LOCATIONS[locationId];
  if (!location) return [];

  const hour = new Date().getHours();
  let timePrompt: string | undefined;

  if (hour >= 6 && hour < 12 && location.timeVariants?.morning) {
    timePrompt = location.timeVariants.morning;
  } else if (hour >= 12 && hour < 17 && location.timeVariants?.afternoon) {
    timePrompt = location.timeVariants.afternoon;
  } else if (hour >= 17 && hour < 21 && location.timeVariants?.evening) {
    timePrompt = location.timeVariants.evening;
  } else if ((hour >= 21 || hour < 6) && location.timeVariants?.night) {
    timePrompt = location.timeVariants.night;
  }

  return timePrompt ? [timePrompt, ...location.prompts] : location.prompts;
}

// Get all unique prompts for embedding generation
export function getAllUniquePrompts(): string[] {
  const prompts = new Set<string>();

  // Add location prompts
  Object.values(TOKYO_LOCATIONS).forEach(location => {
    location.prompts.forEach(p => prompts.add(p));
    if (location.timeVariants) {
      Object.values(location.timeVariants).forEach(p => prompts.add(p));
    }
  });

  // Add category prompts
  Object.values(SOUND_CATEGORIES).forEach(category => {
    category.forEach(p => prompts.add(p));
  });

  // Add time-based prompts
  getTimeBasedPrompts().forEach(p => prompts.add(p));

  // Add weather prompts
  Object.values(WEATHER_PROMPTS).forEach(weatherType => {
    weatherType.forEach(p => prompts.add(p));
  });

  return Array.from(prompts);
}
