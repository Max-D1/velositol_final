import { readFile, writeFile, mkdir, rm, copyFile, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');
const readJson = async (file) => JSON.parse(await readFile(path.join(root, 'content', file), 'utf8'));
const site = await readJson('site.json');
const topics = await readJson('topics.json');
const articles = await readJson('articles.json');
const topicMap = Object.fromEntries(topics.map((topic) => [topic.slug, topic]));

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, 'assets'), { recursive: true });
await mkdir(path.join(dist, 'articles'), { recursive: true });
await mkdir(path.join(dist, 'topics'), { recursive: true });
await copyFile(path.join(root, 'src', 'styles.css'), path.join(dist, 'assets', 'styles.css'));
await copyFile(path.join(root, 'src', 'app.js'), path.join(dist, 'assets', 'app.js'));
await cp(path.join(root, 'public'), dist, { recursive: true, force: true });

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const formatDate = (value) => new Intl.DateTimeFormat('en-US', {
  month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'
}).format(new Date(`${value}T00:00:00Z`));

const brandIdentity = () => site.logo
  ? `<img class="brand-logo" src="${escapeHtml(site.logo)}" alt="${escapeHtml(site.logoAlt || `${site.name} logo`)}">`
  : `<span class="brand-mark" aria-hidden="true">${escapeHtml(site.shortName?.charAt(0) || 'V')}</span>`;

const addressHtml = () => Array.isArray(site.addressLines)
  ? site.addressLines.filter(Boolean).map((line) => `<span>${escapeHtml(line)}</span>`).join('')
  : '';

const nav = (active = '') => `
<header class="site-header">
  <div class="utility-bar">
    <div class="shell utility-inner">
      <span>Evidence-aware health education</span>
      <a href="/editorial-policy">Editorial standards</a>
    </div>
  </div>
  <div class="shell nav-row">
    <a class="brand" href="/" aria-label="${escapeHtml(site.name)} home">
      ${brandIdentity()}
      ${site.showSiteName === false ? '' : `<span>${escapeHtml(site.name)}</span>`}
    </a>
    <nav class="desktop-nav" aria-label="Primary navigation">
      <a class="${active === 'home' ? 'active' : ''}" href="/">Home</a>
      <a class="${active === 'topics' ? 'active' : ''}" href="/topics">Topics</a>
      <a class="${active === 'about' ? 'active' : ''}" href="/about">About us</a>
    </nav>
    <div class="nav-actions">
      <a class="search-link" href="/topics#search" aria-label="Search articles">Search</a>
      <button class="menu-button" type="button" aria-expanded="false" aria-controls="mobile-menu" data-menu-button>
        <span></span><span></span><span></span><span class="sr-only">Open menu</span>
      </button>
    </div>
  </div>
  <nav class="mobile-menu shell" id="mobile-menu" aria-label="Mobile navigation" data-mobile-menu hidden>
    <a href="/">Home</a><a href="/topics">Topics</a><a href="/about">About us</a><a href="/editorial-policy">Editorial standards</a>
  </nav>
</header>`;

const footer = () => `
<footer class="site-footer">
  <div class="shell footer-grid">
    <div>
      <a class="brand brand-footer" href="/">${brandIdentity()}${site.showSiteName === false ? '' : `<span>${escapeHtml(site.name)}</span>`}</a>
      <p>${escapeHtml(site.tagline)}</p>
    </div>
    <div><h2>Explore</h2><a href="/topics">All topics</a><a href="/topics/velositol-guides">Velositol guides</a><a href="/topics/protein-nutrition">Protein nutrition</a></div>
    <div><h2>Standards</h2><a href="/about">About us</a><a href="/editorial-policy">Editorial policy</a><a href="/medical-disclaimer">Medical disclaimer</a></div>
    <div><h2>Contact</h2><a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a>${site.phone ? `<a href="tel:${escapeHtml(site.phone.replaceAll(' ', ''))}">${escapeHtml(site.phone)}</a>` : ''}${addressHtml() ? `<address>${addressHtml()}</address>` : ''}<p class="small">${escapeHtml(site.contactNote || 'For corrections, source questions, and editorial inquiries.')}</p></div>
  </div>
  <div class="shell footer-bottom">
    <p>© ${new Date().getUTCFullYear()} ${escapeHtml(site.name)}. For educational purposes only.</p>
    <p>${escapeHtml(site.relationshipNote)}</p>
  </div>
</footer>`;

