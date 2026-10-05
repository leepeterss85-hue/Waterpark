import React from "react";

// Renders distinct multi-story building artwork for each hotel tier.
export default function HotelArtwork({ attr, level = 0 }) {
  const tier = attr.tier;

  if (tier === "luxury") {
    return (
      <div className="hotel-art hotel-art-luxury">
        <div className="hotel-tower-luxury">
          <div className="hotel-tower-spire" />
          <div className="hotel-tower-body">
            {[0, 1, 2, 3, 4].map((row) => (
              <div key={row} className="hotel-window-row">
                {[0, 1, 2].map((col) => (
                  <span key={col} className="hotel-window-luxury" />
                ))}
              </div>
            ))}
          </div>
          <div className="hotel-entrance-luxury">
            <div className="hotel-canopy" />
            <div className="hotel-door-luxury" />
          </div>
        </div>
        {level >= 2 && <div className="hotel-pool-luxury" />}
        {level >= 4 && <div className="hotel-spa-wing" />}
      </div>
    );
  }

  if (tier === "family") {
    return (
      <div className="hotel-art hotel-art-family">
        <div className="hotel-building-family">
          <div className="hotel-roof-family" />
          <div className="hotel-body-family">
            {[0, 1, 2].map((row) => (
              <div key={row} className="hotel-window-row">
                {[0, 1, 2, 3].map((col) => (
                  <span key={col} className="hotel-window-family" />
                ))}
              </div>
            ))}
          </div>
          <div className="hotel-entrance-family">
            <div className="hotel-door-family" />
          </div>
        </div>
        <div className="hotel-pool-family" />
        {level >= 3 && <div className="hotel-kids-club" />}
      </div>
    );
  }

  // budget
  return (
    <div className="hotel-art hotel-art-budget">
      <div className="hotel-building-budget">
        <div className="hotel-roof-budget" />
        <div className="hotel-body-budget">
          {[0, 1].map((row) => (
            <div key={row} className="hotel-window-row">
              {[0, 1, 2, 3].map((col) => (
                <span key={col} className="hotel-window-budget" />
              ))}
            </div>
          ))}
        </div>
        <div className="hotel-entrance-budget">
          <div className="hotel-door-budget" />
          <div className="hotel-sign-budget">INN</div>
        </div>
      </div>
      {level >= 2 && <div className="hotel-pool-budget" />}
    </div>
  );
}