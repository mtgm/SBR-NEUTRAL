// api/resolve.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const sku = url.searchParams.get("sku");
    if (!sku) return res.status(400).json({ ok: false, error: "Missing SKU" });

    const filePath = path.join(process.cwd(), "data", "models.json");
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

    const key = data[sku.toUpperCase()];
    if (!key) return res.status(404).json({ ok: false, error: "Model not found" });

    return res.status(200).json({ ok: true, sku, key });
  } catch (err) {
    console.error("Resolve error:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
