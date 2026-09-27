import mongoose from 'mongoose';
import { config } from './config';
import { Template } from './models/Template';

async function seed() {
  try {
    await mongoose.connect(config.mongoUri);
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
        title: 'ঈদ উৎসব (Eid Celebration) Joyful',
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
      },
      {
        title: 'দলীয় সমাবেশ ও রাজনৈতিক প্রচার (Political Rally)',
        occasionType: 'political_rally',
        thumbnailUrl: 'https://res.cloudinary.com/demo/image/upload/v1/thumbnail_rally.jpg',
        layoutConfig: {
          canvas: { width: 1200, height: 1600 },
          photoSlots: [
            { id: 'photo1', x: 150, y: 200, width: 400, height: 500, shape: 'cutout' },
            { id: 'photo2', x: 650, y: 200, width: 400, height: 500, shape: 'cutout' }
          ],
          textSlots: [
            { id: 'headline', x: 100, y: 50, maxWidth: 1000, maxChars: 35, fontFamily: 'Tiro Bangla', fontSize: 52, color: '#E11D48', role: 'headline' },
            { id: 'name', x: 100, y: 850, maxWidth: 800, maxChars: 25, fontFamily: 'Hind Siliguri', fontSize: 40, color: '#FFFFFF', role: 'name' },
            { id: 'designation', x: 100, y: 920, maxWidth: 800, maxChars: 30, fontFamily: 'Hind Siliguri', fontSize: 30, color: '#38BDF8', role: 'designation' }
          ],
          decoration: {
            baseAssets: ['rally_flag.png', 'crowd_silhouette.png'],
            colorSchemeOptions: ['#0F172A', '#E11D48', '#EAB308']
          }
        },
        isActive: true
      }
    ];

    await Template.deleteMany({}); // clear old seeds
    const created = await Template.insertMany(templates as any);
    console.log(`✅ Seeded ${created.length} templates`);
  } catch (err) {
    console.error('❌ Seed error', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected');
  }
}

seed();
