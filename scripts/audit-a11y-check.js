const fs = require("fs");
const path = require("path");

const files = ["index.html", "courses.html", "about.html", "students.html"];

files.forEach(file => {
  const filePath = path.join(__dirname, "..", file);
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");

  // 1. Duplicate IDs
  const idRegex = /\sid=["']([^"']+)["']/g;
  const ids = [];
  let m;
  while ((m = idRegex.exec(content)) !== null) {
    ids.push(m[1]);
  }
  const seen = new Set();
  const dupes = new Set();
  ids.forEach(id => {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  });
  console.log(`[${file}] Total IDs: ${ids.length} | Duplicates: ${dupes.size ? Array.from(dupes).join(", ") : "NONE"}`);

  // 2. Buttons without accessible names
  const buttonRegex = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  let btn;
  let unnamedButtons = [];
  while ((btn = buttonRegex.exec(content)) !== null) {
    const attrs = btn[1];
    const inner = btn[2].replace(/<[^>]*>/g, "").trim();
    const hasAriaLabel = /aria-label=["'][^"']+["']/i.test(attrs);
    const hasAriaLabelledby = /aria-labelledby=["'][^"']+["']/i.test(attrs);
    const hasTitle = /title=["'][^"']+["']/i.test(attrs);
    if (!inner && !hasAriaLabel && !hasAriaLabelledby && !hasTitle) {
      unnamedButtons.push(btn[0].slice(0, 80));
    }
  }
  console.log(`[${file}] Buttons without accessible name: ${unnamedButtons.length}`);
  if (unnamedButtons.length > 0) {
    unnamedButtons.forEach(b => console.log("   - " + b));
  }

  // 3. Inputs without associated labels
  const inputRegex = /<input\b([^>]*)>/gi;
  let inp;
  let unlabeledInputs = [];
  while ((inp = inputRegex.exec(content)) !== null) {
    const attrs = inp[1];
    const typeMatch = attrs.match(/type=["']([^"']+)["']/i);
    const type = typeMatch ? typeMatch[1].toLowerCase() : "text";
    if (type === "hidden" || type === "submit" || type === "button" || type === "reset") continue;
    const idMatch = attrs.match(/id=["']([^"']+)["']/i);
    const id = idMatch ? idMatch[1] : null;
    const hasAriaLabel = /aria-label=["'][^"']+["']/i.test(attrs);
    const hasAriaLabelledby = /aria-labelledby=["'][^"']+["']/i.test(attrs);
    const hasTitle = /title=["'][^"']+["']/i.test(attrs);
    
    // Check if there is a <label for="id">
    let hasLabelFor = false;
    if (id) {
      const labelForRegex = new RegExp(`<label\\b[^>]*for=["']${id}["']`, "i");
      hasLabelFor = labelForRegex.test(content);
    }
    if (!hasAriaLabel && !hasAriaLabelledby && !hasTitle && !hasLabelFor) {
      unlabeledInputs.push({ id, type, tag: inp[0].slice(0, 100) });
    }
  }
  console.log(`[${file}] Inputs without label/aria-label: ${unlabeledInputs.length}`);
  if (unlabeledInputs.length > 0) {
    unlabeledInputs.forEach(i => console.log(`   - id="${i.id}" type="${i.type}": ${i.tag}`));
  }

  // 4. Selects without associated labels
  const selectRegex = /<select\b([^>]*)>/gi;
  let sel;
  let unlabeledSelects = [];
  while ((sel = selectRegex.exec(content)) !== null) {
    const attrs = sel[1];
    const idMatch = attrs.match(/id=["']([^"']+)["']/i);
    const id = idMatch ? idMatch[1] : null;
    const hasAriaLabel = /aria-label=["'][^"']+["']/i.test(attrs);
    const hasAriaLabelledby = /aria-labelledby=["'][^"']+["']/i.test(attrs);
    let hasLabelFor = false;
    if (id) {
      const labelForRegex = new RegExp(`<label\\b[^>]*for=["']${id}["']`, "i");
      hasLabelFor = labelForRegex.test(content);
    }
    if (!hasAriaLabel && !hasAriaLabelledby && !hasLabelFor) {
      unlabeledSelects.push({ id, tag: sel[0].slice(0, 100) });
    }
  }
  console.log(`[${file}] Selects without label/aria-label: ${unlabeledSelects.length}`);
  if (unlabeledSelects.length > 0) {
    unlabeledSelects.forEach(s => console.log(`   - id="${s.id}": ${s.tag}`));
  }

  // 5. Textareas without associated labels
  const taRegex = /<textarea\b([^>]*)>/gi;
  let ta;
  let unlabeledTas = [];
  while ((ta = taRegex.exec(content)) !== null) {
    const attrs = ta[1];
    const idMatch = attrs.match(/id=["']([^"']+)["']/i);
    const id = idMatch ? idMatch[1] : null;
    const hasAriaLabel = /aria-label=["'][^"']+["']/i.test(attrs);
    const hasAriaLabelledby = /aria-labelledby=["'][^"']+["']/i.test(attrs);
    let hasLabelFor = false;
    if (id) {
      const labelForRegex = new RegExp(`<label\\b[^>]*for=["']${id}["']`, "i");
      hasLabelFor = labelForRegex.test(content);
    }
    if (!hasAriaLabel && !hasAriaLabelledby && !hasLabelFor) {
      unlabeledTas.push({ id, tag: ta[0].slice(0, 100) });
    }
  }
  console.log(`[${file}] Textareas without label/aria-label: ${unlabeledTas.length}`);
  if (unlabeledTas.length > 0) {
    unlabeledTas.forEach(t => console.log(`   - id="${t.id}": ${t.tag}`));
  }

  // 6. Modals without role="dialog" or aria-modal
  const modalRegex = /<div\b[^>]*class=["'][^"']*\b(?:modal|schedule-modal)\b[^"']*["'][^>]*>/gi;
  let mod;
  let imperfectModals = [];
  while ((mod = modalRegex.exec(content)) !== null) {
    const tag = mod[0];
    const hasRoleDialog = /role=["']dialog["']/i.test(tag);
    const hasAriaModal = /aria-modal=["']true["']/i.test(tag);
    const hasLabel = /aria-labelledby=["']|aria-label=["']/i.test(tag);
    if (!hasRoleDialog || !hasAriaModal || !hasLabel) {
      imperfectModals.push({ tag: tag.slice(0, 120), hasRoleDialog, hasAriaModal, hasLabel });
    }
  }
  console.log(`[${file}] Modals missing role/aria-modal/aria-label: ${imperfectModals.length}`);
  if (imperfectModals.length > 0) {
    imperfectModals.forEach(m => console.log(`   - role: ${m.hasRoleDialog}, modal: ${m.hasAriaModal}, label: ${m.hasLabel} | ${m.tag}`));
  }
});

