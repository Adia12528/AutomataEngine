# ⚙️ Configuration Guide - Performance Settings

## Overview
This guide explains how to configure the performance optimizations to suit your needs.

---

## 🎛️ Configuration Options

### 1. Timer Update Frequency

**Location:** `script.js`, Line 11

**Current Setting:**
```javascript
const TIMER_UPDATE_INTERVAL = 500; // milliseconds
```

**What it does:**
- Controls how often the timer display updates
- Lower values = more frequent updates (more CPU usage)
- Higher values = less frequent updates (smoother)

**Recommended Values:**
| Value | Effect | Use Case |
|-------|--------|----------|
| 100ms | Very frequent | Not recommended (causes lag) |
| 250ms | Frequent | High-end machines only |
| 500ms | **Recommended** | Optimal balance |
| 1000ms | Sparse | Low-end devices |

**How to Change:**
```javascript
// Current (recommended)
const TIMER_UPDATE_INTERVAL = 500;

// To change to 1000ms (less frequent)
const TIMER_UPDATE_INTERVAL = 1000;

// To change to 250ms (more frequent)
const TIMER_UPDATE_INTERVAL = 250;
```

---

### 2. Maximum Concurrent API Requests

**Location:** `script.js`, Line 1544

**Current Setting:**
```javascript
maxConcurrent: 3, // Maximum concurrent API calls
```

**What it does:**
- Controls how many API calls can run simultaneously
- Respects API rate limits
- Prevents overwhelming the server

**Recommended Values:**
| Value | Effect | Use Case |
|-------|--------|----------|
| 1 | Sequential | Conservative (no parallel execution) |
| 2 | Moderate | Lower-end API limits |
| 3 | **Recommended** | Standard API limit |
| 5 | Aggressive | Only if API supports it |

**How to Change:**
```javascript
// Current (recommended)
maxConcurrent: 3,

// For more aggressive concurrent execution
maxConcurrent: 5,

// For conservative sequential execution
maxConcurrent: 1,
```

**⚠️ Important:**
- Check your Gemini API rate limits before increasing
- Default is safe for most use cases
- Increasing too much may cause API errors

---

### 3. DOM Debounce Delay

**Location:** `script.js`, Line 1573

**Current Setting:**
```javascript
domDebouncer.debounce(key, fn, 100) // 100ms delay
```

**What it does:**
- Delays DOM updates to batch multiple changes
- Reduces reflows and repaints
- Improves rendering performance

**Recommended Values:**
| Value | Effect | Use Case |
|-------|--------|----------|
| 50ms | More responsive | Real-time updates |
| 100ms | **Recommended** | Optimal balance |
| 200ms | Less responsive | Smooth, lazy updates |

**How to Change:**
```javascript
// Current (recommended) - debounce with 100ms delay
domDebouncer.debounce(key, fn, 100);

// For real-time updates
domDebouncer.debounce(key, fn, 50);

// For smooth, lazy updates
domDebouncer.debounce(key, fn, 200);
```

---

## 🎯 Common Configuration Scenarios

### Scenario 1: Maximum Performance (Fast Machines)
```javascript
const TIMER_UPDATE_INTERVAL = 250;  // More frequent updates
maxConcurrent: 5,                    // More aggressive parallelism
domDebouncer delay: 50               // More responsive
```

### Scenario 2: Balanced (Default - Recommended)
```javascript
const TIMER_UPDATE_INTERVAL = 500;  // ✅ Current
maxConcurrent: 3,                    // ✅ Current
domDebouncer delay: 100              // ✅ Current
```

### Scenario 3: Conservative (Low-End Machines)
```javascript
const TIMER_UPDATE_INTERVAL = 1000; // Less frequent
maxConcurrent: 1,                    // Sequential
domDebouncer delay: 200              // Lazy updates
```

### Scenario 4: API Rate Limited
```javascript
const TIMER_UPDATE_INTERVAL = 500;
maxConcurrent: 1,                    // Strict limit
domDebouncer delay: 100
```

---

## 🔍 Monitoring & Testing

### After Changing Configuration

**Test the Timer:**
```javascript
1. Make configuration change
2. Click "Solve & Visualize DFA"
3. Watch timer behavior
4. Should increment smoothly at new interval
```

**Test Concurrent Execution:**
```javascript
1. Adjust maxConcurrent value
2. Solve an automaton
3. Click all three tool buttons
4. Watch if correct number run simultaneously
```

**Monitor Performance:**
```javascript
1. Open DevTools (F12)
2. Performance tab
3. Click Record
4. Run operations
5. Check task lengths and memory usage
```

---

## ⚠️ Important Warnings

### ❌ DO NOT DO THIS

```javascript
// ❌ Timer too frequent (causes lag)
const TIMER_UPDATE_INTERVAL = 50;

// ❌ Too many concurrent requests (API errors)
maxConcurrent: 10;

// ❌ No debounce delay (excessive reflows)
domDebouncer.debounce(key, fn, 0);
```

