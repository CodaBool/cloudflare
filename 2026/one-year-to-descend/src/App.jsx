import React, { useState } from "react"
import HexWild from "./assets/hex_wild.svg?react";
import HexArchive from "./assets/hex_archive.svg?react";
import HexCursed from "./assets/hex_cursed.svg?react";
import HexDestination from "./assets/hex_destination.svg?react";
import HexHaven from "./assets/hex_haven.svg?react";
import HexRuin from "./assets/hex_ruins.svg?react";
import RelationshipIcon from "./assets/relationship.svg?react";
import DiceIcon from "./assets/dice.svg?react";
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
);

const RELATIONSHIPS = {
    categories: {
        1: "Companions",
        2: "Professional",
        3: "Romantic",
        4: "Obligation & Debt",
        5: "Rivalry",
        6: "Ambivalent",
        7: "Shared Trauma",
        8: "Unlikely Bond",
    },
    results: {
        1: {
            0: "They have been through hell together before.",
            1: "They are close friends and confidants.",
            2: "They have similar hobbies or interests.",
            3: "They have an unspoken code of mutual protection.",
            4: "One is trying to corrupt the other.",
            5: "They trust each other with their lives.",
            6: "They serve as a moral compass for the other.",
            7: "They are thick as thieves.",
            8: "One reminds the other of a lost friend or family member.",
            9: "They have a pact to get back somewhere together, no matter what.",
        },
        2: {
            0: "They served together in the same unit or corporation.",
            1: "One is a mentor to the other.",
            2: "They cover for the other's mistakes.",
            3: "One got the job the other wanted.",
            4: "They are professional rivals in direct competition.",
            5: "One is clearly better at the job, and it's a sore point.",
            6: "They share complaints about management or the current assignment.",
            7: "They collaborated on a successful—and profitable—project.",
            8: "Their methods and philosophies clash constantly.",
            9: "They have a shared history of failing together.",
        },
        3: {
            0: "They are secretly involved with each other.",
            1: "They are in a relationship together.",
            2: "They are former lovers, and it's still awkward.",
            3: "They had a bad breakup in their past.",
            4: "There is an unspoken attraction between them.",
            5: "They have a friends with benefits arrangement.",
            6: "They're stuck in a will-they-won't-they dynamic.",
            7: "They hooked up once, and it's complicated.",
            8: "One is trying to win the other back.",
            9: "They are trying to keep things strictly professional.",
        },
        4: {
            0: "One saved the other's life, creating a life debt.",
            1: "One knows a deeply damaging secret about the other.",
            2: "One is blackmailing the other.",
            3: "They owe the same dangerous people or corporation money.",
            4: "One took the fall for the other's mistake or crime.",
            5: "There is an unresolved debt between them.",
            6: "They are bound by a past betrayal.",
            7: "One helped the other escape the law.",
            8: "They are caught in the same conspiracy.",
            9: "There is a major unspoken obligation between them.",
        },
        5: {
            0: "They have a begrudging mutual respect for each other.",
            1: "They are bitter enemies with a shared history.",
            2: "They are former friends turned rivals.",
            3: "They are in a friendly competition with each other.",
            4: "One is a one-sided rival, but the other is oblivious.",
            5: "They want what the other has.",
            6: "They compete over nearly everything.",
            7: "They are from opposing factions or organizations.",
            8: "They are forced to work together despite their animosity.",
            9: "One blames the other for a personal loss.",
        },
        6: {
            0: "They have never really talked much, but are now stuck together.",
            1: "There is mutual indifference toward them.",
            2: "They run in different social circles, even on this ship.",
            3: "They know of each other, but that's it.",
            4: "One is actively avoiding the other.",
            5: "Something unspoken makes them awkward around each other.",
            6: "Their communication is stilted and formal.",
            7: "One is a minor celebrity to the other, but they don't know it.",
            8: "They have nothing in common to bond over.",
            9: "They get the feeling they've met before, but can't place where.",
        },
        7: {
            0: "They are the only survivors of a past disaster.",
            1: "They both witnessed something they shouldn't have.",
            2: "One saved the other from a horrific monster.",
            3: "They survived the same medical experiment.",
            4: "They share the memory of friend's death.",
            5: "They were both part of a failed mission with a high body count.",
            6: "They are bonded by a terrifying encounter from their past.",
            7: "They both suffer from a recurring nightmare from a shared event.",
            8: "One knows the other's most shameful secret.",
            9: "They are both running from the same past mistake.",
        },
        8: {
            0: "One comes from privilege, the other from poverty.",
            1: "They are two vastly different people who found a mutual interest.",
            2: "One is the other's hero, but they don't know it.",
            3: "They are both hiding a secret.",
            4: "They constantly get on each other's nerves, but they work well together.",
            5: "They were rivals, but have since gained respect for one another.",
            6: "One is a jaded veteran, the other a naive rookie.",
            7: "They are united by a common enemy.",
            8: "They are the only ones who can perform a specific task together.",
            9: "One is the other's confidant for a secret they are both keeping.",
        },
    },
};


const WOUND_TYPES = [
    { key: "blunt", label: "Blunt Force" },
    { key: "bleeding", label: "Bleeding" },
    { key: "gunshot", label: "Gunshot" },
    { key: "fire", label: "Fire & Explosives" },
    { key: "gore", label: "Gore & Massive" },
];

