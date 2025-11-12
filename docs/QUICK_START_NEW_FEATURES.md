# Quick Start Guide - New Features

## 🎯 Three New Tools Added!

### 1. NFA → DFA Converter 🔄
**What it does**: Converts any NFA to a DFA using subset construction

**How to use**:
1. Click the purple 🔄 icon (NFA→DFA)
2. Describe your NFA (e.g., "NFA that accepts strings ending in '01'")
3. Click "Convert NFA to DFA"
4. See both machines side-by-side with conversion steps!

**Example Input**:
```
Design an NFA over {a,b} that accepts strings containing 'ab'
```

**What you get**:
- Original NFA with full transition table
- Step-by-step subset construction process
- Converted DFA with transition table
- Visual diagrams of both automata

---

### 2. Moore Machine Designer ⚡
**What it does**: Creates Moore machines (output on states)

**How to use**:
1. Click the teal ⚡ icon (Moore)
2. Describe your Moore machine requirements
3. Click "Design Moore Machine"
4. Test with custom strings!

**Example Input**:
```
Moore machine over {0,1} that outputs 1 for even number of 1s, 0 otherwise
```

**What you get**:
- Complete state transition table
- Output function (one output per state)
- Interactive string tester
- State diagram visualization

**Testing**:
- Enter test string (e.g., "1101")
- Click "Run Test"
- See output sequence (includes initial state output)

---

### 3. Mealy Machine Designer ⚙️
**What it does**: Creates Mealy machines (output on transitions)

**How to use**:
1. Click the orange ⚙️ icon (Mealy)
2. Describe your Mealy machine requirements
3. Click "Design Mealy Machine"
4. Test with custom strings!

**Example Input**:
```
Mealy machine over {a,b} that outputs 'X' on 'a' transitions, 'Y' on 'b' transitions
```

**What you get**:
- Combined transition/output table (state/output format)
- Output function (one output per transition)
- Interactive string tester
- State diagram visualization

**Testing**:
- Enter test string (e.g., "aabba")
- Click "Run Test"
- See output sequence (one output per input symbol)

---

## 🔑 Key Differences

### Moore vs Mealy

| Feature | Moore Machine ⚡ | Mealy Machine ⚙️ |
|---------|-----------------|------------------|
| **Output depends on** | Current state only | Current state + input |
| **Outputs in table** | Separate column | Combined with transitions |
| **Output timing** | State entry | Transition |
| **Test output length** | n+1 (includes initial) | n (one per input) |
| **Example format** | q₀ → X | q₀ --a/X--> q₁ |

### Example Comparison
**Input string**: "ab"

**Moore Output**:
- Initial state: X
- After 'a': Y  
- After 'b': X
- **Result**: "X Y X" (3 outputs)

**Mealy Output**:
- Transition on 'a': X
- Transition on 'b': Y
- **Result**: "X Y" (2 outputs)

---

## 📱 Mobile Access

All features work perfectly on mobile!

**To access on mobile**:
1. Tap the three-dot menu (⋮) at top right
2. Tap "🏠 Home" to see all tools
3. Scroll and tap your desired tool:
   - 🔄 NFA→DFA
   - ⚡ Moore
   - ⚙️ Mealy

**Mobile features**:
- ✅ Full-width forms for easy typing
- ✅ Touch-friendly buttons
- ✅ Responsive tables (swipe to scroll)
- ✅ Single-column layouts
- ✅ Same functionality as desktop

---

## 🎨 Visual Guide

### Color Coding
- **Purple** 🔄 = NFA to DFA conversion
- **Teal** ⚡ = Moore machine (state outputs)
- **Orange** ⚙️ = Mealy machine (transition outputs)

### Navigation Locations
1. **Home Page**: Grid of cards in the middle
2. **Desktop**: Hover over "Home" in nav bar
3. **Mobile**: Three-dot menu → Home dropdown

---

## ⚡ Pro Tips

### NFA to DFA
- Be specific about epsilon transitions if needed
- Mention if NFA should be minimal
- Example: "NFA with epsilon-transitions for (a|b)*ab"

### Moore Machine
- Specify output alphabet clearly
- Define output for each state behavior
- Test with strings of different lengths
- Remember: First output is from initial state

### Mealy Machine  
- Specify output for each input symbol
- Define transition behaviors clearly
- Output sequence matches input length
- Good for sequence transformers

### All Features
- ✅ Use clear, simple language
- ✅ Specify the alphabet explicitly
- ✅ Mention any special requirements
- ✅ Test with multiple strings
- ✅ Works in both light and dark mode!

---

## 🐛 Troubleshooting

**"Please enter a description"**
- Make sure textarea is not empty
- Click inside the text area first

**"Invalid API response"**
- Check your internet connection
- Try rephrasing your description
- Refresh the page and try again

**Test not working**
- Generate the machine first
- Check if test string uses valid alphabet
- Ensure machine is fully loaded

**Mobile menu not showing**
- Tap the three-dot icon (⋮)
- Try refreshing the page
- Check if you're below 768px width

---

## 📖 Learn More

Want to understand the theory behind these tools?

### NFA to DFA Conversion
- Based on **subset construction algorithm**
- Each DFA state represents a set of NFA states
- Eliminates non-determinism
- May increase number of states (exponentially in worst case)

### Moore Machines
- **Output**: Function of state only
- **Notation**: λ(q) = output
- **Use case**: Controllers, state-based systems
- **Example**: Traffic light controller

### Mealy Machines
- **Output**: Function of state AND input
- **Notation**: λ(q, a) = output
- **Use case**: Sequence transformers, encoders
- **Example**: Serial data encoder

### Equivalence
- Every Moore machine has equivalent Mealy machine
- Every Mealy machine has equivalent Moore machine
- Conversion between them is possible!

---

## ✨ Examples to Try

### NFA to DFA
```
1. NFA over {0,1} accepting strings ending in "00"
2. NFA over {a,b} with epsilon transitions accepting "ab*a"
3. NFA that accepts strings with an odd number of 1s
```

### Moore Machine
```
1. Outputs 1 when even number of 0s seen, 0 otherwise
2. 3-state machine cycling outputs X, Y, Z
3. Binary counter outputting current count
```

### Mealy Machine
```
1. Outputs 1 on transition when input is 1, 0 otherwise
2. XOR encoder: output is XOR of current and previous input
3. Sequence detector outputting 1 when "101" is seen
```

---

## 🎓 Educational Use

Perfect for:
- 📚 Automata Theory courses
- 🎯 Homework and assignments
- 🧪 Experimenting with designs
- 💡 Understanding algorithms
- 📝 Creating examples for presentations

---

## 🚀 What's Next?

Future features being planned:
- Moore ↔ Mealy conversion tool
- Minimization algorithms
- Equivalence checking
- Export to LaTeX/diagrams
- Animation mode
- More examples library

---

**Need Help?**
- Check the main documentation: `NEW_FEATURES_DOCUMENTATION.md`
- All features use AI-powered generation
- Results are formatted and ready to use

**Happy Automata Designing!** 🎉

---

**Version**: 1.0.0  
**Last Updated**: November 11, 2025
