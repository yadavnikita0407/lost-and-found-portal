const bcrypt = require('bcryptjs');
const { ROLES, MEMBER_TYPES, ITEM_TYPES, ITEM_STATUSES, CLAIM_STATUSES } = require('../utils/constants');

/**
 * In-memory development store.
 * Used when MongoDB is not connected or when testing in development mode.
 */
class DevStore {
  constructor() {
    this.members = [
      {
        prn: '72212345',
        name: 'Sarvesh Haldikar',
        email: 'sarvesh.haldikar@college.edu',
        memberType: MEMBER_TYPES.STUDENT,
        isActive: true,
      },
      {
        prn: '21CS042',
        name: 'Rohit Patil',
        email: 'rohit.patil@college.edu',
        memberType: MEMBER_TYPES.STUDENT,
        isActive: true,
      },
      {
        prn: '20IT088',
        name: 'Pooja Sharma',
        email: 'pooja.sharma@college.edu',
        memberType: MEMBER_TYPES.STUDENT,
        isActive: true,
      },
      {
        prn: 'DEMO101',
        name: 'Campus Student',
        email: 'student@college.edu',
        memberType: MEMBER_TYPES.STUDENT,
        isActive: true,
      },
      {
        prn: 'STAFF001',
        name: 'Dr. Ramesh Joshi',
        email: 'ramesh.joshi@college.edu',
        memberType: MEMBER_TYPES.STAFF,
        isActive: true,
      },
    ];

    this.users = [];
    this.items = [];
    this.claims = [];
    this.notifications = [];

    this._initDefaults();
  }

