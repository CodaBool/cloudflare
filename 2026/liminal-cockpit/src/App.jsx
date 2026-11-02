import { useState } from "react"

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
}

const BACKGROUNDS = {
  Strength: [
    {
      title: "Factory Worker",
      details: "Items: Industrial apron (+1 Armor), safety harness, thermos",
      source: "investigator",
    },
    {
      title: "Mechanic",
      details:
        "Items: Adjustable wrench (d6), portable toolbox, electrical tape, brake cleaner",
      source: "investigator",
    },
    {
      title: "Garbage Collector",
      details:
        "Items: Cut resistant gloves (+1 Armor), hi-vis vest, reach extender, safety glasses",
      source: "investigator",
    },
    {
      title: "Athlete",
      details:
        "Items: Equipment from sport of choice, sweatband, powdered sports drink",
      source: "investigator",
    },
    {
      title: "Volunteer Firefighter",
      details:
        "Items: Collapsible ladder (bulky), axe (d6), fire extinguisher, flashlight",
      source: "investigator",
    },
    {
      title: "Bicycle Courier",
      details:
        "Items: Bike, helmet (+1 Armor), messenger bag, unopened package, multitool",
      source: "investigator",
    },
    {
      title: "Contractor",
      details:
        "Items: Stocked toolbelt, utility knife (d6), heavy duty flashlight, drill",
      source: "investigator",
    },
    {
      title: "Sleeper Agent",
      details:
        "Description: Your boring normal life changed when the phone rang. You don't quite remember what was said, just that everything has been different since.",
      source: "The Bureau 3",
    },
    {
      title: "Coldwater Lake Survivor",
      details:
        "Description: The Bureau tried to sweep it all under the rug, but you were there, and you know what you saw. They have to tell you the truth. Items: Hunting rifle (d8, bulky), reflective vest",
      source: "The Bureau 10",
    },
    {
      title: "Porter",
      details:
        "Description: The delivery address lacks a formal name, but management was adamant you collect a signature for this package. Items: Unusually heavy package (bulky), fold-up dolly, electronic signature pad",
      source: "The Bureau 22",
    },
    {
      title: "Lunch Buddy",
      details:
        "Description: Every weekday for the last two years you've met at exactly 11:30 at the corner cafe. Two days have passed with no word. Items: Takeout for two, handwritten note, flowers",
      source: "The Bureau 23",
    },
    {
      title: "Union Steward",
      details:
        "Description: Public employees have a right to fair representation, but efforts to organize here have been DOA. Maybe they just don't know their rights. Items: Box of baked goods, Know Your Rights pamphlets, a stack of business cards",
      source: "The Bureau 24",
    },
    {
      title: "Daredevil",
      details:
        "Description: You're green but you're on track to go pro. Items: Chosen wheeled ride, anti-collision shirt (+1 armor), full face helmet (+1 armor when wearing), action camera",
      source: "The Bloom 14",
    },
  ],
  Dexterity: [
    {
      title: "Bus Driver",
      details:
        "Items: Lunchbox, comprehensive road map, taser (d6, non-lethal)",
      source: "investigator",
    },
    {
      title: "Store Clerk",
      details:
        "Items: Box cutter (d6), walkie talkies, name tag, incredibly comfortable shoes",
      source: "investigator",
    },
    {
      title: "Skater",
      details: "Items: Skateboard, video camera, bolt cutters",
      source: "investigator",
    },
    {
      title: "Administrative Assistant",
      details:
        "Items: Extensive contacts, corporate credit card, expandable briefcase, taser (d6, non-lethal)",
      source: "investigator",
    },
    {
      title: "Teacher",
      details: "Items: Coffee mug, scissors, large bag",
      source: "investigator",
    },
    {
      title: "Finally Found You",
      details:
        "Description: You've spent years searching for answers. But this is it, you know they're here. Items: Leather jacket (1 armor), old photograph, service revolver (d6)",
      source: "The Bureau 1",
    },
    {
      title: "Federal Bureaucracy",
      details:
        "Description: The roadblocks have been infuriating, but you've at least managed to track the budget discrepancy to this building. Items: Briefcase, tailored suit",
      source: "The Bureau 2",
    },
    {
      title: "Unpaid Intern",
      details:
        "Description: After a grueling interview process, you've been offered the opportunity of a lifetime. Today is your first day, please report to the Head of Research for orientation. Items: Caffeine patch (recover DEX), laptop, messenger bag",
      source: "The Bureau 4",
    },
    {
      title: "Promotion",
      details:
        "Description: After months of work, the Astral Terrorists are behind bars. For your hard work, you've finally been offered that cushy office job. Items: Service pistol (d6), Resonant Artifact",
      source: "The Bureau 5",
    },
    {
      title: "Investigative Journalism",
      details:
        "Description: This is the big one. Your Pulitzer potential magnum opus. In the war to uncover the Truth, the next battle is in this building. Items: Mini shotgun mic, LED light, smartphone tripod",
      source: "The Bureau 11",
    },
    {
      title: "Work Order",
      details:
        "Description: This work order has been passed around the firm all month. You should be able to wrap up with enough time to read your book. Items: Flashlight, tool belt (bulky), faded paperback",
      source: "The Bureau 13",
    },
    {
      title: "Interim Employment",
      details:
        "Description: This placement needs to have long term potential. You're tired of being new. If you go above and beyond this time, maybe you'll finally get to use that engineering degree. Items: Custom Name Plate (d6), lunchbox, resume",
      source: "The Bureau 14",
    },
    {
      title: "Human Capital",
      details:
        "Description: Bureau field work is dangerous, but you're there to stitch the agents back up. A quick stop back at the office to resupply, then it's back on assignment. Items: Medkit, stethoscope, trauma shears (d6), gloves",
      source: "The Bureau 19",
    },
    {
      title: "Development Coordinator",
      details:
        "Description: You're all ready to deliver the first of four professional development sessions on 'Implementing Synergy To Optimize Work-Flow'. Items: Laser pointer, laptop (with PowerPoint), hard-shell case full of handouts (d6)",
      source: "The Bureau 21",
    },
    {
      title: "Writers Retreat",
      details:
        "Description: It's been far too long since you put anything on your editor's desk. Maybe some fresh air and time away from the bustling city will get the creative juices flowing. Items: E-paper tablet, whittlin' jackknife (d6), bottle of liquor",
      source: "The Bloom 5",
    },
    {
      title: "Musician",
      details:
        "Description: The whole 'solo career' hasn't really been working out as planned. This next gig at the 'Blueberry Festival' is just one of a long line of crummy shows with meager pay. Items: Instrument of choice, vintage dynamic microphone, portable amp",
      source: "The Bloom 6",
    },
    {
      title: "Vet",
      details:
        "Description: Coldwater doesnʼt have a veterinary office, but when a farm animal gets sick, they call you. This time, it's the wildlife that has been acting strange, and folks are getting concerned. Items: Scalpel (d6), forceps, bottle of disinfectant, surgical clamps",
      source: "The Bloom 9",
    },
    {
      title: "Lab Technician",
      details:
        "Description: This area has some fascinating species of fungi. And, unfortunately, some destructive ones. The farmers have been complaining about lower yields, so a blight might be cropping up. Items: Pocket microscope, small sampling kit, tree corer (d6)",
      source: "The Bloom 10",
    },
    {
      title: "Fraud Auditor",
      details:
        "Description: Your company has been buried processing the stack of insurance claims that have come out of this region over the past year. The vagueness in the reports has triggered an in-person audit. Items: Insurance claims, pepper spray (d6, non-lethal), digital camera",
      source: "The Bloom 16",
    },
    {
      title: "Engineer",
      details:
        "Items: Laptop w/ design software, waterproof field notebook, wireless router, seldom used PPE",
      source: "investigator",
    },
    {
      title: "Journalist",
      details:
        "Description: While the local regions are your passion, working this beat hasn't resulted in a noteworthy column in years. Hopefully the Blueberry Fest is buzzworthy enough to keep you employed for a bit longer. Items: Voice recorder, digital camera, notebook, taser (d6, targets DEX)",
      source: "The Bloom 11",
    },
  ],
  Control: [
    {
      title: "Emergency Medical Technician (EMT)",
      details: "Items: Medkit, trauma shears, stethoscope, WAG bag",
      source: "investigator",
    },
    {
      title: "Artist",
      details:
        "Items: Artistic tool of choice, notebook, camera, small but passionate fan base",
      source: "investigator",
    },
    {
      title: "Keyboard Warrior",
      details:
        "Items: Laptop w/ bag, online following, fake credentials, energy drinks",
      source: "investigator",
    },
    {
      title: "Bartender",
      details:
        "Items: Barknife (d6), bottle of liquor, cigarettes, confiscated fake IDs",
      source: "investigator",
    },
    {
      title: "Therapist",
      details:
        "Items: Memo recorder, notebook and pen, business cards, small revolver (d6)",
      source: "investigator",
    },
    {
      title: "Actor",
      details:
        "Items: Audition binder, portable charging brick, spare cosmetic supplies, change of clothes",
      source: "investigator",
    },
    {
      title: "Social Worker",
      details:
        "Items: Laptop w/ bag, ID badge, pocket knife (d6), notebook and pen",
      source: "investigator",
    },
    {
      title: "Company-Man",
      details:
        "Description: You specialize in Asset Recovery for the Company. The Monolith was a hard nut to crack, but you have an in. Leave no trace of your deeds. Items: Compact toolkit, handheld PC, false Bureau ID",
      source: "The Bureau 8",
    },
    {
      title: "Writer's Block",
      details:
        "Description: That manuscript was your ticket back on the bestseller list, but it was confiscated by the Bureau before you could make a second copy. Items: Heavy flashlight, snub revolver (d6), thermos",
      source: "The Bureau 9",
    },
    {
      title: "Ghost Hunter",
      details:
        "Description: Ever since your show was canceled, you've been trying to go legit. They haven't returned your calls, but there's no harm in showing up in person. Items: Spirit box, thermal camera, EVP wrist recorder",
      source: "The Bureau 12",
    },
    {
      title: "Compliance Officer",
      details:
        "Description: Records show that Bureau has missed the last 51 annual safety inspections. This oversight simple cannot stand. Items: Inspection form, flashlight (d6), all-in-one measurement/testing tool",
      source: "The Bureau 15",
    },
    {
      title: "Astral Activist",
      details:
        "Description: Artifacts should be used for the benefit of mankind, and yet, the Bureau just sequesters them away. It's time to give power back to the people. Items: Decoy face mask, spray paint, ghost gun (d6)",
      source: "The Bureau 18",
    },
    {
      title: "True Crime",
      details:
        "Description: Everyone with a microphone has a podcast these days, and your metrics have taken a dive. The mystery surrounding Coldwater has been floating around the back channels, but you're just the person to get to the truth of the matter. Items: Mini shotgun mic, smartphone tripod, LED light",
      source: "The Bloom 1",
    },
    {
      title: "Gone Squatchin'",
      details:
        "Description: An expert in your field, you've been chasing the elusive Sasquatch for years, looking for proof that'll finally convince the public. All of the evidence points here. Items: Thermal camera, bear mace (d4 blast, non-lethal), ghillie suit",
      source: "The Bloom 3",
    },
    {
      title: "Amatuer Horror Film Director",
      details:
        "Description: You've sold a script for 'the next great slasher', but the studio wants a filming location locked down before the next meeting or the film will be tabled. On paper, this is perfect considering your shoe-string budget. Items: 360 degree camera & pole, script, light meter, stack of blank rental agreements",
      source: "The Bloom 12",
    },
    {
      title: "Graduate Student Researcher",
      details:
        "Description: While the passion is still there, the field research for your master's thesis has been frustrating. Hopefully this area will be the final stop. Items: Laptop, binder full of research, letter of introduction",
      source: "The Bloom 15",
    },
    {
      title: "Retiree",
      details:
        "Description: After decades of stressful work, you've finally retired. A few years early at that! This area seems like it's going to be a great place to settle into. Items: local property, collapsible hiking pole (d6), novel",
      source: "The Bloom 18",
    },
  ],
}

