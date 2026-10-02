export interface FunFact {
  id: number;
  category: string;
  emoji: string;
  title: string;
  fact: string;
  detail: string;
}

export const ENGINEERING_FUN_FACTS: FunFact[] = [
  {
    id: 1,
    category: "Automotive Engineering",
    emoji: "🚗",
    title: "The Mercedes-Benz Emblem & Legacy",
    fact: "The Mercedes-Benz three-pointed star logo represents land, sea, and air dominance in mobility and engine engineering.",
    detail: "Gottlieb Daimler drew the star on a postcard to his wife in 1872, promising it would one day shine over his factory as a symbol of triumph in mechanical propulsion across land, sea, and sky."
  },
  {
    id: 2,
    category: "Automotive Engineering",
    emoji: "🏁",
    title: "1954 Mercedes-Benz Fuel Injection",
    fact: "The 1954 Mercedes-Benz 300 SL Gullwing was the world's first production car equipped with direct mechanical fuel injection.",
    detail: "Derived from DB 601 V12 aero engines used in WWII aircraft, this technology boosted output from 115 hp to 215 hp, making it the fastest production car of its era at 161 mph."
  },
  {
    id: 3,
    category: "Automotive & Thermal",
    emoji: "🏎️",
    title: "Bugatti W16 Heat Management",
    fact: "At maximum velocity, Bugatti Chiron's quad-turbo W16 engine generates enough heat energy to heat 100 residential homes in winter.",
    detail: "To prevent thermal breakdown, its cooling architecture uses 10 individual radiators, circulating over 800 liters of coolant per minute through titanium and carbon fiber ducts."
  },
  {
    id: 4,
    category: "Thermodynamics",
    emoji: "🔥",
    title: "The Second Law & Entropy",
    fact: "The Second Law of Thermodynamics dictates that entropy in an isolated system always increases, defining the arrow of time.",
    detail: "Every mechanical process involves irreversible friction, viscous dissipation, or heat leakage, making 100% efficient perpetual motion machines physically impossible."
  },
  {
    id: 5,
    category: "Thermodynamics",
    emoji: "❄️",
    title: "Absolute Zero & Cryogenics",
    fact: "At Absolute Zero (-273.15°C / 0 Kelvin), atomic kinetic motion theoretically ceases and quantum mechanical properties dominate.",
    detail: "Near 0 K, helium becomes a superfluid with zero viscosity, creeping up glass walls against gravity and leaking through atomic-scale pores."
  },
  {
    id: 6,
    category: "Fluid Mechanics",
    emoji: "🌊",
    title: "The $1,000,000 Navier-Stokes Challenge",
    fact: "The Navier-Stokes equations describe fluid dynamics from blood flow to jet turbulence, but carry an unsolved $1M Millennium Prize.",
    detail: "Mathematicians and mechanical engineers have yet to mathematically prove that smooth, non-singular solutions always exist in 3D space for all physical boundary conditions."
  },
  {
    id: 7,
    category: "Fluid Dynamics",
    emoji: "💥",
    title: "Propeller Cavitation Violence",
    fact: "Cavitation implosions near high-speed propellers reach temperatures over 4,000 Kelvin—as hot as the surface of the Sun!",
    detail: "When fluid pressure drops below vapor pressure, micro-bubbles form and violently collapse, shooting micro-jets of water at 1,000 m/s that pit and erode solid forged steel."
  },
  {
    id: 8,
    category: "Materials & Metallurgy",
    emoji: "🛡️",
    title: "Titanium Strength-to-Weight Ratio",
    fact: "Titanium possesses the highest strength-to-density ratio of any metallic element in the periodic table.",
    detail: "A single 1-inch diameter solid titanium bar can support the weight of eight full-sized passenger cars while weighing 45% less than structural steel."
  },
  {
    id: 9,
    category: "Smart Materials",
    emoji: "🌀",
    title: "Nitinol Shape-Memory Alloy",
    fact: "Nitinol (Nickel-Titanium alloy) can be bent like plastic wire and snaps back to its pre-molded shape when dipped in hot water.",
    detail: "Used in arterial stents and space deployable antennas, Nitinol undergoes a reversible solid-state phase transformation between Martensite and Austenitic crystal structures."
  },
  {
    id: 10,
    category: "Manufacturing",
    emoji: "⚙️",
    title: "Henry Ford's Assembly Line Revolution",
    fact: "In 1913, Henry Ford's moving assembly line reduced Model T chassis production time from 12 hours down to 93 minutes.",
    detail: "By standardizing interchangeable parts and conveyor speeds, manufacturing costs dropped, making automobiles affordable for the general public."
  },
  {
    id: 11,
    category: "CAD / CAM & Machining",
    emoji: "💻",
    title: "Sub-Micron 5-Axis CNC Precision",
    fact: "Modern 5-axis CNC milling centers carve jet turbine impellers out of solid aerospace blocks with sub-micron tolerances.",
    detail: "Tolerances under 0.001 mm ensure perfectly balanced rotation at 50,000 RPM without destructive harmonic vibrations."
  },
  {
    id: 12,
    category: "Aerospace & Heat Transfer",
    emoji: "✈️",
    title: "Jet Engine Turbine Cooling",
    fact: "High-pressure turbine blades in jet engines operate in gas streams hotter than the melting temperature of the metal blade itself!",
    detail: "Engineers carve microscopic air channels inside single-crystal nickel superalloy blades, creating a boundary layer film of cool air to prevent thermal destruction at 1,600°C."
  },
  {
    id: 13,
    category: "Aerospace Dynamics",
    emoji: "🚀",
    title: "SR-71 Blackbird Thermal Expansion",
    fact: "At Mach 3.2, air friction heated the SR-71 Blackbird's titanium skin to 300°C, expanding its airframe length by several inches in flight.",
    detail: "Because gaps were engineered into the fuselage to allow thermal expansion, fuel leaked freely on the runway until aerodynamic heating sealed the airframe airborne!"
  },
  {
    id: 14,
    category: "Power Plants",
    emoji: "🏭",
    title: "The World's Largest Diesel Engine",
    fact: "The Wärtsilä-Sulzer 14RTA96-C engine stands 44 ft tall, weighs 2,300 tons, and produces over 109,000 brake horsepower.",
    detail: "Powering giant container ships, each cylinder consumes 6.5 ounces of heavy fuel oil per stroke, producing 5.7 million N-m of torque at 102 RPM."
  },
  {
    id: 15,
    category: "Thermodynamics & Power",
    emoji: "⚡",
    title: "Combined Cycle Power Plants (63%+ Efficiency)",
    fact: "Combined Cycle Gas Turbine (CCGT) power plants achieve thermal efficiencies exceeding 63% by harvesting waste heat.",
    detail: "Exhaust gases from a Brayton cycle gas turbine (~600°C) are directed into a Heat Recovery Steam Generator (HRSG) to drive a Rankine cycle steam turbine."
  },
  {
    id: 16,
    category: "Automotive Transmission",
    emoji: "⚙️",
    title: "Dual-Clutch Transmission (8ms Shifts)",
    fact: "Dual-Clutch Transmissions (DCT) execute gear shifts in less than 8 milliseconds—40 times faster than a human blink.",
    detail: "One clutch manages odd gears (1, 3, 5, 7) while the second pre-selects even gears (2, 4, 6), delivering continuous torque without acceleration drop."
  },
  {
    id: 17,
    category: "Green Mobility",
    emoji: "🔋",
    title: "Regenerative Kinetic Energy Recovery",
    fact: "Regenerative braking in EVs recovers up to 70% of kinetic energy normally lost as brake heat during stop-and-go driving.",
    detail: "Reversing the electric motor turns it into a generator, applying electromagnetic drag to slow the vehicle while recharging the high-voltage lithium battery pack."
  },
  {
    id: 18,
    category: "Finite Element Analysis",
    emoji: "📐",
    title: "FEA Mesh & Structural Mechanics",
    fact: "FEA software breaks complex mechanical assemblies into millions of microscopic geometric shapes (elements) to solve stress tensors.",
    detail: "By calculating von Mises stress across nodal points, engineers pinpoint fatigue hotspots and structural weaknesses long before cutting physical metal."
  },
  {
    id: 19,
    category: "Historical Mechanical Tech",
    emoji: "🏛️",
    title: "The Antikythera Mechanism (100 BCE)",
    fact: "Discovered in a Greek shipwreck, the Antikythera Mechanism is a 2,100-year-old analog computer with 30 precision bronze gears.",
    detail: "Ancient Greek engineers used differential gearing to predict planetary orbits, solar eclipses, and Olympic Games schedules with astonishing mechanical accuracy."
  },
  {
    id: 20,
    category: "Industrial Revolution",
    emoji: "🚂",
    title: "James Watt's Condenser Breakthrough",
    fact: "In 1776, James Watt introduced a separate condenser to the steam engine, boosting efficiency by over 500%.",
    detail: "By avoiding repeated heating and cooling of the main cylinder, Watt saved vast quantities of coal and powered the factories of the First Industrial Revolution."
  },
  {
    id: 21,
    category: "Nanomaterials",
    emoji: "🔬",
    title: "Graphene: 200x Stronger Than Steel",
    fact: "Graphene is a single atom-thin sheet of carbon atoms arranged in a 2D honeycomb lattice that is 200 times stronger than structural steel.",
    detail: "It would take an elephant balanced on a pencil tip to pierce a sheet of graphene as thin as cling wrap!"
  },
  {
    id: 22,
    category: "Mechatronics & Control",
    emoji: "🤖",
    title: "PID Loops Power 95% of Automation",
    fact: "Proportional-Integral-Derivative (PID) feedback algorithms regulate over 95% of industrial control loops worldwide.",
    detail: "From cruise control and drone stabilization to refinery temperature control, PID continually calculates error values and applies corrective actuator force."
  },
  {
    id: 23,
    category: "HVAC & Thermodynamics",
    emoji: "🏠",
    title: "Heat Pump Efficiency Magic (COP = 4.0)",
    fact: "Modern heat pumps boast Coefficients of Performance (COP) up to 4.0, delivering 400% efficiency relative to electrical input.",
    detail: "Rather than converting electricity to heat via resistance, heat pumps use vapor-compression refrigerant cycles to pump heat energy from outdoor cold air indoors!"
  },
  {
    id: 24,
    category: "Vibrations & Structural Mechanics",
    emoji: "🌉",
    title: "Resonance & Tacoma Narrows Catastrophe",
    fact: "In 1940, a mild 42 mph wind destroyed the Tacoma Narrows Bridge due to aeroelastic flutter matching its natural resonant frequency.",
    detail: "The phenomenon forced structural engineers worldwide to incorporate wind tunnel modal testing and mechanical dampers into bridge and skyscraper design."
  },
  {
    id: 25,
    category: "Biomechanics",
    emoji: "🦴",
    title: "Human Bone Compressive Strength",
    fact: "Human cortical bone has a compressive strength of approximately 170 MPa—stronger than reinforced structural concrete!",
    detail: "Bone is a natural nanocomposite of collagen protein fibers (ductility) and hydroxyapatite mineral crystals (hardness), constantly remolding under mechanical stress (Wolff's Law)."
  },
  {
    id: 26,
    category: "Formula 1 Engineering",
    emoji: "🏎️",
    title: "Formula 1 Engine Acceleration & 10,000 Gs",
    fact: "Pistons inside a 15,000 RPM Formula 1 engine experience acceleration forces exceeding 10,000 G's on every stroke.",
    detail: "Each piston reverses direction 500 times per second, experiencing forces strong enough to snap standard steel connecting rods in milliseconds."
  },
  {
    id: 27,
    category: "Renewables & Wind Turbines",
    emoji: "💨",
    title: "Giant Offshore Wind Turbine Rotors",
    fact: "Modern offshore wind turbines feature rotor diameters over 236 meters—longer than two football fields put together!",
    detail: "A single blade sweep of 43,000 m² harvests wind energy capable of powering an average household for 2 full days with just one rotation."
  },
  {
    id: 28,
    category: "Hydraulics & Pressure",
    emoji: "🚜",
    title: "Pascal's Force Amplification Law",
    fact: "Hydraulic systems use incompressible fluid pressure to multiply mechanical force by over 100 times effortlessly.",
    detail: "According to Pascal's Law (P = F/A), applying a modest 10 N force on a 1 cm² piston creates a massive 1,000 N lifting force on a 100 cm² slave cylinder."
  },
  {
    id: 29,
    category: "Tribology & Friction",
    emoji: "🛢️",
    title: "Microscopic Hydrodynamic Lubrication Film",
    fact: "In heavy turbine journal bearings, metal surfaces are separated by an oil film just 5 micrometers thick—thinner than a red blood cell!",
    detail: "Viscous fluid drag wedges oil under high-speed shafts, building hydraulic pressure that floats multi-ton rotors with zero metal-to-metal wear."
  },
  {
    id: 30,
    category: "Automotive Safety",
    emoji: "🛡️",
    title: "Mercedes-Benz Safety Crumple Zone Invention",
    fact: "In 1951, Mercedes-Benz engineer Béla Barényi patented the rigid passenger safety cell and impact crumple zone.",
    detail: "By designing front and rear car sections to deform progressively during collisions, impact kinetic energy is absorbed before reaching the occupants."
  },
  {
    id: 31,
    category: "Space Mechanics",
    emoji: "🛰️",
    title: "Saturn V Rocket F-1 Engine Power",
    fact: "The five F-1 engines of the Apollo Saturn V rocket burned 15 tons of propellant per second, generating 7.5 million lbs of thrust.",
    detail: "Their turbopumps ran at 2,500 RPM, producing 55,000 horsepower each—enough power to drain an Olympic swimming pool in 27 seconds."
  },
  {
    id: 32,
    category: "Additive Manufacturing",
    emoji: "🖨️",
    title: "Laser Metal 3D Printed Rocket Engine Parts",
    fact: "Direct Metal Laser Sintering (DMLS) uses high-energy fiber lasers to fuse alloy powder into hollow, lightweight rocket components.",
    detail: "3D printing eliminates hundreds of brazed joint assemblies into a single monolithic part with internal cooling channels impossible to machine conventionally."
  }
];
