<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $newPassword;

    /**
     * Create a new message instance.
     */
    public function __construct($newPassword)
    {
        $this->newPassword = $newPassword;
    }

    /**
     * Define the email envelope (subject, sender, etc.)
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Password Has Been Reset',
        );
    }

    /**
     * Define the view and data for the email content.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.reset-password', // your Blade view file
            with: [
                'password' => $this->newPassword, // data passed to the view
            ],
        );
    }

    /**
     * Define attachments if needed.
     */
    public function attachments(): array
    {
        return [];
    }
}
