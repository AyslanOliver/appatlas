const fs = require('fs-extra');
const path = require('path');

const dependencies = {
    '@fortawesome/fontawesome-free': ['css/all.min.css', 'webfonts/*'],
    'bootstrap': ['dist/css/bootstrap.min.css', 'dist/js/bootstrap.bundle.min.js'],
    'jquery': ['dist/jquery.min.js'],
    'startbootstrap-sb-admin-2': ['css/sb-admin-2.min.css', 'js/sb-admin-2.min.js']
};

async function copyDependencies() {
    const wwwNodeModules = path.join(__dirname, 'www', 'node_modules');
    
    for (const [pkg, files] of Object.entries(dependencies)) {
        for (const file of files) {
            const srcPath = path.join(__dirname, 'www', 'node_modules', pkg, file);
            const destPath = path.join(wwwNodeModules, pkg, file);
            
            try {
                await fs.copy(srcPath, destPath);
                console.log(`Copied ${srcPath} to ${destPath}`);
            } catch (err) {
                console.error(`Error copying ${srcPath}:`, err);
            }
        }
    }
}

copyDependencies().catch(console.error);