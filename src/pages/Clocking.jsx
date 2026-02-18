import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ClockForm from "../components/ClockForm";
import AttendanceTable from "../components/AttendanceTable";
import {
  getAttendance,
  getAttendanceByUserId,
  getUsers,
} from "../services/api";

// RBAC on Clocking page:
//   Employee → sees only their own attendance
//   Manager  → sees their own + employees in their department
//   HR       → sees everyone's attendance
function Clocking() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      let data;

      if (user.userType === "employee") {
        // Employee: only their own records
        data = (await getAttendanceByUserId(user._id)).data;
      } else if (user.userType === "manager") {
        // Manager: records of all users in their department
        const allUsers = (await getUsers()).data;
        const deptUserIds = allUsers
          .filter((u) => u.department === user.department)
          .map((u) => u._id);
        const allRecords = (await getAttendance()).data;
        data = allRecords.filter((r) => deptUserIds.includes(r.userId));
      } else {
        // HR: everything
        data = (await getAttendance()).data;
      }

      setRecords(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (error) {
      console.error("Failed to fetch attendance records:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Employee Clocking
      </h2>
      <ClockForm onRecordUpdate={fetchRecords} />
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Attendance Records
        {user.userType === "manager" && (
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Department: {user.department})
          </span>
        )}
      </h3>
      <AttendanceTable records={records} loading={loading} />
    </div>
  );
}

export default Clocking;
