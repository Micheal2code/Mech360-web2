export interface FunFact {
  id: number;
  category: string;
  emoji: string;
  title: string;
  fact: string;
  detail: string;
  imageUrl?: string;
}

export const ENGINEERING_FUN_FACTS: FunFact[] = [
  {
    id: 1,
    category: "Automotive Engineering",
    emoji: "🚗",
    title: "The Mercedes-Benz Emblem & Legacy",
    fact: "The Mercedes-Benz three-pointed star logo represents land, sea, and air dominance in mobility and engine engineering.",
    detail: "Gottlieb Daimler drew the star on a postcard to his wife in 1872, promising it would one day shine over his factory as a symbol of triumph in mechanical propulsion across land, sea, and sky.",
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    category: "Automotive Engineering",
    emoji: "🏁",
    title: "1954 Mercedes-Benz Fuel Injection",
    fact: "The 1954 Mercedes-Benz 300 SL Gullwing was the world's first production car equipped with direct mechanical fuel injection.",
    detail: "Derived from DB 601 V12 aero engines used in WWII aircraft, this technology boosted output from 115 hp to 215 hp, making it the fastest production car of its era at 161 mph.",
    imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    category: "Automotive & Thermal",
    emoji: "🏎️",
    title: "Bugatti W16 Heat Management",
    fact: "At maximum velocity, Bugatti Chiron's quad-turbo W16 engine generates enough heat energy to heat 100 residential homes in winter.",
    detail: "To prevent thermal breakdown, its cooling architecture uses 10 individual radiators, circulating over 800 liters of coolant per minute through titanium and carbon fiber ducts.",
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 4,
    category: "Thermodynamics",
    emoji: "🔥",
    title: "The Second Law & Entropy",
    fact: "The Second Law of Thermodynamics dictates that entropy in an isolated system always increases, defining the arrow of time.",
    detail: "Every mechanical process involves irreversible friction, viscous dissipation, or heat leakage, making 100% efficient perpetual motion machines physically impossible.",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
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
    detail: "Mathematicians and mechanical engineers have yet to mathematically prove that smooth, non-singular solutions always exist in 3D space for all physical boundary conditions.",
    imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
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
    detail: "A single 1-inch diameter solid titanium bar can support the weight of eight full-sized passenger cars while weighing 45% less than structural steel.",
    imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80"
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
    detail: "By standardizing interchangeable parts and conveyor speeds, manufacturing costs dropped, making automobiles affordable for the general public.",
    imageUrl: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 11,
    category: "CAD / CAM & Machining",
    emoji: "💻",
    title: "Sub-Micron 5-Axis CNC Precision",
    fact: "Modern 5-axis CNC milling centers carve jet turbine impellers out of solid aerospace blocks with sub-micron tolerances.",
    detail: "Tolerances under 0.001 mm ensure perfectly balanced rotation at 50,000 RPM without destructive harmonic vibrations.",
    imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 12,
    category: "Aerospace & Heat Transfer",
    emoji: "✈️",
    title: "Jet Engine Turbine Cooling",
    fact: "High-pressure turbine blades in jet engines operate in gas streams hotter than the melting temperature of the metal blade itself!",
    detail: "Engineers carve microscopic air channels inside single-crystal nickel superalloy blades, creating a boundary layer film of cool air to prevent thermal destruction at 1,600°C.",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80"
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
    detail: "From cruise control and drone stabilization to refinery temperature control, PID continually calculates error values and applies corrective actuator force.",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80"
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
    detail: "The phenomenon forced structural engineers worldwide to incorporate wind tunnel modal testing and mechanical dampers into bridge and skyscraper design.",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
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
    detail: "A single blade sweep of 43,000 m² harvests wind energy capable of powering an average household for 2 full days with just one rotation.",
    imageUrl: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=800&q=80"
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
  },
  {
    id: 33,
    category: "Thermodynamics",
    emoji: "🌡️",
    title: "The Rankine Cycle in Thermal Power",
    fact: "Over 80% of world electricity generated from coal, nuclear, and solar thermal sources uses the Rankine steam power cycle.",
    detail: "Liquid water is pumped to high pressure, superheated into steam, expanded through a multistage turbine, and condensed back into liquid."
  },
  {
    id: 34,
    category: "Fluid Dynamics",
    emoji: "✈️",
    title: "Bernoulli's Principle & Wing Circulation",
    fact: "Aerodynamic lift is generated through pressure differentials described by Bernoulli's equation alongside Kutta-Joukowski circulation.",
    detail: "Faster airspeed over the curved upper camber of an airfoil creates a low-pressure zone that literally sucks the aircraft upward into flight."
  },
  {
    id: 35,
    category: "Automotive Engineering",
    emoji: "🏎️",
    title: "Formula 1 Downforce & Ceiling Driving",
    fact: "At 150 mph, a modern Formula 1 car generates more aerodynamic downforce than its total weight, enabling it to theoretically drive upside down on a tunnel ceiling!",
    detail: "Inverted airfoils, ground-effect tunnels, and active diffuser floors generate over 3.5 Gs of lateral cornering grip."
  },
  {
    id: 36,
    category: "Materials & Fatigue",
    emoji: "🔨",
    title: "The Endurance Limit in Steel",
    fact: "Ferrous metals like steel have a fatigue endurance limit: if stress remains below this threshold, the material can withstand infinite stress cycles without failing!",
    detail: "Non-ferrous alloys like aluminum lack a true endurance limit and eventually fail from cyclic fatigue regardless of how small the load is."
  },
  {
    id: 37,
    category: "Vibrations & Modal Analysis",
    emoji: "🔔",
    title: "Tuned Mass Dampers in Skyscrapers",
    fact: "The Taipei 101 skyscraper houses a 660-metric-ton steel pendulum sphere between its 87th and 92nd floors to counteract typhoon winds and earthquakes.",
    detail: "Acting as a tuned mass damper, the sphere sways out of phase with the building to absorb over 40% of wind-induced lateral vibrations.",
    imageUrl: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 38,
    category: "Manufacturing",
    emoji: "🔩",
    title: "Thread Rolling vs Thread Cutting",
    fact: "Rolled screw threads are up to 20% stronger than cut threads because cold-forming compresses grain structure without severing steel fibers.",
    detail: "Displacing metal plastically under high-pressure hardened steel dies eliminates stress concentration notches inherent to thread turning."
  },
  {
    id: 39,
    category: "Thermodynamics",
    emoji: "🧊",
    title: "Regenerative Cryocoolers & Liquid Helium",
    fact: "Stirling and Gifford-McMahon cryocoolers can reach temperatures below 4 Kelvin (-269°C) without chemical refrigerants.",
    detail: "Compressing and expanding helium gas rhythmically through a porous matrix regenerator achieves deep cryogenic cooling for MRI superconducting magnets."
  },
  {
    id: 40,
    category: "Acoustics & Sound",
    emoji: "🔊",
    title: "Anachoic Chamber Acoustic Silence",
    fact: "The quietest place on Earth is Microsoft's anechoic chamber in Redmond, measured at -20.6 decibels—below human hearing threshold!",
    detail: "Surrounded by fiber-wedge walls and spring suspension, background noise is so low you can hear your own heartbeat, bone grinding, and blood flowing through ears."
  },
  {
    id: 41,
    category: "Nanotechnology",
    emoji: "🔬",
    title: "Carbon Nanotubes Tensile Strength",
    fact: "Single-walled carbon nanotubes feature tensile strengths exceeding 60 Gigapascals—100 times stronger than high-strength steel wire.",
    detail: "Their extraordinary sp2 covalent carbon bonds make them prime candidates for future space elevators and ultra-light structural composites."
  },
  {
    id: 42,
    category: "Fluid Mechanics",
    emoji: "🌊",
    title: "Superhydrophobic Lotus Effect",
    fact: "Superhydrophobic surfaces utilize micro- and nano-textured pillar structures that trap air bubbles, preventing water droplets from clinging.",
    detail: "Droplets maintain spherical contact angles above 150°, rolling off effortlessly and picking up dirt particles in a self-cleaning mechanical process."
  },
  {
    id: 43,
    category: "Automotive Suspension",
    emoji: "🚘",
    title: "Bose Electromagnetic Suspension",
    fact: "In 1980, Bose developed an active electromagnetic suspension using linear motors that could leap over speed bumps without disturbing the cabin!",
    detail: "Responding in milliseconds, linear motors exerted lifting or pulling force on each wheel independently, neutralizing body roll and pitch completely."
  },
  {
    id: 44,
    category: "Power Generation",
    emoji: "⚛️",
    title: "Nuclear Reactor Steam Generators",
    fact: "Nuclear power plants produce zero carbon emissions during generation because nuclear fission simply heats pressurized water into steam to turn turbines.",
    detail: "Pressurized Water Reactors (PWR) maintain primary coolant at 155 bar to prevent boiling, transferring heat through U-tubes to steam generators.",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 45,
    category: "Robotics & Actuators",
    emoji: "🦾",
    title: "Harmonic Drive Strain Wave Gearing",
    fact: "Harmonic drives provide zero backlash and massive gear reduction ratios up to 320:1 in a lightweight, compact coaxial package.",
    detail: "Using an elliptical wave generator inside a flexspline, elastic deformation rotates teeth smoothly for Mars rovers and surgical robotic joints."
  },
  {
    id: 46,
    category: "Tribology",
    emoji: "⚙️",
    title: "Diamond-Like Carbon (DLC) Coatings",
    fact: "Applying a DLC coating just 2 micrometers thick on engine valve lifters reduces internal friction by 40% and rivals diamond hardness.",
    detail: "Amorphous carbon layers containing mixture sp3 and sp2 bonds prevent metal galling and micro-welding in high-load engine valvetrains."
  },
  {
    id: 47,
    category: "Thermodynamics",
    emoji: "🔥",
    title: "The Carnot Efficiency Limit Formula",
    fact: "Maximum thermal efficiency of any heat engine is governed by η = 1 - (Tc / Th), where temperatures must be measured in Kelvin.",
    detail: "No matter how advanced materials become, an engine operating between 300 K exhaust and 600 K combustion can never exceed 50% efficiency."
  },
  {
    id: 48,
    category: "Aerospace",
    emoji: "🛩️",
    title: "Supercritical Airfoils & Transonic Drag",
    fact: "Supercritical airfoils feature flattened upper cams and undercut trailing edges, suppressing shockwave formation near Mach 1.",
    detail: "By delaying wave drag onset at transonic cruise speeds, commercial jetliners save millions of gallons of jet fuel annually."
  },
  {
    id: 49,
    category: "Historical Milestones",
    emoji: "⚙️",
    title: "Hero of Alexandria's Aeolipile (1st Century AD)",
    fact: "The aeolipile was the world's first recorded steam turbine, constructed by Hero of Alexandria in Roman Egypt nearly 2,000 years ago.",
    detail: "Steam escaping from two angled nozzles on a hollow sphere created rotational torque through Newton's Third Law of Motion."
  },
  {
    id: 50,
    category: "Automotive Propulsion",
    emoji: "⚡",
    title: "Rimac Nevera 1,914 Horsepower Quad-Motor",
    fact: "The electric Rimac Nevera uses four independent permanent magnet motors producing 1,914 hp and 2,360 Nm of instantaneous torque.",
    detail: "All-wheel torque vectoring adjusts power to each wheel 100 times per second, accelerating from 0 to 60 mph in a blistering 1.74 seconds.",
    imageUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 51,
    category: "Materials Science",
    emoji: "💎",
    title: "Single-Crystal Superalloy Turbine Blades",
    fact: "Modern jet turbine blades are cast as a single continuous crystal with zero grain boundaries to prevent creep failure at high heat.",
    detail: "Eliminating microscopic grain boundaries prevents atoms from sliding past each other under 10,000 RPM centrifugal forces at 1,200°C."
  },
  {
    id: 52,
    category: "Fluid Mechanics",
    emoji: "🌀",
    title: "Von Kármán Vortex Street",
    fact: "Unsteady flow separating past bluff bodies creates repeating swirling vortices known as a von Kármán vortex street.",
    detail: "This shedding frequency causes car radio antennas to whistle in the wind and powerlines to hum in strong gales."
  },
  {
    id: 53,
    category: "Internal Combustion",
    emoji: "🚗",
    title: "Atkinson Cycle vs Otto Cycle",
    fact: "The Atkinson cycle holds intake valves open longer during compression, achieving higher expansion ratios than compression ratios.",
    detail: "Extracting more mechanical energy from expanding hot combustion gases boosts thermal efficiency in Toyota Prius hybrid engines."
  },
  {
    id: 54,
    category: "Mechatronics",
    emoji: "📱",
    title: "MEMS Gyroscopes & Accelerometers",
    fact: "Micro-Electro-Mechanical Systems (MEMS) inside smartphones use microscopic vibrating silicon combs to detect orientation and tilt.",
    detail: "Etched into silicon chips using photolithography, Coriolis forces deflect microscopic proof masses to calculate motion in real time.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 55,
    category: "Heat Transfer",
    emoji: "♨️",
    title: "Vapor Chamber Heat Pipes",
    fact: "Heat pipes conduct heat over 100 times faster than solid copper bars of equal thickness by phase-change fluid circulation.",
    detail: "Water inside a vacuumed copper tube evaporates at the hot heat source, travels to the cool end, condenses, and returns via capillary wick action."
  },
  {
    id: 56,
    category: "Automotive Brake Tech",
    emoji: "🛑",
    title: "Carbon-Ceramic Matrix Brakes",
    fact: "Carbon-ceramic brake rotors can withstand temperatures above 1,000°C without brake fade and last over 100,000 miles.",
    detail: "Silicon carbide reinforced with carbon fibers reduces unsprung rotating mass by 50% compared to cast iron brake discs."
  },
  {
    id: 57,
    category: "Structural Mechanics",
    emoji: "🏗️",
    title: "Euler-Bernoulli Column Buckling",
    fact: "Long slender columns under axial compression fail suddenly due to structural instability (buckling) long before reaching material yield strength.",
    detail: "Critical buckling load depends inversely on column length squared (Pcr = π²EI / L²), making length the most sensitive design parameter."
  },
  {
    id: 58,
    category: "Energy Storage",
    emoji: "🔋",
    title: "Flywheel Energy Storage Systems (FESS)",
    fact: "Advanced carbon-fiber flywheels rotating at 60,000 RPM in a vacuum chamber store kinetic energy with over 90% roundtrip efficiency.",
    detail: "Levitated by frictionless magnetic bearings, flywheels provide rapid frequency response grid stabilization in milliseconds."
  },
  {
    id: 59,
    category: "Manufacturing",
    emoji: "💧",
    title: "Abrasive Waterjet Cutting Power",
    fact: "Abrasive waterjets force water mixed with garnet sand through diamond nozzles at 60,000 PSI (4,000 bar) at Mach 3 speeds.",
    detail: "Cutting 10-inch thick titanium without heat-affected zones (HAZ), waterjets preserve structural metallurgy perfectly."
  },
  {
    id: 60,
    category: "Aerospace Propulsion",
    emoji: "🚀",
    title: "Scramjet Air-Breathing Hypersonic Flight",
    fact: "Supersonic Combustion Ramjets (Scramjets) operate at flight speeds above Mach 5 with airflow remaining supersonic throughout the engine.",
    detail: "With no moving rotating compressor shafts, fuel must ignite and burn completely within 1 millisecond as supersonic air rushes through."
  },
  {
    id: 61,
    category: "Thermodynamics",
    emoji: "🌡️",
    title: "Joule-Thomson Expansion Effect",
    fact: "Throttling a real gas through a porous valve or orifice causes temperature drops without performing external shaft work.",
    detail: "Invaluable for gas liquefaction (Linde cycle), Joule-Thomson cooling converts natural gas into LNG for global cryogenic shipping."
  },
  {
    id: 62,
    category: "Automotive Engines",
    emoji: "🏎️",
    title: "Desmodromic Valve Actuation in Ducati",
    fact: "Ducati motorcycle engines use Desmodromic valvetrains with positive mechanical cams to open AND close valves without valve springs.",
    detail: "Eliminating floating valve springs prevents destructive valve float and spring resonance at extreme 16,000 RPM engine speeds."
  },
  {
    id: 63,
    category: "Fluid Dynamics",
    emoji: "⛵",
    title: "Magnus Effect & Flettner Rotor Ships",
    fact: "Spinning cylinders exposed to wind crossflows create perpendicular lift forces through fluid velocity asymmetries.",
    detail: "Modern cargo ships install tall rotating Flettner rotors to harness wind thrust, lowering bunker fuel consumption by 15%."
  },
  {
    id: 64,
    category: "Materials Engineering",
    emoji: "🔬",
    title: "Bulk Metallic Glasses (Amorphous Metals)",
    fact: "Cooling molten metal alloys at over 1,000,000°C per second freezes atoms into a chaotic liquid-like structure without crystalline planes.",
    detail: "Amorphous metals exhibit double the yield strength of titanium alongside high elasticity, returning double the bounce of steel balls."
  },
  {
    id: 65,
    category: "Robotics & Automation",
    emoji: "🤖",
    title: "Delta Parallel Robots for Pick-and-Place",
    fact: "Delta robots feature three parallelogram arms mounted to a overhead base, executing over 200 pick-and-place items per minute.",
    detail: "By placing heavy servo motors on stationary frames rather than moving joints, low arm inertia permits 30 G accelerations."
  },
  {
    id: 66,
    category: "Power Generation",
    emoji: "🌊",
    title: "Pelton Wheel Impulse Hydro Turbines",
    fact: "Pelton water turbines capture power from high-head mountain streams (over 1,000 meters drop) using double-bucket splitters.",
    detail: "High-speed water jets strike bucket centers, reversing fluid flow 180° to transfer nearly 92% of kinetic energy into shaft torque."
  },
  {
    id: 67,
    category: "Machining & Tooling",
    emoji: "🔪",
    title: "Polycrystalline Diamond (PCD) Tool Inserts",
    fact: "PCD cutting tools consist of synthetic diamond particles sintered under 60,000 bar pressure onto tungsten carbide bases.",
    detail: "Machining abrasive carbon composites and silicon-aluminum alloys, PCD inserts outlast standard carbide cutters by 50 times."
  },
  {
    id: 68,
    category: "Thermodynamics",
    emoji: "🔥",
    title: "Combined Heat and Power (Cogeneration)",
    fact: "Cogeneration systems capture industrial engine waste exhaust heat to produce space heating or absorption chilling, reaching 85%+ total energy utilization.",
    detail: "By burning fuel once for two energy outputs, factories cut energy bills and greenhouse gas emissions simultaneously."
  },
  {
    id: 69,
    category: "Automotive Design",
    emoji: "🚗",
    title: "Koenigsegg Freevalve Camless Engine",
    fact: "Freevalve technology replaces traditional camshafts with pneumatically and hydraulically actuated solenoids on each valve.",
    detail: "Independent computer timing for every valve boosts horsepower by 30%, increases torque, and reduces fuel consumption without throttle bodies."
  },
  {
    id: 70,
    category: "Fluid Mechanics",
    emoji: "🌊",
    title: "Laminar Flow vs Turbulent Flow & Reynolds Number",
    fact: "Flow transition from smooth parallel layers (laminar) to chaotic swirling eddies (turbulent) is predicted by the dimensionless Reynolds Number (Re = ρVD / μ).",
    detail: "Pipe flows below Re = 2,300 remain strictly laminar, while flows above Re = 4,000 turn fully turbulent with high frictional pressure drop."
  },
  {
    id: 71,
    category: "Materials Testing",
    emoji: "🔨",
    title: "Charpy & Izod Impact Toughness Test",
    fact: "Swinging a heavy pendulum hammer to fracture notched specimens measures material energy absorption during sudden shock loading.",
    detail: "Charpy testing revealed why WWII Liberty ships snapped in half in cold Arctic seas due to ductile-to-brittle transition temperatures."
  },
  {
    id: 72,
    category: "Aerospace Systems",
    emoji: "✈️",
    title: "Ram Air Turbines (RAT) Emergency Power",
    fact: "If all jet engine generators and auxiliary power units fail in flight, a spring-loaded Ram Air Turbine pops out into airstreams.",
    detail: "Spinning in the 500 mph wind, the RAT generates essential electrical and hydraulic pressure to power flight control surfaces for emergency landings."
  },
  {
    id: 73,
    category: "HVAC Engineering",
    emoji: "❄️",
    title: "Psychrometrics & Dew Point Temperature",
    fact: "Psychrometric charts map moist air properties including dry-bulb, wet-bulb, relative humidity, and dew point for building HVAC design.",
    detail: "When air cools to its dew point, relative humidity reaches 100%, forcing moisture to condense on cold evaporator coils."
  },
  {
    id: 74,
    category: "Automotive Differential",
    emoji: "⚙️",
    title: "Torsen Torque-Sensing Differential",
    fact: "Torsen differentials use crossed-axis helical worm gear sets to automatically distribute torque to wheels with the most traction.",
    detail: "Unlike open differentials that spin slipping wheels uselessly, worm gears lock frictionally to send up to 80% torque to grippy tires."
  },
  {
    id: 75,
    category: "Biomechanics",
    emoji: "🦿",
    title: "Prosthetic Carbon Fiber Running Blades",
    fact: "J-shaped carbon fiber prosthetic blades mimic human Achilles tendon elastic energy storage during athletic running strides.",
    detail: "Storing 90% of kinetic energy upon ground impact, composite spring geometry allows amputee sprinters to reach high speeds."
  },
  {
    id: 76,
    category: "Nuclear Thermal",
    emoji: "⚛️",
    title: "Tokamak Fusion Magnetic Plasma Confinement",
    fact: "Experimental ITER fusion reactors use powerful superconducting toroidal magnets to levitate 150,000,000°C hydrogen plasma.",
    detail: "Ten times hotter than the core of the Sun, superheated plasma is kept away from solid reactor vacuum walls using strong magnetic fields."
  },
  {
    id: 77,
    category: "Control Engineering",
    emoji: "🛰️",
    title: "Control Moment Gyroscopes (CMG) in Space",
    fact: "The International Space Station uses four 200 lb spinning steel wheels (CMGs) to rotate the 450-ton station without thruster fuel.",
    detail: "Gimbaling spinning rotors generates massive gyroscopic torque vectors according to conservation of angular momentum."
  },
  {
    id: 78,
    category: "Manufacturing",
    emoji: "⚡",
    title: "Electrical Discharge Machining (EDM)",
    fact: "Wire EDM uses microscopic electrical sparks jumping at 100,000 Hz between brass wire and metal to vaporize hardened tool steel.",
    detail: "With zero contact pressure, EDM cuts delicate extrusion dies and injection molds with sub-micron accuracy regardless of metal hardness."
  },
  {
    id: 79,
    category: "Thermodynamics",
    emoji: "🔥",
    title: "Exergy Analysis vs Energy Analysis",
    fact: "While Energy is conserved according to the 1st Law, Exergy measures the maximum useful work potential available in a system.",
    detail: "Exergy analysis pinpoints exact thermodynamic destruction locations caused by friction, mixing, and unconstrained heat transfer."
  },
  {
    id: 80,
    category: "Automotive Supercharging",
    emoji: "🐚",
    title: "Twin-Screw vs Centrifugal Superchargers",
    fact: "Lysholm twin-screw superchargers compress air internally between meshing positive-displacement rotors before discharging into manifolds.",
    detail: "Delivering instant boost pressure at idle RPM, twin-screw blowers give muscle cars massive low-end torque curves."
  },
  {
    id: 81,
    category: "Aerodynamics",
    emoji: "🏎️",
    title: "Venturi Ground Effect Tunnels in Racing",
    fact: "Constricting air under a racing car floor speeds up airflow, dropping pressure according to the Venturi effect.",
    detail: "Suction forces pull the chassis tight against pavement, dramatically boosting cornering speeds without wing drag penalties."
  },
  {
    id: 82,
    category: "Materials Science",
    emoji: "💎",
    title: "Superhard Cubic Boron Nitride (cBN)",
    fact: "Cubic Boron Nitride is second only to natural diamond in hardness but resists heat up to 1,400°C without reacting with iron.",
    detail: "Unlike diamond which dissolves into carbon when machining steel, cBN inserts turn hardened automotive crankshafts with ease."
  },
  {
    id: 83,
    category: "Tribology",
    emoji: "🛢️",
    title: "Viscosity Index Improvers in Engine Oil",
    fact: "Multigrade 5W-30 engine oils use long-chain polymer additives that expand when warm to maintain protective viscosity.",
    detail: "Polymers remain coiled at cold startup for low pump friction, uncoiling at 100°C to prevent oil thinning under hot engine loads."
  },
  {
    id: 84,
    category: "Power Plants",
    emoji: "☀️",
    title: "Concentrated Solar Power Molten Salt Storage",
    fact: "Solar thermal power towers focus thousands of heliostat mirrors to melt nitrate salts at 565°C for overnight power generation.",
    detail: "Liquid molten salt holds thermal energy for 15 hours, generating continuous Rankine steam power long after the sun sets."
  },
  {
    id: 85,
    category: "Mechatronics",
    emoji: "🚙",
    title: "Electronic Stability Control (ESC) Interventions",
    fact: "ESC monitors steering angle and yaw sensors 50 times per second, applying individual wheel brakes to prevent spinouts.",
    detail: "If understeer occurs, ESC brakes the inside rear wheel to generate corrective yaw torque and pull the vehicle back on line."
  },
  {
    id: 86,
    category: "Fluid Machinery",
    emoji: "🌀",
    title: "Cavitation-Resistant Impeller Coatings",
    fact: "Elastomeric polyurethane coatings on hydraulic pump impellers absorb shock energy from imploding cavitation bubbles.",
    detail: "Deforming elastically under micro-jets, flexible polymers prevent erosion damage that would destroy rigid stainless steel."
  },
  {
    id: 87,
    category: "Aerospace Design",
    emoji: "🛩️",
    title: "Blended Wing Body (BWB) Aircraft Efficiency",
    fact: "Blended Wing Body aircraft integrate smooth transitions between fuselage and wings, doubling interior volume and lowering drag.",
    detail: "Generating aerodynamic lift across the entire airframe surface cuts fuel consumption by 20% compared to traditional tube-and-wing designs."
  },
  {
    id: 88,
    category: "Additive Manufacturing",
    emoji: "🖨️",
    title: "Electron Beam Melting (EBM) in Vacuum",
    fact: "EBM uses high-power electron beams in a deep vacuum to build orthopedic titanium hip implants with bio-porous surfaces.",
    detail: "Porous Trabecular structures allow bone cells to grow directly into titanium implants, creating permanent skeletal bonding."
  },
  {
    id: 89,
    category: "Structural Mechanics",
    emoji: "📐",
    title: "Mohr's Circle Stress Transformation",
    fact: "Mohr's Circle is a graphical representation used by engineers to quickly calculate principal stresses and maximum shear stress.",
    detail: "Plotting normal stress versus shear stress reveals maximum shear angles responsible for ductile failure at 45° planes."
  },
  {
    id: 90,
    category: "Automotive Dynamics",
    emoji: "🏎️",
    title: "Ackermann Steering Geometry",
    fact: "Ackermann steering linkage pivots inner wheels at steeper angles than outer wheels during turns.",
    detail: "Because inner wheels follow smaller radius arcs, equalizing turning centers prevents tire scrubbing and lateral slip."
  },
  {
    id: 91,
    category: "Heat Exchangers",
    emoji: "♨️",
    title: "Counterflow Heat Exchanger Superiority",
    fact: "Countercurrent heat exchangers maintain a uniform temperature difference along the entire length compared to parallel flow.",
    detail: "Fluids flowing in opposite directions allow cold fluid outlet temperatures to exceed warm fluid outlet temperatures!"
  },
  {
    id: 92,
    category: "Vibrations",
    emoji: "📳",
    title: "Piezoelectric Vibration Energy Harvesting",
    fact: "Piezoelectric ceramics generate electric voltage when subjected to cyclic mechanical stress or vibration.",
    detail: "Mounted on bridge girders and engine mounts, piezo harvesters power wireless IoT structural monitoring sensors indefinitely."
  },
  {
    id: 93,
    category: "Historical Milestones",
    emoji: "🚂",
    title: "George Stephenson's Rocket (1829)",
    fact: "Stephenson's Rocket introduced the multi-tubular boiler and steam blastpipe, reaching a record speed of 29 mph.",
    detail: "Passing hot exhaust gases through 25 copper firetubes drastically increased heat transfer surface area for modern steam locomotives."
  },
  {
    id: 94,
    category: "Robotics",
    emoji: "🤖",
    title: "SCARA Robots for High-Speed Assembly",
    fact: "Selective Compliance Assembly Robot Arms (SCARA) feature rigid Z-axis motion alongside flexible horizontal XY plane movement.",
    detail: "Targeted compliance allows SCARA arms to press-fit electronic components and pins into circuit boards without jamming."
  },
  {
    id: 95,
    category: "Thermodynamics",
    emoji: "❄️",
    title: "Thermoelectric Peltier Effect Cooling",
    fact: "Passing direct electric current across semiconductors creates a heat flux that cools one side while heating the other.",
    detail: "With zero moving parts, pumps, or refrigerants, Peltier coolers provide solid-state thermal management for laser diodes."
  },
  {
    id: 96,
    category: "Automotive Powertrain",
    emoji: "🏎️",
    title: "Rotary Wankel Engine Compact Power",
    fact: "Felix Wankel's rotary engine uses a triangular rotor revolving inside an epitrochoid chamber, completing four strokes per rotation.",
    detail: "Delivering double the power-to-weight ratio of piston engines, Mazda's 13B rotary revved smoothly up to 9,000 RPM."
  },
  {
    id: 97,
    category: "Nanotechnology",
    emoji: "🔬",
    title: "Metamaterials & Negative Refractive Index",
    fact: "Engineered mechanical metamaterials possess negative Poisson's ratios (auxetics)—expanding sideways when stretched lengthways!",
    detail: "Sub-wavelength cellular geometry absorbs impact energy and redirects shockwaves around delicate equipment."
  },
  {
    id: 98,
    category: "Power Plants",
    emoji: "⚡",
    title: "Pumped Storage Hydropower (PSH) Batteries",
    fact: "Pumped storage hydro accounts for over 90% of global utility-scale grid energy storage capacity worldwide.",
    detail: "Pumping water to high mountain reservoirs during off-peak hours and releasing it through reversible Francis turbines during peak demand."
  },
  {
    id: 99,
    category: "Fluid Mechanics",
    emoji: "🌊",
    title: "Coandă Effect & Boundary Layer Adhesion",
    fact: "Fluids naturally follow nearby curved surfaces due to ambient pressure drops created by boundary layer entrainment.",
    detail: "The Coandă effect powers high-efficiency aircraft lift blowers, bladeless dyson fans, and specialized fluidic thrust vectoring."
  },
  {
    id: 100,
    category: "Automotive Peak Engineering",
    emoji: "🏆",
    title: "Mercedes-AMG ONE Formula 1 Engine Hypercar",
    fact: "The Mercedes-AMG ONE brings a literal 1.6-liter turbocharged V6 Formula 1 hybrid engine into a road-legal hypercar.",
    detail: "Featuring electric turbocharging (MGU-H), kinetic energy recovery (MGU-K), and 1,063 hp, its thermal efficiency exceeds 50%—the highest of any road production car in history!",
    imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80"
  }
];
