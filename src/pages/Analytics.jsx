import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import SearchBar from '../components/SearchBar'
import AttendanceTable from '../components/AttendanceTable'
import AttendanceHistory from '../components/AttendanceHistory'
import { BarChart, PieChart, StatCard } from '../components/Charts'
import { getAttendance, getAttendanceByUserId, getUsers } from '../services/api'

// RBAC on Analytics page:
//   Employee → sees only their own analytics
//   Manager  → sees analytics for their department
//   HR       → sees analytics for everyone
function Analytics() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true)
        let data
        if (user.userType === 'employee') {
          // Employee: only own records
          data = (await getAttendanceByUserId(user._id)).data
        } else if (user.userType === 'manager') {
          // Manager: department records
          const allUsers = (await getUsers()).data
          const deptUserIds = allUsers
            .filter((u) => u.department === user.department)
            .map((u) => u._id)
          const allRecords = (await getAttendance()).data
          data = allRecords.filter((r) => deptUserIds.includes(r.userId))
        } else {
          // HR: everything
          data = (await getAttendance()).data
        }

        setRecords(data)
      } catch (error) {
        console.error('Failed to fetch attendance records:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [])

  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) {
      return records
    }
    return records.filter((record) =>
      record.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [records, searchQuery])

  const isSearchingSpecificEmployee = useMemo(() => {
    if (!searchQuery.trim()) return false
    const uniqueNames = [...new Set(filteredRecords.map(r => r.name.toLowerCase()))]
    return uniqueNames.length === 1 && filteredRecords.length > 0
  }, [searchQuery, filteredRecords])

  const stats = useMemo(() => {
    const totalDaysPresent = filteredRecords.filter((r) => r.clockIn).length
    const totalClockIns = filteredRecords.filter((r) => r.clockIn).length
    const totalClockOuts = filteredRecords.filter((r) => r.clockOut).length
    const missedDays = filteredRecords.filter((r) => !r.clockIn).length

    return {
      totalDaysPresent,
      totalClockIns,
      totalClockOuts,
      missedDays,
    }
  }, [filteredRecords])

  const attendanceByEmployee = useMemo(() => {
    const employeeMap = {}
    filteredRecords.forEach((record) => {
      if (!employeeMap[record.name]) {
        employeeMap[record.name] = 0
      }
      if (record.clockIn) {
        employeeMap[record.name]++
      }
    })

    return Object.entries(employeeMap).map(([label, value]) => ({
      label,
      value,
    }))
  }, [filteredRecords])

  const clockStatusData = useMemo(() => {
    return [
      { label: 'Clocked In', value: stats.totalClockIns },
      { label: 'Missed Clock-In', value: stats.missedDays },
    ]
  }, [stats])

  const attendanceByDay = useMemo(() => {
    const dayMap = { Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0, Friday: 0, Saturday: 0, Sunday: 0 }
    filteredRecords.forEach((record) => {
      if (record.clockIn && dayMap.hasOwnProperty(record.day)) {
        dayMap[record.day]++
      }
    })
    return Object.entries(dayMap).map(([label, value]) => ({ label, value }))
  }, [filteredRecords])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Attendance Analytics
        {user.userType === 'manager' && (
          <span className="text-sm font-normal text-gray-500 ml-2">
            (Department: {user.department})
          </span>
        )}
      </h2>

      {/* Search bar: employees only see their own data, so hide search for them */}
      {user.userType !== 'employee' && (
        <div className="mb-6 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search employee by name..."
          />
        </div>
      )}

      {searchQuery && (
        <p className="text-sm text-gray-500 mb-4">
          Showing results for: <span className="font-medium">{searchQuery}</span>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Days Present"
          value={stats.totalDaysPresent}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Clock-Ins"
          value={stats.totalClockIns}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          }
        />
        <StatCard
          title="Total Clock-Outs"
          value={stats.totalClockOuts}
          color="yellow"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BarChart
          data={attendanceByEmployee}
          title="Days Attended by Employee"
        />
        <PieChart
          data={clockStatusData}
          title="Clock-In Status Distribution"
        />
      </div>

      {isSearchingSpecificEmployee && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <BarChart
              data={attendanceByDay}
              title="Attendance by Day of Week"
            />
            <AttendanceHistory
              records={filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date))}
              employeeName={filteredRecords[0]?.name}
            />
          </div>
        </>
      )}

      {/* For employees searching just their own data, show history directly */}
      {user.userType === 'employee' && records.length > 0 && (
        <div className="mb-6">
          <AttendanceHistory
            records={records.sort((a, b) => new Date(b.date) - new Date(a.date))}
            employeeName={`${user.name} ${user.surname}`}
          />
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance Records</h3>
      <AttendanceTable
        records={filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date))}
        loading={loading}
      />
    </div>
  )
}

export default Analytics
