# 📖 ΤΟ ΒΙΒΛΙΟ ΤΟΥ FULLSTACK ENGINEER
## 📘 ΚΕΦΑΛΑΙΟ 4: Τα Θεμέλια του Frontend (React, Vite & Το "Τσιπάκι" του Component)

```text
===================================================================================
                                 ΣΥΝΟΨΗ ΚΕΦΑΛΑΙΟΥ
   • 4.1 Η Μεγάλη Μετάβαση: Από το Node.js Backend στον Browser με το Vite
   • 4.2 Το "Τσιπάκι" της React: Μονοσήμαντη Ροή & Το Κύκλωμα του Re-render
   • 4.3 useState vs Απλές Μεταβλητές: Ο Μαυροπίνακας vs Η Θυρίδα Ασφαλείας
   • 4.4 Προστακτικός (Imperative) vs Δηλωτικός (Declarative) Προγραμματισμός
   • 4.5 Το Επίσημο Τεστ των 3 Ερωτήσεων: Τι είναι State & Τι είναι Derived Value;
   • 4.6 Η Ανατομία του useEffect: Το "Φωτοκύτταρο" & Ο Κανόνας "Never Block the UI"
   • 4.7 Η Πραγματικότητα του Δικτύου: Loading State, Συντακτικές Παγίδες & setTimeout
   • 4.8 Statement vs Expression: Γιατί το for loop απαγορεύεται μέσα στο JSX
   • 4.9 Εμφάνιση Λιστών με .map(): Το Εργοστάσιο Μετατροπής & Το Μυστικό του key
   • 4.10 Διεθνοποίηση Ημερομηνιών: Intl.DateTimeFormat αντί για Hardcoded Arrays
   • 4.11 Ένθετη Επανάληψη: .map() μέσα σε .map() & Φιλτράρισμα με .filter()
   • 4.12 Το Διαβόητο Bug: "Objects are not valid as a React child ({_, $})"
   • 4.13 Το Μυστήριο του CSS: Γιατί κόλλησε το Scroll (overflow: hidden)
   • 4.14 Ολοκληρωμένος Κώδικας του EPGCalendar_2.jsx
===================================================================================
```

---

### 4.1 Η Μεγάλη Μετάβαση: Από το Node.js Backend στον Browser με το Vite

Μέχρι το Κεφάλαιο 3, ζούσαμε αποκλειστικά στον κόσμο του **Backend (Node.js)**:
* Ο κώδικάς μας έτρεχε απευθείας στη γραμμή εντολών (`node server_2.js`).
* Δεν υπήρχε οθόνη, δεν υπήρχε ποντίκι, δεν υπήρχαν χρώματα. Μόνο τερματικό και JSON strings.

Στο Κεφάλαιο 4, περνάμε στην αντίπερα όχθη: το **Frontend**.

#### ⚡ Γιατί Vite και όχι το παλιό Create React App (CRA);
Στο παρελθόν, τα εργαλεία ανάπτυξης (όπως το Webpack) έπαιρναν όλα τα αρχεία JavaScript, τα ένωναν σε ένα τεράστιο πακέτο (bundle) και χρειαζόταν να περιμένεις 20-30 δευτερόλεπτα σε κάθε αποθήκευση αρχείου.

Το **Vite** (γαλλική λέξη που σημαίνει «γρήγορος») αξιοποιεί τα σύγχρονα Native ES Modules των μοντέρνων browsers:
* Εκκινεί τον dev server σε λιγότερο από **300ms**.
* Με το **Hot Module Replacement (HMR)**, όταν αλλάζεις μια γραμμή στο `EPGCalendar_2.jsx`, η αλλαγή εμφανίζεται στην οθόνη σου **ακαριαία** χωρίς να χαθεί η κατάσταση της εφαρμογής!

---

### 4.2 Το "Τσιπάκι" της React: Μονοσήμαντη Ροή & Το Κύκλωμα του Re-render

