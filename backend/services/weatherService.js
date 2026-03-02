const axios = require('axios');
const nodemailer = require('nodemailer');

// Geocoding function to get lat/lon for city using Open-Meteo's geocoding API
async function getCoordinates(city) {
    try {
        const response = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        if (response.data && response.data.results && response.data.results.length > 0) {
            return {
                lat: response.data.results[0].latitude,
                lon: response.data.results[0].longitude,
                name: response.data.results[0].name
            };
        }
        return null;
    } catch (error) {
        console.error(`Error geocoding city ${city}:`, error.message);
        return null;
    }
}

// Fetch weather from Open-Meteo
async function getWeather(lat, lon) {
    try {
        const response = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`);
        if (response.data && response.data.daily) {
            const todayMax = response.data.daily.temperature_2m_max[0];
            const todayMin = response.data.daily.temperature_2m_min[0];
            const precip = response.data.daily.precipitation_sum[0];

            return `Max Temp: ${todayMax}°C, Min Temp: ${todayMin}°C, Precipitation: ${precip}mm`;
        }
        return 'Weather data unavailable';
    } catch (error) {
        console.error(`Error fetching weather for lat ${lat}, lon ${lon}:`, error.message);
        return 'Weather data unavailable';
    }
}

// Send Email (Uses SMTP if configure, else Ethereal dummy)
async function sendEmail(user, weatherReport) {
    try {
        let transporter;

        if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
            // Use real SMTP provider
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT || 587,
                secure: process.env.SMTP_PORT == 465,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            await transporter.sendMail({
                from: process.env.SMTP_USER,
                to: user.email,
                subject: "Your Daily Weather Report",
                text: `Hello ${user.name},\n\nHere is your daily weather report for ${user.city}:\n\n${weatherReport}\n\nStay safe!`,
            });
            console.log(`Real Email sent to ${user.email}`);

        } else {
            // Fallback to dummy Ethereal for local testing
            let testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });

            let info = await transporter.sendMail({
                from: '"Weather Report App Dummy" <no-reply@weatherupdates.com>',
                to: user.email,
                subject: "Your Daily Weather Report",
                text: `Hello ${user.name},\n\nHere is your daily weather report for ${user.city}:\n\n${weatherReport}\n\nStay safe!`,
            });
            console.log(`Dummy Email sent to ${user.email} (Preview URL: ${nodemailer.getTestMessageUrl(info)})`);
        }
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Send SMS (Uses Twilio if configured, else console log mock)
async function sendSMS(user, weatherReport) {
    try {
        if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
            const twilioClient = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
            await twilioClient.messages.create({
                body: `Hello ${user.name}, weather for ${user.city}: ${weatherReport}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: user.phone
            });
            console.log(`Real SMS sent to ${user.phone}`);
        } else {
            console.log(`[DUMMY SMS DISPATCH] To: ${user.phone}`);
            console.log(`Message: Hello ${user.name}, weather for ${user.city}: ${weatherReport}`);
        }
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
}

async function dispatchWeatherUpdate(customer) {
    console.log(`Starting weather update for ${customer.name} in ${customer.city}...`);
    const coords = await getCoordinates(customer.city);
    if (!coords) {
        console.log(`Could not find coordinates for ${customer.city}. Skipping.`);
        return;
    }

    const weatherReport = await getWeather(coords.lat, coords.lon);

    // Send email and SMS asynchronously
    await Promise.all([
        sendEmail(customer, weatherReport),
        sendSMS(customer, weatherReport)
    ]);
    console.log(`Update dispatched for ${customer.name}.`);
}

module.exports = {
    dispatchWeatherUpdate,
    getCoordinates,
    getWeather
};
