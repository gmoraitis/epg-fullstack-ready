# 📖 ΤΟ ΒΙΒΛΙΟ ΤΟΥ FULLSTACK ENGINEER
## 📘 ΚΕΦΑΛΑΙΟ 3: Ο "Σερβιτόρος" (Express.js REST API Server)

```text
===================================================================================
                                 ΣΥΝΟΨΗ ΚΕΦΑΛΑΙΟΥ
   • 3.1 Τι είναι ένας Web Server & Γιατί το app.listen() μπαίνει ΠΑΝΤΑ στο τέλος
   • 3.2 Η Ιστορία της Καθέτου (/) & Γιατί γεννήθηκε το Express.js
   • 3.3 Η Κόκκινη Κλωστή: Η Πλήρης Διαδρομή ενός Request (URL -> Query -> Cache -> Response)
   • 3.4 Πώς ορίζουμε τα Endpoints: Γιατί η Οθόνη υπαγορεύει το API
   • 3.5 Το Τείχος Προστασίας: CORS (Cross-Origin Resource Sharing)
   • 3.6 Η Ανατομία του Φίλτρου: Arrow Functions, startsWith & Short-Circuit (&&)
   • 3.7 Set vs Array: Γιατί το Hash Set κερδίζει σε ταχύτητα (O(1) vs O(N))
   • 3.8 Machine ID vs Human Name: Γιατί χρειαζόμαστε και τα δύο
   • 3.9 Αναζήτηση Ενός Στοιχείου (.find vs .filter) & Σφάλματα 404
   • 3.10 Διαχείριση Ports & Zombie Processes στο Linux (EADDRINUSE)
   • 3.11 Οδηγός Ονοματοδοσίας Μεταβλητών (camelCase, Nouns vs Verbs)
   • 3.12 Ολοκληρωμένος Κώδικας του server_2.js
   • 3.13 Πώς λειτουργεί το Git σε μια Ομάδα (Atomic Commits & Git Push)
===================================================================================
```

---

### 3.1 Τι είναι ένας Web Server & Γιατί το `app.listen()` μπαίνει ΠΑΝΤΑ στο τέλος;

Μέχρι τώρα, όλα τα scripts μας (`parser_2.js`, `test_fetch.js`) εκτελούσαν μια εργασία και τερμάτιζαν.
Ένας **Web Server** είναι ένα πρόγραμμα που **δεν κλείνει ποτέ**. Μένει σε έναν ατέρμονο βρόχο (loop) στη μνήμη, «ακούγοντας» σε μια συγκεκριμένη **Θύρα (Port)** (στο δικό μας παράδειγμα: **Port 4000**).

#### 🔌 Η Αναλογία του Καταστήματος:
Όταν γράφουμε:
```javascript
const app = express();
```
Δημιουργούμε το "κατάστημα".
1. Πρώτα στήνουμε τα ράφια και τα προϊόντα: `app.get('/api/epg', ...)`
2. Πρώτα εκπαιδεύουμε το προσωπικό και βάζουμε την ασφάλεια: `app.use(cors())`
3. Και **τελευταία εντολή στο αρχείο** είναι το άνοιγμα της πόρτας:
   ```javascript
   app.listen(PORT, () => {
       console.log(`Server is listening to http://localhost:${PORT}`);
   });
   ```
*(Αν βάζαμε το `app.listen()` στην αρχή, οι πελάτες θα έμπαιναν σε ένα άδειο μαγαζί πριν προλάβουμε να ορίσουμε τις διαδρομές!)*

---

### 3.2 Η Ιστορία της Καθέτου (`/`) & Γιατί γεννήθηκε το Express.js

#### 📁 Γιατί τα URLs μοιάζουν με φακέλους;
Τη δεκαετία του '90, το URL `https://mysite.com/api/hello` αντιστοιχούσε **κυριολεκτικά** σε έναν φάκελο `api/` στο σκληρό δίσκο του server και σε ένα αρχείο `hello.html`.

