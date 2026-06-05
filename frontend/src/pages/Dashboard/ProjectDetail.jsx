import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";
import {
  MdArrowBack,
  MdSend,
  MdCheckCircle,
  MdRadioButtonUnchecked,
} from "react-icons/md";
import "./Dashboard.css";

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [project, setProject] = useState(null);
  const [todos, setTodos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todos");
  const [newTask, setNewTask] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await api.getProject(id);
      setProject(data.project);
      setTodos(data.todos || []);
      setMessages(data.messages || []);
    } catch (err) {
      addToast("Failed to load project", "error");
    } finally {
      setLoading(false);
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
      setTodos(
        todos.map((t) => (t.id === todo.id ? data.todo : t))
      );
    } catch (err) {
      addToast(err.message, "error");
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const data = await api.sendMessage(id, newMessage);
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
      <div className="dash-loading">
        <p>Project not found</p>
        <Link to="/dashboard">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      <Link to="/dashboard" className="order-back-btn">
        <MdArrowBack /> Dashboard
      </Link>

      <div className="project-detail-content">
        <div className="project-header-bar">
          <div>
            <h1>{project.title}</h1>
            <p>{project.description}</p>
          </div>
          <span className={`dash-status ${getStatusClass(project.status)}`}>
            {project.status?.replace("_", " ")}
          </span>
        </div>

        <div className="project-tabs">
          <button
            className={`project-tab ${activeTab === "todos" ? "active" : ""}`}
            onClick={() => setActiveTab("todos")}
          >
            Tasks & Todos ({todos.length})
          </button>
          <button
            className={`project-tab ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            Chat ({messages.length})
          </button>
        </div>

        {activeTab === "todos" && (
          <div className="project-tab-content">
            <div className="project-add-item">
              <input
                type="text"
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
              />
              <button className="project-add-btn" onClick={addTask}>
                <MdSend />
              </button>
            </div>
            <div className="project-tasks-list">
              {todos.length === 0 ? (
                <div className="dash-empty">
                  <p>No tasks yet. Add your first task above!</p>
                </div>
              ) : (
                todos.map((todo) => (
                  <div key={todo.id} className="project-task-item">
                    <button
                      className="task-check"
                      onClick={() => toggleTaskStatus(todo)}
                    >
                      {todo.status === "completed" ? (
                        <MdCheckCircle className="task-checked" />
                      ) : (
                        <MdRadioButtonUnchecked />
                      )}
                    </button>
                    <div className="task-info">
                      <span className={todo.status === "completed" ? "task-done" : ""}>
                        {todo.title}
                      </span>
                      {todo.description && (
                        <small>{todo.description}</small>
                      )}
                    </div>
                    <span className={`dash-status ${getStatusClass(todo.status)}`}>
                      {todo.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <div className="project-tab-content">
            <div className="project-chat">
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="dash-empty">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`chat-msg ${
                        msg.sender_id === user?.id ? "chat-msg-own" : ""
                      }`}
                    >
                      <div className="chat-msg-content">
                        <small className="chat-sender">{msg.sender_name || "User"}</small>
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
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button className="chat-send-btn" onClick={sendMessage}>
                  <MdSend />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
