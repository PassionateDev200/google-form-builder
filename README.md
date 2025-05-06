# Google Forms Clone (Frontend)

A simple frontend application demonstrating the core functionality of creating, filling out, and viewing responses for web forms, similar to Google Forms. This project is built entirely with frontend technologies (TypeScript, HTML, CSS) and uses the browser's Local Storage for data persistence.

## ✨ Features

*   **Form Creation:** Create new forms with custom titles.
*   **Field Types:** Add fields to forms:
    *   Text Input
    *   Radio Button Group
*   **Field Options:** Define options for Radio Button fields.
*   **Required Fields:** Mark specific fields as mandatory.
*   **Form Listing:** View a list of all created forms.
*   **Form Filling:** Fill out and submit created forms.
*   **Response Viewing:** View all submitted responses for a specific form.
*   **Data Persistence:** All form structures and responses are saved in the browser's Local Storage.

## 🛠️ Technology Stack

*   **TypeScript:** For static typing and modern JavaScript features.
*   **HTML5:** For structuring the web pages.
*   **CSS3:** (Assumed) For styling the user interface.
*   **Jest:** For running unit tests.
*   **ts-jest:** Jest transformer for TypeScript.
*   **jest-environment-jsdom:** Jest environment simulating browser APIs (like localStorage).
*   **Node.js & npm:** For dependency management, building, and running scripts.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/) (LTS version recommended, e.g., >= 18.x)
*   [npm](https://www.npmjs.com/) (comes bundled with Node.js)

## 🚀 Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <your-repository-directory>
    ```
    *(Replace `<your-repository-url>` and `<your-repository-directory>` with the actual URL and folder name)*

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## 🏃 Running the Application

Since this is a frontend-only application using TypeScript and potentially ES Modules, it needs to be built and served via a local HTTP server to avoid browser security restrictions (`file:///` protocol issues).

1.  **Build the TypeScript code:**
    This command compiles your TypeScript files (`.ts`) into JavaScript files (`.js`) in the `dist` folder (as configured in `tsconfig.json`).
    ```bash
    npm run build
    ```
    *You can also use `npm run watch` during development to automatically rebuild on file changes.*

2.  **Serve the project directory:**
    Use a simple HTTP server. `npx serve` is a convenient option that downloads and runs the `serve` package without global installation.
    ```bash
    npx serve .
    ```
    *(The `.` tells `serve` to host the current directory)*

3.  **Open in Browser:**
    The `serve` command will output one or more URLs (usually starting with `http://localhost:3000` or similar). Open one of these URLs in your web browser to use the application.

## ✅ Running Tests

Unit tests have been set up using Jest to verify the functionality of core modules (like data storage).

1.  **Execute tests:**
    ```bash
    npm test
    ```
    Jest will run all test files (e.g., `*.test.ts`) and report the results in the terminal.

## 💾 Data Storage

*   All form definitions and submitted responses are stored directly in your web browser's **Local Storage**.
*   Data is specific to the browser and the domain (e.g., `localhost:3000`) you are using.
*   Clearing your browser's site data for this origin will **permanently delete** all created forms and responses.

## 💡 Usage

1.  Open the application in your browser (after running `npm run build` and `npx serve .`).
2.  You should see the main interface, likely showing existing forms or an option to create one.
3.  Use the "Create New Form" functionality to define a form title and add fields.
4.  Save the form structure.
5.  Navigate to the "Fill Form" or equivalent section, select a form, enter your responses, and submit.
6.  Navigate to the "View Responses" section to see submitted data for a chosen form.

## 🚀 Potential Future Improvements

*   More field types (Checkbox, Dropdown, Date, etc.)
*   Advanced form validation rules.
*   Editing existing form structures.
*   Deleting forms and individual responses.
*   Improved UI/UX and styling.
*   Data export/import functionality (e.g., CSV, JSON).
*   (Major) Backend integration for persistent, user-independent storage and potential user accounts.