const WOUND_TABLE = [
    {
        roll: "00",
        severity: "Flesh Wound",
        blunt: "Knocked down.",
        bleeding: "Drop held item.",
        gunshot: "Grazed. Knocked down.",
        fire: "Hair burnt. Gain 1d5 Stress.",
        gore: "Vomit. [-] on next action.",
    },
    {
        roll: "01",
        severity: "Minor Injury",
        blunt: "Winded. [-] until you catch your breath.",
        bleeding: "Lots of blood. Those Close gain 1 Stress.",
        gunshot: "Bleeding +1.",
        fire: "Awesome scar. +1 Minimum Stress.",
        gore: "Awesome scar. +1 Minimum Stress.",
    },
    {
        roll: "02",
        severity: "Minor Injury",
        blunt: "Sprained Ankle. [-] on Speed Checks.",
        bleeding: "Blood in eyes. [-] until wiped clean.",
        gunshot: "Broken rib.",
        fire: "Singed. [-] on next action.",
        gore: "Digit mangled.",
    },
    {
        roll: "03",
        severity: "Minor Injury",
        blunt: "Concussion. [-] on mental tasks.",
        bleeding: "Laceration. Bleeding +1.",
        gunshot: "Fractured extremity.",
        fire: "Shrapnel/large burn.",
        gore: "Eyes gouged out.",
    },
    {
        roll: "04",
        severity: "Minor Injury",
        blunt: "Leg or foot broken. [-] on Speed Checks.",
        bleeding: "Major cut. Bleeding +2.",
        gunshot: "Internal bleeding. Bleeding +2.",
        fire: "Extensive burns. -1d10 Strength.",
        gore: "Ripped off flesh. -1d10 Strength.",
    },
    {
        roll: "05",
        severity: "Major Injury",
        blunt: "Arm or hand broken. [-] manual tasks.",
        bleeding: "Fingers/toes severed. Bleeding +3.",
        gunshot: "Lodged bullet. Surgery required.",
        fire: "Major burn. -2d10 Body Save.",
        gore: "Paralyzed waist down.",
    },
    {
        roll: "06",
        severity: "Major Injury",
        blunt: "Snapped collarbone. [-] on Strength Checks.",
        bleeding: "Hand/foot severed. Bleeding +4.",
        gunshot: "Gunshot wound to the neck.",
        fire: "Skin grafts required. -2d10 Body Save.",
        gore: "Limb severed. Bleeding +5.",
    },
    {
        roll: "07",
        severity: "Lethal Injury (Death Save in 1d10 rounds)",
        blunt: "Back broken. [-] on all rolls.",
        bleeding: "Limb severed. Bleeding +5.",
        gunshot: "Major blood loss. Bleeding +4.",
        fire: "Limb on fire. 2d10 Damage per round.",
        gore: "Impaled. Bleeding +6.",
    },
    {
        roll: "08",
        severity: "Lethal Injury (Death Save in 1d10 rounds)",
        blunt: "Skull fracture. [-] on all rolls.",
        bleeding: "Major artery cut. Bleeding +6.",
        gunshot: "Sucking chest wound. Bleeding +5.",
        fire: "Body on fire. 3d10 Damage per round.",
        gore: "Guts spooled on floor. Bleeding +7.",
    },
    {
        roll: "09",
        severity: "Fatal Injury (Death Save)",
        blunt: "Spine or neck broken. Death Save.",
        bleeding: "Throat slit or heart pierced. Death Save.",
        gunshot: "Headshot. Death Save.",
        fire: "Engulfed in fiery explosion. Death Save.",
        gore: "Head explodes. No Death Save. You have died.",
    },
];

const DEATH_TABLE = [
    {
        roll: "00",
        result: "You are unconscious. You wake up in 2d10 minutes. Reduce your Maximum Health by 1d5.",
    },
    {
        roll: "01-02",
        result: "You are unconscious and dying. You die in 1d5 rounds without intervention.",
    },
    {
        roll: "03-04",
        result: "You are comatose. Only extraordinary measures can return you to the waking world.",
    },
    {
        roll: "05-09",
        result: "You have died. Roll up a new character.",
    },
];

const PANIC_TABLE = [
    {
        roll: "01",
        name: "Adrenaline Rush",
        text: "[+] on all rolls for the next 2d10 minutes. Reduce Stress by 1d5.",
    },
    {
        roll: "02",
        name: "Nervous",
        text: "Gain 1 Stress.",
    },
    {
        roll: "03",
        name: "Jumpy",
        text: "Gain 1 Stress. All Close crewmembers gain 2 Stress.",
    },
    {
        roll: "04",
        name: "Overwhelmed",
        text: "[-] on all rolls for the next 1d10 minutes. Increase Minimum Stress by 1.",
    },
    {
        roll: "05",
        name: "Coward",
        text: "Gain a new Condition: You must make a Fear Save to engage in violence, otherwise you flee.",
    },
    {
        roll: "06",
        name: "Frightened",
        text: "Gain a new Condition: When encountering what frightened you, make a Fear Save [-] or gain 1d5 Stress.",
    },
    {
        roll: "07",
        name: "Nightmares",
        text: "Gain a new Condition: Sleep is difficult, gain [-] on Rest Saves.",
    },
    {
        roll: "08",
        name: "Loss of Confidence",
        text: "Gain a new Condition: Choose one Skill and lose that Skill's bonus.",
    },
    {
        roll: "09",
        name: "Deflated",
        text: "Gain a new Condition: Whenever a Close crewmember fails a Save, gain 1 Stress.",
    },
    {
        roll: "10",
        name: "Doomed",
        text: "Gain a new Condition: You feel cursed and unlucky. All Critical Successes are instead Critical Failures.",
    },
    {
        roll: "11",
        name: "Suspicious",
        text: "For the next week, whenever someone joins the crew (even if they only left for a short period of time), make a Fear Save or gain 1 Stress.",
    },
    {
        roll: "12",
        name: "Haunted",
        text: "Gain a new Condition: Something starts visiting the character at night. In their dreams. Out of the corner of their eye. And soon it will start making demands.",
    },
    {
        roll: "13",
        name: "Death Wish",
        text: "For the next 24 hours, whenever encountering a stranger or known enemy, make a Sanity Save or immediately attack them.",
    },
    {
        roll: "14",
        name: "Prophetic Vision",
        text: "Character immediately experiences an intense hallucination or vision of an impending terror or horrific event. Increase Minimum Stress by 2.",
    },
    {
        roll: "15",
        name: "Catatonic",
        text: "Become unresponsive and unmoving for 2d10 minutes. Reduce Stress by 1d10.",
    },
    {
        roll: "16",
        name: "Rage",
        text: "[+] on all Damage rolls for the next 1d10 hours. All crewmembers gain 1 Stress.",
    },
    {
        roll: "17",
        name: "Spiraling",
        text: "Gain a new Condition: Panic Checks are at [-].",
    },
    {
        roll: "18",
        name: "Compounding Problems",
        text: "Roll twice on this table. Increase your Minimum Stress by 1.",
    },
    {
        roll: "19",
        name: "Heart Attack / Short Circuit (Androids)",
        text: "Reduce Maximum Wounds by 1. Gain [-] on all rolls for 1d10 hours. Increase Minimum Stress by 1.",
    },
    {
        roll: "20",
        name: "Retire",
        text: "Roll up a new character to play.",
    },
];
const HOME_RULES = [
    {
        name: "Defend",
        text: "Interrupt an enemy attack by forfeiting your current or future movement this round. Reduce enemy damage by 1d10.",
    },
    {
        name: "Aim",
        text: "Before rolling to hit. Forgo your movement to focus on your attack. Choose either to get [+] to hit or double your damage.",
    },
    {
        name: "Rest",
        text: "Spend time in a safe space to recover 1 stress and 1HP for every hour you spend there.",
    },
];

