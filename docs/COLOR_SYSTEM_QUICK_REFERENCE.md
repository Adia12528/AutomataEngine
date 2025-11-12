# 🎨 Quick Color Reference Guide

## 📋 How to Use the New Color System

### For Light Mode
Use these CSS variables in your code:

```css
/* Primary Colors */
var(--light-primary)      /* #2563eb - Main blue */
var(--light-secondary)    /* #7c3aed - Purple accent */
var(--light-accent)       /* #10b981 - Emerald green */

/* Backgrounds */
var(--light-bg-primary)   /* #ffffff - Pure white */
var(--light-bg-secondary) /* #f8fafc - Very light gray */
var(--light-bg-tertiary)  /* #f1f5f9 - Light gray */

/* Text */
var(--light-text-primary)   /* #0f172a - Dark slate */
var(--light-text-secondary) /* #475569 - Medium slate */
var(--light-text-tertiary)  /* #64748b - Light slate */

/* Borders */
var(--light-border-primary)   /* #e2e8f0 */
var(--light-border-secondary) /* #cbd5e1 */
var(--light-border-focus)     /* #3b82f6 */

/* Gradients */
var(--gradient-primary-light) /* Blue to purple gradient */
var(--gradient-accent-light)  /* Emerald to blue gradient */

/* Shadows */
var(--light-shadow)    /* Subtle shadow */
var(--light-shadow-md) /* Medium shadow */
var(--light-shadow-lg) /* Large shadow */
```

### For Dark Mode
```css
/* Primary Colors */
var(--dark-primary)      /* #3b82f6 - Bright blue */
var(--dark-secondary)    /* #a78bfa - Light purple */
var(--dark-accent)       /* #34d399 - Light emerald */

/* Backgrounds */
var(--dark-bg-primary)   /* #0f172a - Dark slate */
var(--dark-bg-secondary) /* #1e293b - Medium slate */
var(--dark-bg-tertiary)  /* #334155 - Light slate */

/* Text */
var(--dark-text-primary)   /* #f1f5f9 - Very light */
var(--dark-text-secondary) /* #cbd5e1 - Light gray */
var(--dark-text-tertiary)  /* #94a3b8 - Medium gray */

/* Borders */
var(--dark-border-primary)   /* #334155 */
var(--dark-border-secondary) /* #475569 */
var(--dark-border-focus)     /* #60a5fa */

/* Gradients */
var(--gradient-primary-dark) /* Bright blue to light purple */
var(--gradient-accent-dark)  /* Light emerald to blue */

/* Shadows */
var(--dark-shadow)    /* Subtle dark shadow */
var(--dark-shadow-md) /* Medium dark shadow */
var(--dark-shadow-lg) /* Large dark shadow */
```

---

## 🔧 Common Usage Examples

### Button Styling
```css
.my-button {
    background: var(--gradient-primary-light);
    color: white;
    border: none;
    box-shadow: var(--light-shadow-md);
}

body.dark .my-button {
    background: var(--gradient-primary-dark);
    box-shadow: var(--dark-shadow-md);
}
```

### Card Component
```css
.my-card {
    background: var(--light-bg-primary);
    border: 1px solid var(--light-border-primary);
    color: var(--light-text-primary);
    box-shadow: var(--light-shadow-md);
}

body.dark .my-card {
    background: var(--dark-bg-secondary);
    border-color: var(--dark-border-primary);
    color: var(--dark-text-primary);
    box-shadow: var(--dark-shadow-md);
}
```

### Input Field
```css
.my-input {
    background: var(--light-bg-primary);
    border: 2px solid var(--light-border-primary);
    color: var(--light-text-primary);
}

.my-input:focus {
    border-color: var(--light-border-focus);
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

body.dark .my-input {
    background: var(--dark-bg-secondary);
    border-color: var(--dark-border-primary);
    color: var(--dark-text-primary);
}

body.dark .my-input:focus {
    border-color: var(--dark-border-focus);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

### Text with Accent
```css
.accent-text {
    color: var(--light-accent); /* Emerald green in light mode */
}

