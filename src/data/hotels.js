// Hotel / Resort system: definitions, amenities, simulation, and resort rating.

export const HOTEL_TIERS = [
  {
    id: "budget_inn",
    name: "Budget Inn",
    category: "hotel",
    tier: "budget",
    cost: 25000,
    rooms: 20,
    roomPrice: 80,
    maintenance: 200,
    income: 0,
    capacity: 20,
    fun: 0,
    icon: "Bed",
    color: "from-amber-400 to-orange-600",
    description: "Affordable overnight rooms for budget-conscious park visitors.",
    amenities: ["wifi", "parking"],
    baseHappiness: 50,
  },
  {
    id: "family_suites",
    name: "Family Suites",
    category: "hotel",
    tier: "family",
    cost: 60000,
    rooms: 35,
    roomPrice: 140,
    maintenance: 450,
    income: 0,
    capacity: 35,
    fun: 0,
    icon: "Users",
    color: "from-cyan-400 to-blue-600",
    description: "Spacious family suites with kitchenettes and pool access.",
    amenities: ["wifi", "parking", "pool", "kids_club", "restaurant"],
    baseHappiness: 65,
  },
  {
    id: "grand_luxury",
    name: "Grand Luxury Resort",
    category: "hotel",
    tier: "luxury",
    cost: 150000,
    rooms: 60,
    roomPrice: 280,
    maintenance: 900,
    income: 0,
    capacity: 60,
    fun: 0,
    icon: "Crown",
    color: "from-violet-400 to-purple-700",
    description: "Five-star luxury resort with full spa, fine dining, and concierge service.",
    amenities: ["wifi", "parking", "pool", "spa", "gym", "concierge", "restaurant", "shuttle", "kids_club"],
    baseHappiness: 80,
  },
];

export const HOTEL_AMENITIES = {
  luxury_pool: { name: "Luxury Pool", icon: "Waves", happiness: 9 },
  wifi: { name: "WiFi", icon: "Wifi", happiness: 2 },
  parking: { name: "Parking", icon: "Car", happiness: 2 },
  pool: { name: "Pool Access", icon: "Waves", happiness: 5 },
  kids_club: { name: "Kids Club", icon: "Baby", happiness: 6 },
  spa: { name: "Spa", icon: "Flower2", happiness: 8 },
  gym: { name: "Fitness Center", icon: "Dumbbell", happiness: 5 },
  concierge: { name: "Concierge", icon: "BellRing", happiness: 6 },
  restaurant: { name: "Restaurant", icon: "Utensils", happiness: 7 },
  shuttle: { name: "Park Shuttle", icon: "Bus", happiness: 5 },
};

export function getHotelDef(id) {
  return HOTEL_TIERS.find((h) => h.id === id);
}

export function isHotelItem(item) {
  return item && item.category === "hotel";
}

// Rooms available at a given upgrade level
export function hotelRooms(hotel, level) {
  return Math.round(hotel.rooms * (1 + level * 0.15));
}

// Room price at a given upgrade level
export function hotelRoomPrice(hotel, level) {
  return Math.round(hotel.roomPrice * (1 + level * 0.08));
}

// Amenities available at a given upgrade level (budget/family unlock more as they upgrade)
export function hotelAmenities(hotel, level) {
  if (hotel.tier === "luxury") return [...new Set([...hotel.amenities, ...(level >= 2 ? ["luxury_pool"] : [])])];
  if (hotel.tier === "family") {
    const extra = level >= 6 ? ["spa", "gym", "luxury_pool"] : level >= 3 ? ["spa", "gym"] : [];
    return [...new Set([...hotel.amenities, ...extra])];
  }
  if (hotel.tier === "budget") {
    const extra = [...(level >= 2 ? ["pool"] : []), ...(level >= 3 ? ["restaurant"] : []), ...(level >= 4 ? ["gym"] : []), ...(level >= 6 ? ["luxury_pool"] : [])];
    return [...new Set([...hotel.amenities, ...extra])];
  }
  return hotel.amenities;
}

// Amenity happiness bonus for a hotel at a given level
export function hotelAmenityBonus(hotel, level) {
  const amenities = hotelAmenities(hotel, level);
  return amenities.reduce((s, a) => s + (HOTEL_AMENITIES[a]?.happiness || 0), 0);
}

// Calculate resort rating (0-5 stars) from all placed hotels
export function calculateResortRating(hotels, upgrades) {
  if (!hotels.length) return 0;
  let totalScore = 0;
  let totalRooms = 0;
  for (const h of hotels) {
    const level = upgrades[h.tileIndex] || 0;
    const rooms = hotelRooms(h.def, level);
    const amenityBonus = hotelAmenityBonus(h.def, level);
    const tierScore = h.def.tier === "luxury" ? 4.0 : h.def.tier === "family" ? 3.0 : 2.0;
    const upgradeScore = level * 0.12;
    const score = tierScore + upgradeScore + amenityBonus * 0.04;
    totalScore += score * rooms;
    totalRooms += rooms;
  }
  const avg = totalRooms > 0 ? totalScore / totalRooms : 0;
  return Math.min(5, Math.round(avg * 10) / 10);
}