Στην κλασική JavaScript (Vanilla JS), ο προγραμματιστής λειτουργεί σαν ηλεκτρολόγος που τρέχει με καλώδια στο χέρι: βρίσκει ένα στοιχείο στο DOM, του αλλάζει κείμενο, του κολλάει ένα κουμπί.

Στη **React**, ένα Component είναι ένα **τυπωμένο ηλεκτρονικό κύκλωμα**. 
Το ρεύμα κινείται **κυκλικά και προς μία μόνο κατεύθυνση (Unidirectional Data Flow)**:

```text
       ┌────────────────────────────────────────────────────────┐
       │                                                        │
       ▼                                                        │
  [ 1. STATE ]  (Η Μνήμη: date, channels, events, isLoading)   │
       │                                                        │
       │  Το ρεύμα διαβάζει τις τιμές                           │
       ▼                                                        │
  [ 2. RENDER / RETURN ] (Ο Προβολέας: Παράγει το JSX/HTML)     │
       │                                                        │
       │  Ο χρήστης βλέπει την οθόνη και πατάει ένα κουμπί       │
       ▼                                                        │
  [ 3. EVENT LISTENER ] (Ο Διακόπτης: onClick={changeDay})      │
       │                                                        │
       │  Στέλνει ηλεκτρικό παλμό στην React: setDate(...)      │
       ▼                                                        │
  [ 4. REACT ENGINE ] (Ο Επεξεργαστής)                          │
       │                                                        │
       └─────► Ενημερώνει το State και ΞΑΝΑΤΡΕΧΕΙ το κύκλωμα ───┘
               (Re-render από την 1η γραμμή!)
```

#### 🔁 Τι σημαίνει Re-render;
Κάθε φορά που καλείται μια συνάρτηση `set...` (π.χ. `setDate`), η React **ξαναεκτελεί ολόκληρη τη συνάρτηση του Component από την πρώτη γραμμή μέχρι το return**!

---

### 4.3 useState vs Απλές Μεταβλητές: Ο Μαυροπίνακας vs Η Θυρίδα Ασφαλείας

Μια από τις μεγαλύτερες απορίες κάθε νέου προγραμματιστή είναι:
> *«Γιατί το date είναι στο useState, ενώ το currentDate μέσα στη changeDay είναι απλό const;»*

#### Α) Ο Μαυροπίνακας που σβήνεται (Απλές μεταβλητές: `let / const`)
Όταν η React κάνει re-render, εκτελεί τη συνάρτηση από την αρχή.
Αν γράφαμε:
```javascript
let date = '2026-10-11';
```
Σε κάθε κλικ του χρήστη, η συνάρτηση θα ξαναεκτελούνταν και το `date` **θα ξαναγινόταν αναγκαστικά `'2026-10-11'`**! Η συνάρτηση παθαίνει πλήρη αμνησία. Οι απλές μεταβλητές πεθαίνουν και ξαναγεννιούνται σε κάθε render.

#### Β) Η Θυρίδα Ασφαλείας (`useState`)
Όταν γράφουμε:
```javascript
const [date, setDate] = useState('2026-10-11');
```
Λέμε στη React: *«Κράτα αυτή την τιμή στη δική σου μόνιμη μνήμη έξω από τη συνάρτησή μου. Όταν ξανατρέξεις το Component, μην της δώσεις την αρχική τιμή, αλλά τη νέα τιμή που σου έδωσα με το setDate!»*.

#### ❓ Η Ερώτηση-Παγίδα:
> *«Αφού σε κάθε render ξαναδιαβάζει τη γραμμή `useState('2026-10-11')`, πώς ξέρει η React να το αγνοήσει;»*

**Η Απάντηση:** 
Η τιμή μέσα στην παρένθεση του `useState('...')` είναι **ΜΟΝΟ το αρχικό κεφάλαιο (Initial State)**. 
* **1ο Render:** Η React βλέπει ότι το συρτάρι είναι άδειο. Παίρνει το `'2026-10-11'` και το αποθηκεύει.
* **2ο Render (Re-render):** Η React κοιτάει το συρτάρι της. Βλέπει ότι **έχει ήδη αποθηκευμένη τιμή** (π.χ. `'2026-10-12'`). **Αγνοεί πλήρως** το `'2026-10-11'` της παρένθεσης και σου επιστρέφει τη νέα τιμή!

