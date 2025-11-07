// api/resolve.js (diagnostic sürümü — geçici)
const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const skuParam = (url.searchParams.get("sku") || "").trim();
    if (!skuParam) return res.status(400).json({ ok: false, error: "Missing SKU" });

    const sku = skuParam.toUpperCase();
    const jsonPath = path.join(process.cwd(), "data", "models.json");

    // diagnostic: dosya var mı?
    const exists = fs.existsSync(jsonPath);
    if (!exists) {
      return res.status(500).json({ ok: false, error: "models.json missing", path: jsonPath });
    }

    const raw = fs.readFileSync(jsonPath, "utf8");
    let models;
    try {
      models = JSON.parse(raw);
    } catch (e) {
      return res.status(500).json({ ok:false, error: "models.json parse error", message: e.message });
    }

    const key = models[sku];
    if (!key) return res.status(404).json({ ok: false, error: "Model not found", sku, models_keys: Object.keys(models) });

    return res.status(200).json({ ok: true, sku, key });
  } catch (err) {
    console.error("resolve.js diagnostic error:", err);
    return res.status(500).json({ ok: false, error: "ResolveFailed", message: err.message });
  }
};
