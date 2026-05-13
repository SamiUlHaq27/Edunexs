import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGraduate,
  faChalkboardTeacher,
  faUserShield,
  faBookOpen,
  faEllipsisH,
} from "@fortawesome/free-solid-svg-icons";
import "../../styles/owner-dashboard.css";
import { institutionService } from "../../services/institution.service";
import { courseService } from "../../services/course.service";
import { studentService } from "../../services/student.service";
import { teacherService } from "../../services/teacher.service";
import { institutionAdminService } from "../../services/institution-admin.service";
import { authService } from "../../services/auth.service";
import { Institution, UserRole } from "../../types";

type DashboardStats = {
  studentCount: number;
  courseCount: number;
  teacherCount: number;
  adminCount: number;
};

type RecentUpdateItem = {
  id: string;
  icon: typeof faUserGraduate;
  title: string;
  subtitle: string;
  timeAgo: string;
  iconClassName: string;
  timestamp: number;
};

const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return "Recently";

  const timestamp = new Date(dateString).getTime();
  if (Number.isNaN(timestamp)) return "Recently";

  const diffMinutes = Math.floor((Date.now() - timestamp) / (1000 * 60));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
};

const EventCalendar = () => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const activeDate = now.getDate();
  const monthName = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();
  const firstDay = new Date(year, now.getMonth(), 1).getDay();
  const datesInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
  const dates = Array.from({ length: datesInMonth }, (_, i) => i + 1);

  return (
    <div>
      <div className="calendar-title-box">
        <span>{monthName.toUpperCase()}</span>
        <span>{year}</span>
      </div>
      <div className="calendar-grid">
        {days.map((day) => (
          <div key={day} className="calendar-header">
            {day}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, idx) => (
          <div key={`spacer-${idx}`} />
        ))}
        {dates.map((date) => (
          <div
            key={date}
            className={`calendar-day ${date === activeDate ? "active" : ""}`}
          >
            {date}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function OwnerDashboard() {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    studentCount: 0,
    courseCount: 0,
    teacherCount: 0,
    adminCount: 0,
  });
  const [recentUpdates, setRecentUpdates] = useState<RecentUpdateItem[]>([]);
  const isInstitutionAdmin =
    authService.getUser()?.role === UserRole.INSTITUTION_ADMIN;

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      const adminsListRequest = isInstitutionAdmin
        ? Promise.resolve(null)
        : institutionAdminService.getAdmins({ page: 1, size: 5, filters: {} });

      const [
        institutionResult,
        studentsResult,
        teachersResult,
        coursesResult,
        adminsResult,
        adminsListResult,
      ] = await Promise.allSettled([
        institutionService.getMyInstitution(),
        studentService.getStudents({ page: 1, size: 5, filters: {} }),
        teacherService.getTeachers({ page: 1, size: 5, filters: {} }),
        courseService.getCourses({ page: 1, size: 5, filters: {} }),
        institutionAdminService.getAdminCount(),
        adminsListRequest,
      ]);

      if (!mounted) return;

      setInstitution(
        institutionResult.status === "fulfilled" ? institutionResult.value : null,
      );

      setStats({
        studentCount:
          studentsResult.status === "fulfilled"
            ? studentsResult.value.total ?? studentsResult.value.data?.length ?? 0
            : 0,
        teacherCount:
          teachersResult.status === "fulfilled"
            ? teachersResult.value.total ?? teachersResult.value.data?.length ?? 0
            : 0,
        courseCount:
          coursesResult.status === "fulfilled"
            ? coursesResult.value.total ?? coursesResult.value.data?.length ?? 0
            : 0,
        adminCount:
          adminsResult.status === "fulfilled" ? adminsResult.value.total : 0,
      });

      const studentUpdates =
        studentsResult.status === "fulfilled"
          ? studentsResult.value.data.map((item) => ({
              id: `student-${item.id}`,
              icon: faUserGraduate,
              title: "Student Added",
              subtitle: item.name || item.username,
              timeAgo: formatRelativeTime(item.createdAt),
              iconClassName: "update-student",
              timestamp: new Date(item.createdAt).getTime() || 0,
            }))
          : [];

      const teacherUpdates =
        teachersResult.status === "fulfilled"
          ? teachersResult.value.data.map((item) => ({
              id: `teacher-${item.id}`,
              icon: faChalkboardTeacher,
              title: "Teacher Added",
              subtitle: item.name,
              timeAgo: formatRelativeTime(item.createdAt),
              iconClassName: "update-teacher",
              timestamp: new Date(item.createdAt).getTime() || 0,
            }))
          : [];

      const courseUpdates =
        coursesResult.status === "fulfilled"
          ? coursesResult.value.data.map((item) => ({
              id: `course-${item.id}`,
              icon: faBookOpen,
              title: "Course Created",
              subtitle: `${item.code} - ${item.title}`,
              timeAgo: formatRelativeTime(item.createdAt),
              iconClassName: "update-course",
              timestamp: new Date(item.createdAt || "").getTime() || 0,
            }))
          : [];

      const adminUpdates =
        adminsListResult.status === "fulfilled" && adminsListResult.value?.data
          ? adminsListResult.value.data.map((item) => ({
              id: `admin-${item.id}`,
              icon: faUserShield,
              title: "Admin Added",
              subtitle: item.name,
              timeAgo: formatRelativeTime(item.createdAt),
              iconClassName: "update-admin",
              timestamp: new Date(item.createdAt).getTime() || 0,
            }))
          : [];

      const updates = [
        ...studentUpdates,
        ...teacherUpdates,
        ...courseUpdates,
        ...adminUpdates,
      ]
        .filter((item) => item.timestamp > 0)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 6);

      setRecentUpdates(updates);
    };

    void fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, [isInstitutionAdmin]);

  const totalManagedUsers =
    stats.studentCount + stats.teacherCount + stats.adminCount;
  const roleDistribution = [
    {
      label: "Students",
      count: stats.studentCount,
      percent:
        totalManagedUsers > 0
          ? Math.round((stats.studentCount / totalManagedUsers) * 100)
          : 0,
      className: "students",
    },
    {
      label: "Teachers",
      count: stats.teacherCount,
      percent:
        totalManagedUsers > 0
          ? Math.round((stats.teacherCount / totalManagedUsers) * 100)
          : 0,
      className: "teachers",
    },
    {
      label: "Admins",
      count: stats.adminCount,
      percent:
        totalManagedUsers > 0
          ? Math.round((stats.adminCount / totalManagedUsers) * 100)
          : 0,
      className: "admins",
    },
  ];
  const latestUpdate = recentUpdates[0];
  const liveSnapshot = [
    {
      label: "Institution Prefix",
      value: institution?.prefix || "Not Available",
    },
    {
      label: "Total Managed Users",
      value: totalManagedUsers.toLocaleString("en-US"),
    },
    {
      label: "Latest Record Added",
      value: latestUpdate?.subtitle || "No records yet",
    },
    {
      label: "Last Activity",
      value: latestUpdate?.timeAgo || "No recent activity",
    },
  ];

  return (
    <div className="owner-dashboard-container">
      <div className="dashboard-hero">
        <div>
          <p className="hero-kicker">
            {isInstitutionAdmin
              ? "Institution Admin Dashboard"
              : "Institution Owner Dashboard"}
          </p>
          <h2 className="hero-title">
            {institution?.name || "Institution Dashboard"}
          </h2>
          <p className="hero-subtitle">
            {institution
              ? `${institution.city}, ${institution.country}`
              : "Connect your institution to see live metrics."}
          </p>
        </div>
      </div>

      <div className="summary-cards-row">
        <div className="summary-card">
          <div>
            <p className="card-title">Total Students</p>
            <h3 className="card-value">
              {stats.studentCount.toLocaleString("en-US")}
            </h3>
          </div>
          <div className="summary-icon-container icon-student">
            <FontAwesomeIcon icon={faUserGraduate} />
          </div>
        </div>

        <div className="summary-card">
          <div>
            <p className="card-title">Total Courses</p>
            <h3 className="card-value">
              {stats.courseCount.toLocaleString("en-US")}
            </h3>
          </div>
          <div className="summary-icon-container icon-course">
            <FontAwesomeIcon icon={faBookOpen} />
          </div>
        </div>

        <div className="summary-card">
          <div>
            <p className="card-title">Total Teachers</p>
            <h3 className="card-value">
              {stats.teacherCount.toLocaleString("en-US")}
            </h3>
          </div>
          <div className="summary-icon-container icon-teacher">
            <FontAwesomeIcon icon={faChalkboardTeacher} />
          </div>
        </div>

        <div className="summary-card">
          <div>
            <p className="card-title">Institution Admins</p>
            <h3 className="card-value">
              {stats.adminCount.toLocaleString("en-US")}
            </h3>
          </div>
          <div className="summary-icon-container icon-admin">
            <FontAwesomeIcon icon={faUserShield} />
          </div>
        </div>
      </div>

      <div className="overview-grid">
        <div className="card distribution-panel">
          <div className="panel-header">
            <h3 className="panel-title">Role Distribution</h3>
            <FontAwesomeIcon icon={faEllipsisH} className="panel-icon" />
          </div>

          <p className="distribution-subtitle">
            Total managed users: {totalManagedUsers.toLocaleString("en-US")}
          </p>
          <div className="distribution-list">
            {roleDistribution.map((item) => (
              <div key={item.label} className="distribution-item">
                <div className="distribution-row">
                  <span className="distribution-label">{item.label}</span>
                  <span className="distribution-meta">
                    {item.count.toLocaleString("en-US")} ({item.percent}%)
                  </span>
                </div>
                <div className="distribution-track">
                  <div
                    className={`distribution-fill ${item.className}`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card updates-panel">
          <div className="panel-header">
            <h3 className="panel-title">Recent Updates</h3>
            <FontAwesomeIcon icon={faEllipsisH} className="panel-icon" />
          </div>

          <div className="updates-list">
            {recentUpdates.length === 0 ? (
              <p className="empty-updates">No recent updates found.</p>
            ) : (
              recentUpdates.map((item) => (
                <div key={item.id} className="update-item">
                  <div className={`update-icon ${item.iconClassName}`}>
                    <FontAwesomeIcon icon={item.icon} />
                  </div>
                  <div className="update-content">
                    <p className="update-title">{item.title}</p>
                    <p className="update-subtitle">{item.subtitle}</p>
                  </div>
                  <span className="update-time">{item.timeAgo}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bottom-row">
        <div className="card live-snapshot-panel">
          <div className="panel-header">
            <h3 className="panel-title">Live Snapshot</h3>
            <FontAwesomeIcon icon={faEllipsisH} className="panel-icon" />
          </div>

          <div className="snapshot-list">
            {liveSnapshot.map((item) => (
              <div key={item.label} className="snapshot-item">
                <span className="snapshot-label">{item.label}</span>
                <span className="snapshot-value">{item.value}</span>
              </div>
            ))}
          </div>
          </div>

        <div className="card">
          <div className="panel-header compact">
            <h3 className="panel-title">Calendar</h3>
            <FontAwesomeIcon icon={faEllipsisH} className="panel-icon" />
          </div>
          <EventCalendar />
        </div>
      </div>
    </div>
  );
}
