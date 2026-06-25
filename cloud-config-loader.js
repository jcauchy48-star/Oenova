(function loadOptionalCloudConfig() {
  function hasUsableCloudConfig() {
    const config = window.CAVE_CLOUD_CONFIG || {};
    return Boolean(config.enabled !== false && config.supabaseUrl && config.supabaseAnonKey);
  }

  if (hasUsableCloudConfig()) {
    window.CAVE_CLOUD_CONFIG_READY = Promise.resolve(true);
    return;
  }

  const configPath = document.querySelector('meta[name="cave-cloud-config"]')?.content || "./cloud-config.example.js";
  window.CAVE_CLOUD_CONFIG_READY = fetch(configPath, { cache: "no-store" })
    .then((response) => response.ok ? response.text() : "")
    .then((source) => {
      if (!source.trim()) return false;
      Function(`${source}\n//# sourceURL=cloud-config.js`)();
      return hasUsableCloudConfig();
    })
    .catch(() => false);
})();
