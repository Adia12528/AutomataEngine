# Quick Start Guide - New Tools with Visualizations

## 🎉 What's Fixed

Your three new tools now show **beautiful state diagrams**! Here's how to use them:

---

## 🔄 NFA to DFA Converter

### How to Use
1. Navigate to **NFA→DFA** (purple icon 🔄)
2. Enter description (or use the default example)
3. Click **"Convert NFA to DFA"**
4. Wait for API response (~2-5 seconds)

### What You'll See
- ✅ Original NFA definition + table
- ✅ **NFA State Diagram** (left visualization)
- ✅ Subset construction steps
- ✅ Converted DFA definition + table
- ✅ **DFA State Diagram** (right visualization)

### Example Input
```
Design an NFA over {a,b} that accepts strings containing 'ab'
and convert it to a DFA using subset construction.
```

---

## ⚡ Moore Machine Designer

### How to Use
1. Navigate to **Moore Machine** (teal icon ⚡)
2. Enter description (or use the default example)
3. Click **"Design Moore Machine"**
4. Wait for API response (~2-5 seconds)
5. **Test it**: Enter a string (e.g., "aabba") and click "Run Test"

### What You'll See
- ✅ Formal definition
- ✅ Transition & output table (output in right column)
- ✅ **State Diagram** (outputs shown INSIDE states)
- ✅ Interactive test section

### Example Input
```
Design a Moore machine over {a,b} that outputs 'X' when 
in a state with even number of a's, and 'Y' otherwise.
```

### Moore Machine Key Feature
**Outputs are per STATE** - Each state has one output that doesn't change

---

## ⚙️ Mealy Machine Designer

### How to Use
1. Navigate to **Mealy Machine** (orange icon ⚙️)
2. Enter description (or use the default example)
3. Click **"Design Mealy Machine"**
4. Wait for API response (~2-5 seconds)
5. **Test it**: Enter a string (e.g., "aabba") and click "Run Test"

### What You'll See
- ✅ Formal definition
- ✅ Transition/output table (format: state/output)
- ✅ **State Diagram** (outputs shown ON EDGES)
- ✅ Interactive test section

### Example Input
```
Design a Mealy machine over {a,b} that outputs 'X' on 
transitions with input 'a' and 'Y' on input 'b'.
```

### Mealy Machine Key Feature
**Outputs are per TRANSITION** - Each edge shows "input/output" format

---

## 🎨 Visual Differences

### Moore vs Mealy Diagrams

**Moore Machine Diagram**:
```
   ┌───────────┐
   │    q0     │  ← State
   │  Output:X │  ← Output INSIDE state
   └───────────┘
        │ a
        ▼
   ┌───────────┐
   │    q1     │
   │  Output:Y │
   └───────────┘
```

**Mealy Machine Diagram**:
```
   ┌───────┐
   │   q0  │  ← State (no output)
   └───────┘
      │ a/X  ← Output ON edge
      ▼
   ┌───────┐
   │   q1  │
   └───────┘
```

---

## 🧪 Testing Moore/Mealy Machines

After generating a machine, try the test feature:

1. Look for the **"Test Moore/Mealy Machine"** section
2. Enter a test string (e.g., "aabba")
3. Click **"Run Test"**

### Expected Results

**Moore Machine** (5-character input):
- Outputs **6 symbols** (initial state + 5 transitions)
- Example: `X Y X Y X Y`

**Mealy Machine** (5-character input):
- Outputs **5 symbols** (one per transition)
- Example: `X X Y Y X`

---

## 🔍 Troubleshooting

### Diagram Not Showing?
1. **Wait for loading**: Diagrams appear after API response
2. **Check internet**: Mermaid.js loads from CDN
3. **Browser console**: Press F12 to check for errors
4. **Fallback**: Even if Mermaid fails, text diagrams will show

### Visualization Shows Text Instead of Diagram?
- This is the **fallback mode** - it still works!
- Text format shows all states and transitions
- Useful if Mermaid.js can't load

### API Taking Too Long?
- Normal wait time: 2-5 seconds
- If > 10 seconds, check internet connection
- Timer shows elapsed time in loading box

---

## 💡 Pro Tips

### NFA→DFA
- Try NFAs with **epsilon transitions** (use the word "epsilon")
- Watch how **state sets** form in the DFA
- Compare table sizes (NFA usually smaller, DFA deterministic)

### Moore Machines
- Perfect for **output patterns** based on state history
- Use when output depends on "where you are"
- Test strings to see output sequence (n+1 outputs)

### Mealy Machines
- Perfect for **immediate responses** to input
- More compact than Moore (fewer states often needed)
- Test strings to see output sequence (n outputs)

---

## 🎯 Quick Reference

| Tool | Color | Icon | Outputs | Diagram Type |
|------|-------|------|---------|--------------|
| NFA→DFA | Purple | 🔄 | N/A | Dual diagrams (NFA + DFA) |
| Moore | Teal | ⚡ | In States | Single diagram |
| Mealy | Orange | ⚙️ | On Edges | Single diagram |

---

## 🚀 Ready to Go!

1. **Open** `index.html` in your browser
2. **Navigate** to any new tool
3. **Enter** a description (or use defaults)
4. **Click** the button
5. **View** your beautiful diagrams!

Enjoy your enhanced Automata Engine! 🎉

---

**Questions?** Check `NEW_TOOLS_VISUALIZATION_FIX.md` for technical details.
