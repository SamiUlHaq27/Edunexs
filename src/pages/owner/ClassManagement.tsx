import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faCheck,
  faChalkboardTeacher,
  faEllipsisH,
  faEdit,
  faFilter,
  faLayerGroup,
  faPlus,
  faPowerOff,
  faSearch,
  faSpinner,
  faTimes,
  faTrash,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { authService, courseService, sectionService, studentGroupService, studentService, teacherService, institutionService } from "../../services";
import type { Course } from "../../services/course.service";
import type { Section, SectionOffering } from "../../services/section.service";
import type { Student } from "../../services/student.service";
import type { StudentGroup } from "../../services/student-group.service";
import type { Teacher } from "../../services/teacher.service";
import type { Institution } from "../../types";
import "../../styles/owner.css";

type StatusFilter = "All" | "Active" | "Inactive";

type SectionFormState = {
  name: string;
  isActive: boolean;
};

type OfferingFormState = {
  offeringId?: number;
  courseId: number | "";
  teacherId: number | "";
  isActive: boolean;
  studentProfileIds: number[];
  studentGroupIds: number[];
};

type DraftOfferingRow = {
  localId: string;
  courseId: number | "";
  teacherId: number | "";
};

const emptySectionForm: SectionFormState = {
  name: "",
  isActive: true,
};

const emptyOfferingForm: OfferingFormState = {
  courseId: "",
  teacherId: "",
  isActive: true,
  studentProfileIds: [],
  studentGroupIds: [],
};

const createDraftOfferingRow = (): DraftOfferingRow => ({
  localId: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  courseId: "",
  teacherId: "",
});

