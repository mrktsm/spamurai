# Spamurai: AI-Powered Email Protection

[![YouTube Video](https://img.youtube.com/vi/kYLiuQEuTiY/maxresdefault.jpg)](https://www.youtube.com/watch?v=kYLiuQEuTiY)


## Overview

Spamurai is a sophisticated email protection system that enhances Gmail's native spam filtering capabilities using advanced AI analysis. It provides real-time threat assessment, sender verification, and detailed analytics through a sleek browser extension interface.

Visit our website: [spamurai.online](https://spamurai.online)

## Features

- Real-time email analysis
- AI-powered spam detection
- SPF and DKIM verification
- Attachment and link scanning
- User-specific spam tracking
- Weekly spam statistics
- Performance improvement metrics
- Interactive dashboard
- Automated risk alerts

## Authentication

Spamurai uses Google OAuth 2.0 for secure authentication:
- Implements Chrome Identity API for seamless OAuth flow
- Requires Gmail API access for email analysis
- Scopes:
  - `gmail.readonly`: For reading email content
  - `userinfo.profile`: For user identification
- Secure token management
- No password storage
- Automatic token refresh handling

## Architecture

### Frontend (Chrome Extension)
- Built with React + Vite
- Styled using Tailwind CSS
- OAuth integration via Chrome Identity API
- Features:
  - Responsive action bar with dynamic animations
  - Interactive dashboard with real-time updates
  - Custom progress circle component
  - Spam history visualization using Recharts
  - Tab-based interface using Radix UI
  - Framer Motion for smooth animations

### Backend (FastAPI)
- RESTful API built with FastAPI
- PostgreSQL database for data persistence
- Features:
  - Real-time email analysis
  - User authentication via OAuth
  - Spam statistics tracking
  - Weekly performance metrics
  - Email authentication verification (SPF/DKIM)

### AI Model
The spam detection model is maintained in a separate repository. The spam detection model is currently based on an advanced LSTM neural network. Future iterations may incorporate transformer-based models for even greater accuracy.

[Link to AI Model Repository](https://github.com/mrktsm/spam-email-recognizer)

### Infrastructure
- Hosted on AWS EC2 instances
- Nginx reverse proxy
- SSL/TLS encryption
- PostgreSQL RDS instance
- Route 53 DNS management

## API Endpoints

```plaintext
GET  /api/health                      - Service health check
GET  /api/db_health                   - Database connection check
POST /api/predict                     - Email analysis
GET  /api/spam-stats/last-week        - Get last week’s spam statistics
GET  /api/spam-stats/improvement-rate - Get the rate of change in the number of spam emails a user receives over time
```

## Database Schema

The system uses PostgreSQL with the following main tables:

### `users` Table
- **`id`**: Auto-incremented primary key for each user.
- **`userid`**: Unique identifier for each user.
  
Foreign Key: `id` is referenced by `user_id` in the `messages` and `daily_spam_stats` tables.

### `messages` Table
- **`id`**: Auto-incremented primary key for each message.
- **`message_id`**: Unique identifier for each email.
- **`analysis`**: JSON storing spam analysis results.
- **`user_id`**: Foreign key linking to `users.id`.

Foreign Key: `user_id` references `users.id`.

### `daily_spam_stats` Table
- **`id`**: Auto-incremented primary key for each record.
- **`user_id`**: Foreign key linking to `users.id`.
- **`date`**: Date of the recorded stats.
- **`spam_count`**: Number of spam emails for the user on that date.

Foreign Key: `user_id` references `users.id`.

### Relationships
- `users` is the central table, referenced by `user_id` in both `messages` and `daily_spam_stats`.
- `messages` tracks email data and spam analysis, while `daily_spam_stats` tracks daily spam counts per user.
s

## Installation

### Extension Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up OAuth credentials in Google Cloud Console:
   - Create a new project
   - Enable Gmail API
   - Configure OAuth consent screen
   - Create OAuth 2.0 Client ID
   - Add authorized JavaScript origins and redirect URIs
4. Configure manifest.json with OAuth client ID
5. Build the extension: `npm run build`
6. Load the extension in Chrome from the `dist` directory

### Backend Setup
1. Clone the backend repository
2. Install Python dependencies: `pip install -r requirements.txt`
3. Set up PostgreSQL database
4. Configure environment variables including OAuth credentials
5. Run the FastAPI server: `uvicorn main:app --reload`

## Security

Spamurai takes security seriously:
- All authentication handled through Google OAuth 2.0
- No storage of user credentials
- Email analysis performed locally or through secure API endpoints
- Only analysis results and statistics are maintained in the database
- Secure token handling and storage
  
## Contributing
Contributions are welcome! Fork the repository, make your changes, and submit a pull request. Any enhancements, bug fixes, or improvements are appreciated.

Ensure that the code follows the existing style and includes proper tests. If there are any questions, feel free to open an issue or reach out for clarification.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.

## Acknowledgments
- **Gmail API** – For providing the functionality to access and manage Gmail data.
- **Google OAuth 2.0** – For enabling secure user authentication.
- **FastAPI community** – For creating and maintaining FastAPI, the backbone of our backend.
- **React ecosystem** – For providing the powerful and flexible frontend framework.
- **Tailwind CSS team** – For the easy-to-use CSS framework that helped us style the application.
- **Kaggle** – For the public email dataset used to train our spam detection model.
- **AWS** – For hosting our application on their scalable cloud infrastructure.
