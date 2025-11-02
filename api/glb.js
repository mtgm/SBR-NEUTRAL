const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

module.exports = async (req, res) => {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const Bucket = process.env.R2_BUCKET;
  const Key = url.searchParams.get("key") || "SBR-v2.glb";

  try {
    const obj = await s3.send(new GetObjectCommand({ Bucket, Key }));
    res.setHeader("Content-Type", "model/gltf-binary");
    obj.Body.pipe(res);
  } catch (err) {
    res.status(500).json({
      error: err.name,
      message: err.message,
      bucket: Bucket,
      key: Key,
    });
  }
};
