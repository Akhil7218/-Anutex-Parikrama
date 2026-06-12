export const MOCK_VALID_EMPLOYEES = [
  'EMP1001', 'EMP1002', 'EMP1003', 'EMP1004', 'EMP1005',
  'EMP1006', 'EMP1007', 'EMP1008', 'EMP1009', 'EMP1010',
  'ADM1001', 'ADM1002', 'SUPER1'
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class StorageEngine {
  constructor() {
    this.initDatabase();
  }

  initDatabase() {
    if (!localStorage.getItem('parikrama_users')) {
      const initialUsers = [
        {
          id: 'SUPER1',
          name: 'Super Admin',
          phone: '+91 00000 00000',
          password: 'password', // in real life, hashed
          role: 'SUPERADMIN',
          status: 'ACTIVE'
        }
      ];
      localStorage.setItem('parikrama_users', JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem('parikrama_admin_requests')) {
      localStorage.setItem('parikrama_admin_requests', JSON.stringify([]));
    }
    if (!localStorage.getItem('parikrama_checklists')) {
      localStorage.setItem('parikrama_checklists', JSON.stringify([]));
    }
    if (!localStorage.getItem('parikrama_templates')) {
      const initialTemplates = [
        {
          id: 'tpl_default',
          name: 'Standard Plant Safety Inspection',
          items: [
            'Machine Safety Check',
            'Electrical Panel Vitals',
            'Fire Suppression Scan',
            'Raw Material Tally'
          ],
          active: true,
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem('parikrama_templates', JSON.stringify(initialTemplates));
    }
    if (!localStorage.getItem('parikrama_audit_logs')) {
      const initialLogs = [
        {
          id: 'log_1',
          timestamp: new Date().toISOString(),
          userId: 'SYSTEM',
          action: 'DATABASE_INITIALIZATION',
          details: 'Anutex Parikrama enterprise storage initialized successfully.'
        }
      ];
      localStorage.setItem('parikrama_audit_logs', JSON.stringify(initialLogs));
    }
    if (!localStorage.getItem('parikrama_notifications')) {
      localStorage.setItem('parikrama_notifications', JSON.stringify([]));
    }
  }

  // --- Authentication ---

  async login(employeeId, password) {
    await delay(500); // Simulate network
    const users = JSON.parse(localStorage.getItem('parikrama_users'));
    const user = users.find(u => u.id === employeeId && u.password === password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    if (user.status === 'PENDING_APPROVAL') {
      throw new Error('Account pending admin approval');
    }

    this.addAuditLog('USER_LOGIN', employeeId, `Successfully logged in as ${user.role}`);
    return { ...user, password: undefined };
  }

  async checkEmployeeValid(employeeId) {
    await delay(300);
    return MOCK_VALID_EMPLOYEES.includes(employeeId);
  }

  async registerUser(userData) {
    await delay(500);
    const users = JSON.parse(localStorage.getItem('parikrama_users'));
    
    if (users.find(u => u.id === userData.employeeId)) {
      throw new Error('Account already exists for this Employee ID');
    }

    const newUser = {
      id: userData.employeeId,
      name: userData.fullName,
      phone: userData.phoneNumber,
      password: userData.password,
      role: 'USER',
      status: 'PENDING_OTP'
    };

    users.push(newUser);
    localStorage.setItem('parikrama_users', JSON.stringify(users));
    this.addAuditLog('USER_REGISTER_INIT', userData.employeeId, 'User registration initiated; OTP generated.');
    return { success: true, message: 'OTP sent to mobile' };
  }

  async verifyOTPAndActivate(employeeId, otp) {
    await delay(500);
    if (otp !== '1234' && otp !== '123456') {
      throw new Error('Invalid OTP');
    }

    const users = JSON.parse(localStorage.getItem('parikrama_users'));
    const userIndex = users.findIndex(u => u.id === employeeId);
    
    if (userIndex === -1) throw new Error('User not found');

    users[userIndex].status = 'ACTIVE';
    localStorage.setItem('parikrama_users', JSON.stringify(users));
    this.addAuditLog('USER_VERIFY_OTP', employeeId, 'User verified phone OTP and activated account.');
    return true;
  }

  async registerAdmin(adminData) {
    await delay(500);
    const users = JSON.parse(localStorage.getItem('parikrama_users'));
    
    if (users.find(u => u.id === adminData.employeeId)) {
      throw new Error('Account already exists');
    }

    const newAdmin = {
      id: adminData.employeeId,
      name: adminData.fullName,
      phone: adminData.phoneNumber,
      password: adminData.password,
      role: 'ADMIN',
      status: 'PENDING_APPROVAL'
    };

    users.push(newAdmin);
    localStorage.setItem('parikrama_users', JSON.stringify(users));

    // Create an approval request
    const requests = JSON.parse(localStorage.getItem('parikrama_admin_requests'));
    const requestId = Date.now().toString();
    requests.push({
      requestId,
      employeeId: adminData.employeeId,
      name: adminData.fullName,
      phone: adminData.phoneNumber,
      timestamp: new Date().toISOString(),
      status: 'PENDING'
    });
    localStorage.setItem('parikrama_admin_requests', JSON.stringify(requests));

    this.addAuditLog('ADMIN_REGISTER_INIT', adminData.employeeId, 'Admin registration initiated; pending Super Admin approval.');
    this.addNotification(`New Admin registration pending approval for: ${adminData.fullName} (${adminData.employeeId})`, 'SUPERADMIN');
    this.addNotification(`New Admin registration pending approval for: ${adminData.fullName} (${adminData.employeeId})`, 'ADMIN');

    return { success: true, message: 'Approval request sent to Super Admin' };
  }

  // --- Admin Approval Flow ---

  async getPendingAdminRequests() {
    await delay(300);
    const requests = JSON.parse(localStorage.getItem('parikrama_admin_requests'));
    return requests.filter(r => r.status === 'PENDING');
  }

  async approveAdminRequest(requestId, approvedBy) {
    await delay(500);
    const requests = JSON.parse(localStorage.getItem('parikrama_admin_requests'));
    const requestIndex = requests.findIndex(r => r.requestId === requestId);
    
    if (requestIndex === -1) throw new Error('Request not found');
    
    requests[requestIndex].status = 'APPROVED';
    requests[requestIndex].approvedBy = approvedBy;
    requests[requestIndex].approvedAt = new Date().toISOString();
    
    const authOTP = Math.floor(1000 + Math.random() * 9000).toString();
    requests[requestIndex].generatedOTP = authOTP;

    localStorage.setItem('parikrama_admin_requests', JSON.stringify(requests));
    
    const users = JSON.parse(localStorage.getItem('parikrama_users'));
    const userIndex = users.findIndex(u => u.id === requests[requestIndex].employeeId);
    if (userIndex !== -1) {
       users[userIndex].expectedOTP = authOTP;
       users[userIndex].status = 'PENDING_AUTH_OTP';
       localStorage.setItem('parikrama_users', JSON.stringify(users));
    }

    this.addAuditLog('ADMIN_REQUEST_APPROVED', approvedBy, `Approved Admin Request for ${requests[requestIndex].employeeId}. Auth OTP generated: ${authOTP}`);
    return { authOTP };
  }

  async rejectAdminRequest(requestId, rejectedBy) {
    await delay(500);
    const requests = JSON.parse(localStorage.getItem('parikrama_admin_requests'));
    const requestIndex = requests.findIndex(r => r.requestId === requestId);
    
    if (requestIndex === -1) throw new Error('Request not found');
    
    requests[requestIndex].status = 'REJECTED';
    requests[requestIndex].rejectedBy = rejectedBy;
    requests[requestIndex].rejectedAt = new Date().toISOString();

    localStorage.setItem('parikrama_admin_requests', JSON.stringify(requests));
    
    const users = JSON.parse(localStorage.getItem('parikrama_users'));
    const userIndex = users.findIndex(u => u.id === requests[requestIndex].employeeId);
    if (userIndex !== -1) {
       users[userIndex].status = 'REJECTED';
       localStorage.setItem('parikrama_users', JSON.stringify(users));
    }

    this.addAuditLog('ADMIN_REQUEST_REJECTED', rejectedBy, `Rejected Admin Request for ${requests[requestIndex].employeeId}.`);
    return true;
  }

  async verifyAdminAuthOTP(employeeId, otp) {
    await delay(500);
    const users = JSON.parse(localStorage.getItem('parikrama_users'));
    const userIndex = users.findIndex(u => u.id === employeeId);
    
    if (userIndex === -1) throw new Error('User not found');
    
    if (users[userIndex].status !== 'PENDING_AUTH_OTP' || users[userIndex].expectedOTP !== otp) {
      throw new Error('Invalid Authorization Code');
    }

    users[userIndex].status = 'ACTIVE';
    delete users[userIndex].expectedOTP;
    localStorage.setItem('parikrama_users', JSON.stringify(users));
    
    this.addAuditLog('ADMIN_AUTH_SUCCESS', employeeId, 'Admin verified authorization code; account activated.');
    return true;
  }

  // --- Checklist Flow ---
  
  async getUserChecklist(employeeId) {
    await delay(300);
    let checklists = JSON.parse(localStorage.getItem('parikrama_checklists')) || [];
    const today = new Date().toISOString().split('T')[0]; // simple YYYY-MM-DD
    
    // Find today's checklist for the user
    let userChecklist = checklists.find(c => c.employeeId === employeeId && c.date === today);
    
    if (!userChecklist) {
      // Fetch currently active template items
      const templates = JSON.parse(localStorage.getItem('parikrama_templates')) || [];
      const activeTemplate = templates.find(t => t.active) || templates[0];
      
      const itemsList = activeTemplate && activeTemplate.items && activeTemplate.items.length > 0
        ? activeTemplate.items
        : ['Machine Safety Check', 'Electrical Panel Vitals', 'Fire Suppression Scan', 'Raw Material Tally'];

      // Seed today's daily checklist from active template
      userChecklist = {
        id: `chk_${Date.now()}_${employeeId}`,
        employeeId,
        date: today,
        locked: false,
        verifiedByAdmin: false,
        items: itemsList.map((itemText, idx) => ({
          id: `item_${idx + 1}`,
          title: itemText,
          status: 'PENDING',
          image: null
        }))
      };
      checklists.push(userChecklist);
      localStorage.setItem('parikrama_checklists', JSON.stringify(checklists));
      
      // Audit log the creation
      this.addAuditLog('CREATE_CHECKLIST', employeeId, `Daily checklist automatically created for day ${today} from template: ${activeTemplate ? activeTemplate.name : 'Default'}`);
    }
    
    // Map items down, passing locked status from the parent
    return userChecklist.items.map(item => ({ ...item, locked: userChecklist.locked }));
  }

  async updateChecklistEvidence(employeeId, itemId, imageBase64) {
    await delay(300);
    const checklists = JSON.parse(localStorage.getItem('parikrama_checklists'));
    const today = new Date().toISOString().split('T')[0];
    
    const userChecklistIndex = checklists.findIndex(c => c.employeeId === employeeId && c.date === today);
    if (userChecklistIndex === -1) throw new Error('Checklist not found');
    
    if (checklists[userChecklistIndex].locked) {
      throw new Error('Checklist is locked');
    }

    const itemIndex = checklists[userChecklistIndex].items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) throw new Error('Item not found');

    checklists[userChecklistIndex].items[itemIndex].image = imageBase64;
    checklists[userChecklistIndex].items[itemIndex].status = 'COMPLETED';
    checklists[userChecklistIndex].items[itemIndex].completedAt = new Date().toISOString();
    
    localStorage.setItem('parikrama_checklists', JSON.stringify(checklists));
    this.addAuditLog('SAVE_EVIDENCE', employeeId, `Saved evidence photo for item "${checklists[userChecklistIndex].items[itemIndex].title}"`);
    return true;
  }

  async submitFinalChecklist(employeeId) {
    await delay(300);
    const checklists = JSON.parse(localStorage.getItem('parikrama_checklists'));
    const today = new Date().toISOString().split('T')[0];
    
    const userChecklistIndex = checklists.findIndex(c => c.employeeId === employeeId && c.date === today);
    if (userChecklistIndex !== -1) {
      checklists[userChecklistIndex].locked = true;
      checklists[userChecklistIndex].submittedAt = new Date().toISOString();
      localStorage.setItem('parikrama_checklists', JSON.stringify(checklists));
      
      this.addAuditLog('LOCK_CHECKLIST', employeeId, `Completed & Locked daily checklist for date ${today}`);
      this.addNotification(`Employee ${employeeId} has locked and submitted their daily checklist for date ${today}`, 'ADMIN');
      this.addNotification(`Employee ${employeeId} has locked and submitted their daily checklist for date ${today}`, 'SUPERADMIN');
    }
    return true;
  }

  // --- Admin Flow ---

  async getAllSubmissions() {
    await delay(400);
    const checklists = JSON.parse(localStorage.getItem('parikrama_checklists')) || [];
    const users = JSON.parse(localStorage.getItem('parikrama_users')) || [];
    
    // Join with user names
    return checklists.map(c => {
      const user = users.find(u => u.id === c.employeeId);
      return {
        ...c,
        employeeName: user ? user.name : 'Unknown User'
      };
    });
  }

  async verifyEvidence(checklistId, itemId, adminId) {
    await delay(300);
    const checklists = JSON.parse(localStorage.getItem('parikrama_checklists'));
    const cIndex = checklists.findIndex(c => c.id === checklistId);
    if (cIndex === -1) throw new Error('Checklist not found');

    const iIndex = checklists[cIndex].items.findIndex(i => i.id === itemId);
    if (iIndex === -1) throw new Error('Item not found');

    checklists[cIndex].items[iIndex].verified = true;
    checklists[cIndex].items[iIndex].verifiedBy = adminId;
    checklists[cIndex].items[iIndex].verifiedAt = new Date().toISOString();
    
    // Check if all items in this checklist are verified
    const allVerified = checklists[cIndex].items.every(item => item.verified || item.status !== 'COMPLETED');
    if (allVerified) {
      checklists[cIndex].verifiedByAdmin = true;
    }
    
    localStorage.setItem('parikrama_checklists', JSON.stringify(checklists));
    this.addAuditLog('ADMIN_VERIFY', adminId, `Verified evidence for item "${checklists[cIndex].items[iIndex].title}" of ${checklists[cIndex].employeeId}`);
    return true;
  }

  // --- Templates Management ---

  async getTemplates() {
    await delay(300);
    return JSON.parse(localStorage.getItem('parikrama_templates')) || [];
  }

  async createTemplate(name, items) {
    await delay(400);
    if (!name || !items || items.length === 0) {
      throw new Error('Template name and items are required.');
    }
    const templates = JSON.parse(localStorage.getItem('parikrama_templates')) || [];
    
    const newTemplate = {
      id: `tpl_${Date.now()}`,
      name,
      items,
      active: false,
      createdAt: new Date().toISOString()
    };
    
    templates.push(newTemplate);
    localStorage.setItem('parikrama_templates', JSON.stringify(templates));
    
    this.addAuditLog('CREATE_TEMPLATE', 'ADMIN', `Created new checklist template: "${name}" with ${items.length} items.`);
    return newTemplate;
  }

  async setActiveTemplate(id) {
    await delay(300);
    const templates = JSON.parse(localStorage.getItem('parikrama_templates')) || [];
    const templateIndex = templates.findIndex(t => t.id === id);
    if (templateIndex === -1) throw new Error('Template not found.');
    
    templates.forEach((t, idx) => {
      templates[idx].active = (t.id === id);
    });
    
    localStorage.setItem('parikrama_templates', JSON.stringify(templates));
    this.addAuditLog('ACTIVATE_TEMPLATE', 'ADMIN', `Set template "${templates[templateIndex].name}" as active.`);
    return true;
  }

  async deleteTemplate(id) {
    await delay(300);
    let templates = JSON.parse(localStorage.getItem('parikrama_templates')) || [];
    const target = templates.find(t => t.id === id);
    if (!target) throw new Error('Template not found.');
    if (target.active) throw new Error('Cannot delete currently active template.');
    
    templates = templates.filter(t => t.id !== id);
    localStorage.setItem('parikrama_templates', JSON.stringify(templates));
    this.addAuditLog('DELETE_TEMPLATE', 'ADMIN', `Deleted template: "${target.name}".`);
    return true;
  }

  // --- Audit Logging ---

  addAuditLog(action, userId, details) {
    const logs = JSON.parse(localStorage.getItem('parikrama_audit_logs')) || [];
    const newLog = {
      id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId,
      action,
      details
    };
    logs.push(newLog);
    // Keep last 100 logs for memory efficiency in local storage
    if (logs.length > 100) {
      logs.shift();
    }
    localStorage.setItem('parikrama_audit_logs', JSON.stringify(logs));
  }

  async getAuditLogs() {
    await delay(300);
    const logs = JSON.parse(localStorage.getItem('parikrama_audit_logs')) || [];
    return [...logs].reverse();
  }

  // --- Simulated Notifications ---

  addNotification(message, targetRole) {
    const notifications = JSON.parse(localStorage.getItem('parikrama_notifications')) || [];
    notifications.push({
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      message,
      targetRole,
      timestamp: new Date().toISOString(),
      read: false
    });
    localStorage.setItem('parikrama_notifications', JSON.stringify(notifications));
  }

  async getNotifications(role) {
    await delay(200);
    const notifications = JSON.parse(localStorage.getItem('parikrama_notifications')) || [];
    return notifications.filter(n => n.targetRole === role && !n.read);
  }

  async dismissNotification(id) {
    await delay(100);
    const notifications = JSON.parse(localStorage.getItem('parikrama_notifications')) || [];
    const idx = notifications.findIndex(n => n.id === id);
    if (idx !== -1) {
      notifications[idx].read = true;
      localStorage.setItem('parikrama_notifications', JSON.stringify(notifications));
    }
    return true;
  }

  // --- Compliance & Data Retention Simulator ---
  
  async simulateTimePassage(daysToAdvance) {
    await delay(500);
    let checklists = JSON.parse(localStorage.getItem('parikrama_checklists')) || [];
    
    // In strict compliance simulation, fast-forwarding advances time and purges all historical checklists
    checklists = checklists.filter(c => {
      // In this simulator, any submitted checklists are purged to represent > 45 days retention expiration
      if (c.submittedAt) return false;
      return true; 
    });
    
    localStorage.setItem('parikrama_checklists', JSON.stringify(checklists));
    localStorage.setItem('parikrama_admin_requests', JSON.stringify([]));
    localStorage.setItem('parikrama_notifications', JSON.stringify([]));
    
    this.addAuditLog('COMPLIANCE_PURGE', 'SYSTEM', `Retention purge executed: All checklists and approvals older than 45 days permanently deleted.`);
    return true;
  }
}

export const db = new StorageEngine();
