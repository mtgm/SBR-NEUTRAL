// api/resolve.js
const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const sku = (url.searchParams.get("sku") || "").trim();

    const jsonPath = path.join(process.cwd(), "data", "models.json");
    const models = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    const key = sku && models[sku];
    if (!key) return res.status(404).json({ ok: false, error: "Unknown SKU" });

    res.status(200).json({ ok: true, sku, key });
  } catch (e) {
    res.status(500).json({ ok: false, error: "ResolveFailed", message: e.message });
  }
};
