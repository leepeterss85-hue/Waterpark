export const ACQUISITION_TARGETS=[
{id:"splash_kingdom",name:"Splash Kingdom",cost:450000,rep:75,market:40,bonus:{guestMult:.10,incomeMult:.06},description:"Acquire the family rival and inherit its customer base."},
{id:"adrenaline_cove",name:"Adrenaline Cove",cost:650000,rep:82,market:45,bonus:{guestMult:.08,incomeMult:.10},description:"Acquire the thrill rival and inherit its attraction expertise."},
{id:"paradise_springs",name:"Paradise Springs",cost:900000,rep:88,market:50,bonus:{guestMult:.06,incomeMult:.14},description:"Acquire the luxury rival and inherit its premium network."}
];
export const FRANCHISE_MAPS=[
{id:"coastal",name:"Coastal Resort",cost:750000,level:18,bonus:{guestMult:.12},description:"Open a seaside sister park."},
{id:"tropical",name:"Tropical Island",cost:1200000,level:24,bonus:{guestMult:.18,incomeMult:.08},description:"Open an island water resort."},
{id:"alpine",name:"Alpine Adventure",cost:1800000,level:30,bonus:{incomeMult:.18},description:"Open an all-season mountain waterpark."},
{id:"space",name:"Celestial Resort",cost:3000000,level:40,bonus:{guestMult:.25,incomeMult:.20},description:"The ultimate prestige destination."}
];
export function empireBonuses(acquired=[],franchises=[]){const b={guestMult:0,incomeMult:0};for(const id of acquired){const x=ACQUISITION_TARGETS.find(t=>t.id===id);if(x){b.guestMult+=x.bonus.guestMult||0;b.incomeMult+=x.bonus.incomeMult||0;}}for(const id of franchises){const x=FRANCHISE_MAPS.find(t=>t.id===id);if(x){b.guestMult+=x.bonus.guestMult||0;b.incomeMult+=x.bonus.incomeMult||0;}}return b;}
