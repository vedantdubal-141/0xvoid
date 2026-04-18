import React, { useState, useEffect } from 'react';
import projectsBase from '../data/projects.json';

// Convert simple markdown links and newlines in descriptions to safe HTML
const formatDescriptionToHtml = (raw) => {
  if (!raw || typeof raw !== 'string') return '';
  // Escape HTML
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  // Convert [text](url)
  const withLinks = escaped.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, (_m, text, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #5abb9a; text-decoration: underline;">${text}</a>`;
  });
  // Convert newlines to <br/>
  return withLinks.replace(/\n/g, '<br/>');
};

const projects = projectsBase;

const badgeLinks = (project) => {
  const badges = [];

  if (project.website) {
    badges.push({
      href: project.website,
      alt: 'Website',
      src: 'https://cdn.simpleicons.org/googlechrome/ffebcd',
    });
  }
  if (project.github) {
    badges.push({
      href: project.github,
      alt: 'GitHub',
      src: 'https://cdn.simpleicons.org/github/ffebcd',
    });
  }

  const normalizeExtra = (extra) => {
    if (!extra) return [];
    const arr = Array.isArray(extra) ? extra : [extra];
    return arr
      .map((item) => {
        if (!item) return null;
        if (typeof item === 'string') {
          return { href: item, alt: 'Post', src: `${process.env.PUBLIC_URL}/globe.svg` };
        }
        if (typeof item === 'object') {
          const href = item.href || item.url;
          if (!href) return null;
          return {
            href,
             alt: item.alt || 'Post',
             src: item.src || `${process.env.PUBLIC_URL}/globe.svg`,
          };
        }
        return null;
      })
      .filter(Boolean);
  };

  badges.push(...normalizeExtra(project.extra));

  return badges.map((badge, i) => (
    <a
      key={badge.href + i}
      href={badge.href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ marginRight: 10, marginBottom: 6, display: 'inline-block' }}
    >
      <img
        src={badge.src}
        alt={badge.alt}
        style={{ height: 32, borderRadius: 6, boxShadow: '0 1px 4px #0002' }}
      />
    </a>
  ));
};

const ProjectCardContent = ({ project }) => (
  <div style={{ position: 'relative', zIndex: 1 }}>
    {project.previewImg && (
      <div
        style={{
          marginBottom: 16,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1.5px solid rgba(90,187,154,0.18)',
          boxShadow: '0 2px 16px 0 rgba(90,187,154,0.10)',
          background: '#181818',
          height: 225,
          maxWidth: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="project-iframe-container"
      >
        <img
          src={`${process.env.PUBLIC_URL}${project.previewImg}`}
          alt={project.title + ' preview'}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </div>
    )}
    {project.website && project.showIframe !== false && !project.previewImg && (
      <div
        style={{
          marginBottom: 16,
          borderRadius: 12,
          overflow: 'hidden',
          border: '1.5px solid rgba(90,187,154,0.18)',
          boxShadow: '0 2px 16px 0 rgba(90,187,154,0.10)',
          background: '#181818',
          height: 225,
          maxWidth: '100%',
          display: 'block',
        }}
        className="project-iframe-container"
      >
        <iframe
          src={project.website}
          title={project.title + ' preview'}
          style={{
            width: '200%',
            height: 450,
            border: 'none',
            borderRadius: 0,
            background: '#181818',
            display: 'block',
            transform: 'scale(0.5)',
            transformOrigin: '0 0',
          }}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-popups"
          allowFullScreen={false}
          className="project-iframe"
        >
          Your browser does not support iframes or this site does not allow embedding.
        </iframe>
      </div>
    )}
    <div style={{ fontWeight: 700, fontSize: '1.25em', marginBottom: 8, color: '#5abb9a' }}>{project.title}</div>
    <div
      style={{ fontSize: '1em', marginBottom: 16 }}
      dangerouslySetInnerHTML={{ __html: formatDescriptionToHtml(project.description) }}
    />
    <div className="project-badges" style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap' }}>
      {badgeLinks(project)}
    </div>
  </div>
);

const MobileProjectsCarousel = ({ category, items }) => {
  const [current, setCurrent] = useState(0);
  const total = items.length;
  const goLeft = () => setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  const goRight = () => setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
  const project = items[current];

  return (
    <div className="mobile-projects-carousel" style={{ maxWidth: 420, margin: '0 auto', padding: '16px 0' }}>
      <h2 className="terminal-header" style={{ color: '#ffebcd', fontSize: '1.4em', marginBottom: '16px', borderBottom: '1px solid #5abb9a' }}># {category}</h2>
      <div
        className="mobile-project-card"
        style={{
          background: 'linear-gradient(135deg, rgba(30,30,30,0.95) 60%, rgba(90,187,154,0.10) 100%)',
          borderRadius: 18,
          marginBottom: 24,
          boxShadow: '0 8px 32px 0 rgba(31,38,135,0.18)',
          padding: '24px 12px',
          color: '#ffebcd',
          fontFamily: "'Terminus', monospace",
          border: '1.5px solid rgba(90,187,154,0.13)',
          position: 'relative',
          minHeight: 420,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%', marginBottom: 16, borderRadius: 12, overflow: 'hidden', background: '#181818', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {project.previewImg && (
            <img
              src={`${process.env.PUBLIC_URL}${project.previewImg}`}
              alt={project.title + ' preview'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderRadius: 12 }}
            />
          )}
        </div>
        <div style={{ fontWeight: 700, fontSize: '1.18em', color: '#5abb9a', marginBottom: 10, textAlign: 'center' }}>{project.title}</div>
        <div
          style={{ fontSize: '1em', marginBottom: 16, textAlign: 'center', lineHeight: 1.5 }}
          dangerouslySetInnerHTML={{ __html: formatDescriptionToHtml(project.description) }}
        />
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 8 }}>
          {badgeLinks(project)}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 10 }}>
          <button onClick={goLeft} style={{ background: '#111', color: '#5abb9a', border: '1.5px solid #333', borderRadius: 6, fontFamily: "'Terminus', monospace", fontSize: 22, width: 44, height: 44, cursor: 'pointer', boxShadow: '0 1px 4px #0002' }}>&lt;</button>
          <button onClick={goRight} style={{ background: '#111', color: '#5abb9a', border: '1.5px solid #333', borderRadius: 6, fontFamily: "'Terminus', monospace", fontSize: 22, width: 44, height: 44, cursor: 'pointer', boxShadow: '0 1px 4px #0002' }}>&gt;</button>
        </div>
        <div style={{ marginTop: 8, fontSize: '0.92em', color: '#5abb9a', textAlign: 'center' }}>{current + 1} / {total}</div>
      </div>
    </div>
  );
};

