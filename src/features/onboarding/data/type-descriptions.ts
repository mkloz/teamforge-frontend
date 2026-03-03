export interface PersonalityTypeInfo {
  letters: string;
  name: string;
  tagline: string;
  about: string;
  inGroups: string;
}

export const TYPE_DESCRIPTIONS: Record<string, PersonalityTypeInfo> = {
  INTJ: {
    letters: "INTJ",
    name: "The Architect",
    tagline: "Independent, strategic, and driven by a vision only they can fully see.",
    about:
      "You process the world through systems and patterns. Where others see complexity, you see structure waiting to be understood. You are deliberate, self-directed, and hold yourself to standards most people never consider. You do not need external validation — your internal compass is precise.",
    inGroups:
      "In a group, you are the quiet strategist. You think several steps ahead, offer precision when others are still debating, and tend to take initiative when the plan is unclear. You work best when given autonomy and respect.",
  },
  INTP: {
    letters: "INTP",
    name: "The Thinker",
    tagline: "Endlessly curious, logically precise, and drawn to ideas for their own sake.",
    about:
      "Your mind is never fully at rest. You are constantly questioning assumptions, building mental models, and exploring possibilities that others walk right past. You value intellectual honesty over social comfort and prefer to get things exactly right rather than approximately right quickly.",
    inGroups:
      "In a group, you are the one who asks the question nobody else thought to ask. You bring rigorous thinking and an ability to spot flaws in a plan before anyone acts on it. You thrive when the group values depth over speed.",
  },
  ENTJ: {
    letters: "ENTJ",
    name: "The Commander",
    tagline: "Strategic, direct, and energized by leading others toward a goal.",
    about:
      "You enter a room and instinctively see what needs to be organized. Chaos does not frustrate you — it motivates you. You are decisive, forward-thinking, and unafraid to take charge when no one else will. You hold high standards for yourself and the people around you.",
    inGroups:
      "In a group, you move things forward. You push for decisions, keep energy high, and are not afraid to redirect the conversation when it drifts. Others look to you for direction, even when no formal role has been assigned.",
  },
  ENTP: {
    letters: "ENTP",
    name: "The Debater",
    tagline: "Quick-witted, idea-driven, and genuinely energized by intellectual friction.",
    about:
      "You love a good argument — not to win, but to discover. You are fast on your feet, generate ideas at an unusual rate, and have a talent for flipping problems upside down to find an unexpected angle. Boredom is your main enemy.",
    inGroups:
      "In a group, you are the one who challenges the plan just as everyone is ready to execute. This can frustrate, but it also prevents mistakes. You bring energy, lateral thinking, and a willingness to say the thing nobody else dared to.",
  },
  INFJ: {
    letters: "INFJ",
    name: "The Advocate",
    tagline: "Deeply empathic, visionary, and quietly driven to make things better.",
    about:
      "You see beneath the surface of situations and people with unusual clarity. Your convictions run deep, and you are motivated not by recognition but by the sense that what you are doing matters. You are rare: someone who combines empathy with vision.",
    inGroups:
      "In a group, you bring depth and purpose. You notice the emotional undercurrents others miss and quietly steer the group toward something more meaningful than the original plan. You do your best work when the group's goal aligns with your values.",
  },
  INFP: {
    letters: "INFP",
    name: "The Idealist",
    tagline: "Deeply values-driven, imaginative, and quietly fiercely passionate.",
    about:
      "You carry a rich inner world that most people never see. You are guided by your values more than rules, and you hold a strong sense of what could be — even when the present falls short. Authenticity matters deeply to you, and you can sense inauthenticity immediately.",
    inGroups:
      "In a group, you bring heart and creativity. You tend to be the moral compass, gently redirecting when things feel off, and the creative wellspring when the group needs a fresh idea. You need a group that respects what matters to you.",
  },
  ENFJ: {
    letters: "ENFJ",
    name: "The Protagonist",
    tagline: "Inspiring, people-focused, and naturally gifted at bringing out the best in others.",
    about:
      "You see the potential in people, often before they see it themselves. You are warm, persuasive, and have a natural ability to read the emotional climate of a room. You are energized by helping others grow, and you take that responsibility seriously.",
    inGroups:
      "In a group, you are the glue. You make sure everyone feels included, articulate what the group is feeling, and translate diverse perspectives into a shared direction. You bring people together in a way that does not feel forced.",
  },
  ENFP: {
    letters: "ENFP",
    name: "The Campaigner",
    tagline: "Enthusiastic, imaginative, and genuinely fascinated by people and possibilities.",
    about:
      "You see almost everything as connected. You move through the world with curiosity and enthusiasm, forming fast, genuine connections with people and ideas. You are energized by novelty and have a gift for seeing potential where others see constraints.",
    inGroups:
      "In a group, you are the spark. Your enthusiasm is contagious, your ideas come quickly, and you excel at connecting people across differences. You need a group that moves and stays alive — stagnation is your kryptonite.",
  },
  ISTJ: {
    letters: "ISTJ",
    name: "The Inspector",
    tagline: "Methodical, dependable, and committed to doing things the right way.",
    about:
      "You bring order to the world around you. You are thorough, consistent, and deeply reliable — when you say something will be done, it will be done. You take your responsibilities seriously and believe that the details matter, because they do.",
    inGroups:
      "In a group, you are the one who actually makes sure things happen. You track what was agreed, hold others accountable, and ensure nothing falls through the cracks. The group may not always notice you, but they would notice immediately if you were gone.",
  },
  ISFJ: {
    letters: "ISFJ",
    name: "The Defender",
    tagline: "Warm, attentive, and quietly devoted to the people and things they care about.",
    about:
      "You notice things — a shift in someone's mood, a detail others overlooked, a need that was never voiced. You are quietly attentive and deeply caring, and you show it through consistent, practical acts rather than grand declarations.",
    inGroups:
      "In a group, you create safety. People relax around you. You handle the logistics others forget, check in on members who seem off, and ensure the experience is positive for everyone, not just the loudest voices.",
  },
  ESTJ: {
    letters: "ESTJ",
    name: "The Executive",
    tagline: "Organized, decisive, and effective at turning plans into results.",
    about:
      "You are built for execution. You think clearly, decide quickly, and implement without hesitation. You believe in structure because structure works, and you have little patience for ambiguity that could be easily resolved with clear roles and expectations.",
    inGroups:
      "In a group, you establish order. You clarify who is doing what, set timelines, and keep energy focused on the goal. The group moves faster when you are involved, and you expect everyone to pull their weight.",
  },
  ESFJ: {
    letters: "ESFJ",
    name: "The Consul",
    tagline: "Sociable, caring, and genuinely invested in the people around them.",
    about:
      "People are your world. You are attuned to the needs and feelings of those around you and go out of your way to ensure everyone feels valued and included. You have a talent for creating warm environments where people feel comfortable being themselves.",
    inGroups:
      "In a group, you are the social architect. You make introductions, smooth tensions, and keep the atmosphere positive. You are the reason a group feels like a group rather than just a collection of individuals.",
  },
  ISTP: {
    letters: "ISTP",
    name: "The Craftsman",
    tagline: "Practical, observant, and exceptionally good at understanding how things work.",
    about:
      "You learn by doing. You are calm under pressure, mechanically intuitive, and skilled at finding the most efficient solution to whatever problem is in front of you. You prefer action over discussion, and results over process.",
    inGroups:
      "In a group, you are the one who actually fixes the problem while others are still talking about it. You are direct, pragmatic, and bring a hands-on energy that other types rarely can. You work best in groups that respect competence.",
  },
  ISFP: {
    letters: "ISFP",
    name: "The Artist",
    tagline: "Gentle, present, and deeply in tune with beauty, feeling, and the moment.",
    about:
      "You experience the world with unusual sensitivity. You notice beauty, subtlety, and emotional truth in places others rush past. You are gentle, non-judgmental, and authentic — what you say is what you mean, and you expect the same from others.",
    inGroups:
      "In a group, you bring an authentic and grounding presence. You do not push your opinions loudly, but when you do speak, it is worth hearing. You help the group slow down and notice what they might be missing.",
  },
  ESTP: {
    letters: "ESTP",
    name: "The Entrepreneur",
    tagline: "Bold, perceptive, and electrically alive in the present moment.",
    about:
      "You are at your best when things are happening. You read the room instantly, act on instinct, and have a talent for making things work in real time. You are confident, charismatic, and thrive on challenges that require fast thinking.",
    inGroups:
      "In a group, you bring momentum. You push for action when the group starts over-analyzing, notice opportunities in the environment others miss, and have an infectious energy that gets people moving. You keep things real.",
  },
  ESFP: {
    letters: "ESFP",
    name: "The Entertainer",
    tagline: "Spontaneous, warm, and genuinely excited about life and the people in it.",
    about:
      "You are the person in the room who makes everyone feel immediately at ease. You are expressive, generous with your energy, and have a rare ability to be fully present in whatever is happening right now. You make ordinary moments feel special.",
    inGroups:
      "In a group, you set the tone. Your enthusiasm is contagious, you break tension instinctively, and you have an ability to read what the group needs emotionally and deliver it. You turn a group of strangers into something that feels like a group.",
  },
};

export const OCEAN_LABELS: Record<string, { label: string; lowLabel: string; highLabel: string }> = {
  O: { label: "Openness", lowLabel: "Practical", highLabel: "Curious" },
  C: { label: "Organization", lowLabel: "Flexible", highLabel: "Disciplined" },
  E: { label: "Energy", lowLabel: "Reserved", highLabel: "Outgoing" },
  A: { label: "Warmth", lowLabel: "Direct", highLabel: "Empathic" },
  N: { label: "Stability", lowLabel: "Sensitive", highLabel: "Steady" },
};
