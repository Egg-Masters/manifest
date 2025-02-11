const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Initialize PostgreSQL connection pool
const pool = new Pool({
    user: 'your_database_user',
    host: 'localhost',  // Change this if you're using a remote DB
    database: 'your_database_name',
    password: 'your_database_password',
    port: 5432, // Default PostgreSQL port
});

// Middleware
app.use(bodyParser.json()); // To parse JSON request bodies

// Get Player Data
app.get('/player/:player_id', async (req, res) => {
    const playerId = req.params.player_id;

    try {
        const playerQuery = `SELECT * FROM players WHERE player_id = $1`;
        const playerResult = await pool.query(playerQuery, [playerId]);
        const player = playerResult.rows[0];

        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const spiderQuery = `SELECT * FROM spider_stats WHERE player_id = $1`;
        const spiderResult = await pool.query(spiderQuery, [playerId]);
        const spiderStats = spiderResult.rows[0];

        const genesQuery = `SELECT * FROM player_genes WHERE player_id = $1`;
        const genesResult = await pool.query(genesQuery, [playerId]);
        const genes = genesResult.rows[0];

        return res.json({
            player: player,
            spiderStats: spiderStats,
            genes: genes,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error loading player data' });
    }
});

// Save Player Data (new player or update)
app.post('/player', async (req, res) => {
    const { player_id, name, email, profile_picture, gems, feeders, items, level, exp, daily_redeem_code_claimed, event_progress, purchase_history, purchased_items, is_online, last_login, playtime, status_effects, language, sound_settings, notifications_enabled, email_verified, nickname, password, profile_updated, active_spider, spider_stats, breeding_cooldown, breeding_history, spider_collection, gene_type, gene_bonus } = req.body;

    try {
        // Insert/Update player information
        const playerQuery = `
            INSERT INTO players (
                player_id, name, email, profile_picture, gems, feeders, items, level, exp, 
                daily_redeem_code_claimed, event_progress, purchase_history, purchased_items, 
                is_online, last_login, playtime, status_effects, language, sound_settings, 
                notifications_enabled, email_verified, nickname, password, profile_updated
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
            ON CONFLICT (player_id) DO UPDATE 
            SET name = EXCLUDED.name, email = EXCLUDED.email, profile_picture = EXCLUDED.profile_picture,
                gems = EXCLUDED.gems, feeders = EXCLUDED.feeders, items = EXCLUDED.items,
                level = EXCLUDED.level, exp = EXCLUDED.exp, daily_redeem_code_claimed = EXCLUDED.daily_redeem_code_claimed,
                event_progress = EXCLUDED.event_progress, purchase_history = EXCLUDED.purchase_history,
                purchased_items = EXCLUDED.purchased_items, is_online = EXCLUDED.is_online,
                last_login = EXCLUDED.last_login, playtime = EXCLUDED.playtime, status_effects = EXCLUDED.status_effects,
                language = EXCLUDED.language, sound_settings = EXCLUDED.sound_settings, notifications_enabled = EXCLUDED.notifications_enabled,
                email_verified = EXCLUDED.email_verified, nickname = EXCLUDED.nickname, password = EXCLUDED.password,
                profile_updated = EXCLUDED.profile_updated`;

        await pool.query(playerQuery, [
            player_id, name, email, profile_picture, gems, feeders, items, level, exp, daily_redeem_code_claimed,
            event_progress, purchase_history, purchased_items, is_online, last_login, playtime, status_effects,
            language, sound_settings, notifications_enabled, email_verified, nickname, password, profile_updated
        ]);

        // Insert/Update spider stats
        const spiderQuery = `
            INSERT INTO spider_stats (player_id, active_spider, spider_health, spider_power, spider_level, 
                                      spider_experience, spider_hunger, spider_hydration, spider_luck, 
                                      spider_def, spider_atk, spider_agi, spider_attack, spider_agility, 
                                      spider_strength, spider_speed, breeding_cooldown, breeding_history, spider_collection)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
            ON CONFLICT (player_id) DO UPDATE
            SET active_spider = EXCLUDED.active_spider, spider_health = EXCLUDED.spider_health, 
                spider_power = EXCLUDED.spider_power, spider_level = EXCLUDED.spider_level,
                spider_experience = EXCLUDED.spider_experience, spider_hunger = EXCLUDED.spider_hunger, 
                spider_hydration = EXCLUDED.spider_hydration, spider_luck = EXCLUDED.spider_luck,
                spider_def = EXCLUDED.spider_def, spider_atk = EXCLUDED.spider_atk, spider_agi = EXCLUDED.spider_agi, 
                spider_attack = EXCLUDED.spider_attack, spider_agility = EXCLUDED.spider_agility,
                spider_strength = EXCLUDED.spider_strength, spider_speed = EXCLUDED.spider_speed,
                breeding_cooldown = EXCLUDED.breeding_cooldown, breeding_history = EXCLUDED.breeding_history, 
                spider_collection = EXCLUDED.spider_collection`;

        await pool.query(spiderQuery, [
            player_id, active_spider, spider_stats.spider_health, spider_stats.spider_power, spider_stats.spider_level, 
            spider_stats.spider_experience, spider_stats.spider_hunger, spider_stats.spider_hydration, spider_stats.spider_luck, 
            spider_stats.spider_def, spider_stats.spider_atk, spider_stats.spider_agi, spider_stats.spider_attack, 
            spider_stats.spider_agility, spider_stats.spider_strength, spider_stats.spider_speed, breeding_cooldown, 
            breeding_history, spider_collection
        ]);

        // Insert/Update gene data
        const geneQuery = `
            INSERT INTO player_genes (player_id, gene_type, gene_bonus)
            VALUES ($1, $2, $3)
            ON CONFLICT (player_id) DO UPDATE
            SET gene_type = EXCLUDED.gene_type, gene_bonus = EXCLUDED.gene_bonus`;

        await pool.query(geneQuery, [player_id, gene_type, gene_bonus]);

        return res.json({ message: 'Player data saved successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error saving player data' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