const SIMPLE_TRAITS = {
  aesthetics: [
    "All Business, All the Time.",
    "Oversized Hoodie",
    "Streetwear",
    "Island Floral",
    "Band Tees Personality",
    "Everything Tailored",
    "Paint it Black",
    "Function Over Fashion",
    "Athleisure",
    "Cargo Pockets",
    "Crisp and Ironed",
    "Jeans and Tees",
    "Casual Comfort",
    "Trapped in 2009",
    "Authentic Vintage",
    "Grunge Minimalist",
    "All the Rage",
    "Y2K",
    "Work Uniform",
    "Denim on Denim",
  ],
  encounter: [
    "Lost a loved one under mysterious circumstances",
    "The evidence online is too much to be ignored.",
    "You witnessed something in the darkness.",
    "You survived an attack you cannot explain.",
    "Something is lurking in your dreams.",
    "Someone close to you is pulling you in, or pushing you away.",
    "Cult activity (perhaps they recruited someone significant).",
    "You may be a card carrying member in a secret society.",
    "You read something not meant for mortal minds.",
    "You haven’t yet",
  ],
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
  flaw: [
    "Quick to anger",
    "Lazy",
    "Pessimistic",
    "Nervous",
    "Coward",
    "Rude",
    "Deceitful",
    "Vain",
    "Greedy",
    "Vengeful",
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
  npcs: [
    "Family Member",
    "Online Associate",
    "Current Romantic Partner",
    "Former Romantic Partner",
    "Good Friend",
    "Casual Acquaintance",
    "Mentor",
    "Co-Worker",
    "Boss",
    "Bitter Rival",
  ],
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

function rollD10Digit() {
  return Math.floor(Math.random() * 10)
}

function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function getNRandomItems(array, n) {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, n)
}

function useFadeSwap(initialValue = null, duration = 120) {
  const [value, setValue] = useState(initialValue)
  const [visible, setVisible] = useState(Boolean(initialValue))

  function swap(nextValue) {
    setVisible(false)
    window.setTimeout(() => {
      setValue(nextValue)
      setVisible(true)
    }, duration)
  }

  return {
    value,
    visible,
    swap,
    hasValue: value !== null && value !== "",
  }
}

function FadeText({ show, children }) {
  return (
    <div
      className={cx(
        "transition-opacity duration-150",
        show ? "opacity-100" : "opacity-0",
      )}
    >
      {children}
    </div>
  )
}

// Reusable Modal Component
function SelectionModal({ title, options, onSelect, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <section
        className="flex max-h-[90dvh] w-full max-w-lg flex-col border border-stone-800 bg-stone-950 p-6 shadow-2xl"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="border-b border-stone-800 pb-4 mb-4">
          <h2 className="text-xl font-black uppercase tracking-widest text-stone-100">
            {title}
          </h2>
        </div>
        <div className="overflow-y-auto grid grid-cols-1 gap-2">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => {
                onSelect(opt.id)
              }}
              className="border border-stone-800 bg-black/40 px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-stone-300 transition hover:border-amber-400 hover:text-amber-300"
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function App() {
  const relationshipResult = useFadeSwap(null)
  const backgroundResult = useFadeSwap(null)
  const traitsResult = useFadeSwap(null)
  const storyResult = useFadeSwap(null)

  const [activeModal, setActiveModal] = useState(null) // 'relationship' | 'background' | 'backgroundResults' | 'traits' | 'story' | null

  function handleSelectRelationship(categoryId) {
    const relationshipRoll = String(rollD10Digit())
    relationshipResult.swap({
      category: `${categoryId}. ${RELATIONSHIPS.categories[categoryId]}`,
      text: `[Roll: ${relationshipRoll}] ${RELATIONSHIPS.results[categoryId][relationshipRoll]}`,
    })
    setActiveModal(null)
  }

  function handleSelectBackground(stat) {
    const bgList = BACKGROUNDS[stat]
    const rolledBgs = getNRandomItems(bgList, 4)

    backgroundResult.swap({
      stat: stat,
      options: rolledBgs,
    })
    setActiveModal("backgroundResults")
  }

  function handleSelectTrait(traitId) {
    const label = traitOptions.find(t => t.id === traitId).label
    const resultText = getRandomItem(SIMPLE_TRAITS[traitId])

    traitsResult.swap({
      category: label,
      text: resultText,
    })
    setActiveModal(null)
  }

  function handleSelectStory(storyId) {
    const label = storyOptions.find(s => s.id === storyId).label
    let resultText = ""

    if (storyId === "npcs") {
      const rolledNPCs = getNRandomItems(SIMPLE_TRAITS.npcs, 2)
      resultText = `1. ${rolledNPCs[0]} \n2. ${rolledNPCs[1]}`
    } else {
      resultText = getRandomItem(SIMPLE_TRAITS[storyId])
    }

    storyResult.swap({
      category: label,
      text: resultText,
    })
    setActiveModal(null)
  }

  // Formatting options for Modals
  const relationshipOptions = Object.entries(RELATIONSHIPS.categories).map(
    ([id, label]) => ({ id, label: `${id}. ${label}` }),
  )
  const backgroundOptions = [
    { id: "Strength", label: "Strength" },
    { id: "Dexterity", label: "Dexterity" },
    { id: "Control", label: "Control" },
  ]
  const traitOptions = [
    { id: "aesthetics", label: "Aesthetics" },
    { id: "physique", label: "Physique" },
    { id: "face", label: "Face" },
    { id: "speech", label: "Speech" },
    { id: "virtue", label: "Virtue" },
    { id: "flaw", label: "Flaw" },
  ]
  const storyOptions = [
    { id: "encounter", label: "First Encounter" },
    { id: "ideology", label: "Ideology" },
    { id: "misfortune", label: "Misfortune" },
    { id: "npcs", label: "Create Two NPCs" },
  ]

  return (
    <main className="relative min-h-dvh overflow-hidden bg-stone-950 font-sans text-stone-100">
      <section className="relative z-10 grid min-h-dvh grid-cols-1 gap-8 px-6 py-8 sm:grid-cols-2 sm:grid-rows-2">
        {/* Quadrant 01: Relationships */}
        <Quadrant eyebrow="01" title="Relationship">
          <button
            type="button"
            onClick={() => setActiveModal("relationship")}
            className="w-full border border-stone-700 bg-stone-900 py-3 text-sm font-black uppercase tracking-widest transition hover:border-amber-400 hover:text-amber-300"
          >
            Select Relationship
          </button>

          <ResultBlock className="relative h-40 items-start overflow-hidden">
            <FadeText show={relationshipResult.visible}>
              {relationshipResult.hasValue ? (
                <div className="w-full">
                  <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-amber-300/80">
                    {relationshipResult.value.category}
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-stone-100 md:text-base">
                    {relationshipResult.value.text}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-stone-500">Awaiting selection...</p>
              )}
            </FadeText>
          </ResultBlock>
        </Quadrant>

        {/* Quadrant 02: Backgrounds */}
        <Quadrant eyebrow="02" title="Background">
          <button
            type="button"
            onClick={() => setActiveModal("background")}
            className="w-full border border-stone-700 bg-stone-900 py-3 text-sm font-black uppercase tracking-widest transition hover:border-amber-400 hover:text-amber-300"
          >
            Select Background Stat
          </button>

          <ResultBlock className="relative items-center justify-center overflow-hidden h-40">
            <FadeText show={backgroundResult.visible}>
              {backgroundResult.hasValue ? (
                <div className="flex w-full flex-col items-center justify-center space-y-3">
                  <p className="text-center text-sm font-bold text-stone-300">
                    Generated 4 options for {backgroundResult.value.stat}
                  </p>
                  <button
                    onClick={() => setActiveModal("backgroundResults")}
                    className="border border-amber-400/50 bg-amber-400/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-amber-300 transition hover:bg-amber-400/20"
                  >
                    View Results
                  </button>
                </div>
              ) : (
                <p className="text-sm text-stone-500">Awaiting selection...</p>
              )}
            </FadeText>
          </ResultBlock>
        </Quadrant>

        {/* Quadrant 03: Traits */}
        <Quadrant eyebrow="03" title="Traits & Appearance">
          <button
            type="button"
            onClick={() => setActiveModal("traits")}
            className="w-full border border-stone-700 bg-stone-900 py-3 text-sm font-black uppercase tracking-widest transition hover:border-amber-400 hover:text-amber-300"
          >
            Roll a Trait
          </button>

          <ResultBlock className="relative h-40 items-start overflow-hidden">
            <FadeText show={traitsResult.visible}>
              {traitsResult.hasValue ? (
                <div className="w-full">
                  <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-amber-300/80">
                    {traitsResult.value.category}
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-stone-100 md:text-base">
                    {traitsResult.value.text}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-stone-500">Awaiting selection...</p>
              )}
            </FadeText>
          </ResultBlock>
        </Quadrant>

        {/* Quadrant 04: Story */}
        <Quadrant eyebrow="04" title="Story & Connections">
          <button
            type="button"
            onClick={() => setActiveModal("story")}
            className="w-full border border-stone-700 bg-stone-900 py-3 text-sm font-black uppercase tracking-widest transition hover:border-amber-400 hover:text-amber-300"
          >
            Roll Story Element
          </button>

          <ResultBlock className="relative h-40 items-start overflow-hidden">
            <FadeText show={storyResult.visible}>
              {storyResult.hasValue ? (
                <div className="w-full">
                  <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-amber-300/80">
                    {storyResult.value.category}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm font-bold leading-6 text-stone-100 md:text-base">
                    {storyResult.value.text}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-stone-500">Awaiting selection...</p>
              )}
            </FadeText>
          </ResultBlock>
        </Quadrant>
      </section>

      {/* Modals */}
      {activeModal === "relationship" && (
        <SelectionModal
          title="Choose Category"
          options={relationshipOptions}
          onSelect={handleSelectRelationship}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "background" && (
        <SelectionModal
          title="Choose Stat"
          options={backgroundOptions}
          onSelect={handleSelectBackground}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "traits" && (
        <SelectionModal
          title="Choose Trait to Roll"
          options={traitOptions}
          onSelect={handleSelectTrait}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "story" && (
        <SelectionModal
          title="Choose Story Element to Roll"
          options={storyOptions}
          onSelect={handleSelectStory}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "backgroundResults" && backgroundResult.hasValue && (
        <BackgroundResultsModal
          stat={backgroundResult.value.stat}
          options={backgroundResult.value.options}
          onClose={() => setActiveModal(null)}
          onReselect={() => setActiveModal("background")}
        />
      )}
    </main>
  )
}

function Quadrant({ eyebrow, title, children }) {
  return (
    <article className="relative flex flex-col justify-center border border-stone-800 bg-stone-950/90 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between border-b border-stone-800 pb-2">
        <span className="text-[0.65rem] font-black tracking-widest text-stone-500">
          {eyebrow}
        </span>
        <h3 className="text-sm font-black uppercase tracking-widest text-stone-300">
          {title}
        </h3>
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-start gap-4">
        {children}
      </div>
    </article>
  )
}

function ResultBlock({ children, muted = false, className = "" }) {
  return (
    <div
      className={cx(
        "flex flex-col border border-stone-800 bg-black/35 p-4 text-sm leading-6",
        muted && "text-stone-600",
        className,
      )}
    >
      {children}
    </div>
  )
}

function BackgroundResultsModal({ stat, options, onClose, onReselect }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <section
        className="flex max-h-[90dvh] w-full max-w-2xl flex-col border border-stone-800 bg-stone-950 p-6 shadow-2xl"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between border-b border-stone-800 pb-4">
          <h2 className="text-xl font-black uppercase tracking-widest text-stone-100">
            {stat} Background Options
          </h2>
          <button
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-widest text-stone-500 transition hover:text-stone-300"
          >
            Close
          </button>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 overflow-y-auto pr-2">
          {options.map((opt, i) => (
            <div key={i} className="border border-stone-800 bg-black/40 p-4">
              <p className="mb-1 text-[0.7rem] font-black uppercase tracking-[0.18em] text-amber-300/80">
                Option {i + 1} • {opt.source}
              </p>
              <h4 className="mb-2 text-xl font-bold text-stone-50">
                {opt.title}
              </h4>
              <p className="text-lg leading-7 text-stone-300">{opt.details}</p>
            </div>
          ))}
        </div>

        {/* Duplicated Button at the bottom */}
        <button
          type="button"
          onClick={onReselect}
          className="mt-auto w-full shrink-0 border border-stone-700 bg-stone-900 py-3 text-sm font-black uppercase tracking-widest transition hover:border-amber-400 hover:text-amber-300"
        >
          Select Background Stat
        </button>
      </section>
    </div>
  )
}