body.dark .accent-text {
    color: var(--dark-accent); /* Light emerald in dark mode */
}
```

---

## 🎯 Font Variables

```css
/* Font Families */
var(--font-primary)  /* 'Poppins', sans-serif */
var(--font-heading)  /* 'Outfit', sans-serif */
var(--font-mono)     /* 'JetBrains Mono', monospace */

/* Font Weights */
var(--font-light)     /* 300 */
var(--font-regular)   /* 400 */
var(--font-medium)    /* 500 */
var(--font-semibold)  /* 600 */
var(--font-bold)      /* 700 */
var(--font-extrabold) /* 800 */
var(--font-black)     /* 900 */
```

### Font Usage
```css
.my-heading {
    font-family: var(--font-heading);
    font-weight: var(--font-bold);
}

.my-body-text {
    font-family: var(--font-primary);
    font-weight: var(--font-regular);
}

.my-code {
    font-family: var(--font-mono);
    font-weight: var(--font-medium);
}
```

---

## ⚡ Transition Variables

```css
var(--transition-smooth)  /* 0.4s ease - General animations */
var(--transition-bounce)  /* 0.5s bounce - Elastic effects */
var(--transition-swift)   /* 0.3s ease - Quick interactions */
var(--transition-slow)    /* 0.6s ease - Slow, smooth */
```

### Transition Usage
```css
.my-element {
    transition: var(--transition-swift);
}

.my-element:hover {
    transform: translateY(-2px);
}
```

---

## 🌈 Status Colors

### Success (Emerald Green)
```css
/* Light Mode */
.success {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid var(--light-accent);
    color: #065f46;
}

/* Dark Mode */
body.dark .success {
    background: rgba(52, 211, 153, 0.15);
    border-color: var(--dark-accent);
    color: #6ee7b7;
}
```

### Error (Red)
```css
/* Light Mode */
.error {
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid #ef4444;
    color: #991b1b;
}

/* Dark Mode */
body.dark .error {
    background: rgba(239, 68, 68, 0.15);
    border-color: #f87171;
    color: #fca5a5;
}
```

### Info (Blue)
```css
/* Light Mode */
.info {
    background: rgba(37, 99, 235, 0.1);
    border: 1px solid var(--light-primary);
    color: #1e40af;
}

/* Dark Mode */
body.dark .info {
    background: rgba(59, 130, 246, 0.15);
    border-color: var(--dark-primary);
    color: #93c5fd;
}
```

### Warning (Amber)
```css
/* Light Mode */
.warning {
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid #f59e0b;
    color: #92400e;
}

/* Dark Mode */
body.dark .warning {
    background: rgba(251, 191, 36, 0.15);
    border-color: #fbbf24;
    color: #fde68a;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Extra Small (Mobile) */
@media (max-width: 480px) { }

/* Small (Large Mobile) */
@media (max-width: 640px) { }

/* Medium (Tablet) */
@media (max-width: 768px) { }

/* Medium-Large (Small Desktop) */
@media (max-width: 1024px) { }

/* Large (Desktop) */
@media (max-width: 1280px) { }

/* Extra Large (Wide Desktop) */
@media (min-width: 1281px) { }
```

---

## 💡 Pro Tips

1. **Always use CSS variables** instead of hardcoded colors
2. **Include dark mode variants** for every styled element
3. **Use semantic color names** (primary, secondary, accent)
4. **Leverage gradient variables** for premium effects
5. **Use shadow variables** for consistent depth
6. **Apply transition variables** for smooth interactions

---

## 🔄 Theme Toggle Detection

Check if dark mode is active in JavaScript:
```javascript
const isDark = document.body.classList.contains('dark');

// Toggle dark mode
document.body.classList.toggle('dark');
```

---

## ✅ Checklist for New Components

When adding new styled components:

- [ ] Use CSS color variables (not hardcoded colors)
- [ ] Include both light and dark mode styles
- [ ] Use font variables for typography
- [ ] Add transition variables for smooth animations
- [ ] Include shadow variables for depth
- [ ] Test on all responsive breakpoints
- [ ] Verify theme toggle works correctly
- [ ] Check focus states for accessibility

---

**Remember**: The new color system is designed to be:
- **Consistent** across all components
- **Theme-aware** for automatic dark mode
- **Responsive** to screen sizes
- **Accessible** with proper contrast
- **Professional** with modern blue/purple palette
