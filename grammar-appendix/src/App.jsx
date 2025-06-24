import React, { useEffect, useState, useRef } from 'react';
import './App.css';

const MAJOR_TAGS = ['Agreement and Basic Constructions', 'Noun', 'Verb', 'Participles', 'Voice'];

function Tag({ tag, onClick, active, isMajor }) {
  return (
    <span
      className={`tag${active ? ' active' : ''}${isMajor ? ' major' : ''}`}
      onClick={() => onClick(tag)}
      style={{
        cursor: 'pointer',
        marginRight: 8,
        marginBottom: 6,
        background: active ? (isMajor ? '#0056b3' : '#007bff') : (isMajor ? '#e0e0e0' : '#eee'),
        color: active ? '#fff' : (isMajor ? '#222' : '#333'),
        borderRadius: isMajor ? 20 : 4,
        padding: isMajor ? '4px 16px' : '2px 8px',
        fontSize: isMajor ? 15 : 12,
        fontWeight: isMajor ? 700 : 400,
        border: isMajor ? 'none' : '1px solid #ccc',
        display: 'inline-block',
        boxShadow: isMajor && active ? '0 2px 8px #007bff33' : undefined,
        transition: 'all 0.15s',
      }}
    >
      {tag}
    </span>
  );
}

function GrammarPoint({ point, onTagClick, activeTags }) {
  return (
    <div 
      id={`point-${point.number}-${point.title.replace(/\s+/g, '-')}`}
      className="grammar-point" 
      style={{ marginBottom: 24, padding: 16, border: '1px solid #eee', borderRadius: 8 }}
    >
      <h4 style={{ margin: 0 }}>{point.number}. {point.title}</h4>
      {point.description && (
        <div style={{ margin: '12px 0 0 0', whiteSpace: 'pre-line', fontSize: 15, color: '#222' }}>{point.description}</div>
      )}
      {point.examples && point.examples.length > 0 && (
        <div style={{
          background: '#fffbe6',
          borderRadius: 6,
          padding: '10px 16px',
          marginTop: 14,
          marginBottom: 0,
          border: '1px solid #ffe58f',
        }}>
          <div style={{ fontWeight: 600, marginBottom: 6, color: '#b8860b', fontSize: 14 }}>Examples:</div>
          <div>
            {point.examples.map((ex, i) => (
              <div key={i} style={{ fontFamily: 'serif', fontSize: 15, marginBottom: 6 }}>{ex}</div>
            ))}
          </div>
        </div>
      )}
      <div style={{ marginTop: 8 }}>
        {point.tags && point.tags.map(tag => (
          <Tag key={tag} tag={tag} onClick={onTagClick} active={activeTags.includes(tag)} isMajor={MAJOR_TAGS.includes(tag)} />
        ))}
      </div>
    </div>
  );
}

function Section({ section, onTagClick, activeTags, showSectionHeader, majorTag, filterPoints }) {
  if (!section.points || section.points.length === 0) return null;
  
  // Don't show subheader if:
  // 1. Section title is a major tag, OR
  // 2. Section title is the same as the major tag, OR  
  // 3. Section title ends with "Case" and major tag is "Noun" (to prevent case names from showing as subheaders)
  // 4. Section title ends with "Mood" and major tag is "Verb" (to prevent mood names from showing as subheaders)
  const shouldShowSubheader = !MAJOR_TAGS.includes(section.title) && 
                             section.title !== majorTag && 
                             !(section.title.endsWith('Case') && majorTag === 'Noun') &&
                             !(section.title.endsWith('Mood') && majorTag === 'Verb');
  
  return (
    <div className="section" style={{ marginBottom: 40 }}>
      {showSectionHeader && (
        <h3 
          id={`section-${section.title.replace(/\s+/g, '-')}`}
          style={{ fontSize: 28, margin: '32px 0 16px 0', color: '#1a237e', fontWeight: 800, letterSpacing: '-1px' }}
        >
          {section.title}
        </h3>
      )}
      {shouldShowSubheader && (
        <h4 
          id={`section-${section.title.replace(/\s+/g, '-')}`}
          style={{ borderBottom: '1px solid #ccc', paddingBottom: 4, fontSize: 20, color: '#333', margin: '0 0 16px 0' }}
        >
          {section.title}
        </h4>
      )}
      {filterPoints(section.points).map(point => (
        <GrammarPoint key={point.number + point.title} point={point} onTagClick={onTagClick} activeTags={activeTags} />
      ))}
    </div>
  );
}

