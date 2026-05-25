/**
 * Seed: Checklist Items
 *
 * Verbatim checklist items from Tryaksh PCB Design SOP v2.0
 * (TRYAKSH-SOP-PCB-001). Each item: bold label, full criterion text.
 */

import { db } from "../../src/db";
import { workflowStages, checklistItems } from "../../src/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "../../src/lib/logger";

interface ChecklistSeed {
  stageNumber: string;
  items: {
    sectionHeading?: string;
    label: string;
    criterion: string;
    displayOrder: number;
  }[];
}

const CHECKLIST_DATA: ChecklistSeed[] = [
  // ── Stage 1 — Parts Selection ─────────────────────────────────────
  {
    stageNumber: "1",
    items: [
      {
        sectionHeading: "Parts list completeness",
        label: "Every part has full traceability data",
        criterion:
          "Manufacturer name, manufacturer P/N, LCSC/Mouser/Digi-Key P/N, stock level on selection day, datasheet revision, unit cost at 100/1000/10000, and a one-line rationale recorded for every part.",
        displayOrder: 1,
      },
      {
        label: "Sourcing preference order respected",
        criterion:
          "Parts prefer (1) Approved Vendor List from Tryaksh-shipped designs, (2) LCSC parts with stock ≥ 1000, (3) Mouser/Digi-Key with lead time ≤ 8 weeks. Any deviation is documented.",
        displayOrder: 2,
      },
      {
        label: "DRTG sensor substitutions are ECN-tracked",
        criterion:
          "Pre-approved DRTG sensors (SCL3300, MLX90614, encoder, LS2-200MM, ADS1115, JDY-33, etc.) are used by name. Substitutions have an Engineering Change Notice attached.",
        displayOrder: 3,
      },
      {
        label: "Parts list committed to project folder",
        criterion:
          "Parts list saved to 00_Project_Charter/Parts_List_V1.0.xlsx and committed to version control.",
        displayOrder: 4,
      },
    ],
  },

  // ── Stage 2 — Block Diagram ──────────────────────────────────────
  {
    stageNumber: "2",
    items: [
      {
        sectionHeading: "Block diagram acceptance criteria (CEO review)",
        label: "All parts from Stage 1 are represented",
        criterion:
          "Every part in the approved parts list appears somewhere in the block diagram. Nothing extra — if a part doesn't appear, it shouldn't have been selected.",
        displayOrder: 1,
      },
      {
        label: "Power budget closed",
        criterion:
          "Sum of estimated currents fits within the battery + regulator capacity with ≥30% margin.",
        displayOrder: 2,
      },
      {
        label: "Communication paths labeled",
        criterion:
          "Every inter-block link names its protocol and data rate. No unlabeled arrows.",
        displayOrder: 3,
      },
      {
        label: "Latency-critical paths flagged",
        criterion:
          "Any path with a real-time constraint (sensor sampling, encoder count, BLE response) is marked with its latency budget.",
        displayOrder: 4,
      },
      {
        label: "Off-board signals identified",
        criterion:
          "Every signal that leaves the PCB is shown and flagged for ESD protection.",
        displayOrder: 5,
      },
      {
        label: "Mechanical interfaces sketched",
        criterion:
          "Connector positions, mounting holes, display window, antenna location annotated as a rough placement sketch on or alongside the block diagram.",
        displayOrder: 6,
      },
    ],
  },

  // ── Stage 3 — Symbol & Footprint Preparation ─────────────────────
  {
    stageNumber: "3",
    items: [
      {
        sectionHeading: "Library entry verification (per new part)",
        label: "Symbol pin numbering matches datasheet",
        criterion:
          "Every pin verified, not just power and ground. Mismatch here is the most expensive bug to find later.",
        displayOrder: 1,
      },
      {
        label: "Symbol pin function/type correct",
        criterion:
          "Input/output/bidirectional/power/passive set correctly — this is what ERC checks against.",
        displayOrder: 2,
      },
      {
        label: "Footprint pad dimensions match datasheet",
        criterion:
          "Pad width, length, pitch verified against the datasheet's mechanical drawing. Don't trust a footprint that 'looks right'.",
        displayOrder: 3,
      },
      {
        label: "Courtyard sized for assembly",
        criterion:
          "Component body + pick-and-place machine clearance. Default IPC-7351 Nominal density unless space-constrained.",
        displayOrder: 4,
      },
      {
        label: "3D model attached (if available from manufacturer)",
        criterion:
          "Used at Stage 9a placement review to check mechanical clearances. Optional for resistors/capacitors, required for connectors and large ICs.",
        displayOrder: 5,
      },
      {
        label: "Library entry committed to Tryaksh-PCB-Library Git repo",
        criterion:
          "Commit message includes manufacturer P/N and datasheet revision. Not used from a local-only copy.",
        displayOrder: 6,
      },
    ],
  },

  // ── Stage 4 — Schematic Capture ──────────────────────────────────
  {
    stageNumber: "4",
    items: [
      {
        sectionHeading: "Stage 4 exit criteria",
        label: "All Stage 2 blocks implemented",
        criterion:
          "All blocks from the Stage 2 block diagram are implemented in the schematic.",
        displayOrder: 1,
      },
      {
        label: "ERC passes zero/zero",
        criterion:
          "ERC passes zero errors AND zero warnings. Legitimate warnings have a documented schematic note explaining why — not silenced with a No-Connect flag.",
        displayOrder: 2,
      },
      {
        label: "Title block fully populated",
        criterion:
          "Project, Part Number, Revision, Designer, Design Class all set in the title block.",
        displayOrder: 3,
      },
      {
        label: "Schematic exported as PDF and committed",
        criterion:
          "Schematic exported as PDF and committed to 02_Review/Schematic_Review_V0.1.pdf along with the source files.",
        displayOrder: 4,
      },
      {
        label: "CEO notified that schematic is ready for review",
        criterion: "Designer has notified CEO that the schematic is ready for Stage 5 review.",
        displayOrder: 5,
      },
    ],
  },

  // ── Stage 5 — Schematic Review #1 ────────────────────────────────
  {
    stageNumber: "5",
    items: [
      {
        sectionHeading: "Iteration close-out",
        label: "Change list has zero outstanding Required items",
        criterion:
          "All Required items from the CEO change list are implemented in the latest schematic revision. Suggestion items have a documented decision (incorporated now or deferred).",
        displayOrder: 1,
      },
      {
        label: "Revised schematic committed",
        criterion:
          "Revised schematic committed as V0.2/V0.3/etc. with a commit message describing the changes.",
        displayOrder: 2,
      },
      {
        label: "CEO re-review complete on the latest revision",
        criterion:
          "CEO has reviewed the latest revision and confirmed all Required items are addressed.",
        displayOrder: 3,
      },
    ],
  },

  // ── Stage 6 — Schematic Lock ─────────────────────────────────────
  {
    stageNumber: "6",
    items: [
      {
        sectionHeading: "8.1.1 Communication lines and latency",
        label: "Every comm path has explicit data rate",
        criterion:
          "SPI clock for SCL3300, I2C bus rate, UART baud, BLE characteristic update rate — all named, all sized against MCU capability.",
        displayOrder: 1,
      },
      {
        label: "Latency budget closed",
        criterion:
          "For real-time paths (encoder count → distance, cant reading → display refresh), the worst-case latency through the chain is calculated and within product spec.",
        displayOrder: 2,
      },
      {
        label: "Bus loading checked",
        criterion:
          "I2C pull-ups sized for the bus capacitance. SPI line lengths within the IC's setup/hold tolerance.",
        displayOrder: 3,
      },
      {
        label: "Inter-block timing dependencies named",
        criterion:
          "Where one block must read before another writes (or sample synchronously), that dependency is documented.",
        displayOrder: 4,
      },
      {
        label: "BLE link budget reasonable",
        criterion:
          "Antenna placement plan, expected range against an Android tablet in railside conditions.",
        displayOrder: 5,
      },

      {
        sectionHeading: "8.1.2 Power blocks and rails",
        label: "Every rail's source is identified",
        criterion:
          "Each rail traces back to either the battery, a regulator, or a dedicated reference. No floating power.",
        displayOrder: 6,
      },
      {
        label: "Each rail's load is summed",
        criterion:
          "Worst-case current per rail calculated. Regulator chosen has ≥30% headroom above worst-case.",
        displayOrder: 7,
      },
      {
        label: "Sequencing requirements documented",
        criterion:
          "If any IC requires a power-up sequence (analog before digital, or with specific delay), the schematic enforces it (e.g., enable line, RC delay, supervisor IC).",
        displayOrder: 8,
      },
      {
        label: "Decoupling complete",
        criterion:
          "Every IC has datasheet-recommended decoupling next to it. Bulk caps on each rail near the regulator.",
        displayOrder: 9,
      },
      {
        label: "Quiescent / sleep current understood",
        criterion:
          "If the product needs long battery life, sleep-mode current is calculated. Bleed paths identified.",
        displayOrder: 10,
      },
      {
        label: "Thermal screening",
        criterion:
          "Worst-case power dissipation per regulator, per high-current IC. Junction temperature estimated. Margin documented.",
        displayOrder: 11,
      },

      {
        sectionHeading: "8.1.3 Block-level architecture",
        label: "Every Stage 5 Required change is implemented",
        criterion:
          "Verified line-by-line against the Stage 5 change list.",
        displayOrder: 12,
      },
      {
        label: "ERC passes zero/zero",
        criterion: "Re-run on the final pre-lock revision.",
        displayOrder: 13,
      },
      {
        label: "BOM is sourceable today",
        criterion:
          "Every part still available at LCSC/Mouser/Digi-Key on the day of lock. No vapourware.",
        displayOrder: 14,
      },
      {
        label: "Schematic exported and archived",
        criterion:
          "PDF + KiCad source files committed to 03_Released/Schematic_V1.0/. Git tag v1.0-schematic-locked applied on the exact commit reviewed.",
        displayOrder: 15,
      },
    ],
  },

  // ── Stage 7 — Priority Table + Breadboard Validation ─────────────
  {
    stageNumber: "7",
    items: [
      {
        sectionHeading: "Priority table preparation",
        label: "Priority table covers every functional block",
        criterion:
          "Every functional block from the schematic appears with columns: Block, Risk, Priority (P1/P2/SKIP), Test Method, Acceptance Criterion. SKIP entries have rationale.",
        displayOrder: 1,
      },
      {
        label: "CEO approved priority table BEFORE breadboarding started",
        criterion:
          "CEO has signed off on the priority table before any breadboard work began. This is a real approval, not a rubber stamp.",
        displayOrder: 2,
      },

      {
        sectionHeading: "Breadboard execution",
        label: "Built per the locked schematic, no substitutions",
        criterion:
          "Used the exact components specified in the parts list. No 'similar' parts swapped in for convenience.",
        displayOrder: 3,
      },
      {
        label: "Measured with the instrument the field will use",
        criterion:
          "If the production board uses an MCU to read the sensor, the breadboard test also uses an MCU — not a vendor demo board.",
        displayOrder: 4,
      },
      {
        label: "Test logs and raw data archived",
        criterion:
          "Every test: date, conditions, equipment, oscilloscope captures, raw data files saved to 05_Test_Reports/Breadboard_V1.0/.",
        displayOrder: 5,
      },

      {
        sectionHeading: "Breadboard validation report",
        label: "Report contains every P1 block",
        criterion:
          "Per P1 block: test setup description (with photos), test conditions, acceptance criterion vs measured result, Pass/Fail/Marginal classification, and a recommendation (proceed / re-open schematic / change component / change topology).",
        displayOrder: 6,
      },
      {
        label: "Fail loudly — marginal results not redefined",
        criterion:
          "Failed blocks say FAIL prominently in the report. No re-defining of 'acceptable' to hide a marginal result.",
        displayOrder: 7,
      },
    ],
  },

  // ── Stage 8 — Decision Gate ──────────────────────────────────────
  {
    stageNumber: "8",
    items: [
      {
        sectionHeading: "Pre-decision",
        label: "All P1 block results classified PASS / MARGINAL / FAIL",
        criterion:
          "Every P1 block has an explicit classification recorded in the breadboard validation report.",
        displayOrder: 1,
      },
      {
        label: "Outstanding P2 risks logged",
        criterion:
          "Any P2 items not breadboarded are logged as risks to be re-verified at prototype testing (Stage 10).",
        displayOrder: 2,
      },
      {
        sectionHeading: "Decision",
        label: "Decision is explicit: PROCEED or RE-OPEN",
        criterion:
          "CEO has selected PROCEED TO LAYOUT or RE-OPEN SCHEMATIC. The rationale is documented either way. No P1 FAIL may proceed; any MARGINAL has documented acceptance or re-open.",
        displayOrder: 3,
      },
    ],
  },

  // ── Stage 9a — Layout: Placement Review ──────────────────────────
  {
    stageNumber: "9a",
    items: [
      {
        sectionHeading: "Placement review (CEO)",
        label: "Board outline matches mechanical envelope",
        criterion:
          "Outline confirmed against enclosure dimensions. Mounting holes at the right positions.",
        displayOrder: 1,
      },
      {
        label: "Mounting holes have correct keep-out",
        criterion:
          "≥3mm radius copper keep-out around each mounting hole on every layer.",
        displayOrder: 2,
      },
      {
        label: "Mechanical mounting reviewed by CEO",
        criterion:
          "CEO has personally eyeballed how the board sits in the enclosure. Connector positions face the right way. Display window aligns. Cable routing is feasible.",
        displayOrder: 3,
      },
      {
        label: "Functional grouping sensible",
        criterion:
          "Power, MCU, sensor, comms blocks placed in logical groups, not scattered.",
        displayOrder: 4,
      },
      {
        label: "High-current loops tight",
        criterion:
          "Switching regulator: input cap, IC, inductor, output cap all close together. No long traces in the high-current path.",
        displayOrder: 5,
      },
      {
        label: "Analog and switching separated",
        criterion:
          "ADC analog inputs and the LS2-200MM signal path are away from the switching converter.",
        displayOrder: 6,
      },
      {
        label: "Antenna placement appropriate",
        criterion:
          "BLE antenna (or module) at the board edge, with the manufacturer-specified keep-out (no copper of any layer in the keep-out).",
        displayOrder: 7,
      },
      {
        label: "Connector positions match mechanical",
        criterion:
          "Power, sensor cable, programming header — all in positions that match the enclosure cutouts and cable routing.",
        displayOrder: 8,
      },
      {
        label: "Component clearances for assembly",
        criterion:
          "Tall components don't shadow other tall components. Pick-and-place head can access every part.",
        displayOrder: 9,
      },
      {
        label: "3D view sanity check",
        criterion:
          "Rendered 3D view of placed (un-routed) board reviewed. Nothing looks obviously wrong.",
        displayOrder: 10,
      },
    ],
  },

  // ── Stage 9b — Layout: Routing & DFM Review ──────────────────────
  {
    stageNumber: "9b",
    items: [
      {
        sectionHeading: "12.2 Layout final review",
        label: "DRC passes zero violations",
        criterion:
          "Against the JLCPCB rule template (or chosen vendor's rules).",
        displayOrder: 1,
      },
      {
        label: "All nets routed",
        criterion: "Zero unrouted nets. Zero stubs. Zero dangling vias.",
        displayOrder: 2,
      },
      {
        label: "Routing rules followed",
        criterion:
          "Per Section 12.1 — auto-router not used; power/analog/digital routed in order; SPI length-matched ±5mm; analog separated from switching/BLE; switching converter loop tight; trace widths per IPC-2152 with ≥30% margin; ground plane continuous; ≥0.5mm board edge clearance.",
        displayOrder: 3,
      },
      {
        label: "Ground plane integrity verified",
        criterion:
          "Continuous ground plane verified by visual inspection. No isolated copper islands.",
        displayOrder: 4,
      },
      {
        label: "Antenna keep-out verified",
        criterion:
          "BLE antenna keep-out on every layer per the module datasheet. No copper of any layer in the keep-out.",
        displayOrder: 5,
      },
      {
        label: "Mechanical alignment confirmed",
        criterion:
          "Board outline, mounting holes, and connector positions matched against mechanical model again. Nothing has drifted since Stage 9a.",
        displayOrder: 6,
      },
      {
        label: "Silkscreen complete",
        criterion:
          "Refdes, polarity, version, project code, logo all present. Readable orientation. No 'final' or 'v2_fix' annotations.",
        displayOrder: 7,
      },
      {
        label: "Fiducials placed",
        criterion:
          "If any SMD assembly is planned: three fiducials on the board (or panel).",
        displayOrder: 8,
      },
      {
        label: "3D view matches mechanical model",
        criterion:
          "Final rendered 3D view (with traces and components) overlaid against the enclosure. No clashes.",
        displayOrder: 9,
      },

      {
        sectionHeading: "12.3 Manufacturing file generation",
        label: "Gerbers generated per vendor spec",
        criterion:
          "RS-274X. Layer set matches vendor's required file list. Filenames follow vendor convention.",
        displayOrder: 10,
      },
      {
        label: "Drill files generated",
        criterion: "Excellon. PTH and NPTH separate if vendor requires.",
        displayOrder: 11,
      },
      {
        label: "Pick-and-place file generated",
        criterion:
          "CSV. Centroid offsets verified per vendor (JLCPCB-specific verification mandatory if using JLCPCB assembly).",
        displayOrder: 12,
      },
      {
        label: "BOM exported in vendor format",
        criterion:
          "JLCPCB-format if using JLCPCB assembly, with LCSC P/Ns. Otherwise Tryaksh standard BOM.",
        displayOrder: 13,
      },
      {
        label: "Files reviewed in vendor's online viewer",
        criterion:
          "JLCPCB Gerber Viewer or equivalent. Every layer visually inspected. Drill alignment confirmed.",
        displayOrder: 14,
      },
      {
        label: "InteractiveHtmlBom generated",
        criterion: "For assembly verification at prototype testing.",
        displayOrder: 15,
      },

      {
        sectionHeading: "12.4 Vendor confirmation",
        label: "Vendor proposed by Designer",
        criterion:
          "Designer documents: which vendor, why this vendor, quoted unit price, lead time.",
        displayOrder: 16,
      },
      {
        label: "CEO approves vendor selection",
        criterion:
          "Before files are sent. CEO sign-off on vendor recorded with the quote.",
        displayOrder: 17,
      },
      {
        label: "Vendor written quote received",
        criterion:
          "Saved to 04_Manufacturing/. Includes unit price, NRE, lead time, finish (HASL/ENIG), stack-up.",
        displayOrder: 18,
      },
      {
        label: "Vendor capability confirmation",
        criterion:
          "Vendor confirms in writing that stack-up, trace widths, drill sizes, and finish are within standard process. Any non-standard items separately quoted.",
        displayOrder: 19,
      },
      {
        label: "Lead time fits project schedule",
        criterion:
          "Quoted lead time + shipping buffer fits the prototype-test target date.",
        displayOrder: 20,
      },
    ],
  },
];

export async function seedChecklistItems(workflowId: string) {
  logger.info("Seeding checklist items...");

  const stages = await db
    .select()
    .from(workflowStages)
    .where(eq(workflowStages.workflowId, workflowId));

  const stageMap = new Map(stages.map((s) => [s.stageNumber, s.id]));

  let totalItems = 0;

  for (const checklist of CHECKLIST_DATA) {
    const stageId = stageMap.get(checklist.stageNumber);
    if (!stageId) {
      logger.warn(`Stage ${checklist.stageNumber} not found, skipping.`);
      continue;
    }

    for (const item of checklist.items) {
      await db
        .insert(checklistItems)
        .values({
          stageId,
          sectionHeading: item.sectionHeading ?? null,
          label: item.label,
          criterion: item.criterion,
          displayOrder: item.displayOrder,
        })
        .onConflictDoNothing();

      totalItems++;
    }
  }

  logger.info(
    `Seeded ${totalItems} checklist items across ${CHECKLIST_DATA.length} stages.`
  );
}
