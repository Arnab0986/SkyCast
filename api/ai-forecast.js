export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ text: "Method not allowed" });
    }

    const { city, temp, code } = req.body || {};
    if (!city || temp === undefined || !code) {
      return res.status(200).json({
        text: "Weather data insufficient for AI forecast."
      });
    }

    const prompt = `
You are a professional meteorologist.
City: ${city}
Temperature: ${temp}°C
Condition: ${code}

Give a short, helpful weather forecast with practical advice.
`;

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4
      })
    });

    const d = await r.json();
    const text =
      d?.choices?.[0]?.message?.content ||
      "AI forecast unavailable at the moment.";

    res.status(200).json({ text });
  } catch (e) {
    res.status(200).json({
      text: "AI forecast unavailable offline."
    });
  }
}
