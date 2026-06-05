import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import {
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdSend,
  MdDelete,
  MdEdit,
  MdPerson,
  MdEmail,
  MdPhone,
} from "react-icons/md";
import "../Dashboard/Dashboard.css";
import "./Admin.css";

const AdminProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [todos, setTodos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todos");
  const [newTask, setNewTask] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [editingStatus, setEditingStatus] = useState(false);
  const [statusValue, setStatusValue] = useState("not_started");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await api.getProject(id);
      setProject(data.project);
      setTodos(data.todos || []);
      setMessages(data.messages || []);
      setStatusValue(data.project.status || "not_started");

      // Build client info from project data
      if (data.project.client_name) {
        setClient({
          full_name: data.project.client_name,
          email: data.project.client_email,
          phone: data.project.client_phone,
        });
      }
    } catch (err) {
      addToast("Failed to load project", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async () => {
    try {
      await api.updateProjectStatus(id, statusValue);
      setProject({ ...project, status: statusValue });
      setEditingStatus(false);
      addToast(`Project status updated to ${statusValue.replace("_", " ")}`, "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    try {
      const data = await api.createTodo(id, newTask, taskDescription);
      setTodos([data.todo, ...todos]);
      setNewTask("");
      setTaskDescription("");
      addToast("Task added", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const toggleTaskStatus = async (todo) => {
    try {
      const data = await api.toggleTodo(todo.id);
      setTodos(todos.map((t) => (t.id === todo.id ? data.todo : t)));
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      await api.deleteTodo(taskId);
      setTodos(todos.filter((t) => t.id !== taskId));
      setConfirmDelete(null);
      addToast("Task deleted", "success");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const data = await api.sendAdminMessage(id, newMessage);
      setMessages([...messages, data.message]);
      setNewMessage("");
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const getStatusClass = (status) => {
    const map = {
      pending: "status-pending",
      completed: "status-completed",
      in_progress: "status-progress",
      not_started: "status-pending",
      review: "status-review",
    };
    return map[status] || "status-pending";
  };

  if (loading) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <AdminLayout title="Project not found">
        <div className="dash-empty">
          <p>This project could not be loaded.</p>
          <Link to="/admin" className="dash-empty-btn">Back to Admin</Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={project.title} subtitle="Manage tasks, chat, and client updates">
      <Link to="/admin" className="admin-back-link">← All projects</Link>

      <div className="project-detail-content admin-detail-inner">
        <div className="project-header-bar">
          <div>
            <h2 className="admin-detail-title">{project.title}</h2>
            <p>{project.description}</p>
          </div>
          <div className="admin-status-control">
            {editingStatus ? (
              <div className="admin-status-edit">
                <select value={statusValue} onChange={(e) => setStatusValue(e.target.value)}>
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
                <button type="button" className="admin-status-save" onClick={updateProjectStatus}>Save</button>
                <button type="button" className="admin-status-cancel" onClick={() => setEditingStatus(false)}>Cancel</button>
              </div>
            ) : (
              <button type="button" className="admin-status-display" onClick={() => setEditingStatus(true)}>
                <span className={`dash-status ${getStatusClass(project.status)}`}>
                  {project.status?.replace("_", " ")}
                </span>
                <MdEdit />
              </button>
            )}
          </div>
        </div>

        {client && (
          <div className="admin-client-info">
            <MdPerson />
            <div className="admin-client-details">
              <strong>{client.full_name}</strong>
              <span><MdEmail /> {client.email}</span>
              {client.phone && <span><MdPhone /> {client.phone}</span>}
            </div>
          </div>
        )}

        <div className="project-tabs">
          {[
            { id: "todos", label: `Todos (${todos.length})` },
            { id: "chat", label: `Chat (${messages.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`project-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "todos" && (
          <div className="project-tab-content">
            <div className="admin-add-task-bar">
              <input
                type="text"
                placeholder="Add a todo..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
              />
              <input
                type="text"
                placeholder="Details (optional)"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="admin-task-detail-input"
              />
              <button type="button" className="project-add-btn" onClick={addTask}>
                <MdSend />
              </button>
            </div>
            <div className="project-tasks-list">
              {todos.length === 0 ? (
                <div className="dash-empty">
                  <p>No tasks yet. Add your first todo above.</p>
                </div>
              ) : (
                todos.map((todo) => (
                  <div key={todo.id} className="project-task-item admin-task-item">
                    <button type="button" className="task-check" onClick={() => toggleTaskStatus(todo)}>
                      {todo.status === "completed" ? (
                        <MdCheckCircle className="task-checked" />
                      ) : (
                        <MdRadioButtonUnchecked />
                      )}
                    </button>
                    <div className="task-info">
                      <span className={todo.status === "completed" ? "task-done" : ""}>{todo.title}</span>
                      {todo.description && <small>{todo.description}</small>}
                    </div>
                    <div className="admin-task-actions">
                      <span className={`dash-status ${getStatusClass(todo.status)}`}>{todo.status}</span>
                      <button
                        type="button"
                        className="admin-delete-btn"
                        onClick={() => setConfirmDelete(todo.id)}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="project-tab-content">
            <div className="project-chat admin-chat">
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="dash-empty"><p>No messages yet.</p></div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`chat-msg ${msg.sender_id === user?.id ? "chat-msg-own" : "chat-msg-client"}`}
                    >
                      <div className="chat-msg-content">
                        <small className="chat-sender">{msg.sender_name}</small>
                        <p>{msg.content}</p>
                        <small>{new Date(msg.created_at).toLocaleString()}</small>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Reply to client..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button type="button" className="chat-send-btn" onClick={sendMessage}>
                  <MdSend />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Task?</h3>
            <p>This action cannot be undone.</p>
            <div className="admin-modal-actions">
              <button type="button" className="admin-modal-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button type="button" className="admin-modal-confirm" onClick={() => deleteTask(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProjectDetail;
