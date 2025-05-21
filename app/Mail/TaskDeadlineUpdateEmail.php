<?php

namespace App\Mail;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TaskDeadlineUpdateEmail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(private Task $task, private string $sender) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            // subject: empty($this->task['parent_id']) ? $this->task['parent_id']   : $this->task['parent_id'],
            subject: empty($this->task['parent_id']) ? 'Account thay đổi deadline của công việc'   : 'Thay đổi deadline của công việc',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {

        $selectedView = empty($this->task['parent_id'])
            ? 'mail.notify-leader-deadline-update-email'
            : 'mail.notify-deadline-update-email';

        return new Content(
            view: $selectedView,
            with: ['task' => $this->task, 'sender' => $this->sender, 'test' => empty($this->task['parent_id'])]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
