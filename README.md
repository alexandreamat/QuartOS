# 🔄 QuartOS

Welcome to the QuartOS repository! This open-source project is designed to provide a comprehensive financial management solution with advanced features including transaction consolidation, support for multiple currencies and countries, connection to various banks through Plaid, manual provisioning with CSV files, and generation of insightful PL reports.

The term QuartOS has its roots in the Catalan language, as elderly people often refer to money as _quartos_ (pronounced /ˈkwaɾ.tus/). It embodies a sense of tradition and heritage while also signifying modern financial management practices.

## Features

### 🏦 Plaid Integration

Seamlessly connects to multiple banks through the Plaid API, allowing for automatic data fetching from financial institutions.

### 🖐️ Manual Provisioning

Enables users to upload transaction files provided by their financial institutions in CSV format. This feature is ideal for banks not supported by Plaid or for users in different geographic regions.

### 💱 Multi-Currency Support

Accommodates transactions in various currencies and from different countries, ensuring flexibility for users globally.

### 🔄 Transaction Consolidation

Offers transaction consolidation functionality, bundling transactions together that belong to a single financial event. This process helps clean transaction data and accurately calculate the net worth impact.

### 🪣 Support for Bucket Accounting

Allows users to create virtual accounts to partition transactions, regardless of the actual financial bank account. This feature is ideal for managing side hustles or shared expenses efficiently.

### 🏷️ Categorization of Transaction Data

Automatically categorizes transaction data based on categories provided by Plaid, which can be edited by the user to suit their needs and preferences.

### 📊 Generation of Insightful Reports

Generates P&L (Profit and Loss) reports on a yearly, monthly, weekly, and quarterly basis, showcasing income and expenses. Reports can be generated by bucket or overall, with support for visualization of categorization into various expense categories.

## Dependencies

- **Backend Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Frontend Framework**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Database**: [SQLAlchemy](https://www.sqlalchemy.org/)
- **Migration Tool**: [Alembic](https://alembic.sqlalchemy.org/en/latest/)
- **API Documentation**: [Swagger UI](https://swagger.io/tools/swagger-ui/)
- **External API Integration**:
  - [Plaid](https://plaid.com/)
  - [OpenExchangeRates](https://openexchangerates.org/)
- **Containerization**: [Docker](https://www.docker.com/)

## Setup

To set up this application locally, follow these steps:

1. Clone this repository.
2. Navigate to the project directory.
3. Ensure Docker and Docker Compose are installed on your system.
4. Create the `.env` and `backend/.env` files based on the `example.env` `backend/example.env` and fill in the required environment variables
5. Run `sudo docker-compose up` to build and start the containers.
6. Access the application at `http://localhost`

Voilà! The application is now up and running in Docker containers, making setup and deployment hassle-free.

## Contributing

We welcome contributions from the community to enhance the functionality and usability of this application. To contribute, follow these steps:

1. Fork this repository.
2. Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature`.
3. Commit your changes: `git commit -m "Add new feature"`.
4. Push to your fork: `git push origin feature/your-feature`.
5. Create a pull request detailing your changes.

## License

This project is licensed under the [GNU Affero General Public License (AGPL)](LICENSE), Version 3, 19 November 2007. This license grants you the freedom to use, modify, and distribute the code, including for commercial purposes, while ensuring that any modifications or enhancements made to the software are also released under the AGPL license.

## Contact

For any inquiries or suggestions regarding this project, feel free to submit an issue.
