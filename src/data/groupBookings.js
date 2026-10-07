// Group bookings & school trips: guaranteed upfront revenue in exchange for
// crowding the park and dragging down guest mood. A capacity-vs-revenue trade-off.

export const GROUP_TYPES = [
  { id: "birthday_party", name: "Birthday Party", sizeRange: [15, 30], paymentRange: [300, 600], moodImpact: -3, minLevel: 1, icon: "Cake" },
  { id: "school_trip", name: "School Trip", sizeRange: [40, 80], paymentRange: [600, 1100], moodImpact: -6, minLevel: 1, icon: "GraduationCap" },
  { id: "summer_camp", name: "Summer Camp", sizeRange: [30, 60], paymentRange: [500, 900], moodImpact: -5, minLevel: 2, icon: "Tent" },
  { id: "tour_group", name: "Tour Bus Group", sizeRange: [35, 70], paymentRange: [700, 1300], moodImpact: -5, minLevel: 3, icon: "Bus" },
  { id: "corporate_day", name: "Corporate Outing", sizeRange: [50, 120], paymentRange: [1500, 3000], moodImpact: -4, minLevel: 5, icon: "Briefcase" },
];

// Roll a new group booking request eligible for the player's level.
export function rollGroupBooking(level, day) {
  const eligible = GROUP_TYPES.filter((g) => level >= g.minLevel);
  if (!eligible.length) return null;
  const type = eligible[Math.floor(Math.random() * eligible.length)];
  const size = type.sizeRange[0] + Math.floor(Math.random() * (type.sizeRange[1] - type.sizeRange[0] + 1));
  const payment = type.paymentRange[0] + Math.floor(Math.random() * (type.paymentRange[1] - type.paymentRange[0] + 1));
  return {
    id: `${type.id}-${day}-${Math.random().toString(36).slice(2, 7)}`,
    typeId: type.id,
    name: type.name,
    icon: type.icon,
    size,
    payment,
    moodImpact: type.moodImpact,
    day,
  };
}

export function getGroupType(typeId) {
  return GROUP_TYPES.find((g) => g.id === typeId) || null;
}