export default function ClassManagement(): React.JSX.Element {
  const navigate = useNavigate();

  const [institution, setInstitution] = useState<Institution | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [offerings, setOfferings] = useState<SectionOffering[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [sectionForm, setSectionForm] = useState<SectionFormState>(emptySectionForm);
  const [sectionFormErrors, setSectionFormErrors] = useState<Record<string, string>>({});
  const [draftOfferings, setDraftOfferings] = useState<DraftOfferingRow[]>([]);
  const [draftOfferingErrors, setDraftOfferingErrors] = useState<Record<string, string>>({});
  const [sharedStudentProfileIds, setSharedStudentProfileIds] = useState<number[]>([]);
  const [sharedStudentGroupIds, setSharedStudentGroupIds] = useState<number[]>([]);

  const [isOfferingModalOpen, setIsOfferingModalOpen] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  const [editingOfferingId, setEditingOfferingId] = useState<number | null>(null);
  const [offeringForm, setOfferingForm] = useState<OfferingFormState>(emptyOfferingForm);
  const [offeringFormErrors, setOfferingFormErrors] = useState<Record<string, string>>({});

  const user = authService.getUser();
  const isInstitutionAdmin = user?.role === "institution_admin";

  const loadData = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      }

      setError("");
      const [sectionResponse, offeringResponse, courseResponse, teacherResponse, studentResponse, groupResponse] = await Promise.all([
        sectionService.getSections({ page: 1, size: 100, filters: {} }),
        sectionService.getSectionOfferings({ page: 1, size: 200, filters: {} }),
        courseService.getCourses({ page: 1, size: 100, filters: {} }),
        teacherService.getTeachers({ page: 1, size: 100, filters: {} }),
        studentService.getStudents({ page: 1, size: 100, filters: {} }),
        studentGroupService.getStudentGroups({ page: 1, size: 100, filters: {} }),
      ]);

      setSections(sectionResponse.data || []);
      setOfferings(offeringResponse.data || []);
      setCourses(courseResponse.data || []);
      setTeachers(teacherResponse.data || []);
      setStudents(studentResponse.data || []);
      setStudentGroups(groupResponse.data || []);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to load class data";
      setError(errorMessage);
      console.error("Error loading class data:", err);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        setIsLoading(true);
        setError("");
        const inst = await institutionService.getMyInstitution();
        if (!inst) {
          navigate("/create-institution", { replace: true });
          return;
        }
        setInstitution(inst);
        await loadData(true);
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to load class management data";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchInstitution();
  }, [loadData, navigate]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = setTimeout(() => setSuccessMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
      setIsFilterOpen(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const sectionOfferingsMap = useMemo(() => {
    const map = new Map<number, SectionOffering[]>();
    for (const offering of offerings) {
      const current = map.get(offering.sectionId) || [];
      map.set(offering.sectionId, [...current, offering]);
    }
    return map;
  }, [offerings]);

  const filteredSections = sections.filter((section) => {
    const matchesSearch =
      section.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(section.id).includes(searchQuery.trim());
    const matchesFilter =
      filterStatus === "All" ||
      (section.isActive ? "Active" : "Inactive") === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const validateSectionForm = () => {
    const errors: Record<string, string> = {};
    const name = sectionForm.name.trim();

    if (!name) {
      errors.name = "Section name is required";
    } else if (name.length < 2) {
      errors.name = "Section name must be at least 2 characters";
    } else if (name.length > 100) {
      errors.name = "Section name must not exceed 100 characters";
    }

    const duplicate = sections.find(
      (section) =>
        section.name.toLowerCase() === name.toLowerCase() &&
        section.id !== editingSectionId,
    );

    if (duplicate) {
      errors.name = "Section name already exists in your institution";
    }

    setSectionFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOfferingForm = () => {
    const errors: Record<string, string> = {};

    if (!activeSectionId) {
      errors.sectionId = "Section is required";
    }
    if (!offeringForm.courseId) {
      errors.courseId = "Course is required";
    }
    if (!offeringForm.teacherId) {
      errors.teacherId = "Teacher is required";
    }

    setOfferingFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetSectionForm = () => {
    setSectionForm(emptySectionForm);
    setEditingSectionId(null);
    setSectionFormErrors({});
    setDraftOfferings([]);
    setDraftOfferingErrors({});
    setSharedStudentProfileIds([]);
    setSharedStudentGroupIds([]);
  };

  const addDraftOfferingRow = () => {
    setDraftOfferings((prev) => [...prev, createDraftOfferingRow()]);
  };

  const updateDraftOfferingRow = (
    localId: string,
    field: keyof Pick<DraftOfferingRow, "courseId" | "teacherId">,
    value: number | "",
  ) => {
    setDraftOfferings((prev) =>
      prev.map((row) => (row.localId === localId ? { ...row, [field]: value } : row)),
    );
  };

  const removeDraftOfferingRow = (localId: string) => {
    setDraftOfferings((prev) => prev.filter((row) => row.localId !== localId));
    setDraftOfferingErrors((prev) => {
      const next = { ...prev };
      delete next[localId];
      return next;
    });
  };

  const toggleSharedEnrollmentValue = (
    field: "studentProfileIds" | "studentGroupIds",
    value: number,
  ) => {
    if (field === "studentProfileIds") {
      setSharedStudentProfileIds((prev) =>
        prev.includes(value)
          ? prev.filter((item) => item !== value)
          : [...prev, value],
      );
      return;
    }

    setSharedStudentGroupIds((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );
  };

  const resetOfferingForm = () => {
    setOfferingForm(emptyOfferingForm);
    setEditingOfferingId(null);
    setOfferingFormErrors({});
  };

  const handleOpenSectionModal = (section?: Section) => {
    if (section) {
      setSectionForm({ name: section.name, isActive: section.isActive });
      setEditingSectionId(section.id);
      setDraftOfferings([]);
      setSharedStudentProfileIds([]);
      setSharedStudentGroupIds([]);
    } else {
      setSectionForm(emptySectionForm);
      setEditingSectionId(null);
      setDraftOfferings([createDraftOfferingRow()]);
      setSharedStudentProfileIds([]);
      setSharedStudentGroupIds([]);
    }
    setSectionFormErrors({});
    setDraftOfferingErrors({});
    setIsSectionModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseSectionModal = () => {
    setIsSectionModalOpen(false);
    resetSectionForm();
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateSectionForm()) {
      return;
    }

    const hasDraftOfferings = draftOfferings.some(
      (row) => row.courseId !== "" || row.teacherId !== "",
    );

    if (!editingSectionId) {
      if (!hasDraftOfferings) {
        setSectionFormErrors({});
        setDraftOfferingErrors({
          noOfferings: "Add at least one course and teacher pair to create a class",
        });
        return;
      }

      const draftErrors: Record<string, string> = {};
      for (const row of draftOfferings) {
        if (row.courseId === "" || row.teacherId === "") {
          draftErrors[row.localId] = "Course and teacher are required for each offering";
        }
      }

      if (Object.keys(draftErrors).length > 0) {
        setDraftOfferingErrors(draftErrors);
        return;
      }

      setDraftOfferingErrors({});
    }

    try {
      setIsSaving(true);
      if (editingSectionId) {
        await sectionService.updateSection({
          sectionId: editingSectionId,
          name: sectionForm.name.trim(),
          isActive: sectionForm.isActive,
        });
        setSuccessMessage("Class updated successfully!");
      } else {
        const createdSection = await sectionService.createSection({
          name: sectionForm.name.trim(),
        });

        const createdOfferings = [] as SectionOffering[];
        for (const row of draftOfferings) {
          const offering = await sectionService.createSectionOffering({
            sectionId: createdSection.id,
            courseId: Number(row.courseId),
            teacherId: Number(row.teacherId),
            studentProfileIds: sharedStudentProfileIds,
            studentGroupIds: sharedStudentGroupIds,
          });
          createdOfferings.push(offering);
        }

        setSuccessMessage(
          createdOfferings.length > 0
            ? `Class created successfully with ${createdOfferings.length} offering(s)!`
            : "Class created successfully!",
        );
      }
      handleCloseSectionModal();
      await loadData(true);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to save class";
      setError(errorMessage);
      console.error("Error saving class:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!window.confirm("Are you sure you want to delete this class?")) {
      return;
    }

    try {
      setError("");
      await sectionService.deleteSection(sectionId);
      setSuccessMessage("Class deleted successfully!");
      await loadData(true);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to delete class";
      setError(errorMessage);
      console.error("Error deleting class:", err);
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleToggleSectionStatus = async (section: Section) => {
    try {
      setError("");
      await sectionService.updateSection({
        sectionId: section.id,
        isActive: !section.isActive,
      });
      setSuccessMessage(
        section.isActive ? "Class deactivated!" : "Class reactivated!",
      );
      await loadData(true);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to update class status";
      setError(errorMessage);
      console.error("Error toggling class status:", err);
    } finally {
      setOpenMenuId(null);
    }
  };

  const openOfferingModal = (sectionId: number) => {
    setActiveSectionId(sectionId);
    setOfferingForm(emptyOfferingForm);
    setEditingOfferingId(null);
    setOfferingFormErrors({});
    setIsOfferingModalOpen(true);
    setOpenMenuId(null);
  };

  const editOffering = (offering: SectionOffering) => {
    setActiveSectionId(offering.sectionId);
    setOfferingForm({
      offeringId: offering.id,
      courseId: offering.courseId,
      teacherId: offering.teacherId,
      isActive: offering.isActive,
      studentProfileIds: offering.studentProfileIds || [],
      studentGroupIds: [],
    });
    setEditingOfferingId(offering.id);
    setOfferingFormErrors({});
    setIsOfferingModalOpen(true);
  };

  const handleCloseOfferingModal = () => {
    setIsOfferingModalOpen(false);
    resetOfferingForm();
    setActiveSectionId(null);
  };

  const handleSaveOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateOfferingForm()) {
      return;
    }

    if (!activeSectionId) {
      return;
    }

    try {
      setIsSaving(true);
      if (editingOfferingId) {
        await sectionService.updateSectionOffering({
          offeringId: editingOfferingId,
          courseId: Number(offeringForm.courseId),
          teacherId: Number(offeringForm.teacherId),
          isActive: offeringForm.isActive,
          studentProfileIds: offeringForm.studentProfileIds,
          studentGroupIds: offeringForm.studentGroupIds,
        });
        setSuccessMessage("Offering updated successfully!");
      } else {
        await sectionService.createSectionOffering({
          sectionId: activeSectionId,
          courseId: Number(offeringForm.courseId),
          teacherId: Number(offeringForm.teacherId),
          studentProfileIds: offeringForm.studentProfileIds,
          studentGroupIds: offeringForm.studentGroupIds,
        });
        setSuccessMessage("Offering created successfully!");
      }
      handleCloseOfferingModal();
      await loadData(true);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to save offering";
      setError(errorMessage);
      console.error("Error saving offering:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteOffering = async (offeringId: number) => {
    if (!window.confirm("Are you sure you want to delete this offering?")) {
      return;
    }

    try {
      setError("");
      await sectionService.deleteSectionOffering(offeringId);
      setSuccessMessage("Offering deleted successfully!");
      await loadData(true);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to delete offering";
      setError(errorMessage);
      console.error("Error deleting offering:", err);
    }
  };

  const toggleOfferingStatus = async (offering: SectionOffering) => {
    try {
      setError("");
      await sectionService.updateSectionOffering({
        offeringId: offering.id,
        isActive: !offering.isActive,
      });
      setSuccessMessage(
        offering.isActive ? "Offering deactivated!" : "Offering reactivated!",
      );
      await loadData(true);
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to update offering status";
      setError(errorMessage);
      console.error("Error toggling offering status:", err);
    } finally {
      setOpenMenuId(null);
    }
  };

  const selectedStudents = students.filter((student) =>
    offeringForm.studentProfileIds.includes(student.studentProfileId),
  );
  const selectedGroups = studentGroups.filter((group) =>
    offeringForm.studentGroupIds.includes(group.id),
  );

  const toggleArrayValue = (
    field: "studentProfileIds" | "studentGroupIds",
    value: number,
  ) => {
    setOfferingForm((prev) => {
      const current = prev[field];
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  if (isLoading) {
    return (
      <div className="admin-page-container">
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
          <div style={{ textAlign: "center" }}>
            <FontAwesomeIcon icon={faSpinner} spin size="2x" style={{ color: "#1e3a8a", marginBottom: "1rem" }} />
            <p style={{ color: "#6b7280" }}>Loading classes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", gap: "1rem", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: "1.75rem", fontWeight: "bold", color: "#111827", margin: 0 }}>Class Management</h2>
          <p style={{ margin: "0.35rem 0 0", color: "#6b7280" }}>
            Sections and offerings for {institution?.name || "your institution"}
          </p>
        </div>
        <button
          className="btn btn-primary"
          style={{ backgroundColor: "#1e3a8a" }}
          onClick={() => handleOpenSectionModal()}
        >
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: "0.5rem" }} />
          Create New Class
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca", padding: "0.9rem 1rem", borderRadius: "8px", marginBottom: "1rem" }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div style={{ background: "#ecfdf5", color: "#047857", border: "1px solid #a7f3d0", padding: "0.9rem 1rem", borderRadius: "8px", marginBottom: "1rem" }}>
          {successMessage}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginBottom: "1.5rem", position: "relative", flexWrap: "wrap" }}>
        <div className="input-with-icon" style={{ margin: 0, width: "300px" }}>
          <span className="input-icon">
            <FontAwesomeIcon icon={faSearch} />
          </span>
          <input
            className="auth-input"
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ height: "38px", fontSize: "0.9rem" }}
          />
        </div>

        <div style={{ position: "relative" }}>
          <button
            className="btn"
            style={{ height: "38px", background: "#fff", border: "1px solid #d1d5db", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(null);
              setIsFilterOpen(!isFilterOpen);
            }}
          >
            {filterStatus === "All" ? "Filter" : filterStatus} <FontAwesomeIcon icon={faFilter} />
          </button>

          {isFilterOpen && (
            <div className="filter-dropdown" onClick={(e) => e.stopPropagation()}>
              {["All", "Active", "Inactive"].map((status) => (
                <button
                  key={status}
                  className="dropdown-item"
                  onClick={() => {
                    setFilterStatus(status as StatusFilter);
                    setIsFilterOpen(false);
                  }}
                  style={{ justifyContent: "space-between", padding: "0.6rem 1rem" }}
                >
                  {status}
                  {filterStatus === status && <FontAwesomeIcon icon={faCheck} style={{ color: "#10b981" }} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.5rem" }}>
        {filteredSections.length > 0 ? (
          filteredSections.map((section) => {
            const sectionOfferings = sectionOfferingsMap.get(section.id) || [];
            return (
              <div
                key={section.id}
                className="card"
                style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem", borderTop: "4px solid var(--color-primary-500)" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: "bold", color: "#111827" }}>
                      {section.name}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.4rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.85rem", color: "#6b7280", fontWeight: 600, fontFamily: "monospace" }}>
                        Section #{section.id}
                      </span>
                      <span style={{ backgroundColor: section.isActive ? "#dcfce7" : "#f3f4f6", color: section.isActive ? "#166534" : "#374151", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                        {section.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div className="action-btn-wrapper">
                    <button
                      className="btn action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsFilterOpen(false);
                        setOpenMenuId(openMenuId === section.id ? null : section.id);
                      }}
                    >
                      <FontAwesomeIcon icon={faEllipsisH} />
                    </button>
                    {openMenuId === section.id && (
                      <div className="action-menu-dropdown" style={{ right: 0, left: "auto" }}>
                        <button className="dropdown-item" onClick={() => handleOpenSectionModal(section)}>
                          <FontAwesomeIcon icon={faEdit} fixedWidth /> Edit Class
                        </button>
                        <button className="dropdown-item" onClick={() => openOfferingModal(section.id)}>
                          <FontAwesomeIcon icon={faPlus} fixedWidth /> Add Offering
                        </button>
                        <button className="dropdown-item" onClick={() => handleToggleSectionStatus(section)}>
                          <FontAwesomeIcon icon={faPowerOff} fixedWidth /> {section.isActive ? "Deactivate Class" : "Reactivate Class"}
                        </button>
                        <button className="dropdown-item danger" onClick={() => handleDeleteSection(section.id)}>
                          <FontAwesomeIcon icon={faTrash} fixedWidth /> Delete Class
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ background: "#f9fafb", padding: "1rem", borderRadius: "8px", border: "1px solid #f3f4f6", flexGrow: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Offerings
                  </div>

                  {sectionOfferings.length > 0 ? (
                    sectionOfferings.map((offering) => (
                      <div key={offering.id} style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.85rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontWeight: 700, color: "#111827" }}>
                              {offering.courseTitle || `Course #${offering.courseId}`}
                            </div>
                            <div style={{ color: "#6b7280", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                              {offering.teacherName || `Teacher #${offering.teacherId}`}
                              {offering.teacherUsername ? ` (${offering.teacherUsername})` : ""}
                            </div>
                          </div>
                          <span style={{ backgroundColor: offering.isActive ? "#dcfce7" : "#f3f4f6", color: offering.isActive ? "#166534" : "#374151", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                            {offering.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.75rem", fontSize: "0.8rem", color: "#6b7280" }}>
                          <span><FontAwesomeIcon icon={faUsers} style={{ marginRight: "0.3rem" }} /> {offering.studentIds.length} Students</span>
                          <span><FontAwesomeIcon icon={faLayerGroup} style={{ marginRight: "0.3rem" }} /> {offering.studentProfileIds.length} Profiles</span>
                        </div>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                          <button className="btn" style={{ background: "#e0e7ff", color: "#4338ca", border: "none", fontWeight: 600 }} onClick={() => editOffering(offering)}>
                            <FontAwesomeIcon icon={faEdit} style={{ marginRight: "0.35rem" }} /> Edit
                          </button>
                          <button className="btn" style={{ background: "#f3f4f6", color: "#374151", border: "none", fontWeight: 600 }} onClick={() => toggleOfferingStatus(offering)}>
                            <FontAwesomeIcon icon={faPowerOff} style={{ marginRight: "0.35rem" }} /> {offering.isActive ? "Deactivate" : "Reactivate"}
                          </button>
                          <button className="btn" style={{ background: "#fee2e2", color: "#b91c1c", border: "none", fontWeight: 600 }} onClick={() => handleDeleteOffering(offering.id)}>
                            <FontAwesomeIcon icon={faTrash} style={{ marginRight: "0.35rem" }} /> Delete
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "0.85rem", color: "#9ca3af", fontStyle: "italic" }}>
                      No offerings yet for this class.
                    </div>
                  )}
                </div>

                <button
                  className="btn"
                  style={{ width: "100%", background: "#e0e7ff", color: "#4338ca", border: "none", fontWeight: 600, justifyContent: "center", padding: "0.6rem 1rem", borderRadius: "6px" }}
                  onClick={() => openOfferingModal(section.id)}
                >
                  Manage Offerings
                </button>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem", color: "#6b7280", background: "white", borderRadius: "12px", border: "1px dashed #d1d5db" }}>
            <FontAwesomeIcon icon={faBook} size="3x" style={{ color: "#e5e7eb", marginBottom: "1rem" }} />
            <p>No classes found. Adjust your filters or click "Create New Class" to get started.</p>
          </div>
        )}
      </div>

      {isSectionModalOpen && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ width: "820px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="owner-modal-header" style={{ display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
              <h3 style={{ margin: 0 }}>{editingSectionId ? "Edit Class" : "Create New Class"}</h3>
              <button onClick={handleCloseSectionModal} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <FontAwesomeIcon icon={faTimes} size="lg" color="#6b7280" />
              </button>
            </div>

            <form onSubmit={handleSaveSection} style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div className="owner-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "#f9fafb", overflowY: "auto", padding: "1.5rem" }}>
                <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <label className="auth-label">Class Name *</label>
                  <input
                    className="auth-input"
                    value={sectionForm.name}
                    onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })}
                    placeholder="e.g. Grade 10 - Section A"
                    maxLength={100}
                    style={{ borderColor: sectionFormErrors.name ? "#ef4444" : undefined }}
                    required
                  />
                  {sectionFormErrors.name && (
                    <div style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.35rem" }}>
                      {sectionFormErrors.name}
                    </div>
                  )}
                </div>

                <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <label className="auth-label">Status</label>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setSectionForm({ ...sectionForm, isActive: !sectionForm.isActive })}
                    style={{ background: sectionForm.isActive ? "#dcfce7" : "#f3f4f6", color: sectionForm.isActive ? "#166534" : "#374151", border: "1px solid #e5e7eb" }}
                  >
                    {sectionForm.isActive ? "Active" : "Inactive"}
                  </button>
                </div>

                {!editingSectionId && (
                  <>
                    <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
                        <div>
                          <label className="auth-label" style={{ marginBottom: "0.25rem", display: "block" }}>
                            Initial Course Offerings
                          </label>
                          <p style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}>
                            Each row creates one section offering for this class.
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn"
                          onClick={addDraftOfferingRow}
                          style={{ background: "#e0e7ff", color: "#4338ca", border: "1px solid #c7d2fe" }}
                        >
                          <FontAwesomeIcon icon={faPlus} style={{ marginRight: "0.35rem" }} />
                          Add Row
                        </button>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {draftOfferingErrors.noOfferings && (
                          <div style={{ color: "#ef4444", fontSize: "0.85rem", fontWeight: 600 }}>
                            {draftOfferingErrors.noOfferings}
                          </div>
                        )}

                        {draftOfferings.map((row, index) => (
                          <div key={row.localId} style={{ border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.9rem", background: "#f9fafb" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.75rem", alignItems: "end" }}>
                              <div>
                                <label className="auth-label">Course *</label>
                                <select
                                  className="auth-input"
                                  value={row.courseId}
                                  onChange={(e) =>
                                    updateDraftOfferingRow(
                                      row.localId,
                                      "courseId",
                                      Number(e.target.value),
                                    )
                                  }
                                  required
                                >
                                  <option value="">Select Course</option>
                                  {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                      {course.title} ({course.code})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="auth-label">Teacher *</label>
                                <select
                                  className="auth-input"
                                  value={row.teacherId}
                                  onChange={(e) =>
                                    updateDraftOfferingRow(
                                      row.localId,
                                      "teacherId",
                                      Number(e.target.value),
                                    )
                                  }
                                  required
                                >
                                  <option value="">Select Teacher</option>
                                  {teachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                      {teacher.name} {teacher.username ? `(${teacher.username})` : ""}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <button
                                type="button"
                                className="btn"
                                onClick={() => removeDraftOfferingRow(row.localId)}
                                style={{ background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca", height: "42px" }}
                                disabled={draftOfferings.length === 1}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>

                            {draftOfferingErrors[row.localId] && (
                              <div style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                                {draftOfferingErrors[row.localId]}
                              </div>
                            )}

                            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.85rem", color: "#6b7280", fontSize: "0.8rem" }}>
                              <span><FontAwesomeIcon icon={faChalkboardTeacher} style={{ marginRight: "0.25rem" }} /> Offering {index + 1}</span>
                              <span><FontAwesomeIcon icon={faBook} style={{ marginRight: "0.25rem" }} /> Shared class enrollment applies to every row</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                        <label className="auth-label">Shared Student Groups</label>
                        <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          {studentGroups.map((group) => (
                            <label key={group.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem", borderRadius: "4px", cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={sharedStudentGroupIds.includes(group.id)}
                                onChange={() => toggleSharedEnrollmentValue("studentGroupIds", group.id)}
                              />
                              <span style={{ fontSize: "0.85rem", color: "#374151" }}>
                                {group.name} ({group.studentIds.length} students)
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                        <label className="auth-label">Shared Individual Students</label>
                        <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                          {students.map((student) => (
                            <label key={student.studentProfileId} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem", borderRadius: "4px", cursor: "pointer" }}>
                              <input
                                type="checkbox"
                                checked={sharedStudentProfileIds.includes(student.studentProfileId)}
                                onChange={() => toggleSharedEnrollmentValue("studentProfileIds", student.studentProfileId)}
                              />
                              <span style={{ fontSize: "0.85rem", color: "#374151" }}>
                                {student.name} ({student.rollNo})
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div style={{ background: "#eff6ff", color: "#1d4ed8", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid #bfdbfe", fontSize: "0.9rem" }}>
                  A class is created as a Section in the backend. Any offerings added here will be created immediately after the class is saved.
                </div>
              </div>

              <div className="owner-modal-footer" style={{ flexShrink: 0 }}>
                <button type="button" className="btn" onClick={handleCloseSectionModal} style={{ background: "white", border: "1px solid #d1d5db" }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#1e3a8a" }} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: "0.5rem" }} />
                      Saving...
                    </>
                  ) : editingSectionId ? (
                    "Save Class"
                  ) : (
                    "Create Class"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isOfferingModalOpen && activeSectionId && (
        <div className="owner-modal-overlay">
          <div className="owner-modal" style={{ width: "960px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="owner-modal-header" style={{ display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
              <h3 style={{ margin: 0 }}>
                {editingOfferingId ? "Edit Offering" : "Add Offering"}
              </h3>
              <button onClick={handleCloseOfferingModal} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <FontAwesomeIcon icon={faTimes} size="lg" color="#6b7280" />
              </button>
            </div>

            <form onSubmit={handleSaveOffering} style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <div className="owner-modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "#f9fafb", overflowY: "auto", padding: "1.5rem" }}>
                <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                  <label className="auth-label">Section</label>
                  <input className="auth-input" value={sections.find((section) => section.id === activeSectionId)?.name || ""} readOnly />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <label className="auth-label">Course *</label>
                    <select
                      className="auth-input"
                      value={offeringForm.courseId}
                      onChange={(e) => setOfferingForm({ ...offeringForm, courseId: Number(e.target.value) })}
                      style={{ borderColor: offeringFormErrors.courseId ? "#ef4444" : undefined }}
                      required
                    >
                      <option value="">Select Course</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title} ({course.code})
                        </option>
                      ))}
                    </select>
                    {offeringFormErrors.courseId && (
                      <div style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.35rem" }}>
                        {offeringFormErrors.courseId}
                      </div>
                    )}
                  </div>

                  <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <label className="auth-label">Teacher *</label>
                    <select
                      className="auth-input"
                      value={offeringForm.teacherId}
                      onChange={(e) => setOfferingForm({ ...offeringForm, teacherId: Number(e.target.value) })}
                      style={{ borderColor: offeringFormErrors.teacherId ? "#ef4444" : undefined }}
                      required
                    >
                      <option value="">Select Teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name} {teacher.username ? `(${teacher.username})` : ""}
                        </option>
                      ))}
                    </select>
                    {offeringFormErrors.teacherId && (
                      <div style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "0.35rem" }}>
                        {offeringFormErrors.teacherId}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <label className="auth-label">Student Groups</label>
                    <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {studentGroups.map((group) => (
                        <label key={group.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem", borderRadius: "4px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={offeringForm.studentGroupIds.includes(group.id)}
                            onChange={() => toggleArrayValue("studentGroupIds", group.id)}
                          />
                          <span style={{ fontSize: "0.85rem", color: "#374151" }}>
                            {group.name} ({group.studentIds.length} students)
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: "white", padding: "1rem", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <label className="auth-label">Individual Students</label>
                    <div style={{ maxHeight: "220px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      {students.map((student) => (
                        <label key={student.studentProfileId} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.35rem", borderRadius: "4px", cursor: "pointer" }}>
                          <input
                            type="checkbox"
                            checked={offeringForm.studentProfileIds.includes(student.studentProfileId)}
                            onChange={() => toggleArrayValue("studentProfileIds", student.studentProfileId)}
                          />
                          <span style={{ fontSize: "0.85rem", color: "#374151" }}>
                            {student.name} ({student.rollNo})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {selectedGroups.length > 0 || selectedStudents.length > 0 ? (
                  <div style={{ background: "#eff6ff", color: "#1d4ed8", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid #bfdbfe", fontSize: "0.9rem" }}>
                    Selected enrollment will apply to this offering.
                  </div>
                ) : null}
              </div>

              <div className="owner-modal-footer" style={{ flexShrink: 0 }}>
                <button type="button" className="btn" onClick={handleCloseOfferingModal} style={{ background: "white", border: "1px solid #d1d5db" }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#1e3a8a" }} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: "0.5rem" }} />
                      Saving...
                    </>
                  ) : editingOfferingId ? (
                    "Save Offering"
                  ) : (
                    "Create Offering"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
