// Every piece of copy the client is likely to change lives here.
// ⚠ Fees and package wording are UNCONFIRMED. See CONTEXT.md "Open questions" 1–2.

export const brand = {
  name: 'Hi-Ho Investments',
  short: 'Hi-Ho',
  legal: 'CBRH Property Ltd, trading as Hi-Ho Investments',
  tagline: 'Find better deals. Build with confidence.',
  email: 'hello@hihoinvestments.co.uk',
  website: 'https://hihoinvestments.co.uk',
  // Live privacy page on the main site (checked 2026-10-14).
  privacyUrl: 'https://hihoinvestments.co.uk/privacy',
  // The live site has no terms page yet. The footer hides the link while this is empty.
  termsUrl: '',
};

export const seo = {
  title: 'UK Property Investment, Made Hands-Off | Hi-Ho Investments',
  description:
    'Property sourcing, renovation management and social housing handover for UK investors with £50,000+ to invest. Terraced and semi-detached homes across the Midlands.',
};

export const hero = {
  eyebrow: 'Midlands property investment',
  headline: 'UK Property Investment,',
  headlineAccent: 'Made Hands-Off.',
  body: 'From sourcing the right property to renovation management and social housing handover, Hi-Ho helps investors navigate their property investment journey.',
  qualifier: 'For investors with £50,000 or more ready to invest.',
  primaryCta: 'Explore Investment Opportunities',
  secondaryCta: 'See a completed project',
  // Suggested stats. Edit freely.
  stats: [
    { value: '£50k+', label: 'Minimum to get started' },
    { value: 'Midlands', label: 'Terraced and semi-detached homes' },
    { value: '5 yr+', label: 'Social housing rental arrangement' },
  ],
};

export type Option = { value: string; label: string; hint?: string };

export const form = {
  heading: 'Explore Your Property Investment Options',
  body: 'Tell us about your investment goals to start a conversation with Hi-Ho Investments.',
  submit: 'Request an Investment Consultation',
  questions: [
    {
      name: 'budget',
      legend: 'What is your investment budget?',
      options: [
        { value: '50-100k', label: '£50,000 – £100,000' },
        { value: '100-250k', label: '£100,000 – £250,000' },
        { value: '250k-plus', label: 'Over £250,000' },
        { value: 'no-funds', label: "I don't yet have the funds available" },
      ],
    },
    {
      name: 'timeline',
      legend: 'When are you ready to invest?',
      options: [
        { value: 'immediately', label: 'Immediately', hint: 'If the right opportunity is available' },
        { value: '30-days', label: 'Within 30 days' },
        { value: '1-3-months', label: 'Within 1–3 months' },
        { value: 'researching', label: 'Just researching at the moment' },
      ],
    },
    {
      name: 'service',
      legend: 'Which service interests you most?',
      options: [
        { value: 'sourcing', label: 'Property sourcing' },
        { value: 'sourcing-renovation', label: 'Sourcing and renovation management' },
        { value: 'full-service', label: 'Full service', hint: 'Including social housing handover' },
        { value: 'not-sure', label: 'Not sure yet', hint: "I'd like to discuss the options" },
      ],
    },
  ] satisfies { name: string; legend: string; options: Option[] }[],
};

export const steps = [
  { title: 'Submit an investor enquiry', body: 'Answer three quick questions so we understand your budget, timing and goals.' },
  { title: 'Book a qualification call', body: 'A short call with the Hi-Ho team to talk through what you want from an investment.' },
  { title: 'Explore suitable opportunities', body: 'We match you with suitable properties and the service package that fits.' },
  { title: 'Review before you decide', body: 'Go through the property, the costs and the contractual terms before deciding whether to proceed.' },
];

export const opportunity = {
  heading: 'A Different Approach to UK Property Investment',
  body: [
    'We focus on terraced and semi-detached homes in the Midlands and surrounding areas: established streets, sensible entry prices and steady demand for good-quality rented housing.',
    'Choose how involved you want to be. We can simply find and secure the right property, manage the renovation too, or take it all the way to a long-term social housing arrangement.',
  ],
};

