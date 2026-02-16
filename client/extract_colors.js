
import fs from 'fs';
import { PNG } from 'pngjs';

const getDominantColors = (imagePath) => {
    return new Promise((resolve, reject) => {
        fs.createReadStream(imagePath)
            .pipe(new PNG())
            .on('parsed', function () {
                const colorMap = {};
                for (let y = 0; y < this.height; y++) {
                    for (let x = 0; x < this.width; x++) {
                        const idx = (this.width * y + x) << 2;
                        const r = this.data[idx];
                        const g = this.data[idx + 1];
                        const b = this.data[idx + 2];
                        const a = this.data[idx + 3];

                        if (a > 0) { // Ignore transparent pixels
                            const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                            if (hex !== '#ffffff') { // Ignore white background if any
                                colorMap[hex] = (colorMap[hex] || 0) + 1;
                            }
                        }
                    }
                }
                const sortedColors = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);
                resolve(sortedColors.slice(0, 5).map(c => c[0]));
            })
            .on('error', reject);
    });
};

getDominantColors('src/assets/logo.png').then(console.log).catch(console.error);