const baseHead = ({ title, description, canonical = '/', image = site.socialImage || '/assets/og-default.svg', type = 'website', jsonLd = null }) => `
<!doctype html>
<html lang="${escapeHtml(site.language)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(site.url + canonical)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:type" content="${escapeHtml(type)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(site.url + canonical)}">
  <meta property="og:image" content="${escapeHtml(site.url + image)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/styles.css">
  ${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replaceAll('<', '\\u003c')}</script>` : ''}
  <script>
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  </script>
  <script defer src="/_vercel/insights/script.js"></script>
</head>`;

const page = ({ title, description, canonical, active, content, type, jsonLd, image }) => `${baseHead({ title, description, canonical, type, jsonLd, image })}
<body>${nav(active)}<main>${content}</main>${footer()}<script src="/assets/app.js" defer></script></body></html>`;

const articleImage = (image, className, { eager = false } = {}) => {
  if (!image?.enabled || !image.src) return '';
  const caption = image.caption ? `<figcaption>${escapeHtml(image.caption)}${image.credit ? ` <span class="image-credit">${escapeHtml(image.credit)}</span>` : ''}</figcaption>` : '';
  return `<figure class="${className}">
    <img src="${escapeHtml(image.src)}" alt="${escapeHtml(image.alt || '')}" width="${Number(image.width) || 1200}" height="${Number(image.height) || 800}" loading="${eager ? 'eager' : 'lazy'}" decoding="async" style="object-position:${escapeHtml(image.objectPosition || 'center')}">
    ${caption}
  </figure>`;
};

const articleCard = (article, { large = false } = {}) => {
  const topic = topicMap[article.topic];
  const hasImage = article.featuredImage?.enabled && article.featuredImage?.src;
  const art = hasImage
    ? `<img class="card-image" src="${escapeHtml(article.featuredImage.src)}" alt="${escapeHtml(article.featuredImage.alt || '')}" width="${Number(article.featuredImage.width) || 1200}" height="${Number(article.featuredImage.height) || 800}" loading="lazy" decoding="async" style="object-position:${escapeHtml(article.featuredImage.objectPosition || 'center')}">`
    : `<span class="art-orbit"></span><span class="art-pill">${escapeHtml(topic.icon)}</span><span class="art-lines"></span>`;
  return `<article class="article-card ${large ? 'article-card-large' : ''}" data-search-card>
    <a class="card-art accent-${escapeHtml(article.accent)} ${hasImage ? 'has-photo' : ''}" href="/articles/${escapeHtml(article.slug)}" aria-label="Read ${escapeHtml(article.title)}">
      ${art}
    </a>
    <div class="card-copy">
      <a class="topic-label" href="/topics/${escapeHtml(topic.slug)}">${escapeHtml(topic.name)}</a>
      <h3><a href="/articles/${escapeHtml(article.slug)}">${escapeHtml(article.title)}</a></h3>
      <p>${escapeHtml(article.dek)}</p>
      <div class="card-meta"><span>${escapeHtml(article.readTime)}</span><span>Updated ${escapeHtml(formatDate(article.modified))}</span></div>
    </div>
  </article>`;
};

const topicTile = (topic) => `<a class="topic-tile accent-${escapeHtml(topic.accent)}" href="/topics/${escapeHtml(topic.slug)}">
  <span class="topic-icon">${escapeHtml(topic.icon)}</span>
  <span class="eyebrow">${escapeHtml(topic.eyebrow)}</span>
  <h3>${escapeHtml(topic.name)}</h3>
  <p>${escapeHtml(topic.description)}</p>
  <span class="text-link">Explore topic <span aria-hidden="true">→</span></span>
