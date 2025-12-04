import React, { useState, useEffect } from "react";
import "./Events.css";

const eventsData = [
  {
    id: 1,
    title: "UMass Amherst Farmers Market",
    date: "October 26, 2024",
    location: "Goodell Lawn",
    description:
      "Weekly farmers market featuring local vendors and artisans. Fresh produce, handmade goods, and campus community gathering.",
    category: "Community",
  },
  {
    id: 2,
    title: "Student Business Pop-Up Shop",
    date: "November 12, 2024",
    location: "Campus Center Auditorium",
    description: "Discover and support student-run businesses and creative projects.",
    category: "Business",
  },
  {
    id: 3,
    title: "Craft Fair & Artisan Showcase",
    date: "December 3, 2024",
    location: "Student Union Ballroom",
    description: "A festive market for handmade crafts, jewelry, and unique gifts.",
    category: "Arts & Crafts",
  },
  {
    id: 4,
    title: "Tech & Innovation Expo",
    date: "November 20, 2024",
    location: "Integrated Sciences Building",
    description:
      "Explore cutting-edge student projects and startup ideas. Network with tech enthusiasts and entrepreneurs.",
    category: "Technology",
  },
  {
    id: 5,
    title: "Vintage Marketplace",
    date: "December 10, 2024",
    location: "Old Chapel Courtyard",
    description:
      "Find unique vintage clothing, accessories, and collectibles from local sellers and students.",
    category: "Fashion",
  },
  {
    id: 6,
    title: "Book & Media Exchange",
    date: "November 30, 2024",
    location: "W.E.B. Du Bois Library Plaza",
    description:
      "Buy, sell, or trade textbooks, novels, vinyl records, and media. Save money and find hidden treasures.",
    category: "Books & Media",
  },
  {
    id: 7,
    title: "Student Music Fest",
    date: "December 15, 2024",
    location: "Fine Arts Center",
    description:
      "Enjoy performances by student bands, solo artists, and musical ensembles across campus.",
    category: "Music",
  },
];

export default function Events() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const featuredEvent = eventsData[0];
  const otherEvents = eventsData.slice(1);

  useEffect(() => {
    document.body.style.overflow = selectedEvent ? "hidden" : "auto";
  }, [selectedEvent]);

  return (
    <div className="events-page">
      {/* Header */}
      <header className="events-header">
        <h1 className="events-title">Upcoming Events</h1>
        <p className="events-subtitle">
          Discover amazing events happening around campus
        </p>
      </header>

      {/* Featured Event */}
      <section className="featured-event">
        <img
          src={`https://picsum.photos/seed/${featuredEvent.id}/800/400`}
          alt={featuredEvent.title}
          className="featured-image"
        />
        <div className="featured-content">
          <span className="featured-category">{featuredEvent.category}</span>
          <h2 className="featured-title">{featuredEvent.title}</h2>
          <p className="featured-description">{featuredEvent.description}</p>
          <p className="featured-meta">
            📅 {featuredEvent.date} | 📍 {featuredEvent.location}
          </p>
          <button
            className="btn-featured"
            onClick={() => setSelectedEvent(featuredEvent)}
          >
            View Details
          </button>
        </div>
      </section>

      {/* More Events */}
      <h2 className="section-title">More Events</h2>
      <section className="events-grid">
        {otherEvents.map((event) => (
          <div
            key={event.id}
            className="event-card"
            onClick={() => setSelectedEvent(event)}
          >
            <img
              src={`https://picsum.photos/seed/${event.id}/400/200`}
              alt={event.title}
              className="event-image"
            />
            <div className="event-info">
              <span className="event-category">{event.category}</span>
              <h3>{event.title}</h3>
              <p className="event-meta">
                📅 {event.date} | 📍 {event.location}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Modal */}
      {selectedEvent && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedEvent(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setSelectedEvent(null)}
            >
              ✕
            </button>
            <h2>{selectedEvent.title}</h2>
            <img
              src={`https://picsum.photos/seed/${selectedEvent.id}/800/400`}
              alt={selectedEvent.title}
            />
            <p>📅 {selectedEvent.date}</p>
            <p>📍 {selectedEvent.location}</p>
            <p>{selectedEvent.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
