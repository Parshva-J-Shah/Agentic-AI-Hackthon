✈️ TravelPilot

Intelligent Trip Planning & Disruption Management Agent

🔗 Live Demo: https://travelpilot-liart.vercel.app/
🔗 GitHub: https://github.com/Parshva-J-Shah/Agentic-AI-Hackthon

Plan your trip. Manage your itinerary. Adapt when plans change.

TravelPilot is an AI-powered travel agent that doesn't just recommend places — it builds, manages, and continuously adapts an entire trip itinerary based on the user's schedule, budget, interests, preferences, location, and unexpected disruptions.

🎯 Problem

Planning a trip requires coordinating multiple things at once:

Transportation

Accommodation

Activities

Opening hours

Travel time

Budget

Personal interests

Daily schedules

The problem becomes harder when something changes.

For example:

A museum booking gets cancelled.

A traditional travel recommendation tool may simply suggest another museum.

TravelPilot instead understands the existing itinerary, identifies what is affected, finds suitable alternatives, checks timing and travel constraints, recalculates the budget, and rebuilds the affected part of the itinerary.

💡 Solution

TravelPilot acts as an AI trip-management agent.

Users provide:

📍 Destination

📅 Travel dates

💰 Budget

❤️ Interests

⚙️ Preferences

TravelPilot then:

Generates a day-by-day itinerary.

Organizes activities based on time and location.

Estimates travel time and costs.

Detects scheduling conflicts.

Answers natural-language questions about the trip.

Responds to changes in user constraints.

Detects disruptions.

Finds alternative activities.

Rebuilds affected parts of the itinerary.

Updates the budget and schedule.

🤖 Why TravelPilot Is Agentic

TravelPilot is designed to do more than generate a static AI response.

The agent follows a continuous workflow:

User Goal
    ↓
Understand Request
    ↓
Read Current Trip State
    ↓
Create Plan
    ↓
Select Appropriate Tools
    ↓
Execute Tools
    ↓
Observe Results
    ↓
Check Constraints
    ↓
Re-plan if Necessary
    ↓
Validate
    ↓
Update Itinerary
    ↓
Explain Changes

For example:

"Louvre booking is cancelled."
            ↓
      TravelPilot Agent
            ↓
   Check current itinerary
            ↓
   Identify affected time
            ↓
   Find alternatives
            ↓
 Check location + timing + cost
            ↓
    Rebuild affected schedule
            ↓
    Recalculate trip budget
            ↓
       Updated itinerary

✨ Key Features

🗓️ AI Itinerary Generation

Generate a day-by-day itinerary based on:

Destination

Travel dates

Budget

Interests

Preferences

Activity duration

Opening hours

Travel time

📍 Location-Aware Planning

TravelPilot considers the location of activities and tries to group nearby activities together.

This helps reduce unnecessary travel.

Hotel
  ↓ 15 min
Museum
  ↓ 10 min
Restaurant
  ↓ 12 min
Park

💰 Budget Management

TravelPilot estimates:

Accommodation

Transportation

Activities

Food

Daily spending

Total trip cost

Remaining budget

Users can also change their budget and ask TravelPilot to re-plan.

Example:

"My budget has decreased to ₹20,000."

The agent can identify expensive components and suggest alternatives.

🚨 Disruption Management

Travel plans can change.

TravelPilot can handle scenarios such as:

Activity cancellation

Venue unavailability

Schedule changes

User constraint changes

Weather-related disruptions

The agent identifies the affected part of the itinerary and proposes alternatives.

🔄 Intelligent Re-planning

TravelPilot does not simply replace one activity.

It considers the impact of the change on the rest of the schedule.

Example:

BEFORE

10:00  Louvre
13:00  Lunch
15:00  Musée d'Orsay
18:00  Seine Cruise


Louvre CANCELLED
        ↓
   AI Agent analyzes
        ↓

AFTER

10:00  Musée d'Orsay
13:30  Lunch
15:00  Seine Cruise
18:00  Alternative Activity

The system also explains why the itinerary changed.

💬 Natural-Language Travel Assistant

Users can interact with TravelPilot naturally.

Examples:

"What should I do tomorrow morning?"

"Can I fit the Eiffel Tower into today's schedule?"

"Which activities are close to my hotel?"

"What happens if my museum booking is cancelled?"

"Reduce my budget to ₹20,000."

⚠️ Conflict Detection

TravelPilot checks whether activities can realistically fit together.

For example:

Activity A
10:00 → 12:00

Travel time
30 minutes

Activity B
12:15 → 14:00

Since:

12:00 + 30 minutes = 12:30

Activity B creates a scheduling conflict.

TravelPilot can detect the conflict and propose a solution.

🏗️ Architecture

                         USER
                           │
                           ▼
                 ┌────────────────────┐
                 │   React Frontend   │
                 │   Vite + TypeScript│
                 └─────────┬──────────┘
                           │
                        REST / JSON
                           │
                           ▼
                 ┌────────────────────┐
                 │   FastAPI Backend  │
                 └─────────┬──────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       ┌──────────────┐         ┌───────────────┐
       │ Travel Agent │         │   Supabase    │
       │              │         │ PostgreSQL +  │
       │ Intent       │         │ Auth          │
       │ Planning     │         └───────────────┘
       │ Re-planning  │
       └──────┬───────┘
              │
        ┌─────┴─────┐
        ▼           ▼
   ┌─────────┐ ┌──────────┐
   │ Gemini  │ │  Tavily  │
   │   LLM   │ │ Web Search│
   └─────────┘ └──────────┘

