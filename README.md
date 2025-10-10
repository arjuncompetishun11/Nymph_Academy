# Nymph Academy Student Enrollment System

This is a React + Tailwind web application with Firebase integration for student enrollment at Nymph Academy.

## Features

- Student enrollment form with validation
- QR code-based payment system
- Roll number generation
- Confirmation page with student details
- Firebase Firestore database integration
- Firebase Storage for file uploads

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A Firebase project with Firestore and Storage enabled

## Getting Started

1. Clone the repository:
```
git clone https://github.com/your-username/nymph-academy.git
cd nymph-academy
```

2. Install dependencies:
```
npm install
```

3. Set up Firebase:
   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Enable Firestore Database and Storage
   - Get your Firebase configuration
   - Update the `.env` file with your Firebase configuration:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

4. Run the development server:
```
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser to see the application.

## Building for Production

1. Build the application:
```
npm run build
```

2. Start the production server:
```
npm start
```

## Project Structure

```
/
├── public/              # Public assets
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   │   ├── EnrollmentForm.jsx   # Enrollment form page
│   │   ├── PaymentPage.jsx      # Payment page
│   │   └── ConfirmationPage.jsx # Confirmation page
│   ├── utils/           # Utility functions
│   ├── firebase.js      # Firebase configuration
│   ├── App.jsx          # Main application component
│   └── main.jsx         # Entry point
├── .env                 # Environment variables
├── server.js            # Express server for production
├── index.html           # HTML template
├── postcss.config.js    # PostCSS configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

## Email Function

A placeholder email function is included in `src/utils/emailUtils.js`. You can implement the actual email sending functionality using a service like SendGrid, Nodemailer, etc.
