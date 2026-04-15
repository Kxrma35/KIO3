import { useEffect, useState } from 'react'
import { auth, db } from '../firebase'
import { addDoc, collection, onSnapshot, query, where } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import './Feedback.css'

export default function Feedback() {
  const user = auth.currentUser
  const navigate = useNavigate()

  const [rating, setRating] = useState(0)
  const [suggestion, setSuggestion] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [recent, setRecent] = useState([])

  useEffect(() => {
    const q = query(collection(db, 'feedback'), where('uid', '==', user.uid))
    return onSnapshot(q, (snap) => {
      const rows = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
        .slice(0, 5)
      setRecent(rows)
    })
  }, [user.uid])

  const submitFeedback = async () => {
    if (rating < 1) return
    if (!suggestion.trim()) return
    setSaving(true)
    setSavedMsg('')
    
    // Clear form immediately and show success message
    setSuggestion('')
    setRating(0)
    setSavedMsg('Thanks! Your feedback was saved.')
    
    // Fire the save in background
    addDoc(collection(db, 'feedback'), {
      uid: user.uid,
      email: user.email || '',
      rating,
      suggestion: suggestion.trim(),
      createdAt: new Date()
    }).catch(err => {
      console.error('Feedback submit error:', err)
    }).finally(() => {
      setSaving(false)
    })
  }

  return (
    <div className="feedback-page">
      <div className="feedback-header">
        <button className="back-btn" onClick={() => navigate('/settings')}>
          <ArrowLeftIcon className="back-icon" /> Back
        </button>
        <h2 className="feedback-title">
          <ChatBubbleLeftRightIcon className="feedback-title-icon" /> Feedback
        </h2>
      </div>

      <div className="feedback-card">
        <h3 className="section-title">Rate the app</h3>
        <div className="star-row" role="radiogroup" aria-label="Overall rating">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              className={`star-btn ${rating >= n ? 'active' : ''}`}
              onClick={() => setRating(n)}
              aria-label={`${n} stars`}
            >
              <StarSolidIcon className="star-icon" />
            </button>
          ))}
        </div>
        <p className="feedback-hint">Overall rating (1 to 5 stars)</p>

        <h3 className="section-title" style={{ marginTop: '1rem' }}>Suggest a feature</h3>
        <textarea
          className="feedback-textarea"
          placeholder="Tell us what feature you want next..."
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
        />
        <button className="primary-btn" onClick={submitFeedback} disabled={saving}>
          {saving ? 'Submitting...' : 'Submit Feedback'}
        </button>
        {savedMsg && <p className="feedback-success">{savedMsg}</p>}
      </div>

      <div className="feedback-card">
        <h3 className="section-title">Your recent feedback</h3>
        {recent.length === 0 ? (
          <p className="empty-text">No feedback submitted yet.</p>
        ) : (
          <div className="feedback-list">
            {recent.map((f) => (
              <div key={f.id} className="feedback-item">
                <div className="feedback-item-rating">
                  {Array.from({ length: Math.max(0, Number(f.rating) || 0) }).map((_, i) => (
                    <StarSolidIcon key={`${f.id}-r-${i}`} className="mini-star-icon" />
                  ))}
                </div>
                <div className="feedback-item-text">{f.suggestion}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

