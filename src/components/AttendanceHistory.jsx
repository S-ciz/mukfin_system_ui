function AttendanceHistory({ records, employeeName }) {
  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Attendance History</h3>
        <p className="text-gray-500">No attendance history found</p>
      </div>
    )
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const calculateDuration = (clockIn, clockOut) => {
    if (!clockIn || !clockOut) return null

    const [inH, inM, inS] = clockIn.split(':').map(Number)
    const [outH, outM, outS] = clockOut.split(':').map(Number)

    const inMinutes = inH * 60 + inM + inS / 60
    const outMinutes = outH * 60 + outM + outS / 60

    const diffMinutes = outMinutes - inMinutes
    if (diffMinutes < 0) return null

    const hours = Math.floor(diffMinutes / 60)
    const minutes = Math.round(diffMinutes % 60)

    return `${hours}h ${minutes}m`
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Attendance History - {employeeName}
      </h3>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {records.map((record) => {
          const duration = calculateDuration(record.clockInTime, record.clockOutTime)

          return (
            <div
              key={record._id}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <div
                  className={`w-3 h-3 rounded-full ${
                    record.clockIn && record.clockOut
                      ? 'bg-green-500'
                      : record.clockIn
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                  }`}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(record.date)}
                  </p>
                  <span className="text-xs text-gray-500">{record.day}</span>
                </div>

                <div className="flex items-center gap-4 mt-1 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14" />
                    </svg>
                    {record.clockInTime || '--:--:--'}
                  </span>

                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                    </svg>
                    {record.clockOutTime || '--:--:--'}
                  </span>

                  {duration && (
                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {duration}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 flex gap-1">
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    record.clockIn
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  In
                </span>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    record.clockOut
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  Out
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total Records:</span>
          <span className="font-semibold text-gray-900">{records.length}</span>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Complete
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            Clock-in only
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            Incomplete
          </span>
        </div>
      </div>
    </div>
  )
}

export default AttendanceHistory