const ARTIST_CREDITS = [
    {
        name: "Tony Tran",
        description: "Cave art & cover art by Tony Tran (tonytranRPG) - licensed under CC BY 4.0",
        website: "https://tonytranrpg.com/",
    },
    {
        name: "balbcas",
        description: "Center tower card art",
        website: "https://www.instagram.com/balbcas/",
    },
    {
        name: "exemiin",
        description: "Portrait art",
        website: "https://x.com/exemiin",
    },
    {
        name: "Grimsloki",
        description: "Portrait art",
        website: "https://www.fiverr.com/grimsloki",
    },
    {
        name: "Eddie Dover",
        description: "Relationship roll table. See mothership-crew-relationships repo.",
        website: "https://github.com/EddieDover",
    },
    {
        name: "Mothership",
        description: "This product is based on Mothership® Sci-Fi Horror Role Playing Game, published by Tuesday Knight Games. This product is published under license. MOTHERSHIP ® is a registered trademark of Tuesday Knight Games. All rights reserved. For additional information, visit www.tuesdayknightgames.com or contact contact@tuesdayknightgames.com",
        website: "https://www.tuesdayknightgames.com",
    },
];

const HEX_INTRO_RESULT = {
    key: "intro",
    title: "Travel in Tehom",
    description: `Think of a destination to begin. Then ${isMobile ? "tap" : "click"} travel.`,
    Icon: null,
};
const HEX_RESULTS = [
    {
        key: "cursed",
        title: "Cursed",
        range: "0",
        Icon: HexCursed,
        description: "A hostile diseased area. Something demonic claims this place as its territory.",
    },
    {
        key: "archive",
        title: "Archive",
        range: "1-2",
        Icon: HexArchive,
        description: "A repository of knowledge and artifacts. Spellbooks from unknown tomes and unknown effects.",
    },
    {
        key: "haven",
        title: "Haven",
        range: "3-4",
        Icon: HexHaven,
        description: "A stable civilization living off the land. Welcome to outsiders, so long they obey the rules.",
    },
    {
        key: "ruin",
        title: "Ruin",
        range: "5-6",
        Icon: HexRuin,
        description: "Large abandonded structures from another age. Wires to some form of machinery, possibly for transit, or warfare?",
    },
    {
        key: "wild",
        title: "Wild",
        range: "7-8",
        Icon: HexWild,
        description: "A jungle of strange creatures and towering trees. The area is rich in resources.",
    },
    {
        key: "destination",
        title: "Destination",
        range: "9",
        Icon: HexDestination,
        description: "You've reached the goal destination",
    },
];


const SHOP_ITEMS_TIER_1 = [
    { name: "Corporate Attire", type: "armor", price: "50" },
    { name: "Lab Coat", type: "armor", price: "50" },
    { name: "Standard Crew Attire", type: "armor", price: "50" },

    { name: "Assorted Tools", type: "equipment", price: "20" },
    { name: "Audio Recorder", type: "equipment", price: "50" },
    { name: "Bear Trap", type: "equipment", price: "300" },
    { name: "Binoculars", type: "equipment", price: "100" },
    { name: "Bolt Cutters", type: "equipment", price: "80" },
    { name: "Camera", type: "equipment", price: "1200" },
    { name: "Camping Gear", type: "equipment", price: "80" },
    { name: "Cigarettes", type: "equipment", price: "20" },
    { name: "Compass", type: "equipment", price: "120" },
    { name: "Cookware", type: "equipment", price: "180" },
    { name: "Duct Tape", type: "equipment", price: "5" },
    { name: "Electronic Tool Set", type: "equipment", price: "100" },
    { name: "Extension Cord (20m)", type: "equipment", price: "12" },
    { name: "Filter Mask", type: "equipment", price: "5" },
    { name: "First Aid Kit", type: "equipment", price: "75" },
    { name: "Flare", type: "equipment", price: "85" },
    { name: "Geiger Counter", type: "equipment", price: "20" },
    { name: "Glue", type: "equipment", price: "25" },
    { name: "Grease", type: "equipment", price: "35" },
    { name: "Leash", type: "equipment", price: "10" },
    { name: "Lighter", type: "equipment", price: "15" },
    { name: "Lockbox", type: "equipment", price: "50" },
    { name: "Mylar Blanket", type: "equipment", price: "40" },
    { name: "Net", type: "equipment", price: "140" },
    { name: "Notebook", type: "equipment", price: "5" },
    { name: "Pliers", type: "equipment", price: "5" },
    { name: "Radiation Pills", type: "equipment", price: "40" },
    { name: "Rope and Piton", type: "equipment", price: "50" },
    { name: "Rucksack", type: "equipment", price: "10" },
    { name: "Sample Collection Kit", type: "equipment", price: "50" },
    { name: "Screwdriver", type: "equipment", price: "10" },
    { name: "Scripture", type: "equipment", price: "10" },
    { name: "Short-range Comms", type: "equipment", price: "100" },
    { name: "Spray Paint", type: "equipment", price: "20" },
    { name: "Steel Wire", type: "equipment", price: "40" },
    { name: "Tennis Ball", type: "equipment", price: "5" },
    { name: "Toolbelt", type: "equipment", price: "15" },
    { name: "Torch", type: "equipment", price: "5" },
    { name: "Watch", type: "equipment", price: "200" },
    { name: "Water Filtration Device", type: "equipment", price: "50" },
    { name: "Zip Ties", type: "equipment", price: "10" },

    { name: "Baseball Bat [1d5+3 Blunt]", type: "weapon", price: "150" },
    { name: "Box Cutter [1d5+1 Bleed]", type: "weapon", price: "80" },
    { name: "Crossbow [1d10+4 Bleed+, 3 shots, Close]", type: "weapon", price: "800" },
    { name: "Iron Knuckles [1d5+2 Blunt-]", type: "weapon", price: "100" },
    { name: "Shovel [1d5+1 Blunt]", type: "weapon", price: "100" },
    { name: "Steel Pipe [1d5+1 Blunt-]", type: "weapon", price: "40" },
    { name: "Wrench [1d5+1 Blunt-]", type: "weapon", price: "80" },
];

