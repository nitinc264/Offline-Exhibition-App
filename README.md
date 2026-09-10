```markdown
# Offline Exhibition App

An interactive, offline-first science exhibition experience built as a responsive two-layer web application and packaged as a Windows desktop application using Electron. 

## 📖 Overview

The application provides a digital exhibition experience through two distinct layers, ensuring a seamless journey from high-level exploration to deep-dive content consumption without requiring an active internet connection.

* **Layer 1 — Landing Experience:** Exhibition overview, statistics, floor/theme layouts, and introductory content.
* **Layer 2 — Exploration Experience:** Theme-based exhibit browsing, search functionality, interactive cards, and detailed metadata.

## ✨ Key Features

* **Two-Layer Navigation:** Smooth transition between exhibition overview and detailed exhibit exploration.
* **Offline-First Architecture:** Core runtime requires zero CDN resources, remote APIs, or localhost servers. All HTML, CSS, JS, and JSON data are bundled locally.
* **Windows Desktop Packaging:** Wrapped via Electron to deliver a standalone native-feeling application.
* **Data-Driven Content:** Fully dynamic rendering based on a structured local JSON data model.
* **Search & Filtering:** Quickly locate specific exhibits across multiple floors and themes.

## 🛠️ Technology Stack

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla) |
| **Desktop Packaging** | Electron, Electron Builder |
| **Data Layer** | Local JSON data model, Local image/icon assets |
| **Development** | Node.js, npm, Git, GitHub |

## 🏗️ Architecture

The architecture maintains a strict separation between content, frontend logic, and desktop packaging, allowing each component to evolve independently.

```text
                    ┌─────────────────────────┐
                    │      User Interface     │
                    │  Layer 1: Landing       │
                    │  Layer 2: Explorer      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    Frontend Layer       │
                    │  index.html, app.js     │
                    │  styles.css             │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     Local Data Layer    │
                    │  data.json, assets/     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │      Electron Shell     │
                    │  main.js, preload.js    │
                    │  package.json           │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │   Windows Desktop App   │
                    │      Offline Runtime    │
                    └─────────────────────────┘

```

## 📂 Project Structure

```text
Offline-Exhibition-App/
├── assets/                  # Local images and icons
├── desktop/
│   └── Electron wrapper/
│       ├── main.js          # Electron main process
│       ├── preload.js       # Context bridge
│       ├── package.json
│       ├── package-lock.json
│       └── web/             # Bundled web resources
│           ├── index.html
│           ├── app.js
│           ├── styles.css
│           └── data.json
├── index.html               # Standard web entry point
├── app.js                   # Core frontend logic
├── styles.css               # Application styling
├── data.json                # Structured exhibition content
├── package-lock.json
├── README.md
└── .gitignore

```

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/) installed on your machine.

### Running the Web Version

The frontend uses local files and local exhibition data. You can serve the root directory using any local development server (e.g., VS Code Live Server, Python `http.server`, or Node `http-server`).

### Running the Electron Version

Navigate to the Electron wrapper directory and start the application:

```bash
cd "desktop/Electron wrapper"
npm install
npm start

```

### Building the Windows Application

To generate a standalone `.exe` package that bundles the Electron runtime, application code, local data, and assets:

```bash
cd "desktop/Electron wrapper"
npm run build:portable

```

## 📊 Data Model & Themes

Exhibition content is kept entirely separate from presentation logic via structured JSON records, making it trivial to update, extend, and reuse.

**Exhibit Record Schema:**

* `Exhibit Number` & `Floor Number`
* `Theme` & `Title`
* `Type` & `Description`
* `Learning Objective` & `Visual Concept`
* `Media`, `Visitor Interaction`, & `Visual Assets Needed`

**Exhibition Themes Covered:**

* Space & Universe
* Physics & Technology
* Human Body & Life
* Earth, Climate & Environment
* Agriculture, Food & Future

## 🔒 Security, Reliability & Future Scope

While currently optimized for demonstration and offline reliability, future production iterations will target the following areas:

* **Security:** Implementation of strict Content Security Policies (CSP), secure Electron configurations, context isolation, and signed Windows builds.
* **Content Management:** A dedicated CMS pipeline to update JSON records dynamically without manual file editing.
* **Accessibility:** Enhanced screen-reader support, contrast validation, and semantic markup improvements.
* **Performance:** Advanced local asset caching, image compression, and optimized startup times for larger datasets.

## 📄 License

This project is provided for demonstration and portfolio purposes.

```

```
