import { useEffect, useLayoutEffect, useRef, useState } from "react"

const FLAWS = [
  "Quick to Anger",
  "Lazy",
  "Pessimistic",
  "Nervous",
  "Coward",
  "Rude",
  "Deceitful",
  "Vain",
  "Greedy",
  "Vengeful",
  "Impatient",
  "Insecure",
  "Blunt",
  "Clumsy",
  "Envious",
]

const SIMPLE_TRAITS = {
  ideology: [
    "Everything has a rational explanation rooted in science.",
    "Individuals can make a difference.",
    "You ascribe to a specific political ideology.",
    "A specific religion guides you.",
    "Morality is black and white.",
    "You believe in fate and it directly impacts your life.",
    "Belief in higher powers such as astrology, spirituality, etc.",
    "Free will is the only truth.",
    "There are deep truths that others are not aware of. The answers are out there.",
    "You believe in the power of community.",
  ],
  physique: [
    "Athletic",
    "Muscles",
    "Curvy",
    "Lanky",
    "Small",
    "Rigid",
    "Stout",
    "Towering",
    "Robust",
    "Ample Body",
  ],
  virtue: [
    "Honest",
    "Honorable",
    "Cautious",
    "Humble",
    "Courageous",
    "Merciful",
    "Disciplined",
    "Serene",
    "Gregarious",
    "Tolerant",
  ],
  face: [
    "Bony",
    "Broken",
    "Chiseled",
    "Elongated",
    "Dimpled",
    "Perfect",
    "Round",
    "Sharp",
    "Memorable",
    "Forgettable",
  ],
  speech: [
    "Blunt",
    "Gravelly",
    "Booming",
    "Precise",
    "Cryptic",
    "Squeaky",
    "Formal",
    "Accented",
    "Droning",
    "Choppy",
  ],
  misfortune: [
    "Abandoned",
    "Defrauded",
    "Addicted",
    "Demoted",
    "Blackmailed",
    "Discredited",
    "Condemned",
    "Disowned",
    "Cursed",
    "Exiled",
  ],
}

const MOSH_TRINKETS = [
  "Manual: PANIC: Harbinger of Catastrophe",
  "Antique Company Scrip (Asteroid Mine)",
  "Manual: SURVIVAL: Eat Soup With a Knife",
  "Dessicated Husk Doll",
  "Pressed Alien Flower (common)",
  "Necklace of Shell Casings",
  "Corroded Android Logic Core",
  "Pamphlet: Signs of Parasitical Infection",
  "Manual: Treat Your Rifle Like A Lady",
  "Bone Knife",
  "Calendar: Alien Pin-Up Art",
  "Rejected Application (Colony Ship)",
  "Holographic Serpentine Dancer",
  "Snake Whiskey",
  "Medical Container, Purple Powder",
  "Pills: Male Enhancement, Shoddy",
  "Casino Playing Cards",
  "Lagomorph Foot",
  "Moonstone Ring",
  "Manual: Mining Safety and You",
  "Pamphlet: Against Human Simulacra",
  "Animal Skull, 3 Eyes, Curled Horns",
  "Bartender's Certification (Expired)",
  "Bunraku Puppet",
  "Prospecting Mug, Dented",
  "Eerie Mask",
  "Ultrablack Marble",
  "Ivory Dice",
  "Tarot Cards, Worn, Pyrite Gilded Edges",
  "Bag of Assorted Teeth",
  "Ashes (A Relative)",
  "DNR Beacon Necklace",
  "Cigarettes (Grinning Skull)",
  "Pills: Areca Nut",
  "Pendant: Shell Fragments Suspended in Plastic",
  "Pamphlet: Zen and the Art of Cargo Arrangement",
  "Pair of Shot Glasses (Spent Shotgun Shells)",
  "Key (Childhood Home)",
  "Dog Tags (Heirloom)",
  "Token: Is Your Morale Improving?",
  "Pamphlet: The Relic of Flesh",
  "Pamphlet: The Indifferent Stars",
  "Calendar: Military Battles",
  "Manual: Rich Captain, Poor Captain",
  "Campaign Poster (Home Planet)",
  "Preserved Insectile Aberration",
  "Titanium Toothpick",
  "Gloves, Leather (Xenomorph Hide)",
  "Smut (Seditious): The Captain, Ordered",
  "Towel, Slightly Frayed",
  "Brass Knuckles",
  "Fuzzy Handcuffs",
  "Journal of Grudges",
  "Stylized Cigarette Case",
  "Ball of Assorted Gauge Wire",
  "Spanner",
  "Switchblade, Ornamental",
  "Powdered Xenomorph Horn",
  "Bonsai Tree, Potted",
  "Golf Club (Putter)",
  "Trilobite Fossil",
  "Pamphlet: A Lover In Every Port",
  "Patched Overalls, Personalized",
  "Fleshy Thing Sealed in a Murky Jar",
  "Spiked Bracelet",
  "Harmonica",
  "Pictorial Pornography, Dog-eared, Well-thumbed",
  "Coffee Cup, Chipped, reads: HAPPINESS IS MANDATORY",
  "Manual: Moonshining With Gun Oil & Fuel",
  "Miniature Chess Set, Bone, Pieces Missing",
  "Gyroscope, Bent, Tin",
  "Faded Green Poker Chip",
  "Ukulele",
  "Spray Paint",
  "Wanted Poster, Weathered",
  "Locket, Hair Braid",
  "Sculpture of a Rat (Gold)",
  "Blanket, Fire Retardant",
  "Hooded Parka, Fleece-Lined",
  "BB Gun",
  "Flint Hatchet",
  "Pendant: Two Astronauts form a Skull",
  "Rubik's Cube",
  "Stress Ball, reads: Zero Stress in Zero G",
  "Sputnik Pin",
  "Ushanka",
  "Trucker Cap, Mesh, Grey Alien Logo",
  "Menthol Balm",
  "Pith Helmet",
  "10m x 10m Tarp",
  "I Ching, Missing Sticks",
  "Kukri",
  "Trench Shovel",
  "Shiv, Sharpened Butter Knife",
  "Taxidermied Cat",
  "Pamphlet: Interpreting Sheep Dreams",
  "Faded Photograph, A Windswept Heath",
  "Opera Glasses",
  "Pamphlet: Android Overlords",
  "Interstellar Compass, Always Points to Homeworld",
]

