import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// MODEL VERİTABANI
const MODEL_DB = {
  "SBRV2": "SBR-v2.glb",
  "CHAIRV1": "chair-v1.glb",
  "PLANTERV1": "planter.glb"
};

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, `https://${req.headers.host}`);
    const sku = url.searchParams.get("sku")?.toUpperCase();
    const type = url.searchParams.get("type"); // 'write' (kaydet) veya 'texture' (resim)
    const textureName = url.searchParams.get("tex"); // İstenen resim dosyasının adı

    // --- A. TEXTURE İSTEĞİ (Resim Linki Ver) ---
    if (type === 'texture' && textureName) {
      // Güvenlik: Sadece 'textures/' klasöründeki veya kök dizindeki resimlere izin verelim
      // Burada dosyanın R2'da 'textures' klasöründe olduğunu varsayıyoruz.
      const command = new GetObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: `textures/${textureName}` 
      });
      const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
      return res.status(200).json({ ok: true, url: signedUrl });
    }

    if (!sku || !MODEL_DB[sku]) {
      return res.status(404).json({ ok: false, error: "Model Bulunamadı" });
    }

    // --- B. AYAR KAYDETME (Studio'dan gelir) ---
    if (type === 'write') {
      const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: `configs/${sku}.json`, // Ayarı 'configs' klasörüne kaydet
        ContentType: 'application/json'
      });
      const signedUrl = await getSignedUrl(client, command, { expiresIn: 60 });
      return res.status(200).json({ ok: true, url: signedUrl });
    }

    // --- C. MÜŞTERİ GÖRÜNTÜLEME (Model + Ayar) ---
    
    // 1. Model Linki
    const modelKey = MODEL_DB[sku];
    const modelCmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: modelKey });
    const modelUrl = await getSignedUrl(client, modelCmd, { expiresIn: 3600 });

    // 2. Ayar Dosyası Linki (Varsa)
    const configCmd = new GetObjectCommand({ Bucket: process.env.R2_BUCKET, Key: `configs/${sku}.json` });
    const configUrl = await getSignedUrl(client, configCmd, { expiresIn: 3600 });

    return res.status(200).json({ ok: true, modelUrl, configUrl });

  } catch (error) {
    console.error("Engine Hatası:", error);
    return res.status(500).json({ ok: false, error: error.message });
  }
}