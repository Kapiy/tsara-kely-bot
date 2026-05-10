const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN || "tsarakely_verify_2024";

async function sendMessage(recipientId, text, quickReplies = null) {
  const message = { text };
  if (quickReplies) message.quick_replies = quickReplies;
  try {
    await axios.post(
      `https://graph.facebook.com/v18.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`,
      { recipient: { id: recipientId }, message }
    );
  } catch (err) {
    console.error("Erreur:", err.response?.data || err.message);
  }
}

const mainMenu = [
  { content_type: "text", title: "💰 Prix", payload: "PRIX" },
  { content_type: "text", title: "👙 Modèles", payload: "MODELES" },
  { content_type: "text", title: "🛒 Commander", payload: "COMMANDER" },
  { content_type: "text", title: "🚚 Livraison", payload: "LIVRAISON" },
  { content_type: "text", title: "💳 Paiement", payload: "PAIEMENT" }
];

const livraisonMenu = [
  { content_type: "text", title: "🏙️ Zone Ville", payload: "VILLE" },
  { content_type: "text", title: "🌆 Périphérie", payload: "PERIPHERIE" },
  { content_type: "text", title: "🌿 Super-Périphérie", payload: "SUPER" }
];

async function handleMessage(senderId, text) {
  const t = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, " ");

  if (t.includes("bonjour") || t.includes("salut") || t.includes("hello") || t.includes("bonsoir") || t.includes("hi")) {
    await sendMessage(senderId,
      `Bonjour et bienvenue chez Tsara Kely 🌸✨\n\nNous proposons des cache tétons discrets et élégants !\n\nComment puis-je vous aider ?`,
      mainMenu
    );
  } else if (t.includes("prix") || t.includes("cout") || t.includes("combien") || t.includes("tarif")) {
    await sendMessage(senderId,
      `Bonjour ! 🌸 Voici nos prix :\n\n• Cache tétons Rond — 7 000 Ar\n• Cache tétons Pétale de fleurs — 7 000 Ar\n\nTous réutilisables et très discrets 💕`,
      mainMenu
    );
  } else if (t.includes("modele") || t.includes("collection") || t.includes("produit")) {
    await sendMessage(senderId,
      `Nous avons 2 modèles 🌸\n\n⭕ Rond — discret, idéal sous toutes vos tenues\n🌺 Pétale de fleurs — élégant et féminin\n\nSilicone réutilisable, teintes chair et nude 💕`,
      mainMenu
    );
  } else if (t.includes("commander") || t.includes("acheter") || t.includes("commande")) {
    await sendMessage(senderId,
      `Pour commander 😊\n\n1️⃣ Choisissez votre modèle\n2️⃣ Envoyez-nous un message\n3️⃣ Confirmez quantité et adresse\n4️⃣ Effectuez le paiement\n5️⃣ Recevez votre colis ! 🎁`,
      mainMenu
    );
  } else if (t.includes("livraison") || t.includes("livrer") || t.includes("expedition")) {
    await sendMessage(senderId,
      `🚚 Livraison disponible à Antananarivo !\n\nChoisissez votre zone :`,
      livraisonMenu
    );
  } else if (t.includes("zone ville") || t.includes("ville")) {
    await sendMessage(senderId,
      `🏙️ Zone Ville — 3 000 Ar\n\nAnalamahitsy, Androhibe, Mahazo, Mandroseza Pont, Saropody Pont, Tanjombato Pont, Ampasika, Andranomena, Soavimasoandro\n\n📦 Livraison à domicile · Emballage discret 💕`,
      mainMenu
    );
  } else if (t.includes("super") || t.includes("super peripherie")) {
    await sendMessage(senderId,
      `🌿 Zone Super-Périphérie — 5 000 Ar\n\nAnosy Avaratra, Namehana, Ambohitrinimanga, Lazaina, Ambohibe Ilafy, Ambohimangakely, Alasora, Ambohimanambola, Dorodosy, Soavina, Bevalala\n\n📦 Livraison à domicile · Emballage discret 💕`,
      mainMenu
    );
  } else if (t.includes("peripherie")) {
    await sendMessage(senderId,
      `🌆 Zone Périphérie — 3 000 Ar\n\nAnkadikely Ilafy, Ambohimahitsy, Tanjombato Forello, Iavoloha, Anosizato, Itaosy, Talatamaty, Ivato Aéroport\n\n📦 Livraison à domicile · Emballage discret 💕`,
      mainMenu
    );
  } else if (t.includes("paiement") || t.includes("payer") || t.includes("mvola") || t.includes("airtel") || t.includes("orange")) {
    await sendMessage(senderId,
      `💳 Modes de paiement :\n\n📱 MVola\n📱 Airtel Money\n📱 Orange Money\n💵 En main propre (Antananarivo)\n\nPaiement à la confirmation 🌸`,
      mainMenu
    );
  } else if (t.includes("taille") || t.includes("dimension")) {
    await sendMessage(senderId,
      `Taille standard 🌸\n\n📏 Diamètre : 6 cm\n\nLe silicone s'adapte à toutes les morphologies 💕`,
      mainMenu
    );
  } else if (t.includes("merci") || t.includes("parfait") || t.includes("super") || t.includes("ok")) {
    await sendMessage(senderId, `Avec plaisir ! 😊🌸 Bonne journée ! 💕`, mainMenu);
  } else {
    await sendMessage(senderId,
      `Merci pour votre message ! 🌸\n\nComment puis-je vous aider ?`,
      mainMenu
    );
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
        await handleMessage(senderId, event.message.text);
      } else if (event.postback?.payload) {
        await handleMessage(senderId, event.postback.payload);
      }
    }
    res.status(200).send("EVENT_RECEIVED");
  } else {
    res.sendStatus(404);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🌸 Tsara Kely Bot démarré sur le port ${PORT}`));