</a>`;

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: site.name,
  url: site.url,
  logo: `${site.url}${site.logo || '/assets/favicon.svg'}`,
  ...(Array.isArray(site.addressLines) && site.addressLines.some(Boolean) ? { address: site.addressLines.filter(Boolean).join(', ') } : {}),
  description: site.description
};

const featured = articles.filter((article) => article.featured);
const latest = [...articles].sort((a, b) => b.modified.localeCompare(a.modified));

const homeContent = `
<section class="hero">
  <div class="shell hero-grid">
    <div class="hero-copy">
      <span class="kicker">${escapeHtml(site.homeKicker || 'Protein nutrition, made clearer')}</span>
      <h1>${(site.homeTitleLines || ['Understand the label.', 'Question the claim.', 'Build a simpler routine.']).map((line) => escapeHtml(line)).join('<br>')}</h1>
      <p>${escapeHtml(site.description)}</p>
      <div class="button-row"><a class="button button-primary" href="/topics">Explore health topics</a><a class="button button-secondary" href="/about">How we work</a></div>
      <div class="trust-row"><span>Research-informed</span><span>Written for clarity</span><span>Sources cited</span></div>
    </div>
<div class="hero-image-wrap">
  <img
    class="hero-image"
    src="/images/home/hero-velositol.webp"
    alt="Velositol ingredient and protein nutrition illustration"
    width="1200"
    height="1000"
  >
</div>
  </div>
</section>
<section class="section section-white">
  <div class="shell">
    <div class="section-heading"><div><span class="eyebrow">Start here</span><h2>Featured guides</h2></div><a class="text-link" href="/topics">View all articles →</a></div>
    <div class="featured-grid">${featured.map((article, index) => articleCard(article, { large: index === 0 })).join('')}</div>
  </div>
</section>
<section class="section section-tint">
  <div class="shell">
    <div class="section-heading"><div><span class="eyebrow">Browse by subject</span><h2>Explore health topics</h2></div></div>
    <div class="topic-grid">${topics.map(topicTile).join('')}</div>
  </div>
</section>
<section class="section section-white">
  <div class="shell editorial-promise">
    <div><span class="eyebrow">Why trust this site?</span><h2>Useful context before conclusions</h2><p>We separate ingredient education from product marketing, show publication and update dates, link to source material, and avoid presenting educational content as medical advice.</p><a class="button button-secondary" href="/editorial-policy">Read our editorial policy</a></div>
    <div class="promise-list"><div><span>01</span><h3>Transparent sourcing</h3><p>References appear with the articles they support.</p></div><div><span>02</span><h3>Careful language</h3><p>We distinguish study findings from broad consumer outcomes.</p></div><div><span>03</span><h3>Visible corrections</h3><p>Material changes update the reviewed date.</p></div></div>
  </div>
</section>`;

await writeFile(path.join(dist, 'index.html'), page({
  title: `${site.name} | Protein Nutrition & Supplement Literacy`, description: site.description,
  canonical: '/', active: 'home', content: homeContent, jsonLd: organizationSchema
}));

const topicsContent = `
<section class="page-hero compact"><div class="shell narrow"><span class="kicker">Topic library</span><h1>Explore every guide</h1><p>Browse practical explainers on Velositol, protein nutrition, supplement labels, and how to interpret research.</p></div></section>
<section class="section section-white"><div class="shell">
  <div class="topic-grid topic-grid-library">${topics.map(topicTile).join('')}</div>
  <div class="search-panel" id="search"><label for="article-search">Search article titles and summaries</label><div class="search-box"><input id="article-search" type="search" placeholder="Try “label,” “protein,” or “capsules”" data-search-input="article-results"><span aria-hidden="true">⌕</span></div></div>
  <div class="article-list-grid" id="article-results">${latest.map((article) => articleCard(article)).join('')}<p class="empty-state" data-search-empty hidden>No matching articles found.</p></div>
