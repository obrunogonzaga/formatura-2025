export function slugifyFileName(name: string) {
  const [base, ...extParts] = name.split(".");
  const ext = extParts.length ? `.${extParts.pop()}` : "";
  const safeBase = base
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${safeBase || "foto"}${ext}`;
}

export function toSnakeCase(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

