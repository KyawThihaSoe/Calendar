import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button, Modal } from "antd";
import "./TeamCalendar.css";

const localizer = momentLocalizer(moment);

const TeamCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formValues, setFormValues] = useState({
    title: "",
    start: "",
    end: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState("week");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/events");
      const formattedEvents = response.data.map((event) => ({
        ...event,
        start: moment(event.start).toDate(),
        end: moment(event.end).toDate(),
      }));
      setEvents(formattedEvents);
    } catch (error) {
      console.log("Error fetching events", error);
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setFormValues({
      title: event.title,
      start: moment(event.start).format("YYYY-MM-DDTHH:mm"),
      end: moment(event.end).format("YYYY-MM-DDTHH:mm"),
    });
    setIsModalOpen(true);
  };

  const handleEventResize = async (event) => {
    // Handle resizing of events here
    // You may want to update the event's start and end time in the backend
  };

  const handleSelectSlot = ({ start, end }) => {
    const startFormatted = moment(start).format("YYYY-MM-DDTHH:mm");
    const endFormatted = moment(end).format("YYYY-MM-DDTHH:mm");

    setSelectedEvent(null);
    setFormValues({ title: "", start: startFormatted, end: endFormatted });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedEvent) {
        await axios.put(
          `http://localhost:8000/api/events/${selectedEvent._id}`,
          formValues
        );
      } else {
        await axios.post("http://localhost:8000/api/events", formValues);
      }
      fetchEvents();
      setIsModalOpen(false);
      setSelectedEvent(null);
      setFormValues({ title: "", start: "", end: "" });
    } catch (error) {
      console.log("Error saving event", error);
    }
  };

  const handleDeleteEvent = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/api/events/${selectedEvent._id}`
      );
      fetchEvents();
      setIsModalOpen(false);
      setSelectedEvent(null);
      setFormValues({ title: "", start: "", end: "" });
    } catch (error) {
      console.log("Error deleting event", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setFormValues({ title: "", start: "", end: "" });
  };

  const CustomToolbar = ({ localizer: { messages }, label }) => {
    return (
      <div className="rbc-toolbar">
        <span>{label}</span>
        <div className="rbc-btn-group">
          <Button
            type="text"
            onClick={() => setView("week")}
            className={view === "week" ? "active" : ""}
          >
            {messages.week}
          </Button>
          <Button
            type="text"
            onClick={() => setView("day")}
            className={view === "day" ? "active" : ""}
          >
            {messages.day}
          </Button>
          <Button
            type="text"
            onClick={() => setView("agenda")}
            className={view === "agenda" ? "active" : ""}
          >
            {messages.agenda}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="custom-calendar-container">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        view={view}
        views={{ week: true, day: true, agenda: true }}
        components={{
          toolbar: CustomToolbar,
        }}
        selectable
        resizable
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        onEventResize={handleEventResize}
      />

      <Modal
        title={selectedEvent ? "Edit Event" : "Create New Event"}
        visible={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        centered
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={formValues.title}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>Start Date & Time:</label>
            <input
              type="datetime-local"
              name="start"
              value={formValues.start}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label>End Date & Time:</label>
            <input
              type="datetime-local"
              name="end"
              value={formValues.end}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <div className="button-container">
            <Button type="primary" htmlType="submit">
              {selectedEvent ? "Update Event" : "Create Event"}
            </Button>
            {selectedEvent && (
              <Button type="primary" danger onClick={handleDeleteEvent}>
                Delete Event
              </Button>
            )}
            <Button type="default" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamCalendar;
