import React, { useState, useEffect } from "react";
import "./Events.css";

// Optional: Local images as placeholders if backend image is empty
import farmersMarket from "./images/farmerMarket.jpeg";
import popupShop from "./images/popup.jpeg";
import craftFair from "./images/new2u.jpeg";
import techExpo from "./images/techExpo.jpeg";
import vintageMarket from "./images/vintageMarket.jpeg";
import bookExchange from "./images/bookMedia.jpeg";
import musicFest from "./images/musicFest.jpeg";

const placeholderImages = [
  farmersMarket,
  popupShop,
  craftFair,
  techExpo,
  vintageMarket,
  bookExchange,
  musicFest,
];

export default function Events() {
  const [eventsData, setEventsData] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/events/");
        const data = await response.json();

        // Assign placeholder images if backend doesn't have images
        const eventsWithImages = data.map((event, index) => ({
          ...event,
          image: event.image || placeholderImages[index % placeholderImages.length],
        }));

        setEventsData(eventsWithImages);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedEvent ? "hidden" : "auto";
  }, [selectedEvent]);

  if (eventsData.length === 0) {
    return <p>Loading events...</p>;
  }

  const featuredEvent = eventsData[0];
  const otherEvents = eventsData.slice(1);

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
