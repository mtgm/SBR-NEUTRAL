// app.js - Müşteri Tarafı

// ... (Üst kısımdaki değişkenler ve showError aynı kalsın) ...

async function init() {
  const url = new URL(window.location.href);
  let sku = url.searchParams.get('sku');
  const match = url.pathname.match(/\/m\/([^\/]+)/);
  if (match) sku = match[1];

  if (!sku) return showError("Error: Product SKU missing.");

  try {
    // 1. Motor'dan Model ve Config linklerini al
    const res = await fetch(`/api/engine?sku=${sku}`);
    if (!res.ok) throw new Error("Product not found.");
    
    const data = await res.json();
    
    // 2. Modeli Yükle
    mv.src = data.modelUrl;
    window.arFileUrl = data.modelUrl;

    // 3. KAYITLI AYAR VAR MI? (Otomasyon Kısmı)
    if (data.configUrl) {
      applySavedConfig(data.configUrl);
    }

  } catch (err) {
    console.error(err);
    showError(err.message);
  }
}

// Kayıtlı ayarı çek ve uygula
async function applySavedConfig(configUrl) {
  try {
    const res = await fetch(configUrl);
    if (!res.ok) return; // Ayar yoksa varsayılan model kalsın
    
    const config = await res.json();
    
    if (config.textureName) {
      console.log("Özel kaplama bulundu:", config.textureName);
      
      // Texture dosyasının güvenli linkini al
      const texRes = await fetch(`/api/engine?type=texture&tex=${config.textureName}`);
      const texData = await texRes.json();
      
      if (texData.ok) {
        // Model yüklenince kaplamayı giydir
        mv.addEventListener('load', async () => {
          const texture = await mv.createTexture(texData.url);
          // Tüm materyalleri veya ilkini boya (Modeline göre değişir)
          // Şimdilik ilk materyale uyguluyoruz:
          const material = mv.model.materials[0]; 
          if(material) {
             material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
          }
        }, { once: true });
      }
    }
  } catch (e) {
    console.log("Config yüklenemedi, varsayılan gösteriliyor.");
  }
}

// ... (Alttaki AR butonu kodları aynı kalsın) ...