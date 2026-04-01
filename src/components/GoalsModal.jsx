import { useState } from 'react'
import { db, auth } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'
import { XMarkIcon } from '@heroicons/react/24/outline'
import './goalsmodal.css'

function GoalsModal({ currentCalories, currentProtein, onSave, onClose }) {
  const [calories, setCalories] = useState(currentCalories)
  const [protein, setProtein] = useState(currentProtein)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await setDoc(doc(db, 'goals', auth.currentUser.uid), {
      calories: Number(calories),
      protein: Number(protein)
    })
    onSave(Number(calories), Number(protein))
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Set Your Goals</h3>
          <button className="modal-close" onClick={onClose}>
            <XMarkIcon style={{ width: 20, height: 20 }} />
          </button>
        </div>

        <div className="modal-body">
          <div className="goal-input-group">
            <label>Daily Calorie Goal (kcal)</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
            <p className="goal-hint">Recommended for bulking: 3000 — 4000 kcal</p>
          </div>

          <div className="goal-input-group">
            <label>Daily Protein Goal (g)</label>
            <input
              type="number"
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
            />
            <p className="goal-hint">Recommended: 1.6 — 2.2g per kg of bodyweight</p>
          </div>
        </div>

        <button className="modal-save-btn" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Goals'}
        </button>
      </div>
    </div>
  )
}

export default GoalsModal