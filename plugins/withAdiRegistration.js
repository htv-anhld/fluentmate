/**
 * Expo Config Plugin: writes Play Console "ADI" (Anti-Developer Impersonation)
 * registration properties file into android/app/ during prebuild.
 *
 * Required by Play Console "Đăng ký tên gói" flow when registering a new package.
 */

const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Trailing newline matches Google's sample format
const ADI_TOKEN = 'DRVFWHT3QUTZGAAAAAAAAAAAAA\n';

const withAdiRegistration = (config) => {
  return withDangerousMod(config, [
    'android',
    async (cfg) => {
      const assetsDir = path.join(
        cfg.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'assets',
      );
      fs.mkdirSync(assetsDir, { recursive: true });
      // Module root (per Play Console instructions)
      fs.writeFileSync(
        path.join(cfg.modRequest.platformProjectRoot, 'app', 'adi-registration.properties'),
        ADI_TOKEN,
        'utf8',
      );
      // Embed inside APK assets so Play Console can read it
      fs.writeFileSync(
        path.join(assetsDir, 'adi-registration.properties'),
        ADI_TOKEN,
        'utf8',
      );
      return cfg;
    },
  ]);
};

module.exports = withAdiRegistration;
