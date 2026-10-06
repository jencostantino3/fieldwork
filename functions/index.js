const stripe        = require('./src/stripe')
const rapidFill     = require('./src/rapidFill')
const checklist     = require('./src/checklist')
const email         = require('./src/email')
const notifications = require('./src/notifications')

exports.createSubscriptionCheckout = stripe.createSubscriptionCheckout
exports.createBillingPortal        = stripe.createBillingPortal
exports.createBoostCheckout        = stripe.createBoostCheckout
exports.stripeWebhook              = stripe.stripeWebhook

exports.expireRapidFillHolds = rapidFill.expireRapidFillHolds

exports.onChecklistTaskComplete = checklist.onChecklistTaskComplete

exports.onApplicationCreated       = email.onApplicationCreated
exports.onApplicationStatusChanged = email.onApplicationStatusChanged

exports.sendRapidFillAlert = notifications.sendRapidFillAlert
