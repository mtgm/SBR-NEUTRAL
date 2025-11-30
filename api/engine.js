import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Veritabanı
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
    
    // DEBUG: Konsola yazdıralım (Vercel Loglarında görünür)
    console.log(`İstek geldi. SKU: ${sku}`);

    if (!sku || !MODEL_DB[sku]) {
      return res.status(404).json({ ok: false, error: "MODEL BULUNAMADI (YENI KOD)", sku });
    }

    const fileKey = MODEL_DB[sku];

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: fileKey,
    });

    const signedUrl = await getSignedUrl(client, command, { expiresIn: 60 });

    return res.status(200).json({ ok: true, url: signedUrl, debug: "BU YENI KOD!" });

  } catch (error) {
    console.error("KRITIK HATA:", error);
    // Hatanın ne olduğunu tam olarak görelim
    return res.status(500).json({ 
      ok: false, 
      error: "R2 BAGLANTISI BASARISIZ", 
      detay: error.message 
    });
  }
}