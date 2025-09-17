# Project: DescuentosUY

## Project Overview

This project is a web application called **DescuentosUY**. Its main purpose is to help users find discounts and offers in Montevideo, Uruguay. The application provides a map-based interface to visualize the locations of businesses with discounts, and it allows users to filter and search for offers based on their preferences.

It integrates with the Google Places API to enrich branch data with details like ratings, opening hours, and phone numbers, using a caching strategy to minimize API costs.

The project is built with a modern web stack:

*   **Frontend:** Next.js (with TypeScript)
*   **Styling:** Tailwind CSS
*   **Backend and Database:** Supabase (PostgreSQL) with a normalized schema including `stores`, `branches`, `promotions`, and a caching table `branch_details`.
*   **Deployment:** Vercel
*   **External APIs:** Google Maps Platform (Places API). Logo images are now hosted on Supabase Storage for better performance and reliability.

## Building and Running

To get the project running locally, you can use the following commands:

*   **Install dependencies:**
    ```bash
    npm install
    ```
*   **Run the development server:**
    ```bash
    npm run dev
    ```
*   **Build for production:**
    ```bash
    npm run build
    ```
*   **Start the production server:**
    ```bash
    npm run start
    ```
*   **Lint the code:**
    ```bash
    npm run lint
    ```

## Environment Variables

To run this project, you will need a `.env.local` file with the following variables:

*   `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase project.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The public, anonymous key for your Supabase project.
*   `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps Platform API key, enabled for the Places API.
*   `SUPABASE_SERVICE_ROLE_KEY`: The secret service role key for your Supabase project, used for backend scripts that require elevated privileges (like the Google Places data sync).

## Development Conventions

*   The project uses **TypeScript** for type safety.
*   **ESLint** is used for linting the code.
*   The project follows the standard Next.js project structure.
*   Styling is done with **Tailwind CSS**.
*   Backend scripts requiring elevated permissions (e.g., API routes for data sync) should use the `SUPABASE_SERVICE_ROLE_KEY` to create a dedicated service client, rather than relying on user-session-based clients.
ents.
reate a dedicated service client, rather than relying on user-session-based clients.
