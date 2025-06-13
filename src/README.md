<!--
Mergington High School Activities API

This FastAPI application enables students to view and sign up for extracurricular activities at Mergington High School.

Features:
- View all available extracurricular activities
- Sign up for activities

Getting Started:
1. Install dependencies: `pip install fastapi uvicorn`
2. Run the application: `python app.py`
3. Access API docs at http://localhost:8000/docs or http://localhost:8000/redoc

API Endpoints:
- GET `/activities`: Retrieve all activities with details and participant counts
- POST `/activities/{activity_name}/signup?email=student@mergington.edu`: Sign up for an activity

Data Model:
- Activities: Identified by name, includes description, schedule, max participants, and signed-up student emails
- Students: Identified by email, includes name and grade level

Note: All data is stored in memory and resets on server restart.
-->
2. **Students** - Uses email as identifier:
   - Name
   - Grade level

All data is stored in memory, which means data will be reset when the server restarts.
