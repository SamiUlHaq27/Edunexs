import React, { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUniversity,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { institutionService } from "../../services/institution.service";
import { Institution } from "../../types";

type MonthlyRegistration = {
  monthLabel: string;
  count: number;
};

const formatActivityDate = (isoDate: string): string => {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const getRollingLast12MonthsData = (
  institutions: Institution[],
): MonthlyRegistration[] => {
  const now = new Date();
  const months: MonthlyRegistration[] = [];

  for (let index = 11; index >= 0; index -= 1) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const monthLabel = monthStart.toLocaleString("en-US", { month: "short" });
    months.push({ monthLabel, count: 0 });
  }

  institutions.forEach((institution) => {
    const createdDate = new Date(institution.createdAt);
    if (Number.isNaN(createdDate.getTime())) {
      return;
    }

    const monthDifference =
      (now.getFullYear() - createdDate.getFullYear()) * 12 +
      (now.getMonth() - createdDate.getMonth());

    if (monthDifference >= 0 && monthDifference <= 11) {
      const targetIndex = 11 - monthDifference;
      months[targetIndex].count += 1;
    }
  });

  return months;
};

// --- Bar Chart: Institutions Registered per Month ---
const RegistrationChart = ({ data }: { data: MonthlyRegistration[] }) => {
  const counts = data.map((item) => item.count);
  const maxDataPoint = Math.max(...counts, 0);
  const stepSize = Math.max(1, Math.ceil(maxDataPoint / 5));
  const steps = Array.from({ length: 6 }, (_, index) => index * stepSize);
  const max = Math.max(stepSize * 5, 1);

  return (
    <div
      style={{
        width: "100%",
        height: "250px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, display: "flex" }}>
        {/* Y-Axis Labels */}
        <div
          style={{
            display: "flex",
            flexDirection: "column-reverse",
            justifyContent: "space-between",
            paddingRight: "10px",
            color: "#6b7280",
            fontSize: "0.75rem",
            paddingBottom: "20px",
          }}
        >
          {steps.map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>

        {/* Chart Area */}
        <div
          style={{
            flex: 1,
            position: "relative",
            borderLeft: "1px solid #e5e7eb",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          {/* Grid Lines */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column-reverse",
              justifyContent: "space-between",
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            {steps.map((_, i) => (
              <div
                key={i}
                style={{
                  width: "100%",
                  height: "1px",
                  background: i === 0 ? "transparent" : "#e5e7eb",
                }}
              ></div>
            ))}
          </div>

          {/* Bars */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "flex-end",
              padding: "0 10px",
              gap: "4%",
              zIndex: 1,
            }}
          >
            {data.map((item, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${(item.count / max) * 100}%`,
                  background: "#2c5282", // Darker blue like image
                  borderRadius: "2px 2px 0 0",
                  transition: "height 0.3s ease",
                  position: "relative",
                }}
                title={`${item.monthLabel}: ${item.count}`}
              ></div>
            ))}
          </div>
        </div>
      </div>
      {/* X-Axis Labels */}
      <div
        style={{
          display: "flex",
          paddingLeft: "30px",
          paddingTop: "8px",
          justifyContent: "space-between",
          paddingRight: "10px",
        }}
      >
        {data.map((item, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: "0.75rem",
              color: "#6b7280",
            }}
          >
            {item.monthLabel}
          </span>
        ))}
      </div>
    </div>
  );
};

// --- Donut Chart: User Demographics ---
const UserDemographicsChart = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: "100%",
        justifyContent: "space-around",
      }}
    >
      {/* Donut */}
      <div
        style={{
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          // Orange (Student), Dark Blue (Admin), Light Blue (Active/Teacher)
          background:
            "conic-gradient(#ed8936 0% 15%, #2b6cb0 15% 45%, #2c5282 45% 100%)",
          position: "relative",
          display: "grid",
          placeItems: "center",
        }}
      >
        {/* Inner White Circle for Donut Effect */}
        <div
          style={{
            width: "90px",
            height: "90px",
            background: "white",
            borderRadius: "50%",
          }}
        ></div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              background: "#2c5282",
              borderRadius: "2px",
            }}
          ></div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              Admin
            </span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              background: "#2b6cb0",
              borderRadius: "2px",
            }}
          ></div>
          <span
            style={{ fontSize: "0.85rem", fontWeight: "500", color: "#4b5563" }}
          >
            Teacher
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "16px",
              height: "16px",
              background: "#ed8936",
              borderRadius: "2px",
            }}
          ></div>
          <span
            style={{ fontSize: "0.85rem", fontWeight: "500", color: "#4b5563" }}
          >
            Student
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Line Chart: Platform Usage Analytics ---
const PlatformUsageChart = () => {
  // Mock Data mimicking the image's line shape (Jan-Dec)
  // Scale 0-100
  const data = [25, 60, 40, 40, 80, 40, 65, 45, 90, 50, 90];
  // Generate SVG Points
  // X range: 0 to 100%
  // Y range: 100% to 0% (since SVG Y is top-down)
  const max = 100;
  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - val;
      return `${x},${y}`;
    })
    .join(" ");

  const steps = [0, 25, 50, 75, 100];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "200px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, display: "flex" }}>
        {/* Y-Axis */}
        <div
          style={{
            display: "flex",
            flexDirection: "column-reverse",
            justifyContent: "space-between",
            paddingRight: "10px",
            color: "#6b7280",
            fontSize: "0.75rem",
            paddingBottom: "20px",
          }}
        >
          {steps.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>

        {/* Chart Area */}
        <div
          style={{
            flex: 1,
            position: "relative",
            borderLeft: "1px solid #e5e7eb",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          {/* Grid Lines */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column-reverse",
              justifyContent: "space-between",
              zIndex: 0,
            }}
          >
            {steps.map((_, i) => (
              <div
                key={i}
                style={{ width: "100%", height: "1px", background: "#e5e7eb" }}
              ></div>
            ))}
          </div>

          {/* SVG Line */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              overflow: "visible",
              zIndex: 1,
            }}
          >
            <polyline
              fill="none"
              stroke="#1a365d" // Dark line color
              strokeWidth="2"
              points={points}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
      </div>

      {/* X-Axis */}
      <div
        style={{
          display: "flex",
          paddingLeft: "30px",
          paddingTop: "8px",
          justifyContent: "space-between",
        }}
      >
        {months.map((m, i) => (
          <span
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: "0.75rem",
              color: "#6b7280",
            }}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
};

// --- Main Dashboard ---
export default function SystemAdminDashboard() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
  const [institutionsError, setInstitutionsError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    const fetchInstitutions = async () => {
      setIsLoadingInstitutions(true);
      setInstitutionsError(null);

      try {
        const response = await institutionService.getAllInstitutions({
          page: 1,
          size: 1000,
          filters: {},
        });

        setInstitutions(response?.data || []);
      } catch (error: any) {
        setInstitutionsError(
          error?.response?.data?.message || "Failed to load dashboard data",
        );
      } finally {
        setIsLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, []);

  const monthlyRegistrations = useMemo(
    () => getRollingLast12MonthsData(institutions),
    [institutions],
  );

  const recentActivities = useMemo(
    () =>
      [...institutions]
        .filter((institution) => !!institution.createdAt)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 4),
    [institutions],
  );

  return (
    <div>
      <h2
        style={{
          fontSize: "1.5rem",
          marginBottom: "1.5rem",
          fontWeight: "bold",
        }}
      >
        System Admin Dashboard
      </h2>

      {/* Top Row */}
      <div
        className="dashboard-grid-modern"
        style={{ gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}
      >
        {/* Card 1: Institutions Chart */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3
            className="card-title"
            style={{
              fontWeight: "bold",
              color: "#000",
              marginBottom: "0.5rem",
            }}
          >
            Institutions Registered per Month
          </h3>
          <div style={{ height: "1rem" }}></div> {/* Spacer */}
          {isLoadingInstitutions ? (
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              Loading institutions data...
            </p>
          ) : institutionsError ? (
            <p style={{ fontSize: "0.9rem", color: "#b91c1c" }}>
              {institutionsError}
            </p>
          ) : institutions.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              No institutions found for the selected period.
            </p>
          ) : (
            <RegistrationChart data={monthlyRegistrations} />
          )}
        </div>

        {/* Card 2: User Demographics */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3
            className="card-title"
            style={{ fontWeight: "bold", color: "#000", marginBottom: "0" }}
          >
            User Demographics
          </h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6b7280",
              marginBottom: "1rem",
            }}
          >
            Active Users by Role (Admin, Teacher, Student)
          </p>
          <UserDemographicsChart />
        </div>
      </div>

      {/* Bottom Row */}
      <div
        className="dashboard-grid-modern"
        style={{
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1.5rem",
          marginTop: "1.5rem",
        }}
      >
        {/* Card 3: Recent Activities */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3
            className="card-title"
            style={{
              fontWeight: "bold",
              color: "#000",
              marginBottom: "1.5rem",
            }}
          >
            Recent Activities & Alerts
          </h3>
          {isLoadingInstitutions ? (
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              Loading recent activities...
            </p>
          ) : institutionsError ? (
            <div className="activity-item" style={{ alignItems: "flex-start" }}>
              <div
                style={{
                  background: "#fee2e2",
                  color: "#dc2626",
                  padding: "10px",
                  borderRadius: "50%",
                  minWidth: "40px",
                  textAlign: "center",
                }}
              >
                <FontAwesomeIcon icon={faExclamationTriangle} />
              </div>
              <div>
                <p
                  style={{
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    marginBottom: "0.2rem",
                  }}
                >
                  Unable to load recent activities
                </p>
                <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                  {institutionsError}
                </p>
              </div>
            </div>
          ) : recentActivities.length === 0 ? (
            <p style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              No recent institution registrations.
            </p>
          ) : (
            <div className="activity-list">
              {recentActivities.map((institution) => (
                <div
                  key={institution.prefix}
                  className="activity-item"
                  style={{ alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      background: "#e0f2fe",
                      color: "#0284c7",
                      padding: "10px",
                      borderRadius: "50%",
                      minWidth: "40px",
                      textAlign: "center",
                    }}
                  >
                    <FontAwesomeIcon icon={faUniversity} />
                  </div>
                  <div>
                    <p
                      style={{
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        marginBottom: "0.2rem",
                      }}
                    >
                      New Institution "{institution.name}" registered
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      {formatActivityDate(institution.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card 4: Platform Usage Analytics */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3
            className="card-title"
            style={{ fontWeight: "bold", color: "#000", marginBottom: "0" }}
          >
            Platform Usage Analytics
          </h3>
          <p
            style={{
              fontSize: "0.85rem",
              color: "#6b7280",
              marginBottom: "1.5rem",
            }}
          >
            Daily Active Users (Last 30 Days)
          </p>
          <PlatformUsageChart />
        </div>
      </div>
    </div>
  );
}
