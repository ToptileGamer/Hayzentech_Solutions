import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabase/client";
import {
  MdArrowBack,
  MdUpload,
  MdSend,
  MdCheckCircle,
  MdRadioButtonUnchecked,
  MdAttachFile,
  MdUpdate,
} from "react-icons/md";
import logger from "../../utils/logger";
import "./Dashboard.css";

const ProjectDetail = () => {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks");

  // Form states
  const [newTask, setNewTask] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newUpdate, setNewUpdate] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProjectData();

    // Set up real-time subscription for messages
    const channel = supabase
      .channel(`project-messages-${id}`)
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
          // Avoid duplicates and add to state
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    // Real-time subscription for tasks
    const tasksChannel = supabase
      .channel(`project-tasks-${id}`)
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
      // Fetch project details
      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (projectData) setProject(projectData);

      // Fetch tasks
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (tasksData) setTasks(tasksData);

      // Fetch messages (last 50)
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: true })
        .limit(50);

      if (messagesData) setMessages(messagesData);

      // Fetch uploads
      const { data: uploadsData } = await supabase
        .from("file_uploads")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (uploadsData) setUploads(uploadsData);

      // Fetch project updates
      const { data: updatesData } = await supabase
        .from("project_updates")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });

      if (updatesData) setUpdates(updatesData);
    } catch (err) {
      logger.error("ProjectDetail", err);
    } finally {
      setLoading(false);
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
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setTasks([data, ...tasks]);
      setNewTask("");
      setTaskDescription("");
    } catch (err) {
      logger.error("ProjectDetail.addTask", err);
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
      logger.error("ProjectDetail.toggleTask", err);
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
      logger.error("ProjectDetail.sendMessage", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
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
    } catch (err) {
      logger.error("ProjectDetail.uploadFile", err);
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const addUpdate = async () => {
    if (!newUpdate.trim()) return;
    try {
      const { data, error } = await supabase
        .from("project_updates")
        .insert([
          {
            project_id: id,
            client_id: user.id,
            message: newUpdate,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setUpdates([data, ...updates]);
      setNewUpdate("");
    } catch (err) {
      logger.error("ProjectDetail.addUpdate", err);
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
        {/* Project Header */}
        <div className="project-header-bar">
          <div>
            <h1>{project.title}</h1>
            <p>{project.description}</p>
          </div>
          <span className={`dash-status ${getStatusClass(project.status)}`}>
            {project.status?.replace("_", " ")}
          </span>
        </div>

        {/* Tabs */}
        <div className="project-tabs">
          <button
            className={`project-tab ${activeTab === "tasks" ? "active" : ""}`}
            onClick={() => setActiveTab("tasks")}
          >
            Tasks & Todos
          </button>
          <button
            className={`project-tab ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            Chat
          </button>
          <button
            className={`project-tab ${activeTab === "files" ? "active" : ""}`}
            onClick={() => setActiveTab("files")}
          >
            Files
          </button>
          <button
            className={`project-tab ${activeTab === "updates" ? "active" : ""}`}
            onClick={() => setActiveTab("updates")}
          >
            Updates
          </button>
        </div>

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
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
              {tasks.length === 0 ? (
                <div className="dash-empty">
                  <p>No tasks yet. Add your first task above!</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="project-task-item">
                    <button
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
                          task.status === "completed"
                            ? "task-done"
                            : ""
                        }
                      >
                        {task.title}
                      </span>
                      {task.description && (
                        <small>{task.description}</small>
                      )}
                    </div>
                    <span
                      className={`dash-status ${getStatusClass(task.status)}`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat Tab */}
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
                        msg.sender_id === user.id ? "chat-msg-own" : ""
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

        {/* Files Tab */}
        {activeTab === "files" && (
          <div className="project-tab-content">
            <div className="project-add-item file-upload-area">
              <label className="file-upload-label">
                <MdUpload />
                <span>{uploading ? "Uploading..." : "Upload Design / File"}</span>
                <input
                  type="file"
                  hidden
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="project-files-list">
              {uploads.length === 0 ? (
                <div className="dash-empty">
                  <p>No files uploaded yet.</p>
                </div>
              ) : (
                uploads.map((file) => (
                  <div key={file.id} className="project-file-item">
                    <MdAttachFile />
                    <div className="file-info">
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {file.file_name}
                      </a>
                      <small>
                        {new Date(file.created_at).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Updates Tab */}
        {activeTab === "updates" && (
          <div className="project-tab-content">
            <div className="project-add-item">
              <textarea
                placeholder="Share an update on the project..."
                value={newUpdate}
                onChange={(e) => setNewUpdate(e.target.value)}
                rows={3}
              />
              <button className="project-add-btn" onClick={addUpdate}>
                <MdSend />
              </button>
            </div>
            <div className="project-updates-list">
              {updates.length === 0 ? (
                <div className="dash-empty">
                  <p>No updates yet. Share the first update!</p>
                </div>
              ) : (
                updates.map((update) => (
                  <div key={update.id} className="project-update-item">
                    <MdUpdate className="update-icon" />
                    <div className="update-content">
                      <p>{update.message}</p>
                      <small>
                        {new Date(update.created_at).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