### ✅ DO THIS INSTEAD

```javascript
// ✅ Keep default values unless there's a good reason
const TIMER_UPDATE_INTERVAL = 500;
maxConcurrent: 3;
domDebouncer delay: 100;

// ✅ Test thoroughly after changes
// ✅ Monitor performance metrics
// ✅ Get user feedback before deploying
```

---

## 🧪 Testing Your Configuration

### Performance Test Script
```javascript
// Add this to browser console to test
console.time('operation');

// Perform your operation
// (e.g., solve an automaton, click tool buttons)

console.timeEnd('operation'); // Shows elapsed time
```

### Memory Test
```javascript
// Check before and after operations
console.log(performance.memory);

// Look for stable memory usage
```

### DOM Update Frequency Test
```javascript
// Count DOM updates during operation
let updateCount = 0;
const observer = new MutationObserver(() => updateCount++);
observer.observe(document.body, { subtree: true, attributes: true });

// Perform operation

observer.disconnect();
console.log(`DOM updates: ${updateCount}`);
```

---

## 📊 Configuration Impact

### Performance Impact Table

| Setting | Low | Default | High | Impact |
|---------|-----|---------|------|--------|
| Timer Interval | 100ms | 500ms | 1000ms | Battery, CPU |
| Concurrent Requests | 1 | 3 | 5 | API Rate, Network |
| Debounce Delay | 50ms | 100ms | 200ms | Responsiveness |

---

## 🔄 Rollback to Defaults

If you want to go back to recommended settings:

```javascript
// Line 11
const TIMER_UPDATE_INTERVAL = 500;

// Line 1544
maxConcurrent: 3,

// Line 1573 (in all domDebouncer calls)
domDebouncer.debounce(key, fn, 100);
```

---

## 🚀 Advanced Configuration

### For Power Users

If you want more fine-grained control, you can create a configuration object:

```javascript
// Add this at the top of script.js
const PERFORMANCE_CONFIG = {
    timer: {
        updateInterval: 500,      // ms
        useRAF: true              // Use RequestAnimationFrame
    },
    requests: {
        maxConcurrent: 3,         // Concurrent API calls
        timeout: 30000,           // 30 second timeout
        retries: 3                // Max retries on failure
    },
    dom: {
        debounceDelay: 100,       // ms
        batchUpdates: true        // Batch DOM updates
    }
};

// Then use it throughout the code
const TIMER_INTERVAL = PERFORMANCE_CONFIG.timer.updateInterval;
const MAX_CONCURRENT = PERFORMANCE_CONFIG.requests.maxConcurrent;
```

---

## ✅ Configuration Checklist

Before deploying any configuration changes:

- [ ] Tested on target devices
- [ ] Measured performance improvement
- [ ] Verified API rate limits not exceeded
- [ ] Checked memory usage is stable
- [ ] User tested for smoothness
- [ ] No console errors appear
- [ ] All tools function correctly
- [ ] Timer displays correctly

---

## 📞 Troubleshooting

### Problem: Timer Still Freezing
**Solution:** Increase `TIMER_UPDATE_INTERVAL` to 1000ms
```javascript
const TIMER_UPDATE_INTERVAL = 1000;
```

### Problem: Tools Take Too Long
**Solution:** Increase `maxConcurrent` to 5
```javascript
maxConcurrent: 5,
```

### Problem: UI Feels Laggy
**Solution:** Increase `debounce delay` to 200ms
```javascript
domDebouncer.debounce(key, fn, 200);
```

### Problem: API Rate Limit Errors
**Solution:** Decrease `maxConcurrent` to 1
```javascript
maxConcurrent: 1,
```

---

## 📚 Reference

### All Configuration Locations

| Setting | File | Line | Variable |
|---------|------|------|----------|
| Timer Interval | script.js | 11 | TIMER_UPDATE_INTERVAL |
| Max Concurrent | script.js | 1544 | maxConcurrent |
| Debounce Delay | script.js | 1573 | delay parameter |

### Related Functions

| Function | Location | Purpose |
|----------|----------|---------|
| startTimer() | Line ~1498 | Timer display |
| requestManager.executeWithLimit() | Line ~1549 | Concurrent execution |
| domDebouncer.debounce() | Line ~1573 | DOM batching |

---

## 🎓 Best Practices

1. **Test Before Deploying**
   - Change one setting at a time
   - Test thoroughly
   - Measure performance improvement

2. **Monitor in Production**
   - Watch for user complaints
   - Monitor API error rates
   - Track performance metrics

3. **Document Your Changes**
   - Note why you changed something
   - Keep git history clean
   - Comment changes in code

4. **Use Defaults First**
   - Current defaults are optimized
   - Only change if there's a specific need
   - Most users won't need custom config

---

**Last Updated:** October 26, 2025  
**Version:** 1.0

Happy optimizing! ⚡
