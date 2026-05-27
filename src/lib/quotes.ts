/**
 * Daily epigraph — a curated rotation of quotes from engineers,
 * scientists, designers, and thinkers. The same quote is shown to
 * everyone on the same day (deterministic by date), and the
 * rotation cycles every ~36 days.
 *
 * Curation principle: quotes that sit well on the cover of an
 * engineering manual. Precision. Iteration. The craft of making
 * something that works.
 */

export interface Quote {
  text: string;
  author: string;
  context?: string; // brief disambiguating context
}

export const QUOTES: Quote[] = [
  {
    text: "Dream is not what you see in sleep. It is something that does not let you sleep.",
    author: "A. P. J. Abdul Kalam",
    context: "Aerospace scientist · 11th President of India",
  },
  {
    text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
    author: "Antoine de Saint-Exupéry",
    context: "Pilot, writer",
  },
  {
    text: "The first principle is that you must not fool yourself — and you are the easiest person to fool.",
    author: "Richard Feynman",
    context: "Physicist · Nobel laureate",
  },
  {
    text: "Good design is as little design as possible.",
    author: "Dieter Rams",
    context: "Industrial designer · Braun",
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "Kent Beck",
    context: "Software engineer · Extreme Programming",
  },
  {
    text: "I have not failed. I've just found 10,000 ways that won't work.",
    author: "Thomas Edison",
    context: "Inventor",
  },
  {
    text: "Failure will never overtake me if my definition to succeed is strong enough.",
    author: "A. P. J. Abdul Kalam",
    context: "Aerospace scientist · 11th President of India",
  },
  {
    text: "The price of reliability is the pursuit of the utmost simplicity.",
    author: "C. A. R. Hoare",
    context: "Computer scientist · Quicksort",
  },
  {
    text: "A problem well stated is a problem half-solved.",
    author: "Charles Kettering",
    context: "Engineer · Inventor of the electric starter",
  },
  {
    text: "Engineering is achieving function while avoiding failure.",
    author: "Henry Petroski",
    context: "Structural engineer · Historian of engineering",
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    author: "Will Durant",
    context: "Historian · Paraphrasing Aristotle",
  },
  {
    text: "Excellence is a continuous process and not an accident.",
    author: "A. P. J. Abdul Kalam",
    context: "Aerospace scientist · 11th President of India",
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
    context: "Engineer, artist, polymath",
  },
  {
    text: "An expert is a person who has made all the mistakes that can be made in a very narrow field.",
    author: "Niels Bohr",
    context: "Physicist · Nobel laureate",
  },
  {
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    context: "Roman emperor · Stoic philosopher",
  },
  {
    text: "Simplicity is prerequisite for reliability.",
    author: "Edsger W. Dijkstra",
    context: "Computer scientist · Turing Award",
  },
  {
    text: "Everything should be made as simple as possible, but not simpler.",
    author: "Albert Einstein",
    context: "Theoretical physicist",
  },
  {
    text: "A journey of a thousand miles begins with a single step.",
    author: "Lao Tzu",
    context: "Chinese philosopher · Tao Te Ching",
  },
  {
    text: "Do what you can, with what you have, where you are.",
    author: "Theodore Roosevelt",
    context: "26th U.S. President",
  },
  {
    text: "If you can't explain it simply, you don't understand it well enough.",
    author: "Anonymous",
    context: "Often misattributed to Einstein",
  },
  {
    text: "Talk is cheap. Show me the code.",
    author: "Linus Torvalds",
    context: "Creator of Linux & Git",
  },
  {
    text: "Quality is not an act, it is a habit.",
    author: "Aristotle",
    context: "Greek philosopher · 4th century BCE",
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    author: "Confucius",
    context: "Chinese philosopher",
  },
  {
    text: "If you want to shine like a sun, first burn like a sun.",
    author: "A. P. J. Abdul Kalam",
    context: "Aerospace scientist · 11th President of India",
  },
  {
    text: "Man needs his difficulties because they are necessary to enjoy success.",
    author: "A. P. J. Abdul Kalam",
    context: "Aerospace scientist · 11th President of India",
  },
  {
    text: "Whatever you can do, or dream you can, begin it. Boldness has genius, power and magic in it.",
    author: "Goethe",
    context: "German writer and statesman",
  },
  {
    text: "Details matter, it's worth waiting to get it right.",
    author: "Steve Jobs",
    context: "Co-founder, Apple",
  },
  {
    text: "Failure is the most interesting part.",
    author: "James Dyson",
    context: "Engineer · 5,127 prototypes before the first vacuum",
  },
  {
    text: "Success is 99 percent failure.",
    author: "Soichiro Honda",
    context: "Founder, Honda Motor Company",
  },
  {
    text: "Quality means doing it right when no one is looking.",
    author: "Henry Ford",
    context: "Industrialist",
  },
  {
    text: "We must clearly recognise the obligation to apply advanced technologies to the real problems of man and society.",
    author: "Vikram Sarabhai",
    context: "Father of the Indian space programme",
  },
  {
    text: "To lead, you have to inspire confidence and trust.",
    author: "J. R. D. Tata",
    context: "Industrialist · Bharat Ratna",
  },
  {
    text: "When in doubt, classify higher.",
    author: "Tryaksh Engineering Standards §3",
    context: "Default design-class rule",
  },
  {
    text: "If the file does not have a version, it does not exist.",
    author: "Tryaksh Engineering Standards §4.2",
    context: "File naming convention",
  },
  {
    text: "The cost of preventing a mistake at the design stage is one engineer-hour. The cost of finding it in the field is the company.",
    author: "Tryaksh Engineering Standards §1",
    context: "Why this exists",
  },
  {
    text: "Just a small fix is not a valid reason.",
    author: "PCB Design SOP §8 — Schematic Lock",
    context: "Lock-gate discipline",
  },
];

/**
 * Pick a quote deterministically based on the date.
 * Same day → same quote across all users.
 */
export function getQuoteForDate(date: Date = new Date()): Quote {
  // Days since Unix epoch, in UTC, normalised to the local day.
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return QUOTES[((dayIndex % QUOTES.length) + QUOTES.length) % QUOTES.length];
}

/** Pretty date for the epigraph label — "28 May 2026" in IST. */
export function formatEpigraphDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}