</div></section>`;

await writeFile(path.join(dist, 'topics.html'), page({
  title: `Health Topics | ${site.name}`, description: 'Browse all Velositol.co health education topics and articles.',
  canonical: '/topics', active: 'topics', content: topicsContent
}));

for (const topic of topics) {
  const topicArticles = latest.filter((article) => article.topic === topic.slug);
  const content = `<section class="topic-hero accent-${escapeHtml(topic.accent)}"><div class="shell topic-hero-grid"><div><span class="kicker">${escapeHtml(topic.eyebrow)}</span><h1>${escapeHtml(topic.name)}</h1><p>${escapeHtml(topic.description)}</p></div><div class="topic-hero-icon">${escapeHtml(topic.icon)}</div></div></section>
  <section class="section section-white"><div class="shell"><div class="section-heading"><div><span class="eyebrow">${topicArticles.length} articles</span><h2>Latest in ${escapeHtml(topic.name)}</h2></div></div><div class="article-list-grid">${topicArticles.map((article) => articleCard(article)).join('') || '<p>No articles have been published in this topic yet.</p>'}</div></div></section>`;
  await writeFile(path.join(dist, 'topics', `${topic.slug}.html`), page({
    title: `${topic.name} | ${site.name}`, description: topic.description,
    canonical: `/topics/${topic.slug}`, active: 'topics', content
  }));
}

const renderBlock = (block) => {
  if (block.enabled === false) return '';
  if (block.type === 'lead') return `<p class="article-lead">${block.html}</p>`;
  if (block.type === 'h2') return `<h2>${block.html}</h2>`;
  if (block.type === 'p') return `<p>${block.html}</p>`;
  if (block.type === 'ul') return `<ul>${block.items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
  if (block.type === 'callout') return `<aside class="article-callout"><strong>${block.title}</strong><p>${block.html}</p></aside>`;
  if (block.type === 'comparison') return `<div class="comparison"><div><h3>${block.leftTitle}</h3><ul>${block.leftItems.map((item) => `<li>${item}</li>`).join('')}</ul></div><div><h3>${block.rightTitle}</h3><ul>${block.rightItems.map((item) => `<li>${item}</li>`).join('')}</ul></div></div>`;
  if (block.type === 'image') return articleImage(block, 'article-content-image');
  return '';
};

for (const article of articles) {
  const topic = topicMap[article.topic];
  const related = latest.filter((item) => item.slug !== article.slug && (item.topic === article.topic || item.featured)).slice(0, 3);
  const schemaImagePath = article.featuredImage?.enabled && article.featuredImage?.src
    ? article.featuredImage.src
    : '/assets/og-default.svg';
  const socialImagePath = article.socialImage?.enabled && article.socialImage?.src
    ? article.socialImage.src
    : schemaImagePath;
  const articleSchema = {
    '@context': 'https://schema.org', '@type': 'Article', headline: article.title,
    description: article.dek, datePublished: article.published, dateModified: article.modified,
    author: { '@type': 'Organization', name: article.author },
    publisher: { '@type': 'Organization', name: site.name, url: site.url, logo: { '@type': 'ImageObject', url: `${site.url}${site.logo || '/assets/favicon.svg'}` } },
    mainEntityOfPage: `${site.url}/articles/${article.slug}`, image: `${site.url}${schemaImagePath}`
  };
  const heroVisual = article.featuredImage?.enabled && article.featuredImage?.src
    ? articleImage(article.featuredImage, 'article-hero-image', { eager: true })
    : `<div class="article-hero-art accent-${escapeHtml(article.accent)}" aria-hidden="true"><span class="art-orbit"></span><span class="art-pill">${escapeHtml(topic.icon)}</span><span class="art-lines"></span></div>`;
  const sourceItems = (article.sources || []).map((source) => source.url
    ? `<li><a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.label)}</a></li>`
    : `<li>${escapeHtml(source.label)}</li>`
  ).join('');
  const content = `<article>
    <header class="article-header"><div class="shell article-header-grid"><div><a class="topic-label" href="/topics/${escapeHtml(topic.slug)}">${escapeHtml(topic.name)}</a><h1>${escapeHtml(article.title)}</h1><p class="dek">${escapeHtml(article.dek)}</p><div class="byline"><span>By ${escapeHtml(article.author)}</span><span>${escapeHtml(article.reviewStatus)}</span><span>Updated ${escapeHtml(formatDate(article.modified))}</span><span>${escapeHtml(article.readTime)}</span></div></div>${heroVisual}</div></header>
    <div class="shell article-layout"><div class="article-body">${article.body.map(renderBlock).join('')}
      ${sourceItems ? `<section class="sources"><h2>Sources and references</h2><ol>${sourceItems}</ol></section>` : ''}
      <aside class="medical-note"><strong>Medical note</strong><p>This article is for general educational purposes and does not provide medical advice, diagnosis, or treatment. Speak with a qualified healthcare professional about individual health questions and supplement use.</p></aside>
    </div><aside class="article-sidebar"><div class="sidebar-box"><span class="eyebrow">In this article</span>${article.body.filter((block) => block.type === 'h2').map((block) => `<span>${block.html}</span>`).join('')}</div><div class="sidebar-box"><strong>How we review</strong><p>Articles show their source list, publication date, and most recent update.</p><a href="/editorial-policy">Editorial policy →</a></div></aside></div>
  </article>
  <section class="section section-tint"><div class="shell"><div class="section-heading"><div><span class="eyebrow">Continue reading</span><h2>Related guides</h2></div></div><div class="article-list-grid">${related.map((item) => articleCard(item)).join('')}</div></div></section>`;
  await writeFile(path.join(dist, 'articles', `${article.slug}.html`), page({
    title: `${article.seoTitle || article.title} | ${site.name}`, description: article.dek,
    canonical: `/articles/${article.slug}`, active: 'topics', content, type: 'article',
    jsonLd: articleSchema, image: socialImagePath
  }));
}

