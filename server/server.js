require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const OpenAI = require('openai');
const multer = require('multer');
const pdf = require('pdf-parse');
const upload = multer({ storage: multer.memoryStorage() });
const { chromium } = require('playwright');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const tiktoken = require('tiktoken');
const mongoose = require('mongoose');
const Template = require('./models/Template');
const Post = require('./models/Post');
const User = require('./models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Debug-Log zum Überprüfen des API-Keys
console.log('API Key loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');

app.use(cors({
  origin: 'http://localhost:3000' // Erlaubt Anfragen vom Client
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = process.env.PORT || 5001;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Hole das Modell aus den Umgebungsvariablen oder nutze einen Fallback
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o';

// KI Provider Konfiguration
const PROVIDER = process.env.PROVIDER || 'openai';
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const googleModel = genAI.getGenerativeModel({
  model: process.env.GOOGLE_MODEL || 'gemini-1.5-pro',
  generationConfig: {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  }
});

// Konstanten für Token-Limits
const GPT4_TOKEN_LIMIT = process.env.GPT4_TOKEN_LIMIT || 120000;

// Provider-Auswahl basierend auf Token-Anzahl
async function selectProvider(totalTokens) {
  if (totalTokens > GPT4_TOKEN_LIMIT) {
    console.log(`Token count (${totalTokens}) exceeds GPT-4 limit, using Google Gemini`);
    return 'google';
  }
  console.log(`Token count (${totalTokens}) within GPT-4 limit, using OpenAI`);
  return 'openai';
}

// Funktion zur Token-Berechnung
async function countTokens(text) {
  const encoding = tiktoken.encoding_for_model("gpt-4");
  const tokens = encoding.encode(text);
  return tokens.length;
}

// Funktion für KI Anfragen
async function getAIResponse(systemPrompt, userContent) {
  const systemTokens = await countTokens(systemPrompt);
  const userTokens = await countTokens(userContent);
  const totalTokens = systemTokens + userTokens;
  
  console.log('Token counts:', {
    system: systemTokens,
    user: userTokens,
    total: totalTokens
  });

  // Dynamische Provider-Auswahl
  const provider = await selectProvider(totalTokens);

  if (provider === 'google') {
    try {
      console.log('Using Google Model:', process.env.GOOGLE_MODEL);
      
      const formattedInput = `Rolle und Aufgabe:
${systemPrompt}

Zu verarbeitende Informationen:
${userContent}

Bitte erstelle jetzt deinen Output basierend auf den obigen Anweisungen.`;

      const formattedTokens = await countTokens(formattedInput);
      console.log('Formatted input tokens for Google:', formattedTokens);

      const chatSession = googleModel.startChat();
      const result = await chatSession.sendMessage([{ text: formattedInput }]);
      return result.response.text();
    } catch (error) {
      console.error('Google AI Error:', error);
      throw error;
    }
  } else {
    console.log('Using OpenAI Model:', process.env.OPENAI_MODEL);
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4',
      messages: [
        {
          "role": "system",
          "content": systemPrompt
        },
        {
          "role": "user",
          "content": userContent
        }
      ]
    });
    return completion.choices[0].message.content;
  }
}

// Verbesserte Funktion zum Laden der Prompts
async function loadPrompt(type) {
  try {
    const content = await fs.readFile(path.join(__dirname, 'prompts.md'), 'utf8');
    
    // Debug-Log
    console.log('Available sections:', content.split('## ').map(s => s.split('\n')[0]));
    
    const sections = content.split('## ');
    const section = sections.find(s => s.trim().startsWith(type));
    
    if (!section) {
      console.error(`Prompt type "${type}" not found. Available types:`, 
        sections.map(s => s.split('\n')[0].trim()).filter(Boolean)
      );
      throw new Error(`Prompt type ${type} not found`);
    }
    
    return section.split('\n').slice(1).join('\n').trim();
  } catch (error) {
    console.error('Error loading prompt:', error);
    throw error;
  }
}

// Text Transformation Endpoint
app.post('/api/transform', async (req, res) => {
  try {
    const { text, type, additionalContent } = req.body;
    console.log('Transform request received:', {
      text,
      type,
      additionalContent
    });
    
    const systemPrompt = await loadPrompt(type);
    
    let userContent = `${text}\n\n`;
    let tokenCounts = {
      idea: await countTokens(userContent)
    };
    
    // Perplexity Content verarbeiten
    if (additionalContent?.perplexityContent) {
      console.log('Processing Perplexity content:', additionalContent.perplexityContent);
      
      if (additionalContent.perplexityContent.includes('perplexity.ai')) {
        try {
          const scrapeResponse = await fetch('http://localhost:5001/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: additionalContent.perplexityContent,
              type: 'perplexity'
            })
          });
          
          if (scrapeResponse.ok) {
            const scrapedData = await scrapeResponse.json();
            userContent += `Perplexity Inhalt:\n${scrapedData.content}\n\n`;
            tokenCounts.perplexity = await countTokens(scrapedData.content);
          }
        } catch (error) {
          console.error('Perplexity scraping error:', error);
        }
      } else {
        userContent += `Perplexity Inhalt:\n${additionalContent.perplexityContent}\n\n`;
        tokenCounts.perplexity = await countTokens(additionalContent.perplexityContent);
      }
    }
    
    // Wikipedia Content verarbeiten
    if (additionalContent?.wikiContent) {
      console.log('Processing Wiki content:', additionalContent.wikiContent);
      
      if (additionalContent.wikiContent.includes('wikipedia.org')) {
        try {
          const scrapeResponse = await fetch('http://localhost:5001/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: additionalContent.wikiContent,
              type: 'wikipedia'
            })
          });
          
          if (scrapeResponse.ok) {
            const scrapedData = await scrapeResponse.json();
            userContent += `Wikipedia Inhalt:\n${scrapedData.content}\n\n`;
            tokenCounts.wiki = await countTokens(scrapedData.content);
          }
        } catch (error) {
          console.error('Wikipedia scraping error:', error);
        }
      } else {
        userContent += `Wikipedia Inhalt:\n${additionalContent.wikiContent}\n\n`;
        tokenCounts.wiki = await countTokens(additionalContent.wikiContent);
      }
    }
    
    // PDF und Bild Content verarbeiten
    if (additionalContent?.pdfText) {
      userContent += `PDF Inhalt:\n${additionalContent.pdfText}\n\n`;
      tokenCounts.pdf = await countTokens(additionalContent.pdfText);
    }
    
    if (additionalContent?.imageDescription) {
      userContent += `Bild Beschreibung:\n${additionalContent.imageDescription}\n\n`;
      tokenCounts.image = await countTokens(additionalContent.imageDescription);
    }

    console.log('Token counts by source:', tokenCounts);
    
    const contentFlags = {
      hasPDF: !!additionalContent?.pdfText,
      hasPerplexity: !!additionalContent?.perplexityContent,
      hasWiki: !!additionalContent?.wikiContent,
      hasImage: !!additionalContent?.imageDescription
    };

    console.log('Final content includes:', contentFlags);
    
    const aiResponse = await getAIResponse(systemPrompt, userContent);
    res.json({ transformedText: aiResponse });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Error transforming text', details: error.message });
  }
});