#### 💥 Το Χάος του Native Node.js:
Όταν πρωτοβγήκε το Node.js, για να φτιάξεις έναν server χωρίς εξωτερική βιβλιοθήκη, έπρεπε να γράψεις δεκάδες γραμμές κώδικα για να διαβάσεις χειροκίνητα streams, buffers, headers και query strings.

#### 💡 Η Λύση του Express:
Το Express κράτησε την παλιά οικεία μορφή με τις καθέτους `/`, αλλά αποσύνδεσε τα URLs από τον φυσικό δίσκο. 
Το Express λειτουργεί σαν **Τηλεφωνικό Κέντρο (Router)**:
* Αν ακούσει `/api/epg` $\to$ τρέχει τη συνάρτηση του προγράμματος.
* Αν ακούσει `/api/refresh` $\to$ τρέχει τη συνάρτηση του μάγειρα.

---

### 3.3 Η Κόκκινη Κλωστή: Η Πλήρης Διαδρομή ενός Request

Φαντάσου τον πίνακα διαλεύκανσης ενός μυστηρίου με κόκκινες κλωστές:

```text
[ΚΑΡΦΙΤΣΑ 1: Ο Χρήστης στον Browser]
Πατάει την ημερομηνία: 2026-10-08
Ο browser χτυπάει: http://localhost:4000/api/epg?date=2026-10-08
                                         │        │
                                         │        └─► Query Parameter
                                         └──────────► Endpoint Route
                                                    │
                                                    ▼
[ΚΑΡΦΙΤΣΑ 2: Το Express]
Διαβάζει το URL και απομονώνει την παράμετρο:
req.query = { date: "2026-10-08" }
                                                    │
                                                    ▼
[ΚΑΡΦΙΤΣΑ 3: Το Ψυγείο (Cache)]
Καλούμε loadCache() και διαβάζουμε το cache_2.json:
data.events (όλες οι εκπομπές)
data.channels (όλα τα κανάλια)
                                                    │
                                                    ▼
[ΚΑΡΦΙΤΣΑ 4: Το Φίλτρο (Κόσκινο)]
Κρατάμε μόνο όσες εκπομπές έχουν:
ev.start.startsWith("2026-10-08")
                                                    │
                                                    ▼
[ΚΑΡΦΙΤΣΑ 5: Το Πακέτο Επιστροφής]
res.json({ channels: ..., events: filteredEvents })
Στέλνει πίσω στον χρήστη μόνο τα 35KB που χρειάζεται!
```

---

### 3.4 Πώς ορίζουμε τα Endpoints: Γιατί η Οθόνη υπαγορεύει το API

Τα endpoints δεν επιλέγονται τυχαία. Τα υπαγορεύουν οι **ανάγκες της οθόνης (UI)**:

1. **Ανάγκη 1 (Ημερολόγιο):** Ο χρήστης θέλει να δει το πρόγραμμα μιας συγκεκριμένης ημέρας.  
   👉 `GET /api/epg?date=YYYY-MM-DD`
2. **Ανάγκη 2 (Λεπτομέρειες / Modal):** Ο χρήστης πατάει πάνω σε μια εκπομπή για να δει υπόθεση και συντελεστές.  
   👉 `GET /api/program/:id` (όπου `:id` είναι η δυναμική ταυτότητα της εκπομπής).
3. **Ανάγκη 3 (Ανανέωση):** Ο χρήστης πατάει το κουμπί Sync 🔄 για φρέσκα δεδομένα.  
   👉 `GET /api/refresh` (καλεί απευθείας τον μάγειρα `fetchAndCache()`).

---

### 3.5 Το Τείχος Προστασίας: CORS (Cross-Origin Resource Sharing)

* **Το Πρόβλημα:** Το Frontend (React) τρέχει στο port `5173`. Το Backend (Express) τρέχει στο port `4000`.  
  Οι browsers απαγορεύουν σε ένα site να διαβάσει δεδομένα από διαφορετικό port για λόγους ασφαλείας (**Same-Origin Policy**).
