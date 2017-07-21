"""
Tools for sending email.
"""
# Import utilities
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_text
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.http import urlsafe_base64_encode

# Import environment variables
from bookvoyage.settings import HOST_FRONTEND, PASSWORD_RESET_LINK, DEFAULT_FROM_EMAIL, JOURNEY_LINK

# Define logger
import logging
logger = logging.getLogger('MailUtil')


def send_owner_invitation(user):
    """
    Sends user an invitation e-mail that includes a password reset link.
    Adapted from https://github.com/pennersr/django-allauth/blob/master/allauth/account/forms.py
    """
    user_email = user.email

    # Generate password reset token
    token_generator = default_token_generator
    temp_key = token_generator.make_token(user)

    url = HOST_FRONTEND + PASSWORD_RESET_LINK\
        + force_text(urlsafe_base64_encode((force_bytes(user.id)))) + "-" + temp_key

    msg_plain = render_to_string('owner_invitation.txt', {'platformUrl': url})
    msg_html = render_to_string('owner_invitation.html', {'platformUrl': url})

    send_mail(
        'Welcome to EDUshifts Book Voyage!',
        msg_plain,
        DEFAULT_FROM_EMAIL,
        [user_email],
        html_message=msg_html,
    )
    logger.info("Owner Invitation sent to: " + user_email)


def send_holder_welcome(user, book):
    """
    Sends holder a thank-you e-mail for having registered a book, and send them a link to the public journey.
    """
    user_email = user.email
    book_id = book.id

    url = HOST_FRONTEND + JOURNEY_LINK + str(book_id)

    msg_plain = render_to_string('holder_welcome.txt', {'platformUrl': url})
    msg_html = render_to_string('holder_welcome.html', {'platformUrl': url})

    send_mail(
        'Welcome to EDUshifts Book Voyage!',
        msg_plain,
        DEFAULT_FROM_EMAIL,
        [user_email],
        html_message=msg_html,
    )
    logger.info("Holder welcome sent to: " + user_email)


def send_book_update_mass(users, book):
    """
    Performs send_book_update() for multiple users.
    TODO: implement send_mass_mail()
    """
    for user in users:
        send_book_update(user, book)
    logger.info("Book updates were sent")


def send_book_update(user, book):
    """
    Sends single holder an update on the latest book location, and send them a link to the public journey.
    """
    user_email = user.email
    user_name = user.first_name
    book_id = book.id

    url = HOST_FRONTEND + JOURNEY_LINK + str(book_id)

    msg_plain = render_to_string('book_update.txt', {'platformUrl': url, 'username': user_name})
    msg_html = render_to_string('book_update.html', {'platformUrl': url, 'username': user_name})

    send_mail(
        'Book Voyage Update',
        msg_plain,
        DEFAULT_FROM_EMAIL,
        [user_email],
        html_message=msg_html,
    )
