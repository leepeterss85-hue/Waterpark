import React from "react";
import "@/components/game/particleFX.css";

/**
 * Non-interactive map-wide lighting and weather layer.
 * The game clock and weather simulation remain the source of truth;
 * this component only changes the atmosphere of the rendered park.
 */
export default function MapAmbience(/** @type {{timeOfDay?:string, weather?:string | {id?:string}}} */ { timeOfDay = "day", weather = "clear" }) {
  const weatherId = typeof weather === "string" ? weather : weather?.id || "clear";
  const isNight = timeOfDay === "night";
  const isSunset = timeOfDay === "sunset";
  const isRain = weatherId === "rain" || weatherId === "rainy" || weatherId === "storm";
  const isStorm = weatherId === "storm" || weatherId === "thunderstorm";
  const isCloudy = weatherId === "cloudy" || weatherId === "overcast";

  return (
    <div
      className={`map-ambience park-ambience-time-${timeOfDay} park-ambience-weather-${weatherId}`}
      aria-hidden="true"
    >
      <div className="map-ambience-grade" />
      {isSunset && <div className="map-ambience-sunset-glow" />}
      {isNight && <div className="map-ambience-night-vignette" />}
      {isCloudy && <div className="map-ambience-cloud-filter" />}
      {isRain && <div className="map-ambience-rain" />}
      {isStorm && <div className="map-ambience-storm-flash" />}
      {!isNight && !isRain && !isCloudy && <div className="ambient-sunray" />}
      {!isNight && !isRain && <div className="ambient-flare" />}
      {!isNight && Array.from({ length: 8 }, (_, i) => (
        <span key={`spark-${i}`} className="ambient-sparkle" />
      ))}
      {!isRain && Array.from({ length: 6 }, (_, i) => (
        <span key={`mote-${i}`} className="ambient-mote" />
      ))}
      {isNight && <div className="map-ambience-neon-haze" />}
    </div>
  );
}
