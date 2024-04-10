# Setup

To set up this application locally, follow these steps:

 1. Clone this repository.
 2. Navigate to the project directory.
 3. Ensure Docker and Docker Compose are installed on your system.
 4. Create the `.env` and `backend/.env` files based on the `example.env` `backend/example.env` and fill in the required environment variables

??? example "Example .env files"

    === ".env"
    
        ```
        --8<-- "example.env"
        ```
    
    === "backend/.env"
    
        ```
        --8<-- "backend/example.env"
        ```

 5. Run `sudo docker-compose up` to build and start the containers.
 6. Access the application at `http://localhost`

Voilà! The application is now up and running in Docker containers, making setup and deployment hassle-free.