const MOSH_PATCHES = [
  "HELLO MY NAME IS:",
  "Don't Run You'll Only Die Tired",
  "Too Pretty To Die",
  "I Am Not A Robot",
  "GOOD BOY",
  "IMPROVE / ADAPT / OVERCOME",
  "NASA Logo",
  "FUBAR",
  "BOHICA (Bend Over Here It Comes Again)",
  "otebis (Fuck Off, Russian)",
  "Help Wanted",
  "Red Gear",
  "Do You Sign My Paychecks?",
  "Nuclear Symbol",
  "#1 Worker",
  "Mr. Yuck",
  "DO YOUR JOB",
  "I'm A (Love) Machine",
  "Be Sure: Doubletap",
  "Heart",
  "Chibi Cthulhu",
  "Girl's Best Friend (Diamond)",
  "Soviet Hammer and Sickle",
  "I Like My Tools Clean / And My Lovers Dirty",
  "Smile: Big Brother is Watching",
  "The Louder You Scream the Faster I Come (Nurse Pin-Up)",
  "Inverted Cross",
  "Mama Tried",
  "Smooth Operator",
  "All Out of Fucks To Give (Astronaut with Turned Out Pockets)",
  "Crossed Hammers with Wings",
  "All Seeing Eye",
  "Volunteer",
  "Allergic To Bullshit (Medical Style Patch)",
  "Biohazard Symbol",
  "GAME OVER (Bride and Groom)",
  "Bad Bitch",
  "LONER",
  "Take My Life (Please)",
  "Front Towards Enemy (Claymore Mine)",
  "Security Guard",
  "Actually, I AM A Rocket Scientist",
  "Atom Symbol",
  "Troubleshooter",
  "SUCK IT UP",
  "Space IS My Home (Sad Astronaut)",
  "Solve Et Coagula (Baphomet)",
  "HMFIC (Head Mother Fucker In Charge)",
  "Do I LOOK Like An Expert?",
  "Red Shirt Logo",
  "Pin-Up Model (Succubus)",
  "DRINK / FIGHT / FUCK",
  "I Am My Brother's Keeper",
  "Mudflap Girl",
  "Dice (Snake Eyes)",
  "Viking Skull",
  "For Science!",
  "DILLIGAF?",
  "Pin-Up Model (Ace of Spades)",
  "Upstanding Citizen",
  "Keep Well Lubricated",
  "Pin-Up Model (Riding Missile)",
  "Fuck Forever (Roses)",
  "Take Me To Your Leader (UFO)",
  "Fun Meter (reads: Bad Time)",
  "Medic Patch (Skull and Crossbones over Cross)",
  "Plays Well With Others",
  "Dove in Crosshairs",
  "Skull and Crossed Wrenches",
  "NOMAD",
  "Double Cherry",
  "Powered By Coffee",
  "APEX PREDATOR (Sabertooth Skull)",
  "Live Free and Die",
  "Meat Bag",
  "Jolly Roger",
  "Flame",
  "Fix Me First (Caduceus)",
  "Pin-Up Model (Mechanic)",
  "Poker Hand: Dead Man's Hand (Aces Full Of Eights)",
  "My Other Ride Married You",
  "Eat The Rich",
  "I'm Not A Rocket Scientist / But You're An Idiot",
  "Princess",
  "Travel To Distant Places / Meet Unusual Things / Get Eaten",
  "Risk of Electrocution Symbol",
  "Good (Brain)",
  "Work Hard / Party Harder",
  "Cowboy Up (Crossed Revolvers)",
  "Smiley Face (Glow in the Dark)",
  "I Heart Myself",
  "Grim Reaper",
  "I Can't Fix Stupid",
  "Queen of Hearts",
  "Welcome to the DANGER ZONE",
  "Black Widow Spider",
  "One Size Fits All (Grenade)",
  "Blood Type (Reference Patch)",
  "IF I'M RUNNING KEEP UP",
  "Icarus",
]