// Simulate one day of hotel operations
export function simulateHotelDay({ hotels, hotelGuests, upgrades, day, reputation, resortRating, seasonEvent, weather, parkMood, sandbox, hotelPriceMult = 1, demandMult = 1 }) {
  // 1. Check out guests whose stay is over
  const remaining = [];
  const checkedOut = [];
  for (const g of hotelGuests) {
    if (g.checkOutDay <= day) {
      checkedOut.push(g);
    } else {
      remaining.push(g);
    }
  }

  // 2. Build hotel room map
  const hotelRoomMap = new Map();
  let totalRooms = 0;
  let totalOccupied = 0;
  for (const h of hotels) {
    const level = upgrades[h.tileIndex] || 0;
    const rooms = hotelRooms(h.def, level);
    const occupied = remaining.filter((g) => g.hotelTile === h.tileIndex).length;
    totalRooms += rooms;
    totalOccupied += occupied;
    hotelRoomMap.set(h.tileIndex, { def: h.def, rooms, occupied, level, tileIndex: h.tileIndex });
  }

  // 3. Generate demand and check in new guests
  const availableRooms = totalRooms - totalOccupied;
  const newCheckIns = [];
  if (availableRooms > 0 && hotels.length > 0) {
 const priceDemandMult = Math.max(0.5, 1 - Math.max(0, (hotelPriceMult - 1) * 0.6));
    const baseDemand = (reputation / 100) * totalRooms * 0.35;
    const ratingMult = 0.6 + (resortRating / 5) * 0.8;
    const seasonMult = seasonEvent?.guestMult ?? 1;
    const weatherMult = weather?.id === "sunny" ? 1.15 : weather?.id === "rain" ? 0.7 : 1;
    const moodMult = parkMood > 60 ? 1.1 : parkMood < 40 ? 0.85 : 1;
    const demand = Math.floor(baseDemand * ratingMult * seasonMult * weatherMult * moodMult * priceDemandMult * Math.max(0, demandMult));
    const checkInCount = Math.min(availableRooms, Math.max(0, demand));

    for (let i = 0; i < checkInCount; i++) {
      const available = [...hotelRoomMap.values()].filter((h) => h.occupied < h.rooms);
      if (!available.length) break;
      // Match guests to the resort they can realistically afford.
      // Better reputation/rating shifts demand toward family and luxury stock,
      // while lower-rated parks naturally fill budget rooms first.
      const quality = Math.max(0, Math.min(1, (reputation / 100) * 0.65 + (resortRating / 5) * 0.35));
      const weighted = available.map((hotel) => {
        const tierWeight = hotel.def.tier === "luxury"
          ? 0.45 + quality * 1.75
          : hotel.def.tier === "family"
            ? 0.85 + quality * 0.9
            : 1.55 - quality * 0.35;
        const upgradeWeight = 1 + hotel.level * 0.08;
        return { hotel, weight: Math.max(0.1, tierWeight * upgradeWeight) };
      });
      const totalWeight = weighted.reduce((sum, entry) => sum + entry.weight, 0);
      let roll = Math.random() * totalWeight;
      let hotel = weighted[weighted.length - 1].hotel;
      for (const entry of weighted) {
        roll -= entry.weight;
        if (roll <= 0) {
          hotel = entry.hotel;
          break;
        }
      }
      const stayLength = 2 + Math.floor(Math.random() * 4); // 2-5 days
      newCheckIns.push({
        id: `g${day}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        hotelTile: hotel.tileIndex,
        tier: hotel.def.tier,
        checkInDay: day,
        checkOutDay: day + stayLength,
        happiness: hotel.def.baseHappiness,
        dailyParkSpend: 0,
      });
      hotel.occupied++;
    }
  }

  // 4. Calculate revenue, expenses, and guest happiness
  const allGuests = [...remaining, ...newCheckIns];
  let roomRevenue = 0;
  let hotelExpenses = 0;
  let totalParkSpend = 0;
  let totalHappiness = 0;

  for (const h of hotels) {
    const level = upgrades[h.tileIndex] || 0;
    const roomPrice = Math.round(hotelRoomPrice(h.def, level) * hotelPriceMult);
    const guestsInHotel = allGuests.filter((g) => g.hotelTile === h.tileIndex);
    roomRevenue += guestsInHotel.length * roomPrice;
    hotelExpenses += h.def.maintenance * (1 + level * 0.1);

    const amenityBonus = hotelAmenityBonus(h.def, level);
    for (const g of guestsInHotel) {
      // Hotel guests spend money in the waterpark (proportional to room price tier)
      const parkSpend = Math.round(h.def.roomPrice * 0.25 * hotelPriceMult * (0.8 + Math.random() * 0.4));
      g.dailyParkSpend = parkSpend;
      totalParkSpend += parkSpend;
      // Happiness: base + amenities + upgrade level + park mood influence
      const ratingQuality = (resortRating || 0) * 1.2;
      const weatherComfort = weather?.id === "sunny" ? 2 : weather?.id === "rain" ? -3 : 0;
      const happiness = Math.min(
        100,
        h.def.baseHappiness +
          amenityBonus +
          level * 3 +
          ratingQuality +
          weatherComfort +
          (parkMood - 50) * 0.3
      );
      g.happiness = Math.round(happiness);
      totalHappiness += g.happiness;
    }
  }

  const occupancy = totalRooms > 0 ? (allGuests.length / totalRooms) * 100 : 0;
  const avgHappiness = allGuests.length > 0 ? totalHappiness / allGuests.length : 0;

  return {
    remainingGuests: allGuests,
    checkedOut,
    newCheckIns,
    roomRevenue: Math.round(roomRevenue),
    hotelExpenses: Math.round(hotelExpenses),
    parkSpend: Math.round(totalParkSpend),
    occupancy: Math.round(occupancy),
    avgHappiness: Math.round(avgHappiness),
    totalGuests: allGuests.length,
    totalRooms,
  };
}