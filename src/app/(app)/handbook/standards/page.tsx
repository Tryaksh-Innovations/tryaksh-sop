import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Markdown } from "@/components/shared/markdown";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export const metadata = {
  title: `Engineering Standards — ${APP_NAME}`,
  description:
    "Tryaksh Engineering Standards v1.0 — shared foundation for PCB and Mechanical Design SOPs.",
};

const STANDARDS_CONTENT = `## 1. Purpose and Scope

This document defines the engineering standards that apply to every design activity at Tryaksh Innovations, regardless of discipline. It is the shared foundation for the PCB Design SOP (TRYAKSH-SOP-PCB-001) and the Mechanical Design SOP (TRYAKSH-SOP-MECH-001). Where a discipline-specific SOP is silent on a topic, this document governs.

**Why this exists:** Tryaksh designs precision measurement instruments that go onto Indian Railway infrastructure. A single measurement error caused by a sloppy design decision can permanently damage product credibility with RDSO, IR, and metro corporations. The cost of preventing a mistake at the design stage is one engineer-hour. The cost of finding it after manufacturing is one prototype run. The cost of finding it in the field is the company.

## 2. Roles and Authority

| Role | Responsibility | Sign-off Authority |
| --- | --- | --- |
| Final Approver (currently CEO) | Release decision for any design going to manufacturing, prototype, or external vendor. Approves design classification. | All Class A and Class B releases. |
| Design Owner | Engineer/designer assigned to the part. Owns the design from concept to release. Responsible for all checklists being completed accurately. | Class C releases (with retroactive review). |
| Peer Reviewer | Independent engineer who reviews and signs the gate checklist before submitting for Final Approver sign-off. **Cannot be the Design Owner.** | Checklist completion only (not release). |
| Manufacturing Liaison | Person who interfaces with the fab/CNC vendor. Confirms vendor capability before files are released. Often the Design Owner for early-stage Tryaksh. | DFM checklist confirmation only. |

**Conflict resolution:** If the Design Owner and Peer Reviewer disagree on whether a checklist item is met, the Final Approver decides. Disagreements are logged in the project's Decision Log. There is no informal override.

## 3. Design Classification System

Every design (whole assembly or individual part/PCB) is assigned a Design Class at the start of work. The class determines how many review gates apply. Classification is set by the Design Owner and confirmed by the Final Approver at Concept Review.

| Class | Definition | Examples (DRTG) | Required Gates |
| --- | --- | --- | --- |
| **Class A** | Instrument-critical. Affects measurement accuracy, calibration, safety, or regulatory compliance. Failure = product failure. | Sensor mounting structure, rail contact assembly, main PCB, calibration jigs. | All 4 gates. No exceptions. |
| **Class B** | Supporting hardware. Affects user experience, durability, or assembly quality but not measurement accuracy. | Enclosure top cover, handle, battery compartment, status LED PCB. | Concept + DFM + Post-Prototype. |
| **Class C** | Internal tools, fixtures, jigs, prototypes for learning. Not shipped, not used for calibration of shipped product. | Workshop fixtures, test rigs, demo stands, internal mock-ups. | DFM only (light). |

**Default classification rule:** When in doubt, classify higher. Misclassifying a Class A part as Class B is a serious process violation. Misclassifying a Class C part as Class B wastes time but causes no harm.

## 4. File Management and Naming

### 4.1 Master Folder Structure (Google Drive)

Every project lives under a single top-level project folder with the structure below. No design files exist outside this structure. No personal Drive folders, no laptop-only files, no Dropbox.

\`\`\`
Tryaksh Engineering/
  └── [Project Name]_[Project Code]/
      ├── 00_Project_Charter/         ← brief, requirements, design classification
      ├── 01_WIP/                     ← active work, anything in here may change
      ├── 02_Review/                  ← awaiting Peer Review or Final Approver
      ├── 03_Released/                ← APPROVED. READ-ONLY by convention. Never edit.
      ├── 04_Manufacturing/           ← files sent to vendor + vendor confirmations
      ├── 05_Test_Reports/            ← prototype test data, inspection reports
      ├── 06_ECNs/                    ← Engineering Change Notices (post-release changes)
      └── 07_Archive/                 ← superseded versions, old prototypes
\`\`\`

### 4.2 File Naming Convention

**Mandatory format:** \`TRYAKSH-[TYPE]-[PROJECT]-[PART]-[REV].[ext]\`

- TYPE = MECH, PCB, SCH, GRB, BOM, DFM, FEA, TEST, ECN
- PROJECT = DRTG, JIG, TEST, etc. (3-5 char project code)
- PART = Sequential part number, 3 digits (e.g., 001, 047)
- REV = V[major].[minor] (e.g., V1.0, V2.3). Major bump = released change. Minor = WIP iteration.

**Example:** \`TRYAKSH-MECH-DRTG-014-V2.0.f3d\`

**Forbidden patterns:** 'final', 'final_v2', 'final_final', 'use this one', 'latest', or any filename without a version suffix. **If the file does not have a version, it does not exist.**

### 4.3 Version Control by Discipline

| Asset | Storage | Versioning Method |
| --- | --- | --- |
| KiCad project files (.kicad_sch, .kicad_pcb) | Git repository (Tryaksh-PCB-Repo). Mirrored to Drive 01_WIP daily. | Git commits. Tagged at each gate (e.g., v1.0-concept, v1.0-dfm, v1.0-released). |
| Fusion 360 files (.f3d, .f3z) | Fusion Team cloud (primary) + weekly export to Drive 01_WIP. | Fusion version history. Manual version marker at each gate. |
| Released artifacts (Gerbers, STEP, PDF drawings, BOMs) | 03_Released/ folder. No edits. Period. | Filename version. New release = new file, never overwrite. |
| Component libraries (KiCad symbols/footprints) | Single shared Tryaksh library on Git. No personal libraries on production designs. | Library Git commits. Reviewed before merge. |

## 5. The Four Universal Gates

Every Class A design passes through all four gates in order. Class B skips Gate 3 (Simulation). Class C runs only Gate 2 (light DFM). **Gates cannot be re-ordered or run in parallel.** Each gate produces a signed checklist (discipline-specific checklists are in the PCB and Mechanical SOPs).

### Gate 1 — Concept Review

- **Trigger:** Design Owner has a clear sketch, block diagram, or concept model and wants to commit to detailed design.
- **Output:** Signed Concept Review Checklist. Design Classification confirmed. Requirements traceability matrix started.
- **Failure mode this catches:** Building the wrong thing. Solving the wrong problem. Material/component choice that makes the rest of the design impossible.

### Gate 2 — DFM Review

- **Trigger:** Detailed design is complete, files appear ready to send to a vendor.
- **Output:** Signed DFM Checklist. Vendor capability written confirmation (email is acceptable, verbal is not). Cost estimate.
- **Failure mode this catches:** Designs that cannot be manufactured at the cost or quality expected. Late surprises from the vendor.

### Gate 3 — Simulation Review (Class A only)

- **Trigger:** Before any physical fabrication of a Class A part.
- **Output:** Signed FEA/SI Simulation Report. Tolerance stack-up (mechanical) or signal integrity analysis (PCB). Documented test plan for the upcoming prototype.
- **Failure mode this catches:** Structural failures, signal integrity issues, and tolerance stack-ups that only show up after spending money on hardware.

### Gate 4 — Post-Prototype Review

- **Trigger:** First physical prototype is built and tested against the documented test plan from Gate 3.
- **Output:** Signed Test Report. Decision: Release / Re-spin / Scrap. ECNs raised for any changes.
- **Failure mode this catches:** Iterating on hardware without learning. Calling a prototype 'good enough' without measuring against the spec it was designed to meet.

## 6. Engineering Change Notice (ECN) Process

Once a design is in \`03_Released/\`, it cannot be modified. Any change — however small — requires an ECN. This applies even if the prototype hasn't been built yet, once the release sign-off has happened.

1. Design Owner raises an ECN in \`06_ECNs/\` using the ECN template. ECN gets a number: \`TRYAKSH-ECN-[PROJECT]-[NNN]\`.
2. ECN states: what is changing, why, impact on parts already in production/inventory, regression risk.
3. ECN is reviewed by Peer Reviewer and approved by Final Approver. Same gate rigor as the original release.
4. On approval, a new revision of the affected file is created (V2.0 → V3.0). Old version moves to \`07_Archive/\`. New version goes to \`03_Released/\`.
5. Vendor is notified in writing if any in-flight parts are affected.

**Anti-pattern:** Editing a released file 'just to fix one small thing' without an ECN. This is the single most common cause of production confusion in small hardware companies. **It is forbidden at Tryaksh.**

## 7. Intellectual Property and Confidentiality

- All designs created using Tryaksh tools, time, or compensation are Tryaksh property. This is restated in every contract.
- Contractors sign an IP Assignment + NDA before any design file is shared. No exceptions, no 'we'll do it later'.
- Design files, BOMs, vendor quotes, and sensor selections are Tryaksh confidential. They are not shared with any party — including potential investors during pitch meetings — without written authorization from the Final Approver.
- Vendor inquiries (e.g., Chinese OEM outreach) deliberately withhold budget, full BOM, and IP-sensitive design details until an NDA is in place.
- Personal cloud accounts (personal Gmail, personal Drive, WhatsApp Web on a personal phone) are not used for Tryaksh design files. Period.

## 8. Records and Retention

Signed checklists, ECNs, test reports, and vendor confirmations are retained for the life of the product plus 7 years. This is the floor — Indian regulatory expectations may require more for railway products. Records live in the project folder and are also backed up monthly to a separate Drive account owned by the Final Approver.

## 9. Standards Review and Amendment

This document is reviewed every 6 months by the Final Approver. Proposed amendments are submitted in writing with rationale. Amendments take effect on the next major design start — they are not applied retroactively to in-flight designs unless a safety or compliance issue makes that necessary.

---

**Approved by:** Richansh, Founder & CEO, Tryaksh Innovations Pvt. Ltd.
`;

export default function HandbookStandardsPage() {
  return (
    <div className="space-y-10">
      <Link
        href="/handbook"
        className="inline-flex items-center gap-1.5 mono-caps text-ink-3 hover:text-ink"
      >
        <ArrowLeft className="size-3" />
        Back to handbook
      </Link>

      <header className="border-t border-rule-3 pt-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="size-3.5 text-ink-3" />
          <span className="mono-caps text-ink-3">
            TRYAKSH-STD-ENG-001 · v1.0 · CONTROLLED
          </span>
        </div>
        <h1 className="display text-[clamp(44px,6vw,72px)] leading-[0.98] text-ink">
          Engineering
          <br />
          <em className="italic" style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100, "WONK" 1' }}>
            Standards.
          </em>
        </h1>
        <p className="mt-5 max-w-2xl font-display text-[20px] leading-snug text-ink-2">
          Shared foundation for the PCB and Mechanical Design SOPs. Read this
          first — the PCB SOP builds on every rule defined here.
        </p>
      </header>

      <article className="border-t border-rule pt-6">
        <Markdown content={STANDARDS_CONTENT} />
      </article>
    </div>
  );
}
