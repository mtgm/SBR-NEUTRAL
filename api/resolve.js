// api/resolve.js
const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const skuParam = (url.searchParams.get("sku") || "").trim();
    if (!skuParam) return res.status(400).json({ ok: false, error: "Missing SKU" });

    const sku = skuParam.toUpperCase(); // /m/sbrv2 → SBRV2
    const jsonPath = path.join(process.cwd(), "data", "models.json");

    // Dosyayı oku
    const raw = fs.readFileSync(jsonPath, "utf8");
    const models = JSON.parse(raw);

    const key = models[sku];
    if (!key) return res.status(404).json({ ok: false, error: "Model not found", sku });

    return res.status(200).json({ ok: true, sku, key });
  } catch (err) {
    console.error("resolve.js error:", err.message);
    return res.status(500).json({ ok: false, error: "ResolveFailed" });
  }
};
