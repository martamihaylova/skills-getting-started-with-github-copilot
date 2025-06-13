/**
 * Handles the main logic for the activities signup app.
 * 
 * - Fetches and displays available activities and their details.
 * - Allows users to sign up for activities and unregister if already signed up.
 * - Dynamically updates the UI based on the current user's email input.
 * - Handles form submission and displays success/error messages.
 * 
 * Key Functions:
 * - fetchActivities: Fetches activities from the API and updates the UI.
 * - unregisterFromActivity: Unregisters the user from a selected activity.
 * - getCurrentEmail: Retrieves the current email from the form input.
 * 
 * Event Listeners:
 * - On DOMContentLoaded: Initializes the app and fetches activities.
 * - On email input change: Re-renders activities to update unregister buttons.
 * - On form submission: Handles user signup for an activity.
 */
document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

// (Removed lines 7 and 8)

  // Helper to get current email from form
  function getCurrentEmail() {
    return document.getElementById("email").value.trim().toLowerCase();
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();
      lastActivities = activities;

      // Clear loading message and dropdown
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
        `;

        // Participants section
        const participantsSection = document.createElement("div");
        participantsSection.className = "participants-section";

        const participantsTitle = document.createElement("h5");
        participantsTitle.textContent = "Participants";
        participantsSection.appendChild(participantsTitle);

        const participantsList = document.createElement("ul");
        participantsList.className = "participants-list";

        if (details.participants && details.participants.length > 0) {
          details.participants.forEach((email) => {
            const li = document.createElement("li");
            li.textContent = email;

            // Cache the current user's email
            const currentEmail = getCurrentEmail();

            // Add unregister button if this is the current user's email
            if (currentEmail && currentEmail === email.toLowerCase()) {
              const btn = document.createElement("button");
              btn.textContent = "Unregister";
              btn.className = "unregister-btn";
              btn.onclick = async () => {
                await unregisterFromActivity(name, email);
              };
              li.appendChild(btn);
            }

            participantsList.appendChild(li);
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "No participants yet";
          participantsList.appendChild(li);
        }

        participantsSection.appendChild(participantsList);
        activityCard.appendChild(participantsSection);

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Unregister function
  async function unregisterFromActivity(activity, email) {
    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/unregister?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );
      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }
      messageDiv.classList.remove("hidden");
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to unregister. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error unregistering:", error);
    }
  }

  // Re-render activities when email changes, so unregister buttons appear/disappear
  document.getElementById("email").addEventListener("input", fetchActivities);

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
