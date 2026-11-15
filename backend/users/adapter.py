from allauth.account.adapter import DefaultAccountAdapter

class CustomAccountAdapter(DefaultAccountAdapter):
    def send_mail(self, template_prefix, email, context):
        # Intercept the password reset email right before it sends
        if template_prefix == 'account/email/password_reset_key':
            uid = context.get('uid')
            token = context.get('token')
            
            # Override the URL to point to your React frontend route
            context['password_reset_url'] = f"https://eventops-one.vercel.app/reset-password/{uid}/{token}"
            
        # Continue sending the email with the newly modified context
        super().send_mail(template_prefix, email, context)