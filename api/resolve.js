// api/resolve.js
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const skuParam = (url.searchParams.get("sku") || "").trim();
    if (!skuParam) {
      return res.status(400).json({ ok: false, error: "Missing SKU" });
    }

    const jsonPath = path.join(process.cwd(), "data", "models.json");

    if (!fs.existsSync(jsonPath)) {
      return res.status(500).json({ ok: false, error: "models.json missing" });
    }

    const raw = fs.readFileSync(jsonPath, "utf8");
    let models;
    try {
      models = JSON.parse(raw);
    } catch (e) {
      return res.status(500).json({
        ok: false,
        error: "models.json parse error",
        message: e.message
      });
    }

    // Case-insensitive eşle
    const lookup = {};
    for (const [k, v] of Object.entries(models)) {
      lookup[k.toLowerCase()] = v;
    }

    const key = lookup[skuParam.toLowerCase()];
    if (!key) {
      return res.status(404).json({
        ok: false,
        error: "Model not found",
        sku: skuParam
      });
    }

    return res.status(200).json({
      ok: true,
      sku: skuParam,
      key // Örn: "SBR-v2.glb"
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: "ResolveFailed",
      message: err.message
    });
  }
}
