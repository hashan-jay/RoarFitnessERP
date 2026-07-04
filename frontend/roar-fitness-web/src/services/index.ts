/**
 * Barrel re-export of all API service modules.
 * Single import surface for pages, hooks, and context across all portals.
 */
export { api, getToken, setToken, removeToken, ApiError } from './apiClient';

export { authService } from './authService';

export { membershipService } from './membershipService';

export { paymentService } from './paymentService';

export { attendanceService } from './attendanceService';

export { inventoryService } from './inventoryService';

export { posService } from './posService';

export { reportService } from './reportService';

export { publicService } from './publicService';

export { memberService } from './memberService';

export { instructorService } from './instructorService';

export { packageService } from './packageService';

export { adminService } from './adminService';

export { sessionService } from './sessionService';

export { memberPlanService } from './memberPlanService';
