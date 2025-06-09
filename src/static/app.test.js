import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor } from "@testing-library/dom";

/**
 * @jest-environment jsdom
 */


// Mock fetch
global.fetch = jest.fn();

// Helper to set up DOM structure
function setupDOM() {
    document.body.innerHTML = `
        <div id="activities-list"></div>
        <form id="signup-form">
            <input id="email" name="email" />
            <select id="activity"></select>
            <button type="submit">Sign Up</button>
        </form>
        <div id="message" class="hidden"></div>
    `;
}

// Import the app.js code as a module
beforeEach(() => {
    jest.resetModules();
    setupDOM();
    // Re-require app.js to re-register event listeners
    require("./app.js");
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("Activities App", () => {
    test("fetches and displays activities", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                Yoga: {
                    description: "Morning yoga session",
                    schedule: "Mon 7am",
                    max_participants: 2,
                    participants: ["alice@example.com"]
                }
            })
        });

        // Trigger DOMContentLoaded
        document.dispatchEvent(new Event("DOMContentLoaded"));

        await waitFor(() => {
            expect(screen.getByText("Yoga")).toBeInTheDocument();
            expect(screen.getByText("Morning yoga session")).toBeInTheDocument();
            expect(screen.getByText(/1 spots left/)).toBeInTheDocument();
            expect(screen.getByText("alice@example.com")).toBeInTheDocument();
            expect(screen.getByRole("option", { name: "-- Select an activity --" })).toBeInTheDocument();
            expect(screen.getByRole("option", { name: "Yoga" })).toBeInTheDocument();
        });
    });

    test("shows unregister button for current user's email", async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                Chess: {
                    description: "Chess club",
                    schedule: "Fri 5pm",
                    max_participants: 2,
                    participants: ["bob@example.com"]
                }
            })
        });

        // Set email input to match participant
        screen.getByLabelText
            ? fireEvent.input(screen.getByLabelText(/email/i), { target: { value: "bob@example.com" } })
            : (document.getElementById("email").value = "bob@example.com");

        document.dispatchEvent(new Event("DOMContentLoaded"));

        await waitFor(() => {
            expect(screen.getByText("Unregister")).toBeInTheDocument();
        });
    });

    test("handles signup form submission success", async () => {
        // Initial fetch for activities
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({})
        });

        // Signup fetch
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: "Signed up!" })
        });

        // Fetch after signup
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({})
        });

        document.getElementById("email").value = "test@example.com";
        const select = document.getElementById("activity");
        select.innerHTML = `<option value="Yoga">Yoga</option>`;
        select.value = "Yoga";

        document.dispatchEvent(new Event("DOMContentLoaded"));

        fireEvent.submit(document.getElementById("signup-form"));

        await waitFor(() => {
            expect(screen.getByText("Signed up!")).toBeInTheDocument();
            expect(document.getElementById("message")).toHaveClass("success");
        });
    });

    test("handles signup form submission error", async () => {
        // Initial fetch for activities
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({})
        });

        // Signup fetch returns error
        fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ detail: "Already signed up" })
        });

        document.getElementById("email").value = "test@example.com";
        const select = document.getElementById("activity");
        select.innerHTML = `<option value="Yoga">Yoga</option>`;
        select.value = "Yoga";

        document.dispatchEvent(new Event("DOMContentLoaded"));

        fireEvent.submit(document.getElementById("signup-form"));

        await waitFor(() => {
            expect(screen.getByText("Already signed up")).toBeInTheDocument();
            expect(document.getElementById("message")).toHaveClass("error");
        });
    });

    test("handles unregister from activity", async () => {
        // Initial fetch for activities
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                Yoga: {
                    description: "Yoga class",
                    schedule: "Mon 7am",
                    max_participants: 2,
                    participants: ["me@example.com"]
                }
            })
        });

        // Unregister fetch
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: "Unregistered!" })
        });

        // Fetch after unregister
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({})
        });

        document.getElementById("email").value = "me@example.com";
        document.dispatchEvent(new Event("DOMContentLoaded"));

        await waitFor(() => {
            expect(screen.getByText("Unregister")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Unregister"));

        await waitFor(() => {
            expect(screen.getByText("Unregistered!")).toBeInTheDocument();
            expect(document.getElementById("message")).toHaveClass("success");
        });
    });

    test("shows error if activities fetch fails", async () => {
        fetch.mockRejectedValueOnce(new Error("Network error"));

        document.dispatchEvent(new Event("DOMContentLoaded"));

        await waitFor(() => {
            expect(screen.getByText(/Failed to load activities/)).toBeInTheDocument();
        });
    });
});