import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { createAttendance, updateAttendance, findTodayRecord } from '../services/api'

// ClockForm now uses the logged-in user's name automatically.
// No more manual name input – the user's identity comes from AuthContext.
function ClockForm({ onRecordUpdate }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  // Build the display name from the logged-in user
  const fullName = `${user.name} ${user.surname}`

  const getCurrentDateTime = () => {
    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const day = now.toLocaleDateString('en-US', { weekday: 'long' })
    const time = now.toTimeString().split(' ')[0]
    return { date, day, time }
  }

  const handleClockIn = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { date, day, time } = getCurrentDateTime()
      const existingRecord = await findTodayRecord(fullName, date)
    

      if (existingRecord) {
        if (existingRecord.clockIn) {
          setMessage({ type: 'error', text: 'You have already clocked in today' })
        } else {
          await updateAttendance(existingRecord._id, {
            clockInTime: time,
            clockIn: true,
          })
          setMessage({ type: 'success', text: 'Clock-in updated successfully!' })
          onRecordUpdate()
        }
      } else {
        await createAttendance({
          userId: user._id,
          name: fullName,
          date,
          day,
          clockInTime: time,
          clockIn: true,
        })
        setMessage({ type: 'success', text: 'Clocked in successfully!' })
        onRecordUpdate()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clock in. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleClockOut = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const { date, day, time } = getCurrentDateTime()
      const existingRecord = await findTodayRecord(fullName, date)

      if (existingRecord) {
        if (!existingRecord.clockIn) {
          setMessage({ type: 'error', text: 'You need to clock in first' })
        } else if (existingRecord.clockOut) {
          setMessage({ type: 'error', text: 'You have already clocked out today' })
        } else {
          await updateAttendance(existingRecord._id, {
            clockOutTime: time,
            clockOut: true,
          })
          setMessage({ type: 'success', text: 'Clocked out successfully!' })
          onRecordUpdate()
        }
      } else {
        await createAttendance({
          userId: user._id,
          name: fullName,
          date,
          day,
          clockInTime: "",
          clockOutTime: time,
          clockIn: false,
          clockOut: true,
        })
        setMessage({ type: 'warning', text: 'Clocked out without clocking in first' })
        onRecordUpdate()
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clock out. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Clock In / Out</h2>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Show the logged-in user's name (read-only) */}
        <div className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
          {fullName}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleClockIn}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Clock In'}
          </button>

          <button
            onClick={handleClockOut}
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Clock Out'}
          </button>
        </div>
      </div>

      {message.text && (
        <div
          className={`mt-4 p-3 rounded-md ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : message.type === 'warning'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}

export default ClockForm