const aboutParagraphs = (site.aboutPurposeParagraphs || [
  `Supplement content often moves quickly from a study result to a buying conclusion. ${site.name} slows that process down. We explain what an ingredient is, how a product format works, what a label discloses, and which questions remain unanswered.`,
  'Our content is educational. It is not individualized medical advice and should not replace care from a qualified healthcare professional.'
]).map((text) => `<p>${escapeHtml(text)}</p>`).join('');
const aboutContent = `<section class="page-hero"><div class="shell narrow"><span class="kicker">About ${escapeHtml(site.name)}</span><h1>${escapeHtml(site.aboutHeading || 'Health information should be useful before it is persuasive.')}</h1><p>${escapeHtml(site.aboutIntro || 'We publish plain-language education about protein nutrition, supplement formats, branded ingredients, and research interpretation.')}</p></div></section>
<section class="section section-white"><div class="shell prose-grid"><div><span class="eyebrow">Our purpose</span><h2>${escapeHtml(site.aboutPurposeTitle || 'Help readers ask better questions')}</h2>${aboutParagraphs}</div><div class="values-card"><h3>What readers can expect</h3><ul><li>Clear publication and update dates</li><li>Source lists attached to relevant articles</li><li>Plain disclosure of commercial relationships</li><li>No invented medical-review credentials</li><li>Corrections when material facts change</li></ul></div></div></section>
<section class="section section-tint"><div class="shell prose-grid"><div><span class="eyebrow">Trademark and relationship disclosure</span><h2>Before publishing this website</h2><p>${escapeHtml(site.relationshipNote)}</p><p>This text is controlled in <code>content/site.json</code>. Change the <code>relationship</code> and <code>relationshipNote</code> fields only after the site owner has documented the correct relationship with the trademark owner.</p></div><div><span class="eyebrow">Contact</span><h2>Corrections and editorial questions</h2><p>Email <a href="mailto:${escapeHtml(site.email)}">${escapeHtml(site.email)}</a>.</p>${site.phone ? `<p>Phone: <a href="tel:${escapeHtml(site.phone.replaceAll(' ', ''))}">${escapeHtml(site.phone)}</a></p>` : ''}${addressHtml() ? `<address class="about-address">${addressHtml()}</address>` : ''}<p>${escapeHtml(site.contactNote || 'Include the article URL, the sentence in question, and a primary source where possible.')}</p></div></div></section>`;
await writeFile(path.join(dist, 'about.html'), page({ title: `About Us | ${site.name}`, description: `Learn how ${site.name} approaches health education, sourcing, corrections, and trademark disclosure.`, canonical: '/about', active: 'about', content: aboutContent }));

const policyContent = `<section class="page-hero compact"><div class="shell narrow"><span class="kicker">Editorial standards</span><h1>How we create and update content</h1><p>A practical policy for sourcing, claims, authorship, corrections, and commercial separation.</p></div></section><section class="section section-white"><div class="shell policy-layout"><nav class="policy-nav"><a href="#scope">Scope</a><a href="#sources">Sources</a><a href="#claims">Claims</a><a href="#review">Review</a><a href="#corrections">Corrections</a></nav><div class="article-body policy-body"><h2 id="scope">Scope</h2><p>We publish general educational content about nutrition, supplements, product formats, labels, and research literacy. We do not diagnose conditions or recommend that readers start, stop, or replace medical treatment.</p><h2 id="sources">Source selection</h2><p>Priority is given to government health agencies, peer-reviewed research, academic institutions, recognized professional organizations, and official ingredient documentation when describing a branded ingredient. Commercial sources are identified and not treated as independent clinical guidance.</p><h2 id="claims">Claims language</h2><p>We distinguish between what a study measured, what an ingredient supplier states, and what can reasonably be concluded for consumers. Disease-treatment language is not used to market dietary supplements.</p><h2 id="review">Authorship and review</h2><p>Every article identifies its author or editorial team and displays publication and update dates. Medical review is claimed only when a qualified reviewer has actually reviewed the article and agreed to be identified.</p><h2 id="corrections">Corrections</h2><p>Material factual corrections update the modified date. Minor copy edits may not. Readers can submit correction requests by email with the relevant source and article URL.</p><h2>Commercial relationships</h2><p>Affiliate links, sponsored content, brand ownership, or product relationships should be disclosed near the relevant content. Editorial content should not imply independence when the publisher sells or licenses the featured product.</p></div></div></section>`;
await writeFile(path.join(dist, 'editorial-policy.html'), page({ title: `Editorial Policy | ${site.name}`, description: `Read the ${site.name} editorial policy for sourcing, claims, review, and corrections.`, canonical: '/editorial-policy', content: policyContent }));

