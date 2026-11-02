CREATE TABLE IF NOT EXISTS sales (module TEXT, views INTEGER, keys INTEGER, sold INTEGER, platform TEXT);
INSERT OR IGNORE INTO sales (module, views, keys, sold, platform) VALUES ('terminal', 1, 1, 1, 'forge')
INSERT OR IGNORE INTO sales (module, views, keys, sold, platform) VALUES ('terminal', 1, 1, 1, 'itch')
INSERT OR IGNORE INTO sales (module, views, keys, sold, platform) VALUES ('maps-in-cyberspace', 0, 0, 0, 'itch')

-- wrangler d1 execute foundry --command=""