🛠️ Tech Stack

Frontend

React

Vite

TypeScript

Tailwind CSS

shadcn/ui

Backend

Python

FastAPI

AI

Google Gemini API

Function / tool calling

Agent orchestration

Web Search

Tavily API

Database & Authentication

Supabase

PostgreSQL

Supabase Authentication

Deployment

Vercel — Frontend

Render — Backend

Supabase — Database & Authentication

MVP API Scope

TravelPilot intentionally keeps the MVP architecture lightweight.

The current MVP does not require separate Maps, Weather, Places, or Currency APIs. Travel information such as estimated travel time, weather/context, and costs is handled through the existing backend/agent architecture and available data.

The frontend communicates only with the FastAPI backend and does not directly call Gemini, Tavily, or the Supabase database.

🗃️ Database

TravelPilot uses Supabase PostgreSQL to maintain structured trip state.

Core entities:

Trips
 │
 ├── Itinerary Days
 │      │
 │      └── Activities
 │
 ├── Transportation
 │
 └── Disruptions

The itinerary is stored as structured data rather than only as AI-generated text.

This allows the backend to:

Detect conflicts

Recalculate costs

Modify activities

Re-plan schedules

Track disruptions

🔌 API Architecture

The frontend communicates with the FastAPI backend through REST APIs.

The frontend does not directly call Gemini, Tavily, or the Supabase database. AI/tool execution and database operations remain on the backend.

Example:

POST /api/trips

Creates a trip.

POST /api/trips/{trip_id}/generate

Generates an itinerary.

POST /api/trips/{trip_id}/chat

Allows natural-language interaction.

PATCH /api/trips/{trip_id}/constraints

Changes trip constraints and triggers re-planning.

POST /api/trips/{trip_id}/disruptions

Reports a disruption and triggers alternative planning.

🔐 Security

TravelPilot follows basic security practices:

API keys and secrets are stored in environment variables.

Secrets are never committed to GitHub.

.env files are excluded from Git.

Gemini and Tavily are accessed through the backend.

The frontend uses the Supabase public/anon key for authentication.

Backend logic validates itinerary changes before applying them.

The LLM does not directly modify the database.

🎬 Hackathon Demo

The primary demonstration showcases TravelPilot's disruption-management capability.

Demo Flow

1. Sign up / Login
        ↓
2. Create a trip
        ↓
3. Enter destination, dates,
   budget and interests
        ↓
4. Generate itinerary
        ↓
5. Display trip dashboard
        ↓
6. Ask TravelPilot AI a question
        ↓
7. Simulate a disruption
        ↓
8. Agent analyzes the itinerary
        ↓
9. Agent finds alternatives
        ↓
10. Agent checks timing,
    travel constraints and budget
        ↓
11. Apply alternative
        ↓
12. Show BEFORE → AFTER
        ↓
13. Updated itinerary and budget

The disruption can be demonstrated with any destination supported by the application; the demo is not limited to Paris.

This demonstrates that TravelPilot is an active trip-management agent, rather than simply a travel chatbot.

📁 Project Structure

TravelPilot/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── agent/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── tools/
│   │   └── database/
│   └── requirements.txt
│
├── 01_PRD.md
├── 02_TECH_STACK.md
├── 03_ARCHITECTURE.md
├── 04_API_CONTRACT.md
├── 05_AGENT_WORKFLOW.md
├── 06_TASKS_AND_EXECUTION_PLAN.md
│
├── .gitignore
└── README.md

🚀 Getting Started

1. Clone the repository

git clone https://github.com/Parshva-J-Shah/Agentic-AI-Hackthon.git
cd Agentic-AI-Hackthon

2. Configure environment variables

Backend

Create backend/.env:

GEMINI_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

Frontend

Create frontend/.env:

VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Never commit real API keys or secrets to GitHub. Keep .env files in .gitignore.

3. Start Backend

cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

4. Start Frontend

cd frontend
npm install
npm run dev

👥 Team

TravelPilot is developed by a two-member hackathon team.

AI / Backend

Responsible for:

AI agent

LLM integration

Backend

APIs

Database

Agent tools

Itinerary logic

Re-planning

Frontend / Product

Responsible for:

UI/UX

React frontend

Trip dashboard

Itinerary visualization

Agent interaction

Disruption interface

Product presentation

Both members collaborate on:

Architecture

Integration

Testing

Demo

Final submission

🔮 Future Improvements

Potential future capabilities include:

Real-time flight monitoring

Real-time hotel/booking integration

Automatic weather-based re-planning

Live transportation disruption monitoring

Personalized travel memory

Group trip planning

Collaborative itineraries

Voice-based travel assistant

Mobile application

Real booking and reservation integrations

⚠️ Hackathon Scope

TravelPilot is built as a hackathon MVP.

Some external travel information may use estimated, cached, curated, or simulated data where real-time access is unavailable.

The goal is to demonstrate the core capability:

An AI agent that manages and adapts a complete travel itinerary when constraints or circumstances change.

🌟 Core Value Proposition

Traditional travel tools answer:

"Where should I go?"

TravelPilot answers:

"Given everything happening in my trip, what should I do next — and how should my itinerary change when something goes wrong?"

🌐 Deployment

TravelPilot is deployed using:

Frontend  → Vercel
Backend   → Render
Database  → Supabase

🔗 Live Demo: https://travelpilot-liart.vercel.app/

For local development, start the backend and frontend separately using the commands above.

📜 License

This project was created for the Agentic AI Hackathon.

License details can be added based on the team's preferred open-source or project licensing terms.
