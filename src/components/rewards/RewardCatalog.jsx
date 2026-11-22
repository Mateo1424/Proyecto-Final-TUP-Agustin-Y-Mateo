import { points, money } from '../../utils/format.js';

export default function RewardCatalog({ items, balance, pending, storageError, busy, onSelect }) {
  return <div className="reward-catalog">{items?.map(product => <article className="reward-panel reward-product" key={product.id}>
    <div><p className="reward-eyebrow">{product.platform}</p><h2>{product.product}</h2></div>
    <dl className="reward-product-facts"><div><dt>Valor del producto</dt><dd>{money(product.faceValue, product.currency)}</dd></div><div><dt>Región</dt><dd>{product.region}</dd></div></dl>
    <p className="reward-muted reward-compatibility">{product.compatibility}</p>
    <div className="reward-product-cost"><span>Costo del canje</span><strong>{points(product.costPoints)}</strong></div>
    {!product.available && <p className="reward-muted">{product.unavailableReason || 'Producto no disponible.'}</p>}
    <div className="reward-product-actions">
      <button type="button" className="reward-button reward-primary" disabled={!product.available || balance === null || balance < product.costPoints || !!pending || !!storageError || busy} onClick={() => onSelect(product)}>{!product.available ? 'No disponible' : balance !== null && balance < product.costPoints ? 'Puntos insuficientes' : 'Canjear puntos'}</button>
      {product.sourceUrl && <a className="reward-text-button" href={product.sourceUrl} target="_blank" rel="noreferrer">Información del producto</a>}
    </div>
  </article>)}</div>;
}