#### Γ) Και τι είναι το `currentDate` στη `changeDay`;
```javascript
function changeDay(offset) {
    const currentDate = new Date(date);
    currentDate.setDate(currentDate.getDate() + offset);
    setDate(currentDate.toISOString().split('T')[0]);
}
```
Το `currentDate` είναι ένα **πρόχειρο χαρτάκι σημειώσεων (scratchpad)**.
Ζει για μόλις 0.0001 δευτερόλεπτο, όσο διαρκεί το κλικ. Υπολογίζει τη νέα ημερομηνία, την παραδίδει στο `setDate()` και καταστρέφεται. Δεν χρειάζεται να ζήσει μετά το κλικ ούτε επηρεάζει από μόνο του την οθόνη.

---

### 4.4 Προστακτικός (Imperative) vs Δηλωτικός (Declarative) Προγραμματισμός

Η προέλευση των όρων προέρχεται κατευθείαν από τη **Γραμματική**:

#### 👨‍🍳 Προστακτικός Προγραμματισμός = Η Προστακτική Έγκλιση («Κάνε!»)
Είσαι ένας αυστηρός Αρχιμάγειρας πάνω από έναν βοηθό:
1. *«Πάρε το μαχαίρι!»*
2. *«Κόψε το κρεμμύδι!»*
3. *«Άναψε τη φωτιά!»*

Στη Vanilla JavaScript (DOM Manipulation):
```javascript
// Προστακτικά (διατάζεις το DOM βήμα-βήμα):
const container = document.getElementById('box');
container.innerHTML = '';
const p = document.createElement('p');
p.innerText = 'Φορτώνει...';
container.appendChild(p);
```
Είσαι υπεύθυνος για κάθε κίνηση. Αν ξεχάσεις να σβήσεις το παλιό περιεχόμενο (`innerHTML = ''`), η σελίδα γεμίζει σκουπίδια.

#### 🍽️ Δηλωτικός Προγραμματισμός = Η Οριστική Έγκλιση («Δηλώνω τι θέλω»)
Πας στο εστιατόριο και λες στον σερβιτόρο:
> *«Δηλώνω ότι θέλω ένα ριζότο μανιταριών»*.
Δεν σε νοιάζει πώς θα ανάψει η φωτιά ούτε με ποια σειρά θα μπουν τα υλικά. Δηλώνεις **ΜΟΝΟ ΤΟ ΤΕΛΙΚΟ ΑΠΟΤΕΛΕΣΜΑ**.

Στη React:
```jsx
// Δηλώνεις το προσχέδιο (Blueprint):
{isLoading ? <p>Φορτώνει...</p> : <p>Ήρθαν τα κανάλια!</p>}
```
Δεν υπάρχει ούτε ένα `getElementById`, ούτε ένα `appendChild`. Εσύ δηλώνεις την κατάσταση, και η μηχανή της React αναλαμβάνει μόνη της να ενημερώσει το DOM.

#### 🔗 Γιατί «Δηλωτική» σημαίνει «Αποσυνδεδεμένη»;
* Στον προστακτικό τρόπο, υπάρχει μια άκαμπτη αλυσίδα: Το κουμπί καλεί τη συνάρτηση Α $\to$ η Α αλλάζει το DOM $\to$ η Β αλλάζει το κείμενο.
* Στον δηλωτικό τρόπο, τα μέρη είναι **πλήρως αποσυνδεδεμένα**:
  * Το κουμπί νοιάζεται ΜΟΝΟ να αλλάξει το State: `setDate(...)`.
  * Το UI νοιάζεται ΜΟΝΟ να διαβάσει το State και να ζωγραφιστεί.
  * Το `useEffect` νοιάζεται ΜΟΝΟ να παρακολουθήσει πότε αλλάζει το State.

---

