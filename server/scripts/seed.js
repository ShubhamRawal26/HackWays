require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { query, initDB } = require('../config/db');

const seedData = async () => {
  try {
    console.log('Initializing PostgreSQL database schema...');
    await initDB();

    console.log('Clearing existing tables...');
    await query(`
      TRUNCATE TABLE
        users, admins, events, registrations,
        problem_statements, idea_submissions, prototype_submissions, otps
      RESTART IDENTITY CASCADE;
    `);

    // 1. Create Super Admins (Official Assigned Gmail Accounts)
    const SUPER_ADMINS = [
      { name: 'Shubham (Super Admin)', email: 'discountbuddyshubham@gmail.com' },
      { name: 'Suresh CIT (Super Admin)', email: 'sureshcitabu@gmail.com' },
      { name: 'Mayank (Super Admin)', email: 'tmgmayankff@gmail.com' },
    ];

    for (const sa of SUPER_ADMINS) {
      await query(
        `INSERT INTO admins (name, email, role, created_by)
         VALUES ($1, $2, 'superadmin', 'system-rule')
         ON CONFLICT (email) DO NOTHING`,
        [sa.name, sa.email.toLowerCase().trim()]
      );
      console.log(`✓ Super Admin account verified: ${sa.email}`);
    }

    // 3. Create Sample Events
    const now = new Date();

    // Event 1: Ongoing Flagship Hackathon
    const event1Desc = `Welcome to InnovateX Global Hackathon 2026! Join over 500+ developers, designers, and innovators to build groundbreaking solutions.

### Event Guidelines:
- Team size: 1 to 4 members.
- Choose one official problem statement from the released list.
- Stage 1: Submit your Idea Proposal (problem approach, architecture, tech stack).
- Stage 2: Submit your working prototype (live URL, GitHub repo, or demo video).

### Evaluation Criteria:
1. Innovation & Originality (30%)
2. Technical Feasibility & Architecture (30%)
3. Impact & Usability (25%)
4. Presentation & Completeness (15%)`;

    const event1Rules = JSON.stringify([
      'All work must be developed during the hackathon timeline.',
      'Open-source libraries and APIs are permitted with appropriate attribution.',
      'Plagiarism or pre-built complete solutions will lead to disqualification.',
    ]);

    const event1Prizes = JSON.stringify([
      { position: '1st Place Winner', amount: '$5,000', perks: 'Incubation Grant + Cloud Credits' },
      { position: '2nd Place Runner-Up', amount: '$2,500', perks: 'Mentorship + Hardware Kits' },
      { position: 'Best Community Impact', amount: '$1,000', perks: 'Fast-track Interview Opportunities' },
    ]);

    const { rows: e1Rows } = await query(
      `INSERT INTO events (
        title, short_description, description, banner_image, category, venue, mode,
        start_date, end_date, time, status, registration_open, registration_deadline, max_team_size,
        rules, prizes, ps_release_time, ps_released_manual, prototype_open_time, prototype_close_time, prototype_manual_override
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        'InnovateX Global Hackathon 2026',
        '48-hour innovation sprint tackling real-world sustainability, AI, and healthcare challenges.',
        event1Desc,
        'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        'Hackathon',
        'Main Tech Campus & Online Discord',
        'Hybrid',
        new Date(now.getTime() - 2 * 86400000),
        new Date(now.getTime() + 3 * 86400000),
        '09:00 AM - 06:00 PM',
        'Ongoing',
        true,
        new Date(now.getTime() + 1 * 86400000),
        4,
        event1Rules,
        event1Prizes,
        new Date(now.getTime() - 86400000), // PS released yesterday
        true,
        new Date(now.getTime() - 43200000), // Opened 12h ago
        new Date(now.getTime() + 86400000), // Closes in 24h
        false,
      ]
    );

    // Event 2: Upcoming Ideathon
    const event2Desc = `The EcoTech Smart City Ideathon invites visionary thinkers to architect sustainable technologies for modern cities.

### Key Focus Areas:
- Renewable energy monitoring and microgrid balancing
- Decentralized waste segregation and collection logistics
- Air quality indexing and predictive alert systems`;

    const event2Rules = JSON.stringify([
      'Open to university students and early-stage professionals.',
      'Presentations must follow the official 10-slide template.',
    ]);

    const event2Prizes = JSON.stringify([
      { position: 'Grand Prize', amount: '$3,000', perks: 'Pilot deployment with city council' },
      { position: 'Runner Up', amount: '$1,500', perks: 'Industry partner swag pack' },
    ]);

    const { rows: e2Rows } = await query(
      `INSERT INTO events (
        title, short_description, description, banner_image, category, venue, mode,
        start_date, end_date, time, status, registration_open, registration_deadline, max_team_size,
        rules, prizes, ps_release_time, ps_released_manual, prototype_open_time, prototype_close_time, prototype_manual_override
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
      RETURNING *`,
      [
        'EcoTech Smart City Ideathon',
        'Design smart environmental monitoring and waste management solutions for urban centers.',
        event2Desc,
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        'Ideathon',
        'Virtual Platform',
        'Online',
        new Date(now.getTime() + 5 * 86400000),
        new Date(now.getTime() + 7 * 86400000),
        '10:00 AM - 04:00 PM',
        'Upcoming',
        true,
        new Date(now.getTime() + 4 * 86400000),
        3,
        event2Rules,
        event2Prizes,
        new Date(now.getTime() + 4 * 86400000), // Releases in 4 days
        false,
        new Date(now.getTime() + 5 * 86400000),
        new Date(now.getTime() + 7 * 86400000),
        false,
      ]
    );

    // Event 3: Completed Tech Summit
    await query(
      `INSERT INTO events (
        title, short_description, description, banner_image, category, venue, mode,
        start_date, end_date, time, status, registration_open, max_team_size,
        rules, prizes, ps_release_time, ps_released_manual, prototype_open_time, prototype_close_time, prototype_manual_override
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING *`,
      [
        'Cloud & AI Developer Summit 2025',
        'Annual developer conference featuring keynote speakers, live workshops, and coding challenges.',
        'The premier annual summit exploring large language models, cloud native infrastructure, and distributed systems.',
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
        'Conference',
        'Convention Center, Hall A',
        'Offline',
        new Date(now.getTime() - 30 * 86400000),
        new Date(now.getTime() - 28 * 86400000),
        '09:00 AM - 05:00 PM',
        'Completed',
        false,
        1,
        JSON.stringify(['Adhere to the event code of conduct.']),
        JSON.stringify([]),
        new Date(now.getTime() - 30 * 86400000),
        true,
        new Date(now.getTime() - 30 * 86400000),
        new Date(now.getTime() - 28 * 86400000),
        false,
      ]
    );

    // 4. Create Problem Statements for Event 1
    await query(
      `INSERT INTO problem_statements (event_id, ps_code, title, description, category, difficulty)
       VALUES
       ($1, 'PS-AI-101', 'Autonomous Multi-Modal Healthcare Diagnostic Assistant',
        'Design an intelligent clinical decision support system that analyzes patient vitals, medical history, and clinical notes to generate differential diagnoses while highlighting confidence metrics and clinical justifications.',
        'AI & Healthcare', 'Hard'),
       ($1, 'PS-SUS-102', 'Decentralized Carbon Offset Tracker and Verification Engine',
        'Develop a transparent carbon ledger application for enterprises to track emission telemetry, verify renewable energy credits, and audit supply chain offsets with tamper-evident proof.',
        'Sustainability & Web3', 'Medium'),
       ($1, 'PS-ED-103', 'Gamified Adaptive Learning Platform for Neurodiverse Students',
        'Build an interactive web experience that adapts lesson pacing, sensory elements, and micro-assessments based on student engagement patterns and attention feedback.',
        'EdTech & Accessibility', 'Easy')`,
      [e1Rows[0].id]
    );

    // Problem Statement for Event 2
    await query(
      `INSERT INTO problem_statements (event_id, ps_code, title, description, category, difficulty)
       VALUES
       ($1, 'PS-SMART-201', 'Real-Time Urban Flood Risk Prediction and Route Optimization',
        'Construct a map-based dashboard predicting localized street flooding during extreme weather events and redirecting emergency services through safe municipal corridors.',
        'Smart Cities', 'Medium')`,
      [e2Rows[0].id]
    );

    console.log('✓ Problem statements seeded.');
    console.log('\n=============================================');
    console.log('🎉 PostgreSQL Database Seeding Complete!');
    console.log(`Admin Email:    ${adminEmail}`);
    console.log(`Admin Password: ${adminPassword}`);
    console.log('=============================================\n');

    if (require.main === module) {
      process.exit(0);
    }
    return { success: true, adminEmail, adminPassword };
  } catch (err) {
    console.error('PostgreSQL Seed Error:', err);
    if (require.main === module) {
      process.exit(1);
    }
    throw err;
  }
};

if (require.main === module) {
  seedData();
}

module.exports = { seedData };