function pick(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function rollCredits() {
  const die1 = Math.floor(Math.random() * 10) + 1
  const die2 = Math.floor(Math.random() * 10) + 1
  return (die1 + die2) * 10
}

const FIELD_DEFS = [
  { key: "flaw", label: "Flaw", roll: () => pick(FLAWS) },
  { key: "patch", label: "Patch", roll: () => pick(MOSH_PATCHES) },
  { key: "trinket", label: "Trinket", roll: () => pick(MOSH_TRINKETS) },
  { key: "ideology", label: "Ideology", roll: () => pick(SIMPLE_TRAITS.ideology) },
  { key: "physique", label: "Physique", roll: () => pick(SIMPLE_TRAITS.physique) },
  { key: "virtue", label: "Virtue", roll: () => pick(SIMPLE_TRAITS.virtue) },
  { key: "face", label: "Face", roll: () => pick(SIMPLE_TRAITS.face) },
  { key: "speech", label: "Speech", roll: () => pick(SIMPLE_TRAITS.speech) },
  { key: "misfortune", label: "Misfortune", roll: () => pick(SIMPLE_TRAITS.misfortune) },
  {
    key: "credits",
    label: "Credits",
    roll: () => `${rollCredits()} cr`,
    canReroll: false,
    includeInRollAll: false,
  },
]

const MAP_ROUTES = {
  "/gd-1": { label: "Floors 1,2,4,6", image: "/floor1.webp", alt: "Deck map floors 1, 2, 4, and 6" },
  "/gd-3": { label: "Floor 3", image: "/floor3.webp", alt: "Deck map floor 3" },
  "/gd-all": { label: "Overview", image: "/overview.webp", alt: "Deck map overview" },
}

const CREATE_ROUTE = "/c"
const TOTAL_CREATOR_STEPS = 7

const NAMEPLATE_OVERLAY_TWEAKS = {
  xPercent: 48,
  yPercent: 40,
  widthPercent: 64,
  rotateXDeg: 10,
  rotateYDeg: 12,
  rotateZDeg: -7,
  skewXDeg: 25,
  skewYDeg: -14,
  scaleX: 2.58,
  scaleY: 1.95,
  perspectivePx: 900,
  lineGapEm: 0.8,
  dividerWidthPercent: 10,
}

const NAMEPLATE_OVERLAY_STYLE = {
  "--plate-x": `${NAMEPLATE_OVERLAY_TWEAKS.xPercent}%`,
  "--plate-y": `${NAMEPLATE_OVERLAY_TWEAKS.yPercent}%`,
  "--plate-width": `${NAMEPLATE_OVERLAY_TWEAKS.widthPercent}%`,
  "--plate-rotate-x": `${NAMEPLATE_OVERLAY_TWEAKS.rotateXDeg}deg`,
  "--plate-rotate-y": `${NAMEPLATE_OVERLAY_TWEAKS.rotateYDeg}deg`,
  "--plate-rotate-z": `${NAMEPLATE_OVERLAY_TWEAKS.rotateZDeg}deg`,
  "--plate-skew-x": `${NAMEPLATE_OVERLAY_TWEAKS.skewXDeg}deg`,
  "--plate-skew-y": `${NAMEPLATE_OVERLAY_TWEAKS.skewYDeg}deg`,
  "--plate-scale-x": NAMEPLATE_OVERLAY_TWEAKS.scaleX,
  "--plate-scale-y": NAMEPLATE_OVERLAY_TWEAKS.scaleY,
  "--plate-perspective": `${NAMEPLATE_OVERLAY_TWEAKS.perspectivePx}px`,
  "--plate-line-gap": `${NAMEPLATE_OVERLAY_TWEAKS.lineGapEm}em`,
  "--plate-divider-width": `${NAMEPLATE_OVERLAY_TWEAKS.dividerWidthPercent}%`,
}

const STEP3_NAMEPLATE_STYLE = {
  ...NAMEPLATE_OVERLAY_STYLE,
  "--plate-x": `${NAMEPLATE_OVERLAY_TWEAKS.xPercent + 10}%`,
}

const STEP4_NAMEPLATE_TWEAKS = {
  xOffsetPercent: 10,
  yOffsetPercent: 28,
  widthOffsetPercent: 0,
}

const STEP4_NAMEPLATE_STYLE = {
  ...NAMEPLATE_OVERLAY_STYLE,
  "--plate-x": `${NAMEPLATE_OVERLAY_TWEAKS.xPercent + STEP4_NAMEPLATE_TWEAKS.xOffsetPercent}%`,
  "--plate-y": `${NAMEPLATE_OVERLAY_TWEAKS.yPercent + STEP4_NAMEPLATE_TWEAKS.yOffsetPercent}%`,
  "--plate-width": `${NAMEPLATE_OVERLAY_TWEAKS.widthPercent + STEP4_NAMEPLATE_TWEAKS.widthOffsetPercent}%`,
}

const CLASS_INFO = {
  Android: { skillPickCount: 2, icon: "/android.webp" },
  Marine: { skillPickCount: 2, icon: "/marine.webp" },
  Teamster: { skillPickCount: 3, icon: "/teamster.webp" },
  Scientist: { skillPickCount: 4, icon: "/scientist.webp" },
}

const BACKGROUND_BY_CODE = {
  s3: {
    code: "s3",
    className: "Android",
    title: "Companion",
    defaultSkills: ["computers", "linguistics"],
    loadout: ["Personality Emulator", "Small pet or drone", "Hacking Spike", "Repair Foam"],
  },
  m1: {
    code: "m1",
    className: "Android",
    title: "Liberator",
    defaultSkills: ["computers", "linguistics"],
    loadout: ["Signal Jammer", "Voice Modulator", "Another's Data Core", "Boarding Axe | 1d10+2"],
  },
  t3: {
    code: "t3",
    className: "Android",
    title: "Indentured",
    defaultSkills: ["computers", "linguistics"],
    loadout: ["Corporate Chip", "Small pet or drone", "Stun Baton | 1d5+2", "Holographic projector"],
  },
  a2: {
    code: "a2",
    className: "Marine",
    title: "Mercenary",
    defaultSkills: ["military-training", "athletics"],
    loadout: ["Combat Knife | 1d5+3", "Infrared Goggles", "Flashbang", "Duct Tape"],
  },
  s1: {
    code: "s1",
    className: "Marine",
    title: "Bounty Hunter",
    defaultSkills: ["military-training", "athletics"],
    loadout: ["Tranquilizer Rifle | 0 | 2 |", "Breaching Charge", "Binoculars", "Thermal Camera"],
  },
  t2: {
    code: "t2",
    className: "Marine",
    title: "Fugitive",
    defaultSkills: ["military-training", "athletics"],
    loadout: ["Revolver |1d10+2|3", "Fake ID", "Inert Ankle Monitor", "Zip Ties"],
  },
  s2: {
    code: "s2",
    className: "Teamster",
    title: "Union Representative",
    defaultSkills: ["rimwise"],
    loadout: ["Laser Cutter |1d5+2", "Industrial Drill", "Handheld Radio", "Toolbelt with tools"],
  },
  m3: {
    code: "m3",
    className: "Teamster",
    title: "Executive",
    defaultSkills: ["rimwise"],
    loadout: ["Key Card", "Audio Recorder", "Motion Tracker", "Secret Documents"],
  },
  a3: {
    code: "a3",
    className: "Teamster",
    title: "Journalist",
    defaultSkills: ["rimwise"],
    loadout: ["Camera", "Portable Scanner", "Crowbar 1d5+1", "Welding Torch"],
  },
  m2: {
    code: "m2",
    className: "Scientist",
    title: "Analyst",
    defaultSkills: ["field-medicine"],
    loadout: ["Serum", "Surgical Kit", "Electronic Tool set", "Tranquilizer Injector"],
  },
  t1: {
    code: "t1",
    className: "Scientist",
    title: "Professor",
    defaultSkills: ["field-medicine"],
    loadout: ["Serum", "Portable Computer Terminal", "Gene Sampler", "First Aid Kit"],
  },
  a1: {
    code: "a1",
    className: "Scientist",
    title: "Curator",
    defaultSkills: ["field-medicine"],
    loadout: ["Stimpack", "Containment Supplies", "Bioscanner", "Face Mask"],
  },
}

const SKILL_OPTIONS = [
  { id: "athletics", label: "athletics" },
  { id: "psychology", label: "psychology" },
  { id: "history", label: "history" },
  { id: "theology", label: "theology", parent: "history" },
  { id: "computers", label: "computers" },
  { id: "electronics", label: "electronics", parent: "computers" },
  { id: "mathematics", label: "mathematics" },
  { id: "engineering", label: "engineering", parent: "mathematics" },
  { id: "physics", label: "physics", parent: "mathematics" },
  { id: "cryptography", label: "cryptography", parent: "mathematics" },
  { id: "art", label: "art" },
  { id: "biology", label: "biology" },
  { id: "botany", label: "botany", parent: "biology" },
  { id: "zoology", label: "zoology", parent: "biology" },
  { id: "pathology", label: "pathology", parent: "biology" },
  { id: "rimwise", label: "rimwise (street smart)" },
  { id: "chemistry", label: "chemistry" },
  { id: "pharmacology", label: "pharmacology", parent: "chemistry" },
  { id: "military-training", label: "military training" },
  { id: "ranged-combat", label: "ranged combat", parent: "military-training" },
  { id: "close-quarters-combat", label: "close quarters combat", parent: "military-training" },
  { id: "infiltration", label: "infiltration", parent: "military-training" },
  { id: "field-medicine", label: "field medicine" },
  { id: "linguistics", label: "linguistics" },
]

const SKILL_LOOKUP = Object.fromEntries(SKILL_OPTIONS.map(skill => [skill.id, skill]))

const LEFT_SKILL_ORDER = [
  "history",
  "computers",
  "art",
  "mathematics",
  "rimwise",
  "field-medicine",
  "biology",
  "linguistics",
  "chemistry",
  "athletics",
  "military-training",
  "psychology",
]

const RIGHT_SKILL_ORDER = [
  "theology",
  "electronics",
  "engineering",
  "physics",
  "cryptography",
  "botany",
  "zoology",
  "pathology",
  "pharmacology",
  "ranged-combat",
  "close-quarters-combat",
  "infiltration",
]

const ORDERED_ROOT_SKILLS = LEFT_SKILL_ORDER.map(id => SKILL_LOOKUP[id]).filter(Boolean)
const ORDERED_CHILD_SKILLS = RIGHT_SKILL_ORDER.map(id => SKILL_LOOKUP[id]).filter(Boolean)

const MALE_NAMES = [
  "Cooper Ashcroft",
  "Nikolai Voss",
  "Rowan Mercer",
  "Jax Calder",
  "Orion Pike",
  "Kellan Stroud",
  "Silas Rook",
  "Damon Vale",
  "Felix Warden",
  "Tobias Quill",
  "Gideon Marsh",
  "Bran Cormac",
  "Levi Draven",
  "Marcus Thorne",
  "Cassian Locke",
  "Elias Fen",
  "Victor Haines",
  "Rhett Maddox",
  "Caleb Dyer",
  "Arlo Kane",
  "Jonah Wraith",
  "Bastian Cole",
  "Darius Holt",
  "Milo Keene",
  "Tristan Vane",
  "Galen Ward",
  "Declan Graves",
  "Evan Rooke",
  "Lucian Frost",
  "Nate Sterling",
]

const FEMALE_NAMES = [
  "Mara Kestrel",
  "Vera Holloway",
  "Naomi Dray",
  "Lyra Morrow",
  "Iris Vance",
  "Selene Archer",
  "Nadia Crowe",
  "Cora Fenwick",
  "Elara Stone",
  "Juniper Voss",
  "Talia Rune",
  "Freya Calder",
  "Zara Quinn",
  "Mina Vex",
  "Arden Cross",
  "Sloane Mercer",
  "Dahlia Pike",
  "Bianca Hollow",
  "Rhea Stroud",
  "Keira Nyx",
  "Nola Harrow",
  "Maeve Sinclair",
  "Lena Draven",
  "Petra Vale",
  "Sabine Locke",
  "Wren Ashford",
  "Yara Kade",
  "Opal Thorn",
  "Kira Morrow",
  "Anika Frost",
]

const NEUTRAL_NAMES = [
  "Avery Nyx",
  "Rin Calder",
  "Sage Mercer",
  "Quinn Hollow",
  "Nova Pike",
  "Ember Voss",
  "Indigo Stroud",
  "Rowe Archer",
  "Kestrel Morrow",
  "Onyx Vale",
  "Harbor Wren",
  "Cinder Hale",
  "Sol Harper",
  "Echo Briar",
  "Pax Rook",
  "Vale Arden",
  "Mica Thorne",
  "River Quill",
  "Lumen Cross",
  "Ash Sterling",
  "Briar Vance",
  "Zephyr Knox",
  "Marlow Finch",
  "Rune Harlow",
  "Talon Gray",
  "Sable Quinn",
  "Fable Stone",
  "Kai Holloway",
  "Peregrine Ash",
  "Indra Vale",
]

function getLocationState() {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
  }
}

