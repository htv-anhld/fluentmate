/**
 * Per-scenario mock reply trees.
 *
 * Used by conversationService when no Edge Function (Claude) is configured —
 * also used as the source of fake user inputs when STT isn't wired.
 *
 * Key by scenario TITLE (DB-friendly — IDs in Supabase are UUIDs, not 'sc-*').
 * Fallback to ID-based lookup for legacy mock-only paths.
 */
export type ScenarioDialog = {
  greeting: string;
  aiReplies: string[];
  userReplies: string[];
};

const COFFEE: ScenarioDialog = {
  greeting: 'Hi! Welcome to FluentMate Café. What can I get you?',
  aiReplies: [
    'Sure! What size — small, medium, or large?',
    'Would you like that for here or to go?',
    'Any milk preference? We have whole, oat, and almond.',
    "That'll be $4.50. Cash or card?",
    'Thanks! Your order will be ready in just a minute.',
  ],
  userReplies: [
    "I'd like a latte, please.",
    'Medium, please.',
    'Oat milk would be great.',
    'For here, thank you.',
    "I'll pay by card.",
  ],
};

const STANDUP: ScenarioDialog = {
  greeting: 'Morning team — quick standup. What did you ship yesterday?',
  aiReplies: [
    'Got it. Any blockers we should know about?',
    "Nice. What's on your plate today?",
    'Sounds good. Anything you need from the team?',
    'Quick reminder — demo is on Thursday. Are we on track?',
    'Thanks for the update. Let me know if priorities shift.',
  ],
  userReplies: [
    'Yesterday I finished the auth flow and started on the dashboard.',
    "I'm blocked on the API spec — waiting on backend.",
    "Today I'll wire up the new endpoints and write tests.",
    'Should be on track for demo, just one risk on the migration.',
    "I'll pair with someone on the database stuff this afternoon.",
  ],
};

const AIRPORT: ScenarioDialog = {
  greeting: 'Hi there. Are you checking in? May I see your passport?',
  aiReplies: [
    'Thank you. Are you checking any bags?',
    'Window or aisle seat?',
    'Your gate is B17, boarding starts at 2:30.',
    'Please remember liquids must be under 100ml in carry-on.',
    'Have a great flight!',
  ],
  userReplies: [
    "Yes, I'm checking in for the 3pm flight.",
    'I have one bag to check.',
    'Window seat, please.',
    'How long does boarding take?',
    'Thank you very much!',
  ],
};

const INTRODUCE: ScenarioDialog = {
  greeting: "Hi! I'm Alex, just joined the team. Nice to meet you!",
  aiReplies: [
    'Cool. Which team are you on?',
    'Oh nice — how long have you been with the company?',
    'What part of your work are you most excited about?',
    'Do you usually work from the office or remote?',
    'Awesome. We should grab lunch sometime.',
  ],
  userReplies: [
    "Hi Alex, nice to meet you! I'm Duc.",
    "I'm on the product team, working on the mobile app.",
    "I've been here for about two years now.",
    'I really enjoy the user research part of my role.',
    "I'm usually in the office on Tuesdays and Thursdays.",
  ],
};

const RESTAURANT: ScenarioDialog = {
  greeting: 'Good evening, FluentMate Bistro — how can I help you?',
  aiReplies: [
    'For how many people, and what time?',
    'Any dietary restrictions or preferences?',
    'Window or quiet section?',
    'Could I get a name and phone number for the booking?',
    "You're all set. We'll see you Friday at 7.",
  ],
  userReplies: [
    "I'd like to make a reservation for Friday evening.",
    'Two people, around 7pm.',
    "One of us is vegetarian, but we're flexible.",
    'A quiet table would be lovely.',
    'Sure — Duc, and the number is 0901-234-567.',
  ],
};