  async _initDefaults() {
    const hash = await bcrypt.hash('Password123', 10);
    this.users = [
      {
        _id: 'dev_user_admin_001',
        name: 'Campus Administrator',
        prn: 'ADMIN001',
        email: 'admin@college.edu',
        mobile: '9876543210',
        passwordHash: hash,
        role: ROLES.ADMIN,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: 'dev_user_student_001',
        name: 'Campus Student',
        prn: 'DEMO101',
        email: 'student@college.edu',
        mobile: '9876543211',
        passwordHash: hash,
        role: ROLES.STUDENT,
        status: 'active',
        createdAt: new Date(),
      },
      {
        _id: 'dev_user_sarvesh',
        name: 'Sarvesh Haldikar',
        prn: '72212345',
        email: 'sarvesh.haldikar@college.edu',
        mobile: '9876543210',
        passwordHash: hash,
        role: ROLES.STUDENT,
        status: 'active',
        createdAt: new Date(),
      },
    ];

    this.items = [
      {
        _id: 'item_101',
        reporterId: { _id: 'dev_user_sarvesh', name: 'Sarvesh Haldikar' },
        type: ITEM_TYPES.LOST,
        name: 'Graphing Calculator (TI-84 Plus)',
        category: 'Electronics',
        description: 'Black scientific graphing calculator in sliding plastic case with a silver sticker on battery cover.',
        location: 'Central Library, 2nd Floor Reading Hall',
        dateReported: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        colour: 'Black',
        brand: 'Texas Instruments',
        uniqueDetails: 'Silver star sticker on battery cover',
        status: ITEM_STATUSES.ACTIVE,
        photoUrl: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        _id: 'item_102',
        reporterId: { _id: 'dev_user_admin_001', name: 'Dr. Ramesh Joshi' },
        type: ITEM_TYPES.FOUND,
        name: 'Brown Leather Bi-fold Wallet',
        category: 'Bags & Wallets',
        description: 'Found on lunch table 4. Contains a transit pass and campus library membership card.',
        location: 'College Cafeteria, Table 4',
        dateReported: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        colour: 'Dark Brown',
        brand: 'Wildhorn',
        uniqueDetails: 'College library card inside',
        status: ITEM_STATUSES.ACTIVE,
        photoUrl: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        _id: 'item_103',
        reporterId: { _id: 'dev_user_student_001', name: 'Campus Student' },
        type: ITEM_TYPES.FOUND,
        name: 'Algorithms & Data Structures Spiral Notebook',
        category: 'Books & Stationery',
        description: 'Thick ruled 200-page notebook with handwritten lecture notes on trees and dynamic programming.',
        location: 'Computer Science Lab 3, Row B',
        dateReported: new Date(Date.now() - 12 * 60 * 60 * 1000),
        colour: 'Navy Blue',
        brand: 'Classmate Pulse',
        uniqueDetails: 'Sticky notes on pages 45 and 62',
        status: ITEM_STATUSES.ACTIVE,
        photoUrl: null,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
      {
        _id: 'item_104',
        reporterId: { _id: 'dev_user_sarvesh', name: 'Sarvesh Haldikar' },
        type: ITEM_TYPES.LOST,
        name: 'Water Bottle (Insulated Matte Flask)',
        category: 'Other',
        description: 'Stainless steel vacuum insulated flask with campus sustainability sticker.',
        location: 'Main Auditorium, Row F Seat 12',
        dateReported: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        colour: 'Matte Olive Green',
        brand: 'Milton',
        uniqueDetails: 'Small dent on bottom rim',
        status: ITEM_STATUSES.ACTIVE,
        photoUrl: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        _id: 'item_105',
        reporterId: { _id: 'dev_user_admin_001', name: 'Campus Security' },
        type: ITEM_TYPES.FOUND,
        name: 'Ring of Keys with Brass Tag',
        category: 'Keys',
        description: 'Three metal keys on a brass hoop ring, handed in to the security booth.',
        location: 'Mechanical Workshop Corridor',
        dateReported: new Date(Date.now() - 4 * 60 * 60 * 1000),
        colour: 'Silver / Brass',
        brand: 'Godrej',
        uniqueDetails: 'Letter S stamped on brass tag',
        status: ITEM_STATUSES.ACTIVE,
        photoUrl: null,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        _id: 'item_106',
        reporterId: { _id: 'dev_user_student_001', name: 'Pooja Sharma' },
        type: ITEM_TYPES.FOUND,
        name: 'Wireless Earbuds Charging Case',
        category: 'Electronics',
        description: 'White charging case in a soft silicone protective sleeve.',
        location: 'Gymnasium & Indoor Sports Room',
        dateReported: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        colour: 'White',
        brand: 'Apple',
        uniqueDetails: 'Light green case skin',
        status: ITEM_STATUSES.RETURNED,
        photoUrl: null,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ];

    this.claims = [
      {
        _id: 'claim_501',
        itemId: this.items[1],
        claimantId: 'dev_user_student_001',
        reason: 'Lost my brown wallet during lunch break. The library card inside has my PRN and photo.',
        status: CLAIM_STATUSES.PENDING,
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000),
      },
      {
        _id: 'claim_502',
        itemId: this.items[5],
        claimantId: 'dev_user_sarvesh',
        reason: 'Misplaced my earbud case near the gym locker room before basketball practice.',
        status: CLAIM_STATUSES.APPROVED,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ];

    this.notifications = [
      {
        _id: 'notif_701',
        recipientId: 'dev_user_sarvesh',
        type: 'match_suggested',
        message: 'Potential Match: A "Brown Leather Bi-fold Wallet" was reported found in the Cafeteria.',
        refId: 'item_102',
        refModel: 'Item',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        _id: 'notif_702',
        recipientId: 'dev_user_sarvesh',
        type: 'report_approved',
        message: 'Your lost report for "Graphing Calculator (TI-84 Plus)" has been verified and posted.',
        refId: 'item_101',
        refModel: 'Item',
        isRead: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        _id: 'notif_703',
        recipientId: 'dev_user_student_001',
        type: 'claim_submitted',
        message: 'Your claim on "Brown Leather Bi-fold Wallet" has been received and is pending admin verification.',
        refId: 'claim_501',
        refModel: 'Claim',
        isRead: false,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      },
    ];
  }

  // ── Member Methods ──────────────────────────────────────────────────────────
  findMember(prn, email) {
    const cleanPrn = (prn || '').trim().toUpperCase();
    const cleanEmail = (email || '').trim().toLowerCase();

    const found = this.members.find(
      (m) => m.prn.toUpperCase() === cleanPrn && m.email.toLowerCase() === cleanEmail && m.isActive
    );
    if (found) return found;

    if (cleanEmail.endsWith('@college.edu') || cleanPrn.length >= 4) {
      const autoMember = {
        prn: cleanPrn,
        name: 'Campus Member',
        email: cleanEmail,
        memberType: cleanPrn.startsWith('STAFF') ? MEMBER_TYPES.STAFF : MEMBER_TYPES.STUDENT,
        isActive: true,
      };
      this.members.push(autoMember);
      return autoMember;
    }
    return null;
  }

  // ── User Methods ────────────────────────────────────────────────────────────
  findUserByEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    return this.users.find((u) => u.email.toLowerCase() === cleanEmail) || null;
  }

  findUserByPrnOrEmail(prn, email) {
    const cleanPrn = (prn || '').trim().toUpperCase();
    const cleanEmail = (email || '').trim().toLowerCase();
    return (
      this.users.find(
        (u) => u.prn.toUpperCase() === cleanPrn || u.email.toLowerCase() === cleanEmail
      ) || null
    );
  }

  findUserById(id) {
    return this.users.find((u) => String(u._id) === String(id)) || null;
  }

  createUser({ name, prn, email, mobile, passwordHash, role }) {
    const newUser = {
      _id: `dev_user_${Date.now()}`,
      name,
      prn: prn.toUpperCase(),
      email: email.toLowerCase(),
      mobile: mobile || '',
      passwordHash,
      role: role || ROLES.STUDENT,
      status: 'active',
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // ── Item Methods ────────────────────────────────────────────────────────────
  searchItems({ keyword, category, type, location, status, reporterId, page = 1, limit = 10 }) {
    let list = [...this.items];
    if (reporterId) {
      list = list.filter((i) => {
        const id = i.reporterId?._id || i.reporterId;
        return String(id) === String(reporterId);
      });
    }
    if (type) list = list.filter((i) => i.type === type);
    if (category) list = list.filter((i) => i.category === category);
    if (status) list = list.filter((i) => i.status === status);
    if (location) {
      list = list.filter((i) => i.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(kw) ||
          i.description.toLowerCase().includes(kw) ||
          (i.brand && i.brand.toLowerCase().includes(kw))
      );
    }

    const total = list.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginated = list.slice(skip, skip + Number(limit));
    return { items: paginated, total };
  }

  findItemById(id) {
    return this.items.find((i) => String(i._id) === String(id)) || null;
  }

  createItem(itemData, reporterId) {
    const reporter = this.findUserById(reporterId) || { _id: reporterId, name: 'Campus Reporter' };
    const newItem = {
      _id: `item_${Date.now()}`,
      reporterId: { _id: reporter._id, name: reporter.name },
      ...itemData,
      status: ITEM_STATUSES.ACTIVE,
      createdAt: new Date(),
    };
    this.items.unshift(newItem);
    return newItem;
  }

  // ── Claim Methods ───────────────────────────────────────────────────────────
  getMyClaims(userId) {
    return this.claims.filter((c) => String(c.claimantId) === String(userId) || (c.claimantId && c.claimantId._id === userId));
  }

  createClaim(itemId, reason, claimantId) {
    const item = this.findItemById(itemId);
    const newClaim = {
      _id: `claim_${Date.now()}`,
      itemId: item || itemId,
      claimantId,
      reason,
      status: CLAIM_STATUSES.PENDING,
      createdAt: new Date(),
    };
    this.claims.unshift(newClaim);
    return newClaim;
  }

  // ── Notification Methods ────────────────────────────────────────────────────
  getNotifications(userId) {
    return this.notifications.filter((n) => String(n.recipientId) === String(userId));
  }

  markNotificationRead(id, userId) {
    const notif = this.notifications.find((n) => String(n._id) === String(id) && String(n.recipientId) === String(userId));
    if (notif) notif.isRead = true;
    return notif;
  }

  markAllNotificationsRead(userId) {
    this.notifications.forEach((n) => {
      if (String(n.recipientId) === String(userId)) n.isRead = true;
    });
  }

  // ── Admin Methods ───────────────────────────────────────────────────────────
  getStats() {
    return {
      totalItems: this.items.length,
      lostItems: this.items.filter((i) => i.type === 'lost').length,
      foundItems: this.items.filter((i) => i.type === 'found').length,
      returnedItems: this.items.filter((i) => i.status === 'returned').length,
      totalUsers: this.users.filter((u) => u.role !== 'admin').length,
      pendingClaims: this.claims.filter((c) => c.status === 'pending').length,
    };
  }

  getAdminReports({ status, type, page = 1, limit = 20 }) {
    let list = [...this.items];
    if (status) list = list.filter((i) => i.status === status);
    if (type) list = list.filter((i) => i.type === type);
    const total = list.length;
    const skip = (Number(page) - 1) * Number(limit);
    return { items: list.slice(skip, skip + Number(limit)), total };
  }

  updateReportStatus(id, status) {
    const item = this.findItemById(id);
    if (item) {
      item.status = status;
    }
    return item;
  }

  getAdminClaims({ status, page = 1, limit = 20 }) {
    let list = [...this.claims];
    if (status) list = list.filter((c) => c.status === status);
    const total = list.length;
    const skip = (Number(page) - 1) * Number(limit);
    return { claims: list.slice(skip, skip + Number(limit)), total };
  }

  updateAdminClaim(id, status, reviewerId, adminNote) {
    const claim = this.claims.find((c) => String(c._id) === String(id));
    if (claim) {
      claim.status = status;
      claim.reviewerId = reviewerId;
      claim.adminNote = adminNote;
      if (status === 'approved' && claim.itemId) {
        if (typeof claim.itemId === 'object') claim.itemId.status = 'returned';
        const item = this.findItemById(claim.itemId._id || claim.itemId);
        if (item) item.status = 'returned';
      }
    }
    return claim;
  }

  getAdminUsers({ status, role, page = 1, limit = 20 }) {
    let list = this.users.filter((u) => u.role !== 'admin');
    if (status) list = list.filter((u) => u.status === status);
    if (role) list = list.filter((u) => u.role === role);
    const total = list.length;
    const skip = (Number(page) - 1) * Number(limit);
    return { users: list.slice(skip, skip + Number(limit)), total };
  }

  updateUserStatus(id, status) {
    const user = this.findUserById(id);
    if (user) {
      user.status = status;
    }
    return user;
  }

  getAuditLogs() {
    return [
      {
        _id: 'log_1',
        actionType: 'report_active',
        actorId: { name: 'Campus Admin', email: 'admin@college.edu', role: 'admin' },
        targetId: 'item_101',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        _id: 'log_2',
        actionType: 'claim_approved',
        actorId: { name: 'Campus Admin', email: 'admin@college.edu', role: 'admin' },
        targetId: 'claim_502',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    ];
  }
}

module.exports = new DevStore();