function randomName(gender) {
  if (gender === "female") {
    return pick(FEMALE_NAMES)
  }

  if (gender === "neutral") {
    return pick(NEUTRAL_NAMES)
  }

  return pick(MALE_NAMES)
}

function parseBackgroundCode(search) {
  const params = new URLSearchParams(search)
  return (params.get("b") || "").toLowerCase()
}

function parseLoadoutEntry(entry) {
  const [itemPart = "", damagePart = "", ...ammoParts] = entry.split("|")
  return {
    item: itemPart.trim(),
    damage: damagePart.trim(),
    ammo: ammoParts.join("|").trim(),
  }
}

function rollAllFields() {
  const next = {}
  for (const field of FIELD_DEFS) {
    if (field.includeInRollAll === false) {
      continue
    }
    next[field.key] = field.roll()
  }
  return next
}

function generateAllFields() {
  const next = {}
  for (const field of FIELD_DEFS) {
    next[field.key] = field.roll()
  }
  return next
}

function FieldRow({ label, value, onRoll, canReroll = true }) {
  return (
    <div className="field-row">
      <label className="field-label">{label}</label>
      <div className={`field-control-wrap ${canReroll ? "" : "field-control-wrap-static"}`}>
        <input
          type="text"
          value={value}
          readOnly
          aria-label={label}
          className="field-input"
        />
        {canReroll ? (
          <button
            type="button"
            onClick={onRoll}
            className="field-roll-btn"
            aria-label={`Reroll ${label}`}
            title={`Reroll ${label}`}
          >
            <img src="/dice.svg" alt="" aria-hidden="true" className="dice-icon" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

function MapNavBubble({ currentPath, onNavigate }) {
  const bubbleRef = useRef(null)

  useEffect(() => {
    const viewport = window.visualViewport
    if (!viewport) {
      return undefined
    }

    let frameId = null

    function applyBubblePosition() {
      const scale = viewport.scale || 1
      const inset = 12
      const x = viewport.offsetLeft + viewport.width - inset
      const y = viewport.offsetTop + viewport.height - inset

      if (!bubbleRef.current) {
        return
      }

      bubbleRef.current.style.left = `${x}px`
      bubbleRef.current.style.top = `${y}px`
      bubbleRef.current.style.transform = `translate(-100%, -100%) scale(${1 / scale})`
    }

    function syncBubblePosition() {
      if (frameId !== null) {
        return
      }
      frameId = window.requestAnimationFrame(() => {
        frameId = null
        applyBubblePosition()
      })
    }

    syncBubblePosition()
    viewport.addEventListener("resize", syncBubblePosition)
    viewport.addEventListener("scroll", syncBubblePosition)
    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
      viewport.removeEventListener("resize", syncBubblePosition)
      viewport.removeEventListener("scroll", syncBubblePosition)
    }
  }, [])

  return (
    <nav ref={bubbleRef} className="map-nav-bubble" aria-label="Map navigation">
      {Object.entries(MAP_ROUTES).map(([path, config]) => {
        const isActive = currentPath === path
        return (
          <button
            key={path}
            type="button"
            onClick={() => onNavigate(path)}
            className={`map-nav-link ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {config.label}
          </button>
        )
      })}
    </nav>
  )
}

function MapRouteView({ path, onNavigate }) {
  const config = MAP_ROUTES[path]
  if (!config) {
    return null
  }

  return (
    <main className="map-page">
      <img src={config.image} alt={config.alt} className="map-image" />
      <MapNavBubble currentPath={path} onNavigate={onNavigate} />
    </main>
  )
}

function CreateRoute({ search, onNavigate }) {
  const backgroundCode = parseBackgroundCode(search)
  const hasValidBackground = Boolean(BACKGROUND_BY_CODE[backgroundCode])
  const background = BACKGROUND_BY_CODE[backgroundCode] || BACKGROUND_BY_CODE.a1
  const classMeta = CLASS_INFO[background.className]

  const [step, setStep] = useState(1)
  const [gender, setGender] = useState("male")
  const [name, setName] = useState(() => randomName("male"))
  const [selectedSkills, setSelectedSkills] = useState(() => new Set(background.defaultSkills))
  const lockedSkills = new Set(background.defaultSkills)

  useEffect(() => {
    setStep(1)
    setGender("male")
    setName(randomName("male"))
    setSelectedSkills(new Set(background.defaultSkills))
  }, [background.code])

  function toggleSkill(skillId) {
    setSelectedSkills(prev => {
      const next = new Set(prev)
      const skill = SKILL_LOOKUP[skillId]
      if (!skill) {
        return prev
      }

      if (lockedSkills.has(skillId)) {
        return prev
      }

      const totalLimit = lockedSkills.size + classMeta.skillPickCount

      if (next.has(skillId)) {
        next.delete(skillId)
        for (const option of SKILL_OPTIONS) {
          if (option.parent === skillId) {
            next.delete(option.id)
          }
        }
        return next
      }

      if (next.size >= totalLimit) {
        return prev
      }

      if (skill.parent && !next.has(skill.parent)) {
        return prev
      }

      next.add(skillId)
      return next
    })
  }

  function canSelectSkill(skill) {
    if (lockedSkills.has(skill.id)) {
      return true
    }

    if (selectedSkills.has(skill.id)) {
      return true
    }

    const totalLimit = lockedSkills.size + classMeta.skillPickCount
    if (selectedSkills.size >= totalLimit) {
      return false
    }

    if (skill.parent && !selectedSkills.has(skill.parent)) {
      return false
    }

    return true
  }

  function nextStep() {
    setStep(prev => Math.min(TOTAL_CREATOR_STEPS, prev + 1))
  }

  function prevStep() {
    setStep(prev => Math.max(1, prev - 1))
  }

  function rollRandomName(nextGender) {
    setGender(nextGender)
    setName(randomName(nextGender))
  }

  const additionalSkillCount = selectedSkills.size - lockedSkills.size
  const skillCountComplete = additionalSkillCount === classMeta.skillPickCount
  const canGoNext = step === 1 ? skillCountComplete : step === 2 ? name.trim().length > 0 : true

  const selectedSkillLabels = SKILL_OPTIONS.filter(skill => selectedSkills.has(skill.id)).map(skill => skill.label)
  const loadoutRows = background.loadout.map(parseLoadoutEntry)
  const displayBackground = `${background.className} - ${background.title}`
  const linksWrapRef = useRef(null)
  const parentSkillRefs = useRef({})
  const childSkillRefs = useRef({})
  const [linkPaths, setLinkPaths] = useState([])

  useLayoutEffect(() => {
    if (step !== 1 || !linksWrapRef.current) {
      return undefined
    }

    function buildPaths() {
      if (!linksWrapRef.current) {
        return
      }

      const wrapRect = linksWrapRef.current.getBoundingClientRect()
      const nextPaths = []

      for (const child of ORDERED_CHILD_SKILLS) {
        const parentNode = parentSkillRefs.current[child.parent]
        const childNode = childSkillRefs.current[child.id]
        if (!parentNode || !childNode) {
          continue
        }

        const parentRect = parentNode.getBoundingClientRect()
        const childRect = childNode.getBoundingClientRect()
        const startX = parentRect.right - wrapRect.left
        const startY = parentRect.top - wrapRect.top + parentRect.height / 2
        const endX = childRect.left - wrapRect.left
        const endY = childRect.top - wrapRect.top + childRect.height / 2
        const cp1X = startX + (endX - startX) * 0.36
        const cp2X = startX + (endX - startX) * 0.64
        nextPaths.push(`M ${startX} ${startY} C ${cp1X} ${startY} ${cp2X} ${endY} ${endX} ${endY}`)
      }

      setLinkPaths(nextPaths)
    }

    const frame = window.requestAnimationFrame(buildPaths)
    window.addEventListener("resize", buildPaths)

    const observer = new ResizeObserver(buildPaths)
    observer.observe(linksWrapRef.current)

    return () => {
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("resize", buildPaths)
    }
  }, [selectedSkills, step])

  return (
    <main className={`mothership-app creator-app creator-app-step${step}`}>
      <section className="generator-card creator-card">
        <header className="app-header">
          <h1>Create Character</h1>
          <p>Step {step} of {TOTAL_CREATOR_STEPS}</p>
          {!hasValidBackground ? (
            <p className="creator-warning">Unknown background code. Using a1. Try /c?b=a1, /c?b=m2, /c?b=t3, etc.</p>
          ) : null}
        </header>

        <div className={`creator-panel ${step === 1 ? "creator-panel-step1" : ""}`}>
          {step === 1 ? (
            <>
              <div className="background-pill">
                <img src={classMeta.icon} alt={background.className} className="background-icon" />
                <div>
                  <strong>{displayBackground}</strong>
                  <p>
                    Pick {classMeta.skillPickCount} additional skills.
                  </p>
                </div>
              </div>

              <div className="skills-columns" ref={linksWrapRef}>
                <svg className="skills-links-svg" aria-hidden="true">
                  {linkPaths.map(path => (
                    <path key={path} d={path} className="skills-link-path" />
                  ))}
                </svg>

                <section className="skills-column">
                  <h3 className="skills-column-title">Entry Skills</h3>
                  <div className="skills-column-list">
                    {ORDERED_ROOT_SKILLS.map(skill => {
                      const active = selectedSkills.has(skill.id)
                      const disabled = !canSelectSkill(skill)
                      const locked = lockedSkills.has(skill.id)

                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => toggleSkill(skill.id)}
                          ref={node => {
                            parentSkillRefs.current[skill.id] = node
                          }}
                          className={`skill-chip ${active ? "active" : ""} ${locked ? "locked" : ""}`}
                          disabled={disabled}
                          title={locked ? "Required by background" : undefined}
                        >
                          {skill.label}
                        </button>
                      )
                    })}
                  </div>
                </section>

                <section className="skills-column skills-column-prereq">
                  <h3 className="skills-column-title">Specialties</h3>
                  <div className="skills-column-list">
                    {ORDERED_CHILD_SKILLS.map(skill => {
                      const active = selectedSkills.has(skill.id)
                      const disabled = !canSelectSkill(skill)
                      const locked = lockedSkills.has(skill.id)

                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => toggleSkill(skill.id)}
                          ref={node => {
                            childSkillRefs.current[skill.id] = node
                          }}
                          className={`skill-chip skill-child-chip ${active ? "active" : ""} ${locked ? "locked" : ""}`}
                          disabled={disabled}
                          title={locked ? "Required by background" : `Requires ${SKILL_LOOKUP[skill.parent].label}`}
                        >
                          {skill.label}
                        </button>
                      )
                    })}
                  </div>
                </section>
              </div>

              <p className="creator-note">
                {additionalSkillCount} / {classMeta.skillPickCount} additional selected
              </p>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <p className="creator-note">Pick a name.</p>

              <div className="field-control-wrap">
                <input
                  type="text"
                  value={name}
                  onChange={event => setName(event.target.value)}
                  aria-label="Character name"
                  className="field-input"
                  placeholder="Enter character name"
                />
              </div>

              <section className="random-name-card" aria-label="Random name options">
                <h3 className="random-name-title">Random By Gender</h3>
                <p className="random-name-help">Choose a style for random name.</p>
                <div className="gender-toggle-row" role="group" aria-label="Random name style">
                  <button
                    type="button"
                    className={`gender-btn ${gender === "male" ? "active" : ""}`}
                    onClick={() => rollRandomName("male")}
                  >
                    <img src="/male.svg" alt="Male" />
                    Male
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${gender === "female" ? "active" : ""}`}
                    onClick={() => rollRandomName("female")}
                  >
                    <img src="/female.svg" alt="Female" />
                    Female
                  </button>
                  <button
                    type="button"
                    className={`gender-btn ${gender === "neutral" ? "active" : ""}`}
                    onClick={() => rollRandomName("neutral")}
                  >
                    <img src="/gender_neutral.svg" alt="Gender neutral" />
                    Neutral
                  </button>
                </div>
              </section>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <p className="creator-note" style={{fontSize: "1.2em", textAlign: "center"}}>Write your <b>name</b> and your <b>background</b>, on your dry erase nameplate.</p>
              <div className="nameplate-example nameplate-example-step3" style={STEP3_NAMEPLATE_STYLE}>
                <img src="/example_nameplate.webp" alt="Example nameplate" className="creator-example creator-example-step3" />
                <div className="nameplate-overlay" aria-hidden="true">
                  <p className="nameplate-overlay-name">{name || "Unnamed"}</p>
                  <hr className="nameplate-overlay-divider" />
                  <p className="nameplate-overlay-background">{background.title}</p>
                </div>
              </div>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <p className="creator-note" style={{fontSize: "1.2em"}}>Pick a portrait and place it on the top gap of the nameplate.</p>
              <div className="nameplate-example nameplate-example-step4" style={STEP4_NAMEPLATE_STYLE}>
                <img src="/example_portrait.webp" alt="Example portrait placement" className="creator-example creator-example-step4" />
                <div className="nameplate-overlay" aria-hidden="true">
                  <p className="nameplate-overlay-name">{name || "Unnamed"}</p>
                  <hr className="nameplate-overlay-divider" />
                  <p className="nameplate-overlay-background">{background.title}</p>
                </div>
              </div>
            </>
          ) : null}

          {step === 5 ? (
            <>
              <p className="creator-note" style={{fontSize: "1.3em"}}>Copy these loadout items to your booklet.</p>
              <div className="creator-loadout-table-wrap">
                <table className="creator-loadout-table" aria-label="Loadout table">
                  <thead>
                    <tr>
                      <th scope="col">Item</th>
                      <th scope="col">Damage</th>
                      <th scope="col">Ammo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadoutRows.map((row, index) => (
                      <tr key={`${row.item || "item"}-${index}`}>
                        <td>{row.item}</td>
                        <td>{row.damage}</td>
                        <td>{row.ammo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <img src="/example_item.webp" alt="Example loadout items" className="creator-example creator-example-step5" />
            </>
          ) : null}

          {step === 6 ? (
            <>
              <p className="creator-note" style={{fontSize: "1.3em"}}>Copy your skills to your booklet.</p>
              <ul className="creator-list" style={{fontSize: "1.3em"}}>
                {selectedSkillLabels.map(skill => (
                  <li key={skill}><b>{skill}</b></li>
                ))}
              </ul>
              <img src="/example_skills.webp" alt="Example skill list" className="creator-example creator-example-step6" />
            </>
          ) : null}

          {step === 7 ? (
            <>
              <p className="creator-note">You're done! You can hand back your role card.</p>
              <div className="background-pill">
                <img src={classMeta.icon} alt={background.className} className="background-icon" />
                <div>
                  <strong>{name || "Unnamed"}</strong>
                  <p>{displayBackground}</p>
                </div>
              </div>
            </>
          ) : null}
        </div>

        <footer className="creator-nav">
          <button type="button" className="roll-all-btn" onClick={prevStep} disabled={step === 1}>
            Back
          </button>

          {step < TOTAL_CREATOR_STEPS ? (
            <button type="button" className="roll-all-btn" onClick={nextStep} disabled={!canGoNext}>
              Next
            </button>
          ) : (
            <button type="button" className="roll-all-btn" onClick={() => onNavigate("/")}>
              Optional traits
            </button>
          )}
        </footer>
      </section>
    </main>
  )
}

export default function App() {
  const [values, setValues] = useState(() => generateAllFields())
  const [location, setLocation] = useState(() => getLocationState())

  useEffect(() => {
    const syncPath = () => setLocation(getLocationState())
    window.addEventListener("popstate", syncPath)
    return () => window.removeEventListener("popstate", syncPath)
  }, [])

  function navigateTo(nextPath) {
    if (window.location.pathname === nextPath) {
      return
    }

    if (MAP_ROUTES[location.pathname] && MAP_ROUTES[nextPath]) {
      window.location.assign(nextPath)
      return
    }

    window.history.pushState({}, "", nextPath)
    setLocation(getLocationState())
  }

  function rollOne(key, roller) {
    setValues(prev => ({
      ...prev,
      [key]: roller(),
    }))
  }

  if (MAP_ROUTES[location.pathname]) {
    return <MapRouteView path={location.pathname} onNavigate={navigateTo} />
  }

  if (location.pathname === CREATE_ROUTE) {
    return <CreateRoute search={location.search} onNavigate={navigateTo} />
  }

  return (
    <main className="mothership-app">
      <section className="generator-card">
        <header className="app-header">
          <h1>Mothership</h1>
          <p>Optional character details. Re-roll as many times as you'd like. Write any inspiring details into your booklet.</p>
        </header>

        <div className="field-list">
          {FIELD_DEFS.map(field => (
            <FieldRow
              key={field.key}
              label={field.label}
              value={values[field.key]}
              onRoll={() => rollOne(field.key, field.roll)}
              canReroll={field.canReroll !== false}
            />
          ))}
        </div>

        <footer className="app-footer">
          <a href="https://codabool.itch.io" target="_blank" rel="noreferrer">
            <img src="/itch.svg" alt="Itch.io" className="itch-icon" />
            
          </a>
        </footer>
      </section>
    </main>
  )
}