### 4.5 Το Επίσημο Τεστ των 3 Ερωτήσεων: Τι είναι State & Τι είναι Derived Value;

Στην αρχιτεκτονική της React, το **State** είναι:
> **Η Στιγμιαία Φωτογραφία (Snapshot) των ελάχιστων απαραίτητων δεδομένων της εφαρμογής.**

Για κάθε μεταβλητή που σκέφτεσαι να βάλεις, εφαρμόζεις τον **Χρυσό Κανόνα των 3 Ερωτήσεων**:

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Αλλάζει με την πάροδο του χρόνου ή από κλικ του χρήστη;  │
│    ├── ΟΧΙ ──► ΑΠΛΟ CONST (π.χ. apiBase URL)                │
│    └── ΝΑΙ ──► Προχώρα στην Ερώτηση 2                       │
│                                                             │
│ 2. Μπορεί να υπολογιστεί από κάποιο State που ΗΔΗ υπάρχει;  │
│    ├── ΝΑΙ ──► DERIVED VALUE! ΑΠΑΓΟΡΕΥΕΤΑΙ ΝΑ ΓΙΝΕΙ STATE!   │
│    │           (π.χ. channels.length, formattedDate)        │
│    └── ΟΧΙ ──► Προχώρα στην Ερώτηση 3                       │
│                                                             │
│ 3. Έρχεται έτοιμο από τον γονιό (Props);                     │
│    ├── ΝΑΙ ──► ΑΝΗΚΕΙ ΣΤΟΝ ΓΟΝΙΟ, ΟΧΙ ΣΕ ΕΣΕΝΑ               │
│    └── ΟΧΙ ──► 🌟 ΕΙΝΑΙ 100% ΑΥΘΕΝΤΙΚΟ STATE! (useState)    │
└─────────────────────────────────────────────────────────────┘
```

#### Παραδείγματα Εφαρμογής στο EPG μας:
* **`date`:** Αλλάζει; Ναι. Υπολογίζεται από κάτι άλλο; Όχι. $\to$ **State** (`useState`).
* **`channels.length`:** Αλλάζει; Ναι. Υπολογίζεται; **ΝΑΙ**, από τον πίνακα `channels`! $\to$ **Derived Value** (απαγορεύεται να γίνει `useState`).
* **`formattedDate` («Κυριακή 11 Οκτωβρίου»):** Υπολογίζεται από το `date`; **ΝΑΙ!** $\to$ **Derived Value** (`const formattedDate = new Intl...`).
* **`isLoading`:** Αλλάζει; Ναι. Υπολογίζεται από άλλο state; Όχι (δεν ξέρεις πότε απαντάει το δίκτυο). $\to$ **State** (`useState`).

---

### 4.6 Η Ανατομία του useEffect: Το "Φωτοκύτταρο" & Ο Κανόνας "Never Block the UI"

```javascript
useEffect(() => {
    fetch(`${apiBase}/api/epg?date=${date}`)
        .then(...)
}, [date]); // 👈 Dependency Array (Πίνακας Εξαρτήσεων)
```

#### 🚨 Ο Κίνδυνος του Ατέρμονου Βρόχου (Infinite Loop Crash)
Αν βάζαμε το `fetch` χύμα μέσα στο σώμα του Component:
1. Τρέχει το Component $\to$ καλείται το `fetch`.
2. Έρχονται δεδομένα $\to$ καλείται `setEvents(...)`.
3. Το `setEvents` προκαλεί **re-render**!
4. Το Component ξανατρέχει από την αρχή $\to$ **ξανακαλείται το `fetch`!**
5. Έρχονται δεδομένα $\to$ `setEvents` $\to$ re-render $\to$ fetch $\to$ ...
6. **Ο browser παγώνει και κρασάρει σε 2 δευτερόλεπτα με χιλιάδες αιτήματα!**

#### 🎯 Πώς το `useEffect` λύνει το πρόβλημα:
Το `useEffect` έχει **κρυφή μνήμη** μέσα στη React:
* **Στο 1ο Render:** Εκτελείται για την αρχική μέρα και σημειώνει: `Τελευταίο date = '2026-10-11'`.
* **Στο Re-render (μετά από κλικ στο `>`):** Συγκρίνει:
  * Παλιό: `'2026-10-11'`
  * Νέο: `'2026-10-12'`
  * Διαφέρουν; **ΝΑΙ!** Χτυπάει ο συναγερμός και εκτελεί το `fetch` για τη νέα μέρα!
* **Αν γίνει Re-render για άλλο λόγο και το date παραμείνει ίδιο:**
  * Παλιό: `'2026-10-12'` / Νέο: `'2026-10-12'`.
  * Είναι ίδια! **Δεν εκτελεί το fetch!** Εξοικονομεί bandwidth και επεξεργαστική ισχύ!

#### ⚖️ Ο Σιδερένιος Νόμος: "Never Block the UI"
> **Πρώτα τρέχει το `return` (ζωγραφίζεται η οθόνη) και ΜΕΤΑ τρέχει το `useEffect`!**

Γιατί; Αν η React περίμενε το δίκτυο (που μπορεί να πάρει 2 δευτερόλεπτα σε αργό 3G), η οθόνη του χρήστη θα πάγωνε ολόλευκη και νεκρή! 
Γι' αυτό:
1. **Βήμα 1:** Η React ζωγραφίζει αμέσως το UI (κουμπιά, ημερομηνία, ένδειξη φόρτωσης).
2. **Βήμα 2:** Στο παρασκήνιο (asynchronously) τρέχει το `fetch`.
3. **Βήμα 3:** Μόλις έρθουν τα δεδομένα, ένα νέο re-render ανανεώνει την οθόνη.

---

### 4.7 Η Πραγματικότητα του Δικτύου: Loading State, Συντακτικές Παγίδες & setTimeout

#### Ποιος είναι ο Φυσικός Ιδιοκτήτης του Loading;
Σκεφτήκαμε: *«Μήπως να βάζαμε το `setIsLoading(true)` μέσα στα κουμπιά `onClick` ή στη `changeDay`;»*

Ανακαλύψαμε τη μεγάλη παγίδα:
* Το `onClick` διαρκεί **1 millisecond**.
* Το δίκτυο διαρκεί **200 milliseconds**.
* Το κουμπί έχει πεθάνει 199ms πριν επιστρέψει η απάντηση! **Ποιος θα έκανε `setIsLoading(false)`;**
* Επιπλέον, στο πρώτο άνοιγμα της σελίδας δεν πατήθηκε κανένα κουμπί!

Ο **μοναδικός ιδιοκτήτης** του κύκλου ζωής του δικτύου είναι το `useEffect`:

```javascript
useEffect(() => {
    setIsLoading(true); // 1. Ξεκίνησε η αναμονή!

    fetch(`${apiBase}/api/epg?date=${date}`)
        .then(res => res.json())
        .then(data => {
            setChannels(data.channels || []);
            setEvents(data.events || []);
            setIsLoading(false); // 2. Ολοκληρώθηκε με επιτυχία!
        })
        .catch(err => {
            console.error("Σφάλμα:", err);
            setIsLoading(false); // 3. Ολοκληρώθηκε με αποτυχία (αλλά η αναμονή έληξε)!
        });
}, [date]);
```

#### 🐛 Η Συντακτική Παγίδα με το Κόμμα στο `.catch`:
Όταν γράφουμε μια arrow function με πολλαπλές εντολές:
```javascript
// ❌ ΛΑΘΟΣ: Το κόμμα χωρίζει τα ορίσματα της .catch, εκτελώντας το setIsLoading αμέσως!
.catch(err => console.error(err), setIsLoading(false));

