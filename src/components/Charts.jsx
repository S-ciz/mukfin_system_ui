function BarChart({ data, title }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-24 text-sm text-gray-600 truncate" title={item.label}>
              {item.label}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              >
                <span className="text-xs text-white font-medium">
                  {item.value}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PieChart({ data, title }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  let cumulativePercent = 0

  const colors = ['#22c55e', '#ef4444', '#3b82f6', '#f59e0b']

  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent)
    const y = Math.sin(2 * Math.PI * percent)
    return [x, y]
  }

  const slices = data.map((slice, index) => {
    const percent = total > 0 ? slice.value / total : 0
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent)
    cumulativePercent += percent
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent)
    const largeArcFlag = percent > 0.5 ? 1 : 0

    const pathData = [
      `M ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      'L 0 0',
    ].join(' ')

    return {
      path: pathData,
      color: colors[index % colors.length],
      label: slice.label,
      value: slice.value,
      percent: Math.round(percent * 100),
    }
  })

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="w-48 h-48">
          <svg viewBox="-1.2 -1.2 2.4 2.4" className="transform -rotate-90">
            {total > 0 ? (
              slices.map((slice, index) => (
                <path
                  key={index}
                  d={slice.path}
                  fill={slice.color}
                  className="hover:opacity-80 transition-opacity"
                />
              ))
            ) : (
              <circle cx="0" cy="0" r="1" fill="#e5e7eb" />
            )}
          </svg>
        </div>
        <div className="flex flex-col gap-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-sm text-gray-600">
                {slice.label}: {slice.value} ({slice.percent}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  )
}

export { BarChart, PieChart, StatCard }
