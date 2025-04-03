## Video for presentation
link: https://www.loom.com/share/c266a9da780b4bebb13a44d38c39f0c2


# Event Locator App

The **Event Locator App** is an intuitive platform designed to help users discover events based on their interests, location preferences, and category preferences. Whether you're looking for tech conferences, music festivals, or local community events, this app helps you stay updated on the events that matter most to you. 

## Features

- **Event Discovery**: Users can search for events based on categories (e.g., Technology, Music, Sports).
- **User Preferences**: Users can set their event preferences, including location, category, and radius.
- **Notifications**: Receive real-time notifications for events that match your preferences.
- **Location-based Filtering**: Events are filtered based on the user's preferred location and radius.
- **User Profiles**: Users can create profiles, set preferences, and manage event notifications.

## Technologies Used

- **Backend**: Node.js with Express
- **Database**: PostgreSQL (for storing users, events, and preferences)
- **Real-time Notifications**: Redis (for publishing notifications to users)
- **Geolocation**: Geolib (for calculating distances between locations)
- **API**: RESTful API for handling event and user preferences
- **Deployment**: Docker (optional, for containerization)

## Installation

### Prerequisites

- **Node.js** (v14 or later)
- **PostgreSQL** (for storing events, users, and preferences)
- **Redis** (for handling real-time notifications)
- **Geolib** (for distance calculations)

### Steps to Set Up the Project

1. **Clone the repository:**
   ```bash
   git clone https://github.com/angep72/Event-locator-app.git
   cd event-locator-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following environment variables:
   ```env
   DB_HOST=your-database-host
   DB_PORT=5432
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   DB_NAME=your-database-name
   REDIS_HOST=your-redis-host
   REDIS_PORT=6379
   ```

4. **Start PostgreSQL and Redis:**
   If you're running locally, you can start PostgreSQL and Redis using Docker:
   ```bash
   docker-compose up
   ```

5. **Run the app:**
   Start the server:
   ```bash
   npm start
   ```
   The app should now be running on [http://localhost:3000](http://localhost:3000).

6. **Set up the database schema**:
   Use the provided SQL scripts to create necessary tables in your PostgreSQL database:
   ```bash
   npm run migrate
   ```

---

## API Endpoints

### 1. **POST /events**
Create a new event.
#### Request Body:
```json
{
  "event_name": "Tech Conference 2025",
  "description": "A conference about technology and innovation.",
  "start_date": "2025-06-15T09:00:00Z",
  "end_date": "2025-06-15T17:00:00Z",
  "location_id": 1,
  "user_id": 123
}
```
#### Response:
```json
{
  "status": "success",
  "data": {
    "event_id": 101,
    "event_name": "Tech Conference 2025",
    "start_date": "2025-06-15T09:00:00Z",
    "end_date": "2025-06-15T17:00:00Z"
  }
}
```

### 2. **POST /user-preference**
Set a user's event preferences.
#### Request Body:
```json
{
  "user_id": 123,
  "category_id": 2,
  "preferred_location_id": 1,
  "preferred_radius": 10
}
```
#### Response:
```json
{
  "status": "success",
  "data": {
    "user_id": 123,
    "category_id": 2,
    "preferred_location_id": 1,
    "preferred_radius": 10
  }
}
```

### 3. **POST /notifications/send**
Send notifications to users based on event preferences.
#### Request Body:
```json
{
  "event_id": 101,
  "event_name": "Tech Conference 2025",
  "event_category": 2,
  "event_lat": 40.785091,
  "event_lon": -73.968285,
  "event_start_time": "2025-06-15T09:00:00Z"
}
```
#### Response:
```json
{
  "message": "Notifications queued successfully for users."
}
```

---

## How It Works

1. **User Preferences**: Users can set their event preferences, such as their favorite event categories (e.g., Technology, Music) and preferred event radius. This allows them to only receive notifications about events that match their interests and are located within a certain distance.
   
2. **Event Creation**: Events are added to the system with relevant information, including event name, description, start/end dates, and location.

3. **Notification System**: When a new event is added, the app sends notifications to all users whose preferences match the event category and are within the specified radius from the event location. The notification is sent in real-time via Redis to a specific channel for each user.

---

## Contributing

1. Fork this repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to your branch (`git push origin feature/your-feature`).
5. Create a new Pull Request.

---


## Contact

For questions or support, please contact the development team at [umunyanaange885@gmail.com].

