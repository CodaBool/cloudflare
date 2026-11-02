import { useEffect, useRef, useState } from "react"

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
      0: "They worked together at the same company.",
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
      2: "They run in different social circles.",
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
      5: "They were both part of a failed expedition with a high body count.",
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


const SIMPLE_TRAITS = {
  aesthetics: [
    "All Business, All the Time.",
    "Streetwear",
    "Band Tees",
    "Paint it Black",
    "Athleisure",
    "Crisp and Ironed",
    "Casual Comfort",
    "Authentic Vintage",
    "All the Rage",
    "Work Uniform",
    "Oversized Hoodie",
    "Island Floral",
    "Everything Tailored",
    "Function Over Fashion",
    "Cargo Pockets",
    "Jeans and Tees",
    "Trapped in 2009",
    "Grunge Minimalist",
    "Y2K",
    "Denim on Denim",
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

const CRIME_TABLE = [
  { label: "metaphysical fraud",
    description: "selling fake spiritual services or products, or claiming to have supernatural powers",
  },
  { label: "theft" },
  { label: "stalking" },
  { label: "blackmail" },
  { label: "vigilantism" },
  {
    label: "phrogging",
    description: "secretly squatting in an occupied residence",
  },
  { label: "cannibalism" },
  { label: "arson" },
  { label: "bio harvesting" },
  { label: "restricted chemicals" },
]

const ILLNESS_TABLE = [
  { label: "PTSD", description: "Post Traumatic Stress Disorder: Persistent trauma responses from past events." },
  { label: "Egomania", description: "Delusions of grandeur, events are proof you're uniquely important." },
  { label: "Obsessive", description: "A goal is slowly consuming every part of your identity." },
  { label: "Hieromania", description: "You receive religious signs, visions, and commandments." },
  { label: "Compulsive", description: "You must repeat a particular action to feel safe." },
  {
    label: "Excoriation",
    description: "Non-stop skin picking.",
  },
  {
    label: "Stendhal Syndrome",
    description: "Hallucinations triggered by exposure to intense works of art.",
  },
  {
    label: "Antisocial",
    description: "Persistent disregard for others' rights and boundaries.",
  },
  {
    label: "Capgras syndrome",
    description:
      "You were convinced that a close family member, friend, or spouse was replaced by an identical imposter.",
  },
  {
    label: "Depersonalized",
    description: "Feeling strongly detached from one's own physical body.",
  },
]

function cx(...classes) {
  return classes.filter(Boolean).join(" ")
}

function rollD10Digit() {
  return Math.floor(Math.random() * 10)
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
function SelectionModal({
  title,
  options,
  onSelect,
  onClose,
  subtitle,
  footer,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      onMouseDown={onClose}
    >
      <section
        className="themed-modal-panel flex max-h-[90dvh] w-full max-w-lg flex-col p-6 shadow-2xl"
        onMouseDown={e => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between border-b border-stone-700 pb-3">
          <h2 className="text-md font-black uppercase text-stone-100 tracking-wider">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="action-btn-modal"
          >
            Back
          </button>
        </div>
        {subtitle && (
          <div className="text-sm text-stone-200 mb-3">
            {subtitle}
          </div>
        )}
        <div className="overflow-y-auto grid grid-cols-1 gap-2">
          {options.map(opt =>
            opt.href ? (
              <a
                key={opt.id}
                href={opt.href}
                target="_blank"
                rel="noreferrer"
                className="modal-option-btn"
              >
                {opt.label}
              </a>
            ) : (
              <button
                key={opt.id}
                type="button"
                onClick={() => onSelect?.(opt.id)}
                className="modal-option-btn"
              >
                {opt.label}
              </button>
            ),
          )}
        </div>
        {footer && (
          <p className="mt-4 border-t border-stone-800 pt-4 text-sm text-stone-400 text-center">
            {footer}
          </p>
        )}
      </section>
    </div>
  )
}

function D20Icon() {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinejoin="round"
    >
      <path d="M32 4 57 22 48 54H16L7 22 32 4Z" />
      <path d="m7 22 25 9 25-9M16 54l16-23 16 23M32 4v27" />
      <path d="m7 22 9 32M57 22l-9 32" />
    </svg>
  )
}

function normalizeRollEntries(entries) {
  return entries.map((entry, index) => {
    if (typeof entry === "string") {
      return {
        roll: index,
        label: entry,
        text: entry,
      }
    }

    return {
      roll: index,
      label: entry.label,
      text: entry.description ? `${entry.label}: ${entry.description}` : entry.label,
    }
  })
}

function RollTableModal({
  title,
  options,
  entries,
  onResult,
  onClose,
  subtitle,
  closeOnSelect = false,
}) {
  const [activeOptionId, setActiveOptionId] = useState(options ? null : "single")
  const [result, setResult] = useState(null)
  const tableContainerRef = useRef(null)

  const activeOption = options?.find(option => option.id === activeOptionId) ?? null
  const activeEntries = normalizeRollEntries(
    activeOption ? activeOption.entries : entries ?? [],
  )

  useEffect(() => {
    if (!result) return

    const selectedRow = tableContainerRef.current?.querySelector(
      `[data-roll="${result.roll}"]`,
    )
    selectedRow?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [result])

  function selectResult(index) {
    const picked = activeEntries[index]
    if (!picked) return

    const nextResult = {
      category: activeOption?.label ?? title,
      roll: picked.roll,
      text: picked.text,
    }
    setResult(nextResult)
    onResult(nextResult)
    if (closeOnSelect) {
      onClose()
    }
  }

  function selectOption(nextOptionId) {
    setActiveOptionId(nextOptionId)
    setResult(null)
  }

  const canRoll = activeEntries.length > 0

  function handleBack() {
    if (options && activeOption) {
      setActiveOptionId(null)
      setResult(null)
      return
    }

    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trait-modal-title"
      onMouseDown={onClose}
    >
      <section
        className="themed-modal-panel flex max-h-[90dvh] w-full max-w-2xl flex-col p-6 shadow-2xl"
        onMouseDown={event => event.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between border-b border-stone-700 pb-3">
          <div className="flex items-center gap-3">
            <h2
              id="trait-modal-title"
              className="text-md font-black uppercase text-stone-100"
            >
              {activeOption ? activeOption.label : options ? "Traits" : title}
            </h2>
            {canRoll && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => selectResult(Math.floor(Math.random() * activeEntries.length))}
                  aria-label={`Roll randomly on the ${(activeOption?.label ?? title)} table`}
                  title="Roll randomly"
                  className="dice-btn inline-flex items-center justify-center p-2 transition"
                >
                  <D20Icon />
                </button>
                <span className="text-xs uppercase tracking-wide text-stone-400">
                  Roll a random result
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleBack}
            className="action-btn-modal"
          >
            Back
          </button>
        </div>

        {subtitle && (
          <div className="mb-3 text-xl text-stone-200">
            {subtitle}
          </div>
        )}

        {!activeOption && options ? (
          <div className="grid grid-cols-1 gap-2 overflow-y-auto">
            {options.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => selectOption(option.id)}
                className="modal-option-btn"
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <>
            <div
              ref={tableContainerRef}
              className="min-h-0 overflow-y-auto border border-stone-800"
            >
              <table className="w-full border-collapse text-left text-sm">
                <tbody>
                  {activeEntries.map((entry, index) => (
                    <tr
                      key={`${entry.roll}-${entry.label}`}
                      data-roll={entry.roll}
                      onClick={() => selectResult(index)}
                      className={cx(
                        "cursor-pointer border-b border-stone-800 last:border-b-0",
                        result?.roll === entry.roll
                          ? "bg-white/15 text-stone-100"
                          : "bg-black/30 hover:bg-white/8",
                      )}
                    >
                      <td className="w-14 border-r border-stone-800 px-3 py-2 text-center font-black text-stone-300">
                        {entry.roll}
                      </td>
                      <td className="px-4 py-2">
                        {entry.label}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default function App() {
  const relationshipResult = useFadeSwap(null)
  const traitsResult = useFadeSwap(null)
  const crimeResult = useFadeSwap(null)
  const illnessResult = useFadeSwap(null)

  const [activeModal, setActiveModal] = useState(null) // 'relationship' | 'traits' | 'crime' | 'illness' | 'links' | null

  function handleSelectRelationship(categoryId) {
    const relationshipRoll = String(rollD10Digit())
    relationshipResult.swap({
      category: `${categoryId}. ${RELATIONSHIPS.categories[categoryId]}`,
      text: `[${relationshipRoll}] ${RELATIONSHIPS.results[categoryId][relationshipRoll]}`,
    })
    setActiveModal(null)
  }

  function handleSelectTrait(result) {
    traitsResult.swap({
      category: result.category,
      text: `[${result.roll}] ${result.text}`,
    })
  }

  function handleSelectCrime(result) {
    crimeResult.swap({
      category: result.category,
      text: `[${result.roll}] ${result.text}`,
    })
  }

  function handleSelectIllness(result) {
    illnessResult.swap({
      category: result.category,
      text: `[${result.roll}] ${result.text}`,
    })
  }

  // Formatting options for Modals
  const relationshipOptions = Object.entries(RELATIONSHIPS.categories).map(
    ([id, label]) => ({ id, label: `${id}. ${label}` }),
  )
  const traitOptions = [
    { id: "aesthetics", label: "Aesthetics", entries: SIMPLE_TRAITS.aesthetics },
    { id: "physique", label: "Physique", entries: SIMPLE_TRAITS.physique },
    { id: "face", label: "Face", entries: SIMPLE_TRAITS.face },
    { id: "speech", label: "Speech", entries: SIMPLE_TRAITS.speech },
    { id: "virtue", label: "Virtue", entries: SIMPLE_TRAITS.virtue },
    { id: "ideology", label: "Ideology", entries: SIMPLE_TRAITS.ideology },
    { id: "misfortune", label: "Misfortune", entries: SIMPLE_TRAITS.misfortune },
  ]
  const linkOptions = [
    {
      id: "facilitator-playlist",
      label: "Spotify - for Facilitator Prep",
      href: "https://open.spotify.com/playlist/12F4X7VzgLPt3Ef7JIBmy8",
    },
    {
      id: "session-playlist",
      label: "Spotify - for the Session",
      href: "https://open.spotify.com/playlist/6dC7ZRObjCE2VHKZwFh9CQ",
    },
    { id: "itch", label: "Oubliette", href: "https://codabool.itch.io/oubliette" },
    {
      id: "relationships-by-eddie-dover",
      label: "Relationship Rolltable by Eddie Dover",
      href: "https://github.com/EddieDover/mothership-crew-relationships",
    },
  ]

  return (
    <main className="app-shell relative flex min-h-dvh flex-col overflow-hidden font-sans text-stone-100">
      <section className="relative z-10 grid flex-1 grid-cols-1 auto-rows-fr gap-2 px-6 py-3 md:gap-8 md:py-8 sm:grid-cols-2">
        <Quadrant>
          <button
            type="button"
            onClick={() => setActiveModal("relationship")}
            className="action-btn w-full py-1 text-sm font-black uppercase lg:py-2 lg:text-base"
          >
            Relationship
          </button>

          <ResultBlock className="relative flex-1 min-h-0 items-start overflow-hidden">
            <FadeText show={relationshipResult.visible}>
              {relationshipResult.hasValue ? (
                <div className="w-full">
                  <p className="text-[0.78rem] font-black uppercase tracking-[0.18em] text-stone-300 md:text-sm lg:text-xl">
                    {relationshipResult.value.category}
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-stone-100 md:text-base lg:text-xl lg:leading-8">
                    {relationshipResult.value.text}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-stone-500 lg:text-lg">Awaiting selection...</p>
              )}
            </FadeText>
          </ResultBlock>
        </Quadrant>

        <Quadrant>
          <button
            type="button"
            onClick={() => setActiveModal("traits")}
            className="action-btn w-full py-1 text-sm font-black uppercase lg:py-2 lg:text-base"
          >
            Traits
          </button>

          <ResultBlock className="relative flex-1 min-h-0 items-start overflow-hidden">
            <FadeText show={traitsResult.visible}>
              {traitsResult.hasValue ? (
                <div className="w-full">
                  <p className="text-[0.78rem] font-black uppercase tracking-[0.18em] text-stone-300 md:text-sm lg:text-xl">
                    {traitsResult.value.category}
                  </p>
                  <p className="mt-2 text-sm font-bold leading-6 text-stone-100 md:text-base lg:text-xl lg:leading-8">
                    {traitsResult.value.text}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-stone-500 lg:text-lg">Awaiting selection...</p>
              )}
            </FadeText>
          </ResultBlock>
        </Quadrant>

        <Quadrant>
          <button
            type="button"
            onClick={() => setActiveModal("crime")}
            className="action-btn w-full py-1 text-sm font-black uppercase lg:py-2 lg:text-base"
          >
            Crime
          </button>

          <ResultBlock className="relative flex-1 min-h-0 items-start overflow-hidden">
            <FadeText show={crimeResult.visible}>
              {crimeResult.hasValue ? (
                <div className="w-full">
                  <p className="mt-2 text-sm font-bold leading-6 text-stone-100 md:text-base lg:text-xl lg:leading-8">
                    {crimeResult.value.text}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-stone-500 lg:text-lg">Awaiting selection...</p>
              )}
            </FadeText>
          </ResultBlock>
        </Quadrant>

        <Quadrant>
          <button
            type="button"
            onClick={() => setActiveModal("illness")}
            className="action-btn w-full py-1 text-sm font-black uppercase lg:py-2 lg:text-base"
          >
            Mental Illness
          </button>

          <ResultBlock className="relative flex-1 min-h-0 items-start overflow-hidden">
            <FadeText show={illnessResult.visible}>
              {illnessResult.hasValue ? (
                <div className="w-full">
                  <p className="mt-2 text-xs font-bold leading-6 text-stone-100 sm:text-sm md:text-base lg:text-xl lg:leading-8">
                    {illnessResult.value.text}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-stone-500 lg:text-lg">Awaiting selection...</p>
              )}
            </FadeText>
          </ResultBlock>
        </Quadrant>
      </section>

      <div className="relative z-10 px-6 pb-4">
        <button
          type="button"
          onClick={() => setActiveModal("links")}
          className="action-btn w-full py-3 text-sm font-black uppercase lg:py-4 lg:text-base"
        >
          Links
        </button>
      </div>

      {/* Modals */}
      {activeModal === "relationship" && (
        <SelectionModal
          title="Relationships"
          options={relationshipOptions}
          subtitle={(
            <>
            <p style={{textAlign: "center", marginBottom: "1.8em", fontSize: "1.3em"}}><b>Only recommended if there are 3 or less players</b></p>
            <ol className=" list-decimal space-y-2 pl-6  marker:text-gray-300 text-[1.2em] mb-3">
              <li>Have everyone intro their role and roll a d8</li>
              <li>Come back around and one at a time tell them what category they rolled (allow rerolls)</li>
              <li>Ask them to select someone at the table to have this relation with</li>
              <li>Read the description after clicking the category</li>
              <li>Ask them to fill in any blanks</li>
            </ol>
            </>
          )}
          // subtitle="1.) Have everyone intro their roles and roll a d8. 2.) Come back around and one at a time tell them the rolled category (allow rerolls). 3.) Ask them to select someone at the table to have this relation with. 4.) Read the description after clicking the category. 5.) Ask them to fill in any blanks."
          onSelect={handleSelectRelationship}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "traits" && (
        <RollTableModal
          title="Traits"
          options={traitOptions}
          onResult={handleSelectTrait}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "crime" && (
        <RollTableModal
          title="Crime"
          entries={CRIME_TABLE}
          subtitle={(
            <>
              <p style={{textAlign: "center", marginBottom: "0.2em", fontSize: "1.0em", opacity: 0.72}}><b>Roll for this when the rorschach is presented.</b></p>
              <p style={{textAlign: "", marginBottom: "0.6em", fontSize: "1.0em", opacity: 0.6}}>Some players will come up with their own crime. In the spirit of 'yes and', don't roll and instead work off their idea.</p>
              <p style={{textAlign: "", marginBottom: "0.6em", fontSize: "1.0em", opacity: 0.6}}>The functionality to roll here is available. But players like rolling, have them roll a d10 and read off the result.</p>
              <p>All players have already been found guilty. In addition, have your players roll a d20 for years left in their sentence</p>
            </>
          )}

          onResult={handleSelectCrime}
          onClose={() => setActiveModal(null)}
          closeOnSelect
        />
      )}

      {activeModal === "illness" && (
        <RollTableModal
          title="Mental Illness"
          entries={ILLNESS_TABLE}
          subtitle="All players suffer a mental illness. While they’re no longer compelled by it, intrusive thoughts may linger."
          onResult={handleSelectIllness}
          onClose={() => setActiveModal(null)}
          closeOnSelect
        />
      )}

      {activeModal === "links" && (
        <SelectionModal
          title="Links"
          options={linkOptions}
          footer="Liminal Horror is copyright by Goblin Archives LLC"
          onClose={() => setActiveModal(null)}
        />
      )}
    </main>
  )
}

function Quadrant({ children }) {
  return (
    <article className="quadrant-shell relative flex h-full min-h-0 flex-col justify-center p-0 shadow-[0_8px_30px_rgba(0,0,0,0.6)] md:p-5">
      <div className="flex min-h-0 flex-1 flex-col justify-start md:gap-4 gap-0">
        {children}
      </div>
    </article>
  )
}

function ResultBlock({ children, muted = false, className = "" }) {
  return (
    <div
      className={cx(
        "result-block flex min-h-0 flex-col border border-stone-700 bg-black p-4 text-sm leading-6",
        muted && "text-stone-600",
        className,
      )}
    >
      {children}
    </div>
  )
}
