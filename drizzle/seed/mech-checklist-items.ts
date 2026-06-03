/**
 * Seed: Mechanical Checklist Items
 *
 * Verbatim checklist items from Tryaksh Mechanical Design SOP v2.0
 * (TRYAKSH-SOP-MECH-001 v2.0).
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

const MECH_CHECKLIST: ChecklistSeed[] = [
  // ── Stage 1 — Concept and Material Discussion ────────────────────
  {
    stageNumber: "1",
    items: [
      {
        sectionHeading: "4.2 Stage 1 checklist",
        label: "Purpose documented",
        criterion:
          "Functional and dimensional requirements written with measurable acceptance criteria. Tied to product specification.",
        displayOrder: 1,
      },
      {
        label: "Design Class confirmed",
        criterion: "Class A/B/C set. Matches the criticality of the part.",
        displayOrder: 2,
      },
      {
        label: "Scope confirmed",
        criterion:
          "Part / Subassembly / Assembly noted. Drives whether Assembly Gate applies.",
        displayOrder: 3,
      },
      {
        label: "Material selected from AML",
        criterion:
          "Material from the Approved Materials List in Engineering Standards. Exceptions require written CEO approval before Stage 2.",
        displayOrder: 4,
      },
      {
        label: "Manufacturing process chosen",
        criterion:
          "CNC / sheet metal / 3D print / mixed. Cost order-of-magnitude estimated.",
        displayOrder: 5,
      },
      {
        label: "Load cases identified",
        criterion:
          "Static, dynamic, thermal, impact — applicable categories named with rough magnitudes.",
        displayOrder: 6,
      },
      {
        label: "FEA requirement flagged",
        criterion:
          "Designer + CEO have explicitly decided: FEA required at Stage 6, or not required. Recorded in brief. Once flagged, cannot be skipped.",
        displayOrder: 7,
      },
      {
        label: "3D-print mockup flagged",
        criterion:
          "Required if part has designed degree of freedom or ergonomic surface. Decision recorded.",
        displayOrder: 8,
      },
      {
        label: "Top three risks named",
        criterion:
          "With mitigation plan. Will be tracked through to Stage 11.",
        displayOrder: 9,
      },
      {
        label: "Envelope and mating interfaces confirmed",
        criterion:
          "External envelope agreed with adjacent assemblies (PCB, sensors, other parts). Mating faces and mounting points identified.",
        displayOrder: 10,
      },
    ],
  },

  // ── Stage 2 — Datum Scheme and Interface Lock ────────────────────
  {
    stageNumber: "2",
    items: [
      {
        sectionHeading: "5.2 Datum scheme checklist",
        label: "Datum reference frame defined",
        criterion:
          "A, B, C datums chosen with rationale. Documented in a sketch or written description.",
        displayOrder: 1,
      },
      {
        label: "Symmetry requirements explicit",
        criterion:
          "Where mirror symmetry applies, the tolerance for symmetry is stated (e.g., rail contacts within 0.05mm of the centerline plane).",
        displayOrder: 2,
      },
      {
        label: "Mating interfaces specified",
        criterion:
          "Every mating face listed with datum reference, fit class, surface finish, fastener pattern.",
        displayOrder: 3,
      },
      {
        label: "Tolerance budget allocated (rough)",
        criterion:
          "For each measurement-critical dimension chain, worst-case budget estimated and allocated across the parts in the chain.",
        displayOrder: 4,
      },
      {
        label: "Stack-up direction reviewed",
        criterion:
          "The direction along which tolerances accumulate is identified. Worst-case chain length checked against measurement accuracy requirements from Stage 1.",
        displayOrder: 5,
      },
      {
        label: "Datum scheme reviewed against past failures",
        criterion:
          "Asymmetric datum issue from prior prototypes specifically checked. Datums are symmetric about the gauge centerline where applicable.",
        displayOrder: 6,
      },
    ],
  },

  // ── Stage 3 — CAD Modeling (no formal checklist; modeling standards) ─
  {
    stageNumber: "3",
    items: [
      {
        sectionHeading: "6.1 Modeling standards (self-check before exit)",
        label: "Project lives in Tryaksh Fusion Hub",
        criterion:
          "No personal Fusion accounts. Folder structure per Engineering Standards.",
        displayOrder: 1,
      },
      {
        label: "Parametric model with named parameters",
        criterion:
          "Critical dimensions driven by named parameters in File → Change Parameters. No hard-coded numbers for measurement-critical dimensions.",
        displayOrder: 2,
      },
      {
        label: "Model built on Stage 2 datum scheme",
        criterion:
          "Datum planes set up first, before any feature is created. Match the locked Stage 2 scheme.",
        displayOrder: 3,
      },
      {
        label: "Sub-document workflow followed",
        criterion:
          "Sub-documents opened standalone, edited, saved. Parent re-opened to verify. No in-context editing for Class A/B work.",
        displayOrder: 4,
      },
      {
        label: "Daily version save committed",
        criterion:
          "End-of-day version marker. Weekly export to Drive 01_WIP as backup.",
        displayOrder: 5,
      },
      {
        label: "Mass and CG tracked from start",
        criterion:
          "Mass appears in the title block as the model grows. No surprises at Stage 5.",
        displayOrder: 6,
      },
    ],
  },

  // ── Stage 4 — Mid-Model Review ───────────────────────────────────
  {
    stageNumber: "4",
    items: [
      {
        sectionHeading: "7.1 CEO mid-model review",
        label: "Faithful to Stage 1 concept brief",
        criterion:
          "Still the part we agreed to design. No silent scope creep or material drift.",
        displayOrder: 1,
      },
      {
        label: "Faithful to Stage 2 datum scheme",
        criterion: "Datums in the model match the locked scheme exactly.",
        displayOrder: 2,
      },
      {
        label: "Manufacturability shape on track",
        criterion:
          "Wall thicknesses, radii, hole locations on track for the chosen process.",
        displayOrder: 3,
      },
      {
        label: "Mass and envelope within budget",
        criterion:
          "Model mass vs Stage 1 mass budget — discrepancy ≤15% or explained.",
        displayOrder: 4,
      },
      {
        label: "Open issues raised explicitly",
        criterion:
          "Any decision the designer is unsure about is discussed; CEO gives input.",
        displayOrder: 5,
      },
      {
        label: "Feedback note written and classified",
        criterion:
          "Items classified Required / Suggested / Informational. Required items must be done before Stage 6 begins.",
        displayOrder: 6,
      },
    ],
  },

  // ── Stage 5 — Design Refinement ──────────────────────────────────
  {
    stageNumber: "5",
    items: [
      {
        sectionHeading: "8.1 Refinement outputs",
        label: "All Stage 4 Required items implemented",
        criterion: "Verified against the feedback notes line by line.",
        displayOrder: 1,
      },
      {
        label: "Detail features complete",
        criterion:
          "No feature has 'To do' or 'Placeholder' status. Fillets, chamfers, holes, drafts, threads done.",
        displayOrder: 2,
      },
      {
        label: "Fusion timeline clean",
        criterion:
          "Zero errors, zero warnings, no suppressed features without documented reason.",
        displayOrder: 3,
      },
      {
        label: "Mass and CG within ±15% of Stage 1 budget",
        criterion: "Recorded in title block. Discrepancies explained.",
        displayOrder: 4,
      },
      {
        label: "Interference analysis run (if assembly)",
        criterion:
          "Zero unintentional interferences. Intentional press-fits documented.",
        displayOrder: 5,
      },
      {
        label: "Datums verified against Stage 2 lock",
        criterion:
          "Sensor and mating-part datums have not drifted during modeling.",
        displayOrder: 6,
      },
    ],
  },

  // ── Stage 6 — Tolerance Stack-up and FEA ─────────────────────────
  {
    stageNumber: "6",
    items: [
      {
        sectionHeading: "9.1 Tolerance stack-up",
        label: "Worst-case stack-up calculated",
        criterion:
          "Sum of all tolerances along each measurement-critical dimension chain. Worksheet archived with the project.",
        displayOrder: 1,
      },
      {
        label: "Statistical RSS stack-up calculated",
        criterion:
          "Same chains, root-sum-square method. Reported alongside worst-case.",
        displayOrder: 2,
      },
      {
        label: "Stack-up fits within measurement accuracy budget",
        criterion:
          "Worst-case stack-up is ≤ the measurement accuracy required by the product specification. If not, the design is rejected — the chain must be redesigned, not the tolerance loosened.",
        displayOrder: 3,
      },
      {
        label: "Datum scheme reviewed against stack-up",
        criterion:
          "Datums chosen at Stage 2 are confirmed to minimise the critical stack-up. If a different scheme would help, this triggers a datum re-open (rare).",
        displayOrder: 4,
      },

      {
        sectionHeading: "9.2 FEA hygiene (if FEA flagged at Stage 1)",
        label: "Load cases representative of real use",
        criterion:
          "Static load, dynamic rail impact, drop from working height, transport vibration, thermal expansion. Magnitudes from real DRTG operating conditions, not guessed.",
        displayOrder: 5,
      },
      {
        label: "Contacts correctly defined",
        criterion:
          "Bonded contacts only where parts are truly fixed (welded, single-body). Telescoping interfaces, threaded joints, pinned joints use Separation or Frictional — never bonded.",
        displayOrder: 6,
      },
      {
        label: "Boundary conditions match reality",
        criterion:
          "Constraints reflect how the part is actually held during use. No 'fix everything' shortcuts.",
        displayOrder: 7,
      },
      {
        label: "Material properties match AML selection exactly",
        criterion:
          "Al 6061-T6 with vendor-typical properties, not generic 'Aluminum'.",
        displayOrder: 8,
      },
      {
        label: "Mesh convergence verified",
        criterion:
          "Two mesh refinement levels run. Stress at critical locations agrees within 5%. Coarse-mesh-only result is not acceptable.",
        displayOrder: 9,
      },
      {
        label: "Brittle vs ductile failure mode addressed",
        criterion:
          "If the chosen material has brittle behaviour under any load case (impact, cold), FEA includes that mode.",
        displayOrder: 10,
      },
      {
        label: "Safety factor documented",
        criterion:
          "Minimum 2.0 against yield for static, 3.0 against ultimate for impact. Calculated per critical location.",
        displayOrder: 11,
      },
      {
        label: "Modal analysis run for vibration-prone parts",
        criterion:
          "Natural frequencies checked. None close to expected operating excitation frequencies.",
        displayOrder: 12,
      },
    ],
  },

  // ── Stage 7 — DFM Review ─────────────────────────────────────────
  {
    stageNumber: "7",
    items: [
      {
        sectionHeading: "10.1 CAD hygiene",
        label: "Parametric model with named parameters",
        criterion: "Critical dimensions driven by named parameters.",
        displayOrder: 1,
      },
      {
        label: "No errors or warnings in the Fusion timeline",
        criterion: "Suppressed features documented with reason.",
        displayOrder: 2,
      },
      {
        label: "Sub-documents propagated correctly",
        criterion:
          "Every sub-document opened standalone and saved. Parent reflects latest state.",
        displayOrder: 3,
      },
      {
        label: "Mass and CG calculated",
        criterion:
          "Compared against Stage 1 budget. Discrepancy ≤15% or explained.",
        displayOrder: 4,
      },
      {
        label: "Interferences checked (if assembly)",
        criterion:
          "Zero unintentional interferences. Intentional press-fits documented.",
        displayOrder: 5,
      },
      {
        label: "Datums verified against Stage 2 lock",
        criterion:
          "Datums in the released model match the locked datum scheme. No drift.",
        displayOrder: 6,
      },

      {
        sectionHeading: "10.2 Geometric manufacturability",
        label: "Wall thickness ≥ minimum for material and process",
        criterion:
          "Al 6061 structural: 6.0mm. Non-structural: 3.0mm. Sheet metal: per material thickness. FDM: 1.6mm minimum, 30% infill for any load. Walls below minimum need explicit Stage 6 FEA justification.",
        displayOrder: 7,
      },
      {
        label: "Datum symmetry verified",
        criterion:
          "For DRTG rail-contact parts: left and right contacts share Z and Y coordinates within 0.05mm. Measured in Fusion against the symmetry plane.",
        displayOrder: 8,
      },
      {
        label: "Tapped holes have sufficient thread depth",
        criterion:
          "≥2× thread diameter general, 3× for high-cycle or high-load.",
        displayOrder: 9,
      },
      {
        label: "Internal corner radii ≥3.0mm (CNC)",
        criterion: "Or tool diameter explicitly called out on the drawing.",
        displayOrder: 10,
      },
      {
        label: "Draft and undercut review",
        criterion:
          "All faces have appropriate draft for the process. No locked undercuts unless intentionally manufactured with side actions.",
        displayOrder: 11,
      },
      {
        label: "Process-specific DFM rules applied",
        criterion:
          "CNC / sheet metal / 3D print rules from §15 applied to this part.",
        displayOrder: 12,
      },

      {
        sectionHeading: "10.3 Drawing and BOM",
        label: "2D drawing complete as PDF",
        criterion:
          "Title block populated: Project, Part Number, Revision, Material, Mass, Surface Finish, Tolerance standard (ISO GPS default), Designer, Reviewer, Approver.",
        displayOrder: 13,
      },
      {
        label: "All critical dimensions and GD&T present",
        criterion:
          "GD&T frames called out where required. Datum reference letters match the Stage 2 lock.",
        displayOrder: 14,
      },
      {
        label: "Surface finish (Ra) called out where it matters",
        criterion:
          "Rail-contact surfaces, sealing surfaces, sliding fits. Default Ra in title block.",
        displayOrder: 15,
      },
      {
        label: "STEP AP214 exported",
        criterion:
          "Opened in a viewer to confirm it is the same model as in Fusion. No missing bodies, no broken assemblies.",
        displayOrder: 16,
      },
      {
        label: "Drawing PDF and STEP have matching revision",
        criterion: "Same V-number. No 'final' or 'v2_fix' annotations.",
        displayOrder: 17,
      },
      {
        label: "BOM exported",
        criterion:
          "Tryaksh standard BOM template. Every part has manufacturer P/N or drawing reference.",
        displayOrder: 18,
      },
    ],
  },

  // ── Stage 8 — 3D-Print Mockup ────────────────────────────────────
  {
    stageNumber: "8",
    items: [
      {
        sectionHeading: "11.2 Mockup standards",
        label: "Material appropriate for test type",
        criterion:
          "PETG, ABS, or ASA for parts that will be physically tested. PLA only for Class C internal-only mockups.",
        displayOrder: 1,
      },
      {
        label: "Print at production-intent tolerances",
        criterion:
          "Not aggressive infill/wall settings that disguise the eventual fit.",
        displayOrder: 2,
      },
      {
        label: "Mating parts printed together (if shared DOF)",
        criterion: "A hinge cannot be validated with one half printed.",
        displayOrder: 3,
      },
      {
        label: "DOF tested under realistic conditions",
        criterion:
          "Hand pressure, expected travel range, expected number of cycles.",
        displayOrder: 4,
      },
      {
        label: "Mockup test report attached",
        criterion:
          "One-page report with photos. Outcome classified Pass / Marginal / Fail with action.",
        displayOrder: 5,
      },
    ],
  },

  // ── Stage 9 — Drawing Release and Vendor Selection ───────────────
  {
    stageNumber: "9",
    items: [
      {
        sectionHeading: "12.2 Stage 9 checklist",
        label: "Drawing PDF complete",
        criterion:
          "All Stage 7 DFM checklist items satisfied. Title block populated. GD&T present.",
        displayOrder: 1,
      },
      {
        label: "STEP file verified",
        criterion: "Opened in a viewer. Same model as Fusion. No missing bodies.",
        displayOrder: 2,
      },
      {
        label: "BOM exported",
        criterion: "Every part has manufacturer P/N or drawing reference.",
        displayOrder: 3,
      },
      {
        label: "Vendor proposed by Designer",
        criterion:
          "Which vendor, why this vendor, quoted price, lead time, finish capability.",
        displayOrder: 4,
      },
      {
        label: "Vendor capability confirmed in writing",
        criterion:
          "Vendor confirms they can hold the specified GD&T and surface finish. Email is acceptable, verbal is not.",
        displayOrder: 5,
      },
      {
        label: "Material certification commitment",
        criterion:
          "Vendor commits to material certificate for actual stock used.",
        displayOrder: 6,
      },
      {
        label: "Inspection plan agreed with vendor",
        criterion:
          "Critical dimensions and inspection format agreed in writing.",
        displayOrder: 7,
      },
      {
        label: "Lead time fits project schedule",
        criterion:
          "Quoted lead time + shipping buffer fits the target prototype date.",
        displayOrder: 8,
      },
      {
        label: "CEO approves vendor",
        criterion: "Before files are sent. CEO sign-off recorded with the quote.",
        displayOrder: 9,
      },
    ],
  },

  // ── Stage 10 — First-Article Inspection ──────────────────────────
  {
    stageNumber: "10",
    items: [
      {
        sectionHeading: "13.1 First-article receiving",
        label: "Visual inspection passed",
        criterion:
          "No surface defects, no obvious machining errors, no transit damage. Photographed and logged.",
        displayOrder: 1,
      },
      {
        label: "Vendor inspection report received",
        criterion:
          "Vendor's CMM or equivalent report attached. Critical dimensions confirmed by vendor.",
        displayOrder: 2,
      },
      {
        label: "Material certificate received",
        criterion:
          "Material certificate for the lot used. Matches AML specification (e.g., Al 6061-T6 confirmed).",
        displayOrder: 3,
      },
      {
        label: "Independent dimensional check (Tryaksh side)",
        criterion:
          "Critical dimensions re-measured by Tryaksh using calipers, micrometers, height gauge, or CMM. Results logged.",
        displayOrder: 4,
      },
      {
        label: "Datum symmetry verified physically",
        criterion:
          "For rail-contact parts: contact symmetry measured on the physical part. Confirmed within 0.05mm of nominal.",
        displayOrder: 5,
      },
      {
        label: "Surface finish spot-checked",
        criterion:
          "Critical surfaces (sealing, sliding, sensor mount) checked against the drawing's Ra spec.",
        displayOrder: 6,
      },
    ],
  },

  // ── Stage 11 — Functional Validation ─────────────────────────────
  {
    stageNumber: "11",
    items: [
      {
        sectionHeading: "14.1 Functional tests",
        label: "Assembly fit check",
        criterion:
          "Part assembles with mating components without forcing. Bolts thread cleanly. PCB seats correctly. Sensors mount correctly.",
        displayOrder: 1,
      },
      {
        label: "Load test representative of use",
        criterion:
          "Static load applied. Deflection measured and compared to FEA prediction (if FEA was run). Agreement within 25% or explained.",
        displayOrder: 2,
      },
      {
        label: "Impact / drop test (if Class A and applicable)",
        criterion:
          "Drop from working height onto representative surface. No fracture, no permanent deformation in functional areas.",
        displayOrder: 3,
      },
      {
        label: "Vibration test (if applicable)",
        criterion:
          "Vibration profile representative of railside use. Fasteners checked after test.",
        displayOrder: 4,
      },
      {
        label: "Thermal exposure (if field-relevant)",
        criterion:
          "Part exposed to expected operating temperature range. Dimensional change and functional behaviour verified.",
        displayOrder: 5,
      },
      {
        label: "Calibration verification (if measurement-critical)",
        criterion:
          "Part used in measurement context gives readings within DRTG accuracy spec on a known reference.",
        displayOrder: 6,
      },
      {
        label: "Degree-of-freedom verification (if applicable)",
        criterion:
          "If the part has a designed DOF (slide, hinge, telescope), the DOF behaves as designed under realistic use.",
        displayOrder: 7,
      },
      {
        label: "All Stage 1 acceptance criteria verified",
        criterion:
          "Every requirement from the Stage 1 concept brief has a pass/fail. Failures have root cause.",
        displayOrder: 8,
      },
      {
        sectionHeading: "14.2 Release decision",
        label: "Release / Re-spin / Scrap decision recorded",
        criterion:
          "CEO explicitly selects one of RELEASE, RE-SPIN (with ECNs attached), or SCRAP (with rationale).",
        displayOrder: 9,
      },
    ],
  },
];

export async function seedMechChecklistItems(workflowId: string) {
  logger.info("Seeding Mechanical checklist items...");

  const stages = await db
    .select()
    .from(workflowStages)
    .where(eq(workflowStages.workflowId, workflowId));

  const stageMap = new Map(stages.map((s) => [s.stageNumber, s.id]));

  let totalItems = 0;

  for (const checklist of MECH_CHECKLIST) {
    const stageId = stageMap.get(checklist.stageNumber);
    if (!stageId) {
      logger.warn(`Mech Stage ${checklist.stageNumber} not found, skipping.`);
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
    `Seeded ${totalItems} mechanical checklist items across ${MECH_CHECKLIST.length} stages.`
  );
}
