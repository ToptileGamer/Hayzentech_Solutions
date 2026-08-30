// ————————————————————————————————————————————————
// HayzenTech Solutions — site content
// Edit everything here: contact details, services,
// stats, process steps, testimonials.
// ————————————————————————————————————————————————

export const CONTACT = {
  email: 'hayzentechsolutions@gmail.com',
  // Web3Forms access key (form created for hayzentechsolutions.in/contact).
  // Manage / rotate at https://web3forms.com. Empty = form disabled.
  web3formsKey: '2c72dbc0-091a-480a-8dff-d2fff614d132',
}

export const NAV_LINKS = [
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Process', to: '/process' },
  { label: 'Contact', to: '/contact' },
  { label: 'Team', to: '/team' },
]

// Team cards — photo is pulled live from the GitHub avatar (`<user>.png`).
// Just the picture plus GitHub / LinkedIn / WhatsApp links, no names.
export const TEAM = [
  {
    photo: 'https://github.com/ToptileGamer.png',
    github: 'https://github.com/ToptileGamer',
    linkedin: 'https://www.linkedin.com/in/jgautham0106/',
    whatsapp: 'https://wa.me/919945891320',
  },
  {
    photo: 'https://github.com/Likhith022004.png',
    github: 'https://github.com/Likhith022004',
    linkedin: 'https://www.linkedin.com/in/likhith022004/',
    whatsapp: 'https://wa.me/918861677667',
    calendly: 'https://calendly.com/likith-blr12/30min',
  },
]

export const HERO = {
  eyebrow: 'HayzenTech Solutions · Full-stack · Mobile · Cloud',
  wordmark: 'HayzenTech Solutions',
  sub: 'Full-stack web platforms and Flutter apps — engineered to scale, designed to feel effortless.',
  availability: 'Available for new projects',
  ctaPrimary: 'Start a project',
  ctaGhost: 'See the work',
}

export const MARQUEE = [
  'Full-stack web apps',
  'Flutter apps',
  'SaaS platforms',
  'E-commerce',
  'REST & GraphQL APIs',
  'Landing pages',
  '24/7 AI receptionist',
]

export const SERVICES = [
  {
    num: '01',
    title: 'Full-stack web apps & SaaS',
    copy: 'Custom React + Node platforms with auth, databases, payments and dashboards — built to scale.',
  },
  {
    num: '02',
    title: '24/7 AI receptionist',
    copy: 'Personalised AI receptionist that handles customer support, captures leads and books appointments — around the clock.',
  },
  {
    num: '03',
    title: 'APIs & integrations',
    copy: 'REST and GraphQL backends, webhooks and third-party wiring your product can rely on.',
  },
  {
    num: '04',
    title: 'Landing pages & redesigns',
    copy: 'High-converting pages and full revamps — copy, motion and code that turn visits into sign-ups.',
  },
  {
    num: '05',
    title: 'Mobile apps — Flutter',
    copy: 'One codebase, native feel. iOS and Android shipped from a single, maintainable build.',
  },
  {
    num: '06',
    title: 'E-commerce & CMS',
    copy: 'Stores, content sites and admin panels that are fast to manage and even faster to sell on.',
  },
]

// ← Replace these with real projects. Add a link to open the project externally,
// or leave link: '' to keep the card non-clickable.
export const PROJECTS = [
  {
    title: 'Sumathi Crazy Collections',
    category: 'E-commerce',
    year: '2025',
    tags: ['React', 'Razorpay', 'Supabase'],
    link: 'https://sumathi-s-crazy-collections.vercel.app/',
  },
  {
    title: 'Rise with Remya',
    category: 'APIs & integrations',
    year: '2023',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL'],
    link: 'https://remya-website-xi.vercel.app/',
  },
  {
    title: 'Grounded Pulse',
    category: 'MERN Stack',
    year: '2024',
    tags: ['Flutter', 'Firebase'],
    link: 'https://grounded-pulse.vercel.app/',
  },
  {
    title: 'School LMS',
    category: 'Flutter · iOS & Android',
    year: '2025',
    tags: ['React', 'Node.js', 'PostgreSQL'],
    link: '',
  },
]

export const STATS = [
  { value: 3, suffix: '+', label: 'Years building' },
  { value: 20, suffix: '+', label: 'Projects shipped' },
  { value: 20, suffix: '+', label: 'Happy clients' },
  { value: 100, suffix: '%', label: 'On-time delivery' },
]

export const STACK = [
  'React',
  'TypeScript',
  'Node.js',
  'Flutter',
  'PostgreSQL',
  'Firebase',
  'Docker',
  'AWS',
]

export const PROCESS = [
  {
    num: '01',
    title: 'Discover',
    copy: 'A focused call to understand your users, your market and what “done” really looks like.',
  },
  {
    num: '02',
    title: 'Design',
    copy: 'Wireframes and UI in your hands before a line of backend code — so we agree early.',
  },
  {
    num: '03',
    title: 'Build',
    copy: 'Weekly builds and honest updates. Working software you can see, touch and test.',
  },
  {
    num: '04',
    title: 'Launch & beyond',
    copy: 'Deploy, monitor, document. Then stay close for fixes, features and growth.',
  },
]

export const TESTIMONIALS = [
  {
    quote: 'HayzenTech Solutions rebuilt our platform end to end — faster than we hoped, better than we imagined.',
    author: 'Founder, B2B SaaS',
  },
  {
    quote: 'The Flutter app shipped on both stores in eight weeks. Users keep telling us how smooth it feels.',
    author: 'Product lead, Health startup',
  },
  {
    quote: 'A rare mix: sharp product thinking and code that actually holds up. No rewrite needed since.',
    author: 'CTO, E-commerce brand',
  },
]