const disclaimerContent = `<section class="page-hero compact"><div class="shell narrow"><span class="kicker">Important information</span><h1>Medical disclaimer</h1><p>Please read this before relying on any article or product discussion on this website.</p></div></section><section class="section section-white"><div class="shell narrow article-body policy-body"><p>The content on ${escapeHtml(site.name)} is provided for general informational and educational purposes only. It is not medical advice and is not a substitute for professional diagnosis, treatment, or care.</p><p>Do not use this website to delay or disregard advice from a physician, registered dietitian, pharmacist, or other qualified healthcare professional. Ask a qualified professional before using dietary supplements, especially if you are pregnant or breastfeeding, take medications, have a diagnosed condition, are preparing for surgery, or are under 18.</p><p>Dietary supplements are not intended to diagnose, treat, cure, or prevent disease. References to studies, ingredients, or products do not guarantee individual results or establish that a product is appropriate for a particular person.</p><p>External links are provided for context. Their inclusion does not necessarily constitute endorsement.</p></div></section>`;
await writeFile(path.join(dist, 'medical-disclaimer.html'), page({ title: `Medical Disclaimer | ${site.name}`, description: `Medical and educational-use disclaimer for ${site.name}.`, canonical: '/medical-disclaimer', content: disclaimerContent }));

const notFound = `${baseHead({ title: `Page Not Found | ${site.name}`, description: 'The requested page could not be found.', canonical: '/404' })}<body>${nav()}<main><section class="page-hero"><div class="shell narrow"><span class="kicker">404 error</span><h1>This page could not be found.</h1><p>The link may be old, or the article may have moved.</p><a class="button button-primary" href="/">Return home</a></div></section></main>${footer()}<script src="/assets/app.js" defer></script></body></html>`;
await writeFile(path.join(dist, '404.html'), notFound);

const urls = ['/', '/topics', '/about', '/editorial-policy', '/medical-disclaimer', ...topics.map((t) => `/topics/${t.slug}`), ...articles.map((a) => `/articles/${a.slug}`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${site.url}${url}</loc></url>`).join('\n')}\n</urlset>`;
await writeFile(path.join(dist, 'sitemap.xml'), sitemap);
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);

const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#171717"/><path d="M17 17h10l5 18 5-18h10L37 48H27L17 17Z" fill="#fff"/></svg>`;
await writeFile(path.join(dist, 'assets', 'favicon.svg'), favicon);
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#fff9e8"/><circle cx="955" cy="145" r="210" fill="#f5c400"/><circle cx="1080" cy="500" r="260" fill="#dedbd3"/><rect x="95" y="90" width="92" height="92" rx="24" fill="#171717"/><path d="M119 115h16l6 30 7-30h16l-14 48h-18l-13-48Z" fill="#fff"/><text x="95" y="270" font-family="Arial, sans-serif" font-size="68" font-weight="700" fill="#171717">Velositol.co</text><text x="95" y="345" font-family="Arial, sans-serif" font-size="34" fill="#5f5a50">Protein nutrition and supplement literacy</text><text x="95" y="430" font-family="Arial, sans-serif" font-size="25" fill="#68645b">Understand the label. Question the claim.</text></svg>`;
await writeFile(path.join(dist, 'assets', 'og-default.svg'), og);

console.log(`Built ${urls.length} pages into dist/`);
