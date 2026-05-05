const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "tsarakely_verify_2024";

const rules = [
  {
    keywords: ["prix", "cout", "combien", "tarif", "cher"],
    response: `Bonjour ! 🌸 Voici nos prix :\n\n• Cache tétons Rond — 6 000 Ar\n• Cache tétons Pétale de fleurs — 6 000 Ar\n\nTous nos produits sont réutilisables et très discrets 💕\nVoulez-vous voir nos modèles ?`
  },
  {
    keywords: ["modele", "collection", "produit", "choix", "type", "couleur"],
    response: `Nous avons 2 modèles disponibles 🌸\n\n⭕ Rond — discret, idéal sous toutes vos tenues\n🌺 Pétale de fleurs — élégant et féminin\n\nLes deux sont en silicone réutilisable.\nEnvoyez-nous un message pour voir les photos ! 📸`
  },
  {
    keywords: ["commander", "acheter", "commande", "vouloir"],
    response: `Pour passer votre commande 😊\n\n1️⃣ Choisissez votre modèle\n2️⃣ Envoyez-nous un message\n3️⃣ Confirmez quantité et adresse\n4️⃣ Effectuez le paiement\n5️⃣ Recevez votre colis ! 🎁`
  },
  {
    keywords: ["livraison", "expedition", "livrer", "envoyer", "recevoir"],
    response: `🚚 Livraison disponible à Antananarivo !\n\nChoisissez votre zone en répondant :\n👉 1 — Zone Ville (3 000 Ar)\n👉 2 — Zone Périphérie (3 000 Ar)\n👉 3 — Zone Super-Périphérie (5 000 Ar)`
  },
  {
    keywords: ["zone ville", "choix 1", "option 1", "1"],
    response: `🏙️ Zone Ville — 3 000 Ar\n\nAnalamahitsy, Androhibe, Mahazo, Mandroseza Pont, Saropody Pont, Tanjombato Pont, Ampasika, Andranomena, Soavimasoandro\n\n📦 Livraison à domicile · Emballage discret 💕`
  },
  {
    keywords: ["zone peripherie", "peripherie", "choix 2", "option 2", "2"],
    response: `🌆 Zone Périphérie — 3 000 Ar\n\nAnkadikely Ilafy, Ambohimahitsy, Tanjombato Forello, Iavoloha, Anosizato, Itaosy, Talatamaty, Ivato Aéroport\n\n📦 Livraison à domicile · Emballage discret 💕`
  },
  {
    keywords: ["super peripherie", "choix 3", "option 3", "3"],
    response: `🌿 Zone Super-Périphérie — 5 000 Ar\n\nAnosy Avaratra, Namehana, Ambohitrinimanga, Lazaina, Ambohibe Ilafy, Ambohimangakely, Alasora, Ambohimanambola, Dorodosy, Soavina, Bevalala\n\n📦 Livraison à domicile · Emballage discret 💕`
  },
  {
    keywords: ["paiement", "payer", "mvola", "airtel", "orange"],
    response: `💳 Modes de paiement acceptés :\n\n📱 MVola\n📱 Airtel Money\n📱 Orange Money\n💵 En main propre (Antananarivo)\n\nPaiement demandé à la confirmation 🌸`
  },
  {
    keywords: ["taille", "dimension", "mesure"],
    response: `Nos cache tétons sont en taille standard 🌸\n\n📏 Diamètre : 6 cm\n\nLe silicone est souple et s'adapte à toutes les morphologies 💕`
  },
  {
    keywords: ["utiliser", "utilisation", "coller", "tenir"],
    response: `Comment utiliser vos cache tétons 🌸\n\n1. Nettoyez et séchez la peau\n2. Retirez le film protecteur\n3. Appliquez en centrant bien\n4. Appuyez doucement\n\n✨ Rincez à l'eau froide pour réutiliser`
  },
  {
    keywords: ["bonjour", "salut", "bonsoir", "hello", "hi", "hey"],
    response: `Bonjour et bienvenue chez Tsara Kely 🌸✨\n\nNous proposons des cache tétons discrets et élégants !\n\nÉcrivez :\n💰 prix\n👙 modèles\n🛒 commander\n🚚 livraison\n💳 paiement`
  },
  {
    keywords: ["merci", "parfait", "super", "genial", "ok"],
    response: `Avec plaisir ! 😊🌸 Bonne journée ! 💕`
  },
  {
    keywords: ["retour", "remboursement", "echange", "probleme"],
    response: `Votre satisfaction est notre priorité 🌸\n\nContactez-nous dans les 48h avec une photo du problème et nous trouverons une solution ensemble 💕`
  }
];

const defaultResponse = `Merci pour votre message ! 🌸\n\nÉcrivez l'un de ces mots :\n💰 prix\n👙 modèles\n🛒 commander\n🚚 livraison\n💳 paiement\n\nNotre équipe vous répondra très bientôt ! 💕`;

function findResponse(text) {
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ");
  for (const rule of rules) {
    if (rule.keywords.some(k => t.includes(k))) return rule.response;
  }
  return defaultResponse;
}

async function sendMessage(recipientId, text) {
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      { recipient: { id: recipientId }, message: { text } }
    );
  } catch (err) {
    console.error("Erreur:", err.response?.data || err.message);
  }
}

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post("/webhook", async (req, res) => {
  const body = req.body;
  if (body.object === "page") {
    for (const entry of body.entry) {
      const event = entry.messaging?.[0];
      if (!event) continue;
      const senderId = event.sender.id;
      if (event.message?.text) {
        const response = findResponse(event.message.text);
        await sendMessage(senderId, response);
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌸 Tsara Kely Bot démarré sur le port ${PORT}`));
