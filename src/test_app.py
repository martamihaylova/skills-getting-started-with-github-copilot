import pytest
from fastapi.testclient import TestClient
from app import app, activities

client = TestClient(app)

def test_root_redirects_to_static_index():
    response = client.get("/", allow_redirects=False)
    assert response.status_code == 307 or response.status_code == 302
    assert response.headers["location"].endswith("/static/index.html")

def test_get_activities_returns_all():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "Programming Class" in data

def test_signup_for_activity_success():
    activity = "Chess Club"
    email = "teststudent@mergington.edu"
    # Ensure clean state
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response.status_code == 200
    assert email in activities[activity]["participants"]
    assert f"Signed up {email} for {activity}" in response.json()["message"]

def test_signup_for_activity_already_signed_up():
    activity = "Chess Club"
    email = "michael@mergington.edu"
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response.status_code == 400
    assert response.json()["detail"] == "Student already signed up"

def test_signup_for_activity_max_participants():
    activity = "Math Olympiad"
    # Fill up participants
    activities[activity]["participants"] = [
        f"student{i}@mergington.edu" for i in range(activities[activity]["max_participants"])
    ]
    email = "overflow@mergington.edu"
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response.status_code == 400
    assert response.json()["detail"] == "Maximum participants reached"
    # Clean up
    activities[activity]["participants"] = activities[activity]["participants"][:2]

def test_signup_for_activity_invalid_email():
    activity = "Chess Club"
    email = "invalid-email"
    response = client.post(f"/activities/{activity}/signup", params={"email": email})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid email format"

def test_signup_for_nonexistent_activity():
    response = client.post("/activities/NonexistentActivity/signup", params={"email": "test@mergington.edu"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"

def test_unregister_from_activity_success():
    activity = "Programming Class"
    email = "emma@mergington.edu"
    # Ensure the student is registered
    if email not in activities[activity]["participants"]:
        activities[activity]["participants"].append(email)
    response = client.post(f"/activities/{activity}/unregister", params={"email": email})
    assert response.status_code == 200
    assert email not in activities[activity]["participants"]
    assert f"Unregistered {email} from {activity}" in response.json()["message"]

def test_unregister_from_activity_not_registered():
    activity = "Programming Class"
    email = "notregistered@mergington.edu"
    if email in activities[activity]["participants"]:
        activities[activity]["participants"].remove(email)
    response = client.post(f"/activities/{activity}/unregister", params={"email": email})
    assert response.status_code == 400
    assert response.json()["detail"] == "Student not registered for this activity"

def test_unregister_from_nonexistent_activity():
    response = client.post("/activities/NonexistentActivity/unregister", params={"email": "test@mergington.edu"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"