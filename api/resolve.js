module.exports = (req, res) => {
  // 1. Veritabanını (JSON) doğrudan buraya gömüyoruz.
  // Dosya okuma derdi bitti.
  const models = {
    "SBRV2": "SBR-v2.glb",
    "CHAIRV1": "chair-v1.glb",
    "PLANTERV1": "planter.glb"
  };

  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const skuParam = (url.searchParams.get("sku") || "").trim();

    if (!skuParam) {
      return res.status(400).json({ ok: false, error: "Missing SKU" });
    }

    const sku = skuParam.toUpperCase();
    const key = models[sku];

    if (!key) {
      // Hata durumunda ne istendiğini de görelim
      return res.status(404).json({ ok: false, error: "ModelNotFound", requested: sku });
    }

    // Başarılı yanıt
    return res.status(200).json({ ok: true, key });

  } catch (err) {
    return res.status(500).json({ ok: false, error: "ServerBozuldu", msg: err.message });
  }
};
