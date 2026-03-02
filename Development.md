# Weather Updates App - Development Guide

## Environment Variables Configuration

The application supports both **dummy/testing** and **production** configurations for Email and SMS dispatch. By default, out of the box, it uses mock services:
- **Email:** Uses Ethereal (logs a preview link to the backend console).
- **SMS:** Uses a simple `console.log` payload to the backend console.

To switch over to real services, you need to create a `.env` file at the root of the project (where `docker-compose.yml` is located). 

We have provided a `.env.example` file for you. Simply copy it:
```bash
cp .env.example .env
```

And populate it with your real credentials:

### 1. SMTP setup (Real Emails)
Change `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` in your `.env` file. For example, if you are using Gmail, you need to generate an **App Password** for `SMTP_PASS`, as standard passwords won't work with Node.js `nodemailer`.

### 2. Twilio setup (Real SMS)
Sign up for a Twilio developer account. You will be provided with an Account SID, an Auth Token, and a trial Phone Number. Insert these into `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.

---

## Running the Application Contextually
Once your `.env` is populated, simply start the application via Docker Compose as usual. Docker Compose will automatically read your `.env` file and pass the variables sequentially into the backend container!

```bash
docker compose up -d --build
```

You can verify the variables made it inside by checking the backend logs after triggering an update in the Admin Dashboard:
```bash
docker compose logs -f backend
```

If the logs print `Real SMS sent to...` and `Real Email sent to...`, then the environment variable transition was successful!
