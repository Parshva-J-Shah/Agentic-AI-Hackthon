from app.agent.trip_chat import run_trip_chat


print("=" * 80)
print("TRAVELPILOT TRIP CHAT IMPORT TEST")
print("=" * 80)

print("Importing trip chat service...")

assert callable(run_trip_chat)

print("run_trip_chat: PASS")

print()
print("=" * 80)
print("FINAL RESULT: TRIP CHAT SERVICE READY")
print("=" * 80)
