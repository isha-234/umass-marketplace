import React, { useState, useEffect } from "react";
import "./Events.css";

// Local images
import farmersMarket from "./images/farmerMarket.jpeg";
import popupShop from "./images/popup.jpeg";
import craftFair from "./images/new2u.jpeg";
import techExpo from "./images/techExpo.jpeg";
import vintageMarket from "./images/vintageMarket.jpeg";
import bookExchange from "./images/bookMedia.jpeg";
import musicFest from "./images/musicFest.jpeg";

const eventsData = [
  {
    id: 1,
    title: "UMass Amherst Farmers Market",
    date: "October 26, 2024",
    location: "Goodell Lawn",
    description:
      "Weekly farmers market featuring local vendors and artisans. Fresh produce, handmade goods, and campus community gathering.",
    category: "Community",
    image: farmersMarket,
  },
  {
    id: 2,
    title: "Student Business Pop-Up Shop",
    date: "November 12, 2024",
    location: "Campus Center Auditorium",
    description: "Discover and support student-run businesses.",
    category: "Business",
    image: popupShop,
  },
  {
    id: 3,
    title: "New2U Tag Sale",
    date: "December 3, 2024",
    location: "Student Union Ballroom",
    description: "Shop lowcost, used dorm items, clothing, and essentials donated during UMass move out.",
    category: "Reuse and Resale",
    image: craftFair,
  },
  {
    id: 4,
    title: "Tech and Innovation Expo",
    date: "November 20, 2024",
    location: "Integrated Sciences Building",
    description: "Explore cutting-edge student projects and startup ideas.",
    category: "Technology",
    image: techExpo,
  },
  {
    id: 5,
    title: "Vintage Marketplace",
    date: "December 10, 2024",
    location: "Old Chapel Courtyard",
    description: "Find unique vintage clothing and collectibles.",
    category: "Fashion",
    image: vintageMarket,
  },
  {
    id: 6,
    title: "Book and Media Exchange",
    date: "November 30, 2024",
    location: "Du Bois Library Plaza",
    description:
      "Buy, sell, or trade textbooks, novels, vinyl records, and media.",
    category: "Books and Media",
    image: bookExchange,
  },
  {
    id: 7,
    title: "Student Music Fest",
    date: "December 15, 2024",
    location: "Fine Arts Center",
    description: "Enjoy performances by student bands and musical ensembles.",
    category: "Music",
    image: musicFest,
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
        <h1 className="events-title">Exclusive UMass Community Events</h1>
        <p className="events-subtitle">
          Discover amazing events happening around campus
        </p>
      </header>

      {/* Featured Event */}
      <section className="featured-event">
        <img
          src={featuredEvent.image}
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
              src={event.image}
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
              src={selectedEvent.image}
              alt={selectedEvent.title}
            />

            <p>📅 {selectedEvent.date}</p>
            <p>📍 {selectedEvent.location}</p>
            <p>{selectedEvent.description}</p>
          </div>
        </div>
      )}

      {/* Feature Your Event Section */}
      <section className="feature-event-section">
        <h2 className="section-title">Feature Your Event</h2>
        <p>
          Want your event to be listed here? Contact us at{" "}
          <a href="mailto:events@umass.edu">events@umass.edu</a> or call us at (413) 545-XXXX.
        </p>
      </section>
    </div>
  );
}
