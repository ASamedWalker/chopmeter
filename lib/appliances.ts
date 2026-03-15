export interface Appliance {
  id: string;
  name: string;
  icon: string;
  category: "cooling" | "kitchen" | "lighting" | "laundry" | "entertainment" | "other";
  wattage: number;
  defaultHours: number;
}

export const APPLIANCES: Appliance[] = [
  // Cooling
  { id: "ac", name: "Air Conditioner", icon: "snowflake", category: "cooling", wattage: 1500, defaultHours: 8 },
  { id: "fan", name: "Ceiling Fan", icon: "fan", category: "cooling", wattage: 75, defaultHours: 12 },
  { id: "standing_fan", name: "Standing Fan", icon: "fan", category: "cooling", wattage: 55, defaultHours: 10 },

  // Kitchen
  { id: "fridge", name: "Refrigerator", icon: "thermometer", category: "kitchen", wattage: 150, defaultHours: 24 },
  { id: "freezer", name: "Deep Freezer", icon: "snowflake", category: "kitchen", wattage: 200, defaultHours: 24 },
  { id: "microwave", name: "Microwave", icon: "zap", category: "kitchen", wattage: 1000, defaultHours: 0.5 },
  { id: "kettle", name: "Electric Kettle", icon: "coffee", category: "kitchen", wattage: 1500, defaultHours: 0.3 },
  { id: "blender", name: "Blender", icon: "zap", category: "kitchen", wattage: 400, defaultHours: 0.2 },
  { id: "rice_cooker", name: "Rice Cooker", icon: "cooking_pot", category: "kitchen", wattage: 700, defaultHours: 1 },

  // Lighting
  { id: "led_bulb", name: "LED Bulb", icon: "lightbulb", category: "lighting", wattage: 10, defaultHours: 8 },
  { id: "fluorescent", name: "Fluorescent Tube", icon: "lightbulb", category: "lighting", wattage: 36, defaultHours: 8 },
  { id: "incandescent", name: "Incandescent Bulb", icon: "lightbulb", category: "lighting", wattage: 60, defaultHours: 6 },

  // Laundry
  { id: "washing_machine", name: "Washing Machine", icon: "shirt", category: "laundry", wattage: 500, defaultHours: 1 },
  { id: "iron", name: "Flat Iron", icon: "shirt", category: "laundry", wattage: 1200, defaultHours: 0.5 },

  // Entertainment
  { id: "tv", name: "Television", icon: "monitor", category: "entertainment", wattage: 100, defaultHours: 6 },
  { id: "decoder", name: "Decoder/Set-top Box", icon: "monitor", category: "entertainment", wattage: 30, defaultHours: 6 },
  { id: "laptop", name: "Laptop", icon: "laptop", category: "entertainment", wattage: 65, defaultHours: 8 },
  { id: "phone_charger", name: "Phone Charger", icon: "smartphone", category: "entertainment", wattage: 10, defaultHours: 3 },
  { id: "speaker", name: "Sound System", icon: "volume_2", category: "entertainment", wattage: 100, defaultHours: 4 },

  // Other
  { id: "water_heater", name: "Water Heater", icon: "droplets", category: "other", wattage: 1500, defaultHours: 1 },
  { id: "water_pump", name: "Water Pump", icon: "droplets", category: "other", wattage: 750, defaultHours: 2 },
  { id: "hair_dryer", name: "Hair Dryer", icon: "wind", category: "other", wattage: 1800, defaultHours: 0.2 },
];

export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "cooling", label: "Cooling" },
  { id: "kitchen", label: "Kitchen" },
  { id: "lighting", label: "Lighting" },
  { id: "laundry", label: "Laundry" },
  { id: "entertainment", label: "Entertainment" },
  { id: "other", label: "Other" },
] as const;
