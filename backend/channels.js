// backend/channels.js
import express from 'express';
const router = express.Router();

// Προτεινόμενη λίστα Greek channels με το όνομα εμφάνισης και το api id
// (api = το id που χρησιμοποιεί το XMLTV ή που πιθανόν να εμφανίζεται στο parsed.events.channelId)
export const CHANNELS = [
  { name: "ΕΡΤ1", api: "ert1" },
  { name: "ΕΡΤ2", api: "ert2" },
  { name: "ΕΡΤ3", api: "ert3" },
  { name: "MEGA", api: "mega" },
  { name: "ANT1", api: "ant1" },
  { name: "STAR", api: "star" },
  { name: "OPEN", api: "open" },
  { name: "ALPHA", api: "alpha" },
  { name: "SKAI", api: "skai" },
  // { name: "ATTICA", api: "atticatv" },
  // { name: "ACTION24", api: "action24" },
  // { name: "VOULI", api: "vouli" },
  // { name: "NICKELODEON", api: "nickelodeon" }
];

// Επιστρέφει JSON με full list
router.get('/', (req, res) => {
  res.json({ channels: CHANNELS });
});

export default router;