const INTERVIEW: ScenarioDialog = {
  greeting:
    'Hi, thanks for joining. To start — could you tell me about yourself?',
  aiReplies: [
    'What would you say is your biggest strength?',
    'Tell me about a challenging project you worked on.',
    'Why are you interested in this role specifically?',
    'Where do you see yourself in five years?',
    'Do you have any questions for me?',
  ],
  userReplies: [
    'Sure. I have five years of experience in mobile development.',
    "I'd say my biggest strength is breaking complex problems into small steps.",
    'Last year I led a migration to a new API, ahead of schedule.',
    "I'm drawn to your focus on user experience and learning culture.",
    "I'd love to grow into a tech lead role with deeper product impact.",
  ],
};

const DOCTOR: ScenarioDialog = {
  greeting: "Hello, I'm Dr. Lee. What brings you in today?",
  aiReplies: [
    'How long has this been going on?',
    'On a scale of 1 to 10, how bad is the pain?',
    'Any other symptoms — fever, fatigue, anything else?',
    "I'm going to prescribe something. Take it twice a day after meals.",
    'Come back if it gets worse, otherwise rest and drink lots of water.',
  ],
  userReplies: [
    "I've had a sore throat and headache for a few days.",
    'About four days now.',
    "Maybe a six. It's worse in the morning.",
    "I had a mild fever yesterday but it's gone now.",
    'Got it. Twice a day after meals. Thank you, doctor.',
  ],
};

const PRESENTATION: ScenarioDialog = {
  greeting:
    "Hi everyone, thanks for joining. Whenever you're ready — go ahead with your pitch.",
  aiReplies: [
    'Interesting — could you explain the user problem in more depth?',
    'How is this different from existing solutions?',
    "What's your go-to-market approach?",
    'Walk me through the business model.',
    "Strong pitch — what's your ask from us today?",
  ],
  userReplies: [
    'Today I want to introduce FluentMate, an AI-powered English coach for Vietnamese learners.',
    'Most apps focus on grammar drills, but Vietnamese learners struggle most with speaking confidence.',
    'We differentiate by giving real-time conversation practice with personalized coaching.',
    "We'll launch B2C in Vietnam, then expand to enterprise upskilling.",
    "We're raising 500K to grow the team and scale to 10K daily users.",
  ],
};

/** Index by lowercased scenario title (DB rows). */
export const DIALOG_BY_TITLE: Record<string, ScenarioDialog> = {
  'order coffee at a café': COFFEE,
  'daily standup': STANDUP,
  'check-in at the airport': AIRPORT,
  'meet a new colleague': INTRODUCE,
  'make a restaurant reservation': RESTAURANT,
  'tell me about yourself': INTERVIEW,
  'at the doctor': DOCTOR,
  'pitch your idea': PRESENTATION,
};

/** Legacy: index by `sc-*` IDs for the in-memory mock backend. */
export const DIALOG_BY_ID: Record<string, ScenarioDialog> = {
  'sc-coffee': COFFEE,
  'sc-meeting': STANDUP,
  'sc-airport': AIRPORT,
  'sc-introduce': INTRODUCE,
  'sc-restaurant': RESTAURANT,
  'sc-interview': INTERVIEW,
  'sc-doctor': DOCTOR,
  'sc-presentation': PRESENTATION,
};

const FALLBACK_DIALOG: ScenarioDialog = {
  greeting: "Let's start practicing. Whenever you're ready, go ahead.",
  aiReplies: [
    'Tell me more about that.',
    'Interesting — what happened next?',
    'How did that make you feel?',
    "What's your take on that?",
    "Got it. Anything else you'd like to add?",
  ],
  userReplies: [
    'Sure, let me think...',
    'Well, it depends on the situation.',
    "I think it's an interesting question.",
    "Honestly, I'm not sure but here's what I think.",
    "That's about it for now.",
  ],
};

/** Look up dialog by either scenario title (DB) or `sc-*` id (mock). */
export function getDialog(opts: {
  id?: string | null;
  title?: string | null;
}): ScenarioDialog {
  if (opts.title) {
    const byTitle = DIALOG_BY_TITLE[opts.title.toLowerCase().trim()];
    if (byTitle) return byTitle;
  }
  if (opts.id) {
    const byId = DIALOG_BY_ID[opts.id];
    if (byId) return byId;
  }
  return FALLBACK_DIALOG;
}