// ✅ ΣΩΣΤΟ: Τα άγκιστρα { } ορίζουν το σώμα με πολλαπλές εντολές!
.catch(err => {
    console.error(err);
    setIsLoading(false);
});
```

#### ⏱️ Το Πείραμα με το `setTimeout`:
Επειδή στο `localhost` το Express απαντάει σε μόλις 5ms, το ανθρώπινο μάτι δεν προλαβαίνει να δει την ένδειξη φόρτωσης. Προσθέτοντας:
```javascript
setTimeout(() => {
    setIsLoading(false);
}, 1000);
```
προσομοιώσαμε ένα αργό δίκτυο 3G, βλέποντας καθαρά την εναλλαγή από «Φόρτωση...» στην τελική οθόνη.

---

### 4.8 Statement vs Expression: Γιατί το `for` loop απαγορεύεται μέσα στο JSX

Στην επιστήμη υπολογιστών:
* **Expression (Έκφραση):** Οτιδήποτε υπολογίζεται και **παράγει ΜΙΑ ΤΙΜΗ** (αριθμό, string, πίνακα, JSX).
  * Παραδείγματα: `5 + 3` $\to$ `8`, `'hello'.toUpperCase()` $\to$ `'HELLO'`.
* **Statement (Εντολή / Προσταγή):** Μια ενέργεια που κάνει κάτι, αλλά **ΔΕΝ παράγει τιμή**.
  * Παραδείγματα: `let x = 10;`, `if (...) { ... }`, `for (...) { ... }`.

Το JSX μεταφράζεται σε συναρτήσεις JavaScript:
```javascript
// Το JSX μετατρέπεται σε:
React.createElement('div', null, [ ...περιμένει τιμές... ]);
```
Μέσα στα άγκιστρα `{}` του JSX, η React περιμένει **Expressions (τιμές)**.
* Το `for` loop είναι Statement: δεν παράγει τιμή $\to$ **Συντακτικό Λάθος!**
* Η μέθοδος `.map()` είναι Expression: παίρνει έναν πίνακα και **επιστρέφει έναν νέο πίνακα με JSX στοιχεία** $\to$ **Απόλυτα έγκυρη!**

---

### 4.9 Εμφάνιση Λιστών με `.map()`: Το Εργοστάσιο Μετατροπής & Το Μυστικό του `key`

Σκέψου το `.map()` σαν έναν **ιμάντα μεταφοράς εργοστασίου**:
* Στην είσοδο μπαίνει ένα κιβώτιο με 9 αντικείμενα καναλιών.
* Στη μέση στέκεται ένα ρομπότ (η callback συνάρτηση `channel => ( ... )`).
* Στην έξοδο βγαίνει ένα νέο κιβώτιο με 9 κουτάκια `<div>`!

```jsx
{channels.map(channel => (
    <div key={channel.id} className="bg-gray-700 px-3 py-1 rounded">
        {channel.name}
    </div>
))}
```

#### 🔑 Το Μυστικό του `key={channel.id}` (Virtual DOM Reconciliation)
Γιατί η React απαιτεί μοναδικό `key`;
Φαντάσου ότι έχουμε 3 κανάλια: `MEGA`, `ANT1`, `ALPHA`. Και διαγράφουμε το `MEGA`.

* **Χωρίς Key:** Η React κοιτάει μόνο τις θέσεις (index 0, 1, 2). Νομίζει ότι άλλαξαν όλα τα στοιχεία, σβήνει τα πάντα και ξαναζωγραφίζει ολόκληρη τη λίστα από το μηδέν (αργό και επικίνδυνο για bugs).
* **Με Key:** Η React κοιτάει τις μοναδικές ταυτότητες:
  * *«Βλέπω το key="ant1". Υπήρχε; Ναι! Μην το ξαναζωγραφίζεις, απλά ανέβασέ το μία θέση!»*
  * *«Πού είναι το key="mega"; Έλειψε! Σβήσε ΜΟΝΟ αυτό το ένα div από το DOM!»*
  👉 **Αστραπιαία ταχύτητα με ελάχιστες τροποποιήσεις στην οθόνη!**

---

### 4.10 Διεθνοποίηση Ημερομηνιών: `Intl.DateTimeFormat`

Αντί να γράφουμε πρωτόγονους πίνακες με ονόματα ημερών (`['Κυριακή', 'Δευτέρα', ...]`), αξιοποιούμε τον ενσωματωμένο διεθνή μεταφραστή των browsers:

```javascript
const formattedDate = new Intl.DateTimeFormat('el-GR', {
    weekday: 'long',  // "Κυριακή"
    day: 'numeric',   // "11"
    month: 'long',    // "Οκτωβρίου"
    year: 'numeric'   // "2026"
}).format(new Date(date));
```
Με μία γραμμή κώδικα, η τεχνική ημερομηνία `'2026-10-11'` μετατρέπεται στο άψογο ανθρώπινο:
> **«Κυριακή 11 Οκτωβρίου 2026»**

---

### 4.11 Ένθετη Επανάληψη: `.map()` μέσα σε `.map()` & Φιλτράρισμα με `.filter()`

Σε ένα EPG, θέλουμε κάτω από κάθε κανάλι να εμφανίζονται **ΜΟΝΟ οι εκπομπές αυτού του καναλιού**:

```text
- MEGA
  -- 14:00 Ειδήσεις
  -- 15:00 Σειρά
