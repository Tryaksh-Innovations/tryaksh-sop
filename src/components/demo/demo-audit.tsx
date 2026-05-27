import { Badge } from "@/components/ui/badge";

const ROWS: {
  time: string;
  actor: string;
  role: string;
  action: string;
  variant: "default" | "secondary" | "outline" | "seal" | "blueprint" | "warn" | "alert" | "signal";
  detail: string;
}[] = [
  {
    time: "27 May 26, 14:42:18",
    actor: "ceo@tryakshipl.com",
    role: "ceo",
    action: "Approval granted",
    variant: "seal",
    detail: "Schematic Lock — locked; tag v1.0-schematic-locked",
  },
  {
    time: "27 May 26, 14:38:01",
    actor: "ceo@tryakshipl.com",
    role: "ceo",
    action: "Approval granted",
    variant: "seal",
    detail: "Schematic Review #1 — proceeding to lock",
  },
  {
    time: "27 May 26, 14:11:45",
    actor: "pde@tryakshipl.com",
    role: "designer",
    action: "Approval requested",
    variant: "warn",
    detail: "Schematic Review #1",
  },
  {
    time: "27 May 26, 13:55:22",
    actor: "pde@tryakshipl.com",
    role: "designer",
    action: "Sent back",
    variant: "alert",
    detail: "Add 22Ω series resistor on SCL3300 SCK; check pull-up on I2C bus",
  },
  {
    time: "27 May 26, 11:02:09",
    actor: "ceo@tryakshipl.com",
    role: "ceo",
    action: "Project created",
    variant: "blueprint",
    detail: "DRTG-MAIN-V2 — DRTG main board, revision 2",
  },
];

export function DemoAudit() {
  return (
    <div className="border border-ink/80">
      <div className="border-b border-ink/80 bg-paper-2/60 px-4 py-2 flex items-center justify-between">
        <span className="mono-caps text-ink-2">
          5 entries · most recent first
        </span>
        <span className="font-mono text-[10px] text-ink-3 uppercase tracking-[0.12em]">
          IST · Asia/Kolkata
        </span>
      </div>
      <table className="w-full text-sm border-collapse">
        <thead className="border-b border-rule-3 bg-paper-3">
          <tr>
            <th className="text-left px-3 py-2 mono-caps text-ink-3 w-36">
              When
            </th>
            <th className="text-left px-3 py-2 mono-caps text-ink-3 w-32">
              Action
            </th>
            <th className="text-left px-3 py-2 mono-caps text-ink-3">Actor</th>
            <th className="text-left px-3 py-2 mono-caps text-ink-3">Detail</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row, i) => (
            <tr key={i} className="border-b border-rule last:border-b-0">
              <td className="px-3 py-2.5 align-top font-mono text-[10px] text-ink-2">
                {row.time}
              </td>
              <td className="px-3 py-2.5 align-top">
                <Badge variant={row.variant}>{row.action}</Badge>
              </td>
              <td className="px-3 py-2.5 align-top">
                <div className="text-[12px] text-ink">{row.actor}</div>
                <div className="mono-caps text-ink-3">{row.role}</div>
              </td>
              <td className="px-3 py-2.5 align-top text-[12px] text-ink-2">
                {row.detail}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