const SHOP_ITEMS_TIER_2 = [
    { name: "Fatigues", type: "armor", price: "300" },
    { name: "Heavy Duty Work Clothes", type: "armor", price: "300" },
    { name: "Vaccsuit", type: "armor", price: "1000" },

    { name: "Flashbang", type: "equipment", price: "800" },
    { name: "Flashlight", type: "equipment", price: "150" },
    { name: "Quality Prosthetic", type: "equipment", price: "4000" },
    { name: "Radio Scanner", type: "equipment", price: "900" },
    { name: "Suppressant Drugs", type: "equipment", price: "400" },
    { name: "UV light", type: "equipment", price: "80" },
    { name: "Walkie Talkie", type: "equipment", price: "200" },

    { name: "Beretta M9 [1d10+1 Gunshot, 15 shots, Close]", type: "weapon", price: "1000" },
    { name: "Breech-Loading Pistol [2d10+2 Gunshot, 2 shots, Close]", type: "weapon", price: "500" },
    { name: "Flamethrower [2d10 Fire & Explosives-, 4 shots, Close]", type: "weapon", price: "1200" },
    { name: "Hunting Rifle [2d10+3 Gunshot+, 3 shots, Long]", type: "weapon", price: "6000" },
    { name: "Ithaca Model 37 [2d10 Gunshot, 4 shots, Close]", type: "weapon", price: "2000" },
    { name: "Officer's Sword [1d10+4 Bleed+]", type: "weapon", price: "1000" },
    { name: "Revolver [1d10+1 Gunshot, 6 shots, Close]", type: "weapon", price: "750" },
];

function getHexResultFromRoll(roll) {
    if (roll === 0) return HEX_RESULTS[0];
    if (roll <= 2) return HEX_RESULTS[1];
    if (roll <= 4) return HEX_RESULTS[2];
    if (roll <= 6) return HEX_RESULTS[3];
    if (roll <= 8) return HEX_RESULTS[4];
    return HEX_RESULTS[5];
}

function getNextUnusedHexResult(currentResult, usedKeys) {
    const startIndex = HEX_RESULTS.findIndex((hex) => hex.key === currentResult.key);

    for (let i = 1; i < HEX_RESULTS.length; i += 1) {
        const nextIndex = (startIndex + i) % HEX_RESULTS.length;
        const nextResult = HEX_RESULTS[nextIndex];

        if (!usedKeys.includes(nextResult.key)) {
            return nextResult;
        }
    }

    return currentResult;
}


const MUSIC_LINKS = [
  {
    name: "Heliopolis / Character Creation",
    description: "Intro music",
    spotify: "https://open.spotify.com/playlist/4f3s6cgJq1XBTIx5SPCg0A",
  },
  {
    name: "Tower of Thoth / Duat / Tehom",
    description: "Midgame music",
    spotify: "https://open.spotify.com/playlist/4eYEpUBTtfrsELcmUCsO8c",
  },
  {
    name: "Sed Festival Palace",
    description: "Endgame music",
    spotify: "https://open.spotify.com/playlist/45IlcfYIdCzScYWonsohI8",
  },
];

const EVENT_PLACEHOLDERS = {
    Tehom: [
        "0 Angelic Elk: an elk with impossibly large antlers gracefully walks in the distance. If alerted will gallop away and fade from view. It's footsteps leave a fading glow.",
        "1 Geothermal Vent: just like a deep sea vent, strange lifeforms cluster around a hot pressurized steam vent. One translucent jellyfish like species launches itself high into the air from the vent. Revealing hundreds of other suspended jellyfish-like creatures hundreds of feet above. They all collectively sparkle against the darkness, creating a night sky effect.",
        "2 Stampede: The ground starts shaking and a stampede of large rhino-like creatures approach. They are too far to make out details, but the sound of their hooves and the dust cloud they kick up is deafening. Make a Body save or take 1d10 DMG.",
        "3 Parasite: Any who fails a Body save discovers a tick-like parasite burrowing into their leg. Can be removed safely with heat, otherwise 1d5 DMG to remove.",
        "4 Hidden Camp: A small camp hidden under a mossy hatch. Inside is a survivor who has been living off the land for months. They are wary of outsiders but may be willing to trade or share information about the area.",
    ],
    Duat: [
        "0 Ka Carving: A local artisan has a small wooden carving of figure with two arms on its head. Anyone with a relevant skill sees this as Ka, the ancient Egyptian concept of a person's life force or spirit. The artisan claims it will protect their soul and prevent transformation. He offers a trade for the carving.",
        "1 Fortune Teller: A coin operated mechanical fortune teller machine may someone's fortune. Regardless the machine says the character is cursed. At a later time in the session have the machine show up again unexpectedly. When they look away it, comes alive with mechanical limbs and tries to kill the cursed character [C:50 1d10 I:40 HITS: 1].",
        "2 Street Rat: A teenager is being chased by medjai guards. 'Stop...Thief!'. The teenager passes by the party, losing the guards. The guards ask the party which way the thief went. Later, if the party helped the thief they are invited to their hideout.",
        "3 Jackal Bones: A horse voice asks if the party wants to 'throw bones'. They explain it's a game of chance, marked lots work as a 1d10. Both players ante, then roll 1d10 in turn, adding to a shared total. Whoever pushes the total over 21 loses. Rolling 1 resets it, rolling 10 doesn't add to the total but instead makes the next player roll twice.",
        "4 Snake Dancer: A woman charms a snake by dancing. Those passing leave tips in a basket. After her performance, she offers to trade. An item for one of her small pets (snake, monkey, dog, cat)",
    ],
};


function rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

function rollD10Digit() {
    return Math.floor(Math.random() * 10);
}

function cx(...classes) {
    return classes.filter(Boolean).join(" ");
}

function useFadeSwap(initialValue = null, duration = 120) {
    const [value, setValue] = useState(initialValue);
    const [visible, setVisible] = useState(Boolean(initialValue));

    function swap(nextValue) {
        setVisible(false);

        window.setTimeout(() => {
            setValue(nextValue);
            setVisible(true);
        }, duration);
    }

    return {
        value,
        visible,
        swap,
        hasValue: value !== null && value !== "",
    };
}

function FadeText({ show, children }) {
    return (
        <div
            className={cx(
                "transition-opacity duration-150",
                show ? "opacity-100" : "opacity-0"
            )}
        >
            {children}
        </div>
    );
}

const SHOP_TIERS = {
    tier1: {
        label: "Tier 1",
        items: SHOP_ITEMS_TIER_1,
    },
    tier2: {
        label: "Tier 2",
        items: SHOP_ITEMS_TIER_2,
    },
};

const SHOP_TYPES = [
    { key: "armor", label: "Armor" },
    { key: "equipment", label: "Equipment" },
    { key: "weapon", label: "Weapons" },
];

function getShopItemsByType(items, type) {
    return items.filter((item) => item.type === type);
}

