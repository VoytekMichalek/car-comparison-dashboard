import { repairResearch } from '../data';
import { formatDate } from '../lib';
import { SourceRefs } from './Shared';

export default function RepairEvidence({ familyId }: { familyId: string }) {
  const findings = repairResearch.findings.filter(f => f.familyIds.includes(familyId));
  return <details className="panel repair-evidence"><summary>Future repairs: evidence & limits</summary><p>{repairResearch.method}</p>{findings.map(f => <section key={f.title}><h3>{f.title}</h3><p>{f.text} <SourceRefs ids={f.sourceIds} /></p></section>)}<p className="micro muted">Checked {formatDate(repairResearch.checked)}. Optional savings are excluded from running costs by default. The separate repair rating uses the researched reference, not your savings input. Covered insurance damage and warranty/recall remedies are excluded.</p></details>;
}