* **Η Λύση:** Προσθέτουμε το middleware `cors`:
  ```javascript
  import cors from 'cors';
  app.use(cors()); // Δίνει ρητή άδεια στους browsers να επικοινωνήσουν!
  ```

---

### 3.6 Η Ανατομία του Φίλτρου

Κοίταξε τη γραμμή:
```javascript
filteredEvents = data.events.filter(ev => ev.start && ev.start.startsWith(requestDate));
```

1. **`ev => ...` (Arrow function):** Το `.filter()` περνάει μία-μία τις εκπομπές και βαφτίζει την καθεμία `ev`.
2. **`ev.start.startsWith(requestDate)`:** Ελέγχει αν το κείμενο `"2026-10-08T14:30:00"` ξεκινάει με το `"2026-10-08"`.
3. **`ev.start &&` (Short-Circuit Guard):** Αν μία εκπομπή δεν έχει πεδίο `start`, το `ev.start` είναι `undefined`. Το σύμβολο `&&` σταματάει αμέσως και επιστρέφει `false`, προστατεύοντας τον server από κατάρρευση!

---

### 3.7 Set vs Array: Γιατί το Hash Set κερδίζει σε ταχύτητα

Όταν φιλτράρουμε κανάλια:
* Ένας απλός **Array** `['ert1', 'mega', ...]`: Για να ελέγξει αν υπάρχει ένα κανάλι, κάνει **γραμμική αναζήτηση** ($O(N)$), ελέγχοντας τα στοιχεία ένα-ένα. Για 34.000 εκπομπές $\times$ 9 κανάλια = 300.000+ συγκρίσεις!
* Ένα **`Set`** (Hash Table): Αποθηκεύει τα στοιχεία σε ευρετήριο μνήμης. Ο έλεγχος `allowedChannelIds.has(...)` γίνεται **ακαριαία σε 1 κύκλο επεξεργαστή ($O(1)$ χρόνο)**!

---

### 3.8 Machine ID vs Human Name

* **`id` (Machine-friendly):** Πεζά αγγλικά, χωρίς κενά (`ert1`, `mega`, `ant1`). Χρησιμοποιείται για συνδέσεις στη βάση και στα URLs.
* **`name` (Human-friendly):** Ελληνικά κεφαλαία, κενά, τόνοι (`ΕΡΤ1`, `MEGA`, `ΑΝΤ1`). Χρησιμοποιείται αποκλειστικά για προβολή στην οθόνη.

---

### 3.9 Αναζήτηση Ενός Στοιχείου (`.find()` vs `.filter()`) & Σφάλματα 404

* Το **`.filter()`** επιστρέφει πάντα **πίνακα (`[]`)** με όσα στοιχεία βρήκε.
* Το **`.find()`** σταματάει στο πρώτο στοιχείο και επιστρέφει **ένα μόνο αντικείμενο (`{}`)**.

Στο route `/api/program/:id`:
```javascript
const foundProgram = data.events.find(e => e.id === programId);

if (!foundProgram) {
    return res.status(404).json({ error: "Program not found" });
}

res.json(foundProgram);
```

---

### 3.10 Διαχείριση Ports & Zombie Processes στο Linux

Αν κλείσεις το τερματικό απότομα, η πόρτα 4000 μπορεί να μείνει δεσμευμένη από μια διαδικασία-φάντασμα:
`Error: listen EADDRINUSE: address already in use :::4000`

**Εντολή Απελευθέρωσης:**
```bash
fuser -k 4000/tcp
```
ή
```bash
npx kill-port 4000
```

---

### 3.11 Οδηγός Ονοματοδοσίας Μεταβλητών (Naming Conventions)

