import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { imageData } = req.body;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              { "type": "text", "text": "What is the main object in the image? Be as simple as possible no a or an before the word just the answer of the object itself" },
              {
                "type": "image_url",
                "image_url": {
                  "url": imageData,  // Use the base64 image data or a URL
                  "detail": "low"
                },
              },
            ],
          }
        ],
        max_tokens: 10,
      });

      console.log(response);

      if (response && response.choices && response.choices.length > 0) {
        const result = response.choices[0].message.content;
        res.status(200).json({ result });
      } else {
        res.status(500).json({ error: "Unexpected API response format." });
      }

    } catch (error) {
      console.error("Error analyzing the image: ", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
