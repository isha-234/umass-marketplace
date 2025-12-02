import React, { useState, useEffect } from "react";
import './Events.css';

const placeholderEvents = [
  {
    id: 1,
    title: "UMass Amherst Farmers Market",
    date: "October 26, 2024",
    location: "Goodell Lawn",
    description: "Weekly farmers market featuring local vendors and artisans. Fresh produce, handmade goods, and campus community gathering.",
    category: "Community"
  },
  {
    id: 2,
    title: "Student Business Pop-Up Shop",
    date: "November 12, 2024",
    location: "Campus Center Auditorium",
    description: "Discover and support student-run businesses and creative projects.",
    category: "Business"
  },
  {
    id: 3,
    title: "Craft Fair & Artisan Showcase",
    date: "December 3, 2024",
    location: "Student Union Ballroom",
    description: "A festive market for handmade crafts, jewelry, and unique gifts.",
    category: "Arts & Crafts"
  },
  {
    id: 4,
    title: "Tech & Innovation Expo",
    date: "November 20, 2024",
    location: "Integrated Sciences Building",
    description: "Explore cutting-edge student projects and startup ideas. Network with tech enthusiasts and entrepreneurs.",
    category: "Technology"
  },
  {
    id: 5,
    title: "Vintage Marketplace",
    date: "December 10, 2024",
    location: "Old Chapel Courtyard",
    description: "Find unique vintage clothing, accessories, and collectibles from local sellers and students.",
    category: "Fashion"
  },
  {
    id: 6,
    title: "Book & Media Exchange",
    date: "November 30, 2024",
    location: "W.E.B. Du Bois Library Plaza",
    description: "Buy, sell, or trade textbooks, novels, vinyl records, and media. Save money and find hidden treasures.",
    category: "Books & Media"
  },
  {
    id: 7,
    title: "Sustainability Fair",
    date: "December 15, 2024",
    location: "Campus Pond Area",
    description: "Learn about sustainable living, eco-friendly products, and zero-waste initiatives on campus.",
    category: "Sustainability"
  },
  {
    id: 8,
    title: "Holiday Gift Market",
    date: "December 18, 2024",
    location: "Student Union Atrium",
    description: "Perfect for holiday shopping! Unique gifts, handmade items, and special deals from campus vendors.",
    category: "Holiday"
  },
];

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const featuredEvent = placeholderEvents[0];
  const otherEvents = placeholderEvents.slice(1);

  const handleLearnMore = (event) => {
    setSelectedEvent(event);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="events-page">
      <div className="events-header">
        <h1 className="events-title">Upcoming Events</h1>
        <p className="events-subtitle">Discover amazing events happening around campus</p>
      </div>

      {/* Featured Event Banner */}
      <div className="container py-5">
        <div className="featured-event-banner">
          <div className="featured-image-section">
            <img 
              src={`https://picsum.photos/seed/${featuredEvent.id}/800/500`}
              alt={featuredEvent.title}
              className="featured-image"
            />
          </div>
          <div className="featured-content-section">
            <div className="featured-badge">✨ Featured Event</div>
            <h1 className="featured-title">{featuredEvent.title}</h1>
            <p className="featured-description">{featuredEvent.description}</p>
            <div className="featured-meta">
              <div className="meta-item">
                <span className="meta-icon">📅</span>
                <span>{featuredEvent.date}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">📍</span>
                <span>{featuredEvent.location}</span>
              </div>
              <div className="meta-item">
                <span className="meta-icon">🏷️</span>
                <span>{featuredEvent.category}</span>
              </div>
            </div>
            <button className="btn-featured" onClick={() => handleLearnMore(featuredEvent)}>
              View Details
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>

        <div className="events-grid">
          {otherEvents.map((event, index) => (
            <div 
              key={event.id} 
              className="event-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="event-image-container">
                <img 
                  src={`https://picsum.photos/seed/${event.id}/600/300`} 
                  className="event-image" 
                  alt={event.title} 
                />
                <div className="event-overlay"></div>
              </div>
              <div className="event-content">
                <div className="event-category-badge">{event.category}</div>
                <h3 className="event-title">{event.title}</h3>
                <div className="event-meta">
                  <div className="event-meta-item">
                    <span className="meta-icon">📅</span>
                    <span className="meta-text">{event.date}</span>
                  </div>
                  <div className="event-meta-item">
                    <span className="meta-icon">📍</span>
                    <span className="meta-text">{event.location}</span>
                  </div>
                </div>
                <p className="event-description">{event.description}</p>
                <button 
                  onClick={() => handleLearnMore(event)} 
                  className="btn-learn-more"
                >
                  Learn More
                  <span className="btn-arrow">→</span>
                </button>
              </div>
            </div>
        ))}
        </div>
      </div>

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={handleCloseModal} />
      )}
    </div>
  );
}

function EventModal({ event, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>
        <div className="modal-header-section">
          <h2 className="modal-title">{event.title}</h2>
        </div>
        <div className="modal-body-section">
          <div className="modal-image">
            <img 
              src={`https://picsum.photos/seed/${event.id}/800/400`} 
              alt={event.title}
            />
          </div>
          <div className="modal-info">
            <div className="modal-info-item">
              <span className="info-label">📅 Date</span>
              <span className="info-value">{event.date}</span>
            </div>
            <div className="modal-info-item">
              <span className="info-label">📍 Location</span>
              <span className="info-value">{event.location}</span>
            </div>
            <div className="modal-info-item">
              <span className="info-label">📝 Description</span>
              <p className="info-description">{event.description}</p>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-register">Register Now</button>
            <button className="btn-share">Share Event</button>
          </div>
        </div>
      </div>
    </div>
  );
}
