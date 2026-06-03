/**
 * Seed: Mechanical Workflow Stages
 *
 * The 11 stages of the Tryaksh mechanical design workflow per SOP v2.0
 * (TRYAKSH-SOP-MECH-001 v2.0). Stage content is verbatim from the SOP.
 *
 * Lock gates: Stage 2 (Datum Scheme Lock), Stage 7 (DFM Review).
 * No binary decision gate in this workflow — the infrastructure exists
 * if a future revision introduces one.
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
  isDecisionGate: boolean;
  reopensToStageNumber: string | null;
  displayOrder: number;
  descriptionMarkdown: string;
}

const MECH_STAGES: StageSeed[] = [
  {
    stageNumber: "1",
    name: "Concept and Material Discussion",
    subtitle: "Joint working session — CEO + Designer",
    requiresApproval: true,
    isLockGate: false,
    isDecisionGate: false,
    reopensToStageNumber: null,
    displayOrder: 1,
    descriptionMarkdown: `**Owner:** CEO and Designer, jointly. CEO has final call on material, manufacturing process, and load-case framing.

**Why CEO co-owns this:** Material choice has caused real Tryaksh failures (cast iron). Manufacturing process choice locks in cost and tolerance ceilings. These decisions have product-level consequences and must be made together.

### Required Outputs
- **Written concept brief** (one to two pages) covering: purpose, key dimensions/envelope, material from AML, manufacturing process (CNC / sheet metal / 3D print), expected load cases (static / dynamic / thermal / impact), mating interfaces, design class, scope.
- **Load case framing.** Designer and CEO together identify whether the part is subject to meaningful stress, vibration, impact, or thermal load. If yes → **FEA is flagged as required for Stage 6** and recorded in the brief. This call is made now, not later. Once flagged, FEA at Stage 6 cannot be skipped.
- **3D-print mockup flag.** If the part has a designed degree of freedom (slide, rotate, telescope, hinge) OR is an ergonomic surface (handle, grip, button), Stage 8 mockup is flagged as required.
- **Top three risks identified.** Material brittleness, manufacturability of complex features, tolerance stack-up, deflection — three named with mitigation plan.

**Output:** Approved concept brief. No work moves to Stage 2 without CEO sign-off.`,
  },
  {
    stageNumber: "2",
    name: "Datum Scheme and Interface Lock",
    subtitle: "Designer drafts, CEO locks — the consequential gate",
    requiresApproval: true,
    isLockGate: true,
    isDecisionGate: false,
    reopensToStageNumber: null,
    displayOrder: 2,
    descriptionMarkdown: `**Owner:** Designer drafts. CEO reviews and locks.

**Why this stage exists separately from modeling:** Datums that emerge during modeling lead to asymmetric reference frames and tolerance-chain disasters. This stage forces explicit datum thinking before Fusion is opened. It is the mechanical equivalent of the block-diagram stage in PCB design.

**This is one of the two consequential gates in the entire workflow** (the other is Stage 7 DFM). The datum scheme, once locked, does not change without an ECN and a tolerance stack-up re-analysis.

### What the Designer Produces
- **A datum reference frame sketch** (on paper or in a 2D sketch tool — not in Fusion yet). Primary datum (A), Secondary datum (B), Tertiary datum (C). For DRTG rail-contact parts: the two rail-contact surfaces must lie on a single symmetric datum about the gauge centerline.
- **Symmetry requirements stated explicitly.** Where mirror symmetry is required (rail contacts, dual sensor mounts), the tolerance for symmetry is called out — typically within 0.05mm for measurement-critical interfaces.
- **Interface specification.** For every mating face: which datum it references, what fit class applies (H7/g6 etc.), what surface finish is required, what fastener pattern it carries.
- **Tolerance budget allocation.** Worst-case tolerance budget for measurement-critical chains is estimated and split across the involved parts/features.

### The Lock
1. **CEO signs the Datum Lock Sheet.**
2. **Designer archives the datum scheme** (sketch or document) in \`00_Project_Charter/Datum_Scheme_V1.0.pdf\`.
3. **Stage 3 (CAD Modeling) can begin.**

**Changing the datum scheme after lock** requires the same process as a Schematic Re-Open in PCB: written request, root-cause analysis of why it wasn't caught at Stage 2, CEO approval, tolerance stack-up re-analysis at Stage 6.`,
  },
  {
    stageNumber: "3",
    name: "CAD Modeling",
    subtitle: "Designer-owned execution work in Fusion 360",
    requiresApproval: false,
    isLockGate: false,
    isDecisionGate: false,
    reopensToStageNumber: null,
    displayOrder: 3,
    descriptionMarkdown: `**Owner:** Designer.

**Continuous interaction:** Daily/weekly informal review chats between designer and CEO continue during this stage. These are not gates — they are conversations. Formal review happens at Stage 4 (Mid-Model) and Stage 7 (DFM).

### Modeling Standards
- **Project in the Tryaksh Fusion Hub.** Personal Fusion accounts are forbidden. Folder structure per Engineering Standards.
- **Units: mm. Always.**
- **Parametric model with named parameters.** Critical dimensions are driven by named parameters in File → Change Parameters. Hard-coded numbers in sketches are forbidden for measurement-critical dimensions.
- **Model to the datum scheme locked at Stage 2.** Datum planes set up first, before any feature is created.
- **Sub-document workflow per Engineering Standards.** Sub-documents are opened standalone, edited, saved, and the parent re-opened to verify. In-context editing through the parent viewport is forbidden for Class A and Class B work.
- **Daily Git or Fusion version save.** End-of-day version marker. Weekly export of the project to the Drive 01_WIP folder as a safety backup.
- **Mass and CG tracked as the model grows.** Mass appears in the title block from the start. Surprises at Stage 5 are avoidable.

### Exit Criteria
Stage 3 progresses naturally into Stage 4 when the model is approximately 70% complete — major bodies modeled, primary features in place, but detail features (fillets, chamfers, holes, drafts) not yet finalised. The designer initiates Stage 4 by notifying the CEO.`,
  },
  {
    stageNumber: "4",
    name: "Mid-Model Review",
    subtitle: "Designer presents, CEO writes feedback",
    requiresApproval: true,
    isLockGate: false,
    isDecisionGate: false,
    reopensToStageNumber: null,
    displayOrder: 4,
    descriptionMarkdown: `**Owner:** CEO reviews. Designer presents.

**Why this exists:** Catching an architectural drift at 70% complete costs one day of rework. Catching it at 100% complete costs a week. This is a feedback session, not a hard gate — but the feedback is written, not verbal-only.

**Conditional:** Mandatory for Class A. Optional for Class B (CEO discretion at Stage 1). Skipped for Class C.

### What CEO Reviews
- Faithfulness to the Stage 1 concept brief — is this still the part we agreed to design?
- Faithfulness to the Stage 2 datum scheme — datums in the model match the locked scheme.
- Manufacturability shape — are wall thicknesses, radii, hole locations on track for the chosen process?
- Mass and envelope — model mass vs Stage 1 mass budget. Discrepancy ≤ 15% or explained.
- Open issues the designer wants input on — explicit discussion of any decision the designer is unsure about.

### Output Classification
- **Required:** must be addressed before Stage 5 ends and Stage 6 begins.
- **Suggested:** designer and CEO together decide whether to incorporate now or defer.
- **Informational:** for future projects; no action this round.`,
  },
  {
    stageNumber: "5",
    name: "Design Refinement",
    subtitle: "Designer addresses Stage 4 Required items",
    requiresApproval: false,
    isLockGate: false,
    isDecisionGate: false,
    reopensToStageNumber: null,
    displayOrder: 5,
    descriptionMarkdown: `**Owner:** Designer.

Designer addresses all Stage 4 Required items, completes detail features (fillets, chamfers, holes, drafts, threads), prepares the final model for analysis and DFM. This is execution, not a review stage.

### Refinement Outputs
- All Stage 4 Required items implemented and verified against the feedback notes.
- Detail features complete. No feature has "To do" or "Placeholder" status.
- Fusion timeline clean — no errors, no warnings, no suppressed features without documented reason.
- Mass and CG calculated. Recorded in title block. Within ±15% of Stage 1 budget.
- Interference analysis run (if assembly). Zero unintentional interferences.
- Sensor and mating-part datums verified against Stage 2 lock — datums have not drifted during modeling.`,
  },
  {
    stageNumber: "6",
    name: "Tolerance Stack-up and FEA",
    subtitle: "Designer performs, CEO approves analyses",
    requiresApproval: true,
    isLockGate: false,
    isDecisionGate: false,
    reopensToStageNumber: null,
    displayOrder: 6,
    descriptionMarkdown: `**Owner:** Designer performs. CEO reviews and approves analyses.

### Tolerance Stack-up — Mandatory for Measurement-Critical Parts
Tolerance stack-up is mandatory for every dimension chain affecting a measurement-critical interface, regardless of Design Class. The DRTG measures gauge as the difference between two rail contacts — every tolerance in that chain matters.

### FEA — Mandatory When Flagged at Stage 1
FEA is mandatory if the FEA Required flag was set at Stage 1 — this happens when load cases include meaningful stress, vibration, impact, or thermal effects. Once flagged, FEA cannot be skipped at this stage. The discretion lives at Stage 1, not here.

### FEA Hygiene — Things That Have Failed Before
- Load cases representative of real use, not guessed magnitudes
- Contacts correctly defined (no bonded on telescoping interfaces)
- Boundary conditions match reality, not 'fix everything' shortcuts
- Material properties match the AML selection exactly
- Mesh convergence verified at two refinement levels (≤5% delta at critical locations)
- Brittle vs ductile failure mode addressed
- Safety factor documented (≥2.0 yield static, ≥3.0 ultimate impact)
- Modal analysis run for vibration-prone parts

### Assembly Gate (if scope = subassembly or assembly)
For subassembly/assembly projects, also complete the Assembly Gate checklist before proceeding to Stage 7. See SOP §16.`,
  },
  {
    stageNumber: "7",
    name: "DFM Review",
    subtitle: "Designer prepares, CEO + Peer Reviewer sign — the second lock gate",
    requiresApproval: true,
    isLockGate: true,
    isDecisionGate: false,
    reopensToStageNumber: null,
    displayOrder: 7,
    descriptionMarkdown: `**Owner:** Designer prepares. CEO + Peer Reviewer sign.

**Why this is a separate stage with a written checklist:** The 5.2mm wall thickness failure happened during an informal on-screen review. Screens hide millimetres. This stage exists specifically to make geometric verification explicit, item by item, with initials.

**This is the second of the two consequential gates** (the first was Stage 2 Datum Lock). Approval here triggers vendor selection and release.

### Review covers three areas
1. **CAD Hygiene** — parametric model, clean timeline, sub-documents propagated, mass/CG calculated, no interferences, datums verified against Stage 2 lock.
2. **Geometric Manufacturability** — wall thickness minima (Al 6061 structural ≥6.0mm), datum symmetry (≤0.05mm), tapped hole depth (≥2× diameter), internal corner radii (≥3.0mm CNC), draft and undercut review, process-specific DFM rules from §15.
3. **Drawing and BOM** — 2D drawing PDF complete, GD&T present, surface finish callouts, STEP AP214 exported and verified, BOM exported.

Sign-off requires designer, an independent peer reviewer, AND the CEO.`,
  },
  {
    stageNumber: "8",
    name: "3D-Print Mockup",
    subtitle: "Conditional — designer prints, tests, reports",
    requiresApproval: true,
    isLockGate: false,
    isDecisionGate: false,
    reopensToStageNumber: null,
    displayOrder: 8,
    descriptionMarkdown: `**Owner:** Designer.

**Mandatory when:** the part has a designed degree of freedom (slide, rotate, telescope, hinge), OR the part has an ergonomic surface that a user holds, grips, or operates by hand.

**Skipped when:** the part is structurally static with no human-touch interface. CEO confirms at Stage 1 whether mockup applies.

### Why This Exists
CAD shows geometry. It does not show how a hinge actually swings, how a telescope actually slides under hand pressure, how a grip feels, or how clearances behave with manufacturing tolerance. A 3D-printed mockup, even in PLA, reveals these in a way no simulation does. The cost is half a day of print time. The cost of discovering the issue after CNC is a part re-order.

### Mockup Standards
- PETG, ABS, or ASA for any part that will be physically tested. PLA only for Class C internal-only mockups.
- Print at production-intent tolerances where possible — not aggressive infill/wall settings that disguise the eventual fit.
- Print mating parts together if they share a degree of freedom.
- Test the degree of freedom under realistic conditions: hand pressure, expected travel range, expected number of cycles.
- Photograph the mockup test. Log results in a one-page mockup test report.

### Outcomes
- **Pass** — fit/feel as expected → Proceed to Stage 9.
- **Marginal** — needs adjustment → Update Fusion, reprint, re-test. If adjustment changes datums, returns to Stage 2.
- **Fail** — geometry is wrong → Returns to Stage 5 (Refinement) or Stage 2 (Datum Lock) depending on depth.`,
  },
  {
    stageNumber: "9",
    name: "Drawing Release and Vendor Selection",
    subtitle: "Designer prepares, CEO approves vendor",
    requiresApproval: true,
    isLockGate: false,
    isDecisionGate: false,
    reopensToStageNumber: null,
    displayOrder: 9,
    descriptionMarkdown: `**Owner:** Designer prepares. CEO approves vendor.

### Designer Prepares
1. Final drawing PDF + STEP file + BOM in \`02_Review/\` folder.
2. Vendor proposal: which vendor (Indian CNC shop / sheet-metal vendor / 3D-print service), why this vendor, quoted unit price, lead time, surface finish capability.
3. Material certification commitment: vendor confirms in writing they will supply a material certificate for the actual stock used. (Especially critical for Al 6061-T6 — substitution with lower-grade Al is common in Indian CNC shops.)
4. Inspection plan agreed with vendor: critical dimensions to be inspected by vendor with CMM or equivalent. Vendor inspection report format agreed.

### Release
On CEO approval, drawing PDF, STEP, and BOM are copied from \`02_Review/\` to \`03_Released/Part_V1.0/\`. The Released folder is read-only by convention. Files sent to vendor and PO raised.`,
  },
  {
    stageNumber: "10",
    name: "First-Article Inspection",
    subtitle: "Designer measures, CEO signs first-article approval",
    requiresApproval: true,
    isLockGate: false,
    isDecisionGate: false,
    reopensToStageNumber: null,
    displayOrder: 10,
    descriptionMarkdown: `**Owner:** Designer measures. CEO signs first-article approval.

**Why this is formal:** "Looks fine" is not an inspection. For a measurement instrument going onto railway infrastructure, every critical dimension on the drawing is verified on the first article before further parts are ordered or before the part enters functional validation. This was previously informal at Tryaksh and is now a hard gate.

### First-Article Receiving
- Visual inspection passed — no surface defects, no machining errors, no transit damage. Photographed and logged.
- Vendor inspection report received — vendor's CMM or equivalent report attached.
- Material certificate received — matches AML specification.
- Independent dimensional check (Tryaksh side) — critical dimensions re-measured.
- Datum symmetry verified physically — for rail-contact parts, contact symmetry measured ≤0.05mm of nominal.
- Surface finish spot-checked — critical surfaces checked against drawing's Ra spec.

### Decision Path
| If first article... | Then... |
| --- | --- |
| Meets all critical dimensions | CEO signs first-article approval. Production batch can proceed. Stage 11 begins on this article. |
| Fails one or more critical dimensions | Rejected. Vendor notified with measured deviations. Resolution: drawing ECN + re-quote, or vendor remake at vendor cost. |
| Meets dimensions but visual or finish issue | CEO discretion. Accept with documented deviation, or remake. |`,
  },
  {
    stageNumber: "11",
    name: "Functional Validation",
    subtitle: "Designer tests, CEO signs release decision",
    requiresApproval: true,
    isLockGate: false,
    isDecisionGate: false,
    reopensToStageNumber: null,
    displayOrder: 11,
    descriptionMarkdown: `**Owner:** Designer tests. CEO signs release decision.

**Pre-condition:** Stage 10 first-article approved. The part is dimensionally correct; this stage verifies it functionally correct.

### Functional Tests
- Assembly fit check — part assembles with mating components without forcing. Bolts thread cleanly. PCB seats correctly. Sensors mount correctly.
- Load test representative of use — static load applied; deflection measured and compared to FEA prediction (if FEA was run). Agreement within 25% or explained.
- Impact / drop test (if Class A and applicable) — drop from working height onto representative surface. No fracture, no permanent deformation in functional areas.
- Vibration test (if applicable) — vibration profile representative of railside use. Fasteners checked after test.
- Thermal exposure (if field-relevant) — part exposed to expected operating temperature range. Dimensional change and functional behaviour verified.
- Calibration verification (if measurement-critical) — readings within DRTG accuracy spec on a known reference.
- Degree-of-freedom verification (if applicable) — DOF behaves as designed under realistic use.
- All Stage 1 acceptance criteria verified — every requirement from the concept brief has a pass/fail.

### Decision
☐ RELEASE   ☐ RE-SPIN (ECNs attached)   ☐ SCRAP (rationale attached)`,
  },
];

export async function seedMechStages(workflowId: string) {
  logger.info("Seeding Mechanical workflow stages...", { workflowId });

  for (const stage of MECH_STAGES) {
    const [created] = await db
      .insert(workflowStages)
      .values({
        workflowId,
        ...stage,
      })
      .onConflictDoNothing()
      .returning();

    if (created) {
      logger.info(`  Mech Stage ${stage.stageNumber}: ${stage.name}`, {
        id: created.id,
      });
    }
  }

  logger.info(`Seeded ${MECH_STAGES.length} mechanical stages.`);
}
