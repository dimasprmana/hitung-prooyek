import { formatRupiah } from '../utils/currency'

function MaterialResultTable({ items = [] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Material</th>
            <th>Jumlah</th>
            <th>Satuan</th>
            <th>Harga Satuan</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={`${item.materialId || item.material}-${item.unit}`}>
              <td>{item.material || item.name}</td>
              <td>{item.quantity}</td>
              <td>{item.unit}</td>
              <td>{formatRupiah(item.unitPrice || 0)}</td>
              <td>{formatRupiah(item.total || item.totalCost || 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default MaterialResultTable
