# Employee Clocking System

A simple employee clocking/attendance system web application built with React, Vite, Tailwind CSS, and json-server.

## Tech Stack

- **React** with Vite
- **Tailwind CSS** for styling
- **React Router v6** for routing
- **json-server** for mock REST API
- **Fetch API** for HTTP requests

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the json-server (mock backend):

```bash
npm run server
```

This starts the API server on `http://localhost:3001`

3. In a new terminal, start the development server:

```bash
npm run dev
```

This starts the React app on `http://localhost:3000`

## API Endpoints

The json-server provides the following REST endpoints:

- `GET /attendance` - Get all attendance records
- `POST /attendance` - Create a new attendance record
- `PATCH /attendance/:id` - Update an attendance record
- `GET /attendance?name_like=query` - Search by employee name

## Project Structure

```
src/
├── components/
│   ├── ClockForm.jsx       # Clock in/out form
│   ├── AttendanceTable.jsx # Attendance records table
│   ├── SearchBar.jsx       # Search input component
│   └── Charts.jsx          # Bar chart, pie chart, stat cards
├── pages/
│   ├── Clocking.jsx        # Main clocking page
│   └── Analytics.jsx       # Analytics dashboard
├── services/
│   └── api.js              # API service functions
├── App.jsx                 # Main app with routing
├── main.jsx                # Entry point
└── index.css               # Tailwind imports
```

## Features

### Clocking Page (/)

- Enter employee name and clock in/out
- Automatic date, day, and time generation
- View all attendance records in a table

### Analytics Page (/analytics)

- Search/filter records by employee name
- View statistics (days present, clock-ins, clock-outs)
- Bar chart showing days attended per employee
- Pie chart showing clock-in status distribution
- Filtered attendance records table

## Data Model

Each attendance record has the following structure:

```json
{
  "id": 1,
  "name": "John Doe",
  "date": "2026-02-08",
  "day": "Sunday",
  "clockInTime": "09:00:15",
  "clockOutTime": "17:30:45",
  "clockIn": true,
  "clockOut": true
}
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run server` - Start json-server
