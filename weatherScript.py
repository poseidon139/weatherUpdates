import json
import requests
from twilio.rest import Client

# Load person details from a JSON file
def load_person_details(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

# Fetch weather details for a given location
def get_weather(location, api_key):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        weather = data['weather'][0]['description']
        temp = data['main']['temp']
        return f"Current weather in {location}: {weather}, Temperature: {temp}°C"
    else:
        return f"Could not fetch weather for {location}"

# Send SMS using Twilio
def send_sms(to_number, message, twilio_sid, twilio_auth_token, twilio_number):
    client = Client(twilio_sid, twilio_auth_token)
    message = client.messages.create(
        body=message,
        from_=twilio_number,
        to=to_number
    )
    return message.sid

# Main function
def main():
    # Configuration
    json_file_path = 'persons.json'
    weather_api_key = '<API key>'
    twilio_sid = '<SID>'
    twilio_auth_token = '<auth token>'
    twilio_number = '<twilio number>'
    
    # Load persons' details
    persons = load_person_details(json_file_path)
    
    for person in persons:
        name = person['name']
        location = person['location']
        phone_number = person['phone']
        
        # Get weather report
        weather_report = get_weather(location, weather_api_key)
        
        # Compose message
        sms_message = f"Hi {name},\n\n{weather_report}"
        print(sms_message)
        
        # Send SMS
        try:
            message_sid = send_sms(phone_number, sms_message, twilio_sid, twilio_auth_token, twilio_number)
            print(f"Message sent to {name} (SID: {message_sid})")
        except Exception as e:
            print(f"Failed to send message to {name}: {e}")

if __name__ == "__main__":
    main()