// PDF Text Extraktion
app.post('/api/extract-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    const dataBuffer = req.file.buffer;
    const data = await pdf(dataBuffer);
    
    res.json({ text: data.text });
  } catch (error) {
    console.error('Error extracting PDF:', error);
    res.status(500).json({ error: 'PDF extraction failed' });
  }
});

// Website Scraping Endpoint
app.post('/api/scrape', async (req, res) => {
  let browser;
  try {
    const { url, type } = req.body;
    console.log('Starting scrape for:', { url, type });

    browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      ]
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      bypassCSP: true,
      ignoreHTTPSErrors: true
    });
    
    const page = await context.newPage();
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    console.log('Navigating to URL...');
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });

    // Für Perplexity: Warte auf Cloudflare
    if (type === 'perplexity') {
      await page.waitForFunction(() => {
        return !document.title.includes('Just a moment');
      }, { timeout: 30000 }).catch(e => console.log('Timeout waiting for Cloudflare'));
      await page.waitForTimeout(2000);
    }

    const content = await page.evaluate((pageType) => {
      console.log('Starting content extraction for type:', pageType);
      
      if (pageType === 'perplexity') {
        const mainContent = document.querySelector('div[class*="col-span-12"]');
        console.log('Perplexity main content found:', !!mainContent);
        
        if (mainContent) {
          const elementsToRemove = mainContent.querySelectorAll('button, [role="button"], nav');
          elementsToRemove.forEach(el => el.remove());
          return mainContent.innerText;
        }
        
        return document.body.innerText;
      } 
      else if (pageType === 'wikipedia') {
        const contentElement = document.querySelector('#mw-content-text');
        console.log('Wikipedia main content found:', !!contentElement);
        
        if (!contentElement) return '';

        const contentClone = contentElement.cloneNode(true);
        
        const selectorsToRemove = [
          '.reference',
          '.mw-editsection',
          '.navbox',
          '#toc',
          '.thumb',
          '.mw-empty-elt',
          '.mw-references-wrap',
          '.reference-group',
          '.noprint',
          '.mw-jump-link',
          '.mw-headline',
          'table',
          '.infobox',
          '.box-Expand_language'
        ];
        
        selectorsToRemove.forEach(selector => {
          const elements = contentClone.querySelectorAll(selector);
          console.log(`Removing ${elements.length} elements with selector: ${selector}`);
          elements.forEach(el => el.remove());
        });

        const paragraphs = Array.from(contentClone.querySelectorAll('p'))
          .map(p => p.innerText)
          .join('\n');

        return paragraphs;
      }
      return '';
    }, type);

    if (!content) {
      console.log('No content found, saving screenshot...');
      await page.screenshot({ 
        path: 'debug-screenshot.png',
        fullPage: true 
      });
      throw new Error('No content found');
    }

    console.log('Content found, length:', content.length);
    res.json({ content });

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ 
      error: 'Scraping failed',
      details: error.message 
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// Funktion zum Encodieren des Bildes
async function encodeImage(buffer) {
  return buffer.toString('base64');
}

