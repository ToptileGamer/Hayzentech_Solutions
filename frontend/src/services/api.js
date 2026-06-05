const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.token = localStorage.getItem("hts_token");
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem("hts_token", token);
    } else {
      localStorage.removeItem("hts_token");
    }
  }

  getHeaders() {
    const headers = { "Content-Type": "application/json" };
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(method, path, body = null) {
    const options = {
      method,
      headers: this.getHeaders(),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${path}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong");
    }

    return data;
  }

  // Auth
  async register(email, password, fullName, phone) {
    const data = await this.request("POST", "/auth/register", { email, password, fullName, phone });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request("POST", "/auth/login", { email, password });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async googleAuth(email, googleId, fullName, avatarUrl) {
    const data = await this.request("POST", "/auth/google", { email, googleId, fullName, avatarUrl });
    if (data.token) this.setToken(data.token);
    return data;
  }

  async getProfile() {
    return this.request("GET", "/auth/me");
  }

  logout() {
    this.setToken(null);
  }

  // Packages
  async getPackages() {
    return this.request("GET", "/packages");
  }

  // Orders
  async getOrders() {
    return this.request("GET", "/orders");
  }

  async getOrder(id) {
    return this.request("GET", `/orders/${id}`);
  }

  async createOrder(packageId, title, description) {
    return this.request("POST", "/orders", { packageId, title, description });
  }

  // Projects
  async getProjects() {
    return this.request("GET", "/projects");
  }

  async getProject(id) {
    return this.request("GET", `/projects/${id}`);
  }

  // Todos
  async getTodos() {
    return this.request("GET", "/todos");
  }

  async getProjectTodos(projectId) {
    return this.request("GET", `/todos/project/${projectId}`);
  }

  async createTodo(projectId, title, description) {
    return this.request("POST", "/todos", { projectId, title, description });
  }

  async toggleTodo(id) {
    return this.request("PATCH", `/todos/${id}/toggle`);
  }

  async deleteTodo(id) {
    return this.request("DELETE", `/todos/${id}`);
  }

  // Payments
  async createPaymentOrder(orderId) {
    return this.request("POST", "/payments/create-order", { orderId });
  }

  async verifyPayment(orderId, razorpayPaymentId, razorpayOrderId) {
    return this.request("POST", "/payments/verify", { orderId, razorpayPaymentId, razorpayOrderId });
  }

  async getPaymentConfig() {
    return this.request("GET", "/payments/config");
  }

  // Admin
  async deleteOrder(orderId) {
    return this.request("DELETE", `/admin/orders/${orderId}`);
  }

  async getAdminStats() {
    return this.request("GET", "/admin/stats");
  }

  async getAdminClients() {
    return this.request("GET", "/admin/clients");
  }

  async getAdminOrders() {
    return this.request("GET", "/admin/orders");
  }

  async updateOrderStatus(orderId, status) {
    return this.request("PUT", `/admin/orders/${orderId}/status`, { status });
  }

  async updateProjectStatus(projectId, status) {
    return this.request("PUT", `/projects/${projectId}/status`, { status });
  }

  async sendMessage(projectId, content) {
    return this.request("POST", `/projects/${projectId}/messages`, { content });
  }

  async sendAdminMessage(projectId, content) {
    return this.request("POST", "/admin/messages", { projectId, content });
  }

  async getRecentActivity() {
    return this.request("GET", "/admin/recent-activity");
  }
}

const api = new ApiService();
export default api;
