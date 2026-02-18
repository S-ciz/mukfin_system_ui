import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getLeaveRequestsByDepartment,
  getAllLeaveRequests,
  updateLeaveRequest,
} from '../services/api'

function LeaveApproval() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null) // tracks which row is processing

  // RBAC: managers see their department only, HR sees everything
  const fetchRequests = async () => {
    try {
      setLoading(true)
      let data
      if (user.userType === 'hr') {
        data = (await getAllLeaveRequests()).data
      } else {
        // Manager – only their department
        data = (await getLeaveRequestsByDepartment(user.department)).data
      }
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

  // ─── Manager approval/rejection logic ───
  const handleManagerAction = async (reqId, action) => {
    setActionLoading(reqId)
    try {
      if (action === 'approve') {
        await updateLeaveRequest(reqId, { managerApproval: 'approved' })
      } else {
        // Reject at manager stage → whole request is rejected
        await updateLeaveRequest(reqId, {
          managerApproval: 'rejected',
          status: 'rejected',
        })
      }
      fetchRequests()
    } catch (err) {
      console.error('Failed to update leave request:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // ─── HR approval/rejection logic ───
  // HR can only approve after manager has approved (enforced in UI)
  const handleHrAction = async (reqId, action) => {
    setActionLoading(reqId)
    try {
      if (action === 'approve') {
        await updateLeaveRequest(reqId, {
          hrApproval: 'approved',
          status: 'granted',
        })
      } else {
        await updateLeaveRequest(reqId, {
          hrApproval: 'rejected',
          status: 'rejected',
        })
      }
      fetchRequests()
    } catch (err) {
      console.error('Failed to update leave request:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Badge helper
  const statusBadge = (status) => {
    switch (status) {
      case 'approved':
      case 'granted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Leave Approvals {user.userType === 'manager' && `(${user.department})`}
      </h2>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">Loading...</div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">No leave requests to review</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">HR</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{req.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 capitalize">{req.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{req.leaveType}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {req.startDate} → {req.endDate}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{req.reason}</td>
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
                      {/* ─── Manager actions: only if manager AND not yet decided ─── */}
                      {user.userType === 'manager' && req.managerApproval === 'pending' && req.status !== 'rejected' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleManagerAction(req._id, 'approve')}
                            disabled={actionLoading === req._id}
                            className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleManagerAction(req._id, 'reject')}
                            disabled={actionLoading === req._id}
                            className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {/* ─── HR actions: only after manager approved AND HR not yet decided ─── */}
                      {user.userType === 'hr' && req.managerApproval === 'approved' && req.hrApproval === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleHrAction(req._id, 'approve')}
                            disabled={actionLoading === req._id}
                            className="px-3 py-1 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            Final Approve
                          </button>
                          <button
                            onClick={() => handleHrAction(req._id, 'reject')}
                            disabled={actionLoading === req._id}
                            className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {/* Show status text when no actions are available */}
                      {req.status === 'rejected' && (
                        <span className="text-xs text-red-600 font-medium">Rejected</span>
                      )}
                      {req.status === 'granted' && (
                        <span className="text-xs text-green-600 font-medium">Granted</span>
                      )}

                      {/* Manager already approved but HR hasn't acted yet – show waiting text for manager view */}
                      {user.userType === 'manager' && req.managerApproval === 'approved' && req.status === 'pending' && (
                        <span className="text-xs text-gray-500">Awaiting HR</span>
                      )}

                      {/* HR sees pending requests that manager hasn't approved yet */}
                      {user.userType === 'hr' && req.managerApproval === 'pending' && req.status !== 'rejected' && (
                        <span className="text-xs text-gray-500">Awaiting Manager</span>
                      )}
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

export default LeaveApproval
