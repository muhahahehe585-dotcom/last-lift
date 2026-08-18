import { useEffect, useState } from 'react';
import { canDeleteFeedback, currentUserEmail, deleteFeedback, loadFeedback, submitFeedback, type FeedbackItem } from '../../lib/feedback';

type FeedbackPanelProps = {
  onBack: () => void;
};

export function FeedbackPanel({ onBack }: FeedbackPanelProps) {
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [canDelete, setCanDelete] = useState(false);
  const [email, setEmail] = useState('');

  const refresh = async () => {
    const result = await loadFeedback();
    setItems(result.items);
    if (!result.ok) setMessage(result.message);
  };

  const send = async () => {
    setBusy(true);
    const result = await submitFeedback(feedback);
    setMessage(result.message);
    if (result.ok) {
      setFeedback('');
      await refresh();
    }
    setBusy(false);
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    const result = await deleteFeedback(id);
    setMessage(result.message);
    if (result.ok) await refresh();
    setDeletingId('');
  };

  useEffect(() => {
    void refresh();
    canDeleteFeedback().then(setCanDelete);
    currentUserEmail().then(setEmail);
  }, []);

  return (
    <div className="menu-copy">
      <p>Leave a bug report or tell us what to add next.</p>
      <textarea
        className="feedback-box"
        value={feedback}
        maxLength={1200}
        placeholder="Type feedback here..."
        onChange={(event) => setFeedback(event.target.value)}
      />
      {message && <p className="feedback-message">{message}</p>}
      <button type="button" disabled={busy} onClick={send}>
        {busy ? 'Sending...' : 'Send Feedback'}
      </button>
      <div className="feedback-list">
        <strong>Latest Feedback</strong>
        <p className="feedback-message">
          {canDelete ? 'Admin delete enabled.' : `Signed in as ${email || 'unknown account'}.`}
        </p>
        {items.length === 0 && <p>No feedback yet.</p>}
        {items.map((item) => (
          <article key={item.id} className="feedback-item">
            <div className="feedback-item-top">
              <time>{new Date(item.created_at).toLocaleDateString()}</time>
              {canDelete && (
                <button type="button" disabled={deletingId === item.id} onClick={() => remove(item.id)}>
                  {deletingId === item.id ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
            <p>{item.message}</p>
          </article>
        ))}
      </div>
      <button type="button" onClick={onBack}>Back</button>
    </div>
  );
}
