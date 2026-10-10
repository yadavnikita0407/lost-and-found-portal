const ROLES = {
  STUDENT: 'student',
  STAFF: 'staff',
  ADMIN: 'admin',
};

const ITEM_TYPES = {
  LOST: 'lost',
  FOUND: 'found',
};

const ITEM_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  RETURNED: 'returned',
  REJECTED: 'rejected',
};

const CLAIM_STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const MATCH_STATUSES = {
  SUGGESTED: 'suggested',
  CONFIRMED: 'confirmed',
  DISMISSED: 'dismissed',
};

const NOTIFICATION_TYPES = {
  REPORT_APPROVED: 'report_approved',
  REPORT_REJECTED: 'report_rejected',
  MATCH_SUGGESTED: 'match_suggested',
  CLAIM_SUBMITTED: 'claim_submitted',
  CLAIM_APPROVED: 'claim_approved',
  CLAIM_REJECTED: 'claim_rejected',
  ITEM_RETURNED: 'item_returned',
};

const USER_STATUSES = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
};

const MEMBER_TYPES = {
  STUDENT: 'student',
  STAFF: 'staff',
};

const ITEM_CATEGORIES = [
  'Electronics',
  'Books & Stationery',
  'Clothing & Accessories',
  'ID & Documents',
  'Keys',
  'Bags & Wallets',
  'Sports Equipment',
  'Jewellery',
  'Other',
];

module.exports = {
  ROLES,
  ITEM_TYPES,
  ITEM_STATUSES,
  CLAIM_STATUSES,
  MATCH_STATUSES,
  NOTIFICATION_TYPES,
  USER_STATUSES,
  MEMBER_TYPES,
  ITEM_CATEGORIES,
};
