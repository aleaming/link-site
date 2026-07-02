-- Batch 1: initial link inventory (61 launch platforms, directories, communities).
-- Generated from data/links-inbox.json on 2026-07-02.
-- Upsert semantics: re-running updates existing rows by unique url.

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Hot100.ai', 'Billboard-style ranking platform for AI builder projects', 'https://www.hot100.ai', (SELECT id FROM categories WHERE slug = 'ai-ml'), ARRAY['ai', 'ranking', 'showcase', 'builders'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Go Publicly', 'Discover, launch, and upvote indie projects', 'https://www.go-publicly.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'indie', 'upvote'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Reddit', 'Community platform with subreddits for every startup and developer niche', 'https://www.reddit.com', NULL, ARRAY['community', 'social', 'forums'], false, true, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('TechCrunch', 'Startup and technology news publication', 'https://techcrunch.com', NULL, ARRAY['news', 'startups', 'media'], false, true, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Product Hunt', 'The best new products in tech, launched and upvoted daily', 'https://www.producthunt.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'discovery', 'community'], false, true, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Hacker News', 'Y Combinator''s tech and startup news aggregator', 'https://news.ycombinator.com', NULL, ARRAY['community', 'news', 'startups'], false, true, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Wellfound', 'Startup job search and recruiting platform, formerly AngelList Talent', 'https://angel.co', NULL, ARRAY['jobs', 'startups', 'hiring'], false, true, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Dessign', 'Curated AI tools and software for designers, developers, and marketers', 'https://dessign.net', (SELECT id FROM categories WHERE slug = 'design'), ARRAY['ai', 'design', 'tools', 'directory'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Indie Hackers', 'Community of founders sharing the revenue, strategies, and stories behind their projects', 'https://indiehackers.com', NULL, ARRAY['community', 'indie', 'founders'], false, true, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('AlternativeTo', 'Crowdsourced directory of software alternatives', 'https://alternativeto.net', (SELECT id FROM categories WHERE slug = 'development'), ARRAY['software', 'alternatives', 'directory'], false, true, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Launched by Lovable', 'Launch showcase for products built with Lovable', 'https://launched.lovable.app', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'showcase', 'ai'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Startup Fame', 'Discover and showcase trending startups', 'https://startupfa.me', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['startups', 'discovery', 'showcase'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Dang AI', 'AI tools directory running since 2022', 'https://dang.ai', (SELECT id FROM categories WHERE slug = 'ai-ml'), ARRAY['ai', 'tools', 'directory'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('There''s An AI For That', 'Database of AI tools, searchable by the task you want to solve', 'https://theresanaiforthat.com', (SELECT id FROM categories WHERE slug = 'ai-ml'), ARRAY['ai', 'tools', 'directory', 'search'], false, true, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('BetaList', 'Discover and get early access to tomorrow''s startups', 'https://betalist.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['startups', 'beta', 'early-access'], false, true, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Twelve Tools', 'Showcase of new tools and products', 'https://twelve.tools', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['tools', 'discovery', 'showcase'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Fazier', 'Daily product discovery and launch platform', 'https://fazier.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'discovery', 'products'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('SaaSHub', 'Software alternatives, accelerators, and startup discovery', 'https://www.saashub.com', (SELECT id FROM categories WHERE slug = 'development'), ARRAY['saas', 'alternatives', 'directory'], false, true, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Alternative.me', 'Find better software alternatives by comparison', 'https://alternative.me', (SELECT id FROM categories WHERE slug = 'development'), ARRAY['software', 'alternatives', 'comparison'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('MagicBox.tools', 'AI tools directory listing over 20,000 tools', 'https://magicbox.tools', (SELECT id FROM categories WHERE slug = 'ai-ml'), ARRAY['ai', 'tools', 'directory'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('SideProjectors', 'Marketplace for buying and selling side projects', 'https://www.sideprojectors.com', NULL, ARRAY['marketplace', 'side-projects', 'indie'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Peerlist', 'Professional network for tech professionals and builders', 'https://peerlist.io', NULL, ARRAY['network', 'builders', 'portfolio'], false, true, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Startup Stash', 'Large directory of startup tools and resources', 'https://startupstash.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['startups', 'tools', 'directory'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('AiTools.inc', 'AI tools discovery and directory platform', 'https://aitools.inc', (SELECT id FROM categories WHERE slug = 'ai-ml'), ARRAY['ai', 'tools', 'directory'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Uneed', 'A launch platform for your products', 'https://www.uneed.best', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'discovery', 'indie'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Turbo0', 'Directory of popular content-creation products', 'https://turbo0.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['content-creation', 'directory', 'tools'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('PitchWall', 'Startup pitch and product launch community', 'https://pitchwall.co', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'startups', 'pitch'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Future Tools', 'Curated collection of AI tools, organized and searchable', 'https://www.futuretools.io', (SELECT id FROM categories WHERE slug = 'ai-ml'), ARRAY['ai', 'tools', 'directory'], false, true, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('PeerPush', 'Community-driven product discovery for build-in-public makers', 'https://peerpush.net', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['community', 'discovery', 'build-in-public'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('AI With Me', 'Discover thousands of AI tools', 'https://aiwith.me', (SELECT id FROM categories WHERE slug = 'ai-ml'), ARRAY['ai', 'tools', 'directory'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('TinyLaunch', 'Simple product launch platform for makers', 'https://www.tinylaun.ch', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'indie', 'makers'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('ToolsFine', 'AI tools directory for internet workers', 'https://toolsfine.com', (SELECT id FROM categories WHERE slug = 'ai-ml'), ARRAY['ai', 'tools', 'directory'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('DevHunt', 'The best new dev tools every day, voted by developers', 'https://devhunt.org', (SELECT id FROM categories WHERE slug = 'development'), ARRAY['devtools', 'launch', 'discovery'], false, true, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('StartupBase', 'Community for makers and early adopters to share products', 'https://startupbase.io', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['startups', 'community', 'discovery'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Firsto', 'Launch platform where every product gets seen, with daily featuring', 'https://firsto.co', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'discovery', 'indie'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('MkDirs', 'Directory website boilerplate for launching your own directory', 'https://free.mkdirs.com', (SELECT id FROM categories WHERE slug = 'development'), ARRAY['boilerplate', 'directory', 'templates'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('MicroLaunch', 'Launch platform for tech products, with deals for early adopters', 'https://microlaunch.net', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'deals', 'products'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Launching Next', 'Directory of upcoming startups and new product launches', 'https://www.launchingnext.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['startups', 'launch', 'directory'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Indie Deals', 'Curated indie software and app deals', 'https://www.indie.deals', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['deals', 'indie', 'software'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Tiny Startups', 'Launch platform for tiny startups and side projects', 'https://tinystartups.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'startups', 'side-projects'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('ProductBurst', 'Product launch and discovery platform', 'https://productburst.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'discovery', 'products'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('MakerThrive', 'Vibe-coding community for creators', 'https://makerthrive.com', NULL, ARRAY['community', 'makers', 'vibe-coding'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('LeaksAPI', 'API for checking data-breach exposure', 'https://leaksapi.com', (SELECT id FROM categories WHERE slug = 'security'), ARRAY['api', 'security', 'breach-monitoring'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('OpenAlternative', 'Open-source alternatives to popular software', 'https://openalternative.co', (SELECT id FROM categories WHERE slug = 'development'), ARRAY['open-source', 'alternatives', 'directory'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('AI Directories', 'Submit your AI tool to many directories in one place', 'https://www.aidirectori.es', (SELECT id FROM categories WHERE slug = 'ai-ml'), ARRAY['ai', 'submission', 'directories'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Promote Project', 'Promote your startup and discover new projects', 'https://www.promoteproject.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['promotion', 'startups', 'discovery'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('IdeaKiln', 'Validate ideas and build with community feedback', 'https://ideakiln.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['validation', 'community', 'feedback'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('SoloPush', 'Product Hunt alternative for indie makers', 'https://solopush.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'indie', 'makers'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('aitools.fyi', 'Find the best AI tools to make your life easy', 'https://aitools.fyi', (SELECT id FROM categories WHERE slug = 'ai-ml'), ARRAY['ai', 'tools', 'directory'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('SteemHunt', 'Blockchain-based product discovery community', 'https://steemhunt.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['products', 'discovery', 'crypto'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('findly.tools', 'Tool discovery platform, all in one place', 'https://findly.tools', (SELECT id FROM categories WHERE slug = 'development'), ARRAY['tools', 'discovery', 'directory'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Open Launch', 'Discover the best tech products at launch', 'https://open-launch.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'discovery', 'products'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Scout Forge', 'AI-powered unbiased product review platform', 'https://scoutforge.net', (SELECT id FROM categories WHERE slug = 'ai-ml'), ARRAY['reviews', 'ai', 'products'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Resource.fyi', 'Products, tools, and resources for developers and designers', 'https://resource.fyi', (SELECT id FROM categories WHERE slug = 'development'), ARRAY['resources', 'devtools', 'design'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('SubmitHunt', 'Submit your startup — a Product Hunt alternative', 'https://www.submithunt.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'submission', 'startups'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('RankYourAI', 'AI tools directory and discovery platform', 'https://rankyourai.com', (SELECT id FROM categories WHERE slug = 'ai-ml'), ARRAY['ai', 'tools', 'directory'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('IndieHub', 'All-in-one directory for indie makers to discover tools and launch products', 'https://indiehub.best', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['indie', 'directory', 'launch'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('LaunchIgniter', 'Product launch platform with community feedback', 'https://launchigniter.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['launch', 'community', 'feedback'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Micro SaaS Examples', 'Directory of micro-SaaS examples for inspiration', 'https://www.microsaasexamples.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['saas', 'examples', 'inspiration'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('New Startups', 'Startup launchpad and directory', 'https://new-startups.com', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['startups', 'launch', 'directory'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

INSERT INTO links (title, description, url, category_id, tags, featured, verified, status)
VALUES ('Startups.fm', 'Share and discover exceptional early-stage startups', 'https://startups.fm', (SELECT id FROM categories WHERE slug = 'marketing'), ARRAY['startups', 'discovery', 'early-stage'], false, false, 'approved')
ON CONFLICT (url) DO UPDATE SET
  title = EXCLUDED.title, description = EXCLUDED.description,
  category_id = EXCLUDED.category_id, tags = EXCLUDED.tags,
  featured = EXCLUDED.featured, verified = EXCLUDED.verified, status = EXCLUDED.status;