export const packages = [
  {
    id: 'p1',
    number: '01',
    name: 'Property Sourcing',
    summary: 'We find and secure a suitable property for you.',
    // ⚠ Brief says £5,000; live site says £3,500. Awaiting client confirmation.
    fee: 'Example fee: £5,000',
    feeNote: 'Subject to confirmation of final fee and scope.',
    featured: false,
  },
  {
    id: 'p2',
    number: '02',
    name: 'Sourcing and Renovation Management',
    summary: 'We find the property, project-manage the renovation and hand the finished home back to you.',
    fee: 'Fee on enquiry',
    feeNote: 'Depends on the property and the scope of works.',
    featured: false,
  },
  {
    id: 'p3',
    number: '03',
    name: 'Complete Investment and Social Housing Handover',
    summary:
      'We find the property, renovate it to the relevant social housing specification and connect you with a social housing provider for a rental arrangement intended to run for at least five years.',
    fee: 'Fee on enquiry',
    feeNote: 'Depends on the property and the provider’s terms.',
    featured: true,
  },
];

// Rows of the "what's included" comparison. Booleans map to packages p1, p2, p3.
export const included = [
  { label: 'Property sourcing and acquisition support', has: [true, true, true] },
  { label: 'Renovation project management', has: [false, true, true] },
  { label: 'Renovation to social housing specification', has: [false, false, true] },
  { label: 'Introduction to a social housing provider', has: [false, false, true] },
  { label: 'Rental arrangement intended for 5+ years', has: [false, false, true] },
];

export const caseStudy = {
  heading: 'From Property Challenge to Investment Opportunity',
  body: 'Watch how the Hi-Ho team took on a tired property and turned it into a home ready to let.',
  videoUrl: 'https://www.tiktok.com/@ryanhills26/video/7660536618507308310',
  videoId: '7660536618507308310',
  caption: 'Case study filmed by the Hi-Ho team. Video plays from TikTok.',
  moreUrl: 'https://hihoinvestments.co.uk/#case-study',
  moreLabel: 'Read the full case study on hihoinvestments.co.uk',
};

export const faqs = [
  {
    q: 'Where are the properties located?',
    a: 'We focus on terraced and semi-detached houses in the Midlands and the surrounding areas. We will talk you through specific towns and streets on your qualification call.',
  },
  {
    q: 'What is the difference between the three packages?',
    a: 'Package 1 covers finding and securing a property. Package 2 adds project management of the renovation, with the finished property handed back to you. Package 3 goes further: the renovation is completed to the relevant social housing specification and we connect you with a social housing provider for a longer-term rental arrangement.',
  },
  {
    q: 'How does the five-year rental arrangement work?',
    a: 'With Package 3, the property is let to a social housing provider under an agreement intended to run for at least five years. The exact terms, including rent, responsibilities and break clauses, are set by the provider and will be shared with you in full before you commit. Rental income is not guaranteed.',
  },
  {
    q: 'What happens after I submit an enquiry?',
    a: 'A member of the Hi-Ho team will contact you to book a qualification call. If there is a good fit, we will share suitable opportunities and the relevant service package. There is no obligation to proceed at any stage.',
  },
  {
    q: 'What will it cost?',
    a: 'Our fee depends on the package and the property. You will also have the usual costs of buying property, such as the purchase price, Stamp Duty Land Tax, legal fees, surveys and any renovation costs. We will give you a clear breakdown for any property before you decide.',
  },
  {
    q: 'Who is responsible for what under the contract?',
    a: 'You will own the property, so you remain responsible for ownership obligations such as mortgage payments, insurance and compliance. Our responsibilities, and those of any contractor or housing provider, are set out in writing before you proceed. Please read every agreement carefully.',
  },
  {
    q: 'What are the risks?',
    a: 'Property values can fall as well as rise, renovation costs can overrun, and rental income is not guaranteed. Social housing arrangements depend on the provider’s terms. Your capital is at risk. We are not financial advisers, and we recommend you take independent financial and legal advice before investing.',
  },
  {
    q: 'Do I need £50,000 to get started?',
    a: 'Our opportunities are designed for investors with at least £50,000 available to invest. If you are not there yet, you are still welcome to get in touch to learn how the process works.',
  },
];

export const finalCta = {
  heading: 'Ready to Explore Your Property Investment Options?',
  body: 'Start a conversation with Hi-Ho Investments about property investment opportunities in the Midlands and surrounding areas.',
  cta: 'Request an Investment Consultation',
};

export const risk = [
  'The value of property can fall as well as rise.',
  'Rental income is not guaranteed.',
  'Social housing arrangements depend on the terms of the housing provider.',
  'Nothing on this page is financial advice. Please seek independent financial and legal advice.',
  'Your capital is at risk.',
];
