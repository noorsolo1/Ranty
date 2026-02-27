require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const bcrypt = require('bcrypt');
const { getDb } = require('./database');
const { initSchema } = require('./schema');

initSchema();
const db = getDb();

const DEMO_EMAIL = 'demo@rantapp.com';
const DEMO_USERNAME = 'demo';
const DEMO_PASSWORD = 'demo1234';

// Check if demo user already exists
const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(DEMO_EMAIL);
if (existing) {
  console.log('Demo user already exists. Skipping seed.');
  process.exit(0);
}

const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);
const insertUser = db.prepare(
  'INSERT INTO users (email, username, password) VALUES (?, ?, ?)'
);
const userResult = insertUser.run(DEMO_EMAIL, DEMO_USERNAME, hash);
const userId = userResult.lastInsertRowid;

console.log(`Created demo user id=${userId}`);

// 18 rant entries over 90 days
const now = Date.now();
const day = 86400000;

const rants = [
  {
    daysAgo: 2,
    hour: 8,
    transcript:
      "I can't believe the traffic this morning. I sat in that same spot on the highway for forty-five minutes doing absolutely nothing. I'm going to be late AGAIN and my boss is already on my case. This commute is destroying my mental health. I leave earlier every day and it keeps getting worse. I genuinely hate driving now.",
    emotions: ['angry', 'frustrated', 'anxious'],
    trigger_keywords: ['traffic', 'highway', 'commute', 'boss', 'late'],
    ai_summary:
      'You seem deeply frustrated with your daily commute, which is now affecting your relationship with your boss and your overall mental wellbeing. The repeated experience of being late despite leaving earlier suggests a growing sense of helplessness. It might help to explore alternative routes or remote work options.',
    sentiment_score: -0.8,
  },
  {
    daysAgo: 5,
    hour: 22,
    transcript:
      "My partner left dishes in the sink AGAIN. We have literally had this conversation twenty times. I do all the cleaning, I do all the cooking, and the one thing I ask is just put your dishes in the dishwasher. Is that too much? I'm so tired of feeling like a maid in my own home. It's not even about the dishes anymore.",
    emotions: ['angry', 'sad', 'frustrated'],
    trigger_keywords: ['dishes', 'cleaning', 'partner', 'home', 'tired'],
    ai_summary:
      "You're expressing a deeper frustration about feeling unappreciated and unseen in your relationship. The dishes are a symbol of a larger imbalance in household labor that's been building for a while. Having a calm, direct conversation about shared responsibilities when you're not actively upset might help shift things.",
    sentiment_score: -0.75,
  },
  {
    daysAgo: 8,
    hour: 14,
    transcript:
      "I just opened my credit card statement and almost had a heart attack. How is it possible I spent that much last month? I thought I was being careful. I'm so bad with money. I'm never going to be able to save enough for a house. Everyone my age seems to be buying property and I can barely cover rent. I feel like such a failure.",
    emotions: ['anxious', 'sad', 'ashamed'],
    trigger_keywords: ['credit card', 'money', 'rent', 'house', 'savings'],
    ai_summary:
      "You're experiencing significant financial anxiety and comparing yourself unfavorably to your peers, which is intensifying feelings of shame. It's worth remembering that social media often shows a curated version of others' financial situations. Creating a simple budget review this week could give you a clearer, less overwhelming picture.",
    sentiment_score: -0.7,
  },
  {
    daysAgo: 12,
    hour: 10,
    transcript:
      "My boss shot down my idea in the meeting again. In front of everyone. Didn't even let me finish explaining. Just said 'that won't work' and moved on. I spent two weeks on that proposal. Two weeks. I don't even want to bring ideas anymore. What's the point? My creativity is just getting slowly killed in this job.",
    emotions: ['angry', 'sad', 'discouraged'],
    trigger_keywords: ['boss', 'idea', 'meeting', 'proposal', 'creativity'],
    ai_summary:
      "You're feeling professionally dismissed and demoralized after your boss rejected your idea publicly without hearing you out. This repeated experience is eroding your motivation and willingness to contribute. Documenting your ideas and seeking feedback from trusted colleagues before meetings might help you build confidence and allies.",
    sentiment_score: -0.72,
  },
  {
    daysAgo: 15,
    hour: 2,
    transcript:
      "It's 2am and I can't sleep because I keep thinking about that weird pain in my side. I've had it for a week and I've been googling symptoms which I know I shouldn't do but I can't stop. Everything I read says it could be something serious. I don't have good insurance. What if it's something bad and I just can't afford to deal with it?",
    emotions: ['anxious', 'scared', 'overwhelmed'],
    trigger_keywords: ['pain', 'symptoms', 'insurance', 'health', 'sleep'],
    ai_summary:
      "You're caught in a late-night anxiety spiral amplified by health-related internet searching, which almost always leads to worst-case scenarios. The financial barrier to healthcare is adding a real layer of helplessness to an already stressful situation. Try scheduling a telehealth appointment, which is often more affordable, rather than letting uncertainty grow.",
    sentiment_score: -0.85,
  },
  {
    daysAgo: 18,
    hour: 19,
    transcript:
      "My friend cancelled on me AGAIN last minute. This is the third time this month. I had been looking forward to tonight all week. I already cancelled my other plans because of this. I'm starting to wonder if I'm just not a priority to anyone. Maybe I put in too much effort for people who don't value my time.",
    emotions: ['sad', 'lonely', 'frustrated'],
    trigger_keywords: ['friend', 'cancelled', 'plans', 'priority', 'effort'],
    ai_summary:
      "You're feeling repeatedly let down and undervalued in your friendship, and this is feeding into deeper feelings of loneliness and low self-worth. Three cancellations in a month is a real pattern worth addressing. An honest conversation with your friend about how this affects you, rather than silently absorbing the disappointment, could clarify whether this friendship is reciprocal.",
    sentiment_score: -0.65,
  },
  {
    daysAgo: 22,
    hour: 11,
    transcript:
      "I hate grocery shopping. I went in for five things and somehow spent eighty dollars. Inflation is absolutely insane right now. I remember when eggs were like two dollars. Now everything costs twice as much and my salary hasn't gone up at all. I feel like I'm working harder just to fall further behind. This economy is genuinely terrifying.",
    emotions: ['frustrated', 'anxious', 'overwhelmed'],
    trigger_keywords: ['grocery', 'inflation', 'salary', 'eggs', 'economy'],
    ai_summary:
      "You're feeling the real financial squeeze of rising costs against stagnant wages, and the grocery store became a concrete reminder of that imbalance today. This is a widespread stressor right now and your frustration is completely valid. Looking at meal planning or store-brand alternatives might offer small relief while you work on longer-term financial strategies.",
    sentiment_score: -0.6,
  },
  {
    daysAgo: 25,
    hour: 23,
    transcript:
      "Still waiting for my test results. It's been eight days. The doctor said five to seven. I've called twice and they say they'll follow up. I can't focus on anything. Every time my phone buzzes I think it's going to be them. I'm just living in this horrible limbo state where I can't plan anything or think about anything else.",
    emotions: ['anxious', 'scared', 'overwhelmed'],
    trigger_keywords: ['test results', 'doctor', 'waiting', 'phone', 'limbo'],
    ai_summary:
      "You're stuck in the particularly difficult experience of medical uncertainty, where the unknown is becoming more distressing than any concrete answer would be. The inability to move forward in other areas of life while waiting is a form of anxiety that many people struggle with. Calling once more and firmly requesting a specific timeline or escalation point could help restore your sense of agency.",
    sentiment_score: -0.82,
  },
  {
    daysAgo: 30,
    hour: 20,
    transcript:
      "I spent like an hour scrolling Instagram and now I feel terrible about myself. Everyone seems to be on vacation or getting promoted or buying houses or getting engaged. My life feels completely stagnant in comparison. I know it's not real, I know it's a highlight reel, but it doesn't matter because I still feel like garbage after looking at it.",
    emotions: ['sad', 'ashamed', 'discouraged'],
    trigger_keywords: ['instagram', 'social media', 'comparison', 'vacation', 'promotion'],
    ai_summary:
      "You're experiencing the classic social media comparison trap, and you're even aware that it's distorted — but knowing that doesn't make the emotional impact less real. The fact that you feel stagnant suggests you might have some unmet goals that are worth examining separately from what others appear to be doing. Unfollowing accounts that consistently trigger this feeling is a valid and healthy boundary.",
    sentiment_score: -0.55,
  },
  {
    daysAgo: 35,
    hour: 16,
    transcript:
      "My mom called again to tell me I should be saving more for retirement and that I'm making bad financial decisions. I'm thirty-two years old. I know she means well but it makes me feel so incompetent every time. Like I can't do anything right in her eyes. I've been trying to be more independent and this just sets me back mentally every time.",
    emotions: ['frustrated', 'sad', 'ashamed'],
    trigger_keywords: ['mom', 'retirement', 'finances', 'advice', 'independence'],
    ai_summary:
      "You're navigating the tension between genuine parental care and the undermining effect unsolicited advice has on your confidence. Your mother likely does worry about you, but the delivery is damaging your sense of competence. Setting a gentle but clear boundary, like asking her to trust your process unless you ask for input, might protect your mental space.",
    sentiment_score: -0.5,
  },
  {
    daysAgo: 40,
    hour: 21,
    transcript:
      "I got a work email on a Saturday night. A Saturday. They want a full report by Monday morning that they didn't tell me about until right now. My weekend is just ruined. I had actual plans. I feel like I can never really switch off. There's no boundary between work and life anymore and I don't know how to fix it.",
    emotions: ['angry', 'frustrated', 'overwhelmed'],
    trigger_keywords: ['work email', 'weekend', 'boundary', 'report', 'plans'],
    ai_summary:
      "You're feeling the very real erosion of work-life boundaries, with a last-minute weekend request becoming the breaking point. The inability to truly disconnect is a chronic stressor that compounds over time. Addressing this proactively with your manager about communication expectations, rather than just absorbing each incident, would be a meaningful step.",
    sentiment_score: -0.7,
  },
  {
    daysAgo: 45,
    hour: 9,
    transcript:
      "My landlord just told me my rent is going up three hundred dollars next month. Three hundred. I've been a perfect tenant for three years, never late, never complain. And now I just have to accept this or move out. Moving costs more than the rent increase. I feel completely trapped. Housing is just not affordable anymore for normal people.",
    emotions: ['angry', 'anxious', 'overwhelmed'],
    trigger_keywords: ['rent', 'landlord', 'housing', 'money', 'trapped'],
    ai_summary:
      "You're feeling financially cornered by a significant rent increase that makes both staying and leaving painful options. The sense of being punished for being a good tenant adds to the injustice of it. Researching local renter protection laws and looking at the broader housing market, even just to understand your actual options, can help reduce the feeling of total helplessness.",
    sentiment_score: -0.78,
  },
  {
    daysAgo: 52,
    hour: 15,
    transcript:
      "My car needs a fifteen hundred dollar repair that I absolutely do not have. The mechanic said it's not safe to drive without fixing it. So now I either go into debt or I can't get to work. I hate that one unexpected expense can completely derail my life. I have no safety net. I feel so financially fragile all the time.",
    emotions: ['anxious', 'scared', 'overwhelmed'],
    trigger_keywords: ['car', 'repair', 'mechanic', 'debt', 'safety net'],
    ai_summary:
      "You're facing the classic financial emergency that exposes the absence of a buffer, and the feeling of fragility that creates is real and exhausting. One unexpected cost becoming a potential job risk shows how tightly wound your current situation is. If possible, getting a second mechanic opinion and asking about a payment plan are concrete first steps before taking on high-interest debt.",
    sentiment_score: -0.8,
  },
  {
    daysAgo: 58,
    hour: 18,
    transcript:
      "I got into a huge argument with my sister today. She said I always make everything about myself and I just lost it. I don't think that's fair at all. If anything she never asks how I'm doing. It turned into this whole thing about our childhood and things that happened years ago. I don't know how to have a conversation with her without it exploding.",
    emotions: ['angry', 'sad', 'frustrated'],
    trigger_keywords: ['sister', 'argument', 'family', 'childhood', 'conversation'],
    ai_summary:
      "You had an argument with your sister that quickly escalated into old family dynamics and unresolved history, which is a sign that there are deeper patterns at play beyond today's disagreement. These cycles are often hard to break without both people stepping back from the heat of the moment. Consider what it would look like to revisit the conversation when you're both calmer and more grounded.",
    sentiment_score: -0.68,
  },
  {
    daysAgo: 65,
    hour: 13,
    transcript:
      "Got a rejection email from the job I really wanted. I made it to the final round and then nothing. They said they went with someone with more experience. I've been trying to advance my career for two years and I feel like I'm just running in place. Maybe I'm not as capable as I thought I was. This one really stings.",
    emotions: ['sad', 'discouraged', 'ashamed'],
    trigger_keywords: ['rejection', 'job', 'career', 'interview', 'experience'],
    ai_summary:
      "You're dealing with the particular pain of a near-miss rejection, where getting close but not succeeding can feel worse than an early-stage no. The hit to your self-confidence after two years of trying is understandable, but making it to the final round shows you're competitive for these roles. Asking for specific feedback from this company and keeping that perspective might help reframe what this result actually means.",
    sentiment_score: -0.72,
  },
  {
    daysAgo: 72,
    hour: 1,
    transcript:
      "My neighbor is having a party and it's one in the morning and I have to be up at six for work. I've knocked on the door twice. They just turned it down for five minutes and cranked it back up. I have work tomorrow. I'm exhausted and I can't sleep and I'm just lying here furious in the dark.",
    emotions: ['angry', 'frustrated', 'overwhelmed'],
    trigger_keywords: ['neighbor', 'noise', 'sleep', 'work', 'party'],
    ai_summary:
      "You're dealing with a sleep deprivation situation completely outside your control, and the repeated failure of polite intervention is justifiably infuriating. Sleep disruption before a work day is a legitimate health concern, not just an inconvenience. If this is a recurring issue, a formal complaint to building management or a non-emergency noise ordinance call may be warranted.",
    sentiment_score: -0.75,
  },
  {
    daysAgo: 80,
    hour: 17,
    transcript:
      "I went to the gym today for the first time in months and I felt completely out of place. Everyone seemed to know exactly what they were doing and I was just fumbling around with the machines, probably looking ridiculous. Someone was staring at me the whole time I think. I left early. I wanted to start being healthier but now I don't want to go back.",
    emotions: ['anxious', 'ashamed', 'discouraged'],
    trigger_keywords: ['gym', 'workout', 'anxiety', 'embarrassment', 'health'],
    ai_summary:
      "You experienced social anxiety at the gym that led you to leave before finishing, and now you're at risk of avoiding it entirely based on one uncomfortable experience. Almost everyone at the gym is focused on their own workout, not watching others, even though it doesn't feel that way. Going at a quieter time, like early morning or midday, or doing an online program at home temporarily might help you rebuild the habit with less pressure.",
    sentiment_score: -0.6,
  },
  {
    daysAgo: 88,
    hour: 9,
    transcript:
      "I overslept by two hours this morning and missed a meeting. I set three alarms. How does that even happen? I've been so exhausted lately that I just sleep right through everything. My sleep schedule is completely broken. I feel like I can't even take care of basic things like waking up on time. It's embarrassing. I'm a grown adult.",
    emotions: ['ashamed', 'frustrated', 'sad'],
    trigger_keywords: ['oversleeping', 'alarms', 'meeting', 'exhaustion', 'sleep'],
    ai_summary:
      "Oversleeping through multiple alarms signals that your body is in a significant sleep debt, not a willpower failure, and the shame you're feeling is making the underlying issue harder to address. Chronic exhaustion affecting basic functioning is worth taking seriously as a health matter, not a character flaw. Looking at your sleep environment and schedule, or speaking to a doctor if this is ongoing, could be more productive than self-criticism.",
    sentiment_score: -0.65,
  },
];

const insertRant = db.prepare(`
  INSERT INTO rants (
    user_id, title, transcript, audio_filename, duration_sec, recorded_at,
    emotions, trigger_keywords, ai_summary, sentiment_score, hour_of_day
  ) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((rants) => {
  for (const rant of rants) {
    const recordedAt = new Date(now - rant.daysAgo * day);
    recordedAt.setHours(rant.hour, Math.floor(Math.random() * 60), 0, 0);
    const title = rant.transcript.slice(0, 60).replace(/\n/g, ' ');
    const durationSec = Math.floor(rant.transcript.length / 15) + Math.floor(Math.random() * 30);

    insertRant.run(
      userId,
      title,
      rant.transcript,
      durationSec,
      recordedAt.toISOString().replace('T', ' ').slice(0, 19),
      JSON.stringify(rant.emotions),
      JSON.stringify(rant.trigger_keywords),
      rant.ai_summary,
      rant.sentiment_score,
      rant.hour
    );
  }
});

insertMany(rants);

console.log(`Seeded ${rants.length} rants for demo user.`);
console.log('Login: demo@rantapp.com / demo1234');