1. **Μορφή `camelCase`:** `cleanData`, `rawCacheText`, `cachedData`.
2. **Ουσιαστικά για Δεδομένα:** `events` (πίνακας), `channelMap` (λεξικό).
3. **Ρήματα για Συναρτήσεις:** `fetchAndCache()`, `loadCache()`, `parseXmltv()`.

---

### 3.12 Ολοκληρωμένος Κώδικας του `server_2.js`

```javascript
import express from 'express';
import cors from 'cors';
import { loadCache, fetchAndCache } from './test_fetch.js';

const app = express();
const PORT = 4000;

// Επιτρέπουμε αιτήματα από οποιονδήποτε browser (CORS)
app.use(cors());

// ROUTE 0: Health Check
app.get('/api/hello', (req, res) => {
    res.json({ message: "Hello George! Server is ON" });
});

// ROUTE 1: Πρόγραμμα Ημέρας (Φιλτραρισμένο)
app.get('/api/epg', async (req, res) => {
    const requestDate = req.query.date; // π.χ. "2026-10-08"
    const data = await loadCache();

    let filteredEvents = data.events;

    if (requestDate) {
        filteredEvents = data.events.filter(ev => ev.start && ev.start.startsWith(requestDate));
    }

    res.json({
        channels: data.channels,
        events: filteredEvents
    });
});

// ROUTE 2: Λεπτομέρειες Συγκεκριμένης Εκπομπής βάσει ID
app.get('/api/program/:id', async (req, res) => {
    const programId = req.params.id;
    const data = await loadCache();

    const foundProgram = data.events.find(e => e.id === programId);

    if (!foundProgram) {
        return res.status(404).json({ error: "Program not found" });
    }

    res.json(foundProgram);
});

// ROUTE 3: Χειροκίνητη Ανανέωση από το Internet (Μάγειρας)
app.get('/api/refresh', async (req, res) => {
    const data = await fetchAndCache();
    res.json({
        status: "ok",
        message: "Το πρόγραμμα ανανεώθηκε!",
        totalEvents: data.events.length
    });
});

// ΤΕΛΕΥΤΑΙΑ ΓΡΑΜΜΗ: Ανοίγουμε την πόρτα του καταστήματος!
app.listen(PORT, () => {
    console.log(`Server is listening to http://localhost:${PORT}`);
});
```

---

### 3.13 Πώς λειτουργεί το Git σε μια Ομάδα (Atomic Commits & Git Push)

#### ❓ Πώς λειτουργεί το `git push` όταν έχουμε πολλά τοπικά commits;
Όταν κάνεις 2, 3 ή 4 commits τοπικά:
* Κάθε commit κρατάει το **δικό του ξεχωριστό μήνυμα, τον δικό του δημιουργό και τη δική του ώρα**.
* Όταν τρέχεις `git push origin main`, το Git **δεν συγχωνεύει τα μηνύματα**. Στέλνει ολόκληρη την αλυσίδα των commits στο GitHub αυτούσια!
* Στο GitHub θα δεις 4 ξεχωριστές γραμμές, μία για κάθε commit!

#### 🤝 Πώς δουλεύουν οι Επαγγελματικές Ομάδες:
1. **Ατομικά Commits (Atomic Commits):** Κάνουμε commit τοπικά για κάθε μικρό feature που ολοκληρώνεται.
2. **Push:** Στο τέλος της ημέρας ή της ενότητας, σπρώχνουμε όλα τα commits μαζεμένα με ένα `git push`.
3. **Pull Requests (PR):** Στις ομάδες, ανοίγουμε ένα PR για να ελέγξουν οι συνάδελφοι τα commits πριν ενσωματωθούν στο κύριο πρόγραμμα.

#### 🗜️ Το Δίλημμα: Squash vs Merge (Συγχώνευση Commits)
Σε μια ομάδα συχνά προκύπτει το ερώτημα: *«Θέλουμε να φαίνονται 20 μικρά commits ή 1 ενιαίο για όλο το feature;»*
* **Σχολή Α (Χρονολογικό Ιστορικό):** Κάθε commit παραμένει ανεξάρτητο. Δείχνει ακριβώς τη βήμα-προς-βήμα σκέψη του developer.
* **Σχολή Β (Squash & Merge):** Το GitHub διαθέτει τη λειτουργία "Squash and Merge". Παίρνει αυτόματα όλα τα μικρά commits ενός Pull Request και τα συμπιέζει σε ΕΝΑ ενιαίο, πεντακάθαρο commit στο main branch, κρατώντας το ιστορικό της εταιρείας απόλυτα τακτοποιημένο χωρίς περιττά ενδιάμεσα προσχέδια!


---

### 3.14 Σωρευτικές Ασκήσεις Κατανόησης (The Hunter Method - Κεφάλαια 1, 2 & 3)

#### 📝 Άσκηση 3.1: Η Σύνδεση των 3 Κεφαλαίων (Query Filtering & Parsing)
* **Ερώτηση:** Ένας χρήστης καλεί το URL:
  `http://localhost:4000/api/epg?date=2026-10-11`
  Μέσα στο Express, φιλτράρουμε τις εκπομπές με:
  `events.filter(e => e.start.startsWith(queryDate))`
  Ποια γραμμή κώδικα από το **Κεφάλαιο 1** (`parser_2.js`) έκανε δυνατή αυτή τη σύγκριση με `.startsWith()`;
  * **Α)** Η εντολή `parseXmltv(xmlString)`
  * **Β)** Η εντολή `fixedDate()` που μετέτρεψε το `"20261011..."` σε ISO String (`"2026-10-11T..."`)
  * **Γ)** Το `xml2js.parseStringPromise()`
  * **Δ)** Η εντολή `app.use(cors())`