export default function App() {
    const relationshipResult = useFadeSwap(null);
    const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
    const [handAngle, setHandAngle] = useState(0);
    const [isHexModalOpen, setIsHexModalOpen] = useState(false);
    const [isPanicModalOpen, setIsPanicModalOpen] = useState(false);
    const [isWoundModalOpen, setIsWoundModalOpen] = useState(false);
    const [isDeathModalOpen, setIsDeathModalOpen] = useState(false);
    const [isMusicModalOpen, setIsMusicModalOpen] = useState(false);
    const [isShopModalOpen, setIsShopModalOpen] = useState(false);
    const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
    const eventResult = useFadeSwap("");
    const [eventIndexes, setEventIndexes] = useState({
        Tehom: 0,
        Duat: 0,
    });

    function rollRelationship() {
        const categoryRoll = String(rollDie(8));
        const relationshipRoll = String(rollD10Digit());

        relationshipResult.swap({
            category: RELATIONSHIPS.categories[categoryRoll],
            text: RELATIONSHIPS.results[categoryRoll][relationshipRoll],
            roll: `${categoryRoll}.${relationshipRoll}`,
        });
    }

    function pointHandsAt(event) {
        const x = event.clientX;
        const y = event.clientY;

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const radians = Math.atan2(y - centerY, x - centerX);
        const degrees = radians * (180 / Math.PI);

        // adjust to make finger point right
        const imageOffset = 95;

        setHandAngle(degrees + imageOffset);
    }

    function showHexCrawl() {
        setIsHexModalOpen(true);
    }
    function showHomebrewRules() {
        setIsRulesModalOpen(true);
    }
    function showPanicTable() {
        setIsPanicModalOpen(true);
    }
    function showWoundTable() {
        setIsWoundModalOpen(true);
    }
    function showDeathTable() {
        setIsDeathModalOpen(true);
    }
    function showShop() {
        setIsShopModalOpen(true);
    }
    function showCredit() {
        setIsCreditModalOpen(true);
    }
function showMusic() {
    setIsMusicModalOpen(true);
}

    function rollEvent(location) {
        const events = EVENT_PLACEHOLDERS[location];

        if (!events || events.length === 0) return;

        const currentIndex = eventIndexes[location];
        const nextEvent = events[currentIndex];

        eventResult.swap(nextEvent);

        setEventIndexes((current) => ({
            ...current,
            [location]: (current[location] + 1) % events.length,
        }));
    }

    return (
        <main className="relative min-h-dvh overflow-hidden bg-stone-950 bg-[url('/background.webp')] bg-repeat text-stone-100">
            <div className="fixed inset-0 bg-stone-950/70" />

            <div className="mobile-border pointer-events-none fixed inset-0 z-30" />

            <div className="pointer-events-none fixed z-40 left-1/2 top-1/2 z-20 w-40 max-w-[24vw] -translate-x-1/2 -translate-y-1/2 md:w-56">
                <img
                    src="/hands.webp"
                    alt=""
                    aria-hidden="true"
                    className="block h-auto w-full opacity-80 transition-transform duration-500 ease-out"
                    style={{
                        transform: `rotate(${handAngle}deg)`,
                        transformOrigin: "50% 50%",
                    }}
                />
            </div>

            <section className="relative z-10 grid min-h-dvh grid-cols-2 grid-rows-2 gap-8 border-stone-700/80 px-8 py-10 sm:px-6 sm:py-2 md:px-8 md:py-8">
                <Quadrant
                    eyebrow="01"
                    title="Random Relationship"
                    onFocus={pointHandsAt}
                >
                    <button type="button" onClick={rollRelationship} className="action-btn">
                        Random Relationship
                    </button>

                    <ResultBlock
                        className="relative items-start overflow-hidden"
                        childClass="relative z-10 min-w-0 w-full"
                    >
                        <RelationshipIcon
                            className="pointer-events-none absolute left-1/2 top-[100px] h-[102px] w-[102px] md:h-[202px] md:w-[202px] -translate-x-1/2 -translate-y-1/2 text-stone-700/15"
                            aria-hidden="true"
                        />

                        <FadeText show={relationshipResult.visible}>
                            {relationshipResult.hasValue ? (
                                <div className="min-w-0 w-[90%]">
                                    <p className="max-w-full break-words text-[0.7rem] font-black uppercase leading-4 tracking-[0.08em] text-amber-300/80 sm:text-xs sm:tracking-[0.18em] md:text-base">
                                        {relationshipResult.value.category}
                                    </p>

                                    <p className="mt-2 max-w-full break-words text-[0.95rem] font-bold leading-5 text-stone-100 sm:mt-3 sm:text-lg sm:leading-7 md:text-xl">
                                        {relationshipResult.value.text}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-[0.75rem] leading-5 text-stone-500 sm:text-sm">
                                    No relationship rolled yet.
                                </p>
                            )}
                        </FadeText>
                    </ResultBlock>
                </Quadrant>

                <Quadrant
                    eyebrow="02"
                    title="Hex Crawl"
                    align="right"
                    onFocus={pointHandsAt}
                >
                    <button type="button" onClick={showHexCrawl} className="action-btn">
                        Hex Crawl
                    </button>

                    <ResultBlock muted className="flex h-56 items-center justify-center relative grid w-full place-items-center text-stone-700">
                        <svg
                            viewBox="0 0 220 220"
                            className="absolute inset-0 h-full w-full"
                            role="img"
                        >
                            <polygon
                                points="110,12 194,61 194,159 110,208 26,159 26,61"
                                fill="none"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="6"
                            />

                            <polygon
                                points="110,34 175,72 175,148 110,186 45,148 45,72"
                                fill="currentColor"
                                opacity="0.1"
                            />
                        </svg>
                    </ResultBlock>
                </Quadrant>

                <Quadrant
                    eyebrow="03"
                    title="Homebrew Rules"
                    onFocus={pointHandsAt}
                >
                    <ResultBlock muted className="items-stretch" childClass="w-full">
                        <div className="grid w-full grid-cols-1 gap-2">
                            <button
                                type="button"
                                onClick={showPanicTable}
                                className="action-btn w-full"
                            >
                                Panic Table
                            </button>

                            <button
                                type="button"
                                onClick={showWoundTable}
                                className="action-btn w-full"
                            >
                                Wound Table
                            </button>

                            <button
                                type="button"
                                onClick={showDeathTable}
                                className="action-btn w-full"
                            >
                                Death Roll Table
                            </button>

                            <button
                                type="button"
                                onClick={showShop}
                                className="action-btn w-full"
                            >
                                Shop
                            </button>
                            <button
                                type="button"
                                onClick={showCredit}
                                className="action-btn w-full"
                            >
                                Credit
                            </button>
                            <button
                                type="button"
                                onClick={showMusic}
                                className="action-btn w-full"
                            >
                                Music
                            </button>
                        </div>
                    </ResultBlock>

                    <div>
                        <button
                            type="button"
                            onClick={showHomebrewRules}
                            className="action-btn w-full"
                        >
                            Homebrew Rules
                        </button>
                    </div>
                </Quadrant>

                <Quadrant
                    eyebrow="04"
                    align="right"

                    title="Random Events"
                    onFocus={pointHandsAt}
                >
                    <ResultBlock
                        className="relative items-start overflow-hidden"
                        childClass="relative z-10 min-w-0 w-full"

                    >
                        <DiceIcon
                            className="pointer-events-none absolute left-1/2 top-[100px] h-[102px] w-[102px] md:h-[202px] md:w-[202px] -translate-x-1/2 -translate-y-1/2 text-stone-700/20"
                            aria-hidden="true"
                        />

                        <FadeText show={eventResult.visible || !eventResult.hasValue}>
                            {eventResult.hasValue ? (
                                <p className="mt-4 max-w-full break-words text-[0.65rem] font-bold leading-4 text-stone-100 sm:mt-8 sm:text-base sm:leading-6 md:mt-14 md:text-xl md:leading-7">
                                    {eventResult.value}
                                </p>
                            ) : (
                                <p className="text-[0.75rem] leading-5 text-stone-500 sm:text-sm">

                                </p>
                            )}
                        </FadeText>
                    </ResultBlock>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={() => rollEvent("Tehom")}
                            className="action-btn"
                        >
                            Tehom
                        </button>

                        <button
                            type="button"
                            onClick={() => rollEvent("Duat")}
                            className="action-btn"
                        >
                            Duat
                        </button>
                    </div>
                </Quadrant>
            </section>

            {isHexModalOpen && (
                <HexCrawlModal onClose={() => setIsHexModalOpen(false)} />
            )}
            {isRulesModalOpen && (
                <HomebrewRulesModal onClose={() => setIsRulesModalOpen(false)} />
            )}
            {isPanicModalOpen && (
                <PanicTableModal onClose={() => setIsPanicModalOpen(false)} />
            )}
            {isWoundModalOpen && (
                <WoundTableModal onClose={() => setIsWoundModalOpen(false)} />
            )}
            {isDeathModalOpen && (
                <DeathTableModal onClose={() => setIsDeathModalOpen(false)} />
            )}
            {isShopModalOpen && (
                <ShopModal onClose={() => setIsShopModalOpen(false)} />
            )}
            {isCreditModalOpen && (
                <CreditModal onClose={() => setIsCreditModalOpen(false)} />
            )}
            {isMusicModalOpen && (
    <MusicModal onClose={() => setIsMusicModalOpen(false)} />
)}
        </main>
    );
}

