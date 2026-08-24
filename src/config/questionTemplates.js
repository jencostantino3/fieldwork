// Per-role suggested application questions.
// Each entry is an array of { type, text, required } matching the QUESTION_TYPES in constants.js.
// Loaded by PostJob when a job title is selected; employer can edit/delete/reorder/add before posting.

export const QUESTION_TEMPLATES = {

  // ── Coaching & Instruction ──────────────────────────────────────────────────

  'Head Coach': [
    { type: 'text',     text: 'How many years of coaching experience do you have?',                     required: true },
    { type: 'text',     text: 'What is the highest level of competition you have coached at?',          required: true },
    { type: 'textarea', text: 'Describe your coaching philosophy and approach to player development.',  required: true },
    { type: 'yesno',    text: 'Do you hold any coaching certifications (e.g., NFHS, PCA, USA Sport)?', required: false },
    { type: 'yesno',    text: 'Are you available for all scheduled practices and games?',               required: true },
  ],

  'Assistant Coach': [
    { type: 'text',     text: 'Describe your coaching or playing background.',                          required: true },
    { type: 'textarea', text: 'What specific areas of the game do you specialize in or enjoy coaching?', required: true },
    { type: 'yesno',    text: 'Are you available for all scheduled practices and games?',               required: true },
  ],

  'Pitching Coach': [
    { type: 'text',     text: 'What level did you pitch at competitively?',                            required: true },
    { type: 'textarea', text: 'Describe your approach to teaching pitching mechanics and sequencing.',  required: true },
    { type: 'yesno',    text: 'Do you have experience using video analysis in your instruction?',       required: false },
  ],

  'Hitting Coach': [
    { type: 'text',     text: 'What level did you play at as a hitter?',                               required: true },
    { type: 'textarea', text: 'Describe your hitting instruction philosophy and methods.',               required: true },
    { type: 'yesno',    text: 'Do you have experience using video or data tools in your instruction?',  required: false },
  ],

  'Catching Coach': [
    { type: 'text',     text: 'What level did you catch at competitively?',                            required: true },
    { type: 'textarea', text: 'What catching skills do you prioritize when working with young catchers?', required: true },
    { type: 'yesno',    text: 'Do you have experience working with catchers on pitch calling?',         required: false },
  ],

  'Defensive Coach': [
    { type: 'text',     text: 'What position(s) did you play, and at what level?',                     required: true },
    { type: 'textarea', text: 'How do you approach teaching defensive positioning and communication?',  required: true },
    { type: 'yesno',    text: 'Do you have prior coaching experience in a defensive coordinator role?', required: false },
  ],

  'Base Coach': [
    { type: 'text',     text: 'Describe your playing or coaching background.',                          required: true },
    { type: 'textarea', text: 'What factors do you consider when sending or holding a base runner?',    required: true },
  ],

  'Youth Coach': [
    { type: 'text',     text: 'What age groups have you coached before?',                              required: true },
    { type: 'textarea', text: 'How do you create a positive and inclusive environment for young athletes?', required: true },
    { type: 'yesno',    text: 'Are you willing to undergo a background check?',                        required: true },
    { type: 'yesno',    text: 'Do you have current First Aid / CPR certification?',                    required: false },
  ],

  'Camp Instructor': [
    { type: 'text',     text: 'What camp or clinic experience do you have?',                           required: true },
    { type: 'textarea', text: 'What skill stations or areas are you most comfortable leading?',        required: true },
    { type: 'yesno',    text: 'Are you available for all camp dates listed?',                          required: true },
  ],

  'Private Instructor': [
    { type: 'text',     text: 'What credentials, certifications, or experience qualify you for private instruction?', required: true },
    { type: 'textarea', text: 'How do you structure a typical one-on-one session?',                    required: true },
    { type: 'yesno',    text: 'Do you have your own facility or training space available?',            required: false },
  ],

  // ── Officiating ─────────────────────────────────────────────────────────────

  'Umpire': [
    { type: 'text',     text: 'What level(s) of play have you umpired (youth, high school, college, adult)?', required: true },
    { type: 'text',     text: 'What officiating certifications or associations are you affiliated with?',      required: true },
    { type: 'yesno',    text: 'Are you available for all assigned game dates?',                               required: true },
  ],

  'Referee': [
    { type: 'text',     text: 'What sport(s) and level(s) have you refereed?',                               required: true },
    { type: 'text',     text: 'What officiating certifications or leagues are you affiliated with?',          required: true },
    { type: 'yesno',    text: 'Are you available for all assigned game dates?',                               required: true },
  ],

  'Line Judge': [
    { type: 'text',     text: 'Do you have any prior officiating or line judge experience?',                  required: false },
    { type: 'yesno',    text: 'Are you available for all assigned dates?',                                    required: true },
  ],

  'Official Scorer': [
    { type: 'textarea', text: 'Describe your experience with game scoring and statistical record-keeping.',   required: true },
    { type: 'yesno',    text: 'Are you familiar with official scoring software or scorebook systems?',        required: false },
  ],

  'Shot Clock Operator': [
    { type: 'yesno',    text: 'Have you operated a shot clock or timing system before?',                     required: false },
    { type: 'yesno',    text: 'Are you available for all assigned game dates?',                               required: true },
  ],

  'Head Official': [
    { type: 'text',     text: 'How many years have you officiated, and at what levels?',                     required: true },
    { type: 'text',     text: 'What officiating certifications do you hold?',                                 required: true },
    { type: 'textarea', text: 'Describe your experience managing officiating crews.',                         required: true },
  ],

  // ── Tournament & Event Operations ────────────────────────────────────────────

  'Tournament Director': [
    { type: 'text',     text: 'How many tournaments have you directed, and at what scale?',                   required: true },
    { type: 'textarea', text: 'Describe your process for handling scheduling conflicts or disputes on the day of an event.', required: true },
    { type: 'yesno',    text: 'Are you comfortable using tournament management software?',                    required: false },
  ],

  'Event Coordinator': [
    { type: 'textarea', text: 'Describe your experience coordinating sports events or large group activities.', required: true },
    { type: 'yesno',    text: 'Are you comfortable managing vendors and volunteers on-site?',                 required: false },
    { type: 'yesno',    text: 'Are you available for setup, event day, and teardown?',                        required: true },
  ],

  'Field / Court Setup Crew': [
    { type: 'yesno',    text: 'Are you comfortable with physical outdoor labor (dragging infields, setting bases, lining fields)?', required: true },
    { type: 'yesno',    text: 'Are you available for all event dates including early morning setup?',          required: true },
  ],

  'Scoreboard Operator': [
    { type: 'yesno',    text: 'Have you operated a scoreboard system before?',                                required: false },
    { type: 'yesno',    text: 'Are you available for all assigned game dates?',                               required: true },
  ],

  'PA Announcer': [
    { type: 'text',     text: 'Describe your public address, broadcasting, or announcing experience.',        required: true },
    { type: 'yesno',    text: 'Can you provide a voice demo or prior recording?',                             required: false },
    { type: 'yesno',    text: 'Are you available for all assigned event dates?',                              required: true },
  ],

  'Gate / Ticket Staff': [
    { type: 'yesno',    text: 'Do you have customer service or cash handling experience?',                    required: false },
    { type: 'yesno',    text: 'Are you available for all assigned event dates?',                              required: true },
  ],

  'Concessions Staff': [
    { type: 'yesno',    text: 'Do you hold a current food handler certification?',                            required: false },
    { type: 'yesno',    text: 'Do you have experience handling cash or card transactions?',                   required: false },
    { type: 'yesno',    text: 'Are you available for all event dates?',                                       required: true },
  ],

  'Parking Attendant': [
    { type: 'yesno',    text: 'Are you comfortable working outdoors in varying weather conditions?',          required: true },
    { type: 'yesno',    text: 'Are you available for all assigned event dates?',                              required: true },
  ],

  'Volunteer Coordinator': [
    { type: 'textarea', text: 'Describe your experience recruiting and managing volunteers.',                  required: true },
    { type: 'yesno',    text: 'Are you comfortable using spreadsheets or volunteer management software?',     required: false },
  ],

  // ── Medical & Safety ─────────────────────────────────────────────────────────

  'Athletic Trainer': [
    { type: 'yesno',    text: 'Do you hold a current BOC certification?',                                     required: true },
    { type: 'text',     text: 'What state(s) are you licensed to practice in as an Athletic Trainer?',        required: true },
    { type: 'yesno',    text: 'Do you have current CPR/AED certification?',                                   required: true },
    { type: 'textarea', text: 'Describe your experience providing coverage for practices and games.',          required: true },
  ],

  'Team Physician': [
    { type: 'text',     text: 'What is your medical degree (MD or DO) and current state of licensure?',       required: true },
    { type: 'textarea', text: 'Describe your sports medicine experience and any specializations.',             required: true },
    { type: 'yesno',    text: 'Are you available for all home games and events?',                             required: true },
  ],

  'EMT / First Responder': [
    { type: 'text',     text: 'What is your current EMT certification level and issuing state?',              required: true },
    { type: 'yesno',    text: 'Do you have experience providing coverage at sporting events?',                 required: false },
    { type: 'yesno',    text: 'Are you available for all assigned event dates?',                              required: true },
  ],

  'Physical Therapist': [
    { type: 'text',     text: 'What state(s) are you licensed to practice Physical Therapy in?',              required: true },
    { type: 'textarea', text: 'Describe your experience with sports rehabilitation and injury prevention.',    required: true },
    { type: 'yesno',    text: 'Do you have experience working with athletes in a team setting?',               required: false },
  ],

  'Sports Nutritionist': [
    { type: 'text',     text: 'What nutrition credentials do you hold (RD, CSSD, or other)?',                 required: true },
    { type: 'textarea', text: 'Describe your experience providing nutrition guidance to athletes.',            required: true },
  ],

  // ── Media & Support ──────────────────────────────────────────────────────────

  'Photographer': [
    { type: 'text',     text: 'Please share a link to your photography portfolio or sample work.',            required: true },
    { type: 'yesno',    text: 'Do you have your own professional camera equipment?',                          required: true },
    { type: 'yesno',    text: 'Do you have experience shooting sports or action photography?',                required: false },
  ],

  'Videographer': [
    { type: 'text',     text: 'Please share a link to your videography reel or sample work.',                 required: true },
    { type: 'yesno',    text: 'Do you have your own camera and filming equipment?',                           required: true },
    { type: 'yesno',    text: 'Are you comfortable with basic editing and highlight delivery?',               required: false },
  ],

  'Social Media Manager': [
    { type: 'text',     text: 'Please share a link to a social account or portfolio you have managed.',       required: true },
    { type: 'textarea', text: 'Which platforms are you most experienced with, and how have you grown an audience?', required: true },
    { type: 'yesno',    text: 'Are you comfortable attending games or events to capture live content?',       required: false },
  ],

  'Statistician': [
    { type: 'textarea', text: 'Describe your experience tracking in-game statistics. What systems or software have you used?', required: true },
    { type: 'yesno',    text: 'Are you available for all assigned game dates?',                               required: true },
  ],

  'Broadcaster / Play-by-Play': [
    { type: 'text',     text: 'Please share a link to a demo reel or prior broadcast.',                       required: true },
    { type: 'textarea', text: 'Describe your play-by-play or broadcasting experience.',                       required: true },
    { type: 'yesno',    text: 'Are you comfortable broadcasting remotely or on-site?',                        required: false },
  ],

  'Graphic Designer': [
    { type: 'text',     text: 'Please share a link to your design portfolio.',                                required: true },
    { type: 'text',     text: 'What design software do you use (e.g., Adobe CC, Canva, Figma)?',             required: true },
    { type: 'yesno',    text: 'Do you have experience designing sports or athletic branding?',                required: false },
  ],

  // ── Administrative ───────────────────────────────────────────────────────────

  'League Administrator': [
    { type: 'textarea', text: 'Describe your sports administration or league management experience.',          required: true },
    { type: 'text',     text: 'What scheduling or league management software have you used?',                 required: false },
    { type: 'yesno',    text: 'Are you comfortable managing team registrations and communications?',          required: true },
  ],

  'Registration Coordinator': [
    { type: 'textarea', text: 'Describe your experience managing registrations and participant records.',      required: true },
    { type: 'text',     text: 'What registration platforms or software have you used?',                       required: false },
  ],

  'Office Manager': [
    { type: 'textarea', text: 'Describe your administrative or office management experience.',                 required: true },
    { type: 'text',     text: 'What productivity or office software are you proficient with?',                required: true },
  ],

  'Scheduler': [
    { type: 'textarea', text: 'Describe your experience building and managing game, practice, or event schedules.', required: true },
    { type: 'text',     text: 'What scheduling software or tools have you used?',                             required: false },
  ],

  'Compliance Officer': [
    { type: 'textarea', text: 'Describe your experience with sports compliance, eligibility, or rules enforcement.', required: true },
    { type: 'text',     text: 'Which governing bodies or associations are you familiar with?',                required: false },
  ],

  'Recruiting Coordinator': [
    { type: 'textarea', text: 'Describe your experience in recruiting or talent identification.',              required: true },
    { type: 'text',     text: 'What CRM, database, or recruiting tools have you used?',                       required: false },
    { type: 'yesno',    text: 'Are you comfortable making outbound calls or messages to prospects?',         required: false },
  ],
}