- ANT1
  -- 14:00 Ειδήσεις
  -- 15:30 Ταινία
```

Αυτό υλοποιείται με το **πάντρεμα `.map()` και `.filter()`**:

```jsx
{channels.map(channel => {
    // 1. Το Κόσκινο: Κρατάμε μόνο τις εκπομπές αυτού του καναλιού
    const channelEvents = events.filter(e => e.channel === channel.id);

    return (
        <div key={channel.id} className="bg-gray-800 p-4 rounded-lg">
            {/* Όνομα Καναλιού */}
            <h3 className="text-yellow-400 font-bold">
                📺 {channel.name} ({channelEvents.length} εκπομπές)
            </h3>

            {/* 2. Επανάληψη στις εκπομπές του καναλιού */}
            <div className="flex flex-col gap-1">
                {channelEvents.slice(0, 3).map(e => (
                    <div key={e.id} className="text-sm bg-gray-700 p-2 rounded">
                        🕒 {e.start.slice(11, 16)} - {typeof e.title === 'object' ? e.title._ : e.title}
                    </div>
                ))}
            </div>
        </div>
    );
})}
```

---

### 4.12 Το Διαβόητο Bug: "Objects are not valid as a React child ({_, $})"

Όταν γράψαμε `{e.title}`, η εφαρμογή κράσαρε με το σφάλμα:
> `Uncaught Error: Objects are not valid as a React child (found: object with keys {_, $}).`

#### Η Αιτία:
Στο Κεφάλαιο 1, όταν το `xml2js` διάβασε:
`<title lang="el">Μπαμπά σ' Αγαπώ</title>`
το μετέτρεψε σε Object:
```javascript
{
    _: "Μπαμπά σ' Αγαπώ",  // Το κείμενο
    $: { lang: "el" }      // Τα XML attributes
}
```
Η React αρνείται να ζωγραφίσει ένα JavaScript Object κατευθείαν στην οθόνη. Περιμένει string ή number!

