/**
 * Seed: PCB Workflow Stages
 *
 * The 10 stages of the Tryaksh PCB design workflow per SOP v2.0
 * (TRYAKSH-SOP-PCB-001 v2.0). Stage content is verbatim from the SOP.
 */

import { db } from "../../src/db";
import { workflowStages } from "../../src/db/schema";
import { logger } from "../../src/lib/logger";

interface StageSeed {
  stageNumber: string;
  name: string;
  subtitle: string;
  requiresApproval: boolean;
  isLockGate: boolean;
  displayOrder: number;
  descriptionMarkdown: string;
}

const PCB_STAGES: StageSeed[] = [
  {
    stageNumber: "1",
    name: "Parts Selection",
    subtitle: "Joint discussion — CEO + Designer",
    requiresApproval: true,
    isLockGate: false,
    displayOrder: 1,
    descriptionMarkdown: `**Owner:** CEO and Designer, jointly. CEO has final call on every part.

**Why CEO co-owns this:** Parts selection determines 80% of the board's eventual performance and 100% of its cost structure. It is the highest-leverage technical decision in the entire project. The CEO has product context (RDSO targets, ergonomics, cost, supply chain) the designer does not.

### What triggers Stage 1
- A Project Charter has been written and the board's purpose is clear.
- Design Class (A/B/C per Engineering Standards) is assigned.
- CEO and designer schedule a working session — typically 60–90 minutes for a board the size of the DRTG main board.

### Workflow
1. **Joint working session.** CEO and designer go through the board function-by-function (MCU, sensors, comms, power, user interface) and propose candidate parts together. The designer brings options; the CEO challenges them.
2. **For every part chosen, the designer records:** manufacturer name, manufacturer part number, LCSC P/N (or Mouser/Digi-Key P/N), stock level on the day of selection, datasheet revision, unit cost at 100/1000/10000 quantities, and a one-line rationale ("why this part over alternatives").
3. **CEO signs the parts list.** No part is added after this signature without a written exception.
4. **Parts list is committed** to \`00_Project_Charter/Parts_List_V1.0.xlsx\` in the project folder.

### Sourcing Rules (Recap from Engineering Standards)
- **First preference:** Parts already in Tryaksh-shipped designs (Approved Vendor List).
- **Second preference:** LCSC parts with stock ≥ 1000.
- **Third preference:** Mouser/Digi-Key with confirmed lead time ≤ 8 weeks.
- **DRTG sensors** (SCL3300, MLX90614, encoder, LS2-200MM, ADS1115, JDY-33, etc.) are pre-approved by name in the project charter. Substitution requires an ECN.

**Output:** Signed parts list. No board moves to Stage 2 without this signature.`,
  },
  {
    stageNumber: "2",
    name: "Block Diagram",
    subtitle: "Designer draws, CEO approves",
    requiresApproval: true,
    isLockGate: false,
    displayOrder: 2,
    descriptionMarkdown: `**Owner:** Designer draws. CEO approves.

**Why this stage exists separately from schematic capture:** The block diagram is the architecture. The schematic is the implementation. Mixing them is how architectures end up being whatever the schematic happened to become. Drawing them separately forces the designer to think about the system before drawing pins.

### Required Contents of the Block Diagram
- **Every functional block** (power conditioning, MCU, each sensor interface, each comms interface, user interface, mechanical interfaces) shown as a distinct block.
- **Every interconnect labelled** with: signal type (analog / digital / power / RF / mixed), interface protocol (SPI / I2C / UART / GPIO / ADC channel), expected data rate, and direction (one-way arrow or bidirectional).
- **Power architecture explicit:** battery → buck converter → which rails (3V3, 5V, sensor-specific). Show every rail. Show estimated current per rail.
- **External interfaces called out:** which signals leave the PCB and through what connector. Off-board lines need ESD protection — note this on the block diagram.
- **Test points planned:** indicate which signals will have dedicated test points.`,
  },
  {
    stageNumber: "3",
    name: "Symbol & Footprint Preparation",
    subtitle: "Library work — designer-owned",
    requiresApproval: false,
    isLockGate: false,
    displayOrder: 3,
    descriptionMarkdown: `**Owner:** Designer.

**Why this is a separate stage:** If symbols and footprints are created during schematic capture, the designer's flow is constantly broken by library work, and the temptation to grab footprints from the internet without verification becomes overwhelming. Doing all library work first means Stage 4 is pure schematic capture.

### Mandatory Sequence
1. **List every unique part needed** from the Stage 1 parts list. Two parts with the same package + value share a footprint; count once.
2. **For each part, check the Tryaksh-PCB-Library Git repo:**
   - If the symbol AND footprint already exist → use the library version. Do not duplicate.
   - If symbol exists but footprint does not → create the footprint, then add to library.
   - If neither exists → create both. Add to library. Commit to Git.
3. **Forbidden sources:** SnapEDA, UltraLibrarian, Octopart auto-generated parts, or any internet symbol without datasheet verification. These are starting points only — never trusted as-is.
4. **Datasheet on disk.** Every new library entry must have the source datasheet PDF saved to \`00_Project_Charter/Datasheets/\` with manufacturer name and datasheet revision in the filename.

**Reviewer:** CEO sign-off not required if all library entries were already pre-existing and reused. CEO sign-off required if more than 3 new library entries were created — to spot-check verification.`,
  },
  {
    stageNumber: "4",
    name: "Schematic Capture",
    subtitle: "Implement the block diagram",
    requiresApproval: false,
    isLockGate: false,
    displayOrder: 4,
    descriptionMarkdown: `**Owner:** Designer.

**Goal:** Produce a complete, clean schematic that faithfully implements the Stage 2 block diagram using the Stage 3 library.

### Schematic Standards
- **Hierarchical sheets, one function per sheet.** Suggested split: Power, MCU + Reset + Programming Header, Sensor Block 1 (SCL3300 + SPI), Sensor Block 2 (MLX90614 + I2C), Analog Chain (LS2-200MM + ADS1115), Encoder + Distance, Comms (JDY-33 BLE), User Interface (LCD + buttons + status LEDs), Connectors.
- **Power nets are labelled, not wired across sheets.** VCC_3V3, VCC_5V, VCC_BATT, GND. Every rail name appears in a global power port.
- **Decoupling capacitors next to the IC they decouple,** on the schematic. Not collected at the bottom of the sheet.
- **ESD protection on every off-board signal.** TVS, ferrite bead, or equivalent.
- **Test points:** Every power rail. MCU reset. Every critical bus (SPI clock, I2C SDA/SCL, ADC inputs). Labelled TP1, TP2, … with net name visible.
- **Annotation is mandatory before review:** No "R?" or "C?" allowed at Stage 5 review entry.
- **ERC must pass zero errors and zero warnings.** If a warning is legitimate (e.g., an intentional unconnected pin), it is documented in a schematic note explaining why — not silenced with a No-Connect flag.

### Daily Discipline During Stage 4
- Commit to Git at the end of each working day. Commit message: what was added/changed.
- Run ERC at the end of each working day. Do not let ERC errors accumulate.
- If a library issue is discovered (wrong pin number, wrong footprint pad), fix it in the Tryaksh library — not locally in the project. Commit the library fix. Then update the project.

### Exit Criteria
Stage 4 is complete (and Stage 5 can begin) when all blocks from Stage 2 are implemented, ERC passes zero/zero, title block is populated, and the schematic is exported as PDF and committed to \`02_Review/Schematic_Review_V0.1.pdf\`.`,
  },
  {
    stageNumber: "5",
    name: "Schematic Review #1",
    subtitle: "Refinements & upgrades — may loop",
    requiresApproval: true,
    isLockGate: false,
    displayOrder: 5,
    descriptionMarkdown: `**Owner:** CEO reviews. Designer iterates.

**Purpose:** This is the first time the CEO sees the actual implementation. The goal is not to find errors (Stage 4 ERC catches those) but to suggest refinements, identify upgrade opportunities, and verify the schematic matches the Stage 2 intent.

### What CEO Looks For
- **Faithfulness to the block diagram:** Does the schematic implement what Stage 2 specified? Anything added or removed?
- **Component value sanity:** Resistor pull-up values, capacitor types (X7R vs Y5V vs electrolytic), inductor saturation current, MOSFET ratings — do they match the use case?
- **Protection completeness:** Reverse polarity, over-voltage, ESD, in-rush — present where needed?
- **Upgrade opportunities:** Is there a higher-performance part the team should consider before lock? Now is the time.
- **Test access:** Are test points placed where field debugging will actually need them?
- **Programming and recovery:** Can the MCU be programmed and recovered without removing it from the board?

### Review Output
CEO produces a written change list with three classes per row: **Required** (must be implemented before Stage 6 lock) and **Suggestion** (discussed together; decide whether to incorporate now or defer).

### Iteration
**Stage 5 may iterate.** Designer implements the change list, commits the revised schematic as V0.2, V0.3, etc., and re-submits. CEO re-reviews. Loop until the change list has zero outstanding Required items.`,
  },
  {
    stageNumber: "6",
    name: "Schematic Lock",
    subtitle: "Comms, latency, power — the most consequential gate",
    requiresApproval: true,
    isLockGate: true,
    displayOrder: 6,
    descriptionMarkdown: `**Owner:** CEO.

**This is the most consequential gate in the entire workflow.**

Once the schematic is locked, it does not change. Any change after this point is a process failure that requires root-cause analysis, a written Schematic Re-Open Request, CEO approval, and re-validation through Stages 7 and 8 for the affected blocks. "Just a small fix" is not a valid reason. "It'll be easier to change in layout" is not a valid reason. **The discipline of refusing easy changes here is what protects board quality.**

### Pre-Lock Deep-Dive Assessment
Before signing the lock, the CEO performs a focused review of three areas — communications/latency, power blocks and rails, and block-level architecture. These are the areas where late changes hurt most, so they get explicit attention here. See checklist below for the specific verification criteria.

### The Lock Itself
1. **CEO signs the Schematic Lock Sheet.**
2. **Designer Git-tags the repo** \`v1.0-schematic-locked\` on the exact commit reviewed.
3. **Schematic PDF + KiCad files are copied** from \`02_Review/\` to \`03_Released/Schematic_V1.0/\`. The Released folder is treated as read-only by convention.
4. **Stage 7 can begin.**

### Schematic Re-Open Process (Exception Only)
If a change to the locked schematic is genuinely necessary (typically: a Stage 7 breadboard failure, a safety/regulatory issue, or a sourcing failure):
1. Designer files a Schematic Re-Open Request documenting what change is needed, what triggered it, and root-cause analysis of why it wasn't caught at Stage 5 or 6.
2. CEO reviews the root cause. If the root cause indicates a process weakness, the SOP itself is reviewed for amendment at the next quarterly review.
3. If approved, the schematic is updated, Stage 6 lock is performed again on the new revision (V2.0), and Stage 7 breadboard validation is re-run for any block affected by the change.
4. If not approved, the original locked schematic stands and the project proceeds with workarounds or accepted limitations.

**Re-opening is permitted; it is just not painless. The friction is intentional.**`,
  },
  {
    stageNumber: "7",
    name: "Priority Table + Breadboard Validation",
    subtitle: "Validate risky blocks on real hardware",
    requiresApproval: true,
    isLockGate: false,
    displayOrder: 7,
    descriptionMarkdown: `**Owner:** Designer (prepares and executes). CEO approves the priority table before breadboarding begins.

**Purpose:** Catch circuit-level issues that only manifest on real hardware — noise, ringing, sensor behavior under real conditions, interface quirks — before they get baked into copper. The cost of finding an issue here is a jumper wire. The cost of finding it after fabrication is a prototype run.

### What Must Be Breadboarded (Tryaksh Default)
- **Analog signal chain.** LS2-200MM resistive potentiometer → ADS1115 ADC → MCU. Noise floor, settling time, linearity, and any ground-loop sensitivity must be measured before the same chain is committed to PCB.
- **Each sensor interface.** SCL3300 over SPI, MLX90614 over I2C, optical encoder on a TIM2 channel. Verify register reads, sample rate, and unexpected behavior (e.g., I2C bus contention).
- **BLE module integration.** JDY-33 — pairing, throughput, range with an actual Android tablet. Antenna behavior changes wildly between breadboard and PCB, but the protocol-level behavior is what's being validated here.
- **Any new switching power topology.** TPS5430 or similar — output noise, transient response.

### What Can Be Skipped
- **Standard MCU peripherals** (STM32 + crystal + reset + programming header) — assumed proven by reference designs.
- **Standard user-interface blocks** (2004 LCD with HD44780, status LEDs, push buttons) — assumed proven.
- **Linear regulators** with reference application circuits and adequate decoupling.

"Skipped" means not separately breadboarded. These blocks still appear on the priority table for visibility, marked SKIP with rationale.

### The Priority Table
Designer prepares a priority table listing every functional block with columns: **Block**, **Risk**, **Priority** (P1 must / P2 if time permits / SKIP), **Test Method**, **Acceptance Criterion**.

**CEO must approve the priority table before breadboarding starts.** This is a real approval, not a rubber stamp. A wrong priority table means the wrong things get tested.

### Execution Rules
- **Build per the locked schematic.** Use the exact components specified in the parts list. Do not substitute for convenience; substitutions invalidate the test.
- **Power from a clean bench supply,** then re-test on the intended battery + regulator stack if power architecture is itself a P1 item.
- **Measure with the instrument the field will use.**
- **Log every test.** Date, conditions, equipment used, oscilloscope captures, raw data files. Saved to \`05_Test_Reports/Breadboard_V1.0/\`.
- **Fail loudly.** If a block fails its acceptance criterion, the test report says FAIL prominently. Don't hide a marginal result by re-defining "acceptable".`,
  },
  {
    stageNumber: "8",
    name: "Decision Gate",
    subtitle: "Proceed to layout, or re-open schematic",
    requiresApproval: true,
    isLockGate: true,
    displayOrder: 8,
    descriptionMarkdown: `**Owner:** CEO.

**Purpose:** Decide whether to proceed to layout, or to re-open the schematic.

### Decision Framework
| If breadboard result is... | Then... |
| --- | --- |
| All P1 blocks PASS, P2 blocks PASS or untested | **Proceed to Stage 9** (Layout). Outstanding P2 items become risks logged for prototype testing. |
| Any P1 block MARGINAL | **CEO judgment call.** Either: (a) accept marginal result with documented risk, or (b) re-open schematic for the affected block. Document the rationale either way. |
| Any P1 block FAIL | **Re-open schematic. Mandatory.** No proceeding to layout with a known P1 failure. Stage 7 re-runs for the affected block(s) on the revised schematic. |

### CEO Decision
☐ PROCEED TO LAYOUT  ☐ RE-OPEN SCHEMATIC (Re-Open Request attached)`,
  },
  {
    stageNumber: "9a",
    name: "Layout — Placement Review",
    subtitle: "Designer places, CEO reviews — no routing yet",
    requiresApproval: true,
    isLockGate: false,
    displayOrder: 9,
    descriptionMarkdown: `**Owner:** Designer prepares placement. CEO reviews. **No routing has started yet.**

**Purpose:** Catch placement-driven problems — mechanical interference, thermal grouping, signal-block separation, mounting hole position — before routing locks them in. Routing on top of bad placement wastes the most time of any rework in the workflow.

### Designer Prepares
1. Import the locked schematic netlist into the PCB.
2. Place every component but **do not route any net** (auto-routing remains forbidden per Engineering Standards).
3. Verify board outline against current mechanical understanding (enclosure dimensions, mounting hole positions). Pull the enclosure STEP into KiCad's 3D viewer if a STEP exists; otherwise sketch the constraints on paper.
4. Place mounting holes at their mechanically defined positions.
5. Group placement by function: power section together, sensor section together, MCU central, comms with antenna at board edge.
6. Place high-current loops tight (switching regulator input/output caps and inductor).
7. Separate noisy sections (switching power, BLE antenna) from quiet sections (ADC analog inputs, sensor SPI).
8. Generate a 3D view of the populated board (no traces yet) and a top-down placement PDF.
9. Save to \`02_Review/Layout_Placement_V0.1/\` and notify CEO.

### Outcome
☐ PLACEMENT APPROVED — proceed to routing   ☐ REVISE PLACEMENT

**If revisions required:** Designer revises placement. CEO re-reviews. Loop until approved. **Routing does not start until placement is signed.**`,
  },
  {
    stageNumber: "9b",
    name: "Layout — Routing & DFM Review",
    subtitle: "Designer routes, peer + CEO review",
    requiresApproval: true,
    isLockGate: false,
    displayOrder: 10,
    descriptionMarkdown: `**Owner:** Designer routes. Peer Reviewer + CEO review the finished layout.

**Vendor selection:** Designer proposes a vendor (JLCPCB / PCBWay / local Indian fab) by this stage. **CEO approves before manufacturing files are sent.**

### Routing Rules (Tryaksh Standard)
- **Auto-router forbidden.** Manual routing on sensitive nets; considered routing on the rest. No exceptions.
- **Power first, sensitive analog second, digital third.** Route in this order so power and analog get the best real estate.
- **SPI lines short and length-matched within ±5mm.** Ground guard adjacent on noisy systems.
- **Analog ADC paths** kept away from switching regulators, BLE antenna feed, and any digital high-speed line.
- **Switching converter loop tight:** ground return directly under the switching node. No signal traces under the switch node.
- **Trace widths sized per IPC-2152** with ≥30% margin. Calculator screenshot or table archived with the project.
- **Ground plane continuous on the dedicated ground layer** (L2 in a 4-layer stack). No accidental splits caused by vias or signal escapes.
- **Board edge clearance** ≥0.5mm from any copper feature.
- **Silkscreen complete and readable.** Every refdes visible. Polarity marks present. Board version, project code, and Tryaksh logo on silkscreen. **No "final" or "v2_fix" annotations.**

### On Release
Manufacturing files copied from \`02_Review/\` to \`03_Released/Layout_V1.0/\`. Released folder is read-only by convention. Git tag: \`v1.0-layout-released\`.`,
  },
];

export async function seedStages(workflowId: string) {
  logger.info("Seeding PCB workflow stages...", { workflowId });

  for (const stage of PCB_STAGES) {
    const [created] = await db
      .insert(workflowStages)
      .values({
        workflowId,
        ...stage,
      })
      .onConflictDoNothing()
      .returning();

    if (created) {
      logger.info(`  Stage ${stage.stageNumber}: ${stage.name}`, {
        id: created.id,
      });
    }
  }

  logger.info(`Seeded ${PCB_STAGES.length} stages.`);
}
