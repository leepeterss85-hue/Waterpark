// Resort Management: unified hotel + waterpark stats, facility categorization, popularity.
import { getAttraction } from "./gameData";
import { hotelRooms, hotelAmenities } from "./hotels";

const FACILITY_CAPACITY = 60;

export const RESORT_FACILITY_CATEGORIES = {
  luxury: {
    name: "Luxury Facilities",
    icon: "Crown",
    color: "from-violet-400 to-purple-600",
    ids: new Set(["cabanas", "vip_lounge", "spa", "sushi_bar", "float_therapy", "massage_pavilion", "hot_tub", "sauna"]),
  },
  restaurants: {
    name: "Restaurants & Dining",
    icon: "Utensils",
    color: "from-orange-400 to-red-500",
    ids: new Set(["dining", "burger_shack", "pizza_stand", "concessions", "beach_bar", "ice_cream", "coffee_bar", "juice_bar", "smoothie_bar", "sushi_bar"]),
  },
  spaWellness: {
    name: "Spa & Wellness",
    icon: "Flower2",
    color: "from-pink-400 to-rose-500",
    ids: new Set(["spa", "sauna", "massage_pavilion", "float_therapy", "hot_tub"]),
  },
  shops: {
    name: "Shops & Retail",
    icon: "ShoppingBag",
    color: "from-emerald-400 to-teal-600",
    ids: new Set(["retail", "gift_shop", "photo_kiosk"]),
  },
  entertainment: {
    name: "Entertainment",
    icon: "Gamepad2",
    color: "from-blue-400 to-indigo-600",
    ids: new Set(["arcade", "party_room", "mini_golf", "carousel", "bumper_boats", "go_karts"]),
  },
};

export function categorizeResortFacilities(grid) {
  const result = {};
  for (const [key, cat] of Object.entries(RESORT_FACILITY_CATEGORIES)) {
    result[key] = { ...cat, count: 0, items: [] };
  }
  if (!grid) return result;
  for (let idx = 0; idx < grid.length; idx++) {
    const tile = grid[idx];
    if (!tile) continue;
    const def = getAttraction(tile.id);
    if (!def) continue;
    for (const [key, cat] of Object.entries(RESORT_FACILITY_CATEGORIES)) {
      if (cat.ids.has(tile.id)) {
        result[key].count++;
        result[key].items.push({ idx, id: tile.id, name: def.name });
      }
    }
  }
  return result;
}

export function calculateResortStats({ hotels, upgrades, grid, hotelStats, guests, reputation, resortRating }) {
  let totalRooms = 0;
  let totalAmenities = 0;
  for (const h of hotels) {
    const level = upgrades[h.tileIndex] || 0;
    totalRooms += hotelRooms(h.def, level);
    totalAmenities += hotelAmenities(h.def, level).length;
  }

  let parkCapacity = 0;
  if (grid) {
    for (let idx = 0; idx < grid.length; idx++) {
      const tile = grid[idx];
      if (!tile) continue;
      const def = getAttraction(tile.id);
      if (!def) continue;
      const level = upgrades[idx] || 0;
      if (def.capacity > 0) {
        parkCapacity += Math.round(def.capacity * (1 + 0.2 * level));
      } else if (def.category === "facility") {
        parkCapacity += FACILITY_CAPACITY;
      }
    }
  }

  const resortCapacity = totalRooms + parkCapacity;
  const hotelGuests = hotelStats?.totalGuests || 0;
  const parkGuests = guests || 0;
  const resortOccupancy = resortCapacity > 0 ? ((hotelGuests + parkGuests) / resortCapacity) * 100 : 0;

  const facilities = categorizeResortFacilities(grid);
  const facilityCount = Object.values(facilities).reduce((s, c) => s + c.count, 0);

  // Resort popularity (0-100): rating, reputation, amenities, facilities
  const ratingScore = resortRating * 15; // 0-75
  const repScore = reputation * 0.1; // 0-10
  const amenityScore = Math.min(10, totalAmenities * 0.5); // 0-10
  const facilityScore = Math.min(5, facilityCount * 0.3); // 0-5
  const resortPopularity = Math.min(100, Math.round(ratingScore + repScore + amenityScore + facilityScore));

  return {
    resortCapacity,
    resortOccupancy: Math.round(resortOccupancy),
    resortPopularity,
    totalRooms,
    parkCapacity,
    hotelGuests,
    parkGuests,
    facilities,
    totalAmenities,
    facilityCount,
  };
}