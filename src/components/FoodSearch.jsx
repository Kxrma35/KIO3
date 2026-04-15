import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import './FoodSearch.css'

const USDA_API_KEY = 'DEMO_KEY'

// Local food database fallback for better performance
const LOCAL_FOODS = [
  { name: 'Chicken Breast', calories: 165, protein: 31 },
  { name: 'Salmon', calories: 206, protein: 22 },
  { name: 'Eggs', calories: 155, protein: 13 },
  { name: 'Greek Yogurt', calories: 100, protein: 17 },
  { name: 'Oats', calories: 379, protein: 13 },
  { name: 'Brown Rice', calories: 111, protein: 3 },
  { name: 'Sweet Potato', calories: 86, protein: 2 },
  { name: 'Broccoli', calories: 34, protein: 3 },
  { name: 'Banana', calories: 89, protein: 1 },
  { name: 'Almonds', calories: 579, protein: 21 },
  { name: 'Spinach', calories: 23, protein: 3 },
  { name: 'Quinoa', calories: 120, protein: 4 },
  { name: 'Tuna', calories: 144, protein: 32 },
  { name: 'Avocado', calories: 160, protein: 2 },
  { name: 'Beef', calories: 250, protein: 26 },
  { name: 'Milk', calories: 61, protein: 3 },
  { name: 'Cheese', calories: 402, protein: 7 },
  { name: 'Bread', calories: 265, protein: 9 },
  { name: 'Pasta', calories: 157, protein: 6 },
  { name: 'Apple', calories: 52, protein: 0 },
  { name: 'Orange', calories: 47, protein: 1 },
  { name: 'Chicken', calories: 165, protein: 31 },
  { name: 'Turkey', calories: 135, protein: 29 },
  { name: 'Pork', calories: 242, protein: 27 },
  { name: 'Shrimp', calories: 99, protein: 24 },
  { name: 'Tofu', calories: 76, protein: 8 },
  { name: 'Lentils', calories: 116, protein: 9 },
  { name: 'Chickpeas', calories: 164, protein: 15 },
  { name: 'Beans', calories: 127, protein: 8 },
  { name: 'Almonds', calories: 579, protein: 21 },
  { name: 'Peanuts', calories: 567, protein: 26 },
  { name: 'Walnuts', calories: 654, protein: 9 },
  { name: 'Chia Seeds', calories: 486, protein: 12 },
  { name: 'Berries', calories: 57, protein: 1 },
  { name: 'Lettuce', calories: 15, protein: 1 },
  { name: 'Tomato', calories: 18, protein: 1 },
  { name: 'Cucumber', calories: 16, protein: 1 },
  { name: 'Carrot', calories: 41, protein: 1 },
  { name: 'Potato', calories: 77, protein: 2 },
  { name: 'Peas', calories: 81, protein: 5 },
  { name: 'Corn', calories: 86, protein: 3 },
  { name: 'Garlic', calories: 149, protein: 7 },
  { name: 'Onion', calories: 40, protein: 1 },
  { name: 'Olive Oil', calories: 884, protein: 0 },
  { name: 'Butter', calories: 717, protein: 1 },
  { name: 'Yogurt', calories: 59, protein: 10 },
  { name: 'Cottage Cheese', calories: 98, protein: 11 },
  { name: 'Whey Protein', calories: 120, protein: 25 },
  { name: 'Granola', calories: 471, protein: 13 }
] 

function FoodSearch({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    setLoading(true)
    setOpen(true) // Open dropdown immediately while searching

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      // First, show local results immediately for better UX
      const localMatches = LOCAL_FOODS.filter(food => 
        food.name.toLowerCase().includes(query.toLowerCase())
      )
      
      // Always show local results if available
      if (localMatches.length > 0) {
        setResults(localMatches.slice(0, 8))
      }

      try {
        // Try USDA API for more comprehensive results
        const res = await fetch(
          `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${USDA_API_KEY}&pageSize=8&dataType=SR%20Legacy,Foundation`
        )
        
        if (res.ok) {
          const data = await res.json()
          const foods = (data.foods || []).map(food => {
            const nutrients = food.foodNutrients || []
            const calNutrient = nutrients.find(n =>
              n.nutrientName === 'Energy' && n.unitName === 'KCAL'
            )
            const proteinNutrient = nutrients.find(n => n.nutrientName === 'Protein')

            return {
              name: food.description,
              calories: calNutrient ? Math.round(calNutrient.value) : 0,
              protein: proteinNutrient ? Math.round(proteinNutrient.value) : 0,
            }
          }).filter(f => f.calories > 0)

          // Merge with local results, preferring USDA data
          const merged = [...foods, ...localMatches.filter(local => 
            !foods.some(usda => usda.name.toLowerCase().includes(local.name.toLowerCase()))
          )]
          
          setResults(merged.slice(0, 8))
        }
      } catch (err) {
        console.error('USDA API error, using local database:', err)
        // Keep showing local results if API fails
      } finally {
        setLoading(false)
      }
    }, 200) // Faster debounce for snappier response

    return () => clearTimeout(debounceRef.current)
  }, [query])

  const handleSelect = (food) => {
    onSelect(food)
    setQuery(food.name)
    setOpen(false)
  }

  return (
    <div className="food-search-wrapper" ref={wrapperRef}>
      <div className="food-search-input-wrap">
        <MagnifyingGlassIcon className="food-search-icon" />
        <input
          className="food-search-input"
          placeholder="Search any food (e.g. chicken breast, oats...)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!e.target.value) onSelect({ name: '', calories: '', protein: '' })
          }}
          onFocus={() => query.trim().length >= 2 && results.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {loading && <div className="food-search-spinner" />}
      </div>

      {open && (
        <div className="food-dropdown">
          <div className="food-dropdown-header">
            <span>Food Database</span>
            <span>{results.length} results</span>
          </div>
          {results.map((food, i) => (
            <button key={i} className="food-item" onClick={() => handleSelect(food)}>
              <span className="food-item-name">{food.name.toLowerCase()}</span>
              <div className="food-item-macros">
                <span className="food-badge calorie-badge">{food.calories} kcal</span>
                <span className="food-badge protein-badge">{food.protein}g protein</span>
              </div>
            </button>
          ))}
          <div className="food-dropdown-footer">
            Per 100g · Powered by USDA FoodData Central
          </div>
        </div>
      )}
    </div>
  )
}

export default FoodSearch