function Quadrant({ eyebrow, title, children, onFocus, align = "left" }) {
    return (
        <article
            onPointerDown={onFocus}
            className="relative flex min-h-0 flex-col justify-center border border-stone-800 bg-stone-950/90 p-0 shadow-[0_8px_30px_rgba(0,0,0,0.35)] sm:p-5 md:p-4"
        >

            {/* <div className="flex flex-1 flex-col">{children}</div> */}
            <div className="flex min-h-0 flex-1 flex-col justify-center gap-2 sm:gap-3">
                {children}
            </div>
        </article>
    );
}

function ResultBlock({ children, muted = false, className = "", childClass = "" }) {
    return (
        <div
            className={cx(
                "flex min-h-0 flex-1 items-center border border-stone-800 bg-black/35 p-2 text-sm leading-5 sm:p-4 sm:leading-6",
                muted && "text-stone-500",
                className
            )}
        >
            <div className={`${childClass}`}>{children}</div>
        </div>
    );
}

function HexProgressRow({ usedKeys, onReset, showRules }) {
    if (showRules) return null
    return (
        <div className="mb-4 flex items-stretch gap-2 border border-stone-800 bg-black/30 p-0 md:p-2">
            <div className="grid flex-1 grid-cols-6 gap-2">
                {HEX_RESULTS.map((hex) => {
                    const Icon = hex.Icon;
                    const hasRolled = usedKeys.includes(hex.key);

                    return (
                        <div
                            key={hex.key}
                            className="relative flex aspect-square items-center justify-center border border-stone-800 bg-stone-950/80"
                            title={hex.title}
                        >
                            <Icon
                                className={cx(
                                    "h-7 w-7 text-amber-200 transition-opacity sm:h-9 sm:w-9",
                                    hasRolled ? "opacity-25" : "opacity-90"
                                )}
                            />

                            {hasRolled && (
                                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-black leading-none text-red-500 sm:text-3xl">
                                        ×
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={onReset}
                className="self-stretch border border-stone-700 bg-stone-900 px-3 text-[0.6rem] font-black uppercase tracking-[0.18em] text-stone-100 transition hover:border-amber-300 hover:text-amber-200 cursor-pointer"
            >
                Reset
            </button>
        </div>
    );
}

function CreditModal({ onClose }) {
    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-0 md:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="credit-title"
            onMouseDown={onClose}
        >
            <section
                className="flex h-[640px] max-h-[90dvh] w-full max-w-2xl flex-col border border-amber-400/50 bg-stone-950 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.65)] sm:p-6"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="border-b border-stone-800 pb-4">

                    <h2
                        id="credit-title"
                        className="mt-1 text-2xl font-black uppercase tracking-tight text-stone-50"
                    >
                        Credit
                    </h2>
                </div>

                <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
                    <div className="grid gap-3">
                        {ARTIST_CREDITS.map((artist) => (
                            <article
                                key={artist.name}
                                className="border border-stone-800 bg-black/30 p-4"
                            >
                                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-stone-100">
                                    {artist.name}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-stone-300">
                                    {artist.description}
                                </p>

                                <a
                                    href={artist.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-3 inline-block text-xs font-black uppercase tracking-[0.2em] text-amber-300/80 underline decoration-amber-300/30 underline-offset-4 transition hover:text-amber-200"
                                >
                                    Website
                                </a>
                            </article>
                        ))}
                    </div>
                </div>

                <img src="/human.png" className="opacity-[0.1] h-[43px] w-[99px]" style={{margin: "6px auto 0 auto"}} />
            </section>
        </div>
    );
}

function MusicModal({ onClose }) {
    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-0 md:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="music-title"
            onMouseDown={onClose}
        >
            <section
                className="flex h-[560px] max-h-[90dvh] w-full max-w-2xl flex-col border border-amber-400/50 bg-stone-950 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.65)] sm:p-6"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="border-b border-stone-800 pb-4">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-amber-300/70">
                        Background Playlists
                    </p>

                    <h2
                        id="music-title"
                        className="mt-1 text-2xl font-black uppercase tracking-tight text-stone-50"
                    >
                        Music
                    </h2>
                </div>

                <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
                    <div className="grid gap-3">
                        {MUSIC_LINKS.map((playlist) => (
                            <article
                                key={playlist.name}
                                className="border border-stone-800 bg-black/30 p-4"
                            >
                                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-stone-100">
                                    {playlist.name}
                                </h3>

                                {/* <p className="mt-2 text-sm leading-6 text-stone-300">
                                    {playlist.description}
                                </p> */}

                                <div className="mt-4 grid grid-cols-1 gap-2">
                                    <a
                                        href={playlist.spotify}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="border border-stone-700 bg-stone-900 px-3 py-3 text-center text-xs font-black uppercase tracking-[0.16em] text-stone-100 transition hover:border-amber-300 hover:text-amber-200"
                                    >
                                        Spotify
                                    </a>

                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function HexCrawlModal({ onClose }) {
    const [result, setResult] = useState(HEX_INTRO_RESULT);
    const [usedKeys, setUsedKeys] = useState([]);
    const [showRules, setShowRules] = useState(false);
    const [isAtDestination, setIsAtDestination] = useState(false);

    function rollHex() {
        let roll = rollD10Digit();

        // If 9 is rolled on the first roll, reroll.
        while (usedKeys.length === 0 && roll === 9) {
            roll = rollD10Digit();
        }

        let nextResult = getHexResultFromRoll(roll);

        // If ever rolling a repeat, go down the table picking the next new result.
        if (usedKeys.includes(nextResult.key)) {
            nextResult = getNextUnusedHexResult(nextResult, usedKeys);
        }

        setResult(nextResult);
        setIsAtDestination(nextResult.key === "destination");

        const nextUsedKeys = usedKeys.includes(nextResult.key)
            ? usedKeys
            : [...usedKeys, nextResult.key];

        // Destination starts a fresh tracker
        if (nextResult.key === "destination") {
            setUsedKeys([]);
        } else {
            setUsedKeys(nextUsedKeys);
        }
    }
    function resetHexCrawl() {
        setResult(HEX_INTRO_RESULT);
        setUsedKeys([]);
        setShowRules(false);
        setIsAtDestination(false);
    }
    function resetHexProgressOnly() {
        setUsedKeys([]);
    }

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-0 md:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="hex-crawl-title"
            onMouseDown={onClose}
        >
            <section
                className="flex w-full max-w-xl flex-col border border-amber-400/50 bg-stone-950 p-3 shadow-[0_20px_80px_rgba(0,0,0,0.65)] md:p-5"
                onMouseDown={(event) => event.stopPropagation()}
            >


                <div className="mt-5 flex min-h-0 flex-1 flex-col">
                    <HexProgressRow usedKeys={usedKeys} onReset={resetHexCrawl} showRules={showRules} />

                    {!showRules ? (
                        <div className="flex min-h-0 flex-1 flex-col space-y-4">
                            <div className="min-h-0 flex-1 overflow-hidden border border-stone-800 bg-black/35">
                                <div className="flex h-56 items-center justify-center bg-black/40">
                                    <div className="relative grid h-36 w-36 place-items-center text-stone-700">
                                        <svg
                                            viewBox="0 0 220 220"
                                            className="absolute inset-0 h-full w-full"
                                            role="img"
                                            aria-label={result ? result.title : "No hex rolled"}
                                        >
                                            <polygon
                                                points="110,12 194,61 194,159 110,208 26,159 26,61"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="6"
                                            />

                                            <polygon
                                                points="110,34 175,72 175,148 110,186 45,148 45,72"
                                                fill="currentColor"
                                                opacity="0.08"
                                            />
                                        </svg>

                                        {result?.Icon && (
                                            <result.Icon className="relative z-10 h-20 w-20 text-amber-200" />
                                        )}
                                    </div>
                                </div>

                                <div className="h-28 p-4">
                                    <h3 className="mt-1 text-xl font-black uppercase text-stone-50">
                                        {result ? result.title : ""}
                                    </h3>

                                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-300">
                                        {result ? result.description : ""}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={isAtDestination ? resetHexCrawl : rollHex}
                                className="action-btn action-btn-modal w-full"
                            >
                                {isAtDestination ? "Reset" : "Travel"}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 text-sm leading-6 text-stone-300">
                            <div className="border border-stone-800 bg-black/30 p-4">
                                <h3 className="text-sm font-black uppercase tracking-[0.22em] text-amber-300/80">
                                    Odds 1d10
                                </h3>

                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                                    {HEX_RESULTS.map((hex) => (
                                        <div
                                            key={hex.key}
                                            className="border border-stone-800 bg-stone-950/80 p-3"
                                        >
                                            <p className="font-black uppercase tracking-[0.01em] text-stone-500 sm:tracking-[0.1em]">
                                                {hex.range} <span className="text-stone-100 tracking-[0.01em] md:tracking-[0.1em]">{hex.title}</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border border-stone-800 bg-black/30 p-4">
                                <h3 className="text-sm font-black uppercase tracking-[0.22em] text-amber-300/80">
                                    Rules
                                </h3>

                                <ol className="mt-3 list-decimal space-y-2 pl-5">
                                    <li>
                                        If ever rolling a repeat, go down on the table,
                                        picking the next new result.
                                    </li>
                                    <li>
                                        If 9 is rolled on the first roll, reroll.
                                    </li>
                                </ol>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setShowRules((current) => !current)}
                    className="mt-5 w-full border border-stone-700 bg-stone-900 px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-stone-100 transition hover:border-amber-300 hover:text-amber-200 cursor-pointer"
                >
                    {showRules ? "Hide Rules" : "Show Rules"}
                </button>
            </section>
        </div>
    );
}

function PanicTableModal({ onClose }) {
    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-0 md:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="panic-table-title"
            onMouseDown={onClose}
        >
            <section
                className="flex h-[760px] max-h-[90dvh] w-full max-w-3xl flex-col border border-amber-400/50 bg-stone-950 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.65)] sm:p-6"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="border-b border-stone-800 pb-4">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-amber-300/70">
                        Base Rules Reference
                    </p>

                    <h2
                        id="panic-table-title"
                        className="mt-1 text-2xl font-black uppercase tracking-tight text-stone-50"
                    >
                        Panic Table
                    </h2>
                </div>

                <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
                    <div className="grid gap-2">
                        {PANIC_TABLE.map((entry) => (
                            <article
                                key={entry.roll}
                                className="grid grid-cols-[3rem_1fr] gap-3 border border-stone-800 bg-black/30 p-3"
                            >
                                <div className="flex h-10 w-10 items-center justify-center border border-stone-700 bg-stone-900 text-sm font-black text-amber-300">
                                    {entry.roll}
                                </div>

                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-[0.18em] text-stone-100">
                                        {entry.name}
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-stone-300">
                                        {entry.text}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function HomebrewRulesModal({ onClose }) {
    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-0 md:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="homebrew-rules-title"
            onMouseDown={onClose}
        >
            <section
                className="w-full max-w-xl border border-amber-400/50 bg-stone-950 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.65)] sm:p-6"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="border-b border-stone-800 pb-4">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-amber-300/70">
                        Rules I like in my games
                    </p>

                    <h2
                        id="homebrew-rules-title"
                        className="mt-1 text-2xl font-black uppercase tracking-tight text-stone-50"
                    >
                        Homebrew Rules
                    </h2>
                </div>

                <div className="mt-5 space-y-3">
                    {HOME_RULES.map((rule) => (
                        <article
                            key={rule.name}
                            className="border border-stone-800 bg-black/30 p-4"
                        >
                            <h3 className="text-sm font-black uppercase tracking-[0.22em] text-amber-300/80">
                                {rule.name}
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-stone-300">
                                {rule.text}
                            </p>
                        </article>
                    ))}
                </div>

                {/* <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 w-full border border-stone-700 bg-stone-900 px-4 py-3 text-sm font-black uppercase tracking-[0.2em] text-stone-100 transition hover:border-amber-300 hover:text-amber-200"
                >
                    Close
                </button>  */}
            </section>
        </div>
    );
}

function DeathTableModal({ onClose }) {
    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-0 md:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="death-table-title"
            onMouseDown={onClose}
        >
            <section
                className="flex h-[520px] max-h-[90dvh] w-full max-w-2xl flex-col border border-amber-400/50 bg-stone-950 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.65)] sm:p-6"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="border-b border-stone-800 pb-4">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-amber-300/70">
                        Base Rules Reference
                    </p>

                    <h2
                        id="death-table-title"
                        className="mt-1 text-2xl font-black uppercase tracking-tight text-stone-50"
                    >
                        Death Table
                    </h2>
                </div>

                <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
                    <div className="grid gap-2">
                        {DEATH_TABLE.map((entry) => (
                            <article
                                key={entry.roll}
                                className="grid grid-cols-[4rem_1fr] gap-3 border border-stone-800 bg-black/30 p-3"
                            >
                                <div className="flex h-10 w-14 items-center justify-center border border-stone-700 bg-stone-900 text-sm font-black text-amber-300">
                                    {entry.roll}
                                </div>

                                <p className="text-sm leading-6 text-stone-300">
                                    {entry.result}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function ShopModal({ onClose }) {
    const [selectedTier, setSelectedTier] = useState("tier1");

    const currentShop = SHOP_TIERS[selectedTier];
    const currentItems = currentShop.items;

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-0 md:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shop-title"
            onMouseDown={onClose}
        >
            <section
                className="flex h-[760px] max-h-[90dvh] w-full max-w-3xl flex-col border border-amber-400/50 bg-stone-950 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.65)] sm:p-6"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="border-b border-stone-800 pb-4">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-amber-300/70">
                        Duat Market
                    </p>
                    <h2
                        id="shop-title"
                        className="mt-1 text-2xl font-black uppercase tracking-tight text-stone-50"
                    >
                        Shop
                    </h2>
                </div>

                <div className="mt-5">

                    <select
                        id="shop-tier"
                        value={selectedTier}
                        onChange={(event) => setSelectedTier(event.target.value)}
                        className="mt-2 w-full border border-stone-700 bg-stone-900 px-3 py-3 text-sm font-bold uppercase tracking-[0.12em] text-stone-100 outline-none focus:border-amber-300"
                    >
                        {Object.entries(SHOP_TIERS).map(([tierKey, tier]) => (
                            <option key={tierKey} value={tierKey}>
                                {tier.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
                    <div className="grid gap-4">
                        {SHOP_TYPES.map((type) => {
                            const itemsForType = getShopItemsByType(currentItems, type.key);

                            if (itemsForType.length === 0) return null;

                            return (
                                <section
                                    key={type.key}
                                    className="border border-stone-800 bg-black/30"
                                >
                                    <div className="border-b border-stone-800 bg-stone-950/80 px-3 py-2">
                                        <h3 className="text-sm font-black uppercase tracking-[0.22em] text-amber-300/80">
                                            {type.label}
                                        </h3>
                                    </div>

                                    <div className="divide-y divide-stone-800">
                                        {itemsForType.map((item) => (
                                            <div
                                                key={`${item.type}-${item.name}`}
                                                className="grid grid-cols-[1fr_auto] gap-3 px-3 py-3"
                                            >
                                                <p className="text-sm font-bold text-stone-100">
                                                    {item.name}
                                                </p>

                                                <p className="text-sm font-black text-stone-300">
                                                    ${item.price}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}

function WoundTableModal({ onClose }) {
    const [selectedType, setSelectedType] = useState("blunt");

    const selectedTypeLabel =
        WOUND_TYPES.find((type) => type.key === selectedType)?.label ?? "Blunt Force";

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-0 md:p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="wound-table-title"
            onMouseDown={onClose}
        >
            <section
                className="flex h-[760px] max-h-[90dvh] w-full max-w-3xl flex-col border border-amber-400/50 bg-stone-950 p-5 shadow-[0_20px_80px_rgba(0,0,0,0.65)] sm:p-6"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="border-b border-stone-800 pb-4">
                    <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-amber-300/70">
                        Base Rules Reference
                    </p>

                    <h2
                        id="wound-table-title"
                        className="mt-1 text-2xl font-black uppercase tracking-tight text-stone-50"
                    >
                        Wound Table
                    </h2>
                </div>

                <div className="mt-5">
                    <label
                        htmlFor="wound-type"
                        className="text-[0.65rem] font-black uppercase tracking-[0.24em] text-stone-500"
                    >
                        Type
                    </label>

                    <select
                        id="wound-type"
                        value={selectedType}
                        onChange={(event) => setSelectedType(event.target.value)}
                        className="mt-2 w-full border border-stone-700 bg-stone-900 px-3 py-3 text-sm font-bold uppercase tracking-[0.12em] text-stone-100 outline-none focus:border-amber-300"
                    >
                        {WOUND_TYPES.map((type) => (
                            <option key={type.key} value={type.key}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">


                    <div className="grid gap-2">
                        {WOUND_TABLE.map((entry) => (
                            <article
                                key={entry.roll}
                                className="grid grid-cols-[3rem_1fr] gap-3 border border-stone-800 bg-black/30 p-3"
                            >
                                <div className="flex h-10 w-10 items-center justify-center border border-stone-700 bg-stone-900 text-sm font-black text-amber-300">
                                    {entry.roll}
                                </div>

                                <div>
                                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                        <h3 className="text-sm font-black uppercase tracking-[0.18em] text-stone-100">
                                            {entry.severity}
                                        </h3>
                                    </div>

                                    <p className="mt-1 text-sm leading-6 text-stone-300">
                                        {entry[selectedType]}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}