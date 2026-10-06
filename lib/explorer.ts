// Demo data for the home page drill-down explorer. Not customer data.

export const LEVELS = ["Environment", "Source", "Repository", "Location", "File"];
export const PLURAL = ["environments", "sources", "repositories", "locations", "files"];

export type Node = {
  id: string;
  label: string;
  level: number;
  files: number;
  findings: number;
  outside: number;
  children?: Node[];
};

export type FileFinding = {
  name: string;
  type: string;
  evidence: string;
  marker: string;
  out: boolean;
  modified: string;
};

type Raw = [string, string, Raw[]] | [string, string, number, number, number];

const RAW: Raw = ["acme", "Acme Defense", [
  ["m365", "Microsoft 365", [
    ["sharepoint", "SharePoint", [["engenharia", "Engineering Site", 96200, 812, 41], ["programas", "Programs Site", 71800, 388, 22], ["qualidade", "Quality Site", 40500, 174, 19], ["comercial", "Sales Site", 58300, 86, 6]]],
    ["onedrive", "OneDrive", [["eng-users", "Engineering users", 88400, 341, 58], ["compras", "Procurement users", 36100, 97, 24], ["diretoria", "Executives", 12800, 29, 11]]],
    ["exchange", "Exchange", [["eng-mail", "Engineering mailboxes", 214600, 276, 37], ["shared-mail", "Shared mailboxes", 102300, 118, 21], ["pst", "PST archive", 44700, 63, 9]]],
  ]],
  ["shares", "Network file shares", [
    ["fs01", "\\\\fs01\\projetos", [["f24", "Programa_F24", 61200, 304, 12], ["propostas", "Proposals 2019–2023", 27400, 71, 8]]],
    ["fs02", "\\\\fs02\\cad", [["montagens", "Assemblies", 33900, 256, 5], ["liberados", "Released drawings", 18700, 190, 3]]],
  ]],
  ["legado", "Legacy repositories", [
    ["nas", "NAS-2014", [["backups", "Backups", 58200, 97, 31], ["scans", "Scans", 22600, 74, 26]]],
  ]],
  ["endpoints", "Endpoints", [
    ["eng-ws", "Engineering workstations", [["ws014", "ENG-WS-014", 9800, 64, 14], ["ws022", "ENG-WS-022", 8700, 41, 9]]],
    ["field", "Field laptops", [["lt007", "FLD-LT-007", 6400, 22, 17], ["lt011", "FLD-LT-011", 5900, 13, 10]]],
  ]],
]];

function build(r: Raw, level: number): Node {
  if (r.length === 3) {
    const children = r[2].map((c) => build(c, level + 1));
    const sum = (k: "files" | "findings" | "outside") => children.reduce((a, c) => a + c[k], 0);
    return { id: r[0], label: r[1], level, children, files: sum("files"), findings: sum("findings"), outside: sum("outside") };
  }
  return { id: r[0], label: r[1], level, files: r[2], findings: r[3], outside: r[4] };
}

export const TREE = build(RAW, 0);

const POOL: [string, string, string][] = [
  ["Actuator_Assembly_RevC.dwg", "CAD", "Title block with a distribution marking and reference to controlled technical data."],
  ["Technical_Spec_Lot7.pdf", "PDF", "CUI marking in header and footer; technical content tied to the contract."],
  ["Released_Drawing_0458.step", "CAD", "3D model with program metadata and an export-control notice."],
  ["Contract_Scan_2021.tif", "Scanned image", "OCR-extracted text from a scanned document carrying a control marking."],
  ["Technical_Data_Package.zip", "Archive", "Archive with 14 items; 3 contain CUI markings."],
  ["RE_Drawing_review.msg", "Email", "Attachment with a technical drawing forwarded outside the documented boundary."],
  ["Program_Bill_of_Materials.xlsx", "Spreadsheet", "Bill of materials referencing export-controlled items."],
  ["Vibration_Test_Report.pdf", "PDF", "Test report with technical data and a distribution marking."],
];
const MARKERS = ["CUI", "CUI//SP-CTI", "ITAR", "CUI//SP-EXPT"];

function genFiles(leaf: Node): FileFinding[] {
  let s = 0;
  for (const ch of leaf.id) s += ch.charCodeAt(0);
  const n = Math.min(6, leaf.findings);
  const outN = leaf.outside ? (leaf.outside / leaf.findings > 0.08 ? 2 : 1) : 0;
  return Array.from({ length: n }, (_, i) => {
    const p = POOL[(s + i * 3) % POOL.length];
    const mm = String(((s + i) % 9) + 1).padStart(2, "0");
    const dd = String(((s + i * 7) % 28) + 1).padStart(2, "0");
    return { name: p[0], type: p[1], evidence: p[2], marker: MARKERS[(s + i) % 4], out: i < outN, modified: `${mm}/${dd}/2026` };
  });
}

export type Resolved = { node: Node; chain: Node[]; ids: string[]; file: number | null; files: FileFinding[] | null };

export function resolve(path: string[]): Resolved {
  let node = TREE;
  const chain = [TREE];
  const ids: string[] = [];
  let file: number | null = null;
  for (const seg of path) {
    if (!node.children) {
      const m = /^f(\d+)$/.exec(seg);
      if (m) file = +m[1];
      break;
    }
    const c = node.children.find((x) => x.id === seg);
    if (!c) break;
    node = c;
    chain.push(c);
    ids.push(seg);
  }
  const files = node.children ? null : genFiles(node);
  if (file != null && (!files || file >= files.length)) file = null;
  return { node, chain, ids, file, files };
}

export function canon(path: string[]) {
  const r = resolve(path);
  return [...r.ids, ...(r.file != null ? ["f" + r.file] : [])];
}

// Hero planes jump to one sample path per level.
export const SAMPLE = [[], ["m365"], ["m365", "sharepoint"], ["m365", "sharepoint", "engenharia"], ["m365", "sharepoint", "engenharia", "f0"]];

export const fmt = (n: number) => n.toLocaleString("en-US");

export function parseHash(hash: string): string[] | null {
  let h = "";
  try {
    h = decodeURIComponent(hash || "");
  } catch {}
  if (!h.startsWith("#explore")) return null;
  const rest = h.slice(8).replace(/^[=/]/, "");
  return rest ? rest.split("/").filter(Boolean) : [];
}
