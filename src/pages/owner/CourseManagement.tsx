import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faBookOpen,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { courseService, Course } from "../../services/course.service";

export default function CourseManagement() {
  const [view, setView] = useState<"list" | "form">("list");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    status: "Active" as "Active" | "Inactive",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    void fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await courseService.getCourses({
        page: 1,
        size: 100,
        filters: {},
      });
      setCourses(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (editingId) {
        await courseService.updateCourse(editingId, {
          title: formData.title,
          code: formData.code,
          isActive: formData.status === "Active",
        });
        setSuccessMessage("Course updated successfully.");
      } else {
        await courseService.createCourse({
          title: formData.title,
          code: formData.code,
        });
        setSuccessMessage("Course created successfully.");
      }

      await fetchCourses();
      setView("list");
      setEditingId(null);
      setFormData({ title: "", code: "", status: "Active" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save course");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (courseId: number) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await courseService.deleteCourse(courseId);
      setSuccessMessage("Course deleted successfully.");
      await fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete course");
    } finally {
      setIsLoading(false);
    }
  };

  if (view === "form") {
    return (
      <div className="card settings-container">
        <button
          className="btn"
          onClick={() => setView("list")}
          style={{ marginBottom: "1rem" }}
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <h3 className="card-title">
          {editingId ? "Update Course" : "Create Course"}
        </h3>
        {error && (
          <div style={{ marginBottom: "1rem", color: "#b91c1c" }}>{error}</div>
        )}
        <form onSubmit={handleSave} className="auth-form">
          <label className="auth-label">Course Title</label>
          <input
            className="auth-input"
            required
            value={formData.title}
            disabled={isLoading}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <div style={{ height: "1rem" }} />
          <label className="auth-label">Course Code</label>
          <input
            className="auth-input"
            required
            value={formData.code}
            disabled={isLoading}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
          <div style={{ height: "1rem" }} />
          <label className="auth-label">Status</label>
          <select
            className="auth-input"
            value={formData.status}
            disabled={isLoading}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as any })
            }
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div style={{ height: "1.5rem" }} />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : editingId ? "Update" : "Create"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div style={{ marginBottom: "1rem", color: "#b91c1c" }}>{error}</div>
      )}
      {successMessage && (
        <div style={{ marginBottom: "1rem", color: "#166534" }}>
          {successMessage}
        </div>
      )}
      <div className="toolbar">
        <h3>Courses</h3>
        <button
          className="btn btn-primary"
          disabled={isLoading}
          onClick={() => {
            setEditingId(null);
            setFormData({ title: "", code: "", status: "Active" });
            setView("form");
          }}
        >
          <FontAwesomeIcon icon={faPlus} /> Add Course
        </button>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && courses.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", padding: "1.25rem" }}
                >
                  Loading courses...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  style={{ textAlign: "center", padding: "1.25rem" }}
                >
                  No courses found.
                </td>
              </tr>
            ) : (
              courses.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontFamily: "monospace", fontWeight: "bold" }}>
                    {c.code}
                  </td>
                  <td>
                    <FontAwesomeIcon
                      icon={faBookOpen}
                      style={{ marginRight: "8px", color: "#f59e0b" }}
                    />{" "}
                    {c.title}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${c.isActive ? "status-active" : "status-inactive"}`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn action-btn"
                      disabled={isLoading}
                      onClick={() => {
                        setEditingId(c.id);
                        setFormData({
                          title: c.title,
                          code: c.code,
                          status: c.isActive ? "Active" : "Inactive",
                        });
                        setView("form");
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      className="btn action-btn btn-delete"
                      disabled={isLoading}
                      onClick={() => void handleDelete(c.id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
