import React, { useEffect, useState } from 'react';
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

function Section({ section, onTagClick, activeTags, showSectionHeader, majorTag }) {
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
      {section.points.map(point => (
        (activeTags.length === 0 || (point.tags && activeTags.every(tag => point.tags.includes(tag)))) &&
        <GrammarPoint key={point.number + point.title} point={point} onTagClick={onTagClick} activeTags={activeTags} />
      ))}
    </div>
  );
}

function TagBar({ tags, activeTags, onTagClick }) {
  // Separate major and section tags, deduplicate, and order
  const majorTags = MAJOR_TAGS.filter(tag => tags.includes(tag));
  const sectionTags = tags.filter(tag => !MAJOR_TAGS.includes(tag));
  return (
    <div style={{ margin: '16px 0', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      <strong style={{ marginRight: 8 }}>Filter by tags: </strong>
      <Tag tag={null} onClick={() => onTagClick(null)} active={activeTags.length === 0} isMajor={false}>All</Tag>
      {majorTags.map(tag => (
        <Tag key={tag} tag={tag} onClick={onTagClick} active={activeTags.includes(tag)} isMajor={true} />
      ))}
      {sectionTags.map(tag => (
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

function Sidebar({ data, onSectionClick, searchTerm, setSearchTerm, activeSection }) {
  const [majorSections, setMajorSections] = useState({});

  useEffect(() => {
    if (!data || data.length === 0) return;
    
    // Group sections by major tag
    const grouped = {};
    data.forEach(section => {
      if (!section.points || section.points.length === 0) return;
      let majorTag = section.points[0].tags.find(tag => MAJOR_TAGS.includes(tag));
      if (!majorTag && MAJOR_TAGS.includes(section.title)) majorTag = section.title;
      if (!majorTag) return;
      
      if (!grouped[majorTag]) grouped[majorTag] = [];
      grouped[majorTag].push(section);
    });
    setMajorSections(grouped);
  }, [data]);

  const filteredSections = Object.entries(majorSections).map(([majorTag, sections]) => {
    const filteredSubsections = sections.filter(section => 
      !searchTerm || 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.points.some(point => 
        point.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (point.description && point.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    );
    
    return { majorTag, sections: filteredSubsections };
  }).filter(({ sections }) => sections.length > 0);

  return (
    <div style={{
      width: 300,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: '#f8f9fa',
      borderRight: '1px solid #dee2e6',
      overflowY: 'auto',
      padding: '20px 0',
      zIndex: 1000,
    }}>
      <div style={{ padding: '0 20px 20px 20px', borderBottom: '1px solid #dee2e6' }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#495057', fontSize: 18 }}>Navigation</h3>
        <input
          type="text"
          placeholder="Search grammar points..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #ced4da',
            borderRadius: 4,
            fontSize: 14,
            outline: 'none',
          }}
        />
      </div>
      
      <div style={{ padding: '20px' }}>
        {filteredSections.map(({ majorTag, sections }) => (
          <div key={majorTag} style={{ marginBottom: 24 }}>
            <h4 style={{
              margin: '0 0 12px 0',
              color: '#0d47a1',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: 4,
              background: activeSection === majorTag ? '#e3f2fd' : 'transparent',
              transition: 'background 0.2s',
            }}
            onClick={() => onSectionClick(majorTag)}
            >
              {majorTag}
            </h4>
            <div style={{ marginLeft: 16 }}>
              {sections.map(section => (
                <div
                  key={section.title}
                  style={{
                    padding: '6px 12px',
                    marginBottom: 4,
                    fontSize: 14,
                    color: '#495057',
                    cursor: 'pointer',
                    borderRadius: 4,
                    background: activeSection === section.title ? '#e9ecef' : 'transparent',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => onSectionClick(section.title)}
                >
                  {section.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
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
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    fetch('/grammar_appendix.json')
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

  const handleSectionClick = (sectionTitle) => {
    setActiveSection(sectionTitle);
    
    // First try to find the section header
    let element = document.getElementById(`section-${sectionTitle.replace(/\s+/g, '-')}`);
    
    // If no header found, try to find the first grammar point in that section
    if (!element) {
      // Find the section in the data
      const section = data.find(s => s.title === sectionTitle);
      if (section && section.points && section.points.length > 0) {
        // Create a temporary ID for the first grammar point
        const firstPointId = `point-${section.points[0].number}-${section.points[0].title.replace(/\s+/g, '-')}`;
        element = document.getElementById(firstPointId);
      }
    }
    
    // If still no element found, try to find the major section header
    if (!element) {
      // Find which major tag this section belongs to
      const section = data.find(s => s.title === sectionTitle);
      if (section && section.points && section.points.length > 0) {
        let majorTag = section.points[0].tags.find(tag => MAJOR_TAGS.includes(tag));
        if (!majorTag && MAJOR_TAGS.includes(section.title)) majorTag = section.title;
        if (majorTag) {
          element = document.getElementById(`section-${majorTag.replace(/\s+/g, '-')}`);
        }
      }
    }
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading grammar appendix...</div>;
  if (error) return <div style={{ color: 'red', padding: 40, textAlign: 'center' }}>Error: {error}</div>;
  if (!data || data.length === 0) return <div style={{ padding: 40, textAlign: 'center' }}>No grammar data found.</div>;

  // Group sections by major tag (first tag in each point)
  const majorSections = {};
  data.forEach(section => {
    if (!section.points || section.points.length === 0) return;
    // Use the first major tag found in the section's points, or the section title if it's a major tag
    let majorTag = section.points[0].tags.find(tag => MAJOR_TAGS.includes(tag));
    if (!majorTag && MAJOR_TAGS.includes(section.title)) majorTag = section.title;
    if (!majorTag) return;
    
    // If the section title is the same as the major tag, don't show it as a subheader
    // If the section title is different from the major tag, it will be shown as a subheader
    if (!majorSections[majorTag]) majorSections[majorTag] = [];
    majorSections[majorTag].push(section);
  });

  return (
    <div className="App" style={{ display: 'flex', fontFamily: 'system-ui, sans-serif' }}>
      <Sidebar 
        data={data} 
        onSectionClick={handleSectionClick} 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        activeSection={activeSection}
      />
      
      <div style={{ marginLeft: 300, flex: 1, maxWidth: 'calc(100vw - 300px)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
          <h1 style={{ textAlign: 'center' }}>Latin Grammar Appendix</h1>
          <TagBar tags={allTags} activeTags={activeTags} onTagClick={handleTagClick} />
          {activeTags.length === 0 ? (
            // Show normal structure when no filters are active
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
                    <Section key={section.title} section={section} onTagClick={handleTagClick} activeTags={activeTags} showSectionHeader={section.title !== majorTag} majorTag={majorTag} />
                  ))}
                </div>
              )
            ))
          ) : (
            // Show only filtered grammar points when filters are active
            <div style={{ marginTop: 24 }}>
              <h3 style={{ margin: '0 0 24px 0', color: '#495057', fontSize: 20 }}>
                Showing grammar points with tags: {activeTags.join(', ')}
              </h3>
              {data.map(section => 
                section.points && section.points
                  .filter(point => point.tags && activeTags.every(tag => point.tags.includes(tag)))
                  .map(point => (
                    <GrammarPoint key={point.number + point.title} point={point} onTagClick={handleTagClick} activeTags={activeTags} />
                  ))
              )}
            </div>
          )}
          {activeTags.length > 0 && (
            <div style={{ marginTop: 32, textAlign: 'center' }}>
              <button onClick={() => setActiveTags([])} style={{ padding: '6px 16px', borderRadius: 4, border: '1px solid #ccc', background: '#f8f8f8', cursor: 'pointer' }}>Clear all filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
