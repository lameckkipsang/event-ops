import base64
import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime
from django.conf import settings

def get_mpesa_access_token():
    consumer_key = getattr(settings, 'MPESA_CONSUMER_KEY', '')
    consumer_secret = getattr(settings, 'MPESA_CONSUMER_SECRET', '')
    api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"

    try:
        response = requests.get(api_url, auth=HTTPBasicAuth(consumer_key, consumer_secret))
        if response.status_code == 200:
            return response.json().get('access_token')
        raise Exception(f"Failed to fetch access token: {response.text}")
    except Exception as e:
        print(f"Error fetching M-Pesa access token: {e}")
        return None

def generate_mpesa_password(shortcode, passkey, timestamp):
    data_to_encode = shortcode + passkey + timestamp
    encoded_string = base64.b64encode(data_to_encode.encode())
    return encoded_string.decode('utf-8')

def initiate_stk_push(phone_number, amount, callback_url, reference_id):
    access_token = get_mpesa_access_token()
    if not access_token:
        return {"error": "Failed to retrieve M-Pesa access token"}

    api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    shortcode = getattr(settings, 'MPESA_SHORTCODE', '174379')
    passkey = getattr(settings, 'MPESA_PASSKEY', '')
    password = generate_mpesa_password(shortcode, passkey, timestamp)
    
    # Safaricom expects format 2547XXXXXXXX
    formatted_phone = phone_number.replace('+', '').replace(' ', '')
    if formatted_phone.startswith('0'):
        formatted_phone = '254' + formatted_phone[1:]

    payload = {
        "BusinessShortCode": shortcode,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": formatted_phone,
        "PartyB": shortcode,
        "PhoneNumber": formatted_phone,
        "CallBackURL": callback_url,
        "AccountReference": f"Booking-{reference_id}",
        "TransactionDesc": f"Escrow Payment for Booking #{reference_id}"
    }

    response = requests.post(api_url, json=payload, headers=headers)
    return response.json()