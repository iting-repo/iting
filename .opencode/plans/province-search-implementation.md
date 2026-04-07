# Plan: Implement Province/City Search on HomePage

## Overview
Replace hardcoded location list with real Vietnamese provinces from public API and make the location search functional.

## Current State Analysis

### Problem
- `HomePage.jsx:191` - Locations are hardcoded: `["Thành phố Hồ Chí Minh", "Quận 1", ...]`
- Location dropdown exists but uses fake data
- Filter bar location buttons (lines 340-348) are not clickable
- No state management for provinces

### Existing Infrastructure (Ready to Use)
- **Backend**: `GET /api/jobs/search?location=...` already accepts location query
- **Frontend**: `handleSearch` already sends `location` param to backend (line 106)
- **Provinces API**: `https://provinces.open-api.vn/api/v2/p/` already used in PostJob.jsx

## Implementation Steps

### Step 1: Add State for Provinces
**File**: `F:\HK252\ITing\ITing-frontend\src\pages\public\HomePage.jsx`

Add two new state variables after line 22:
```javascript
const [provinces, setProvinces] = useState([]);
const [selectedLocationFilter, setSelectedLocationFilter] = useState('');
```

### Step 2: Fetch Provinces on Mount
Add a useEffect to fetch provinces from public API (after line 37):

```javascript
useEffect(() => {
    fetch("https://provinces.open-api.vn/api/v2/p/")
        .then((res) => res.json())
        .then((data) => setProvinces(data))
        .catch((err) => console.error("Failed to fetch provinces:", err));
}, []);
```

### Step 3: Remove Hardcoded Locations Array
**Delete line 191**:
```javascript
const locations = ["Thành phố Hồ Chí Minh", "Quận 1", ...];
```

### Step 4: Update Location Dropdown (Hero Section)
**Lines 232-236** - Replace with:
```jsx
<option value="">Địa điểm</option>
{provinces.map((province) => (
    <option key={province.code} value={province.name}>{province.name}</option>
))}
```

### Step 5: Make Filter Bar Buttons Functional
**Lines 340-348** - Replace with clickable buttons:
```jsx
{provinces.map((province, i) => (
    <button 
        key={province.code} 
        onClick={() => {
            const newLocation = selectedLocationFilter === province.name ? '' : province.name;
            setSelectedLocationFilter(newLocation);
            handleChangeSearchField('location', newLocation);
        }}
        className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all border
            ${selectedLocationFilter === province.name
                ? 'bg-[#3AB4E6] border-[#3AB4E6] text-white shadow-md shadow-blue-200'
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
            }`}
    >
        {province.name}
    </button>
))}
```

### Step 6: Remove Province Fetching from PostJob (Optional Cleanup)
Consider creating a shared service/utility for province fetching to avoid duplication.

## Expected Behavior

1. **On page load**: Fetches ~63 Vietnamese provinces from public API
2. **Dropdown**: Shows all provinces, user selects one
3. **Filter buttons**: Click to select/deselect, highlights active selection
4. **Search**: When user clicks "Tìm kiếm", the `location` param is included in the API call
5. **URL Query**: The location value is passed as `?location=Tên+tỉnh` in the backend request

## No Backend Changes Required
The existing endpoint `GET /api/jobs/search` already accepts `location` as a query parameter and filters jobs accordingly.

## Files to Modify
- `F:\HK252\ITing\ITing-frontend\src\pages\public\HomePage.jsx` (main changes)

## Testing Checklist
- [ ] Provinces load correctly on page mount
- [ ] Dropdown shows all provinces
- [ ] Selecting a province and searching filters jobs correctly
- [ ] Filter bar buttons toggle selection and trigger search
- [ ] Active filter button is highlighted
- [ ] No errors in console
