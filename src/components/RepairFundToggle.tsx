import { settingsFor } from '../ownership';
import type { PersonalData } from '../types';

export default function RepairFundToggle({ personal, onUpdate }: { personal: PersonalData; onUpdate: (value: PersonalData) => void }) {
  const settings = settingsFor(personal);
  return <div className="repair-fund-control"><label><input type="checkbox" checked={Boolean(settings.includeRepairFund)} onChange={e => onUpdate({ ...personal, ownership: { ...settings, includeRepairFund: e.target.checked } })} /><span>Include optional repair savings in budget</span></label><p>Off by default. Savings are not a bill. Running-cost scores and ownership spending always exclude the fund; repair exposure has its own rating.</p></div>;
}
