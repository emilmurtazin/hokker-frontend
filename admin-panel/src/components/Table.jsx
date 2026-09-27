export default function Table({ columns, rows, keyField = 'id', onRowClick, empty = 'Ничего не найдено' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-ice-200">
            {columns.map((c) => (
              <th key={c.key} className="th">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td className="td text-neutral-400 py-10 text-center" colSpan={columns.length}>
                {empty}
              </td>
            </tr>
          )}
          {rows.map((row) => (
            <tr
              key={row[keyField]}
              className={`border-b border-ice-100 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-ice-50' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((c) => (
                <td key={c.key} className="td">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
