"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config");
const Template_1 = __importDefault(require("./models/Template"));
async function seed() {
    try {
        await mongoose_1.default.connect(config_1.config.mongoUri);
        console.log('✅ Connected to MongoDB');
        const templates = [
            {
                title: 'বিজয় দিবস (Victory Day) Classic',
                occasionType: 'bijoy_dibosh',
                thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/thumbnail_bijoy.jpg',
                layoutConfig: {
                    canvas: { width: 1200, height: 1600 },
                    photoSlots: [
                        { id: 'photo1', x: 100, y: 200, width: 400, height: 500, shape: 'cutout' },
                        { id: 'photo2', x: 600, y: 200, width: 400, height: 500, shape: 'cutout' }
                    ],
                    textSlots: [
                        { id: 'headline', x: 100, y: 50, maxWidth: 1000, maxChars: 30, fontFamily: 'Tiro Bangla', fontSize: 48, color: '#0B6E4F', role: 'headline' },
                        { id: 'name', x: 100, y: 750, maxWidth: 800, maxChars: 20, fontFamily: 'Hind Siliguri', fontSize: 36, color: '#1A1A1A', role: 'name' },
                        { id: 'designation', x: 100, y: 800, maxWidth: 800, maxChars: 30, fontFamily: 'Hind Siliguri', fontSize: 28, color: '#4A4A4A', role: 'designation' }
                    ],
                    decoration: {
                        baseAssets: ['banner_victory.png', 'floral_border.png'],
                        colorSchemeOptions: ['#0B6E4F', '#D4A017']
                    }
                },
                isActive: true
            },
            {
                title: 'ইদ উত্সব (Eid Celebration) Joyful',
                occasionType: 'eid_utsob',
                thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/thumbnail_eid.jpg',
                layoutConfig: {
                    canvas: { width: 1200, height: 1600 },
                    photoSlots: [
                        { id: 'photo1', x: 350, y: 250, width: 500, height: 600, shape: 'circle' }
                    ],
                    textSlots: [
                        { id: 'headline', x: 100, y: 50, maxWidth: 1000, maxChars: 30, fontFamily: 'Tiro Bangla', fontSize: 48, color: '#C8102E', role: 'headline' },
                        { id: 'name', x: 100, y: 900, maxWidth: 800, maxChars: 20, fontFamily: 'Hind Siliguri', fontSize: 36, color: '#1A1A1A', role: 'name' },
                        { id: 'designation', x: 100, y: 950, maxWidth: 800, maxChars: 30, fontFamily: 'Hind Siliguri', fontSize: 28, color: '#4A4A4A', role: 'designation' }
                    ],
                    decoration: {
                        baseAssets: ['eid_moon.png', 'crescent_star.png'],
                        colorSchemeOptions: ['#C8102E', '#D4A017']
                    }
                },
                isActive: true
            }
        ];
        await Template_1.default.deleteMany({}); // clear old seeds
        const created = await Template_1.default.insertMany(templates);
        console.log(`✅ Seeded ${created.length} templates`);
    }
    catch (err) {
        console.error('❌ Seed error', err);
    }
    finally {
        await mongoose_1.default.disconnect();
        console.log('🔌 Disconnected');
    }
}
seed();
