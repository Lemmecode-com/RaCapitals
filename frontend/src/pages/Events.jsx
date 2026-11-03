import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { formatShortDate } from '../utils/format'
import ComplianceRibbon from '../components/common/ComplianceRibbon'
import Footer from '../components/common/Footer'
import Navbar from '../components/common/Navbar'

const eventTypeClass = (type) => {
  switch (type) {
    case 'DRHP': return 'event-tag-drhp'
    case 'Funding': return 'event-tag-funding'
    case 'Leadership Change': return 'event-tag-leadership'
    default: return 'event-tag-other'
  }
}

const Events = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.get('/events')
      .then((res) => { if (active) setEvents(res.data) })
      .catch(() => { if (active) setEvents([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const groupedEvents = events.reduce((acc, ev) => {
    const d = new Date(ev.eventDate);
    if (isNaN(d)) return acc;
    const monthYear = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) acc[monthYear] = [];
    acc[monthYear].push(ev);
    return acc;
  }, {});

  return (
    <div className="page-wrap">
      <Navbar />
      <ComplianceRibbon />
      <main className="page-main">
        <div className="page-header">
          <h1>Events</h1>
          <p className="page-subtitle">Corporate events, most recent first.</p>
        </div>

        {loading ? (
          <p className="muted">Loading events...</p>
        ) : events.length === 0 ? (
          <div className="chart-empty">No events have been published yet.</div>
        ) : (
          <div className="events-timeline-wrap">
            {Object.entries(groupedEvents).map(([monthYear, monthEvents]) => (
              <div className="timeline-group" key={monthYear}>
                <h2 className="timeline-month-header">{monthYear}</h2>
                <div className="timeline-list">
                  {monthEvents.map((ev) => {
                    const d = new Date(ev.eventDate);
                    const day = d.toLocaleDateString('en-US', { day: 'numeric' });
                    const monthShort = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                    
                    return (
                      <div className="timeline-row" key={ev._id}>
                        <div className="timeline-date-col">
                          <span className="timeline-day">{day}</span>
                          <span className="timeline-month">{monthShort}</span>
                        </div>
                        
                        <div className="timeline-dot-wrap">
                          <div className="timeline-dot"></div>
                          <div className="timeline-line"></div>
                        </div>
                        
                        <div className="event-timeline-card">
                          <div className="event-timeline-card-head">
                            {ev.company ? (
                              <Link to={`/company/${ev.company._id}`} className="event-company-name">
                                {ev.company.name}
                              </Link>
                            ) : (
                              <span className="event-company-name">Unknown Company</span>
                            )}
                            <span className={`event-tag ${eventTypeClass(ev.eventType)}`}>{ev.eventType}</span>
                          </div>
                          
                          <h3 className="event-title">{ev.title}</h3>
                          {ev.description && <p className="event-desc">{ev.description}</p>}
                          
                          <div className="event-timeline-card-foot">
                            <Link to={`/company/${ev.company?._id || ''}`} className="timeline-view-doc">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                              </svg>
                              View details
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default Events