// Neuer Endpoint für Bildanalyse
app.post('/api/analyze-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const base64Image = await encodeImage(req.file.buffer);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Beschreibe dieses Bild detailliert." },
            {
              type: "image_url",
              image_url: {
                url: `data:${req.file.mimetype};base64,${base64Image}`
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    res.json({ 
      description: response.choices[0].message.content 
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ 
      error: 'Image analysis failed',
      details: error.message 
    });
  }
});

// MongoDB Verbindung
mongoose.connect('mongodb://localhost:27017/social-editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware zur Überprüfung der Benutzerrolle
const checkUserRole = async (req, res, next) => {
  try {
    const userId = req.headers['user-id'];
    const user = await User.findOne({ firebaseUid: userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Middleware für Premium/Admin-only Routen
const requirePremiumOrAdmin = (req, res, next) => {
  if (req.userRole === 'basis') {
    return res.status(403).json({ error: 'Premium or Admin access required' });
  }
  next();
};

// Template Routes
app.get('/api/templates', async (req, res) => {
  const userId = req.headers['user-id'];
  try {
    const templates = await Template.find({ userId });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/templates/:id', async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/templates', async (req, res) => {
  const userId = req.headers['user-id'];
  try {
    const template = new Template({
      ...req.body,
      userId
    });
    await template.save();
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/templates/:id', async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/templates/:id', async (req, res) => {
  try {
    await Template.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk Import Endpoint
app.post('/api/templates/bulk', async (req, res) => {
  try {
    const templates = req.body;
    
    // Validiere jedes Template
    const validTemplates = templates.filter(template => 
      template.name && 
      template.verwendungszweck && 
      template.inhalt
    );

    // Füge alle validen Templates ein
    const result = await Template.insertMany(validTemplates);
    
    res.status(201).json({ 
      message: 'Templates erfolgreich importiert',
      count: result.length 
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ 
      error: 'Import fehlgeschlagen',
      details: error.message 
    });
  }
});

// Post Routes
app.get('/api/posts', async (req, res) => {
  const userId = req.headers['user-id'];
  try {
    const posts = await Post.find({ userId });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts', async (req, res) => {
  const userId = req.headers['user-id'];
  try {
    const post = new Post({
      ...req.body,
      userId
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/posts/:id', async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Einzelner Post Endpoint
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post nicht gefunden' });
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Post Endpoint
app.put('/api/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    console.log('Updating post:', id);

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { 
        content,
        updatedAt: new Date()
      },
      { new: true } // Returns the updated document
    );

    if (!updatedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }

    console.log('Post updated successfully');
    res.json(updatedPost);
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ 
      error: 'Failed to update post',
      details: error.message 
    });
  }
});

// PDF Upload Endpoint
app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file provided' });
    }

    console.log('Processing PDF:', req.file.originalname);

    const pdfData = await pdf(req.file.buffer);
    const text = pdfData.text;

    console.log('PDF text extracted, length:', text.length);

    res.json({ 
      content: text,
      pages: pdfData.numpages,
      fileName: req.file.originalname 
    });
  } catch (error) {
    console.error('PDF processing error:', error);
    res.status(500).json({ 
      error: 'PDF processing failed',
      details: error.message 
    });
  }
});

// Bestehende User auf Admin setzen (einmalig ausführen)
app.post('/api/users/migrate', async (req, res) => {
  try {
    await User.updateMany({}, { role: 'admin' });
    res.json({ message: 'All existing users updated to admin role' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User erstellen
app.post('/api/users', async (req, res) => {
  try {
    const { email, firebaseUid, role } = req.body;
    const user = new User({
      email,
      firebaseUid,
      role: role || 'basis'
    });
    await user.save();
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Rolle abrufen
app.get('/api/users/role', async (req, res) => {
  try {
    const userId = req.headers['user-id'];
    
    if (!userId) {
      return res.status(400).json({ error: 'No user ID provided' });
    }

    const user = await User.findOne({ firebaseUid: userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ role: user.role });
  } catch (error) {
    console.error('Error fetching user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Geschützte Routen
app.use('/api/templates', checkUserRole, requirePremiumOrAdmin);
app.post('/api/generate-post', checkUserRole, requirePremiumOrAdmin);
app.post('/api/upload-pdf', checkUserRole, requirePremiumOrAdmin);

// Debug Route zum Anzeigen aller User
app.get('/api/users/all', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route zum Synchronisieren eines Users
app.post('/api/users/sync', async (req, res) => {
  try {
    const { email, firebaseUid } = req.body;
    
    // Prüfe ob User bereits existiert
    let user = await User.findOne({ firebaseUid });
    
    if (!user) {
      // Erstelle neuen User mit Admin-Rolle
      user = new User({
        email,
        firebaseUid,
        role: 'admin',
        verified: true
      });
      await user.save();
      console.log('Created new user:', user);
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route zum Löschen eines Users aus der DB
app.delete('/api/users/:firebaseUid', async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const result = await User.deleteOne({ firebaseUid });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route zum Aufräumen nicht mehr existierender Firebase-User
app.post('/api/users/cleanup', async (req, res) => {
  try {
    const { firebaseUids } = req.body; // Array aktiver Firebase UIDs
    
    const result = await User.deleteMany({
      firebaseUid: { $nin: firebaseUids }
    });
    
    res.json({ 
      message: 'Cleanup completed', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error during cleanup:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { userId } = req.body;
    
    console.log('Creating checkout session with:', {
      priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
      mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'TEST' : 'LIVE'
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PREMIUM_PRICE_ID,
        quantity: 1
      }],
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/editor`,
      client_reference_id: userId,
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe Error:', error);
    res.status(500).json({ error: error.message });
  }
});
