import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  createLeaveRequest,
  getLeaveRequestsByUserId,
} from '../services/api'

function LeaveRequest() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [form, setForm] = useState({
    leaveType: 'Annual',
    startDate: '',
    endDate: '',
    reason: '',
  })

  // Fetch this user's leave requests on mount
  const fetchRequests = async () => {
    try {
      setLoading(true)
      const data = (await getLeaveRequestsByUserId(user._id)).data
      setRequests(data)
    } catch (err) {
      console.error('Failed to fetch leave requests:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    if (!form.startDate || !form.endDate || !form.reason.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all fields' })
      return
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      setMessage({ type: 'error', text: 'End date cannot be before start date' })
      return
    }

    try {
      await createLeaveRequest({
        userId: user._id,
        name: `${user.name} ${user.surname}`,
        department: user.department,
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason,
        managerApproval: 'pending',
        hrApproval: 'pending',
        status: 'pending',
      })
      setMessage({ type: 'success', text: 'Leave request submitted successfully!' })
      setForm({ leaveType: 'Annual', startDate: '', endDate: '', reason: '' })
      fetchRequests()
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to submit leave request' })
    }
  }

  // Helper: returns a Tailwind badge class based on status string
  const statusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  // Overall status label combining manager + HR approvals
  const overallStatus = (req) => {
    if (req.status === 'rejected') return 'Rejected'
    if (req.hrApproval === 'approved') return 'Granted'
    if (req.managerApproval === 'approved') return 'Manager Approved (awaiting HR)'
    return 'Pending'
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Leave Requests</h2>

      {/* ─── Submit form ─── */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Submit New Request</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select
                name="leaveType"
                value={form.leaveType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Annual">Annual</option>
                <option value="Sick">Sick</option>
                <option value="Family">Family Responsibility</option>
                <option value="Study">Study</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              name="reason"
              value={form.reason}
              onChange={handleChange}
              rows={3}
              placeholder="Describe the reason for your leave..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {message.text && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Submit Request
          </button>
        </form>
      </div>

      {/* ─── My requests table ─── */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-800 p-6 pb-0">My Leave Requests</h3>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">No leave requests found</div>
          </div>
        ) : (
          <div className="overflow-x-auto p-6 pt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HR</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{req.leaveType}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{req.startDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{req.endDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadge(req.managerApproval)}`}>
                        {req.managerApproval}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadge(req.hrApproval)}`}>
                        {req.hrApproval}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        overallStatus(req) === 'Granted'
                          ? 'bg-green-100 text-green-800'
                          : overallStatus(req) === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {overallStatus(req)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default LeaveRequest
