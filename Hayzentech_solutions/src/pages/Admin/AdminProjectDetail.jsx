import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase/client";
import { useToast } from "../../context/ToastContext";
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
  MdUpload,
  MdAttachFile,
  MdWarning,
} from "react-icons/md";
import logger from "../../utils/logger";
import "../Dashboard/Dashboard.css";
import "./Admin.css";

const AdminProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todos");
  const [newTask, setNewTask] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [editingStatus, setEditingStatus] = useState(false);
  const [statusValue, setStatusValue] = useState("");
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchProjectData();

    const channel = supabase
      .channel(`admin-project-messages-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `project_id=eq.${id}`,
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    const tasksChannel = supabase
      .channel(`admin-project-tasks-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTasks((prev) => {
              if (prev.some((t) => t.id === payload.new.id)) return prev;
              return [payload.new, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === payload.new.id ? { ...t, ...payload.new } : t
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(tasksChannel);
    };
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (projectData) {
        setProject(projectData);
        setStatusValue(projectData.status);

        const { data: clientData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", projectData.client_id)
          .single();

        if (clientData) setClient(clientData);
      }

      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (tasksData) setTasks(tasksData);

      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: true })
        .limit(50);

      if (messagesData) setMessages(messagesData);

      const { data: updatesData } = await supabase
        .from("project_updates")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (updatesData) setUpdates(updatesData);

      const { data: uploadsData } = await supabase
        .from("file_uploads")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (uploadsData) setUploads(uploadsData);
    } catch (err) {
      logger.error("AdminProjectDetail", err);
      addToast("Failed to load project data", "error");
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async () => {
    try {
      const { error } = await supabase
        .from("projects")
        .update({ status: statusValue, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      setProject({ ...project, status: statusValue });
      setEditingStatus(false);
      addToast(`Project status updated to ${statusValue.replace("_", " ")}`, "success");
    } catch (err) {
      logger.error("AdminProjectDetail.updateStatus", err);
      addToast("Failed to update status", "error");
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            project_id: id,
            title: newTask,
            description: taskDescription,
            status: "pending",
            created_by: user.id,
            assigned_to: client?.id || project?.client_id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setTasks([data, ...tasks]);
      setNewTask("");
      setTaskDescription("");
      addToast("Task added", "success");
    } catch (err) {
      logger.error("AdminProjectDetail.addTask", err);
      addToast("Failed to add task", "error");
    }
  };

  const toggleTaskStatus = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", task.id);

      if (error) throw error;
      setTasks(
        tasks.map((t) =>
          t.id === task.id ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      logger.error("AdminProjectDetail.toggleTask", err);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
      setTasks(tasks.filter((t) => t.id !== taskId));
      setConfirmDelete(null);
      addToast("Task deleted", "success");
    } catch (err) {
      logger.error("AdminProjectDetail.deleteTask", err);
      addToast("Failed to delete task", "error");
      setConfirmDelete(null);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            project_id: id,
            sender_id: user.id,
            content: newMessage,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setMessages([...messages, data]);
      setNewMessage("");
    } catch (err) {
      logger.error("AdminProjectDetail.sendMessage", err);
      addToast("Failed to send message", "error");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `admin_${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `projects/${id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("project-files")
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from("file_uploads")
        .insert([
          {
            project_id: id,
            uploader_id: user.id,
            file_name: file.name,
            file_url: urlData.publicUrl,
            file_type: file.type,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setUploads([data, ...uploads]);
      addToast(`File "${file.name}" uploaded`, "success");
    } catch (err) {
      logger.error("AdminProjectDetail.uploadFile", err);
      addToast("Upload failed: " + err.message, "error");
    } finally {
      setUploading(false);
      e.target.value = "";
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
          <Link to="/admin" className="dash-empty-btn">
            Back to Admin
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={project.title}
      subtitle="Manage tasks, chat, files, and client updates"
    >
      <Link to="/admin" className="admin-back-link">
        ← All projects
      </Link>

      <div className="project-detail-content admin-detail-inner">
        <div className="project-header-bar">
          <div>
            <h2 className="admin-detail-title">{project.title}</h2>
            <p>{project.description}</p>
          </div>
          <div className="admin-status-control">
            {editingStatus ? (
              <div className="admin-status-edit">
                <select
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value)}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  type="button"
                  className="admin-status-save"
                  onClick={updateProjectStatus}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="admin-status-cancel"
                  onClick={() => setEditingStatus(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="admin-status-display"
                onClick={() => setEditingStatus(true)}
              >
                <span
                  className={`dash-status ${getStatusClass(project.status)}`}
                >
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
              <span>
                <MdEmail /> {client.email}
              </span>
              {client.phone && (
                <span>
                  <MdPhone /> {client.phone}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="project-tabs">
          {[
            { id: "todos", label: "Todos" },
            { id: "chat", label: `Chat (${messages.length})` },
            { id: "files", label: `Files (${uploads.length})` },
            { id: "updates", label: `Updates (${updates.length})` },
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
              {tasks.length === 0 ? (
                <div className="dash-empty">
                  <p>No tasks yet. Add your first todo above.</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task.id}
                    className="project-task-item admin-task-item"
                  >
                    <button
                      type="button"
                      className="task-check"
                      onClick={() => toggleTaskStatus(task)}
                    >
                      {task.status === "completed" ? (
                        <MdCheckCircle className="task-checked" />
                      ) : (
                        <MdRadioButtonUnchecked />
                      )}
                    </button>
                    <div className="task-info">
                      <span
                        className={
                          task.status === "completed" ? "task-done" : ""
                        }
                      >
                        {task.title}
                      </span>
                      {task.description && <small>{task.description}</small>}
                    </div>
                    <div className="admin-task-actions">
                      <span
                        className={`dash-status ${getStatusClass(task.status)}`}
                      >
                        {task.status}
                      </span>
                      <button
                        type="button"
                        className="admin-delete-btn"
                        onClick={() => setConfirmDelete(task.id)}
                        aria-label="Delete task"
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
                  <div className="dash-empty">
                    <p>No messages yet.</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`chat-msg ${
                        msg.sender_id === user.id
                          ? "chat-msg-own"
                          : "chat-msg-client"
                      }`}
                    >
                      <div className="chat-msg-content">
                        <p>{msg.content}</p>
                        <small>
                          {new Date(msg.created_at).toLocaleString()}
                        </small>
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
                <button
                  type="button"
                  className="chat-send-btn touch-target"
                  onClick={sendMessage}
                >
                  <MdSend />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <div className="project-tab-content">
            <label className="file-upload-label touch-target">
              <MdUpload />
              {uploading ? "Uploading..." : "Upload file for client"}
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                hidden
              />
            </label>
            <div className="project-files-list">
              {uploads.length === 0 ? (
                <div className="dash-empty">
                  <p>No files uploaded yet.</p>
                </div>
              ) : (
                uploads.map((file) => (
                  <a
                    key={file.id}
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-file-item"
                  >
                    <MdAttachFile />
                    <span>{file.file_name}</span>
                    <small>
                      {new Date(file.created_at).toLocaleDateString()}
                    </small>
                  </a>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "updates" && (
          <div className="project-tab-content">
            <p className="admin-hint">
              Client-submitted progress updates. Use Chat to send official
              messages to the client.
            </p>
            {updates.length === 0 ? (
              <div className="dash-empty">
                <p>No updates from client yet.</p>
              </div>
            ) : (
              updates.map((update) => (
                <div key={update.id} className="admin-update-card">
                  <div className="admin-update-header">
                    <MdPerson />
                    <strong>{client?.full_name || "Client"}</strong>
                    <small>
                      {new Date(update.created_at).toLocaleString()}
                    </small>
                  </div>
                  <p>{update.message}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-icon">
              <MdWarning />
            </div>
            <h3>Delete Task?</h3>
            <p>This action cannot be undone. Are you sure you want to delete this task?</p>
            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-modal-cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-modal-confirm"
                onClick={() => deleteTask(confirmDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProjectDetail;