function TagBar({ tags, activeTags, onTagClick, data }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Get subheaders for each major tag
  const getSubheaders = (majorTag) => {
    if (!data) return [];
    const subheaders = new Set();
    data.forEach(section => {
      if (!section.points || section.points.length === 0) return;
      let sectionMajor = section.points[0].tags.find(tag => MAJOR_TAGS.includes(tag));
      if (!sectionMajor && MAJOR_TAGS.includes(section.title)) sectionMajor = section.title;
      if (sectionMajor === majorTag && section.title !== majorTag) {
        subheaders.add(section.title);
      }
    });
    // For Verb, insert 'Independent Subjunctive', 'Ut Clauses', 'Relative', 'Conditionals', 'Cum Clauses', and 'Indirect Discourse' as nested options under 'Subjunctive Mood', 'Indicative Mood', and 'Infinitive Mood'.
    if (majorTag === 'Verb') {
      const subheaderArr = Array.from(subheaders);
      const subjIndex = subheaderArr.indexOf('Subjunctive Mood');
      if (subjIndex !== -1) {
        subheaderArr.splice(
          subjIndex + 1,
          0,
          '__INDEPENDENT_SUBJUNCTIVE_NESTED__',
          '__UT_CLAUSES_NESTED__',
          '__RELATIVE_NESTED__',
          '__CONDITIONALS_NESTED__',
          '__CUM_CLAUSES_SUBJUNCTIVE_NESTED__',
          '__INDIRECT_DISCOURSE_SUBJUNCTIVE_NESTED__'
        );
      }
      const indIndex = subheaderArr.indexOf('Indicative Mood');
      if (indIndex !== -1) {
        subheaderArr.splice(
          indIndex + 1,
          0,
          '__CONDITIONALS_INDICATIVE_NESTED__',
          '__CUM_CLAUSES_INDICATIVE_NESTED__'
        );
      }
      const infIndex = subheaderArr.indexOf('Infinitive Mood');
      if (infIndex !== -1) {
        subheaderArr.splice(
          infIndex + 1,
          0,
          '__INDIRECT_DISCOURSE_INFINITIVE_NESTED__'
        );
      }
      return subheaderArr;
    }
    return Array.from(subheaders);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (openDropdown && dropdownRefs.current[openDropdown] && !dropdownRefs.current[openDropdown].contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const majorTags = MAJOR_TAGS.filter(tag => tags.includes(tag));
  // Hide 'Independent Subjunctive', 'Ut Clauses', 'Relative', 'Conditionals', 'Cum Clauses', and 'Indirect Discourse' from sectionTags
  const sectionTags = tags.filter(tag => !MAJOR_TAGS.includes(tag) && tag !== 'Independent Subjunctive' && tag !== 'Ut Clauses' && tag !== 'Relative' && tag !== 'Conditionals' && tag !== 'Cum Clauses' && tag !== 'Indirect Discourse');

  return (
    <div style={{ margin: '16px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center', position: 'relative' }}>
      <strong style={{ marginRight: 8 }}>Filter by tags: </strong>
      <Tag tag={null} onClick={() => onTagClick(null)} active={activeTags.length === 0} isMajor={false}>All</Tag>
      {majorTags.map(majorTag => {
        const subheaders = getSubheaders(majorTag);
        return (
          <div key={majorTag} style={{ position: 'relative', marginRight: 8 }} ref={el => dropdownRefs.current[majorTag] = el}>
            <span
              className={`tag${activeTags.includes(majorTag) ? ' active' : ''} major`}
              style={{
                cursor: 'pointer',
                marginBottom: 6,
                background: activeTags.includes(majorTag) ? '#0056b3' : '#e0e0e0',
                color: activeTags.includes(majorTag) ? '#fff' : '#222',
                borderRadius: 20,
                padding: '4px 16px',
                fontSize: 15,
                fontWeight: 700,
                border: 'none',
                display: 'inline-block',
                position: 'relative',
                userSelect: 'none',
              }}
              onClick={() => setOpenDropdown(openDropdown === majorTag ? null : majorTag)}
            >
              {majorTag} <span style={{ fontSize: 12, marginLeft: 4 }}>{openDropdown === majorTag ? '▲' : '▼'}</span>
            </span>
            {openDropdown === majorTag && (
              <div style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                background: '#fff',
                border: '1px solid #ccc',
                borderRadius: 8,
                boxShadow: '0 4px 16px #0001',
                zIndex: 10,
                minWidth: 180,
                padding: 0,
              }}>
                {/* Major tag as first option */}
                <div
                  style={{
                    padding: '10px 18px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    color: activeTags.length === 1 && activeTags[0] === majorTag ? '#0056b3' : '#222',
                    background: activeTags.length === 1 && activeTags[0] === majorTag ? '#e3f2fd' : 'transparent',
                  }}
                  onClick={() => {
                    onTagClick(majorTag);
                    setOpenDropdown(null);
                  }}
                >
                  {majorTag} (All)
                </div>
                {subheaders.map((subheader) => {
                  if (subheader === '__INDEPENDENT_SUBJUNCTIVE_NESTED__') {
                    // Render nested option under Subjunctive Mood
                    return (
                      <div
                        key="independent-subjunctive-nested"
                        style={{
                          padding: '10px 18px',
                          cursor: 'pointer',
                          color: activeTags.includes(majorTag) && activeTags.includes('Subjunctive Mood') && activeTags.includes('Independent Subjunctive') ? '#0056b3' : '#222',
                          background: activeTags.includes(majorTag) && activeTags.includes('Subjunctive Mood') && activeTags.includes('Independent Subjunctive') ? '#e3f2fd' : 'transparent',
                          marginLeft: 24,
                          fontStyle: 'italic',
                        }}
                        onClick={() => {
                          if (!activeTags.includes(majorTag)) onTagClick(majorTag);
                          if (!activeTags.includes('Subjunctive Mood')) onTagClick('Subjunctive Mood');
                          onTagClick('Independent Subjunctive');
                          setOpenDropdown(null);
                        }}
                      >
                        ↳ Independent Subjunctive
                      </div>
                    );
                  }
                  if (subheader === '__UT_CLAUSES_NESTED__') {
                    // Render nested option under Subjunctive Mood
                    return (
                      <div
                        key="ut-clauses-nested"
                        style={{
                          padding: '10px 18px',
                          cursor: 'pointer',
                          color: activeTags.includes(majorTag) && activeTags.includes('Subjunctive Mood') && activeTags.includes('Ut Clauses') ? '#0056b3' : '#222',
                          background: activeTags.includes(majorTag) && activeTags.includes('Subjunctive Mood') && activeTags.includes('Ut Clauses') ? '#e3f2fd' : 'transparent',
                          marginLeft: 24,
                          fontStyle: 'italic',
                        }}
                        onClick={() => {
                          if (!activeTags.includes(majorTag)) onTagClick(majorTag);
                          if (!activeTags.includes('Subjunctive Mood')) onTagClick('Subjunctive Mood');
                          onTagClick('Ut Clauses');
                          setOpenDropdown(null);
                        }}
                      >
                        ↳ Ut Clauses
                      </div>
                    );
                  }
                  if (subheader === '__RELATIVE_NESTED__') {
                    // Render nested option under Subjunctive Mood
                    return (
                      <div
                        key="relative-nested"
                        style={{
                          padding: '10px 18px',
                          cursor: 'pointer',
                          color: activeTags.includes(majorTag) && activeTags.includes('Subjunctive Mood') && activeTags.includes('Relative') ? '#0056b3' : '#222',
                          background: activeTags.includes(majorTag) && activeTags.includes('Subjunctive Mood') && activeTags.includes('Relative') ? '#e3f2fd' : 'transparent',
                          marginLeft: 24,
                          fontStyle: 'italic',
                        }}
                        onClick={() => {
                          if (!activeTags.includes(majorTag)) onTagClick(majorTag);
                          if (!activeTags.includes('Subjunctive Mood')) onTagClick('Subjunctive Mood');
                          onTagClick('Relative');
                          setOpenDropdown(null);
                        }}
                      >
                        ↳ Relative
                      </div>
                    );
                  }
                  if (subheader === '__CONDITIONALS_NESTED__') {
                    // Render nested option under Subjunctive Mood
                    return (
                      <div
                        key="conditionals-nested"
                        style={{
                          padding: '10px 18px',
                          cursor: 'pointer',
                          color: activeTags.includes(majorTag) && activeTags.includes('Subjunctive Mood') && activeTags.includes('Conditionals') ? '#0056b3' : '#222',
                          background: activeTags.includes(majorTag) && activeTags.includes('Subjunctive Mood') && activeTags.includes('Conditionals') ? '#e3f2fd' : 'transparent',
                          marginLeft: 24,
                          fontStyle: 'italic',
                        }}
                        onClick={() => {
                          if (!activeTags.includes(majorTag)) onTagClick(majorTag);
                          if (!activeTags.includes('Subjunctive Mood')) onTagClick('Subjunctive Mood');
                          onTagClick('Conditionals');
                          setOpenDropdown(null);
                        }}
                      >
                        ↳ Conditionals
                      </div>
                    );
                  }
                  if (subheader === '__CONDITIONALS_INDICATIVE_NESTED__') {
                    // Render nested option under Indicative Mood
                    return (
                      <div
                        key="conditionals-indicative-nested"
                        style={{
                          padding: '10px 18px',
                          cursor: 'pointer',
                          color: activeTags.includes(majorTag) && activeTags.includes('Indicative Mood') && activeTags.includes('Conditionals') ? '#0056b3' : '#222',
                          background: activeTags.includes(majorTag) && activeTags.includes('Indicative Mood') && activeTags.includes('Conditionals') ? '#e3f2fd' : 'transparent',
                          marginLeft: 24,
                          fontStyle: 'italic',
                        }}
                        onClick={() => {
                          if (!activeTags.includes(majorTag)) onTagClick(majorTag);
                          if (!activeTags.includes('Indicative Mood')) onTagClick('Indicative Mood');
                          onTagClick('Conditionals');
                          setOpenDropdown(null);
                        }}
                      >
                        ↳ Conditionals
                      </div>
                    );
                  }
                  if (subheader === '__CUM_CLAUSES_SUBJUNCTIVE_NESTED__') {
                    // Render nested option under Subjunctive Mood
                    return (
                      <div
                        key="cum-clauses-subjunctive-nested"
                        style={{
                          padding: '10px 18px',
                          cursor: 'pointer',
                          color: activeTags.includes(majorTag) && activeTags.includes('Subjunctive Mood') && activeTags.includes('Cum Clauses') ? '#0056b3' : '#222',
                          background: activeTags.includes(majorTag) && activeTags.includes('Subjunctive Mood') && activeTags.includes('Cum Clauses') ? '#e3f2fd' : 'transparent',
                          marginLeft: 24,
                          fontStyle: 'italic',
                        }}
                        onClick={() => {
                          if (!activeTags.includes(majorTag)) onTagClick(majorTag);
                          if (!activeTags.includes('Subjunctive Mood')) onTagClick('Subjunctive Mood');
                          onTagClick('Cum Clauses');
                          setOpenDropdown(null);
                        }}
                      >
                        ↳ Cum Clauses
                      </div>
                    );
                  }
                  if (subheader === '__CUM_CLAUSES_INDICATIVE_NESTED__') {
                    // Render nested option under Indicative Mood
                    return (
                      <div
                        key="cum-clauses-indicative-nested"
                        style={{
                          padding: '10px 18px',
                          cursor: 'pointer',
                          color: activeTags.includes(majorTag) && activeTags.includes('Indicative Mood') && activeTags.includes('Cum Clauses') ? '#0056b3' : '#222',
                          background: activeTags.includes(majorTag) && activeTags.includes('Indicative Mood') && activeTags.includes('Cum Clauses') ? '#e3f2fd' : 'transparent',
                          marginLeft: 24,
                          fontStyle: 'italic',
                        }}
                        onClick={() => {
                          if (!activeTags.includes(majorTag)) onTagClick(majorTag);
                          if (!activeTags.includes('Indicative Mood')) onTagClick('Indicative Mood');
                          onTagClick('Cum Clauses');
                          setOpenDropdown(null);
                        }}
                      >
                        ↳ Cum Clauses
                      </div>
                    );
                  }
                  if (subheader === '__INDIRECT_DISCOURSE_INFINITIVE_NESTED__') {
                    // Render nested option under Infinitive Mood
                    return (
                      <div
                        key="indirect-discourse-infinitive-nested"
                        style={{
                          padding: '10px 18px',
                          cursor: 'pointer',
                          color: activeTags.includes(majorTag) && activeTags.includes('Infinitive Mood') && activeTags.includes('Indirect Discourse') ? '#0056b3' : '#222',
                          background: activeTags.includes(majorTag) && activeTags.includes('Infinitive Mood') && activeTags.includes('Indirect Discourse') ? '#e3f2fd' : 'transparent',
                          marginLeft: 24,
                          fontStyle: 'italic',
                        }}
                        onClick={() => {
                          if (!activeTags.includes(majorTag)) onTagClick(majorTag);
                          if (!activeTags.includes('Infinitive Mood')) onTagClick('Infinitive Mood');
                          onTagClick('Indirect Discourse');
                          setOpenDropdown(null);
                        }}
                      >
                        ↳ Indirect Discourse
                      </div>
                    );
                  }
                  if (subheader === '__INDIRECT_DISCOURSE_SUBJUNCTIVE_NESTED__') {
                    // Render nested option under Subjunctive Mood
                    return (
                      <div
                        key="indirect-discourse-subjunctive-nested"
                        style={{
                          padding: '10px 18px',
                          cursor: 'pointer',
                          color: activeTags.includes(majorTag) && activeTags.includes('Subjunctive Mood') && activeTags.includes('Indirect Discourse') ? '#0056b3' : '#222',
                          background: activeTags.includes(majorTag) && activeTags.includes('Subjunctive Mood') && activeTags.includes('Indirect Discourse') ? '#e3f2fd' : 'transparent',
                          marginLeft: 24,
                          fontStyle: 'italic',
                        }}
                        onClick={() => {
                          if (!activeTags.includes(majorTag)) onTagClick(majorTag);
                          if (!activeTags.includes('Subjunctive Mood')) onTagClick('Subjunctive Mood');
                          onTagClick('Indirect Discourse');
                          setOpenDropdown(null);
                        }}
                      >
                        ↳ Indirect Discourse
                      </div>
                    );
                  }
                  return (
                    <div
                      key={subheader}
                      style={{
                        padding: '10px 18px',
                        cursor: 'pointer',
                        color: activeTags.includes(majorTag) && activeTags.includes(subheader) ? '#0056b3' : '#222',
                        background: activeTags.includes(majorTag) && activeTags.includes(subheader) ? '#e3f2fd' : 'transparent',
                      }}
                      onClick={() => {
                        // Filter by both major tag and subheader
                        if (activeTags.includes(majorTag) && activeTags.includes(subheader)) {
                          // Remove subheader if already selected
                          onTagClick(subheader);
                        } else {
                          if (!activeTags.includes(majorTag)) onTagClick(majorTag);
                          onTagClick(subheader);
                        }
                        setOpenDropdown(null);
                      }}
                    >
                      {subheader}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {/* Show section tags that are not subheaders of any major tag */}
      {sectionTags.filter(tag => !majorTags.some(majorTag => getSubheaders(majorTag).includes(tag))).map(tag => (
        <Tag key={tag} tag={tag} onClick={onTagClick} active={activeTags.includes(tag)} isMajor={false} />
      ))}
      {activeTags.length > 0 && (
        <button 
          onClick={() => onTagClick(null)} 
          style={{ 
            padding: '4px 12px', 
            borderRadius: 4, 
            border: '1px solid #dc3545', 
            background: '#dc3545', 
            color: 'white',
            cursor: 'pointer',
            fontSize: 12,
            marginLeft: 8
          }}
        >
          Clear All
        </button>
      )}
    </div>
  );
}

function App() {
  const [data, setData] = useState([]);
  const [activeTags, setActiveTags] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('./grammar_appendix.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch grammar_appendix.json');
        return res.json();
      })
      .then(json => {
        setData(json);
        // Collect all unique tags
        const tags = new Set();
        json.forEach(section => section.points && section.points.forEach(point => point.tags && point.tags.forEach(tag => tags.add(tag))));
        setAllTags(Array.from(tags));
        setLoading(false);
        setError(null);
        // Debug output
        console.log('Loaded grammar appendix data:', json);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
        console.error('Error loading grammar appendix:', e);
      });
  }, []);

  const handleTagClick = (tag) => {
    if (tag === null) {
      setActiveTags([]);
    } else {
      setActiveTags(prev => {
        if (prev.includes(tag)) {
          return prev.filter(t => t !== tag);
        } else {
          return [...prev, tag];
        }
      });
    }
  };

  // Helper: filter points by tags and search term (now with advanced search)
  const filterPoints = (points) => {
    // Advanced search: tag:TAGNAME (case-insensitive, supports multiple tags)
    const tagPattern = /tag:([\w\- ]+)/gi;
    const tagMatches = [...searchTerm.matchAll(tagPattern)];
    const searchTags = tagMatches.map(m => m[1].trim()).filter(Boolean);
    return points.filter(point => {
      // Advanced tag search (AND logic for all specified tags)
      if (searchTags.length > 0) {
        if (!point.tags || !searchTags.every(tag => point.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()))) {
          return false;
        }
      }
      // Tag filter (AND logic)
      if (activeTags.length > 0 && (!point.tags || !activeTags.every(tag => point.tags.includes(tag)))) {
        return false;
      }
      // Search filter (ignore tag:... in search text)
      const cleanedSearch = searchTerm.replace(tagPattern, '').trim();
      if (cleanedSearch !== '') {
        const term = cleanedSearch.toLowerCase();
        const inTitle = point.title && point.title.toLowerCase().includes(term);
        const inDesc = point.description && point.description.toLowerCase().includes(term);
        const inExamples = point.examples && point.examples.some(ex => ex.toLowerCase().includes(term));
        if (!inTitle && !inDesc && !inExamples) return false;
      }
      return true;
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading grammar appendix...</div>;
  if (error) return <div style={{ color: 'red', padding: 40, textAlign: 'center' }}>Error: {error}</div>;
  if (!data || data.length === 0) return <div style={{ padding: 40, textAlign: 'center' }}>No grammar data found.</div>;

  // Group sections by major tag (first tag in each point)
  const majorSections = {};
  data.forEach(section => {
    if (!section.points || section.points.length === 0) return;
    let majorTag = section.points[0].tags.find(tag => MAJOR_TAGS.includes(tag));
    if (!majorTag && MAJOR_TAGS.includes(section.title)) majorTag = section.title;
    if (!majorTag) return;
    if (!majorSections[majorTag]) majorSections[majorTag] = [];
    majorSections[majorTag].push(section);
  });

  return (
    <div className="App" style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1 style={{ textAlign: 'center' }}>Latin Grammar Appendix</h1>
      {/* Search bar */}
      <div style={{ margin: '0 0 18px 0', display: 'flex', justifyContent: 'center' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search grammar points..."
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '8px 14px',
            fontSize: 16,
            border: '1px solid #bbb',
            borderRadius: 6,
            outline: 'none',
            boxShadow: '0 1px 4px #0001',
          }}
        />
      </div>
      <div style={{ textAlign: 'center', marginTop: -12, marginBottom: 12, color: '#666', fontSize: 13 }}>
        <span style={{ background: '#f5f5f5', padding: '2px 10px', borderRadius: 6 }}>
          Tip: Use <b>tag:Conditionals</b> or <b>tag:Relative</b> in your search to filter by tags. Combine multiple tags with spaces.
        </span>
      </div>
      <TagBar tags={allTags} activeTags={activeTags} onTagClick={handleTagClick} data={data} />
      {activeTags.length === 0 && searchTerm.trim() === '' ? (
        MAJOR_TAGS.map(majorTag => (
          majorSections[majorTag] && majorSections[majorTag].length > 0 && (
            <div key={majorTag} style={{ marginBottom: 48 }}>
              <h2 
                id={`section-${majorTag.replace(/\s+/g, '-')}`}
                style={{ fontSize: 36, color: '#0d47a1', fontWeight: 900, margin: '48px 0 24px 0', letterSpacing: '-2px', borderBottom: '3px solid #90caf9', paddingBottom: 8 }}
              >
                {majorTag}
              </h2>
              {majorSections[majorTag].map(section => (
                <Section key={section.title} section={section} onTagClick={handleTagClick} activeTags={activeTags} showSectionHeader={section.title !== majorTag} majorTag={majorTag} filterPoints={filterPoints} />
              ))}
            </div>
          )
        ))
      ) : (
        <div style={{ marginTop: 24 }}>
          {(activeTags.length > 0 || searchTerm.trim() !== '') && (
            <h3 style={{ margin: '0 0 24px 0', color: '#495057', fontSize: 20 }}>
              Showing grammar points{activeTags.length > 0 ? ` with tags: ${activeTags.join(', ')}` : ''}{searchTerm.trim() !== '' ? ` matching: "${searchTerm}"` : ''}
            </h3>
          )}
          {data.map(section => 
            filterPoints(section.points || []).map(point => (
              <GrammarPoint key={point.number + point.title} point={point} onTagClick={handleTagClick} activeTags={activeTags} />
            ))
          )}
        </div>
      )}
      {(activeTags.length > 0 || searchTerm.trim() !== '') && (
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button onClick={() => { setActiveTags([]); setSearchTerm(''); }} style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#f8f8f8', cursor: 'pointer' }}>Clear all filters</button>
        </div>
      )}
    </div>
  );
}

export default App;