---

#### 📝 Άσκηση 3.2: Παγίδες CORS & Network Security (Browser Sandbox)
* **Σενάριο:** Το frontend τρέχει στο `http://localhost:5173` και το Express τρέχει στο `http://localhost:4000`. Ένας developer ξεχνάει να γράψει τη γραμμή `app.use(cors())`.
* **Ερώτηση:** 
  1. Αν ανοίξεις το URL `http://localhost:4000/api/epg` απευθείας σε μια νέα καρτέλα του browser, θα δεις τα δεδομένα; (Ναι ή Όχι;)
  2. Αν το καλέσει το Frontend με `fetch()`, τι θα συμβεί και γιατί ο browser μπλοκάρει τη σύνδεση;

---

#### 📝 Άσκηση 3.3: REST Routing & Διαφορά Query Params vs Route Params
* **Ερώτηση:** Εξήγησε τη διαφορά ανάμεσα σε:
  * `GET /api/epg?date=2026-10-11` (Query Parameter)
  * `GET /api/program/:id` (Route Parameter)
  Γιατί για το φιλτράρισμα πολλών εκπομπών επιλέξαμε Query Parameter, ενώ για την αναζήτηση μιας μοναδικής εκπομπής επιλέξαμε Route Parameter;

---

#### 📝 Άσκηση 3.4: Έλεγχος Σφαλμάτων 404 & `.find()` vs `.filter()`
* **Σενάριο:** Ένας χρήστης ζητάει μια εκπομπή με λάθος ID: `GET /api/program/invalid_id`.
* **Ερώτηση:** 
  1. Τι επιστρέφει η μέθοδος `events.find(...)` όταν δεν βρει κανένα στοιχείο; (`null`, `undefined` ή άδειο πίνακα `[]`;)
  2. Γιατί είναι σημαντικό να επιστρέψουμε κωδικό κατάστασης `res.status(404)` αντί να επιστρέψουμε ένα άδειο αντικείμενο με κωδικό 200 OK;

---

```text
===================================================================================
                       🎉 ΤΕΛΟΣ ΚΕΦΑΛΑΙΟΥ 3: ΑΠΟΣΤΟΛΗ ΕΞΕΤΕΛΕΣΘΗ!
===================================================================================
```


