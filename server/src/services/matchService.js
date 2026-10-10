const Item = require('../models/Item');
const Match = require('../models/Match');
const { createNotification } = require('./notificationService');
const { ITEM_TYPES, ITEM_STATUSES, MATCH_STATUSES, NOTIFICATION_TYPES } = require('../utils/constants');

// ─── Scoring weights (total max = 100) ───────────────────────────────────────
const WEIGHTS = {
  CATEGORY: 30,
  NAME: 25,
  COLOUR: 15,
  BRAND: 15,
  LOCATION: 10,
  DATE: 5,
};

const MATCH_THRESHOLD = 50;
const DATE_WINDOW_DAYS = 7;

/** Normalise a string for comparison */
const normalise = (str) => (str || '').toLowerCase().trim();

/** Token overlap score (0–1) between two strings */
const tokenOverlap = (a, b) => {
  const tokensA = new Set(normalise(a).split(/\s+/).filter(Boolean));
  const tokensB = new Set(normalise(b).split(/\s+/).filter(Boolean));
  if (!tokensA.size || !tokensB.size) return 0;
  const intersection = [...tokensA].filter((t) => tokensB.has(t)).length;
  return intersection / Math.max(tokensA.size, tokensB.size);
};

/** Exact normalised match */
const exactMatch = (a, b) => !!a && !!b && normalise(a) === normalise(b);

/** Date proximity score: 1 if within window, otherwise 0 */
const datePriorityScore = (d1, d2) => {
  if (!d1 || !d2) return 0;
  const diffMs = Math.abs(new Date(d1) - new Date(d2));
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= DATE_WINDOW_DAYS ? 1 : 0;
};

/**
 * Score a (lost, found) pair. Returns 0–100.
 */
const scorePair = (lost, found) => {
  let score = 0;
  if (exactMatch(lost.category, found.category)) score += WEIGHTS.CATEGORY;
  score += tokenOverlap(lost.name, found.name) * WEIGHTS.NAME;
  if (exactMatch(lost.colour, found.colour)) score += WEIGHTS.COLOUR;
  if (exactMatch(lost.brand, found.brand)) score += WEIGHTS.BRAND;
  score += tokenOverlap(lost.location, found.location) * WEIGHTS.LOCATION;
  score += datePriorityScore(lost.dateReported, found.dateReported) * WEIGHTS.DATE;
  return Math.round(score);
};

/**
 * Run match generation whenever a new item is saved.
 * Compares the new item against all active items of the opposite type.
 */
const generateMatches = async (newItem) => {
  try {
    const oppositeType = newItem.type === ITEM_TYPES.LOST ? ITEM_TYPES.FOUND : ITEM_TYPES.LOST;

    const candidates = await Item.find({
      type: oppositeType,
      status: ITEM_STATUSES.ACTIVE,
      category: newItem.category, // Quick pre-filter — category always worth 30 pts
    }).populate('reporterId', 'name');

    for (const candidate of candidates) {
      const [lostItem, foundItem] =
        newItem.type === ITEM_TYPES.LOST
          ? [newItem, candidate]
          : [candidate, newItem];

      const score = scorePair(lostItem, foundItem);

      if (score < MATCH_THRESHOLD) continue;

      // Avoid duplicate Match documents
      const existing = await Match.findOne({
        lostItemId: lostItem._id,
        foundItemId: foundItem._id,
      });
      if (existing) continue;

      const match = await Match.create({
        lostItemId: lostItem._id,
        foundItemId: foundItem._id,
        score,
        status: MATCH_STATUSES.SUGGESTED,
      });

      // Notify both reporters
      await createNotification({
        recipientId: lostItem.reporterId._id || lostItem.reporterId,
        type: NOTIFICATION_TYPES.MATCH_SUGGESTED,
        message: `A possible match was found for your lost item "${lostItem.name}".`,
        refId: match._id,
        refModel: 'Match',
      });

      await createNotification({
        recipientId: foundItem.reporterId._id || foundItem.reporterId,
        type: NOTIFICATION_TYPES.MATCH_SUGGESTED,
        message: `Your found item "${foundItem.name}" may belong to someone who lost a similar item.`,
        refId: match._id,
        refModel: 'Match',
      });
    }
  } catch (err) {
    console.error('Match generation failed:', err.message);
  }
};

module.exports = { generateMatches };