#### Η Διόρθωση (Ασπίδα Προστασίας):
```javascript
typeof e.title === 'object' ? e.title._ : e.title
```
Αν είναι αντικείμενο, διαβάζουμε το πεδίο `_`. Αν είναι ήδη απλό string, το τυπώνουμε άμεσα.

---

### 4.13 Το Μυστήριο του CSS: Γιατί κόλλησε το Scroll (`overflow: hidden`);

Όταν φορτώσαμε όλα τα κανάλια και τις εκπομπές, παρατηρήσαμε ότι η σελίδα αρνούνταν να κάνει scroll προς τα κάτω.

Ο «ένοχος» βρέθηκε στο αρχείο [`frontend/src/index.css`](file:///home/gm/projects/epg-fullstack-ready/frontend/src/index.css):
```css
html, body, #root {
  height: 100%;
  overflow: hidden; /* 👈 Απαγορεύει την κύλιση του παραθύρου! */
}
```
Αυτός ο κανόνας υπήρχε επίτηδες στο πρωτότυπο project, επειδή μια εφαρμογή EPG (όπως το Netflix ή ένας τηλεοπτικός οδηγός) είναι **Fixed Screen App**: 
Δεν σκρολάρει ολόκληρη η ιστοσελίδα, αλλά **το εσωτερικό πλέγμα (Grid container)** έχει δικές του ανεξάρτητες μπάρες οριζόντιας και κάθετης κύλισης. Αυτή ακριβώς τη δομή θα χτίσουμε στο Κεφάλαιο 5!

---

### 4.14 Ολοκληρωμένος Κώδικας του `EPGCalendar_2.jsx`

Ιδού ο πλήρης, καθαρός κώδικας που χτίσαμε γραμμή-γραμμή:

```jsx
import React, { useState, useEffect } from 'react';

export default function EPGCalendar_2({ apiBase = 'http://localhost:4000' }) {
    // 1. Η Μνήμη μας (State)
    const [date, setDate] = useState('2026-10-11');
    const [channels, setChannels] = useState([]);
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 2. Συνάρτηση αλλαγής ημέρας
    function changeDay(offset) {
        const currentDate = new Date(date);
        currentDate.setDate(currentDate.getDate() + offset);
        setDate(currentDate.toISOString().split('T')[0]);
    }

    // 3. Το Τηλέφωνο στο Backend (Side Effect)
    useEffect(() => {
        setIsLoading(true);
        console.log(`📡 Καλώ το Backend για την ημερομηνία: ${date}`);
        
        fetch(`${apiBase}/api/epg?date=${date}`)
            .then(res => res.json())
            .then(data => {
                setChannels(data.channels || []);
                setEvents(data.events || []);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Σφάλμα σύνδεσης με το Backend:", err);
                setIsLoading(false);
            });
    }, [date]); // 👈 Παρακολουθεί αποκλειστικά το State date!

    // 4. Υπολογιζόμενη Τιμή (Derived State)
    const formattedDate = new Intl.DateTimeFormat('el-GR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date(date));

    // 5. Η Οθόνη (Declarative UI / JSX)
    return (
        <div className="p-6 text-white bg-gray-900 min-h-screen">
            {/* Header Ημερολογίου */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => changeDay(-1)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xl font-bold">
                    &lt;
                </button>

                <span className="text-xl font-semibold bg-gray-800 px-6 py-2 rounded capitalize">
                    {formattedDate}
                </span>

                <button
                    onClick={() => changeDay(1)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-xl font-bold">
                    &gt;
                </button>
            </div>

            {/* Πληροφορίες & Λίστα Προγράμματος */}
            {isLoading ? (
                <div className="bg-gray-800 p-6 rounded-lg text-center text-yellow-400 font-bold">
                    ⏳ Το πρόγραμμα φορτώνει...
                </div>
            ) : (
                <div className="bg-gray-800 p-4 rounded-lg">
                    <p className="text-green-400 font-bold mb-2">
                        ✅ Συνδέθηκε με το Backend!
                    </p>
                    <p>📺 Κανάλια που βρέθηκαν: <span className="font-bold">{channels.length}</span></p>
                    <p>🎬 Συνολικές εκπομπές ημέρας: <span className="font-bold">{events.length}</span></p>

                    {/* Λίστα Καναλιών & Εκπομπών */}
                    <div className="flex flex-col gap-4 mt-6">
                        {channels.map(channel => {
                            const channelEvents = events.filter(e => e.channel === channel.id);

                            return (
                                <div key={channel.id} className="bg-gray-700/50 p-4 rounded-lg">
                                    <h3 className="text-lg font-bold text-yellow-400 mb-2">
                                        📺 {channel.name} ({channelEvents.length} εκπομπές)
                                    </h3>

                                    <div className="flex flex-col gap-1">
                                        {channelEvents.slice(0, 3).map(e => (
                                            <div key={e.id} className="text-sm text-gray-300 bg-gray-800 px-3 py-1.5 rounded">
                                                🕒 {e.start.slice(11, 16)} - {typeof e.title === 'object' ? e.title._ : e.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
```