const ProjectsMasonry = () => {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth <= 900) setColumns(1);
      else if (window.innerWidth <= 1300) setColumns(2);
      else setColumns(3);
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Group projects by internal category metadata
  const groupedProjects = projects.reduce((acc, project) => {
    const cat = project.category || 'Other Labs';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(project);
    return acc;
  }, {});

  return (
    <div style={{ width: '100%' }}>
      <style>{`
        .project-masonry-card {
          position: relative;
          overflow: hidden;
          z-index: 1;
          transition: border-color 0.3s, box-shadow 0.3s;
          border: 2px solid rgba(90, 187, 154, 0.08);
          border-radius: 4px !important;
        }
        .project-masonry-card::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg,
            transparent 0deg,
            transparent 55deg,
            #ffff55 60deg,
            #5abb9a 75deg,
            transparent 80deg,
            transparent 235deg,
            #ffff55 240deg,
            #5abb9a 255deg,
            transparent 260deg
          );
          transform: translate(-50%, -50%) rotate(0deg);
          opacity: 0;
          z-index: 0;
          pointer-events: none;
        }
        .project-masonry-card:hover::before {
          opacity: 1;
          animation: border-beam 3s linear infinite;
        }
        .project-masonry-card:hover {
          box-shadow:
            0 0 20px 2px #5abb9a88,
            0 0 8px 1px #ffff5566;
          border-color: #5abb9a;
        }
        @keyframes border-beam {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @media (max-width: 900px) {
          .project-iframe-container, .project-iframe {
            display: none !important;
          }
        }
        @media (max-width: 700px) {
          .mobile-projects-carousel { display: block; }
          .project-masonry-card, .projects-grid, .desktop-only-header { display: none !important; }
          .project-masonry-card {
            padding: 14px 4vw !important;
            margin-bottom: 18px !important;
            font-size: 0.98em !important;
            border-radius: 12px !important;
          }
          .project-masonry-card img {
            height: 120px !important;
            min-height: 80px !important;
            object-fit: cover !important;
          }
          .project-masonry-card .project-iframe-container {
            display: none !important;
          }
          .project-badges {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 6px !important;
          }
          .project-masonry-card .project-badges img {
            height: 26px !important;
            width: 26px !important;
          }
          .project-masonry-card div[style*='fontWeight: 700'] {
            font-size: 1.08em !important;
          }
          .project-masonry-card div[style*='fontSize: 1em'] {
            font-size: 0.97em !important;
          }
        }
        @media (min-width: 701px) {
          .mobile-projects-carousel { display: none !important; }
        }
      `}</style>
      
      {Object.entries(groupedProjects).map(([category, items]) => {
        // Calculate columns for this specific category
        const columnData = Array.from({ length: columns }, () => []);
        items.forEach((item, i) => {
          columnData[i % columns].push(item);
        });

        return (
          <div key={category} style={{ marginBottom: '60px' }}>
            <h2 className="terminal-header desktop-only-header" style={{ color: '#ffebcd', fontSize: '1.8em', marginBottom: '16px', borderBottom: '2px solid #5abb9a', paddingBottom: '8px' }}>
              # {category}
            </h2>
            
            {/* Desktop Masonry Grid */}
            <div
              className="projects-grid"
              style={{
                display: 'flex',
                gap: '32px',
                maxWidth: 1300,
                margin: '0 auto',
                padding: '20px 0',
                alignItems: 'start',
              }}
            >
              {columnData.map((col, colIndex) => (
                <div key={colIndex} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', minWidth: 0 }}>
                  {col.map((project) => (
                    <div
                      key={project.title}
                      className="project-masonry-card"
                      style={{
                        display: 'inline-block',
                        width: '100%',
                        borderRadius: 4,
                        padding: '2px', /* Border thickness for the beam */
                        background: 'transparent',
                        position: 'relative',
                        transition: 'transform 0.18s',
                        alignSelf: 'start',
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.transform = 'scale(1.025)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <div style={{
                        background: '#000000',
                        borderRadius: 2,
                        padding: '24px 20px',
                        height: '100%',
                        width: '100%',
                        position: 'relative',
                        zIndex: 1,
                        color: '#ffebcd',
                        fontFamily: "'Terminus', monospace",
                      }}>
                        <ProjectCardContent project={project} />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Mobile Carousel representation */}
            <MobileProjectsCarousel category={category} items={items} />
          </div>
        );
      })}
    </div>
  );
};

export default ProjectsMasonry;
