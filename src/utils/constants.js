export const SPORTS = [
  { value: 'baseball',   label: 'Baseball' },
  { value: 'basketball', label: 'Basketball' },
  { value: 'softball',   label: 'Softball' },
]

export const JOB_TYPES = [
  { value: 'full-time',  label: 'Full-Time' },
  { value: 'part-time',  label: 'Part-Time' },
  { value: 'contract',   label: 'Contract' },
  { value: 'seasonal',   label: 'Seasonal' },
  { value: 'volunteer',  label: 'Volunteer' },
  { value: 'gig',        label: 'Day-Of / Gig' },
]

export const JOB_CATEGORIES = [
  { value: 'coaching',           label: 'Coaching' },
  { value: 'officiating',        label: 'Officiating / Umpiring' },
  { value: 'athletic-training',  label: 'Athletic Training' },
  { value: 'equipment',          label: 'Equipment Management' },
  { value: 'facilities',         label: 'Facilities / Grounds' },
  { value: 'admin',              label: 'Administration' },
  { value: 'scouting',           label: 'Scouting / Analytics' },
  { value: 'strength',           label: 'Strength & Conditioning' },
  { value: 'media',              label: 'Media / Video' },
  { value: 'operations',         label: 'Game-Day Operations' },
]

export const RADIUS_OPTIONS = [
  { value: 5,   label: '5 miles' },
  { value: 10,  label: '10 miles' },
  { value: 25,  label: '25 miles' },
  { value: 50,  label: '50 miles' },
  { value: 100, label: '100 miles' },
]

export const BADGE_TYPES = {
  CORI:        { label: 'CORI Check',         color: 'blue',   icon: 'shield-check' },
  SAFESPORT:   { label: 'SafeSport',           color: 'green',  icon: 'heart-handshake' },
  FIRST_AID:   { label: 'First Aid',           color: 'red',    icon: 'cross' },
  CPR:         { label: 'CPR Certified',       color: 'red',    icon: 'activity' },
  AED:         { label: 'AED Certified',       color: 'orange', icon: 'zap' },
  CONCUSSION:  { label: 'Concussion Protocol', color: 'purple', icon: 'brain' },
  COACHING:    { label: 'Coaching Cert',       color: 'teal',   icon: 'award' },
}

export const APPLICATION_STATUS = {
  pending:   { label: 'Pending',   color: 'gray'   },
  reviewed:  { label: 'Reviewed',  color: 'blue'   },
  accepted:  { label: 'Accepted',  color: 'green'  },
  rejected:  { label: 'Rejected',  color: 'red'    },
  withdrawn: { label: 'Withdrawn', color: 'yellow' },
}

export const QUESTION_TYPES = [
  { value: 'text',     label: 'Short Answer' },
  { value: 'textarea', label: 'Long Answer' },
  { value: 'yesno',    label: 'Yes / No' },
  { value: 'select',   label: 'Multiple Choice' },
  { value: 'date',     label: 'Date' },
]

export const BOOST_PRICE_ID     = import.meta.env.VITE_STRIPE_PRICE_BOOST_SINGLE
export const BOOST_BUNDLE_PRICE = import.meta.env.VITE_STRIPE_PRICE_BOOST_BUNDLE

export const BOOST_RADIUS_MILES = 25
export const BOOST_DURATION_HRS = 48
