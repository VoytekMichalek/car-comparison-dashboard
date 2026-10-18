import { cargoFor, cargoTotals } from '../cargo';
import { formatDate } from '../lib';
import type { Vehicle } from '../types';
import { SourceRefs } from './Shared';
import '../cargo.css';

const litres = (value: number) => `${value.toLocaleString('en-AU')} L`;

export function CargoCapacity({ vehicle }: { vehicle: Vehicle }) {
  const cargo = cargoFor(vehicle.id);
  if (!cargo) return null;
  const totals = cargoTotals(cargo);
  return <section className="cargo-capacity" aria-label={`${vehicle.make} ${vehicle.model} cargo capacity`}>
    <h3>Boot & front storage</h3>
    <div className="cargo-primary"><span>Rear boot · rear seats up</span><strong>{litres(cargo.rearSeatsUpLitres)}</strong><small>All {cargo.seats} seats available</small></div>
    <dl className="cargo-extra-capacities">
      <div><dt>Front storage (frunk)</dt><dd>{litres(cargo.frontLitres)}</dd></div>
      <div><dt>Total with seats up</dt><dd>{litres(totals.seatsUpLitres)}<small>{litres(cargo.rearSeatsUpLitres)} rear + {litres(cargo.frontLitres)} front</small></dd></div>
      <div><dt>Rear seats folded</dt><dd>{litres(cargo.rearSeatsFoldedLitres)}<small>Rear only · {litres(totals.seatsFoldedLitres)} including front storage</small></dd></div>
    </dl>
    <p className="cargo-method">{cargo.method}</p>
    <details className="cargo-source"><summary>Source & configuration</summary><p>{cargo.scope} <SourceRefs ids={cargo.sourceIds} /></p><p>Checked {formatDate(cargo.checked)}.</p></details>
  </section>;
}
