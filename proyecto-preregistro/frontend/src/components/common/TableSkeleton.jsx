export default function TableSkeleton({ rows = 5, cols = 3 }) {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {Array.from({ length: cols }, (_, i) => (
              <th key={i}><div className="skeleton" style={{ height: 12, width: `${60 + (i % 2) * 30}%`, borderRadius: 4 }} /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }, (_, c) => (
                <td key={c}><div className="skeleton" style={{ height: 14, width: `${50 + ((r + c) % 3) * 15}%`, borderRadius: 4 }} /></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
