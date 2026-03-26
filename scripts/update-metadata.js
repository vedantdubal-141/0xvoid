#!/usr/bin/env node

/**
 * Auto-update metadata files (llms.txt, profile.json) from source data
 * Run this script during build to keep metadata files in sync with project data
 */

const fs = require('fs');
const path = require('path');

// Import data directly
const profileData = require('../src/data/profile.json');
const projectsData = require('../src/data/projects.json');

// Compute age from birthDate
function getAge(birthDateStr) {
  const birth = new Date(birthDateStr);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

// Helper functions (formerly in extract-projects.js)
function getTopProjects(projects, count = 10) {
  // Define priority order for top projects
  const priorityOrder = [
    'Android Rooting: Proot vs Chroot',
    'DockForge',
    'AI Voice Cloning (RVC)'
  ];

  const sortedProjects = [];

  // Add priority projects first
  priorityOrder.forEach(title => {
    const project = projects.find(p => p.title === title);
    if (project) {
      sortedProjects.push(project);
    }
  });

  // Add remaining projects
  projects.forEach(project => {
    if (!priorityOrder.includes(project.title)) {
      sortedProjects.push(project);
    }
  });

  return sortedProjects.slice(0, count);
}

function formatProjectForLlmsTxt(project) {
  let formatted = `- ${project.title}`;

  if (project.description) {
    // Strip HTML tags if any (though description in JSON is mostly text)
    const cleanDesc = project.description.replace(/<[^>]*>/g, '');
    formatted += ` — ${cleanDesc}`;
  }

  const links = [];
  if (project.website) links.push(`Site: ${project.website}`);
  if (project.github) links.push(`GitHub: ${project.github}`);

  // Handle extra links
  if (project.extra) {
    const extras = Array.isArray(project.extra) ? project.extra : [project.extra];
    extras.forEach(extra => {
      if (!extra) return;
      const url = typeof extra === 'string' ? extra : (extra.href || extra.url);
      if (!url) return;

      if (url.includes('news.ycombinator.com')) {
        links.push(`HN: ${url}`);
      } else if (url.includes('x.com')) {
        links.push(`X: ${url}`);
      } else if (url.includes('linkedin.com')) {
        links.push(`LinkedIn: ${url}`);
      }
    });
  }

  if (links.length > 0) {
    formatted += '\n  - ' + links.join('\n  - ');
  }

  return formatted;
}

function formatProjectForProfileJson(project) {
  const formatted = {
    name: project.title,
    status: "Active"
  };

  if (project.description) {
    formatted.description = project.description;
  }

  if (project.website) {
    formatted.url = project.website;
  }

  if (project.github) {
    formatted.github = project.github;
  }

  // Infer technologies based on project name/description
  const technologies = [];
  const desc = (project.description || '').toLowerCase();
  const title = project.title.toLowerCase();

  if (desc.includes('linux') || desc.includes('rooting') || desc.includes('chroot')) {
    technologies.push('Linux Systems');
  }
  if (desc.includes('docker') || desc.includes('orchestrator') || desc.includes('automation')) {
    technologies.push('DevOps');
  }
  if (desc.includes('voice') || desc.includes('ai') || desc.includes('cloning')) {
    technologies.push('AI/ML');
  }

  if (technologies.length > 0) {
    formatted.technologies = [...new Set(technologies)]; // Remove duplicates
  }

  return formatted;
}

// Convert HTML links to Markdown and strip other tags
function formatHtmlToMarkdown(html) {
  if (!html) return '';

  // Replace <a href="...">text</a> with [text](url)
  let markdown = html.replace(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Replace <span ...>text</span> with just text (for command links)
  markdown = markdown.replace(/<span[^>]*>(.*?)<\/span>/gi, '$1');

  // Strip any remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');

  return markdown;
}

function updateLlmsTxt() {
  const currentDate = new Date().toISOString().split('T')[0];
  const age = getAge(profileData.birthDate);
  const topProjects = getTopProjects(projectsData, 12);

  // Construct full Bio from profileData using Markdown formatting for links
  const bioFields = [
    profileData.bio.intro,
    formatHtmlToMarkdown(profileData.bio.education),
    formatHtmlToMarkdown(profileData.bio.projects_highlight),
    formatHtmlToMarkdown(profileData.bio.blog_highlight),
    formatHtmlToMarkdown(profileData.bio.current_work),
    formatHtmlToMarkdown(profileData.bio.skills_highlight),
    formatHtmlToMarkdown(profileData.bio.history),
    formatHtmlToMarkdown(profileData.bio.fun_fact),
    formatHtmlToMarkdown(profileData.bio.outro)
  ].filter(Boolean);
  const bioText = bioFields.join('\n\n');

  // Format accomplishments
  const accomplishmentsText = (profileData.accomplishments || []).map(a => {
    let line = `- ${a.title}`;
    if (a.detail) line += ` — ${a.detail}`;
    if (a.project) line += ` (project: ${a.project})`;
    const links = [];
    if (a.url) links.push(a.url);
    if (a.social) links.push(a.social);
    if (links.length > 0) line += '\n  - ' + links.join('\n  - ');
    return line;
  }).join('\n');

  // Format media appearances
  const mediaText = (profileData.media_appearances || []).map(m => {
    let line = `- ${m.outlet}`;
    if (m.title) line += `: ${m.title}`;
    if (m.project) line += ` (project: ${m.project})`;
    line += `\n  - ${m.url}`;
    return line;
  }).join('\n');

  // Format education
  const educationText = (profileData.education || []).map(e => {
    return `- ${e.degree} — ${e.institution} (${e.status})`;
  }).join('\n');

  const llmsContent = `# llms.txt — ${profileData.name}

A machine-friendly overview of who I am, what I build, and where to find always-fresh information.

Last-Updated: ${currentDate}
Canonical: https://vedantdubal.com/llms.txt
Full version: https://vedantdubal.com/llms-full.txt

---

## Quick context for LLMs

- **Who**: ${age}-year-old Systems & DevOps enthusiast from ${profileData.location}. ${profileData.title}.
- **Full context (recommended)**: https://vedantdubal.com/llms-full.txt — self-contained, has everything, no JS required.
- **Machine-readable data**: https://vedantdubal.com/profile.json — JSON snapshot of identity, skills, projects, achievements, and press.
- **Blog + RSS**: https://vedantdubal.com/blog/ (RSS: https://vedantdubal.com/blog/index.xml)

> **Note**: The portfolio at https://vedantdubal.com is a React SPA. Most content requires JavaScript to render. If you cannot execute JS, use the static files above — they contain everything you need.

---

## Static resources (no JS required)

These files are always up-to-date and fully readable without JavaScript:

- **This file**: https://vedantdubal.com/llms.txt (summary + key sections)
- **Full version**: https://vedantdubal.com/llms-full.txt (comprehensive — all projects, all skills, everything)
- **Profile JSON**: https://vedantdubal.com/profile.json (machine-readable)
- **Blog**: https://vedantdubal.com/blog/ (separate Quartz site, works without JS)
  - RSS feed: https://vedantdubal.com/blog/index.xml
  - Source repo: https://github.com/vedantdubal-141/blog
- **Site map**: https://vedantdubal.com/sitemap.xml
- **Robots**: https://vedantdubal.com/robots.txt

---

## Primary identity and socials

- Name: ${profileData.name}
- Age: ${age}
- Location: ${profileData.location}
- Role: ${profileData.title}
- Email: mailto:${profileData.email}
- GitHub: ${profileData.socials.github}
- LinkedIn: ${profileData.socials.linkedin}
- X/Twitter: ${profileData.socials.twitter}
- YouTube: ${profileData.socials.youtube}

---

## Education

${educationText}

---

## Short bio

${bioText}

---

## Achievements & hackathons

${accomplishmentsText}

---

## Press & media appearances

Featured in the following publications:

${mediaText}

---

## Projects (top ${topProjects.length})

For the complete list with all ${projectsData.length} projects, see https://vedantdubal.com/llms-full.txt

${topProjects.map(project => formatProjectForLlmsTxt(project)).join('\n\n')}

---

## Interactive links (require JavaScript)

The following URLs open the portfolio and auto-run terminal commands. **These require a browser with JavaScript enabled** — they will not work for text-only crawlers.

- Who: https://vedantdubal.com/#/who
- Projects: https://vedantdubal.com/#/projects
- Skills: https://vedantdubal.com/#/skills
- Misc: https://vedantdubal.com/#/misc
- Games: https://vedantdubal.com/#/games

---

## Guidance for LLMs and agents

- **Start here**: This file (llms.txt) has a summary. For everything, use https://vedantdubal.com/llms-full.txt.
- **Structured data**: https://vedantdubal.com/profile.json has skills, projects, achievements, and media in JSON.
- **Blog/updates**: RSS at https://vedantdubal.com/blog/index.xml.
- **GitHub activity**: https://api.github.com/users/vedantdubal-141/repos?sort=updated
- **Hash routes require JS**: The portfolio is a React SPA. URLs with /#/ need a browser with JavaScript. Use the static files above instead.
- Respect rate limits and cache responsibly.

---

## Contact

- Email: ${profileData.email}
- Portfolio: https://vedantdubal.com/
- LinkedIn: ${profileData.socials.linkedin}
- GitHub: ${profileData.socials.github}

`;

  // Write to both public and build directories
  const publicPath = path.join(__dirname, '../public/llms.txt');
  const buildPath = path.join(__dirname, '../build/llms.txt');

  fs.writeFileSync(publicPath, llmsContent);
  console.log('✅ Updated public/llms.txt');

  // Also update build directory if it exists
  if (fs.existsSync(path.dirname(buildPath))) {
    fs.writeFileSync(buildPath, llmsContent);
    console.log('✅ Updated build/llms.txt');
  }
}

function updateLlmsFullTxt() {
  const currentDate = new Date().toISOString().split('T')[0];
  const age = getAge(profileData.birthDate);

  // Bio
  const bioFields = [
    profileData.bio.intro,
    formatHtmlToMarkdown(profileData.bio.education),
    formatHtmlToMarkdown(profileData.bio.projects_highlight),
    formatHtmlToMarkdown(profileData.bio.blog_highlight),
    formatHtmlToMarkdown(profileData.bio.current_work),
    formatHtmlToMarkdown(profileData.bio.skills_highlight),
    formatHtmlToMarkdown(profileData.bio.history),
    formatHtmlToMarkdown(profileData.bio.fun_fact),
    formatHtmlToMarkdown(profileData.bio.outro)
  ].filter(Boolean);
  const bioText = bioFields.join('\n\n');

  // Education
  const educationText = (profileData.education || []).map(e => {
    return `- ${e.degree} — ${e.institution} (${e.status})`;
  }).join('\n');

  // Accomplishments
  const accomplishmentsText = (profileData.accomplishments || []).map(a => {
    let line = `- ${a.title}`;
    if (a.detail) line += ` — ${a.detail}`;
    if (a.project) line += ` (project: ${a.project})`;
    const links = [];
    if (a.url) links.push(a.url);
    if (a.social) links.push(a.social);
    if (links.length > 0) line += '\n  - ' + links.join('\n  - ');
    return line;
  }).join('\n');

  // Media
  const mediaText = (profileData.media_appearances || []).map(m => {
    let line = `- ${m.outlet}`;
    if (m.title) line += `: ${m.title}`;
    if (m.project) line += ` (project: ${m.project})`;
    line += `\n  - ${m.url}`;
    return line;
  }).join('\n');

  // ALL projects (not just top N)
  const allProjectsText = projectsData.map(project => formatProjectForLlmsTxt(project)).join('\n\n');

  // ALL skills
  const skillsText = Object.entries(profileData.skills || {}).map(([category, items]) => {
    const itemList = items.map(s => `  - ${s.name}: ${s.desc}`).join('\n');
    return `### ${category}\n${itemList}`;
  }).join('\n\n');

  const fullContent = `# llms-full.txt — ${profileData.name} (complete reference)

This is the comprehensive, self-contained version of llms.txt. It contains ALL data about Vedant Dubal — every project, every skill, every achievement, every press feature. No JavaScript or additional requests needed.

Last-Updated: ${currentDate}
Canonical: https://vedantdubal.com/llms-full.txt
Short version: https://vedantdubal.com/llms.txt
Machine-readable: https://vedantdubal.com/profile.json

---

## Identity

- Name: ${profileData.name}
- Age: ${age} (born ${profileData.birthDate})
- Location: ${profileData.location}
- Role: ${profileData.title}
- Email: mailto:${profileData.email}
- GitHub: ${profileData.socials.github}
- LinkedIn: ${profileData.socials.linkedin}
- X/Twitter: ${profileData.socials.twitter}
- YouTube: ${profileData.socials.youtube}
- Portfolio: https://vedantdubal.com/
- Blog: https://vedantdubal.com/blog/ (RSS: https://vedantdubal.com/blog/index.xml)

---

## Education

${educationText}

---

## Bio

${bioText}

---

## Achievements & hackathons

${accomplishmentsText}

---

## Press & media appearances

${mediaText}

---

## Skills

${skillsText}

---

## All projects (${projectsData.length} total)

${allProjectsText}

---

## Contact

- Email: ${profileData.email}
- Portfolio: https://vedantdubal.com/
- LinkedIn: ${profileData.socials.linkedin}
- GitHub: ${profileData.socials.github}

`;

  // Write to both public and build directories
  const publicPath = path.join(__dirname, '../public/llms-full.txt');
  const buildPath = path.join(__dirname, '../build/llms-full.txt');

  fs.writeFileSync(publicPath, fullContent);
  console.log('✅ Updated public/llms-full.txt');

  if (fs.existsSync(path.dirname(buildPath))) {
    fs.writeFileSync(buildPath, fullContent);
    console.log('✅ Updated build/llms-full.txt');
  }
}

function updateProfileJson() {
  const currentDate = new Date().toISOString().split('T')[0];
  const featuredProjects = getTopProjects(projectsData, 8).map(project => formatProjectForProfileJson(project));

  // Build achievements list from accomplishments + extras
  const achievements = (profileData.accomplishments || []).map(a => {
    let text = a.title;
    if (a.detail) text += ` — ${a.detail}`;
    return text;
  });

  const profileJsonData = {
    "name": profileData.name,
    "title": profileData.title,
    "age": getAge(profileData.birthDate),
    "location": profileData.location,
    "email": profileData.email,
    "website": "https://vedantdubal.com",
    "github": profileData.socials.github,
    "linkedin": profileData.socials.linkedin,
    "blog": "https://vedantdubal.com/blog/",
    "youtube": profileData.socials.youtube,
    "current_role": {
      "position": formatHtmlToMarkdown(profileData.bio.history),
      "education": formatHtmlToMarkdown(profileData.bio.education)
    },
    "education": profileData.education,
    "skills": profileData.skills,
    "featured_projects": featuredProjects,
    "achievements": achievements,
    "media_appearances": profileData.media_appearances,
    "interests": [
      "Linux internals and system administration",
      "DevOps automation and infrastructure as code",
      "Network security and troubleshooting",
      "Open source development",
      "Building efficient CLI tools"
    ],
    "portfolio_features": {
      "type": "Interactive Terminal",
      "technologies": ["React", "JavaScript", "CSS"],
      "features": [
        "Interactive terminal interface",
        "System experiments showcase",
        "DevOps labs automation",
        "Mobile responsive design"
      ]
    },
    "last_updated": currentDate
  };

  const profileJson = JSON.stringify(profileJsonData, null, 2);

  // Write to both public and build directories
  const publicPath = path.join(__dirname, '../public/profile.json');
  const buildPath = path.join(__dirname, '../build/profile.json');

  fs.writeFileSync(publicPath, profileJson);
  console.log('✅ Updated public/profile.json');

  // Also update build directory if it exists
  if (fs.existsSync(path.dirname(buildPath))) {
    fs.writeFileSync(buildPath, profileJson);
    console.log('✅ Updated build/profile.json');
  }
}

function updateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];
  const baseUrl = 'https://vedantdubal.com';

  // 1. Static Routes
  const staticRoutes = [
    { loc: '/', priority: '1.0', changefreq: 'weekly' },
    { loc: 'https://vedantdubal.com/blog/sitemap.xml', priority: '0.8', changefreq: 'weekly' },
    { loc: '/profile.json', priority: '0.8', changefreq: 'weekly' },
    { loc: '/profile.md', priority: '0.8', changefreq: 'weekly' },
  ];

  // 2. Hash Routes (Commands)
  const hashRoutes = [
    'who', 'projects', 'skills', 'help', 'neofetch'
  ].map(route => ({
    loc: `/#/${route}`,
    priority: '0.7',
    changefreq: 'monthly'
  }));

  // Combine all routes
  const allRoutes = [...staticRoutes, ...hashRoutes];
  const uniqueRoutes = [];
  const seenUrls = new Set();

  allRoutes.forEach(route => {
    let url = route.loc;
    if (!url.startsWith('http')) {
      url = baseUrl + url;
    }

    // Normalize URL for deduplication (remove trailing slash)
    const normalizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;

    if (!seenUrls.has(normalizedUrl)) {
      seenUrls.add(normalizedUrl);

      // Use the original URL for the sitemap
      uniqueRoutes.push({ ...route, loc: url });
    }
  });

  // Generate XML
  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`;

  uniqueRoutes.forEach(route => {
    const url = route.loc;

    sitemapXml += `
  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  });

  sitemapXml += `
</urlset>`;

  // Write to both public and build directories
  const publicPath = path.join(__dirname, '../public/sitemap.xml');
  const buildPath = path.join(__dirname, '../build/sitemap.xml');

  fs.writeFileSync(publicPath, sitemapXml);
  console.log('✅ Updated public/sitemap.xml');

  // Also update build directory if it exists
  if (fs.existsSync(path.dirname(buildPath))) {
    fs.writeFileSync(buildPath, sitemapXml);
    console.log('✅ Updated build/sitemap.xml');
  }
}

function main() {
  console.log('🔄 Updating metadata files...');

  try {
    updateLlmsTxt();
    updateLlmsFullTxt();
    updateProfileJson();
    updateSitemap();
    console.log('✅ All metadata files updated successfully!');
  } catch (error) {
    console.error('❌ Error updating metadata files:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { updateLlmsTxt, updateLlmsFullTxt, updateProfileJson, updateSitemap };
// update: update metadata sync scripts for the new deployment domain
// update: Redesign the metadata synchronization pipeline to support the new vedantdubal.com domain. This involves a total overhaul of the update-metadata script to dynamically pull identity data from profile.json. This ensures that SEO sitemaps, machine-readable llms.txt files, and public identity snapshots are perfectly synced for AI agents and search engines without manual intervention.
