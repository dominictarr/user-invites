var ref = require('ssb-ref')
var caps = {invite: require('./cap')}
var ssbKeys = require('ssb-keys')

function isObject (o) {
  return o && 'object' === typeof o
}

// signatures have a type (eg `.ed25519`) at the end,
// but not gonna check it right here.

function isSignature(b) {
  return /^[A-Za-z0-9\/\+]+.sig.\w+$/.test(b)
}

function isMaybeBase64(b) {
  return b === undefined || /^[A-Za-z0-9\/\+]+$/.test(b)
}

exports.isInvite = function (msg) {
  return isObject(msg) && isObject(msg.content) && (
    'user-invite' === msg.content.type &&
    ref.isFeed(msg.content.host) &&
    ref.isFeed(msg.content.invite) &&
    isMaybeBase64(msg.content.reveal) &&
    isMaybeBase64(msg.content.public) &&
    // signature must be valid !!!
    ssbKeys.verifyObj(msg.content.invite, caps.invite, msg.content)
  )
}

exports.isAccept = function (msg) {
  return isObject(msg) && isObject(msg.content) && (
    'user-invite/accept' === msg.content.type &&
    ref.isMsg(msg.content.receipt) &&
    isMaybeBase64(msg.content.key) &&
    // can't verify this without having the invite message.
    // (that's intentional, forces implementers not to cut corners,
    // but to check that the receipt is correct)
    isSignature(msg.content.signature)
  )
}

exports.isConfirm = function (msg) {
  return isObject(msg) && isObject(msg.content) && (
    'user-invite/confirm' === msg.content.type &&
    exports.isAccept(msg.content.embed)
  )
}
